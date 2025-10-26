/**
 * Push Token Controller
 * Handles push notification token registration for mobile devices
 */

const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Register push notification token for device
 * @route POST /api/notifications/register-token
 * @access Private
 */
const registerPushToken = async (req, res) => {
  try {
    const userId = req.userId;
    const { token, platform, deviceId } = req.body;

    // Validate required fields
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize pushTokens array if it doesn't exist
 if (!user.pushTokens) {
      user.pushTokens = [];
    }

    // Check if token already exists for this device
    const existingTokenIndex = user.pushTokens.findIndex(
      pt => pt.deviceId === deviceId && pt.platform === platform
    );

    const pushTokenData = {
      token,
      platform: platform || 'unknown',
      deviceId: deviceId || `device_${Date.now()}`,
      registeredAt: new Date(),
      lastUsedAt: new Date()
    };

    if (existingTokenIndex >= 0) {
      // Update existing token
      user.pushTokens[existingTokenIndex] = pushTokenData;
      logger.info('Updated push token for device', { userId, deviceId, platform });
    } else {
      // Add new token
      user.pushTokens.push(pushTokenData);
      logger.info('Registered new push token', { userId, deviceId, platform });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Push token registered successfully',
      data: {
        deviceId: pushTokenData.deviceId,
        platform: pushTokenData.platform
      }
    });

  } catch (error) {
    logger.error('Register push token error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to register push token',
      error: error.message
    });
  }
};

/**
 * Unregister push notification token for device
 * @route DELETE /api/notifications/unregister-token
 * @access Private
 */
const unregisterPushToken = async (req, res) => {
  try {
    const userId = req.userId;
    const { deviceId, token } = req.body;

    if (!deviceId && !token) {
      return res.status(400).json({
        success: false,
        message: 'deviceId or token is required'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove matching tokens
    if (deviceId) {
      user.pushTokens = user.pushTokens.filter(pt => pt.deviceId !== deviceId);
      logger.info('Unregistered push token by deviceId', { userId, deviceId });
    } else if (token) {
      user.pushTokens = user.pushTokens.filter(pt => pt.token !== token);
      logger.info('Unregistered push token by token', { userId });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Push token unregistered successfully'
    });

  } catch (error) {
    logger.error('Unregister push token error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to unregister push token',
      error: error.message
    });
  }
};

module.exports = {
  registerPushToken,
  unregisterPushToken
};

