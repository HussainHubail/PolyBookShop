import prisma from '../config/database';
import { logger, LogAction } from '../utils/logger';
import { notificationService } from './notification.service';

class HoldService {
  /**
   * Place a hold on a member's account
   */
  async placeHold(
    memberId: number,
    reason: string,
    placedByAdminId: number,
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

    // Create the hold
    const hold = await prisma.hold.create({
      data: {
        memberId,
        loanId: loanId || null,
        reason,
        placedBy: placedByAdminId,
        status: 'active',
        notes: notes || null,
      },
    });

    // Send notification to member
    await notificationService.notifyHoldPlaced(memberId, hold.id, reason);

    // Notify all admins about the hold
    try {
      const { adminNotificationService } = await import('./admin-notification.service');
      await adminNotificationService.notifyHoldPlaced(
        member.user.username,
        member.user.loginId,
        hold.id,
        reason
      );
    } catch (adminNotifError) {
      await logger.error(LogAction.CREATE_NOTIFICATION, {
        error: (adminNotifError as Error).message,
        holdId: hold.id,
        type: 'admin_hold_notification',
      });
    }

    await logger.info(LogAction.PLACE_HOLD, {
      holdId: hold.id,
      memberId,
      reason,
      loanId,
    }, placedByAdminId);

    return hold;
  }

  /**
   * Remove a hold from a member's account
   */
  async removeHold(holdId: number, removedByAdminId: number, notes?: string) {
    const hold = await prisma.hold.findUnique({
      where: { id: holdId },
    });

    if (!hold) {
      throw new Error('Hold not found');
    }

    if (hold.status !== 'active') {
      throw new Error('Hold is not active');
    }

    // Update the hold
    const updatedHold = await prisma.hold.update({
      where: { id: holdId },
      data: {
        status: 'removed',
        removedAt: new Date(),
        removedBy: removedByAdminId,
        notes: notes ? `${hold.notes || ''}\n${notes}` : hold.notes,
      },
    });

    // Send notification to member
    await notificationService.notifyHoldRemoved(hold.memberId, holdId);

    await logger.info(LogAction.REMOVE_HOLD, {
      holdId,
      memberId: hold.memberId,
    }, removedByAdminId);

    return updatedHold;
  }

  /**
   * Get active holds for a member
   */
  async getMemberHolds(memberId: number, activeOnly: boolean = true) {
    const where: any = { memberId };
    if (activeOnly) {
      where.status = 'active';
    }

    const holds = await prisma.hold.findMany({
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
      orderBy: { placedAt: 'desc' },
    });

    return holds;
  }

  /**
   * Get active hold count for a member
   */
  async getActiveHoldCount(memberId: number): Promise<number> {
    const count = await prisma.hold.count({
      where: {
        memberId,
        status: 'active',
      },
    });

    return count;
  }

  /**
   * Check if member has active holds (for borrowing restriction)
   */
  async hasActiveHolds(memberId: number): Promise<boolean> {
    const count = await this.getActiveHoldCount(memberId);
    return count > 0;
  }

  /**
   * Check if member has 3 or more holds (requires fine payment)
   */
  async hasThreeOrMoreHolds(memberId: number): Promise<boolean> {
    const count = await this.getActiveHoldCount(memberId);
    return count >= 3;
  }

  /**
   * Get all holds (Admin view)
   */
  async getAllHolds(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const holds = await prisma.hold.findMany({
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
      orderBy: { placedAt: 'desc' },
    });

    return holds;
  }

  /**
   * Auto-place hold for overdue books (called by scheduled job)
   * Grace period: 7 days after due date
   */
  async autoPlaceOverdueHolds() {
    const gracePeriodDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);

    // Find overdue loans beyond grace period
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'overdue',
        dueDatetime: {
          lt: cutoffDate,
        },
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

    const holdsPlaced = [];
    for (const loan of overdueLoans) {
      // Check if hold already exists for this loan
      const existingHold = await prisma.hold.findFirst({
        where: {
          loanId: loan.id,
          status: 'active',
        },
      });

      if (!existingHold) {
        const daysOverdue = Math.floor(
          (Date.now() - new Date(loan.dueDatetime).getTime()) / (1000 * 60 * 60 * 24)
        );

        const hold = await this.placeHold(
          loan.memberId,
          `Book "${loan.bookCopy.book.title}" overdue by ${daysOverdue} days`,
          1, // System admin ID
          loan.id,
          'Automatically placed by system'
        );

        holdsPlaced.push(hold);
      }
    }

    await logger.info(LogAction.PLACE_HOLD, {
      type: 'auto_overdue_holds',
      count: holdsPlaced.length,
      loanIds: overdueLoans.map((l) => l.id),
    }, 1);

    return holdsPlaced;
  }
}

export const holdService = new HoldService();
