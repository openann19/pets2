import type { Response } from 'express';
import User, { type IUserDocument } from '../models/User';
import Pet from '../models/Pet';
import type { HydratedDocument } from 'mongoose';
import type { IPet } from '../types/mongoose';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/express';
import { getErrorMessage } from '../utils/errorHandler';

type IPetDocument = HydratedDocument<IPet>;

/**
 * Request interfaces
 */
interface UpdatePetProfileRequest extends AuthRequest {
  params: {
    petId: string;
  };
  body: Partial<IPetDocument>;
}

interface CreatePetProfileRequest extends AuthRequest {
  body: Partial<IPetDocument>;
}

interface GetMessageCountRequest extends AuthRequest {}

interface GetPetCountRequest extends AuthRequest {}

interface GetPrivacySettingsRequest extends AuthRequest {}

interface UpdatePrivacySettingsRequest extends AuthRequest {
  body: {
    profileVisibility?: string;
    showOnlineStatus?: boolean;
    showDistance?: boolean;
    showLastActive?: boolean;
    allowMessages?: string;
    showReadReceipts?: boolean;
    incognitoMode?: boolean;
    shareLocation?: boolean;
  };
}

interface ExportUserDataRequest extends AuthRequest {}

interface DeleteAccountRequest extends AuthRequest {
  body: {
    password: string;
  };
}

/**
 * Update pet profile
 */
export const updatePetProfile = async (req: UpdatePetProfileRequest, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Find the pet and verify ownership
    const pet = await Pet.findById(petId);
    
    if (!pet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
      return;
    }

    // Verify the user owns this pet
    if (pet.owner.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
      return;
    }

    // Update pet with new data
    Object.assign(pet, updates);
    await pet.save();

    logger.info('Pet profile updated', { petId, userId });

    res.json({
      success: true,
      data: pet,
      message: 'Pet profile updated successfully'
    });
  } catch (error: unknown) {
    logger.error('Failed to update pet profile', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to update pet profile',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Create new pet profile
 */
export const createPetProfile = async (req: CreatePetProfileRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const petData = {
      ...req.body,
      owner: userId
    };

    const pet = new Pet(petData);
    await pet.save();

    // Add pet to user's pets array
    await User.findByIdAndUpdate(userId, {
      $push: { pets: pet._id }
    });

    logger.info('Pet profile created', { petId: pet._id, userId });

    res.status(201).json({
      success: true,
      data: pet,
      message: 'Pet profile created successfully'
    });
  } catch (error: unknown) {
    logger.error('Failed to create pet profile', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to create pet profile',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Get user's message count
 */
export const getMessageCount = async (req: GetMessageCountRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // TODO: Implement actual message count from Match/Message models
    const Message = require('../models/Message');
    const count = await Message.countDocuments({
      $or: [
        { sender: userId },
        { recipient: userId }
      ],
      readAt: null // Unread messages
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: unknown) {
    logger.error('Failed to get message count', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to get message count',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Get user's pet count
 */
export const getPetCount = async (req: GetPetCountRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const count = await Pet.countDocuments({ owner: userId });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: unknown) {
    logger.error('Failed to get pet count', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet count',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Get user privacy settings
 */
export const getPrivacySettings = async (req: GetPrivacySettingsRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('privacySettings');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user.privacySettings || {
        profileVisibility: 'everyone',
        showOnlineStatus: true,
        showDistance: true,
        showLastActive: true,
        allowMessages: 'everyone',
        showReadReceipts: true,
        incognitoMode: false,
        shareLocation: true
      }
    });
  } catch (error: unknown) {
    logger.error('Failed to get privacy settings', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to get privacy settings',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Update user privacy settings
 */
export const updatePrivacySettings = async (req: UpdatePrivacySettingsRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const settings = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { privacySettings: settings },
      { new: true, runValidators: true }
    ).select('privacySettings');

    logger.info('Privacy settings updated', { userId });

    res.json({
      success: true,
      data: user?.privacySettings,
      message: 'Privacy settings updated successfully'
    });
  } catch (error: unknown) {
    logger.error('Failed to update privacy settings', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async (req: ExportUserDataRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Gather all user data
    const user = await User.findById(userId).lean();
    const pets = await Pet.find({ owner: userId }).lean();
    const Message = require('../models/Message');
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).lean();

    const exportData = {
      user: {
        ...user,
        password: undefined, // Don't export password
        twoFactorSecret: undefined // Don't export 2FA secret
      },
      pets,
      messages,
      exportedAt: new Date().toISOString()
    };

    logger.info('User data exported', { userId });

    res.json({
      success: true,
      data: exportData,
      message: 'User data exported successfully'
    });
  } catch (error: unknown) {
    logger.error('Failed to export user data', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (req: DeleteAccountRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Verify password before deletion
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
      return;
    }

    // Soft delete: mark as inactive instead of hard delete
    user.isActive = false;
    // Note: deletedAt should be added to User schema if needed, or use deletionRequestedAt
    if ('deletedAt' in user) {
      (user as typeof user & { deletedAt: Date }).deletedAt = new Date();
    }
    await user.save();

    // Also deactivate all user's pets
    await Pet.updateMany(
      { owner: userId },
      { isActive: false }
    );

    logger.info('User account deleted', { userId });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: unknown) {
    logger.error('Failed to delete account', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: getErrorMessage(error)
    });
  }
};

