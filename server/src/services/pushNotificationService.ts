import fetch from 'node-fetch';
import logger from '../utils/logger';

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

/**
 * Send push notification via FCM
 */
export async function sendPushNotification(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const serverKey = process.env.FCM_SERVER_KEY;
    
    if (!serverKey) {
      logger.warn('FCM_SERVER_KEY not configured, skipping push notification');
      return false;
    }

    const response = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.imageUrl,
          sound: payload.sound || 'default',
          badge: payload.badge,
        },
        data: payload.data,
        priority: 'high',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('FCM push notification failed', {
        status: response.status,
        error: errorText,
      });
      return false;
    }

    logger.info('Push notification sent successfully', {
      tokenCount: tokens.length,
      title: payload.title,
    });

    return true;
  } catch (error) {
    logger.error('Push notification error', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    return false;
  }
}

/**
 * Send push notification to user's devices
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  try {
    const User = (await import('../models/User')).default;
    const user = await User.findById(userId).select('pushTokens').lean();

    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      logger.debug('User has no push tokens', { userId });
      return;
    }

    const tokens = user.pushTokens.map((token: any) => token.token).filter(Boolean);

    if (tokens.length === 0) {
      logger.debug('No valid push tokens found', { userId });
      return;
    }

    await sendPushNotification(tokens, payload);
  } catch (error) {
    logger.error('Failed to send push to user', {
      userId,
      error: (error as Error).message,
    });
  }
}

/**
 * Notify users when someone goes live
 */
export async function notifyGoLive(
  followerIds: string[],
  broadcasterName: string,
  roomName: string
): Promise<void> {
  const payload: PushNotificationPayload = {
    title: '🎥 LIVE NOW',
    body: `${broadcasterName} just went live`,
    data: {
      type: 'live_stream_started',
      roomName,
      broadcasterName,
    },
    imageUrl: undefined, // Add broadcaster avatar URL
    sound: 'default',
  };

  // Batch send to all followers
  const batchSize = 1000; // FCM limit
  for (let i = 0; i < followerIds.length; i += batchSize) {
    const batch = followerIds.slice(i, i + batchSize);
    await Promise.all(batch.map(userId => sendPushToUser(userId, payload)));
  }
}

export default {
  sendPushNotification,
  sendPushToUser,
  notifyGoLive,
};

