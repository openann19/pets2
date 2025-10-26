/**
 * Smart Notifications Routes
 * Handles notification preferences and delivery
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification,
  getNotificationHistory,
  markNotificationRead
} = require('../controllers/notificationController');

// Add push token registration controllers
const registerPushToken = require('../controllers/pushTokenController').registerPushToken;
const unregisterPushToken = require('../controllers/pushTokenController').unregisterPushToken;

const router = express.Router();

// Validation rules
const updatePreferencesValidation = [
  body('enabled').isBoolean().withMessage('Enabled must be a boolean'),
  body('matches').isBoolean().withMessage('Matches must be a boolean'),
  body('messages').isBoolean().withMessage('Messages must be a boolean'),
  body('likes').isBoolean().withMessage('Likes must be a boolean'),
  body('reminders').isBoolean().withMessage('Reminders must be a boolean'),
  body('frequency').isIn(['instant', 'batched', 'daily'])
    .withMessage('Frequency must be one of: instant, batched, daily'),
  body('sound').isBoolean().withMessage('Sound must be a boolean'),
  body('vibration').isBoolean().withMessage('Vibration must be a boolean'),
  body('quietHours.enabled').optional().isBoolean()
    .withMessage('Quiet hours enabled must be a boolean'),
  body('quietHours.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours start must be in HH:mm format'),
  body('quietHours.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours end must be in HH:mm format')
];

const testNotificationValidation = [
  body('type').optional().isString().withMessage('Type must be a string')
];

/**
 * @route   GET /api/user/notifications/preferences
 * @desc    Get user's notification preferences
 * @access  Private
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    await getNotificationPreferences(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/user/notifications/preferences
 * @desc    Update user's notification preferences
 * @access  Private
 */
router.put('/preferences', authenticateToken, updatePreferencesValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await updateNotificationPreferences(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification
 * @access  Private
 */
router.post('/test', authenticateToken, testNotificationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await sendTestNotification(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/user/notifications/history
 * @desc    Get notification history for user
 * @access  Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    await getNotificationHistory(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get notification history',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/user/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    await markNotificationRead(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/register-token
 * @desc    Register push notification token for device
 * @access  Private
 */
router.post('/register-token', authenticateToken, async (req, res) => {
  try {
    await registerPushToken(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register push token',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/notifications/unregister-token
 * @desc    Unregister push notification token for device
 * @access  Private
 */
router.delete('/unregister-token', authenticateToken, async (req, res) => {
  try {
    await unregisterPushToken(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unregister push token',
      error: error.message
    });
  }
});

module.exports = router;
