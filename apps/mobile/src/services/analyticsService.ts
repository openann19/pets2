import { request } from './api';

export interface AnalyticsEvent {
  event: string;
  props?: Record<string, any>;
}

/**
 * Track analytics events
 */
export async function track(event: string, props?: Record<string, any>): Promise<void> {
  try {
    await request('/admin/analytics/track', { method: 'POST', body: { event, props } });
  } catch (error) {
    // Analytics failures should not break the app - log silently via logger
    const { logger } = await import('./logger');
    logger.warn('Analytics tracking failed', { error, event, props });
  }
}

/**
 * Common event types for the app
 */
export const AnalyticsEvents = {
  // Auth
  USER_SIGNED_UP: 'user.signed_up',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',

  // Premium
  PREMIUM_SUBSCRIBED: 'premium.subscribed',
  PREMIUM_CANCELLED: 'premium.cancelled',
  PREMIUM_FEATURE_USED: 'premium.feature_used',

  // Swipe
  SWIPE_RIGHT: 'swipe.right',
  SWIPE_LEFT: 'swipe.left',
  SWIPE_SUPERLIKE: 'swipe.superlike',

  // Match
  MATCH_CREATED: 'match.created',
  MATCH_OPENED: 'match.opened',
  MATCH_BLOCKED: 'match.blocked',

  // Chat
  MESSAGE_SENT: 'message.sent',
  MESSAGE_RECEIVED: 'message.received',
  VOICE_NOTE_SENT: 'voice_note.sent',

  // Profile
  PROFILE_VIEWED: 'profile.viewed',
  PROFILE_EDITED: 'profile.edited',
  PHOTO_UPLOADED: 'photo.uploaded',

  // Map
  ACTIVITY_STARTED: 'activity.started',
  ACTIVITY_ENDED: 'activity.ended',
  PIN_LIKED: 'pin.liked',
  PIN_COMMENTED: 'pin.commented',

  // Settings
  SETTINGS_UPDATED: 'settings.updated',
  NOTIFICATION_PREFERENCE_CHANGED: 'notification.preference_changed',
} as const;

/**
 * Track page views
 */
export function trackScreenView(screenName: string, props?: Record<string, any>): void {
  track('screen_view', { screen: screenName, ...props });
}

/**
 * Track user actions
 */
export function trackUserAction(action: string, props?: Record<string, any>): void {
  track('user_action', { action, ...props });
}

