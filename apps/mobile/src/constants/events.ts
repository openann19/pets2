/**
 * Telemetry Event Constants
 * Centralized event names for analytics tracking
 */

export const TELEMETRY_EVENTS = {
  // Home Screen Events
  HOME_OPEN: 'home_open',
  HOME_QUICK_ACTION_CLICK: 'home_quick_action_click',
  HOME_REFRESH: 'home_refresh',

  // Stories Events
  STORIES_OPEN: 'stories_open',
  STORIES_NEXT: 'stories_next',
  STORIES_PREV: 'stories_prev',
  STORIES_PAUSE: 'stories_pause',
  STORIES_RESUME: 'stories_resume',
  STORIES_MUTE_TOGGLE: 'stories_mute_toggle',
  STORIES_CLOSE: 'stories_close',
  STORIES_VIEW: 'stories_view',
  STORIES_SWIPE_UP: 'stories_swipe_up', // Future: reply gesture

  // Premium Events
  PREMIUM_CTA_CLICK: 'premium_cta_click',
  PREMIUM_UPGRADE_START: 'premium_upgrade_start',
  PREMIUM_UPGRADE_SUCCESS: 'premium_upgrade_success',
  PREMIUM_UPGRADE_CANCEL: 'premium_upgrade_cancel',

  // Navigation Events
  NAVIGATION_DEEP_LINK: 'navigation_deep_link',
  NAVIGATION_SCREEN_VIEW: 'navigation_screen_view',

  // Error Events
  ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
  ERROR_UNCAUGHT: 'error_uncaught',

  // UI Events
  UI_BACKDROP_SHOWN: 'ui_backdrop_shown',
  UI_BACKDROP_HIDDEN: 'ui_backdrop_hidden',
} as const;

export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[keyof typeof TELEMETRY_EVENTS];

/**
 * Event payload types for type safety
 */
export interface HomeQuickActionEventPayload {
  action: 'swipe' | 'matches' | 'messages' | 'profile' | 'community' | 'premium';
}

export interface StoriesEventPayload {
  storyId?: string;
  userId?: string;
  storyIndex?: number;
  groupIndex?: number;
}

export interface PremiumEventPayload {
  source?: string;
  tier?: string;
}

export interface NavigationEventPayload {
  screen: string;
  params?: Record<string, unknown>;
}

export interface ErrorEventPayload {
  error: string;
  componentStack?: string;
  errorId?: string;
}

export interface BackdropEventPayload {
  reason?: string; // 'modal' | 'sheet' | 'toast' | 'notification' | 'tooltip' | 'overlay'
}

