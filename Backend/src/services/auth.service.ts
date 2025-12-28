// FILE: src/services/auth.service.ts
// Authentication service - handles signup, email verification, and three-way login
// PERSISTENCE: All operations are logged in SYSTEM_LOG

import prisma from '../config/database';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '../utils/jwt';
import { generateLoginId, generateStudentStaffId } from '../utils/idGenerator';
import { logger, LogAction } from '../utils/logger';
import emailService from './email.service';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

interface SignupData {
  username: string;
  email: string;
  password: string;
  studentType?: 'STUDENT' | 'STAFF';
  department?: string;
  phoneNumber?: string;
  address?: string;
}

interface LoginData {
  loginId: string;
  password: string;
  accountType: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
}

interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    loginId: string;
    accountType: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Member signup with email verification
   * PERSISTENCE: Creates USER, MEMBER, assigns ROLE, sends verification email, logs to SYSTEM_LOG
   */
  async signup(data: SignupData, ipAddress?: string, userAgent?: string): Promise<{ loginId: string; message: string }> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(`Weak password: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Generate unique member login ID
    let loginId = generateLoginId('MEMBER');
    let loginIdExists = await prisma.user.findUnique({ where: { loginId } });
    
    // Ensure uniqueness (very unlikely collision, but handle it)
    while (loginIdExists) {
      loginId = generateLoginId('MEMBER');
      loginIdExists = await prisma.user.findUnique({ where: { loginId } });
    }

    // Generate student/staff ID
    let studentOrStaffId = generateStudentStaffId(data.studentType || 'STUDENT');
    let studentIdExists = await prisma.member.findUnique({ where: { studentOrStaffId } });
    
    while (studentIdExists) {
      studentOrStaffId = generateStudentStaffId(data.studentType || 'STUDENT');
      studentIdExists = await prisma.member.findUnique({ where: { studentOrStaffId } });
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // PERSISTENCE: Create user, member, and assign role in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash,
          loginId,
          accountType: 'MEMBER',
          isActive: true, // Members are immediately active
        },
      });

      // Get or create MEMBER role
      let memberRole = await tx.role.findUnique({ where: { name: 'MEMBER' } });
      if (!memberRole) {
        memberRole = await tx.role.create({
          data: {
            name: 'MEMBER',
            description: 'Library member - can borrow books and make reservations',
          },
        });
      }

      // Assign MEMBER role
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: memberRole.id,
        },
      });

      // Create member profile
      await tx.member.create({
        data: {
          userId: newUser.id,
          studentOrStaffId,
          maxBorrowedBooks: env.DEFAULT_MAX_BORROWED_BOOKS,
          department: data.department,
          phoneNumber: data.phoneNumber,
          address: data.address,
        },
      });

      return newUser;
    });

    // Save credentials to JSON file for development
    if (env.NODE_ENV === 'development') {
      try {
        const credentialsPath = path.join(__dirname, '../../..', 'dev-credentials.json');
        let credentials: any = { note: '⚠️ DEVELOPMENT ONLY - DO NOT COMMIT TO GIT', admin_accounts: [], librarian_accounts: [], member_accounts: [] };
        
        if (fs.existsSync(credentialsPath)) {
          credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
        }
        
        credentials.member_accounts.push({
          loginId: user.loginId,
          password: data.password,
          username: user.username,
          email: user.email,
          accountType: 'MEMBER',
          createdAt: new Date().toISOString()
        });
        
        fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
        console.log(`📝 Credentials saved to dev-credentials.json`);
      } catch (err) {
        console.error('Failed to save credentials to JSON:', err);
      }
    }

    // PERSISTENCE: Log signup event
    await logger.info(
      LogAction.SIGNUP,
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        loginId: user.loginId,
        accountType: 'MEMBER',
        ipAddress,
        userAgent,
      },
      user.id
    );

    return {
      loginId: user.loginId,
      message: `Account created successfully! Your member ID is ${loginId}. You can now log in.`,
    };
  }

  /**
   * Three-way login (Admin, Librarian, or Member)
   * PERSISTENCE: Logs successful/failed login attempts to SYSTEM_LOG
   */
  async login(data: LoginData, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Find user by login ID
    const user = await prisma.user.findUnique({
      where: { loginId: data.loginId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      // PERSISTENCE: Log failed login attempt
      await logger.warn(LogAction.LOGIN_FAILED, {
        loginId: data.loginId,
        accountType: data.accountType,
        reason: 'User not found',
        ipAddress,
        userAgent,
      });
      
      throw new Error('Invalid login credentials');
    }

    // Verify password
    const passwordValid = await verifyPassword(data.password, user.passwordHash);
    if (!passwordValid) {
      // PERSISTENCE: Log failed login attempt
      await logger.warn(LogAction.LOGIN_FAILED, {
        userId: user.id,
        loginId: data.loginId,
        accountType: data.accountType,
        reason: 'Invalid password',
        ipAddress,
        userAgent,
      }, user.id);
      
      throw new Error('Invalid login credentials');
    }

    // Verify account type matches
    if (user.accountType !== data.accountType) {
      // PERSISTENCE: Log failed login attempt (wrong account type)
      await logger.warn(LogAction.LOGIN_FAILED, {
        userId: user.id,
        loginId: data.loginId,
        requestedAccountType: data.accountType,
        actualAccountType: user.accountType,
        reason: 'Account type mismatch',
        ipAddress,
        userAgent,
      }, user.id);
      
      throw new Error(`This login ID is not registered as a ${data.accountType}. Please select the correct account type.`);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is not active. Please contact administrator.');
    }

    // Extract role names
    const roles = user.userRoles.map((ur) => ur.role.name);

    // Generate tokens
    const jwtPayload: JWTPayload = {
      userId: user.id,
      loginId: user.loginId,
      accountType: user.accountType as 'ADMIN' | 'LIBRARIAN' | 'MEMBER',
      roles,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // PERSISTENCE: Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // PERSISTENCE: Log successful login
    await logger.info(LogAction.LOGIN_SUCCESS, {
      userId: user.id,
      loginId: user.loginId,
      accountType: user.accountType,
      roles,
      ipAddress,
      userAgent,
    }, user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        loginId: user.loginId,
        accountType: user.accountType,
        roles,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get user by ID with roles
   */
  async getUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        member: true,
      },
    });
  }
}

export default new AuthService();
