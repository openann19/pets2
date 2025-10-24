/**
 * Moderator Notification Service
 * Sends alerts to moderators when queue exceeds threshold
 */

const logger = require('../utils/logger');
const { sendAdminNotification } = require('../src/services/adminNotificationService');

/**
 * Check queue size and send notification if needed
 * @param {number} queueSize - Current moderation queue size
 * @param {number} threshold - Threshold to trigger notification (default: 50)
 */
async function checkQueueAndNotify(queueSize, threshold = 50) {
  try {
    if (queueSize > threshold) {
      await sendAdminNotification({
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
      });

      logger.info('Moderator queue notification sent', { queueSize, threshold });
    }
  } catch (error) {
    logger.error('Failed to send moderator notification', {
      error: error.message,
      queueSize
    });
    // Don't throw - notification failure shouldn't break upload flow
  }
}

/**
 * Send notification for urgent/high-priority items
 * @param {Object} moderation - Moderation record
 */
async function notifyUrgentItem(moderation) {
  try {
    await sendAdminNotification({
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
    });

    logger.info('Urgent item notification sent', {
      moderationId: moderation._id,
      priority: moderation.priority
    });
  } catch (error) {
    logger.error('Failed to send urgent item notification', {
      error: error.message,
      moderationId: moderation._id
    });
  }
}

module.exports = {
  checkQueueAndNotify,
  notifyUrgentItem
};
