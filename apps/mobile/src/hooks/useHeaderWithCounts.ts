/**
 * 🎯 USE HEADER WITH COUNTS - Hook that combines header updates with badge counts
 * Fetches counts from API and updates header automatically
 */

import { useQuery } from '@tanstack/react-query';
import { useHeader } from '@/chrome/useHeader';
import { api } from '../services/api';
import { logger } from '@pawfectmatch/core';

import type { SharedValue } from 'react-native-reanimated';

interface HeaderCountsOptions {
  title?: string;
  subtitle?: string;
  /** Whether to fetch counts from API (default: true) */
  fetchCounts?: boolean;
  /** Override counts manually */
  counts?: {
    messages?: number;
    notifications?: number;
    community?: number;
  };
  /** Optional scrollY SharedValue for header collapse animation */
  scrollY?: SharedValue<number>;
}

interface StatsResponse {
  matches: number;
  messages: number;
  recentLikes: number;
}

interface NotificationHistoryResponse {
  success: boolean;
  data: {
    unread: number;
    total: number;
    notifications?: unknown[];
    hasMore?: boolean;
  };
}

/**
 * Hook that combines header title/subtitle updates with automatic badge count fetching
 * 
 * @example
 * ```tsx
 * useHeaderWithCounts({
 *   title: 'Home',
 *   subtitle: 'Welcome back!',
 * });
 * ```
 */
export function useHeaderWithCounts(options: HeaderCountsOptions): void {
  const { title, subtitle, fetchCounts = true, counts: manualCounts } = options;

  // Fetch stats from API if enabled
  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['header-counts'],
    queryFn: async () => {
      try {
        const response = await api.get<StatsResponse>('/home/stats');
        return {
          matches: response.matches || 0,
          messages: response.messages || 0,
          recentLikes: response.recentLikes || 0,
        };
      } catch (error) {
        logger.error('Failed to fetch header counts', { error });
        return {
          matches: 0,
          messages: 0,
          recentLikes: 0,
        };
      }
    },
    enabled: fetchCounts && !manualCounts,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  // Fetch notification count from API if enabled
  const { data: notificationData } = useQuery<NotificationHistoryResponse>({
    queryKey: ['header-notifications'],
    queryFn: async () => {
      try {
        const response = await api.get<NotificationHistoryResponse>(
          '/api/user/notifications/history?unreadOnly=true&limit=1'
        );
        return response;
      } catch (error) {
        logger.error('Failed to fetch notification count', { error });
        return {
          success: false,
          data: { unread: 0, total: 0 },
        };
      }
    },
    enabled: fetchCounts && !manualCounts?.notifications,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Determine counts: manual override > API stats > zero
  const counts = manualCounts || (stats
    ? {
        messages: stats.messages || 0,
        notifications: notificationData?.data?.unread || 0,
        community: stats.recentLikes || 0,
      }
    : undefined);

  // Update header with title, subtitle, counts, and scrollY
  useHeader({
    ...(title !== undefined && { title }),
    ...(subtitle !== undefined && { subtitle }),
    ...(counts !== undefined && { counts }),
    ...(options.scrollY !== undefined && { scrollY: options.scrollY }),
  });
}

