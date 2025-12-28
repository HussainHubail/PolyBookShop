import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Get dashboard statistics (all users)
router.get('/stats/dashboard', authenticate, statsController.getDashboardStats);

// Get member-specific statistics
router.get('/stats/member', authenticate, statsController.getMemberStats);

export default router;
