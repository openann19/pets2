/**
 * Comprehensive Tests for usePremiumStatus Hook
 * Revenue-Critical - Premium Subscription Management
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePremiumStatus } from '../usePremiumStatus';
import { premiumService, type SubscriptionStatus } from '../../../../services/PremiumService';
import { logger } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('../../../../services/PremiumService', () => ({
  premiumService: {
    getSubscriptionStatus: jest.fn(),
  },
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('usePremiumStatus', () => {
  const mockSubscriptionStatus: SubscriptionStatus = {
    isActive: true,
    plan: 'premium',
    features: ['unlimited_swipes', 'see_who_liked', 'advanced_filters'],
    expiresAt: '2024-12-31T23:59:59Z',
    autoRenew: true,
    stripeCustomerId: 'cus_123',
    currentPeriodEnd: '2024-12-31T23:59:59Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.subscriptionStatus).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isPremium).toBe(false);
      expect(result.current.plan).toBe('free');
      expect(result.current.features).toEqual([]);
      expect(typeof result.current.refreshStatus).toBe('function');
      expect(typeof result.current.hasFeature).toBe('function');
    });

    it('should auto-refresh on mount', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(premiumService.getSubscriptionStatus).toHaveBeenCalled();
      expect(result.current.subscriptionStatus).toEqual(mockSubscriptionStatus);
    });
  });

  describe('Premium Status', () => {
    it('should correctly identify premium user', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('premium');
      expect(result.current.features).toEqual(mockSubscriptionStatus.features);
    });

    it('should correctly identify free user', async () => {
      const freeStatus: SubscriptionStatus = {
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      };

      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(freeStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.plan).toBe('free');
      expect(result.current.features).toEqual([]);
    });

    it('should handle ultimate plan user', async () => {
      const ultimateStatus: SubscriptionStatus = {
        ...mockSubscriptionStatus,
        plan: 'ultimate',
        features: ['unlimited_swipes', 'ai_recommendations', 'vip_status'],
      };

      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(ultimateStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('ultimate');
      expect(result.current.features).toContain('ai_recommendations');
    });
  });

  describe('Feature Checking', () => {
    it('should correctly check if user has a feature', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFeature('unlimited_swipes')).toBe(true);
      expect(result.current.hasFeature('see_who_liked')).toBe(true);
      expect(result.current.hasFeature('advanced_filters')).toBe(true);
      expect(result.current.hasFeature('ai_recommendations')).toBe(false);
    });

    it('should return false for features when subscription is inactive', async () => {
      const freeStatus: SubscriptionStatus = {
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      };

      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(freeStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFeature('unlimited_swipes')).toBe(false);
      expect(result.current.hasFeature('any_feature')).toBe(false);
    });

    it('should handle null subscription status gracefully', () => {
      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      // Before status is loaded
      expect(result.current.hasFeature('unlimited_swipes')).toBe(false);
      expect(result.current.hasFeature('any_feature')).toBe(false);
    });
  });

  describe('Refresh Status', () => {
    it('should refresh subscription status', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock)
        .mockResolvedValueOnce({
          ...mockSubscriptionStatus,
          plan: 'free',
          isActive: false,
        })
        .mockResolvedValueOnce(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.plan).toBe('free');

      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.plan).toBe('premium');
      expect(result.current.isPremium).toBe(true);
      expect(premiumService.getSubscriptionStatus).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith('Premium status refreshed', {
        isActive: true,
        plan: 'premium',
      });
    });

    it('should handle loading state during refresh', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise<SubscriptionStatus>((resolve) => {
        resolvePromise = resolve;
      });

      (premiumService.getSubscriptionStatus as jest.Mock)
        .mockResolvedValueOnce(mockSubscriptionStatus)
        .mockReturnValueOnce(promise);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.refreshStatus();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockSubscriptionStatus);
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error on successful refresh', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();

      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.subscriptionStatus).toEqual(mockSubscriptionStatus);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Service unavailable');
      (premiumService.getSubscriptionStatus as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Service unavailable');
      expect(result.current.subscriptionStatus).toBeNull();
      expect(result.current.isPremium).toBe(false);
      expect(result.current.plan).toBe('free');
      expect(logger.error).toHaveBeenCalledWith('Failed to refresh premium status', {
        error,
      });
    });

    it('should handle non-Error exceptions', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch premium status');
    });

    it('should handle refresh errors', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock)
        .mockResolvedValueOnce(mockSubscriptionStatus)
        .mockRejectedValueOnce(new Error('Refresh error'));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Refresh error');
      expect(logger.error).toHaveBeenCalledWith('Failed to refresh premium status', {
        error: expect.any(Error),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle subscription with no expiration date', async () => {
      const statusWithoutExpiry: SubscriptionStatus = {
        isActive: true,
        plan: 'premium',
        features: ['unlimited_swipes'],
        autoRenew: true,
      };

      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(statusWithoutExpiry);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subscriptionStatus?.expiresAt).toBeUndefined();
      expect(result.current.isPremium).toBe(true);
    });

    it('should handle subscription with cancelled auto-renew', async () => {
      const cancelledStatus: SubscriptionStatus = {
        ...mockSubscriptionStatus,
        autoRenew: false,
      };

      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(cancelledStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subscriptionStatus?.autoRenew).toBe(false);
      expect(result.current.isPremium).toBe(true); // Still active until expiry
    });

    it('should handle rapid refresh calls', async () => {
      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.refreshStatus(),
          result.current.refreshStatus(),
          result.current.refreshStatus(),
        ]);
      });

      // Should handle all refresh calls
      expect(premiumService.getSubscriptionStatus).toHaveBeenCalledTimes(4); // 1 initial + 3 refreshes
    });

    it('should handle empty features array', async () => {
      const statusWithNoFeatures: SubscriptionStatus = {
        isActive: true,
        plan: 'premium',
        features: [],
        autoRenew: true,
      };

      (premiumService.getSubscriptionStatus as jest.Mock).mockResolvedValue(statusWithNoFeatures);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.features).toEqual([]);
      expect(result.current.hasFeature('any_feature')).toBe(false);
    });
  });

  describe('Subscription Status Updates', () => {
    it('should update status when subscription changes', async () => {
      const freeStatus: SubscriptionStatus = {
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      };

      (premiumService.getSubscriptionStatus as jest.Mock)
        .mockResolvedValueOnce(freeStatus)
        .mockResolvedValueOnce(mockSubscriptionStatus);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(false);

      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('premium');
    });
  });
});

