/**
 * Moderator Notification Service
 * Sends alerts to moderators when queue exceeds threshold
 */

import logger from '../src/utils/logger';
import { sendAdminNotification } from '../src/services/adminNotificationService';

interface NotificationData {
  type: string;
  severity: string;
  title: string;
  message: string;
  metadata: {
    queueSize?: number;
    threshold?: number;
    url?: string;
    timestamp?: string;
    moderationId?: any;
    userId?: any;
    priority?: string;
    uploadedAt?: Date;
  };
}

interface ModerationRecord {
  _id: any;
  userId: any;
  priority: string;
  uploadedAt: Date;
}

/**
 * Check queue size and send notification if needed
 * @param {number} queueSize - Current moderation queue size
 * @param {number} threshold - Threshold to trigger notification (default: 50)
 */
export async function checkQueueAndNotify(queueSize: number, threshold: number = 50): Promise<void> {
  try {
    if (queueSize > threshold) {
      const notification: NotificationData = {
        type: 'warning',
        severity: queueSize > threshold * 2 ? 'high' : 'medium',
        title: `Moderation Queue Alert: ${queueSize} Pending Items`,
        message: `The moderation queue has ${queueSize} pending photos awaiting review. Please review items to prevent user delays.`,
        metadata: {
          queueSize,
          threshold,
          url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/moderation`,
          timestamp: new Date().toISOString()
        }
      };

      await sendAdminNotification(notification);

      logger.info('Moderator queue notification sent', { queueSize, threshold });
    }
  } catch (error: any) {
    logger.error('Failed to send moderator notification', {
      error: error.message,
      queueSize
    });
    // Don't throw - notification failure shouldn't break upload flow
  }
}

/**
 * Send notification for urgent/high-priority items
 * @param {ModerationRecord} moderation - Moderation record
 */
export async function notifyUrgentItem(moderation: ModerationRecord): Promise<void> {
  try {
    const notification: NotificationData = {
      type: 'warning',
      severity: 'high',
      title: 'Urgent Moderation Item',
      message: `A high-priority photo from user ${moderation.userId} requires immediate review.`,
      metadata: {
        moderationId: moderation._id,
        userId: moderation.userId,
        priority: moderation.priority,
        uploadedAt: moderation.uploadedAt,
        url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/moderation`
      }
    };

    await sendAdminNotification(notification);

    logger.info('Urgent item notification sent', {
      moderationId: moderation._id,
      priority: moderation.priority
    });
  } catch (error: any) {
    logger.error('Failed to send urgent item notification', {
      error: error.message,
      moderationId: moderation._id
    });
  }
}

export default {
  checkQueueAndNotify,
  notifyUrgentItem
};

