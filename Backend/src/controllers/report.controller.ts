// FILE: src/controllers/report.controller.ts
// Report and analytics controller

import { Request, Response } from 'express';
import reportService from '../services/report.service';

export class ReportController {
  /**
   * GET /api/reports/analytics
   * Get comprehensive analytics data (Admin only)
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await reportService.getAnalytics();

      res.status(200).json({
        success: true,
        analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

export default new ReportController();
