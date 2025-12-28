// FILE: src/routes/book.routes.ts
// Book and BookCopy routes

import { Router } from 'express';
import { body, param } from 'express-validator';
import bookController from '../controllers/book.controller';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';
import { uploadPDF } from '../config/upload';

const router = Router();

// ===== BOOK ROUTES =====

/**
 * GET /api/books/categories
 * Get all unique categories (public)
 */
router.get('/books/categories', bookController.getCategories.bind(bookController));

/**
 * GET /api/books
 * Search and browse books (public)
 */
router.get('/books', optionalAuth, bookController.searchBooks.bind(bookController));

/**
 * GET /api/books/:id
 * Get book by ID (public)
 */
router.get(
  '/books/:id',
  [param('id').isInt(), validateRequest],
  optionalAuth,
  bookController.getBookById.bind(bookController)
);

/**
 * POST /api/books
 * Create book (Librarian only)
 */
router.post(
  '/books',
  (req, res, next) => {
    console.log('🎯 POST /books route hit', {
      hasAuthHeader: !!req.headers.authorization,
      authHeader: req.headers.authorization?.substring(0, 30) + '...'
    });
    next();
  },
  authenticate,
  requireRole('LIBRARIAN'),
  [
    body('title').isLength({ min: 1, max: 500 }).trim(),
    body('author').isLength({ min: 1, max: 255 }).trim(),
    body('isbn').isLength({ min: 1, max: 20 }).trim(),
    body('category').isLength({ min: 1, max: 100 }).trim(),
    body('publishedYear').optional().isInt({ min: 1000, max: 9999 }),
    body('publisher').optional().isLength({ max: 255 }).trim(),
    body('description').optional().isLength({ max: 5000 }).trim(),
    body('coverImageUrl').optional().isURL(),
    body('bookType').optional().isIn(['physical', 'online']),
    body('totalCopies').optional().isInt({ min: 0 }),
    body('availableCopies').optional().isInt({ min: 0 }),
    validateRequest,
  ],
  bookController.createBook.bind(bookController)
);

/**
 * PUT /api/books/:id
 * Update book (Librarian only)
 */
router.put(
  '/books/:id',
  authenticate,
  requireRole('LIBRARIAN'),
  [
    param('id').isInt(),
    body('title').optional().isLength({ min: 1, max: 500 }).trim(),
    body('author').optional().isLength({ min: 1, max: 255 }).trim(),
    body('isbn').optional().isLength({ min: 1, max: 20 }).trim(),
    body('category').optional().isLength({ min: 1, max: 100 }).trim(),
    body('publishedYear').optional().isInt({ min: 1000, max: 9999 }),
    body('publisher').optional().isLength({ max: 255 }).trim(),
    body('description').optional().isLength({ max: 5000 }).trim(),
    body('coverImageUrl').optional().isURL(),
    body('bookType').optional().isIn(['physical', 'online']),
    body('totalCopies').optional().isInt({ min: 0 }),
    body('availableCopies').optional().isInt({ min: 0 }),
    validateRequest,
  ],
  bookController.updateBook.bind(bookController)
);

/**
 * DELETE /api/books/:id
 * Delete book (Librarian only)
 */
router.delete(
  '/books/:id',
  authenticate,
  requireRole('LIBRARIAN'),
  [param('id').isInt(), validateRequest],
  bookController.deleteBook.bind(bookController)
);

// ===== BOOK COPY ROUTES =====

/**
 * POST /api/book-copies
 * Create book copy (Librarian only)
 */
router.post(
  '/book-copies',
  authenticate,
  requireRole('LIBRARIAN'),
  [
    body('bookId').isInt(),
    body('condition').optional().isIn(['new', 'good', 'fair', 'damaged', 'lost']),
    body('location').optional().isLength({ max: 100 }).trim(),
    validateRequest,
  ],
  bookController.createBookCopy.bind(bookController)
);

/**
 * PUT /api/book-copies/:id
 * Update book copy (Librarian only)
 */
router.put(
  '/book-copies/:id',
  authenticate,
  requireRole('LIBRARIAN'),
  [
    param('id').isInt(),
    body('condition').optional().isIn(['new', 'good', 'fair', 'damaged', 'lost']),
    body('status').optional().isIn(['available', 'on_loan', 'reserved', 'lost', 'maintenance']),
    body('location').optional().isLength({ max: 100 }).trim(),
    validateRequest,
  ],
  bookController.updateBookCopy.bind(bookController)
);

/**
 * DELETE /api/book-copies/:id
 * Delete book copy (Librarian only)
 */
router.delete(
  '/book-copies/:id',
  authenticate,
  requireRole('LIBRARIAN'),
  [param('id').isInt(), validateRequest],
  bookController.deleteBookCopy.bind(bookController)
);

/**
 * POST /api/books/:id/upload-pdf
 * Upload PDF for a book (Librarian only)
 */
router.post(
  '/books/:id/upload-pdf',
  authenticate,
  requireRole('LIBRARIAN'),
  uploadPDF.single('pdf'),
  bookController.uploadPDF.bind(bookController)
);

/**
 * GET /api/books/:id/download
 * Download PDF for online books (Authenticated users only)
 */
router.get(
  '/books/:id/download',
  authenticate,
  [param('id').isInt(), validateRequest],
  bookController.downloadPDF.bind(bookController)
);

export default router;
