// FILE: src/middleware/auth.middleware.ts
// Authentication and authorization middleware

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authenticate JWT token from Authorization header
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Authentication failed: No token provided', {
        path: req.path,
        authHeader: authHeader ? 'Present but invalid format' : 'Missing'
      });
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);

    if (!payload) {
      console.log('❌ Authentication failed: Invalid token', {
        path: req.path,
        tokenStart: token.substring(0, 20) + '...'
      });
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    console.log('✅ Authentication successful', {
      path: req.path,
      userId: payload.userId,
      accountType: payload.accountType,
      loginId: payload.loginId
    });

    req.user = payload;
    next();
  } catch (error) {
    console.log('❌ Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Authorize based on account type
 */
export function authorize(...allowedAccountTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      console.log('❌ Authorization failed: No user in request');
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    console.log('🔍 Authorization check:', {
      userAccountType: req.user.accountType,
      userAccountTypeType: typeof req.user.accountType,
      allowedTypes: allowedAccountTypes,
      rawComparison: allowedAccountTypes.map(t => ({
        allowed: t,
        user: req.user.accountType,
        match: t === req.user.accountType,
        includes: allowedAccountTypes.includes(req.user.accountType)
      }))
    });

    if (!allowedAccountTypes.includes(req.user.accountType)) {
      console.log('❌ Authorization failed: Account type mismatch');
      res.status(403).json({ 
        error: 'Access denied',
        message: `This endpoint requires one of: ${allowedAccountTypes.join(', ')}`,
        debug: {
          yourAccountType: req.user.accountType,
          required: allowedAccountTypes
        }
      });
      return;
    }

    console.log('✅ Authorization successful');
    next();
  };
}

/**
 * Authorize based on role
 */
export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({ 
        error: 'Access denied',
        message: `This endpoint requires one of these roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
}

/**
 * Check if user is admin
 */
export const isAdmin = authorize('ADMIN');

/**
 * Check if user is librarian or admin
 */
export const isLibrarianOrAdmin = authorize('LIBRARIAN', 'ADMIN');

/**
 * Check if user is member
 */
export const isMember = authorize('MEMBER');

/**
 * Check if user is librarian only
 */
export const isLibrarian = authorize('LIBRARIAN');

/**
 * Require specific role(s) - alias for authorize
 */
export const requireRole = authorize;

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
}
