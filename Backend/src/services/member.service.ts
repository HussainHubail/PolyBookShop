// FILE: src/services/member.service.ts
// Member management service

import prisma from '../config/database';

export class MemberService {
  /**
   * Get all members with their associated data
   */
  async getAllMembers() {
    const members = await prisma.member.findMany({
      include: {
        user: {
          select: {
            loginId: true,
            username: true,
            email: true,
            isActive: true,
          },
        },
        holds: {
          where: {
            OR: [
              { status: 'active' },
              { status: 'pending' },
            ],
          },
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
          },
        },
        fines: {
          where: {
            status: 'unpaid',
          },
          select: {
            id: true,
            amount: true,
            reason: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            loans: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals for each member
    const membersWithTotals = members.map((member) => {
      const totalFines = member.fines.reduce((sum, fine) => sum + Number(fine.amount), 0);
      const activeHoldsCount = member.holds.length;

      return {
        id: member.id,
        userId: member.userId,
        loginId: member.user.loginId,
        username: member.user.username,
        email: member.user.email,
        isActive: member.user.isActive,
        address: member.address,
        phoneNumber: member.phoneNumber,
        createdAt: member.createdAt,
        totalLoans: member._count.loans,
        holds: member.holds,
        activeHoldsCount,
        fines: member.fines,
        totalUnpaidFines: totalFines,
      };
    });

    return membersWithTotals;
  }

  /**
   * Get specific member by ID with detailed information
   */
  async getMemberById(memberId: number) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            loginId: true,
            username: true,
            email: true,
            isActive: true,
          },
        },
        holds: {
          select: {
            id: true,
            reason: true,
            status: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            removedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        fines: {
          select: {
            id: true,
            amount: true,
            reason: true,
            status: true,
            notes: true,
            paidAmount: true,
            createdAt: true,
            paidAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        loans: {
          include: {
            bookCopy: {
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    author: true,
                    coverImageUrl: true,
                  },
                },
              },
            },
          },
          orderBy: {
            borrowDatetime: 'desc',
          },
        },
        _count: {
          select: {
            loans: true,
          },
        },
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const totalUnpaidFines = member.fines
      .filter((f) => f.status === 'unpaid')
      .reduce((sum, fine) => sum + Number(fine.amount), 0);
    
    const activeHoldsCount = member.holds.filter((h) => h.status === 'active').length;

    return {
      id: member.id,
      userId: member.userId,
      loginId: member.user.loginId,
      username: member.user.username,
      email: member.user.email,
      isActive: member.user.isActive,
      address: member.address,
      phoneNumber: member.phoneNumber,
      maxBorrowedBooks: member.maxBorrowedBooks,
      createdAt: member.createdAt,
      totalLoans: member._count.loans,
      activeHoldsCount,
      totalUnpaidFines,
      holds: member.holds,
      fines: member.fines,
      loans: member.loans,
    };
  }

  /**
   * Get member by user ID
   */
  async getMemberByUserId(userId: number) {
    try {
      const member = await prisma.member.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              loginId: true,
              username: true,
              email: true,
              accountType: true,
            },
          },
        },
      });

      if (!member) {
        throw new Error('Member profile not found');
      }

      return {
        id: member.id,
        userId: member.userId,
        username: member.user.username,
        email: member.user.email,
        phoneNumber: member.phoneNumber || '',
        address: member.address || '',
        profilePictureUrl: member.profilePictureUrl || null,
      };
    } catch (error) {
      console.error('Error in getMemberByUserId:', error);
      throw error;
    }
  }

  /**
   * Update member profile
   */
  async updateProfile(userId: number, data: { username?: string; phoneNumber?: string; address?: string }) {
    try {
      // Validate username if provided
      if (data.username) {
        const trimmedUsername = data.username.trim();
        
        if (trimmedUsername.length < 3 || trimmedUsername.length > 100) {
          throw new Error('Username must be between 3 and 100 characters');
        }

        // Check if username is already taken by another user
        const existingUser = await prisma.user.findFirst({
          where: {
            username: trimmedUsername,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          throw new Error('Username already taken');
        }

        // Update username in User table
        await prisma.user.update({
          where: { id: userId },
          data: { username: trimmedUsername },
        });
      }

      // Validate phone number if provided
      if (data.phoneNumber && data.phoneNumber.trim().length > 20) {
        throw new Error('Phone number must not exceed 20 characters');
      }

      // Validate address if provided
      if (data.address && data.address.trim().length > 500) {
        throw new Error('Address must not exceed 500 characters');
      }

      // Update member profile
      const member = await prisma.member.update({
        where: { userId },
        data: {
          phoneNumber: data.phoneNumber?.trim() || null,
          address: data.address?.trim() || null,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              accountType: true,
            },
          },
        },
      });

      return {
        id: member.id,
        userId: member.userId,
        username: member.user.username,
        email: member.user.email,
        phoneNumber: member.phoneNumber || '',
        address: member.address || '',
        profilePictureUrl: member.profilePictureUrl || null,
      };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(userId: number, profilePictureUrl: string | null) {
    try {
      const member = await prisma.member.update({
        where: { userId },
        data: { profilePictureUrl },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              accountType: true,
            },
          },
        },
      });

      return {
        id: member.id,
        userId: member.userId,
        username: member.user.username,
        email: member.user.email,
        phoneNumber: member.phoneNumber || '',
        address: member.address || '',
        profilePictureUrl: member.profilePictureUrl || null,
      };
    } catch (error) {
      console.error('Error in updateProfilePicture:', error);
      throw new Error('Failed to update profile picture');
    }
  }

  /**
   * Delete member account
   */
  async deleteAccount(userId: number) {
    try {
      // Check if member exists
      const member = await prisma.member.findUnique({
        where: { userId },
      });

      if (!member) {
        throw new Error('Member not found');
      }

      // Check for active loans
      const activeLoans = await prisma.loan.count({
        where: {
          memberId: member.id,
          returnDatetime: null,
        },
      });

      if (activeLoans > 0) {
        throw new Error(`Cannot delete account. You have ${activeLoans} active loan(s). Please return all borrowed books first.`);
      }

      // Check for unpaid fines
      const unpaidFines = await prisma.fine.findMany({
        where: {
          memberId: member.id,
          status: 'unpaid',
        },
      });

      if (unpaidFines.length > 0) {
        const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + Number(fine.amount), 0);
        throw new Error(`Cannot delete account. You have unpaid fines totaling $${totalUnpaid.toFixed(2)}. Please settle all fines first.`);
      }

      // Delete member (this will cascade delete related data based on schema)
      await prisma.member.delete({
        where: { userId },
      });

      // Delete user account
      await prisma.user.delete({
        where: { id: userId },
      });

      return true;
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      throw error;
    }
  }
}

export default new MemberService();
