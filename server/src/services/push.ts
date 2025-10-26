import fetch from 'node-fetch';
import logger from '../utils/logger';

/**
 * Send push notification via FCM
 */
export async function pushFCM(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  if (!tokens.length) {
    logger.info('No push tokens provided');
    return true;
  }

  const fcmServerKey = process.env.FCM_SERVER_KEY;

  if (!fcmServerKey) {
    logger.warn('⚠️ FCM_SERVER_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey}`,
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: { title, body },
        data,
      }),
    });

    const result = await response.json() as { success?: number; failure?: number };
    logger.info('FCM notification sent', { 
      successCount: result.success, 
      failureCount: result.failure 
    });

    return response.ok;
  } catch (error) {
    logger.error('FCM notification failed', { error });
    return false;
  }
}

