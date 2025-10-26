import { Response } from 'express';
import User from '../models/User';
import logger from '../utils/logger';
import { AuthRequest } from '../types/express';

/**
 * Request interfaces
 */
interface RegisterPushTokenRequest extends AuthRequest {
  body: {
    token: string;
    platform?: string;
    deviceId?: string;
  };
}

interface UnregisterPushTokenRequest extends AuthRequest {
  body: {
    deviceId?: string;
    token?: string;
  };
}

/**
 * Push token data structure
 */
interface PushTokenData {
  token: string;
  platform: string;
  deviceId: string;
  registeredAt: Date;
  lastUsedAt: Date;
}

/**
 * Register push notification token for device
 * @route POST /api/notifications/register-token
 * @access Private
 */
export const registerPushToken = async (req: RegisterPushTokenRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { token, platform, deviceId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Validate required fields
    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
      return;
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Initialize pushTokens array if it doesn't exist
    if (!user.pushTokens) {
      (user as any).pushTokens = [];
    }

    // Check if token already exists for this device
    const existingTokenIndex = user.pushTokens.findIndex(
      (pt: PushTokenData) => pt.deviceId === deviceId && pt.platform === platform
    );

    const pushTokenData: PushTokenData = {
      token,
      platform: platform || 'unknown',
      deviceId: deviceId || `device_${Date.now()}`,
      registeredAt: new Date(),
      lastUsedAt: new Date()
    };

    if (existingTokenIndex >= 0) {
      // Update existing token
      user.pushTokens[existingTokenIndex] = pushTokenData as any;
      logger.info('Updated push token for device', { userId, deviceId, platform });
    } else {
      // Add new token
      (user.pushTokens as any).push(pushTokenData);
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

  } catch (error: any) {
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
export const unregisterPushToken = async (req: UnregisterPushTokenRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { deviceId, token } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!deviceId && !token) {
      res.status(400).json({
        success: false,
        message: 'deviceId or token is required'
      });
      return;
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Remove matching tokens
    if (deviceId) {
      (user as any).pushTokens = user.pushTokens.filter((pt: PushTokenData) => pt.deviceId !== deviceId);
      logger.info('Unregistered push token by deviceId', { userId, deviceId });
    } else if (token) {
      (user as any).pushTokens = user.pushTokens.filter((pt: PushTokenData) => pt.token !== token);
      logger.info('Unregistered push token by token', { userId });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Push token unregistered successfully'
    });

  } catch (error: any) {
    logger.error('Unregister push token error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to unregister push token',
      error: error.message
    });
  }
};

