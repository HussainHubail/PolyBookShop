// FILE: src/services/loan.service.ts
// Loan service with email confirmation and full persistence

import prisma from '../config/database';
import { logger, LogAction } from '../utils/logger';
import emailService from './email.service';
import { env } from '../config/env';

interface CreateLoanData {
  memberId: number;
  bookCopyId: number;
  durationDays?: number;
}

class LoanService {
  /**
   * Create a new loan
   * PERSISTENCE: Creates LOAN, updates BOOK_COPY status, sends confirmation email, logs to SYSTEM_LOG
   */
  async createLoan(data: CreateLoanData, createdBy: number) {
    // Get member details
    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
      include: {
        user: true,
        loans: {
          where: { status: 'ongoing' },
        },
        holds: {
          where: { status: 'active' },
        },
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Check if member has active holds
    if (member.holds && member.holds.length > 0) {
      const holdReasons = member.holds.map(h => h.reason).join(', ');
      throw new Error(`Cannot create loan. Member account has active holds: ${holdReasons}`);
    }

    // Check max borrowed books limit
    if (member.loans.length >= member.maxBorrowedBooks) {
      throw new Error(`Member has reached the maximum limit of ${member.maxBorrowedBooks} borrowed books`);
    }

    // Get book copy details
    const bookCopy = await prisma.bookCopy.findUnique({
      where: { id: data.bookCopyId },
      include: {
        book: true,
      },
    });

    if (!bookCopy) {
      throw new Error('Book copy not found');
    }

    // Check if copy is available
    if (bookCopy.status !== 'available') {
      throw new Error(`Book copy is not available (current status: ${bookCopy.status})`);
    }

    // Calculate dates
    const borrowDatetime = new Date();
    const durationDays = data.durationDays || env.DEFAULT_LOAN_PERIOD_DAYS;
    const dueDatetime = new Date();
    dueDatetime.setDate(dueDatetime.getDate() + durationDays);

    // PERSISTENCE: Create loan and update book copy status in transaction
    const loan = await prisma.$transaction(async (tx) => {
      // Create loan record
      const newLoan = await tx.loan.create({
        data: {
          memberId: data.memberId,
          bookCopyId: data.bookCopyId,
          borrowDatetime,
          dueDatetime,
          status: 'ongoing',
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
          bookCopy: {
            include: {
              book: true,
            },
          },
        },
      });

      // Update book copy status to 'on_loan'
      await tx.bookCopy.update({
        where: { id: data.bookCopyId },
        data: { status: 'on_loan' },
      });

      // Update book's available copies count
      const copies = await tx.bookCopy.findMany({
        where: { bookId: bookCopy.bookId },
      });
      await tx.book.update({
        where: { id: bookCopy.bookId },
        data: {
          availableCopies: copies.filter((c) => c.status === 'available').length,
        },
      });

      return newLoan;
    });

    // PERSISTENCE: Send loan confirmation email with borrow and return dates
    try {
      await emailService.sendLoanConfirmationEmail(
        loan.member.user.email,
        loan.member.user.username,
        {
          bookTitle: loan.bookCopy.book.title,
          author: loan.bookCopy.book.author,
          barcode: loan.bookCopy.barcode,
          borrowDate: loan.borrowDatetime,
          dueDate: loan.dueDatetime,
          loanId: loan.id,
        },
        loan.member.userId
      );
    } catch (emailError) {
      // Log email error but don't fail the loan
      await logger.error(LogAction.CREATE_NOTIFICATION, {
        error: (emailError as Error).message,
        loanId: loan.id,
        context: 'loan_confirmation_email',
      });
    }

    // Create in-app notification for successful borrowing
    try {
      const { notificationService } = await import('./notification.service');
      await notificationService.createNotification({
        userId: loan.member.userId,
        type: 'LOAN_CREATED',
        title: 'Book Borrowed Successfully',
        message: `You have successfully borrowed "${loan.bookCopy.book.title}" by ${loan.bookCopy.book.author}. Please return it by ${loan.dueDatetime.toLocaleDateString()}.`,
        priority: 'normal',
        payload: {
          loanId: loan.id,
          bookId: loan.bookCopy.book.id,
          bookTitle: loan.bookCopy.book.title,
          dueDate: loan.dueDatetime.toISOString(),
        },
      });
    } catch (notifError) {
      // Log notification error but don't fail the loan
      await logger.error(LogAction.CREATE_NOTIFICATION, {
        error: (notifError as Error).message,
        loanId: loan.id,
      });
    }

    // Notify all admins about the new loan
    try {
      const { adminNotificationService } = await import('./admin-notification.service');
      await adminNotificationService.notifyBookBorrowed(
        loan.member.user.username,
        loan.member.user.loginId,
        loan.bookCopy.book.title,
        loan.bookCopy.book.author,
        loan.id,
        loan.dueDatetime
      );
    } catch (adminNotifError) {
      // Log error but don't fail the loan
      await logger.error(LogAction.CREATE_NOTIFICATION, {
        error: (adminNotifError as Error).message,
        loanId: loan.id,
        type: 'admin_notification',
      });
    }

    // PERSISTENCE: Log loan creation to system log
    await logger.info(LogAction.CREATE_LOAN, {
      loanId: loan.id,
      memberId: data.memberId,
      memberName: loan.member.user.username,
      bookCopyId: data.bookCopyId,
      bookTitle: loan.bookCopy.book.title,
      borrowDatetime: loan.borrowDatetime,
      dueDatetime: loan.dueDatetime,
      createdBy,
    }, createdBy);

    return loan;
  }

  /**
   * Return a book
   * PERSISTENCE: Updates LOAN, updates BOOK_COPY status, creates fine if overdue, logs to SYSTEM_LOG
   */
  async returnLoan(loanId: number, returnedBy: number) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        member: {
          include: { user: true },
        },
        bookCopy: {
          include: { book: true },
        },
      },
    });

    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status === 'returned') {
      throw new Error('Book has already been returned');
    }

    const returnDatetime = new Date();
    const isOverdue = returnDatetime > loan.dueDatetime;
    
    let fine: any = null;

    // PERSISTENCE: Update loan and book copy in transaction
    const updatedLoan = await prisma.$transaction(async (tx) => {
      // Update loan status
      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          returnDatetime,
          status: isOverdue ? 'overdue' : 'returned',
        },
        include: {
          bookCopy: {
            include: { book: true },
          },
          member: {
            include: { user: true },
          },
        },
      });

      // Update book copy status back to available
      await tx.bookCopy.update({
        where: { id: loan.bookCopyId },
        data: { status: 'available' },
      });

      // Update book's available copies count
      const copies = await tx.bookCopy.findMany({
        where: { bookId: loan.bookCopy.bookId },
      });
      await tx.book.update({
        where: { id: loan.bookCopy.bookId },
        data: {
          availableCopies: copies.filter((c) => c.status === 'available').length,
        },
      });

      // Create fine if overdue
      if (isOverdue) {
        const daysOverdue = Math.ceil((returnDatetime.getTime() - loan.dueDatetime.getTime()) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * env.FINE_PER_DAY;

        // Get admin user ID for charging fine
        const adminUser = await tx.user.findFirst({
          where: { accountType: 'ADMIN', isActive: true },
        });

        if (!adminUser) {
          throw new Error('No active admin user found to charge fine');
        }

        fine = await tx.fine.create({
          data: {
            memberId: loan.memberId,
            loanId: loan.id,
            amount: fineAmount,
            currency: 'USD',
            status: 'unpaid',
            reason: `Overdue fine: ${daysOverdue} day(s) late`,
            chargedBy: adminUser.id,
          },
        });

        await logger.info(LogAction.CREATE_FINE, {
          fineId: fine.id,
          loanId: loan.id,
          memberId: loan.memberId,
          amount: fineAmount,
          reason: fine.reason,
        }, returnedBy);
      }

      return updated;
    });

    // Log return
    const logAction = isOverdue ? LogAction.MARK_OVERDUE : LogAction.RETURN_LOAN;
    await logger.info(logAction, {
      loanId,
      returnDatetime,
      isOverdue,
      daysOverdue: isOverdue ? Math.ceil((returnDatetime.getTime() - loan.dueDatetime.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      fineId: fine?.id,
      fineAmount: fine?.amount,
      returnedBy,
    }, returnedBy);

    // Create notification for book return
    try {
      const { notificationService } = await import('./notification.service');
      if (isOverdue && fine) {
        await notificationService.createNotification({
          userId: updatedLoan.member.userId,
          type: 'LOAN_RETURNED_OVERDUE',
          title: 'Book Returned - Fine Applied',
          message: `You have returned "${updatedLoan.bookCopy.book.title}". A fine of $${fine.amount.toFixed(2)} has been applied for ${Math.ceil((returnDatetime.getTime() - loan.dueDatetime.getTime()) / (1000 * 60 * 60 * 24))} day(s) overdue.`,
          priority: 'high',
          payload: {
            loanId: updatedLoan.id,
            bookId: updatedLoan.bookCopy.book.id,
            bookTitle: updatedLoan.bookCopy.book.title,
            fineId: fine.id,
            fineAmount: fine.amount,
            returnDate: returnDatetime.toISOString(),
          },
        });
      } else {
        await notificationService.createNotification({
          userId: updatedLoan.member.userId,
          type: 'LOAN_RETURNED',
          title: 'Book Returned Successfully',
          message: `Thank you for returning "${updatedLoan.bookCopy.book.title}" on time. We hope you enjoyed it!`,
          priority: 'normal',
          payload: {
            loanId: updatedLoan.id,
            bookId: updatedLoan.bookCopy.book.id,
            bookTitle: updatedLoan.bookCopy.book.title,
            returnDate: returnDatetime.toISOString(),
          },
        });
      }
    } catch (notifError) {
      await logger.error(LogAction.CREATE_NOTIFICATION, {
        error: (notifError as Error).message,
        loanId: updatedLoan.id,
      });
    }

    // Notify admins about book return
    try {
      const { adminNotificationService } = await import('./admin-notification.service');
      
      if (isOverdue && fine) {
        // Notify about late return
        const daysOverdue = Math.ceil((returnDatetime.getTime() - loan.dueDatetime.getTime()) / (1000 * 60 * 60 * 24));
        await adminNotificationService.notifyLateReturn(
          updatedLoan.member.user.username,
          updatedLoan.member.user.loginId,
          updatedLoan.bookCopy.book.title,
          updatedLoan.id,
          daysOverdue,
          parseFloat(fine.amount.toString())
        );
      } else {
        // Notify about on-time return
        await adminNotificationService.notifyBookReturned(
          updatedLoan.member.user.username,
          updatedLoan.member.user.loginId,
          updatedLoan.bookCopy.book.title,
          updatedLoan.id
        );
      }
    } catch (adminNotifError) {
      await logger.error(LogAction.CREATE_NOTIFICATION, {
        error: (adminNotifError as Error).message,
        loanId: updatedLoan.id,
        type: 'admin_notification_book_return',
      });
    }

    return {
      loan: updatedLoan,
      fine,
      isOverdue,
    };
  }

  /**
   * Renew a loan
   */
  async renewLoan(loanId: number, renewedBy: number) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        bookCopy: {
          include: { book: true },
        },
      },
    });

    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status !== 'ongoing') {
      throw new Error('Only ongoing loans can be renewed');
    }

    // Check if there are active reservations for this book
    const reservations = await prisma.reservation.findMany({
      where: {
        bookId: loan.bookCopy.book.id,
        status: 'active',
      },
    });

    if (reservations.length > 0) {
      throw new Error('Cannot renew: this book has active reservations');
    }

    // Extend due date
    const newDueDate = new Date(loan.dueDatetime);
    newDueDate.setDate(newDueDate.getDate() + env.DEFAULT_LOAN_PERIOD_DAYS);

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        dueDatetime: newDueDate,
        renewalCount: loan.renewalCount + 1,
      },
    });

    await logger.info(LogAction.RENEW_LOAN, {
      loanId,
      oldDueDate: loan.dueDatetime,
      newDueDate,
      renewalCount: updatedLoan.renewalCount,
      renewedBy,
    }, renewedBy);

    return updatedLoan;
  }

  /**
   * Get member's loans
   */
  async getMemberLoans(memberId: number, status?: string) {
    const where: any = { memberId };
    if (status) {
      where.status = status;
    }

    return prisma.loan.findMany({
      where,
      include: {
        bookCopy: {
          include: {
            book: true,
          },
        },
      },
      orderBy: { borrowDatetime: 'desc' },
    });
  }

  /**
   * Get all loans with filters
   */
  async getAllLoans(params: {
    status?: string;
    memberId?: number;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.memberId) where.memberId = params.memberId;

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: {
          member: {
            include: { user: true },
          },
          bookCopy: {
            include: { book: true },
          },
        },
        skip,
        take: limit,
        orderBy: { borrowDatetime: 'desc' },
      }),
      prisma.loan.count({ where }),
    ]);

    return {
      loans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new LoanService();
