/**
 * usePremiumStatus Hook
 * Manages premium subscription status and provides reactive status updates
 */
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import { premiumService, type SubscriptionStatus } from '../../../services/PremiumService';

interface UsePremiumStatusReturn {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  isPremium: boolean;
  plan: string;
  features: string[];
  refreshStatus: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
}

export const usePremiumStatus = (): UsePremiumStatusReturn => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await premiumService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      logger.info('Premium status refreshed', {
        isActive: status.isActive,
        plan: status.plan,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch premium status';
      setError(errorMessage);
      logger.error('Failed to refresh premium status', { error: err });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasFeature = useCallback(
    (feature: string): boolean => {
      return subscriptionStatus?.features.includes(feature) ?? false;
    },
    [subscriptionStatus?.features],
  );

  // Auto-refresh on mount
  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return {
    subscriptionStatus,
    isLoading,
    error,
    isPremium: subscriptionStatus?.isActive ?? false,
    plan: subscriptionStatus?.plan ?? 'free',
    features: subscriptionStatus?.features ?? [],
    refreshStatus,
    hasFeature,
  };
};
