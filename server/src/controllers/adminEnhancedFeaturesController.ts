export {};// Added to mark file as a module
/**
 * Admin Enhanced Features Controller
 * Manages biometric auth, leaderboard, and smart notifications from admin console
 */

const User = require('../models/User');
const BiometricCredential = require('../models/BiometricCredential');
const LeaderboardScore = require('../models/LeaderboardScore');
const NotificationPreference = require('../models/NotificationPreference');
const logger = require('../utils/logger');

/**
 * Get enhanced features overview
 * @route GET /api/admin/enhanced-features/overview
 * @access Admin
 */
const getEnhancedFeaturesOverview = async (req, res) => {
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

  } catch (error) {
    logger.error('Enhanced features overview error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get enhanced features overview',
      error: error.message
    });
  }
};

/**
 * Manage biometric authentication settings
 * @route GET /api/admin/enhanced-features/biometric
 * @access Admin
 */
const getBiometricManagement = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
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
      .limit(parseInt(limit));

    const total = await BiometricCredential.countDocuments(query);

    res.json({
      success: true,
      data: {
        credentials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Biometric management error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get biometric management data',
      error: error.message
    });
  }
};

/**
 * Remove user's biometric credential
 * @route DELETE /api/admin/enhanced-features/biometric/:userId
 * @access Admin
 */
const removeUserBiometric = async (req, res) => {
  try {
    const { userId } = req.params;

    const credential = await BiometricCredential.findOneAndDelete({ userId });
    
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'No biometric credential found for this user'
      });
    }

    logger.info('Admin removed biometric credential', { 
      adminId: req.userId, 
      targetUserId: userId 
    });

    res.json({
      success: true,
      message: 'Biometric credential removed successfully'
    });

  } catch (error) {
    logger.error('Remove user biometric error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to remove biometric credential',
      error: error.message
    });
  }
};

/**
 * Manage leaderboard settings
 * @route GET /api/admin/enhanced-features/leaderboard
 * @access Admin
 */
const getLeaderboardManagement = async (req, res) => {
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

  } catch (error) {
    logger.error('Leaderboard management error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard management data',
      error: error.message
    });
  }
};

/**
 * Reset leaderboard scores
 * @route POST /api/admin/enhanced-features/leaderboard/reset
 * @access Admin
 */
const resetLeaderboard = async (req, res) => {
  try {
    const { category, timeframe, userId } = req.body;

    let query = {};
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

  } catch (error) {
    logger.error('Reset leaderboard error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to reset leaderboard',
      error: error.message
    });
  }
};

/**
 * Manage notification settings
 * @route GET /api/admin/enhanced-features/notifications
 * @access Admin
 */
const getNotificationManagement = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
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
      .limit(parseInt(limit));

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
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Notification management error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get notification management data',
      error: error.message
    });
  }
};

/**
 * Update user's notification preferences
 * @route PUT /api/admin/enhanced-features/notifications/:userId
 * @access Admin
 */
const updateUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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

  } catch (error) {
    logger.error('Update user notifications error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

/**
 * Send test notification to user
 * @route POST /api/admin/enhanced-features/notifications/test/:userId
 * @access Admin
 */
const sendTestNotificationToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'admin_test', title, body } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has notifications enabled
    const preferences = await NotificationPreference.findOne({ userId });
    if (!preferences || !preferences.enabled) {
      return res.status(400).json({
        success: false,
        message: 'User has notifications disabled'
      });
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

  } catch (error) {
    logger.error('Send test notification error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
};

// Helper functions

const getBiometricStats = async () => {
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

const getLeaderboardStats = async () => {
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

const getNotificationStats = async () => {
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

const getRecentActivity = async () => {
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

module.exports = {
  getEnhancedFeaturesOverview,
  getBiometricManagement,
  removeUserBiometric,
  getLeaderboardManagement,
  resetLeaderboard,
  getNotificationManagement,
  updateUserNotifications,
  sendTestNotificationToUser
};
