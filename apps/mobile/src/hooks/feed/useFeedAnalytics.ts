/**
 * Feed Analytics Hook
 * Phase 4: Intelligence & Personalization
 * 
 * Tracks feed user behavior for:
 * - A/B testing
 * - Layout optimization
 * - User engagement metrics
 * - Performance analytics
 */

import { useCallback, useEffect, useRef } from 'react';
import { logger } from '@pawfectmatch/core';
import { telemetry } from '../../lib/telemetry';
import type { Pet } from '../../types/api';

export interface FeedInteractionEvent {
  type: 'swipe' | 'view' | 'filter' | 'refresh' | 'match';
  petId?: string;
  action?: 'like' | 'pass' | 'superlike';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface FeedAnalyticsMetrics {
  totalSwipes: number;
  likes: number;
  passes: number;
  superlikes: number;
  matches: number;
  averageTimePerCard: number;
  filterChanges: number;
  sessionDuration: number;
}

export interface UseFeedAnalyticsOptions {
  /** Enable analytics */
  enabled?: boolean;
  /** Screen name for tracking */
  screenName?: string;
  /** Custom event handler */
  onEvent?: (event: FeedInteractionEvent) => void;
}

export interface UseFeedAnalyticsReturn {
  /** Track swipe action */
  trackSwipe: (petId: string, action: 'like' | 'pass' | 'superlike') => void;
  /** Track card view */
  trackCardView: (petId: string, viewTime: number) => void;
  /** Track filter change */
  trackFilterChange: (filterType: string, value: unknown) => void;
  /** Track match */
  trackMatch: (petId: string, matchId: string) => void;
  /** Track feed refresh */
  trackRefresh: () => void;
  /** Get current metrics */
  getMetrics: () => FeedAnalyticsMetrics;
  /** Reset metrics */
  resetMetrics: () => void;
}

/**
 * Feed Analytics Hook
 * 
 * Tracks user behavior and feed interactions
 */
export function useFeedAnalytics(
  options: UseFeedAnalyticsOptions = {},
): UseFeedAnalyticsReturn {
  const { enabled = true, screenName = 'Feed', onEvent } = options;

  const metricsRef = useRef<FeedAnalyticsMetrics>({
    totalSwipes: 0,
    likes: 0,
    passes: 0,
    superlikes: 0,
    matches: 0,
    averageTimePerCard: 0,
    filterChanges: 0,
    sessionDuration: 0,
  });

  const sessionStartRef = useRef(Date.now());
  const cardViewTimesRef = useRef<Map<string, number>>(new Map());

  /**
   * Track swipe action
   */
  const trackSwipe = useCallback(
    (petId: string, action: 'like' | 'pass' | 'superlike') => {
      if (!enabled) return;

      const event: FeedInteractionEvent = {
        type: 'swipe',
        petId,
        action,
        timestamp: Date.now(),
      };

      // Update metrics
      metricsRef.current.totalSwipes++;
      if (action === 'like') metricsRef.current.likes++;
      else if (action === 'pass') metricsRef.current.passes++;
      else if (action === 'superlike') metricsRef.current.superlikes++;

      // Track via telemetry
      telemetry.trackEvent('FEED_SWIPE', {
        action,
        petId,
        screenName,
      });

      onEvent?.(event);
      logger.debug('Feed swipe tracked', { petId, action });
    },
    [enabled, screenName, onEvent],
  );

  /**
   * Track card view
   */
  const trackCardView = useCallback(
    (petId: string, viewTime: number) => {
      if (!enabled) return;

      cardViewTimesRef.current.set(petId, viewTime);

      // Calculate average
      const times = Array.from(cardViewTimesRef.current.values());
      metricsRef.current.averageTimePerCard =
        times.reduce((sum, time) => sum + time, 0) / times.length;

      const event: FeedInteractionEvent = {
        type: 'view',
        petId,
        timestamp: Date.now(),
        metadata: { viewTime },
      };

      telemetry.trackEvent('FEED_CARD_VIEW', {
        petId,
        viewTime,
        screenName,
      });

      onEvent?.(event);
    },
    [enabled, screenName, onEvent],
  );

  /**
   * Track filter change
   */
  const trackFilterChange = useCallback(
    (filterType: string, value: unknown) => {
      if (!enabled) return;

      metricsRef.current.filterChanges++;

      const event: FeedInteractionEvent = {
        type: 'filter',
        timestamp: Date.now(),
        metadata: { filterType, value },
      };

      telemetry.trackEvent('FEED_FILTER_CHANGE', {
        filterType,
        value: String(value),
        screenName,
      });

      onEvent?.(event);
      logger.debug('Feed filter change tracked', { filterType, value });
    },
    [enabled, screenName, onEvent],
  );

  /**
   * Track match
   */
  const trackMatch = useCallback(
    (petId: string, matchId: string) => {
      if (!enabled) return;

      metricsRef.current.matches++;

      const event: FeedInteractionEvent = {
        type: 'match',
        petId,
        timestamp: Date.now(),
        metadata: { matchId },
      };

      telemetry.trackEvent('FEED_MATCH', {
        petId,
        matchId,
        screenName,
      });

      onEvent?.(event);
      logger.debug('Feed match tracked', { petId, matchId });
    },
    [enabled, screenName, onEvent],
  );

  /**
   * Track feed refresh
   */
  const trackRefresh = useCallback(() => {
    if (!enabled) return;

    telemetry.trackEvent('FEED_REFRESH', {
      screenName,
      metrics: metricsRef.current,
    });

    logger.debug('Feed refresh tracked');
  }, [enabled, screenName]);

  /**
   * Get current metrics
   */
  const getMetrics = useCallback((): FeedAnalyticsMetrics => {
    metricsRef.current.sessionDuration = Date.now() - sessionStartRef.current;
    return { ...metricsRef.current };
  }, []);

  /**
   * Reset metrics
   */
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      totalSwipes: 0,
      likes: 0,
      passes: 0,
      superlikes: 0,
      matches: 0,
      averageTimePerCard: 0,
      filterChanges: 0,
      sessionDuration: 0,
    };
    cardViewTimesRef.current.clear();
    sessionStartRef.current = Date.now();
  }, []);

  // Track session end on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        const sessionDuration = Date.now() - sessionStartRef.current;
        telemetry.trackEvent('FEED_SESSION_END', {
          screenName,
          sessionDuration,
          metrics: getMetrics(),
        });
      }
    };
  }, [enabled, screenName, getMetrics]);

  return {
    trackSwipe,
    trackCardView,
    trackFilterChange,
    trackMatch,
    trackRefresh,
    getMetrics,
    resetMetrics,
  };
}

