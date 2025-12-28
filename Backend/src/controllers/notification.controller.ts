import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { holdService } from '../services/hold.service';
import { fineService } from '../services/fine.service';
import prisma from '../config/database';

export class NotificationController {
  /**
   * Get user's notifications
   * GET /api/notifications
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const unreadOnly = req.query.unreadOnly === 'true';

      const notifications = await notificationService.getUserNotifications(userId, unreadOnly);

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch notifications',
      });
    }
  }

  /**
   * Get single notification by ID
   * GET /api/notifications/:id
   */
  async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notificationId = parseInt(req.params.id);

      const notification = await notificationService.getNotificationById(notificationId, userId);

      if (!notification) {
        res.status(404).json({
          success: false,
          error: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch notification',
      });
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch unread count',
      });
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notificationId = parseInt(req.params.id);

      await notificationService.markAsRead(notificationId, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark notification as read',
      });
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/mark-all-read
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark all notifications as read',
      });
    }
  }

  /**
   * Admin: Send notification to member
   * POST /api/notifications/send
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const { memberId, title, message, priority } = req.body;

      if (!memberId || !title || !message) {
        res.status(400).json({
          success: false,
          error: 'memberId, title, and message are required',
        });
        return;
      }

      const notification = await notificationService.sendAdminNotification(
        memberId,
        title,
        message,
        priority || 'normal',
        adminId
      );

      res.status(201).json({
        success: true,
        notification,
        message: 'Notification sent successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to send notification',
      });
    }
  }
}

export class HoldController {
  /**
   * Get member's holds
   * GET /api/holds/my-holds
   */
  async getMyHolds(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Get member by userId
      const member = await prisma.member.findUnique({
        where: { userId },
      });

      if (!member) {
        res.status(404).json({
          success: false,
          error: 'Member not found',
        });
        return;
      }

      const activeOnly = req.query.activeOnly !== 'false';
      const holds = await holdService.getMemberHolds(member.id, activeOnly);

      res.status(200).json({
        success: true,
        holds,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch holds',
      });
    }
  }

  /**
   * Admin: Get all holds
   * GET /api/holds
   */
  async getAllHolds(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const holds = await holdService.getAllHolds(status);

      res.status(200).json({
        success: true,
        holds,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch holds',
      });
    }
  }

  /**
   * Admin: Get holds by member ID
   * GET /api/holds/member/:memberId
   */
  async getHoldsByMemberId(req: Request, res: Response): Promise<void> {
    try {
      const memberId = parseInt(req.params.memberId);
      const holds = await holdService.getMemberHolds(memberId, true); // Active only

      res.status(200).json({
        success: true,
        holds,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch member holds',
      });
    }
  }

  /**
   * Admin: Place hold on member
   * POST /api/holds
   */
  async placeHold(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const { memberId, reason, loanId, notes } = req.body;

      if (!memberId || !reason) {
        res.status(400).json({
          success: false,
          error: 'memberId and reason are required',
        });
        return;
      }

      const hold = await holdService.placeHold(
        memberId,
        reason,
        adminId,
        loanId,
        notes
      );

      res.status(201).json({
        success: true,
        hold,
        message: 'Hold placed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to place hold',
      });
    }
  }

  /**
   * Admin: Remove hold
   * DELETE /api/holds/:id
   */
  async removeHold(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const holdId = parseInt(req.params.id);
      const { notes } = req.body;

      const hold = await holdService.removeHold(holdId, adminId, notes);

      res.status(200).json({
        success: true,
        hold,
        message: 'Hold removed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to remove hold',
      });
    }
  }
}

export class FineController {
  /**
   * Get member's fines
   * GET /api/fines/my-fines
   */
  async getMyFines(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Get member by userId
      const member = await prisma.member.findUnique({
        where: { userId },
      });

      if (!member) {
        res.status(404).json({
          success: false,
          error: 'Member not found',
        });
        return;
      }

      const unpaidOnly = req.query.unpaidOnly === 'true';
      const fines = await fineService.getMemberFines(member.id, unpaidOnly);
      const totalUnpaid = await fineService.getMemberTotalUnpaid(member.id);

      res.status(200).json({
        success: true,
        fines,
        totalUnpaid,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch fines',
      });
    }
  }

  /**
   * Admin: Get all fines
   * GET /api/fines
   */
  async getAllFines(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const fines = await fineService.getAllFines(status);

      res.status(200).json({
        success: true,
        fines,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch fines',
      });
    }
  }

  /**
   * Admin: Charge fine
   * POST /api/fines
   */
  async chargeFine(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const { memberId, amount, reason, loanId, notes } = req.body;

      if (!memberId || !amount || !reason) {
        res.status(400).json({
          success: false,
          error: 'memberId, amount, and reason are required',
        });
        return;
      }

      const fine = await fineService.chargeFine(
        memberId,
        parseFloat(amount),
        reason,
        adminId,
        loanId,
        notes
      );

      res.status(201).json({
        success: true,
        fine,
        message: 'Fine charged successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to charge fine',
      });
    }
  }

  /**
   * Member: Pay fine
   * POST /api/fines/:id/pay
   */
  async payFine(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const fineId = parseInt(req.params.id);
      const { amount } = req.body;

      if (!amount) {
        res.status(400).json({
          success: false,
          error: 'amount is required',
        });
        return;
      }

      const fine = await fineService.payFine(fineId, parseFloat(amount), userId);

      res.status(200).json({
        success: true,
        fine,
        message: 'Payment processed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process payment',
      });
    }
  }

  /**
   * Admin: Waive fine
   * POST /api/fines/:id/waive
   */
  async waiveFine(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const fineId = parseInt(req.params.id);
      const { notes } = req.body;

      const fine = await fineService.waiveFine(fineId, adminId, notes);

      res.status(200).json({
        success: true,
        fine,
        message: 'Fine waived successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to waive fine',
      });
    }
  }
}

export const notificationController = new NotificationController();
export const holdController = new HoldController();
export const fineController = new FineController();
