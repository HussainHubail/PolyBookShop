// FILE: src/controllers/auth.controller.ts
// Authentication controller for signup, verify, and login endpoints

import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { getClientIp, getUserAgent } from '../middleware/validator.middleware';

export class AuthController {
  /**
   * POST /api/auth/member/signup
   * Member signup (public)
   */
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = getClientIp(req);
      const userAgent = getUserAgent(req);

      const result = await authService.signup(req.body, ipAddress, userAgent);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          loginId: result.loginId,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/auth/login
   * Three-way login (Admin, Librarian, Member) (public)
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { loginId, password, accountType } = req.body;

      if (!loginId || !password || !accountType) {
        res.status(400).json({
          success: false,
          error: 'loginId, password, and accountType are required',
        });
        return;
      }

      if (!['ADMIN', 'LIBRARIAN', 'MEMBER'].includes(accountType)) {
        res.status(400).json({
          success: false,
          error: 'accountType must be ADMIN, LIBRARIAN, or MEMBER',
        });
        return;
      }

      const ipAddress = getClientIp(req);
      const userAgent = getUserAgent(req);

      const result = await authService.login(
        { loginId, password, accountType },
        ipAddress,
        userAgent
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current user info (authenticated)
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          loginId: user.loginId,
          accountType: user.accountType,
          isActive: user.isActive,
          roles: user.userRoles.map((ur) => ur.role.name),
          member: user.member,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

export default new AuthController();
