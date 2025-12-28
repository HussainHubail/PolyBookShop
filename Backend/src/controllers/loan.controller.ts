// FILE: src/controllers/loan.controller.ts
// Loan controller with loan confirmation email

import { Request, Response } from 'express';
import loanService from '../services/loan.service';
import prisma from '../config/database';
import { holdService } from '../services/hold.service';

export class LoanController {
  /**
   * POST /api/loans/borrow
   * Member borrows a book themselves
   */
  async borrowBook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      // Get member from current user
      const member = await prisma.member.findUnique({
        where: { userId: req.user.userId },
      });

      if (!member) {
        res.status(404).json({
          success: false,
          error: 'Member profile not found',
        });
        return;
      }

      // Check if member has active holds
      const hasHolds = await holdService.hasActiveHolds(member.id);
      if (hasHolds) {
        res.status(403).json({
          success: false,
          error: 'Cannot borrow books. Your account has active holds. Please contact the library.',
        });
        return;
      }

      const { bookId } = req.body;

      // Find an available copy
      const availableCopy = await prisma.bookCopy.findFirst({
        where: {
          bookId: parseInt(bookId),
          status: 'available',
        },
      });

      if (!availableCopy) {
        res.status(400).json({
          success: false,
          error: 'No available copies of this book',
        });
        return;
      }

      const loan = await loanService.createLoan(
        {
          memberId: member.id,
          bookCopyId: availableCopy.id,
        },
        req.user.userId
      );

      res.status(201).json({
        success: true,
        loan,
        message: 'Book borrowed successfully. Confirmation email sent.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/loans
   * Create new loan (Librarian/Admin only)
   */
  async createLoan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const loan = await loanService.createLoan(req.body, req.user.userId);

      res.status(201).json({
        success: true,
        loan,
        message: 'Loan created successfully. Confirmation email sent to member.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/loans/:id/return
   * Return a book (Member can return their own, Librarian/Admin can return any)
   */
  async returnLoan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const loanId = parseInt(req.params.id);

      // If member, verify they own this loan
      if (req.user.accountType === 'MEMBER') {
        const loan = await prisma.loan.findUnique({
          where: { id: loanId },
          include: {
            member: {
              include: { user: true },
            },
          },
        });

        if (!loan || loan.member.userId !== req.user.userId) {
          res.status(403).json({
            success: false,
            error: 'You can only return your own loans',
          });
          return;
        }
      }

      const result = await loanService.returnLoan(loanId, req.user.userId);

      res.status(200).json({
        success: true,
        ...result,
        message: result.isOverdue 
          ? 'Book returned. Overdue fine has been created.' 
          : 'Book returned successfully.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/loans/:id/renew
   * Renew a loan (Member/Librarian/Admin)
   */
  async renewLoan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const loanId = parseInt(req.params.id);
      const loan = await loanService.renewLoan(loanId, req.user.userId);

      res.status(200).json({
        success: true,
        loan,
        message: 'Loan renewed successfully.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/loans/my-loans
   * Get current member's loans (Member only)
   */
  async getMyLoans(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      // Get member ID from user
      const member = await prisma.member.findUnique({
        where: { userId: req.user.userId },
      });

      if (!member) {
        res.status(404).json({
          success: false,
          error: 'Member profile not found',
        });
        return;
      }

      const { status } = req.query;
      const loans = await loanService.getMemberLoans(
        member.id,
        status as string | undefined
      );

      res.status(200).json({
        success: true,
        loans,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/loans
   * Get all loans with filters (Librarian/Admin only)
   */
  async getAllLoans(req: Request, res: Response): Promise<void> {
    try {
      const { status, memberId, page, limit } = req.query;

      const result = await loanService.getAllLoans({
        status: status as string,
        memberId: memberId ? parseInt(memberId as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

export default new LoanController();
