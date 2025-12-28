// FILE: src/controllers/book.controller.ts
// Book and BookCopy controller

import { Request, Response } from 'express';
import bookService from '../services/book.service';
import prisma from '../config/database';

export class BookController {
  /**
   * POST /api/books
   * Create new book (Librarian only)
   */
  async createBook(req: Request, res: Response): Promise<void> {
    try {
      console.log('📚 Create book request:', {
        hasUser: !!req.user,
        user: req.user,
        authHeader: req.headers.authorization ? 'Present' : 'Missing',
        body: req.body
      });

      if (!req.user) {
        console.log('❌ No user in request');
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const book = await bookService.createBook(req.body, req.user.userId);

      res.status(201).json({
        success: true,
        book,
      });
    } catch (error) {
      console.log('❌ Create book error:', error);
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * PUT /api/books/:id
   * Update book (Librarian only)
   */
  async updateBook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const bookId = parseInt(req.params.id);
      const book = await bookService.updateBook(bookId, req.body, req.user.userId);

      res.status(200).json({
        success: true,
        book,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * DELETE /api/books/:id
   * Delete book (Librarian only)
   */
  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const bookId = parseInt(req.params.id);
      const result = await bookService.deleteBook(bookId, req.user.userId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books/:id
   * Get book by ID (Public/Authenticated)
   */
  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.id);
      const book = await bookService.getBookById(bookId);

      if (!book) {
        res.status(404).json({
          success: false,
          error: 'Book not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books
   * Search and filter books (Public/Authenticated)
   */
  async searchBooks(req: Request, res: Response): Promise<void> {
    try {
      const { search, category, author, bookType, page, limit } = req.query;

      const result = await bookService.searchBooks({
        search: search as string,
        category: category as string,
        author: author as string,
        bookType: bookType as string,
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

  /**
   * POST /api/book-copies
   * Create book copy (Librarian only)
   */
  async createBookCopy(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const bookCopy = await bookService.createBookCopy(req.body, req.user.userId);

      res.status(201).json({
        success: true,
        bookCopy,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * PUT /api/book-copies/:id
   * Update book copy (Librarian only)
   */
  async updateBookCopy(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const copyId = parseInt(req.params.id);
      const bookCopy = await bookService.updateBookCopy(copyId, req.body, req.user.userId);

      res.status(200).json({
        success: true,
        bookCopy,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * DELETE /api/book-copies/:id
   * Delete book copy (Librarian only)
   */
  async deleteBookCopy(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const copyId = parseInt(req.params.id);
      const result = await bookService.deleteBookCopy(copyId, req.user.userId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/books/:id/upload-pdf
   * Upload PDF for a book (Librarian only)
   */
  async uploadPDF(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const bookId = parseInt(req.params.id);
      const pdfUrl = `/uploads/books/${req.file.filename}`;

      const book = await bookService.updateBook(
        bookId,
        { 
          pdfUrl,
          pdfFileName: req.file.originalname,
          pdfFileSize: req.file.size,
          bookType: 'online'
        } as any,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        book,
        message: 'PDF uploaded successfully. Book is now available as an online book.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books/:id/download
   * Download PDF for online books
   */
  async downloadPDF(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.id);
      const book = await bookService.getBookById(bookId);

      if (!book) {
        res.status(404).json({ success: false, error: 'Book not found' });
        return;
      }

      if (book.bookType !== 'online') {
        res.status(400).json({ 
          success: false, 
          error: 'This book is not available for download. It is a physical book available in the library.' 
        });
        return;
      }

      if (!book.pdfUrl) {
        res.status(404).json({ success: false, error: 'PDF file not found for this book' });
        return;
      }

      // Check if user is a member and if they have active holds
      if (req.user) {
        const member = await prisma.member.findUnique({
          where: { userId: req.user.userId },
          include: {
            holds: {
              where: { status: 'active' },
            },
          },
        });

        if (member && member.holds && member.holds.length > 0) {
          const holdReasons = member.holds.map(h => h.reason).join(', ');
          res.status(403).json({ 
            success: false, 
            error: `Cannot download books. Your account has active holds: ${holdReasons}` 
          });
          return;
        }
      }

      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(process.cwd(), book.pdfUrl);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ success: false, error: 'PDF file not found on server' });
        return;
      }

      // Increment download count
      await bookService.updateBook(
        bookId,
        { downloadCount: book.downloadCount + 1 } as any,
        req.user?.userId || 0
      );

      // Send PDF file
      res.download(filePath, book.pdfFileName || `${book.title}.pdf`);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books/categories
   * Get all unique book categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await bookService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

export default new BookController();
