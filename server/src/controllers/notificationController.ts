import { Response } from 'express';
import NotificationPreference from '../models/NotificationPreference';
import Notification from '../models/Notification';
import logger from '../utils/logger';

/**
 * Request interfaces
 */
interface AuthenticatedRequest {
  userId: string;
  user?: any;
}

interface GetNotificationPreferencesRequest extends AuthenticatedRequest {}

interface UpdateNotificationPreferencesRequest extends AuthenticatedRequest {
  body: {
    enabled?: boolean;
    matches?: boolean;
    messages?: boolean;
    likes?: boolean;
    reminders?: boolean;
    frequency?: 'instant' | 'batched' | 'daily';
    sound?: boolean;
    vibration?: boolean;
    quietHours?: {
      enabled?: boolean;
      start?: string;
      end?: string;
    };
  };
}

interface SendTestNotificationRequest extends AuthenticatedRequest {
  body: {
    type?: string;
  };
}

interface GetNotificationHistoryRequest extends AuthenticatedRequest {
  query: {
    limit?: string;
    offset?: string;
    type?: string;
    unreadOnly?: string;
  };
}

interface MarkNotificationReadRequest extends AuthenticatedRequest {
  params: {
    notificationId: string;
  };
}

/**
 * Get user's notification preferences
 * @route GET /api/user/notifications/preferences
 * @access Private
 */
export const getNotificationPreferences = async (
  req: GetNotificationPreferencesRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    // Get user's notification preferences
    let preferences = await NotificationPreference.findOne({ userId });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = new NotificationPreference({
        userId,
        enabled: true,
        matches: true,
        messages: true,
        likes: true,
        reminders: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        frequency: 'instant',
        sound: true,
        vibration: true
      });

      await preferences.save();
    }

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    logger.error('Get notification preferences error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: (error as Error).message
    });
  }
};

/**
 * Update user's notification preferences
 * @route PUT /api/user/notifications/preferences
 * @access Private
 */
export const updateNotificationPreferences = async (
  req: UpdateNotificationPreferencesRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const preferencesData = req.body;

    // Validate required fields
    const requiredFields = ['enabled', 'matches', 'messages', 'likes', 'reminders', 'frequency', 'sound', 'vibration'];
    for (const field of requiredFields) {
      if (preferencesData[field as keyof typeof preferencesData] === undefined) {
        res.status(400).json({
          success: false,
          message: `Field '${field}' is required`
        });
        return;
      }
    }

    // Validate frequency
    const validFrequencies = ['instant', 'batched', 'daily'];
    if (!validFrequencies.includes(preferencesData.frequency || '')) {
      res.status(400).json({
        success: false,
        message: 'Frequency must be one of: instant, batched, daily'
      });
      return;
    }

    // Validate quiet hours
    if (preferencesData.quietHours) {
      const { enabled, start, end } = preferencesData.quietHours;
      if (enabled && (!start || !end)) {
        res.status(400).json({
          success: false,
          message: 'Quiet hours start and end times are required when enabled'
        });
        return;
      }
    }

    // Update or create notification preferences
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        ...preferencesData,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    logger.info('Notification preferences updated', { userId });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });

  } catch (error) {
    logger.error('Update notification preferences error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: (error as Error).message
    });
  }
};

/**
 * Send test notification
 * @route POST /api/notifications/test
 * @access Private
 */
export const sendTestNotification = async (
  req: SendTestNotificationRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { type = 'test' } = req.body;

    // Get user's notification preferences
    const preferences = await NotificationPreference.findOne({ userId });
    
    if (!preferences || !preferences.enabled) {
      res.status(400).json({
        success: false,
        message: 'Notifications are disabled for this user'
      });
      return;
    }

    // Check if we're in quiet hours
    if (preferences.quietHours && preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseTime(preferences.quietHours.start || '22:00');
      const endTime = parseTime(preferences.quietHours.end || '08:00');

      if (isInQuietHours(currentTime, startTime, endTime)) {
        res.status(400).json({
          success: false,
          message: 'Cannot send notification during quiet hours'
        });
        return;
      }
    }

    // Create test notification in database
    const notification = await Notification.create({
      userId,
      type,
      title: 'Test Notification',
      body: 'This is a test notification from PawfectMatch',
      data: {
        test: true,
        timestamp: new Date().toISOString()
      },
      priority: 'normal',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // In a real implementation, you would also send this via push notification service
    logger.info('Test notification created and sent', { userId, type, notificationId: notification._id });

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: {
        notificationId: notification._id,
        notification
      }
    });

  } catch (error) {
    logger.error('Send test notification error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: (error as Error).message
    });
  }
};

/**
 * Get notification history for user
 * @route GET /api/user/notifications/history
 * @access Private
 */
export const getNotificationHistory = async (
  req: GetNotificationHistoryRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { limit = '20', offset = '0', type, unreadOnly } = req.query;

    // Build query
    const query: any = { userId };
    if (type) query.type = type;
    if (unreadOnly === 'true') query.read = false;

    // Fetch notifications from database
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      (Notification as any).getUnreadCount ? (Notification as any).getUnreadCount(userId) : 0
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        total,
        unread: unreadCount,
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Get notification history error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get notification history',
      error: (error as Error).message
    });
  }
};

/**
 * Mark notification as read
 * @route PUT /api/user/notifications/:notificationId/read
 * @access Private
 */
export const markNotificationRead = async (
  req: MarkNotificationReadRequest,
  res: Response
): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    // Find and update notification
    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    await (notification as any).markAsRead();
    logger.info('Notification marked as read', { userId, notificationId });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    logger.error('Mark notification read error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: (error as Error).message
    });
  }
};

/**
 * Helper functions
 */

/**
 * Parse time string (HH:mm) to minutes
 */
function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if current time is in quiet hours
 */
function isInQuietHours(currentTime: number, startTime: number, endTime: number): boolean {
  if (startTime <= endTime) {
    // Same day quiet hours (e.g., 22:00 to 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    // Overnight quiet hours (e.g., 22:00 to 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
}
