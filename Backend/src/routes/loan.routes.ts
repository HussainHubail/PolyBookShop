// FILE: src/routes/loan.routes.ts
// Loan routes

import { Router } from 'express';
import { body, param } from 'express-validator';
import loanController from '../controllers/loan.controller';
import { authenticate, isLibrarianOrAdmin, isMember } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';

const router = Router();

/**
 * POST /api/loans/borrow
 * Create new loan by member themselves (Member only)
 */
router.post(
  '/borrow',
  authenticate,
  isMember,
  [
    body('bookId').isInt(),
    validateRequest,
  ],
  loanController.borrowBook.bind(loanController)
);

/**
 * POST /api/loans
 * Create new loan (Librarian/Admin only - can assign to any member)
 */
router.post(
  '/',
  authenticate,
  isLibrarianOrAdmin,
  [
    body('memberId').isInt(),
    body('bookCopyId').isInt(),
    body('durationDays').optional().isInt({ min: 1, max: 90 }),
    validateRequest,
  ],
  loanController.createLoan.bind(loanController)
);

/**
 * POST /api/loans/:id/return
 * Return a book (Member can return their own, Librarian/Admin can return any)
 */
router.post(
  '/:id/return',
  authenticate,
  [param('id').isInt(), validateRequest],
  loanController.returnLoan.bind(loanController)
);

/**
 * POST /api/loans/:id/renew
 * Renew a loan (Member/Librarian/Admin)
 */
router.post(
  '/:id/renew',
  authenticate,
  [param('id').isInt(), validateRequest],
  loanController.renewLoan.bind(loanController)
);

/**
 * GET /api/loans/my-loans
 * Get current member's loans (Member only)
 */
router.get('/my-loans', authenticate, isMember, loanController.getMyLoans.bind(loanController));

/**
 * GET /api/loans
 * Get all loans (Librarian/Admin only)
 */
router.get('/', authenticate, isLibrarianOrAdmin, loanController.getAllLoans.bind(loanController));

export default router;
