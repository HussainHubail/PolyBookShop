// FILE: src/controllers/books.controller.ts
// Books controller for listing, searching, and viewing books

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BooksController {
  /**
   * GET /api/books
   * Get all books with optional search, category filter, and book type
   */
  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const { search, category, bookType, page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      // Search by title or author
      if (search && typeof search === 'string') {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Filter by category
      if (category && typeof category === 'string') {
        where.category = category;
      }

      // Filter by book type (physical/online)
      if (bookType && typeof bookType === 'string' && (bookType === 'physical' || bookType === 'online')) {
        where.bookType = bookType;
      }

      const [books, total] = await Promise.all([
        prisma.book.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { title: 'asc' },
        }),
        prisma.book.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          books,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books/categories
   * Get list of all unique book categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.book.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });

      const categoryNames = categories.map((c) => c.category);

      res.status(200).json({
        success: true,
        data: categoryNames,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books/:id
   * Get book details by ID
   */
  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bookId = parseInt(id);

      if (isNaN(bookId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid book ID',
        });
        return;
      }

      const book = await prisma.book.findUnique({
        where: { id: bookId },
        include: {
          bookCopies: {
            where: { status: 'available' },
            take: 5,
          },
        },
      });

      if (!book) {
        res.status(404).json({
          success: false,
          error: 'Book not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books/isbn/:isbn
   * Get book details by ISBN
   */
  async getBookByIsbn(req: Request, res: Response): Promise<void> {
    try {
      const { isbn } = req.params;

      const book = await prisma.book.findUnique({
        where: { isbn },
        include: {
          bookCopies: {
            where: { status: 'available' },
          },
        },
      });

      if (!book) {
        res.status(404).json({
          success: false,
          error: 'Book not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/books/:id/download
   * Download PDF for online books
   */
  async downloadPdf(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bookId = parseInt(id);

      if (isNaN(bookId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid book ID',
        });
        return;
      }

      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        res.status(404).json({
          success: false,
          error: 'Book not found',
        });
        return;
      }

      if (book.bookType !== 'online') {
        res.status(400).json({
          success: false,
          error: 'This book is not available for download. It is a physical book.',
        });
        return;
      }

      if (!book.pdfUrl) {
        res.status(404).json({
          success: false,
          error: 'PDF file not found for this book',
        });
        return;
      }

      // Increment download count
      await prisma.book.update({
        where: { id: bookId },
        data: { downloadCount: { increment: 1 } },
      });

      // Send PDF file
      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(process.cwd(), book.pdfUrl);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'PDF file not found on server',
        });
        return;
      }

      res.download(filePath, book.pdfFileName || `${book.title}.pdf`);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

export default new BooksController();
