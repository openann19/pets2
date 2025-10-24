/**
 * Match Analytics Hook
 * Tracks match-related analytics and insights
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { getLocalStorageItem } from '../utils/env';

export interface MatchInsights {
  totalMatches: number;
  activeConversations: number;
  averageMatchScore: number;
  topMatchedBreeds: Array<{ breed: string; count: number }>;
  matchSuccessRate: number; // percentage of matches that lead to conversations
  averageTimeToMatch: number; // in hours
  peakMatchingHours: number[]; // hours of day (0-23)
  geographicDistribution: Array<{ location: string; count: number }>;
}

export interface MatchTrends {
  daily: number[];
  weekly: number[];
  monthly: number[];
}

interface UseMatchAnalyticsOptions {
  userId?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all';
}

interface UseMatchAnalyticsReturn {
  insights: MatchInsights | null;
  trends: MatchTrends | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch match analytics and insights
 */
export function useMatchAnalytics(
  options: UseMatchAnalyticsOptions = {}
): UseMatchAnalyticsReturn {
  const { userId, timeframe = 'weekly' } = options;

  const [insights, setInsights] = useState<MatchInsights | null>(null);
  const [trends, setTrends] = useState<MatchTrends | null>(null);
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

      const response = await fetch(
        `/api/analytics/matches/${userId}?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${getLocalStorageItem('accessToken') ?? ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch match analytics: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setInsights(data.data.insights);
        setTrends(data.data.trends);
      } else {
        throw new Error(data.message || 'Failed to fetch match analytics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Failed to fetch match analytics', { error: errorMessage, userId });
    } finally {
      setIsLoading(false);
    }
  }, [userId, timeframe]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    insights,
    trends,
    isLoading,
    error,
    refresh: fetchAnalytics,
  };
}
