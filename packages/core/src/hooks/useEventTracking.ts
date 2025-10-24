/**
 * Event Tracking Hook
 * Tracks user events and interactions for analytics
 */

import { useCallback, useRef } from 'react';
import { logger } from '../utils/logger';
import { getLocalStorageItem } from '../utils/env';

export interface TrackEventOptions {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface UseEventTrackingReturn {
  trackEvent: (options: TrackEventOptions) => Promise<void>;
  trackPageView: (pageName: string, metadata?: Record<string, unknown>) => Promise<void>;
  trackSwipe: (action: 'like' | 'pass' | 'superlike', petId: string) => Promise<void>;
  trackMatch: (matchId: string, petId: string) => Promise<void>;
  trackMessage: (matchId: string, messageLength: number) => Promise<void>;
  trackProfileView: (profileId: string, duration?: number) => Promise<void>;
}

/**
 * Hook for tracking user events and interactions
 */
export function useEventTracking(): UseEventTrackingReturn {
  const eventQueue = useRef<TrackEventOptions[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout | null>(null);

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getLocalStorageItem('accessToken') ?? ''}`,
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error('Failed to send analytics events');
      }

      logger.info('Analytics events sent', { count: events.length });
    } catch (error) {
      logger.error('Failed to send analytics events', { error });
      // Re-queue failed events
      eventQueue.current.unshift(...events);
    }
  }, []);

  // Track a generic event
  const trackEvent = useCallback(
    async (options: TrackEventOptions) => {
      const event = {
        ...options,
        timestamp: new Date().toISOString(),
      };

      eventQueue.current.push(event);

      // Debounce flush - send events in batches
      if (flushTimeout.current) {
        clearTimeout(flushTimeout.current);
      }

      flushTimeout.current = setTimeout(() => {
        void flushEvents();
      }, 2000); // Flush every 2 seconds

      logger.info('Event tracked', { category: options.category, action: options.action });
    },
    [flushEvents]
  );

  // Track page view
  const trackPageView = useCallback(
    async (pageName: string, metadata?: Record<string, unknown>) => {
      await trackEvent({
        category: 'Navigation',
        action: 'PageView',
        label: pageName,
        ...(metadata !== undefined && { metadata }),
      });
    },
    [trackEvent]
  );

  // Track swipe action
  const trackSwipe = useCallback(
    async (action: 'like' | 'pass' | 'superlike', petId: string) => {
      await trackEvent({
        category: 'Engagement',
        action: `Swipe_${action}`,
        label: petId,
        value: action === 'superlike' ? 2 : action === 'like' ? 1 : 0,
      });
    },
    [trackEvent]
  );

  // Track match creation
  const trackMatch = useCallback(
    async (matchId: string, petId: string) => {
      await trackEvent({
        category: 'Engagement',
        action: 'Match_Created',
        label: matchId,
        metadata: { petId },
      });
    },
    [trackEvent]
  );

  // Track message sent
  const trackMessage = useCallback(
    async (matchId: string, messageLength: number) => {
      await trackEvent({
        category: 'Communication',
        action: 'Message_Sent',
        label: matchId,
        value: messageLength,
      });
    },
    [trackEvent]
  );

  // Track profile view
  const trackProfileView = useCallback(
    async (profileId: string, duration?: number) => {
      await trackEvent({
        category: 'Engagement',
        action: 'Profile_View',
        label: profileId,
        ...(duration !== undefined && { value: duration }),
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackSwipe,
    trackMatch,
    trackMessage,
    trackProfileView,
  };
}
