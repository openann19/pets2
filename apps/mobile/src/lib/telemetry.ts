/**
 * Telemetry Service
 * Centralized event tracking for mobile app
 * 
 * Emits structured events with minimal payload (no PII)
 * Logs to console in dev mode only (scoped lint exception)
 */

import { logger } from '@pawfectmatch/core';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { TELEMETRY_EVENTS } from '../constants/events';
import type {
  ErrorEventPayload,
  HomeQuickActionEventPayload,
  NavigationEventPayload,
  PremiumEventPayload,
  StoriesEventPayload,
  TelemetryEventName,
} from '../constants/events';

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

interface TelemetryEvent {
  name: TelemetryEventName;
  timestamp: number;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  payload?: Record<string, unknown>;
}

class TelemetryService {
  private eventQueue: TelemetryEvent[] = [];
  private readonly batchSize = 10;
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Track a telemetry event
   */
  trackEvent(
    eventName: TelemetryEventName,
    payload?: Record<string, unknown>,
  ): void {
    const event: TelemetryEvent = {
      name: eventName,
      timestamp: Date.now(),
      platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
      appVersion: Constants.expoConfig?.version || '1.0.0',
      payload: payload ? this.sanitizePayload(payload) : undefined,
    };

    this.eventQueue.push(event);

    // Log in dev mode only (scoped exception for dev/test files)
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      logger.info('[Telemetry]', { eventName, payload });
    }

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    } else {
      // Debounce flush
      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout);
      }
      this.flushTimeout = setTimeout(() => {
        this.flushEvents();
      }, 2000);
    }
  }

  /**
   * Track home screen events
   */
  trackHomeOpen(): void {
    this.trackEvent(TELEMETRY_EVENTS.HOME_OPEN);
  }

  trackHomeQuickAction(payload: HomeQuickActionEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.HOME_QUICK_ACTION_CLICK, payload);
  }

  trackHomeRefresh(): void {
    this.trackEvent(TELEMETRY_EVENTS.HOME_REFRESH);
  }

  /**
   * Track stories events
   */
  trackStoriesOpen(): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_OPEN);
  }

  trackStoriesNext(payload?: StoriesEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_NEXT, payload);
  }

  trackStoriesPrev(payload?: StoriesEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_PREV, payload);
  }

  trackStoriesPause(payload?: StoriesEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_PAUSE, payload);
  }

  trackStoriesResume(payload?: StoriesEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_RESUME, payload);
  }

  trackStoriesMuteToggle(payload?: StoriesEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_MUTE_TOGGLE, payload);
  }

  trackStoriesClose(): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_CLOSE);
  }

  trackStoriesView(payload: StoriesEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_VIEW, payload);
  }

  trackStoriesSwipeUp(payload?: StoriesEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.STORIES_SWIPE_UP, payload);
  }

  /**
   * Track premium events
   */
  trackPremiumCTAClick(payload?: PremiumEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.PREMIUM_CTA_CLICK, payload);
  }

  trackPremiumUpgradeStart(payload?: PremiumEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.PREMIUM_UPGRADE_START, payload);
  }

  trackPremiumUpgradeSuccess(payload?: PremiumEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.PREMIUM_UPGRADE_SUCCESS, payload);
  }

  trackPremiumUpgradeCancel(payload?: PremiumEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.PREMIUM_UPGRADE_CANCEL, payload);
  }

  /**
   * Track navigation events
   */
  trackNavigationDeepLink(payload: NavigationEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.NAVIGATION_DEEP_LINK, payload);
  }

  trackNavigationScreenView(payload: NavigationEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.NAVIGATION_SCREEN_VIEW, payload);
  }

  /**
   * Track error events
   */
  trackErrorBoundary(payload: ErrorEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.ERROR_BOUNDARY_TRIGGERED, payload);
  }

  trackUncaughtError(payload: ErrorEventPayload): void {
    this.trackEvent(TELEMETRY_EVENTS.ERROR_UNCAUGHT, payload);
  }

  /**
   * Sanitize payload to remove PII and sensitive data
   */
  private sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['email', 'password', 'token', 'secret', 'creditCard', 'ssn'];

    for (const [key, value] of Object.entries(payload)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = `${value.substring(0, 100)}...`;
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Flush events queue (for future backend integration)
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    // Send to analytics backend
    logger.debug('Telemetry events flushed', { count: events.length });

    // Send events to backend API
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        logger.warn('Failed to send telemetry events', {
          status: response.status,
          count: events.length,
        });
      } else {
        logger.debug('Successfully sent telemetry events', { count: events.length });
      }
    } catch (error) {
      logger.error('Error sending telemetry events', { error, count: events.length });
      // Re-queue failed events for next flush attempt
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Force flush remaining events
   */
  flush(): void {
    this.flushEvents();
  }
}

// Singleton instance
export const telemetry = new TelemetryService();

