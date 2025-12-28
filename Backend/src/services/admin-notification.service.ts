import prisma from '../config/database';
import { notificationService } from './notification.service';

/**
 * Admin Notification Service
 * Handles notifications sent to all admins for important library events
 */
class AdminNotificationService {
  /**
   * Get all admin user IDs
   */
  private async getAllAdminUserIds(): Promise<number[]> {
    const admins = await prisma.user.findMany({
      where: {
        accountType: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    return admins.map((admin) => admin.id);
  }

  /**
   * Notify all admins when a member borrows a book
   */
  async notifyBookBorrowed(
    memberName: string,
    memberLoginId: string,
    bookTitle: string,
    bookAuthor: string,
    loanId: number,
    dueDate: Date
  ) {
    const adminIds = await this.getAllAdminUserIds();

    const notifications = [];
    for (const adminId of adminIds) {
      const notification = await notificationService.createNotification({
        userId: adminId,
        type: 'ADMIN_BOOK_BORROWED',
        title: 'New Book Borrowed',
        message: `${memberName} (${memberLoginId}) borrowed "${bookTitle}" by ${bookAuthor}. Due: ${dueDate.toLocaleDateString()}.`,
        priority: 'low',
        payload: {
          loanId,
          memberLoginId,
          memberName,
          bookTitle,
          bookAuthor,
          dueDate: dueDate.toISOString(),
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify all admins about overdue books
   */
  async notifyOverdueBooks(overdueLoans: Array<{
    loanId: number;
    memberName: string;
    memberLoginId: string;
    bookTitle: string;
    daysOverdue: number;
  }>) {
    const adminIds = await this.getAllAdminUserIds();

    const notifications = [];
    for (const adminId of adminIds) {
      for (const loan of overdueLoans) {
        const notification = await notificationService.createNotification({
          userId: adminId,
          type: 'ADMIN_BOOK_OVERDUE',
          title: 'Book Overdue Alert',
          message: `"${loan.bookTitle}" borrowed by ${loan.memberName} (${loan.memberLoginId}) is ${loan.daysOverdue} day(s) overdue.`,
          priority: 'normal',
          payload: {
            loanId: loan.loanId,
            memberLoginId: loan.memberLoginId,
            memberName: loan.memberName,
            bookTitle: loan.bookTitle,
            daysOverdue: loan.daysOverdue,
          },
        });
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Notify all admins when a fine is charged
   */
  async notifyFineCharged(
    memberName: string,
    memberLoginId: string,
    fineId: number,
    amount: number,
    reason: string,
    loanId?: number
  ) {
    const adminIds = await this.getAllAdminUserIds();

    const notifications = [];
    for (const adminId of adminIds) {
      const notification = await notificationService.createNotification({
        userId: adminId,
        type: 'ADMIN_FINE_CHARGED',
        title: 'Fine Charged',
        message: `Fine of $${amount.toFixed(2)} charged to ${memberName} (${memberLoginId}). Reason: ${reason}`,
        priority: 'low',
        payload: {
          fineId,
          memberLoginId,
          memberName,
          amount,
          reason,
          loanId,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify all admins when a fine is paid
   */
  async notifyFinePaid(
    memberName: string,
    memberLoginId: string,
    memberId: number,
    fineId: number,
    amount: number
  ) {
    const adminIds = await this.getAllAdminUserIds();

    const notifications = [];
    for (const adminId of adminIds) {
      const notification = await notificationService.createNotification({
        userId: adminId,
        type: 'ADMIN_FINE_PAID',
        title: 'Fine Paid',
        message: `${memberName} (${memberLoginId}) paid fine of $${amount.toFixed(2)}.`,
        priority: 'low',
        payload: {
          fineId,
          memberId,
          memberLoginId,
          memberName,
          amount,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify all admins when a hold is placed on a member
   */
  async notifyHoldPlaced(
    memberName: string,
    memberLoginId: string,
    holdId: number,
    reason: string
  ) {
    const adminIds = await this.getAllAdminUserIds();

    const notifications = [];
    for (const adminId of adminIds) {
      const notification = await notificationService.createNotification({
        userId: adminId,
        type: 'ADMIN_HOLD_PLACED',
        title: 'Account Hold Placed',
        message: `Hold placed on ${memberName} (${memberLoginId}). Reason: ${reason}`,
        priority: 'normal',
        payload: {
          holdId,
          memberLoginId,
          memberName,
          reason,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify all admins when a book is returned late
   */
  async notifyLateReturn(
    memberName: string,
    memberLoginId: string,
    bookTitle: string,
    loanId: number,
    daysOverdue: number,
    fineAmount?: number
  ) {
    const adminIds = await this.getAllAdminUserIds();

    const notifications = [];
    for (const adminId of adminIds) {
      const message = fineAmount
        ? `${memberName} (${memberLoginId}) returned "${bookTitle}" ${daysOverdue} day(s) late. Fine: $${fineAmount.toFixed(2)}`
        : `${memberName} (${memberLoginId}) returned "${bookTitle}" ${daysOverdue} day(s) late.`;

      const notification = await notificationService.createNotification({
        userId: adminId,
        type: 'ADMIN_LATE_RETURN',
        title: 'Late Book Return',
        message,
        priority: 'low',
        payload: {
          loanId,
          memberLoginId,
          memberName,
          bookTitle,
          daysOverdue,
          fineAmount,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Notify all admins when a book is returned on time
   */
  async notifyBookReturned(
    memberName: string,
    memberLoginId: string,
    bookTitle: string,
    loanId: number
  ) {
    const adminIds = await this.getAllAdminUserIds();

    const notifications = [];
    for (const adminId of adminIds) {
      const notification = await notificationService.createNotification({
        userId: adminId,
        type: 'ADMIN_BOOK_RETURNED',
        title: 'Book Returned',
        message: `${memberName} (${memberLoginId}) returned "${bookTitle}" successfully.`,
        priority: 'low',
        payload: {
          loanId,
          memberLoginId,
          memberName,
          bookTitle,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }
}

export const adminNotificationService = new AdminNotificationService();
