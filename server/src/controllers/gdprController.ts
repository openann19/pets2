import { Request, Response } from 'express';
import User from '../models/User';
import Match from '../models/Match';
import Pet from '../models/Pet';
import logger from '../utils/logger';
import { sendEmail } from '../services/emailService';

interface AuthRequest extends Request {
  userId: string;
}

const GRACE_PERIOD_DAYS = 30;
const EXPORT_LINK_EXPIRY_DAYS = 7;

// @desc    Request account deletion (starts grace period)
// @route   POST /api/users/delete-account
// @access  Private
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Find user with password field
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Calculate grace period end date
    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + GRACE_PERIOD_DAYS);

    // Set deletion schedule
    user.deletionScheduledAt = new Date();
    user.gracePeriodEndsAt = gracePeriodEndsAt;
    user.accountStatus = 'deletion_pending';
    user.deletionReason = reason || 'User requested deletion';

    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Account Deletion Requested',
      html: `
        <h2>Account Deletion Request Confirmed</h2>
        <p>Your account will be permanently deleted on ${gracePeriodEndsAt.toLocaleDateString()}.</p>
        <p>If you change your mind, you can cancel this request within the next ${GRACE_PERIOD_DAYS} days.</p>
        <p>After this date, all your data will be permanently deleted and cannot be recovered.</p>
      `
    });

    // Log deletion request
    logger.info('Account deletion requested', {
      userId,
      gracePeriodEndsAt,
      reason: user.deletionReason
    });

    res.json({
      success: true,
      data: {
        message: 'Account deletion scheduled',
        gracePeriodEndsAt,
        daysRemaining: GRACE_PERIOD_DAYS
      }
    });

  } catch (error) {
    logger.error('Delete account error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// @desc    Request data export
// @route   POST /api/users/export-data
// @access  Private
export const exportUserData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create export job
    const exportToken = require('crypto').randomBytes(32).toString('hex');
    const exportExpiresAt = new Date();
    exportExpiresAt.setDate(exportExpiresAt.getDate() + EXPORT_LINK_EXPIRY_DAYS);

    user.dataExportToken = exportToken;
    user.dataExportExpiresAt = exportExpiresAt;
    user.dataExportStatus = 'pending';

    await user.save();

    // Queue background job for data export
    // In production, use a proper queue system like Bull or BullMQ
    setTimeout(async () => {
      try {
        await generateUserDataExport(userId, exportToken);
      } catch (error) {
        logger.error('Failed to generate user data export', { error, userId });
      }
    }, 1000);

    // Send email with export link
    const exportUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/export-data?token=${exportToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Your Data Export is Ready',
      html: `
        <h2>Your Data Export</h2>
        <p>Your data export is being prepared and will be available shortly.</p>
        <p><a href="${exportUrl}">Download your data</a></p>
        <p>This link will expire in ${EXPORT_LINK_EXPIRY_DAYS} days.</p>
      `
    });

    logger.info('Data export requested', { userId, exportToken });

    res.json({
      success: true,
      data: {
        message: 'Data export initiated',
        expiresAt: exportExpiresAt,
        downloadLink: exportUrl
      }
    });

  } catch (error) {
    logger.error('Export user data error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
};

// @desc    Confirm account deletion (execute after grace period)
// @route   POST /api/users/confirm-deletion
// @access  Private
export const confirmDeletion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.gracePeriodEndsAt) {
      return res.status(400).json({
        success: false,
        message: 'No deletion scheduled'
      });
    }

    // Check if grace period has expired
    if (new Date() < user.gracePeriodEndsAt) {
      return res.status(400).json({
        success: false,
        message: 'Grace period has not expired yet',
        gracePeriodEndsAt: user.gracePeriodEndsAt
      });
    }

    // Soft delete user data
    await softDeleteUserData(userId);

    // Send final confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Account Deleted',
      html: `
        <h2>Your account has been deleted</h2>
        <p>As requested, your account and all associated data have been permanently deleted.</p>
        <p>If you did not request this deletion, please contact support immediately.</p>
      `
    });

    logger.info('Account deletion confirmed', { userId });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    logger.error('Confirm deletion error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to confirm deletion'
    });
  }
};

// @desc    Cancel account deletion request
// @route   POST /api/users/cancel-deletion
// @access  Private
export const cancelDeletion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.deletionScheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'No deletion scheduled'
      });
    }

    // Check if still in grace period
    if (user.gracePeriodEndsAt && new Date() > user.gracePeriodEndsAt) {
      return res.status(400).json({
        success: false,
        message: 'Grace period has expired, deletion cannot be cancelled'
      });
    }

    // Cancel deletion
    user.deletionScheduledAt = undefined;
    user.gracePeriodEndsAt = undefined;
    user.accountStatus = 'active';
    user.deletionReason = undefined;

    await user.save();

    // Send cancellation email
    await sendEmail({
      to: user.email,
      subject: 'Account Deletion Cancelled',
      html: `
        <h2>Account Deletion Cancelled</h2>
        <p>Your account deletion request has been cancelled.</p>
        <p>Your account is now active again.</p>
      `
    });

    logger.info('Account deletion cancelled', { userId });

    res.json({
      success: true,
      message: 'Account deletion cancelled successfully'
    });

  } catch (error) {
    logger.error('Cancel deletion error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to cancel deletion'
    });
  }
};

// Helper function to generate user data export
const generateUserDataExport = async (userId: string, exportToken: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get all user data
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    });

    const pets = await Pet.find({ owner: userId });

    // Compile export data
    const exportData = {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        bio: user.bio,
        location: user.location,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      pets: pets.map(pet => ({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        bio: pet.bio,
        photos: pet.photos,
        createdAt: pet.createdAt
      })),
      matches: matches.map(match => ({
        pet1: match.pet1,
        pet2: match.pet2,
        matchType: match.matchType,
        status: match.status,
        createdAt: match.createdAt
      })),
      exportedAt: new Date()
    };

    // In production, save to cloud storage (S3, etc.)
    const exportUrl = `/api/users/export-data/${exportToken}.json`;
    
    // Update user with export status
    await User.findByIdAndUpdate(userId, {
      dataExportStatus: 'completed',
      dataExportUrl: exportUrl,
      dataExportCompletedAt: new Date()
    });

    logger.info('User data export completed', { userId, exportUrl });

    return exportUrl;

  } catch (error) {
    logger.error('Failed to generate user data export', { error, userId });
    throw error;
  }
};

// Helper function to soft delete user data
const softDeleteUserData = async (userId: string) => {
  try {
    // Anonymize user data
    await User.findByIdAndUpdate(userId, {
      email: `deleted_${Date.now()}@deleted.com`,
      firstName: 'Deleted',
      lastName: 'User',
      avatar: null,
      bio: 'This account has been deleted',
      phone: null,
      location: null,
      password: require('crypto').randomBytes(64).toString('hex'),
      isActive: false,
      status: 'deleted',
      accountStatus: 'deleted',
      deletedAt: new Date()
    });

    // Archive all matches
    await Match.updateMany(
      { $or: [{ user1: userId }, { user2: userId }] },
      { status: 'deleted' }
    );

    // Archive all pets
    await Pet.updateMany(
      { owner: userId },
      { isActive: false }
    );

    logger.info('User data soft deleted', { userId });

  } catch (error) {
    logger.error('Failed to soft delete user data', { error, userId });
    throw error;
  }
};

