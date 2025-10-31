/**
 * Hook for Personalized Dashboard
 * Phase 1 Product Enhancement - Home Screen
 */

import { useQuery } from '@tanstack/react-query';
import { personalizedDashboardService } from '../services/personalizedDashboardService';
import type { PersonalizedDashboardData } from '@pawfectmatch/core/types/phase1-contracts';
import { featureFlags } from '@pawfectmatch/core';

export function usePersonalizedDashboard() {
  const isEnabled = featureFlags.isEnabled('homeDashboard');

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<PersonalizedDashboardData>({
    queryKey: ['personalizedDashboard'],
    queryFn: () => personalizedDashboardService.getDashboard(),
    enabled: isEnabled,
    staleTime: 120_000, // 2 minutes
    gcTime: 600_000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    dashboardData: data,
    isLoading,
    error,
    refetch,
    isRefetching,
    isEnabled,
  };
}

