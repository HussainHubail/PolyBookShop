import { Router } from 'express';
import { notificationController, holdController, fineController } from '../controllers/notification.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// ========================================
// NOTIFICATIONS
// ========================================

// Get user's notifications
router.get('/notifications', authenticate, notificationController.getNotifications);

// Get unread notification count
router.get('/notifications/unread-count', authenticate, notificationController.getUnreadCount);

// Get single notification by ID
router.get('/notifications/:id', authenticate, notificationController.getNotificationById);

// Mark all notifications as read
router.put('/notifications/mark-all-read', authenticate, notificationController.markAllAsRead);

// Mark specific notification as read
router.put('/notifications/:id/read', authenticate, notificationController.markAsRead);

// Admin: Send notification to member
router.post('/notifications/send', authenticate, isAdmin, notificationController.sendNotification);

// ========================================
// HOLDS
// ========================================

// Get my holds (member)
router.get('/holds/my-holds', authenticate, holdController.getMyHolds);

// Admin: Get all holds
router.get('/holds', authenticate, isAdmin, holdController.getAllHolds);

// Admin: Get holds by member ID
router.get('/holds/member/:memberId', authenticate, isAdmin, holdController.getHoldsByMemberId);

// Admin: Place hold on member
router.post('/holds', authenticate, isAdmin, holdController.placeHold);

// Admin: Remove hold
router.delete('/holds/:id', authenticate, isAdmin, holdController.removeHold);

// ========================================
// FINES
// ========================================

// Get my fines (member)
router.get('/fines/my-fines', authenticate, fineController.getMyFines);

// Admin: Get all fines
router.get('/fines', authenticate, isAdmin, fineController.getAllFines);

// Admin: Charge fine
router.post('/fines', authenticate, isAdmin, fineController.chargeFine);

// Member/Admin: Pay fine
router.post('/fines/:id/pay', authenticate, fineController.payFine);

// Admin: Waive fine
router.post('/fines/:id/waive', authenticate, isAdmin, fineController.waiveFine);

export default router;
