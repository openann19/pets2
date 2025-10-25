/**
 * Admin Enhanced Features Routes
 * Handles admin management of biometric auth, leaderboard, and smart notifications
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth, requireAdmin } = require('../middleware/adminAuth');
const {
  getEnhancedFeaturesOverview,
  getBiometricManagement,
  removeUserBiometric,
  getLeaderboardManagement,
  resetLeaderboard,
  getNotificationManagement,
  updateUserNotifications,
  sendTestNotificationToUser
} = require('../controllers/adminEnhancedFeaturesController');

const router = express.Router();

// Apply admin authentication to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Validation rules
const resetLeaderboardValidation = [
  body('category').optional().isIn(['overall', 'streak', 'matches', 'engagement'])
    .withMessage('Invalid category'),
  body('timeframe').optional().isIn(['daily', 'weekly', 'monthly', 'allTime'])
    .withMessage('Invalid timeframe'),
  body('userId').optional().isMongoId().withMessage('Invalid user ID')
];

const updateNotificationsValidation = [
  body('enabled').optional().isBoolean().withMessage('Enabled must be a boolean'),
  body('matches').optional().isBoolean().withMessage('Matches must be a boolean'),
  body('messages').optional().isBoolean().withMessage('Messages must be a boolean'),
  body('likes').optional().isBoolean().withMessage('Likes must be a boolean'),
  body('reminders').optional().isBoolean().withMessage('Reminders must be a boolean'),
  body('frequency').optional().isIn(['instant', 'batched', 'daily'])
    .withMessage('Frequency must be one of: instant, batched, daily'),
  body('sound').optional().isBoolean().withMessage('Sound must be a boolean'),
  body('vibration').optional().isBoolean().withMessage('Vibration must be a boolean')
];

const testNotificationValidation = [
  body('type').optional().isString().withMessage('Type must be a string'),
  body('title').optional().isString().withMessage('Title must be a string'),
  body('body').optional().isString().withMessage('Body must be a string')
];

/**
 * @route   GET /api/admin/enhanced-features/overview
 * @desc    Get enhanced features overview
 * @access  Admin
 */
router.get('/overview', async (req, res) => {
  try {
    await getEnhancedFeaturesOverview(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get enhanced features overview',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/enhanced-features/biometric
 * @desc    Get biometric authentication management data
 * @access  Admin
 */
router.get('/biometric', async (req, res) => {
  try {
    await getBiometricManagement(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get biometric management data',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/enhanced-features/biometric/:userId
 * @desc    Remove user's biometric credential
 * @access  Admin
 */
router.delete('/biometric/:userId', async (req, res) => {
  try {
    await removeUserBiometric(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove biometric credential',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/enhanced-features/leaderboard
 * @desc    Get leaderboard management data
 * @access  Admin
 */
router.get('/leaderboard', async (req, res) => {
  try {
    await getLeaderboardManagement(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard management data',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/enhanced-features/leaderboard/reset
 * @desc    Reset leaderboard scores
 * @access  Admin
 */
router.post('/leaderboard/reset', resetLeaderboardValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await resetLeaderboard(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset leaderboard',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/enhanced-features/notifications
 * @desc    Get notification management data
 * @access  Admin
 */
router.get('/notifications', async (req, res) => {
  try {
    await getNotificationManagement(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get notification management data',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/enhanced-features/notifications/:userId
 * @desc    Update user's notification preferences
 * @access  Admin
 */
router.put('/notifications/:userId', updateNotificationsValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await updateUserNotifications(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/enhanced-features/notifications/test/:userId
 * @desc    Send test notification to user
 * @access  Admin
 */
router.post('/notifications/test/:userId', testNotificationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await sendTestNotificationToUser(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

module.exports = router;
