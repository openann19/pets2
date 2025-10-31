/**
 * Hook for Swipe Premium Features
 * Phase 2 Product Enhancement - Premium swipe features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swipePremiumService } from '../services/swipePremiumService';
import type { SwipePremiumUsage } from '@pawfectmatch/core/types/phase2-contracts';
import { featureFlags } from '@pawfectmatch/core';

export function usePremiumUsage() {
  const isEnabled = featureFlags.isEnabled('swipePremium');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SwipePremiumUsage>({
    queryKey: ['premiumUsage'],
    queryFn: () => swipePremiumService.getUsage(),
    enabled: isEnabled,
    staleTime: 60_000, // 1 minute
    gcTime: 300_000, // 5 minutes
  });

  return {
    usage: data,
    isLoading,
    error,
    refetch,
    isEnabled,
  };
}

export function useRewind() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('swipePremium');

  return useMutation({
    mutationFn: (petId: string) => swipePremiumService.useRewind(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiumUsage'] });
    },
    enabled: isEnabled,
  });
}

export function useSuperLike() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('swipePremium');

  return useMutation({
    mutationFn: (matchId: string) => swipePremiumService.useSuperLike(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiumUsage'] });
    },
    enabled: isEnabled,
  });
}

export function useBoost() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('swipePremium');

  return useMutation({
    mutationFn: () => swipePremiumService.activateBoost(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiumUsage'] });
    },
    enabled: isEnabled,
  });
}

