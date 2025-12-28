import prisma from '../config/database';
import { logger, LogAction } from '../utils/logger';
import { notificationService } from './notification.service';
import { holdService } from './hold.service';
import { Decimal } from '@prisma/client/runtime/library';

class FineService {
  /**
   * Charge a fine to a member
   */
  async chargeFine(
    memberId: number,
    amount: number,
    reason: string,
    chargedByAdminId: number,
    loanId?: number,
    notes?: string
  ) {
    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Create the fine
    const fine = await prisma.fine.create({
      data: {
        memberId,
        loanId: loanId || null,
        amount: new Decimal(amount),
        currency: 'USD',
        reason,
        chargedBy: chargedByAdminId,
        status: 'unpaid',
        notes: notes || null,
      },
    });

    // Send notification to member
    await notificationService.notifyFineCharged(memberId, fine.id, amount, reason);

    // Notify all admins about the fine
    try {
      const { adminNotificationService } = await import('./admin-notification.service');
      await adminNotificationService.notifyFineCharged(
        member.user.username,
        member.user.loginId,
        fine.id,
        amount,
        reason,
        loanId
      );
    } catch (adminNotifError) {
      await logger.error(LogAction.CREATE_NOTIFICATION, {
        error: (adminNotifError as Error).message,
        fineId: fine.id,
        type: 'admin_fine_notification',
      });
    }

    await logger.info(LogAction.CHARGE_FINE, {
      fineId: fine.id,
      memberId,
      amount,
      reason,
      loanId,
    }, chargedByAdminId);

    return fine;
  }

  /**
   * Pay a fine
   */
  async payFine(fineId: number, paidAmount: number, paidByUserId: number) {
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!fine) {
      throw new Error('Fine not found');
    }

    if (fine.status === 'paid') {
      throw new Error('Fine is already paid');
    }

    const totalPaid = fine.paidAmount 
      ? parseFloat(fine.paidAmount.toString()) + paidAmount 
      : paidAmount;
    const totalDue = parseFloat(fine.amount.toString());

    let status: string;
    if (totalPaid >= totalDue) {
      status = 'paid';
    } else {
      status = 'partially_paid';
    }

    // Update the fine
    const updatedFine = await prisma.fine.update({
      where: { id: fineId },
      data: {
        paidAmount: new Decimal(totalPaid),
        paidAt: status === 'paid' ? new Date() : fine.paidAt,
        status,
      },
    });

    await logger.info(LogAction.PAY_FINE, {
      fineId,
      memberId: fine.memberId,
      paidAmount,
      totalPaid,
      status,
    }, paidByUserId);

    // Send notification for fine payment
    if (status === 'paid') {
      await notificationService.createNotification({
        userId: fine.member.userId,
        type: 'FINE_PAID',
        title: 'Fine Paid Successfully',
        message: `Your fine of $${fine.amount.toString()} has been paid in full. Thank you for your payment.`,
        priority: 'normal',
        payload: {
          fineId: fine.id,
          amount: parseFloat(fine.amount.toString()),
          reason: fine.reason,
        },
      });

      // Notify admins about fine payment
      try {
        const { adminNotificationService } = await import('./admin-notification.service');
        await adminNotificationService.notifyFinePaid(
          fine.member.user.username,
          fine.member.user.loginId,
          fine.member.id,
          fine.id,
          parseFloat(fine.amount.toString())
        );
      } catch (adminNotifError) {
        await logger.error(LogAction.CREATE_NOTIFICATION, {
          error: (adminNotifError as Error).message,
          fineId: fine.id,
          type: 'admin_fine_paid_notification',
        });
      }
    }

    // Check if member has 3+ holds and all fines paid, then remove holds
    if (status === 'paid') {
      const hasThreeHolds = await holdService.hasThreeOrMoreHolds(fine.memberId);
      if (hasThreeHolds) {
        const unpaidFines = await this.getMemberUnpaidFines(fine.memberId);
        if (unpaidFines.length === 0) {
          // All fines paid, remove all holds
          const activeHolds = await holdService.getMemberHolds(fine.memberId, true);
          for (const hold of activeHolds) {
            await holdService.removeHold(hold.id, paidByUserId, 'All fines paid');
          }
        }
      }
    }

    return updatedFine;
  }

  /**
   * Waive a fine (Admin only)
   */
  async waiveFine(fineId: number, waivedByAdminId: number, notes?: string) {
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
    });

    if (!fine) {
      throw new Error('Fine not found');
    }

    if (fine.status === 'waived') {
      throw new Error('Fine is already waived');
    }

    // Update the fine
    const updatedFine = await prisma.fine.update({
      where: { id: fineId },
      data: {
        status: 'waived',
        waivedAt: new Date(),
        waivedBy: waivedByAdminId,
        notes: notes ? `${fine.notes || ''}\n${notes}` : fine.notes,
      },
    });

    await logger.info(LogAction.WAIVE_FINE, {
      fineId,
      memberId: fine.memberId,
      amount: fine.amount,
    }, waivedByAdminId);

    // Check if member has 3+ holds and all fines paid/waived, then remove holds
    const hasThreeHolds = await holdService.hasThreeOrMoreHolds(fine.memberId);
    if (hasThreeHolds) {
      const unpaidFines = await this.getMemberUnpaidFines(fine.memberId);
      if (unpaidFines.length === 0) {
        // All fines paid/waived, remove all holds
        const activeHolds = await holdService.getMemberHolds(fine.memberId, true);
        for (const hold of activeHolds) {
          await holdService.removeHold(hold.id, waivedByAdminId, 'All fines resolved');
        }
      }
    }

    return updatedFine;
  }

  /**
   * Get member's fines
   */
  async getMemberFines(memberId: number, unpaidOnly: boolean = false) {
    const where: any = { memberId };
    if (unpaidOnly) {
      where.status = { in: ['unpaid', 'partially_paid'] };
    }

    const fines = await prisma.fine.findMany({
      where,
      include: {
        loan: {
          include: {
            bookCopy: {
              include: {
                book: true,
              },
            },
          },
        },
      },
      orderBy: { chargedAt: 'desc' },
    });

    return fines;
  }

  /**
   * Get member's unpaid fines
   */
  async getMemberUnpaidFines(memberId: number) {
    return this.getMemberFines(memberId, true);
  }

  /**
   * Get total unpaid amount for a member
   */
  async getMemberTotalUnpaid(memberId: number): Promise<number> {
    const unpaidFines = await this.getMemberUnpaidFines(memberId);
    
    const total = unpaidFines.reduce((sum, fine) => {
      const amount = parseFloat(fine.amount.toString());
      const paid = fine.paidAmount ? parseFloat(fine.paidAmount.toString()) : 0;
      return sum + (amount - paid);
    }, 0);

    return total;
  }

  /**
   * Get all fines (Admin view)
   */
  async getAllFines(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const fines = await prisma.fine.findMany({
      where,
      include: {
        member: {
          include: {
            user: true,
          },
        },
        loan: {
          include: {
            bookCopy: {
              include: {
                book: true,
              },
            },
          },
        },
      },
      orderBy: { chargedAt: 'desc' },
    });

    return fines;
  }

  /**
   * Calculate overdue fine amount
   * Rate: $0.50 per day overdue
   */
  calculateOverdueFine(daysOverdue: number): number {
    const ratePerDay = 0.50;
    return daysOverdue * ratePerDay;
  }

  /**
   * Auto-charge fines for overdue books
   */
  async autoChargeOverdueFines() {
    const now = new Date();

    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'overdue',
        returnDatetime: null,
      },
      include: {
        member: true,
        bookCopy: {
          include: {
            book: true,
          },
        },
      },
    });

    const finesCharged = [];
    for (const loan of overdueLoans) {
      // Check if fine already exists for this loan
      const existingFine = await prisma.fine.findFirst({
        where: {
          loanId: loan.id,
          status: { in: ['unpaid', 'partially_paid'] },
        },
      });

      // Calculate days overdue
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(loan.dueDatetime).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!existingFine && daysOverdue > 0) {
        // Charge new fine
        const amount = this.calculateOverdueFine(daysOverdue);
        const fine = await this.chargeFine(
          loan.memberId,
          amount,
          `Overdue fine for "${loan.bookCopy.book.title}" (${daysOverdue} days)`,
          1, // System admin ID
          loan.id,
          'Automatically charged by system'
        );
        finesCharged.push(fine);
      }
    }

    await logger.info(LogAction.CHARGE_FINE, {
      type: 'auto_overdue_fines',
      count: finesCharged.length,
      loanIds: overdueLoans.map((l) => l.id),
    }, 1);

    return finesCharged;
  }
}

export const fineService = new FineService();
