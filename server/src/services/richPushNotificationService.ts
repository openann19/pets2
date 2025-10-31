/**
 * Rich Push Notification Service
 * Phase 1 Product Enhancement - Push Notifications
 * Supports actions, media, custom sounds/haptics, conversation previews, deep linking
 */

import type {
  PushPayload,
  PushNotificationResponse,
} from '@pawfectmatch/core/types/phase1-contracts';
import { sendPushToUser as sendBasicPush } from './pushNotificationService';
import User from '../models/User';
import logger from '../utils/logger';

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

/**
 * Send rich push notification with actions, media, and enhanced features
 */
export async function sendRichPushNotification(
  userId: string,
  payload: PushPayload
): Promise<PushNotificationResponse> {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Get push tokens for user
    const pushTokens = user.pushTokens || [];
    if (pushTokens.length === 0) {
      logger.warn('No push tokens found for user', { userId });
      return {
        success: false,
        error: 'No push tokens registered',
      };
    }

    const serverKey = process.env.FCM_SERVER_KEY;
    if (!serverKey) {
      logger.warn('FCM_SERVER_KEY not configured');
      // Fallback to basic push notification
      return await sendBasicPushFallback(userId, payload);
    }

    // Build rich FCM notification payload
    const fcmPayload: Record<string, unknown> = {
      registration_ids: pushTokens,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.media?.thumb && { image: payload.media.thumb }),
        sound: payload.sound || getDefaultSoundForType(payload.type),
      },
      data: {
        type: payload.type,
        deeplink: payload.deeplink,
        ...payload.data,
      },
      priority: payload.priority || 'high',
      ...(payload.collapseKey && { collapse_key: payload.collapseKey }),
    };

    // Add actions for Android (interactive notifications)
    if (payload.actions && payload.actions.length > 0) {
      fcmPayload.data = {
        ...fcmPayload.data,
        actions: JSON.stringify(payload.actions),
      };

      // Android-specific action buttons
      if (Array.isArray(payload.actions) && payload.actions.length > 0) {
        fcmPayload.notification = {
          ...fcmPayload.notification,
          click_action: payload.deeplink,
        };
      }
    }

    // Add media URL for rich previews
    if (payload.media?.url) {
      fcmPayload.data = {
        ...fcmPayload.data,
        media_url: payload.media.url,
        media_type: payload.media.mimeType || 'image',
      };
    }

    // Add badge count
    if (payload.badge !== undefined) {
      fcmPayload.data = {
        ...fcmPayload.data,
        badge: String(payload.badge),
      };
    }

    // Add vibration pattern
    if (payload.vibrationPattern) {
      fcmPayload.data = {
        ...fcmPayload.data,
        vibration_pattern: JSON.stringify(payload.vibrationPattern),
      };
    }

    // Send via FCM
    const response = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('FCM rich push notification failed', {
        status: response.status,
        error: errorText,
        userId,
      });
      throw new Error(`FCM error: ${response.status}`);
    }

    const result = (await response.json()) as {
      success?: number;
      failure?: number;
      multicast_id?: string;
    };

    logger.info('Rich push notification sent successfully', {
      userId,
      type: payload.type,
      successCount: result.success,
      failureCount: result.failure,
    });

    return {
      success: true,
      messageId: result.multicast_id,
      delivered: (result.success || 0) > 0,
    };
  } catch (error) {
    logger.error('Failed to send rich push notification', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      payloadType: payload.type,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send push notification with conversation preview
 */
export async function sendConversationPreview(
  userId: string,
  conversationId: string,
  senderName: string,
  messagePreview: string,
  matchPhoto?: string
): Promise<PushNotificationResponse> {
  const payload: PushPayload = {
    type: 'message',
    deeplink: `pawfectmatch://chat/${conversationId}`,
    title: `Message from ${senderName}`,
    body: messagePreview.length > 100 ? `${messagePreview.substring(0, 100)}...` : messagePreview,
    actions: [
      { id: 'reply', title: 'Reply', icon: 'reply' },
      { id: 'view', title: 'View Chat', icon: 'message-circle' },
    ],
    collapseKey: `conversation_${conversationId}`,
    ...(matchPhoto && {
      media: {
        url: matchPhoto,
        thumb: matchPhoto,
        mimeType: 'image/jpeg',
      },
    }),
    sound: 'message_sound.wav',
    priority: 'high',
    data: {
      conversationId,
      senderName,
      messagePreview,
    },
  };

  return await sendRichPushNotification(userId, payload);
}

/**
 * Send match notification with photo
 */
export async function sendMatchNotification(
  userId: string,
  matchId: string,
  petName: string,
  petPhoto: string
): Promise<PushNotificationResponse> {
  const payload: PushPayload = {
    type: 'match',
    deeplink: `pawfectmatch://matches/${matchId}`,
    title: 'New Match! 🎉',
    body: `You matched with ${petName}!`,
    actions: [
      { id: 'view', title: 'View Match', icon: 'heart' },
      { id: 'like', title: 'Send Message', icon: 'message-circle' },
    ],
    media: {
      url: petPhoto,
      thumb: petPhoto,
      mimeType: 'image/jpeg',
    },
    sound: 'match_sound.wav',
    priority: 'high',
    vibrationPattern: [0, 250, 250, 250],
    data: {
      matchId,
      petName,
    },
  };

  return await sendRichPushNotification(userId, payload);
}

/**
 * Send like notification
 */
export async function sendLikeNotification(
  userId: string,
  likerName: string,
  petPhoto?: string,
  isSuperLike = false
): Promise<PushNotificationResponse> {
  const payload: PushPayload = {
    type: isSuperLike ? 'like' : 'like', // Could be 'super_like' if added to type
    deeplink: 'pawfectmatch://matches',
    title: isSuperLike ? 'Super Like! ⭐' : 'New Like! ❤️',
    body: `${likerName} ${isSuperLike ? 'super liked' : 'liked'} your pet!`,
    actions: [
      { id: 'view', title: 'View Profile', icon: 'user' },
      { id: 'like', title: 'Like Back', icon: 'heart' },
    ],
    ...(petPhoto && {
      media: {
        url: petPhoto,
        thumb: petPhoto,
        mimeType: 'image/jpeg',
      },
    }),
    sound: 'like_sound.wav',
    priority: 'normal',
    data: {
      likerName,
      isSuperLike,
    },
  };

  return await sendRichPushNotification(userId, payload);
}

/**
 * Get default sound for notification type
 */
function getDefaultSoundForType(type: PushPayload['type']): string {
  switch (type) {
    case 'match':
      return 'match_sound.wav';
    case 'message':
      return 'message_sound.wav';
    case 'like':
      return 'like_sound.wav';
    case 'reminder':
      return 'default_sound.wav';
    default:
      return 'default_sound.wav';
  }
}

/**
 * Fallback to basic push if rich push fails
 */
async function sendBasicPushFallback(
  userId: string,
  payload: PushPayload
): Promise<PushNotificationResponse> {
  try {
    await sendBasicPush(userId, {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });
    return {
      success: true,
      delivered: true,
    };
  } catch (error) {
    logger.error('Basic push fallback also failed', { error, userId });
    return {
      success: false,
      error: 'Both rich and basic push failed',
    };
  }
}

