/**
 * Hook for Advanced Match Filtering
 * Phase 1 Product Enhancement - Matches Screen
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { advancedMatchFilterService } from '../services/advancedMatchFilterService';
import type {
  AdvancedMatchFilter,
  MatchFilterResponse,
} from '@pawfectmatch/core/types/phase1-contracts';
import { featureFlags } from '@pawfectmatch/core';

export function useAdvancedMatchFilter() {
  const isEnabled = featureFlags.isEnabled('matchesAdvancedFilter');
  const [filter, setFilter] = useState<AdvancedMatchFilter>({
    page: 1,
    limit: 20,
    sort: 'newest',
  });

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<MatchFilterResponse['data']>({
    queryKey: ['advancedMatchFilter', filter],
    queryFn: () => advancedMatchFilterService.filterMatches(filter),
    enabled: isEnabled,
    staleTime: 60_000, // 1 minute
    gcTime: 300_000, // 5 minutes
  });

  const updateFilter = useCallback((newFilter: Partial<AdvancedMatchFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      page: newFilter.page ?? 1, // Reset to page 1 on filter change
    }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({
      page: 1,
      limit: 20,
      sort: 'newest',
    });
  }, []);

  const loadMore = useCallback(() => {
    if (data?.hasMore) {
      setFilter((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  }, [data?.hasMore]);

  return {
    matches: data?.matches || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
    isRefetching,
    filter,
    updateFilter,
    resetFilter,
    loadMore,
    isEnabled,
  };
}

/**
 * Hook for Match Insights
 */
export function useMatchInsights(matchId: string | null) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['matchInsights', matchId],
    queryFn: () => {
      if (!matchId) return null;
      return advancedMatchFilterService.getMatchInsights(matchId);
    },
    enabled: !!matchId && featureFlags.isEnabled('matchesAdvancedFilter'),
    staleTime: 300_000, // 5 minutes
    gcTime: 600_000, // 10 minutes
  });

  return {
    insights: data,
    isLoading,
    error,
    refetch,
  };
}

