// FILE: src/routes/auth.routes.ts
// Authentication routes

import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';
// import { loginLimiter, signupLimiter } from '../middleware/rateLimiter'; // DISABLED

const router = Router();

/**
 * POST /api/auth/member/signup
 * Member signup (public)
 */
router.post(
  '/member/signup',
  // signupLimiter, // DISABLED
  [
    body('username').isLength({ min: 3, max: 100 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('department').optional().isLength({ max: 100 }).trim(),
    body('phoneNumber').optional().isLength({ max: 20 }).trim(),
    validateRequest,
  ],
  authController.signup.bind(authController)
);

/**
 * POST /api/auth/login
 * Three-way login (public)
 */
router.post(
  '/login',
  // loginLimiter, // DISABLED
  [
    body('loginId').notEmpty().trim(),
    body('password').notEmpty(),
    body('accountType').isIn(['ADMIN', 'LIBRARIAN', 'MEMBER']),
    validateRequest,
  ],
  authController.login.bind(authController)
);

/**
 * GET /api/auth/me
 * Get current user (authenticated)
 */
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;
