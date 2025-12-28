// FILE: src/services/report.service.ts
// Report and analytics service

import prisma from '../config/database';

export class ReportService {
  /**
   * Get comprehensive analytics data
   */
  async getAnalytics() {
    // Most borrowed books
    const mostBorrowedBooks = await prisma.loan.groupBy({
      by: ['bookCopyId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get book details for most borrowed
    const bookCopyIds = mostBorrowedBooks.map((b) => b.bookCopyId);
    const bookCopies = await prisma.bookCopy.findMany({
      where: {
        id: {
          in: bookCopyIds,
        },
      },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            category: true,
            coverImageUrl: true,
          },
        },
      },
    });

    const mostBorrowedBooksWithDetails = mostBorrowedBooks.map((borrowed) => {
      const copy = bookCopies.find((bc) => bc.id === borrowed.bookCopyId);
      return {
        bookTitle: copy?.book.title || 'Unknown',
        author: copy?.book.author || 'Unknown',
        category: copy?.book.category || 'Unknown',
        coverImageUrl: copy?.book.coverImageUrl,
        borrowCount: borrowed._count.id,
      };
    });

    // Overdue loans statistics
    const overdueLoans = await prisma.loan.count({
      where: {
        status: 'overdue',
      },
    });

    const totalActiveLoans = await prisma.loan.count({
      where: {
        status: {
          in: ['ongoing', 'overdue'],
        },
      },
    });

    // Category distribution
    const categoryDistribution = await prisma.book.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Revenue from fines
    const totalFinesRevenue = await prisma.fine.aggregate({
      where: {
        status: 'paid',
      },
      _sum: {
        amount: true,
      },
    });

    const unpaidFines = await prisma.fine.aggregate({
      where: {
        status: 'unpaid',
      },
      _sum: {
        amount: true,
      },
    });

    // Monthly loan trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const loanTrends = await prisma.loan.groupBy({
      by: ['borrowDatetime'],
      where: {
        borrowDatetime: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Process loan trends by month
    const monthlyLoans = loanTrends.reduce((acc: any, loan) => {
      const month = new Date(loan.borrowDatetime).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += loan._count.id;
      return acc;
    }, {});

    // Member statistics
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({
      where: {
        user: {
          isActive: true,
        },
      },
    });

    // Members with most loans
    const topBorrowers = await prisma.loan.groupBy({
      by: ['memberId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const memberIds = topBorrowers.map((b) => b.memberId);
    const members = await prisma.member.findMany({
      where: {
        id: {
          in: memberIds,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            loginId: true,
          },
        },
      },
    });

    const topBorrowersWithDetails = topBorrowers.map((borrower) => {
      const member = members.find((m) => m.id === borrower.memberId);
      return {
        memberName: member?.user.username || 'Unknown',
        loginId: member?.user.loginId || 'Unknown',
        totalLoans: borrower._count.id,
      };
    });

    // Book availability statistics
    const totalBooks = await prisma.book.count();
    const totalCopies = await prisma.bookCopy.count();
    const availableCopies = await prisma.bookCopy.count({
      where: {
        status: 'available',
      },
    });

    return {
      mostBorrowedBooks: mostBorrowedBooksWithDetails,
      loanStatistics: {
        totalActiveLoans,
        overdueLoans,
        overduePercentage: totalActiveLoans > 0 ? ((overdueLoans / totalActiveLoans) * 100).toFixed(2) : '0',
      },
      categoryDistribution: categoryDistribution.map((cat) => ({
        category: cat.category,
        count: cat._count.id,
      })),
      financialData: {
        totalRevenue: Number(totalFinesRevenue._sum.amount) || 0,
        unpaidFines: Number(unpaidFines._sum.amount) || 0,
      },
      monthlyTrends: Object.entries(monthlyLoans).map(([month, count]) => ({
        month,
        loans: count,
      })),
      memberStatistics: {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers,
      },
      topBorrowers: topBorrowersWithDetails,
      bookStatistics: {
        totalBooks,
        totalCopies,
        availableCopies,
        borrowedCopies: totalCopies - availableCopies,
      },
    };
  }
}

export default new ReportService();
