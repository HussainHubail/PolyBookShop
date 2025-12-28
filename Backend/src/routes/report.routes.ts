// FILE: src/routes/report.routes.ts
// Report and analytics routes for admin

import { Router } from 'express';
import reportController from '../controllers/report.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/reports/analytics
 * Get comprehensive analytics data (Admin only)
 */
router.get('/analytics', authenticate, requireRole('ADMIN'), reportController.getAnalytics.bind(reportController));

export default router;
