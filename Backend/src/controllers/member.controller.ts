// FILE: src/controllers/member.controller.ts
// Member management controller

import { Request, Response } from 'express';
import memberService from '../services/member.service';

export class MemberController {
  /**
   * GET /api/members
   * Get all members with their holds and fines (Admin only)
   */
  async getAllMembers(req: Request, res: Response): Promise<void> {
    try {
      const members = await memberService.getAllMembers();

      res.status(200).json({
        success: true,
        members,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/members/:id
   * Get specific member details (Admin only)
   */
  async getMemberById(req: Request, res: Response): Promise<void> {
    try {
      const memberId = parseInt(req.params.id);
      const member = await memberService.getMemberById(memberId);

      res.status(200).json({
        success: true,
        member,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/members/profile
   * Get current member's profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        console.error('❌ getProfile: No userId in request', { user: (req as any).user });
        res.status(401).json({ success: false, error: 'Unauthorized - No user ID found' });
        return;
      }

      console.log('📝 Fetching profile for userId:', userId);
      const member = await memberService.getMemberByUserId(userId);
      
      console.log('✅ Profile fetched successfully for userId:', userId);
      res.status(200).json({ success: true, member });
    } catch (error) {
      console.error('❌ Error in getProfile:', error);
      const message = (error as Error).message || 'Failed to fetch profile';
      res.status(500).json({ success: false, error: message });
    }
  }

  /**
   * PUT /api/members/profile
   * Update current member's profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        console.error('❌ updateProfile: No userId in request', { user: (req as any).user });
        res.status(401).json({ success: false, error: 'Unauthorized - No user ID found' });
        return;
      }

      const { username, phoneNumber, address } = req.body;

      // Validate input
      if (username !== undefined && typeof username !== 'string') {
        res.status(400).json({ success: false, error: 'Username must be a string' });
        return;
      }

      if (phoneNumber !== undefined && typeof phoneNumber !== 'string') {
        res.status(400).json({ success: false, error: 'Phone number must be a string' });
        return;
      }

      if (address !== undefined && typeof address !== 'string') {
        res.status(400).json({ success: false, error: 'Address must be a string' });
        return;
      }

      console.log('📝 Updating profile for userId:', userId, { username, phoneNumber, address });
      const member = await memberService.updateProfile(userId, {
        username,
        phoneNumber,
        address,
      });

      console.log('✅ Profile updated successfully for userId:', userId);
      res.status(200).json({ success: true, member });
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      const message = (error as Error).message || 'Failed to update profile';
      res.status(400).json({ success: false, error: message });
    }
  }

  /**
   * POST /api/members/profile/picture
   * Upload profile picture
   */
  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        console.error('❌ uploadProfilePicture: No userId in request', { user: (req as any).user });
        res.status(401).json({ success: false, error: 'Unauthorized - No user ID found' });
        return;
      }

      if (!req.file) {
        console.error('❌ uploadProfilePicture: No file in request');
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
      console.log('📝 Uploading profile picture for userId:', userId, 'URL:', profilePictureUrl);
      
      const member = await memberService.updateProfilePicture(userId, profilePictureUrl);

      console.log('✅ Profile picture uploaded successfully for userId:', userId);
      res.status(200).json({ success: true, member });
    } catch (error) {
      console.error('❌ Error in uploadProfilePicture:', error);
      const message = (error as Error).message || 'Failed to upload profile picture';
      res.status(500).json({ success: false, error: message });
    }
  }

  /**
   * DELETE /api/members/profile/picture
   * Remove profile picture
   */
  async deleteProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        console.error('❌ deleteProfilePicture: No userId in request', { user: (req as any).user });
        res.status(401).json({ success: false, error: 'Unauthorized - No user ID found' });
        return;
      }

      console.log('📝 Removing profile picture for userId:', userId);
      const member = await memberService.updateProfilePicture(userId, null);
      
      console.log('✅ Profile picture removed successfully for userId:', userId);
      res.status(200).json({ success: true, member });
    } catch (error) {
      console.error('❌ Error in deleteProfilePicture:', error);
      const message = (error as Error).message || 'Failed to remove profile picture';
      res.status(500).json({ success: false, error: message });
    }
  }

  /**
   * DELETE /api/members/profile
   * Delete member account
   */
  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        console.error('❌ deleteAccount: No userId in request', { user: (req as any).user });
        res.status(401).json({ success: false, error: 'Unauthorized - No user ID found' });
        return;
      }

      console.log('📝 Deleting account for userId:', userId);
      await memberService.deleteAccount(userId);
      
      console.log('✅ Account deleted successfully for userId:', userId);
      res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      console.error('❌ Error in deleteAccount:', error);
      const message = (error as Error).message || 'Failed to delete account';
      res.status(400).json({ success: false, error: message });
    }
  }
}

export default new MemberController();
