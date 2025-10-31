/**
 * Notification Routes
 * Handles notification preferences, do-not-disturb, and push notification management
 */

import { Router } from 'express';
import type { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { sendPushToUser } from '../services/pushNotificationService';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/express';

const router = Router();

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
router.get('/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const NotificationPreference = (await import('../models/NotificationPreference')).default;
    let preferences = await NotificationPreference.findOne({ userId });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId,
        enabled: true,
        matches: true,
        messages: true,
        likes: true,
        reminders: true,
        frequency: 'instant',
        sound: true,
        vibration: true,
      });
    }

    res.json({ success: true, data: preferences });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error getting notification preferences:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
router.put('/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      enabled,
      matches,
      messages,
      likes,
      reminders,
      quietHours,
      frequency,
      sound,
      vibration,
    } = req.body;

    const NotificationPreference = (await import('../models/NotificationPreference')).default;
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        ...(enabled !== undefined && { enabled }),
        ...(matches !== undefined && { matches }),
        ...(messages !== undefined && { messages }),
        ...(likes !== undefined && { likes }),
        ...(reminders !== undefined && { reminders }),
        ...(quietHours && { quietHours }),
        ...(frequency && { frequency }),
        ...(sound !== undefined && { sound }),
        ...(vibration !== undefined && { vibration }),
      },
      { new: true, upsert: true },
    );

    logger.info('Notification preferences updated', { userId, preferences });

    res.json({ success: true, data: preferences });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/notifications/register-token
 * Register push notification token
 */
router.post('/register-token', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { token, platform, deviceId } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Add or update push token
    if (!user.pushTokens) {
      user.pushTokens = [];
    }

    // Remove existing token for this device if present
    const existingTokenIndex = user.pushTokens.findIndex(
      (t: { token: string; deviceId?: string }) => t.deviceId === deviceId,
    );

    const tokenData: { token: string; platform?: string; deviceId?: string; registeredAt?: Date } = {
      token,
      platform,
      deviceId,
      registeredAt: new Date(),
    };

    if (existingTokenIndex >= 0) {
      user.pushTokens[existingTokenIndex] = tokenData;
    } else {
      user.pushTokens.push(tokenData);
    }

    await user.save();

    // Update notification preferences with token
    const NotificationPreference = (await import('../models/NotificationPreference')).default;
    await NotificationPreference.findOneAndUpdate(
      { userId },
      { pushToken: token, 'deviceInfo.platform': platform },
      { upsert: true },
    );

    logger.info('Push token registered', { userId, deviceId, platform });

    res.json({ success: true, message: 'Token registered successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error registering push token:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * DELETE /api/notifications/unregister-token
 * Unregister push notification token
 */
router.delete('/unregister-token', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { deviceId } = req.body;

    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.pushTokens && deviceId) {
      user.pushTokens = user.pushTokens.filter(
        (t: { deviceId?: string }) => t.deviceId !== deviceId,
      );
      await user.save();
    }

    logger.info('Push token unregistered', { userId, deviceId });

    res.json({ success: true, message: 'Token unregistered successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error unregistering push token:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/notifications/test
 * Send test notification
 */
router.post('/test', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await sendPushToUser(userId, {
      title: 'Test Notification',
      body: 'This is a test notification from PawfectMatch',
      data: { type: 'test' },
    });

    res.json({ success: true, message: 'Test notification sent' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error sending test notification:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/notifications/is-quiet-hours
 * Check if current time is within quiet hours
 */
router.get('/is-quiet-hours', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const NotificationPreference = (await import('../models/NotificationPreference')).default;
    const preferences = await NotificationPreference.findOne({ userId });

    if (!preferences || !preferences.quietHours?.enabled) {
      return res.json({ success: true, isQuietHours: false });
    }

    const { quietHours } = preferences;
    if (!quietHours.enabled) {
      return res.json({ success: true, isQuietHours: false });
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let isQuietHours = false;

    // Handle quiet hours that span midnight
    if (startTime > endTime) {
      isQuietHours = currentMinutes >= startTime || currentMinutes < endTime;
    } else {
      isQuietHours = currentMinutes >= startTime && currentMinutes < endTime;
    }

    res.json({ success: true, isQuietHours });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error checking quiet hours:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
