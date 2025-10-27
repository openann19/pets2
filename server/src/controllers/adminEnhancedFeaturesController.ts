/**
 * Admin Enhanced Features Controller
 * Manages biometric auth, leaderboard, and smart notifications from admin console
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import User from '../models/User';
const BiometricCredential = require('../models/BiometricCredential');
const LeaderboardScore = require('../models/LeaderboardScore');
const NotificationPreference = require('../models/NotificationPreference');
import logger from '../utils/logger';
import { getErrorMessage } from '../../utils/errorHandler';

/**
 * Request interfaces
 */
interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: IUserDocument;
}

interface GetManagementRequest extends AuthenticatedRequest {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    timeframe?: string;
  };
}

interface RemoveBiometricRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
}

interface UpdateNotificationsRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
  body: Record<string, unknown>;
}

interface SendTestNotificationRequest extends AuthenticatedRequest {
  params: {
    userId: string;
  };
  body: {
    type?: string;
    title?: string;
    body?: string;
  };
}

interface ResetLeaderboardRequest extends AuthenticatedRequest {
  body: {
    category?: string;
    timeframe?: string;
    userId?: string;
  };
}

/**
 * Helper functions return types
 */
interface BiometricStats {
  totalUsers: number;
  biometricUsers: number;
  adoptionRate: number;
  recentRegistrations: Array<{ userId: string; createdAt: Date; [key: string]: unknown }>;
}

interface LeaderboardStats {
  totalScores: number;
  categories: string[];
  timeframes: string[];
  topScores: Array<{ userId: string; score: number; [key: string]: unknown }>;
}

interface NotificationStats {
  totalUsers: number;
  notificationUsers: number;
  enabledUsers: number;
  quietHoursUsers: number;
  adoptionRate: number;
}

/**
 * Get enhanced features overview
 * @route GET /api/admin/enhanced-features/overview
 * @access Admin
 */
export const getEnhancedFeaturesOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      biometricStats,
      leaderboardStats,
      notificationStats,
      recentActivity
    ] = await Promise.all([
      getBiometricStats(),
      getLeaderboardStats(),
      getNotificationStats(),
      getRecentActivity()
    ]);

    res.json({
      success: true,
      data: {
        biometric: biometricStats,
        leaderboard: leaderboardStats,
        notifications: notificationStats,
        recentActivity
      }
    });
  } catch (error: unknown) {
    logger.error('Enhanced features overview error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get enhanced features overview',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Manage biometric authentication settings
 * @route GET /api/admin/enhanced-features/biometric
 * @access Admin
 */
export const getBiometricManagement = async (
  req: GetManagementRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    let query: Record<string, unknown> = {};
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    // Get biometric credentials with user info
    const credentials = await BiometricCredential.find(query)
      .populate('userId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await BiometricCredential.countDocuments(query);

    res.json({
      success: true,
      data: {
        credentials,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: unknown) {
    logger.error('Biometric management error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get biometric management data',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Remove user's biometric credential
 * @route DELETE /api/admin/enhanced-features/biometric/:userId
 * @access Admin
 */
export const removeUserBiometric = async (
  req: RemoveBiometricRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const credential = await BiometricCredential.findOneAndDelete({ userId });
    
    if (!credential) {
      res.status(404).json({
        success: false,
        message: 'No biometric credential found for this user'
      });
      return;
    }

    logger.info('Admin removed biometric credential', { 
      adminId: req.userId, 
      targetUserId: userId 
    });

    res.json({
      success: true,
      message: 'Biometric credential removed successfully'
    });
  } catch (error: unknown) {
    logger.error('Remove user biometric error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to remove biometric credential',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Manage leaderboard settings
 * @route GET /api/admin/enhanced-features/leaderboard
 * @access Admin
 */
export const getLeaderboardManagement = async (
  req: GetManagementRequest,
  res: Response
): Promise<void> => {
  try {
    const { category = 'overall', timeframe = 'weekly' } = req.query;

    // Get top performers
    const topPerformers = await LeaderboardScore.find({ category, timeframe })
      .populate('userId', 'firstName lastName email avatar')
      .sort({ score: -1 })
      .limit(50);

    // Get category statistics
    const categoryStats = await LeaderboardScore.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' }
        }
      }
    ]);

    // Get timeframe statistics
    const timeframeStats = await LeaderboardScore.aggregate([
      {
        $group: {
          _id: '$timeframe',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        topPerformers,
        categoryStats,
        timeframeStats,
        currentCategory: category,
        currentTimeframe: timeframe
      }
    });
  } catch (error: unknown) {
    logger.error('Leaderboard management error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard management data',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Reset leaderboard scores
 * @route POST /api/admin/enhanced-features/leaderboard/reset
 * @access Admin
 */
export const resetLeaderboard = async (
  req: ResetLeaderboardRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, timeframe, userId } = req.body;

    let query: Record<string, string> = {};
    if (category) query.category = category;
    if (timeframe) query.timeframe = timeframe;
    if (userId) query.userId = userId;

    const result = await LeaderboardScore.deleteMany(query);

    logger.info('Admin reset leaderboard', { 
      adminId: req.userId, 
      query,
      deletedCount: result.deletedCount 
    });

    res.json({
      success: true,
      message: `Leaderboard reset successfully. ${result.deletedCount} entries removed.`
    });
  } catch (error: unknown) {
    logger.error('Reset leaderboard error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to reset leaderboard',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Manage notification settings
 * @route GET /api/admin/enhanced-features/notifications
 * @access Admin
 */
export const getNotificationManagement = async (
  req: GetManagementRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    let query: Record<string, unknown> = {};
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    // Get notification preferences with user info
    const preferences = await NotificationPreference.find(query)
      .populate('userId', 'firstName lastName email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await NotificationPreference.countDocuments(query);

    // Get notification statistics
    const notificationStats = await NotificationPreference.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          enabledUsers: { $sum: { $cond: ['$enabled', 1, 0] } },
          matchesEnabled: { $sum: { $cond: ['$matches', 1, 0] } },
          messagesEnabled: { $sum: { $cond: ['$messages', 1, 0] } },
          likesEnabled: { $sum: { $cond: ['$likes', 1, 0] } },
          remindersEnabled: { $sum: { $cond: ['$reminders', 1, 0] } },
          quietHoursEnabled: { $sum: { $cond: ['$quietHours.enabled', 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        preferences,
        stats: notificationStats[0] || {},
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: unknown) {
    logger.error('Notification management error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get notification management data',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Update user's notification preferences
 * @route PUT /api/admin/enhanced-features/notifications/:userId
 * @access Admin
 */
export const updateUserNotifications = async (
  req: UpdateNotificationsRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update notification preferences
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId },
      { ...updates, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    logger.info('Admin updated user notifications', { 
      adminId: req.userId, 
      targetUserId: userId,
      updates 
    });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });
  } catch (error: unknown) {
    logger.error('Update user notifications error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Send test notification to user
 * @route POST /api/admin/enhanced-features/notifications/test/:userId
 * @access Admin
 */
export const sendTestNotificationToUser = async (
  req: SendTestNotificationRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { type = 'admin_test', title, body } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user has notifications enabled
    const preferences = await NotificationPreference.findOne({ userId });
    if (!preferences || !preferences.enabled) {
      res.status(400).json({
        success: false,
        message: 'User has notifications disabled'
      });
      return;
    }

    // Create test notification
    const notification = {
      userId,
      type,
      title: title || 'Admin Test Notification',
      body: body || 'This is a test notification sent from the admin console',
      data: {
        adminSent: true,
        adminId: req.userId,
        timestamp: new Date().toISOString()
      },
      createdAt: new Date()
    };

    // In a real implementation, you would send this via push notification service
    logger.info('Admin sent test notification', { 
      adminId: req.userId, 
      targetUserId: userId,
      notification 
    });

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: {
        notificationId: `admin_test_${Date.now()}`,
        notification
      }
    });
  } catch (error: unknown) {
    logger.error('Send test notification error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: getErrorMessage(error)
    });
  }
};

// Helper functions

const getBiometricStats = async (): Promise<BiometricStats> => {
  const totalUsers = await User.countDocuments({ isActive: true });
  const biometricUsers = await BiometricCredential.countDocuments();
  
  const recentRegistrations = await BiometricCredential.find()
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalUsers,
    biometricUsers,
    adoptionRate: totalUsers > 0 ? Math.round((biometricUsers / totalUsers) * 100) : 0,
    recentRegistrations
  };
};

const getLeaderboardStats = async (): Promise<LeaderboardStats> => {
  const totalScores = await LeaderboardScore.countDocuments();
  const categories = await LeaderboardScore.distinct('category');
  const timeframes = await LeaderboardScore.distinct('timeframe');

  const topScores = await LeaderboardScore.find()
    .populate('userId', 'firstName lastName email')
    .sort({ score: -1 })
    .limit(10);

  return {
    totalScores,
    categories,
    timeframes,
    topScores
  };
};

const getNotificationStats = async (): Promise<NotificationStats> => {
  const totalUsers = await User.countDocuments({ isActive: true });
  const notificationUsers = await NotificationPreference.countDocuments();
  
  const enabledUsers = await NotificationPreference.countDocuments({ enabled: true });
  const quietHoursUsers = await NotificationPreference.countDocuments({ 'quietHours.enabled': true });

  return {
    totalUsers,
    notificationUsers,
    enabledUsers,
    quietHoursUsers,
    adoptionRate: totalUsers > 0 ? Math.round((notificationUsers / totalUsers) * 100) : 0
  };
};

const getRecentActivity = async (): Promise<Array<{ userId: string; [key: string]: unknown }>> => {
  const recentBiometric = await BiometricCredential.find()
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentScores = await LeaderboardScore.find()
    .populate('userId', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .limit(5);

  const recentNotifications = await NotificationPreference.find()
    .populate('userId', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .limit(5);

  return {
    biometric: recentBiometric,
    leaderboard: recentScores,
    notifications: recentNotifications
  };
};

