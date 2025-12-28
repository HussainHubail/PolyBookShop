import prisma from '../config/database';
import { logger, LogAction } from '../utils/logger';

export interface CreateNotificationData {
  userId: number;
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  payload?: any;
  channel?: 'email' | 'sms' | 'in_app';
}

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal',
        payload: data.payload ? JSON.stringify(data.payload) : null,
        channel: data.channel || 'in_app',
        status: 'sent',
      },
    });

    await logger.info(LogAction.CREATE_NOTIFICATION, {
      notificationId: notification.id,
      userId: data.userId,
      type: data.type,
    });

    return notification;
  }

  /**
   * Send due date reminder notifications (3 days before due)
   */
  async sendDueDateReminders() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const threeDaysStart = new Date(threeDaysFromNow);
    threeDaysStart.setHours(0, 0, 0, 0);

    // Find loans due in 3 days
    const upcomingLoans = await prisma.loan.findMany({
      where: {
        status: 'ongoing',
        dueDatetime: {
          gte: threeDaysStart,
          lte: threeDaysFromNow,
        },
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        bookCopy: {
          include: {
            book: true,
          },
        },
      },
    });

    const notifications = [];
    for (const loan of upcomingLoans) {
      // Check if notification already sent
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: loan.member.userId,
          type: 'DUE_REMINDER',
          payload: {
            contains: `"loanId":${loan.id}`,
          },
          sentAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (!existingNotification) {
        const dueDate = new Date(loan.dueDatetime).toLocaleDateString();
        const notification = await this.createNotification({
          userId: loan.member.userId,
          type: 'DUE_REMINDER',
          title: 'Book Due Soon',
          message: `Your borrowed book "${loan.bookCopy.book.title}" is due on ${dueDate}. Please return it on time to avoid fines.`,
          priority: 'normal',
          payload: {
            loanId: loan.id,
            bookId: loan.bookCopy.book.id,
            dueDate: loan.dueDatetime,
          },
        });
        notifications.push(notification);
      }
    }

    await logger.info(LogAction.SEND_DUE_REMINDERS, {
      count: notifications.length,
      loanIds: upcomingLoans.map((l) => l.id),
    });

    return notifications;
  }

  /**
   * Send overdue warnings
   */
  async sendOverdueWarnings() {
    const now = new Date();

    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'ongoing',
        dueDatetime: {
          lt: now,
        },
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        bookCopy: {
          include: {
            book: true,
          },
        },
      },
    });

    const notifications = [];
    const adminNotifications = [];
    
    for (const loan of overdueLoans) {
      // Update loan status to overdue
      await prisma.loan.update({
        where: { id: loan.id },
        data: { status: 'overdue' },
      });

      // Check if notification already sent today
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: loan.member.userId,
          type: 'OVERDUE_WARNING',
          payload: {
            contains: `"loanId":${loan.id}`,
          },
          sentAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (!existingNotification) {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(loan.dueDatetime).getTime()) / (1000 * 60 * 60 * 24)
        );

        const notification = await this.createNotification({
          userId: loan.member.userId,
          type: 'OVERDUE_WARNING',
          title: 'Overdue Book',
          message: `Your book "${loan.bookCopy.book.title}" is ${daysOverdue} day(s) overdue. Please return it immediately to avoid holds and fines.`,
          priority: 'high',
          payload: {
            loanId: loan.id,
            bookId: loan.bookCopy.book.id,
            daysOverdue,
          },
        });
        notifications.push(notification);

        // Prepare admin notification data
        adminNotifications.push({
          loanId: loan.id,
          memberName: loan.member.user.username,
          memberLoginId: loan.member.user.loginId,
          bookTitle: loan.bookCopy.book.title,
          daysOverdue,
        });
      }
    }

    // Notify all admins about overdue books
    if (adminNotifications.length > 0) {
      try {
        const { adminNotificationService } = await import('./admin-notification.service');
        await adminNotificationService.notifyOverdueBooks(adminNotifications);
      } catch (adminNotifError) {
        await logger.error(LogAction.CREATE_NOTIFICATION, {
          error: (adminNotifError as Error).message,
          type: 'admin_overdue_notifications',
        });
      }
    }

    await logger.info(LogAction.SEND_OVERDUE_WARNINGS, {
      count: notifications.length,
      loanIds: overdueLoans.map((l) => l.id),
    });

    return notifications;
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: number, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.readAt = null;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    return notifications;
  }

  /**
   * Get single notification by ID
   */
  async getNotificationById(notificationId: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return result;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: number) {
    const count = await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return count;
  }

  /**
   * Admin: Send custom notification to member
   */
  async sendAdminNotification(
    memberId: number,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    adminId: number
  ) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const notification = await this.createNotification({
      userId: member.userId,
      type: 'ADMIN_MESSAGE',
      title,
      message,
      priority,
      payload: {
        sentByAdminId: adminId,
      },
    });

    await logger.info(LogAction.ADMIN_SEND_NOTIFICATION, {
      notificationId: notification.id,
      memberId,
      adminId,
    }, adminId);

    return notification;
  }

  /**
   * Notify member when hold is placed
   */
  async notifyHoldPlaced(memberId: number, holdId: number, reason: string) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const notification = await this.createNotification({
      userId: member.userId,
      type: 'HOLD_PLACED',
      title: 'Account Hold Placed',
      message: `A hold has been placed on your account. Reason: ${reason}. Please contact the library to resolve this issue.`,
      priority: 'urgent',
      payload: {
        holdId,
        reason,
      },
    });

    return notification;
  }

  /**
   * Notify member when hold is removed
   */
  async notifyHoldRemoved(memberId: number, holdId: number) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const notification = await this.createNotification({
      userId: member.userId,
      type: 'HOLD_REMOVED',
      title: 'Account Hold Removed',
      message: 'A hold on your account has been removed. You can now borrow books again.',
      priority: 'normal',
      payload: {
        holdId,
      },
    });

    return notification;
  }

  /**
   * Notify member when fine is charged
   */
  async notifyFineCharged(memberId: number, fineId: number, amount: number, reason: string) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const notification = await this.createNotification({
      userId: member.userId,
      type: 'FINE_CHARGED',
      title: 'Fine Charged',
      message: `A fine of $${amount} has been charged to your account. Reason: ${reason}. Please pay to avoid account restrictions.`,
      priority: 'high',
      payload: {
        fineId,
        amount,
        reason,
      },
    });

    return notification;
  }
}

export const notificationService = new NotificationService();
