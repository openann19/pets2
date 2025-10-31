/**
 * useDailySwipeStatus Hook
 * Fetches and manages daily swipe status with limit warnings
 */
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import { premiumAPI } from '../../../services/api';

interface DailySwipeStatus {
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  warningThreshold: number;
}

interface UseDailySwipeStatusReturn {
  status: DailySwipeStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  shouldShowWarning: boolean;
  shouldShowUpgradePrompt: boolean;
}

export const useDailySwipeStatus = (): UseDailySwipeStatusReturn => {
  const [status, setStatus] = useState<DailySwipeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await premiumAPI.getDailySwipeStatus();
      setStatus(data);
      logger.info('Daily swipe status refreshed', {
        used: data.used,
        limit: data.limit,
        remaining: data.remaining,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch daily swipe status';
      setError(errorMessage);
      logger.error('Failed to refresh daily swipe status', { error: err });
      // Set default status on error
      setStatus({
        used: 0,
        limit: 5,
        remaining: 5,
        isUnlimited: false,
        warningThreshold: 1,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh on mount and when component focuses
  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const shouldShowWarning =
    status !== null &&
    !status.isUnlimited &&
    status.remaining > 0 &&
    status.remaining <= status.warningThreshold;

  const shouldShowUpgradePrompt =
    status !== null && !status.isUnlimited && status.remaining === 0;

  return {
    status,
    isLoading,
    error,
    refreshStatus,
    shouldShowWarning,
    shouldShowUpgradePrompt,
  };
};

