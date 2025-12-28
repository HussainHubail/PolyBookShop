// FILE: src/routes/member.routes.ts
// Member management routes for admin

import { Router } from 'express';
import memberController from '../controllers/member.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadProfilePicture } from '../middleware/upload';

const router = Router();

/**
 * GET /api/members
 * Get all members with their holds and fines (Admin only)
 */
router.get('/', authenticate, requireRole('ADMIN'), memberController.getAllMembers.bind(memberController));

/**
 * Profile management routes (accessible by all authenticated members)
 */

/**
 * GET /api/members/profile
 * Get current member's profile
 */
router.get('/profile', authenticate, memberController.getProfile.bind(memberController));

/**
 * PUT /api/members/profile
 * Update current member's profile
 */
router.put('/profile', authenticate, memberController.updateProfile.bind(memberController));

/**
 * POST /api/members/profile/picture
 * Upload profile picture
 */
router.post(
  '/profile/picture',
  authenticate,
  uploadProfilePicture.single('profilePicture'),
  memberController.uploadProfilePicture.bind(memberController)
);

/**
 * DELETE /api/members/profile/picture
 * Remove profile picture
 */
router.delete('/profile/picture', authenticate, memberController.deleteProfilePicture.bind(memberController));

/**
 * DELETE /api/members/profile
 * Delete member account
 */
router.delete('/profile', authenticate, memberController.deleteAccount.bind(memberController));

/**
 * GET /api/members/:id
 * Get specific member details with holds and fines (Admin only)
 */
router.get('/:id', authenticate, requireRole('ADMIN'), memberController.getMemberById.bind(memberController));

export default router;
