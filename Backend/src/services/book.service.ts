// FILE: src/services/book.service.ts
// Book and BookCopy service with full CRUD and SYSTEM_LOG persistence

import prisma from '../config/database';
import { logger, LogAction } from '../utils/logger';
import { generateBookBarcode, generateRFIDTag } from '../utils/idGenerator';

interface CreateBookData {
  title: string;
  author: string;
  isbn: string;
  publishedYear?: number;
  category: string;
  publisher?: string;
  description?: string;
  coverImageUrl?: string;
  bookType?: string;
  totalCopies?: number;
  availableCopies?: number;
}

interface CreateBookCopyData {
  bookId: number;
  condition?: string;
  location?: string;
  notes?: string;
}

class BookService {
  /**
   * Create a new book
   * PERSISTENCE: Stores in BOOK table, logs to SYSTEM_LOG
   */
  async createBook(data: CreateBookData, userId: number) {
    // Check if ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn },
    });

    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }

    // Create book
    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        publishedYear: data.publishedYear,
        category: data.category,
        publisher: data.publisher,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        bookType: data.bookType || 'physical',
        totalCopies: data.totalCopies || 0,
        availableCopies: data.availableCopies || 0,
      },
    });

    // Log to SYSTEM_LOG
    await logger.info(LogAction.CREATE_BOOK, {
      bookId: book.id,
      title: book.title,
      isbn: book.isbn,
      createdBy: userId,
    }, userId);

    return book;
  }

  /**
   * Update book details
   * PERSISTENCE: Updates BOOK table, logs to SYSTEM_LOG
   */
  async updateBook(bookId: number, data: Partial<CreateBookData>, userId: number) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book) {
      throw new Error('Book not found');
    }

    // If ISBN is being changed, check for duplicates
    if (data.isbn && data.isbn !== book.isbn) {
      const existingBook = await prisma.book.findUnique({
        where: { isbn: data.isbn },
      });
      if (existingBook) {
        throw new Error('Another book with this ISBN already exists');
      }
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data,
    });

    await logger.info(LogAction.UPDATE_BOOK, {
      bookId,
      changes: data,
      updatedBy: userId,
    }, userId);

    return updatedBook;
  }

  /**
   * Delete book (soft delete by checking if copies exist)
   * PERSISTENCE: Deletes from BOOK table, logs to SYSTEM_LOG
   */
  async deleteBook(bookId: number, userId: number) {
    // Check if book has copies
    const copies = await prisma.bookCopy.findMany({
      where: { bookId },
    });

    if (copies.length > 0) {
      throw new Error('Cannot delete book with existing copies. Delete all copies first.');
    }

    await prisma.book.delete({
      where: { id: bookId },
    });

    await logger.info(LogAction.DELETE_BOOK, {
      bookId,
      deletedBy: userId,
    }, userId);

    return { message: 'Book deleted successfully' };
  }

  /**
   * Get book with copies
   */
  async getBookById(bookId: number) {
    return prisma.book.findUnique({
      where: { id: bookId },
      include: {
        bookCopies: true,
        reservations: {
          where: { status: 'active' },
          include: {
            member: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Search and filter books
   */
  async searchBooks(params: {
    search?: string;
    category?: string;
    author?: string;
    bookType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search across multiple fields
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { author: { contains: params.search, mode: 'insensitive' } },
        { isbn: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // Filter by category
    if (params.category) {
      where.category = params.category;
    }

    // Filter by author
    if (params.author) {
      where.author = { contains: params.author, mode: 'insensitive' };
    }

    // Filter by book type
    if (params.bookType) {
      where.bookType = params.bookType;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          bookCopies: {
            select: {
              id: true,
              status: true,
              condition: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    // Calculate available copies for each book
    const booksWithAvailability = books.map((book) => ({
      ...book,
      totalCopies: book.bookCopies.length,
      availableCopies: book.bookCopies.filter((copy) => copy.status === 'available').length,
    }));

    return {
      books: booksWithAvailability,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create book copy
   * PERSISTENCE: Stores in BOOK_COPY table, logs to SYSTEM_LOG
   */
  async createBookCopy(data: CreateBookCopyData, userId: number) {
    // Verify book exists
    const book = await prisma.book.findUnique({ where: { id: data.bookId } });
    if (!book) {
      throw new Error('Book not found');
    }

    // Generate unique barcode
    let barcode = generateBookBarcode();
    let barcodeExists = await prisma.bookCopy.findUnique({ where: { barcode } });
    while (barcodeExists) {
      barcode = generateBookBarcode();
      barcodeExists = await prisma.bookCopy.findUnique({ where: { barcode } });
    }

    // Generate unique RFID tag
    let rfidTag = generateRFIDTag();
    let rfidExists = await prisma.bookCopy.findUnique({ where: { rfidTag } });
    while (rfidExists) {
      rfidTag = generateRFIDTag();
      rfidExists = await prisma.bookCopy.findUnique({ where: { rfidTag } });
    }

    const bookCopy = await prisma.bookCopy.create({
      data: {
        bookId: data.bookId,
        barcode,
        rfidTag,
        condition: data.condition || 'good',
        status: 'available',
        location: data.location,
        notes: data.notes,
      },
      include: {
        book: true,
      },
    });

    // Update book's total and available copies
    await this.updateBookCopyCount(data.bookId);

    await logger.info(LogAction.CREATE_BOOK_COPY, {
      bookCopyId: bookCopy.id,
      bookId: data.bookId,
      bookTitle: bookCopy.book.title,
      barcode,
      createdBy: userId,
    }, userId);

    return bookCopy;
  }

  /**
   * Update book copy
   * PERSISTENCE: Updates BOOK_COPY table, logs to SYSTEM_LOG
   */
  async updateBookCopy(copyId: number, data: {
    condition?: string;
    status?: string;
    location?: string;
    notes?: string;
  }, userId: number) {
    const copy = await prisma.bookCopy.findUnique({
      where: { id: copyId },
      include: { book: true },
    });

    if (!copy) {
      throw new Error('Book copy not found');
    }

    // Validate status transitions
    if (data.status) {
      // Don't allow changing status to 'on_loan' directly - use loan service
      if (data.status === 'on_loan' && copy.status !== 'on_loan') {
        throw new Error('Use the loan service to mark a copy as on_loan');
      }
    }

    const updatedCopy = await prisma.bookCopy.update({
      where: { id: copyId },
      data,
    });

    // Update book's available copies count
    await this.updateBookCopyCount(copy.bookId);

    await logger.info(LogAction.UPDATE_BOOK_COPY, {
      bookCopyId: copyId,
      bookId: copy.bookId,
      changes: data,
      updatedBy: userId,
    }, userId);

    return updatedCopy;
  }

  /**
   * Delete book copy (only if not on loan)
   * PERSISTENCE: Deletes from BOOK_COPY table, logs to SYSTEM_LOG
   */
  async deleteBookCopy(copyId: number, userId: number) {
    const copy = await prisma.bookCopy.findUnique({
      where: { id: copyId },
      include: {
        loans: {
          where: { status: 'ongoing' },
        },
      },
    });

    if (!copy) {
      throw new Error('Book copy not found');
    }

    if (copy.loans.length > 0) {
      throw new Error('Cannot delete a book copy that is currently on loan');
    }

    await prisma.bookCopy.delete({
      where: { id: copyId },
    });

    // Update book's copy count
    await this.updateBookCopyCount(copy.bookId);

    await logger.info(LogAction.DELETE_BOOK_COPY, {
      bookCopyId: copyId,
      bookId: copy.bookId,
      deletedBy: userId,
    }, userId);

    return { message: 'Book copy deleted successfully' };
  }

  /**
   * Helper: Update book's total and available copies count
   */
  private async updateBookCopyCount(bookId: number) {
    const copies = await prisma.bookCopy.findMany({
      where: { bookId },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: {
        totalCopies: copies.length,
        availableCopies: copies.filter((c) => c.status === 'available').length,
      },
    });
  }

  /**
   * Get all unique categories
   */
  async getCategories() {
    const books = await prisma.book.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return books.map((book) => book.category).sort();
  }
}

export default new BookService();
