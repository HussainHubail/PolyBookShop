import { Request, Response } from 'express';
import prisma from '../config/database';

export class StatsController {
  /**
   * Get dashboard statistics
   * GET /api/stats/dashboard
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      // Get total books count
      const totalBooks = await prisma.book.count();

      // Get active members count
      const activeMembers = await prisma.member.count({
        where: {
          user: {
            isActive: true,
          },
        },
      });

      // Get active loans count (ongoing and overdue)
      const activeLoans = await prisma.loan.count({
        where: {
          status: {
            in: ['ongoing', 'overdue'],
          },
        },
      });

      // Get completed loans count
      const completedLoans = await prisma.loan.count({
        where: {
          status: 'returned',
        },
      });

      // Get total fines (unpaid)
      const totalUnpaidFines = await prisma.fine.aggregate({
        where: {
          status: {
            in: ['unpaid', 'partially_paid'],
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Get active holds count
      const activeHolds = await prisma.hold.count({
        where: {
          status: 'active',
        },
      });

      res.status(200).json({
        success: true,
        stats: {
          totalBooks,
          activeMembers,
          activeLoans,
          completedLoans,
          totalUnpaidFines: totalUnpaidFines._sum.amount || 0,
          activeHolds,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch dashboard statistics',
      });
    }
  }

  /**
   * Get member-specific statistics
   * GET /api/stats/member
   */
  async getMemberStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Get member
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

      // Get member's active loans
      const activeLoans = await prisma.loan.count({
        where: {
          memberId: member.id,
          status: {
            in: ['ongoing', 'overdue'],
          },
        },
      });

      // Get member's total borrowed books (all time)
      const totalBorrowed = await prisma.loan.count({
        where: {
          memberId: member.id,
        },
      });

      // Get member's unpaid fines
      const unpaidFines = await prisma.fine.aggregate({
        where: {
          memberId: member.id,
          status: {
            in: ['unpaid', 'partially_paid'],
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Get member's active holds
      const activeHolds = await prisma.hold.count({
        where: {
          memberId: member.id,
          status: 'active',
        },
      });

      res.status(200).json({
        success: true,
        stats: {
          activeLoans,
          totalBorrowed,
          unpaidFines: unpaidFines._sum.amount || 0,
          activeHolds,
          maxBorrowedBooks: member.maxBorrowedBooks,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch member statistics',
      });
    }
  }
}

export const statsController = new StatsController();
