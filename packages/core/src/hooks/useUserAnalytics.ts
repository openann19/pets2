/**
 * User Analytics Hook
 * Tracks user behavior and provides analytics data
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { getLocalStorageItem } from '../utils/env';

export interface UserAnalytics {
  totalSwipes: number;
  totalLikes: number;
  totalMatches: number;
  profileViews: number;
  messagesReceived: number;
  messagesSent: number;
  averageResponseTime: number; // in minutes
  activeTime: number; // in minutes
  lastActive: Date;
  swipeAccuracy: number; // percentage of likes that became matches
  popularityScore: number; // 0-100
}

export interface AnalyticsTimeframe {
  daily: UserAnalytics;
  weekly: UserAnalytics;
  monthly: UserAnalytics;
  allTime: UserAnalytics;
}

interface UseUserAnalyticsOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseUserAnalyticsReturn {
  analytics: AnalyticsTimeframe | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and track user analytics
 */
export function useUserAnalytics(options: UseUserAnalyticsOptions = {}): UseUserAnalyticsReturn {
  const { userId, autoRefresh = false, refreshInterval = 60000 } = options;

  const [analytics, setAnalytics] = useState<AnalyticsTimeframe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${getLocalStorageItem('accessToken') ?? ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Failed to fetch user analytics', { error: errorMessage, userId });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      void fetchAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, userId, fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refresh: fetchAnalytics,
  };
}
