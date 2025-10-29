/**
 * Comprehensive tests for usePremiumStatus hook
 *
 * Coverage:
 * - Premium subscription status checking
 * - Real-time status updates
 * - Cache management
 * - Error handling
 * - Loading states
 * - Subscription state transitions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremiumStatus } from '../usePremiumStatus';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/premiumService', () => ({
  premiumService: {
    hasActiveSubscription: jest.fn(),
    getSubscriptionDetails: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { premiumService } from '../../../services/premiumService';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockPremiumService = premiumService as jest.Mocked<typeof premiumService>;

describe('usePremiumStatus', () => {
  const mockSubscriptionDetails = {
    isActive: true,
    plan: 'premium',
    features: ['unlimited_swipes', 'super_likes', 'boosts'],
    autoRenew: true,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);

    mockPremiumService.hasActiveSubscription.mockResolvedValue(true);
    mockPremiumService.getSubscriptionDetails.mockResolvedValue(mockSubscriptionDetails);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.isPremium).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.subscriptionDetails).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.lastChecked).toBeNull();
    });

    it('should load cached premium status on mount', async () => {
      const cachedData = {
        isPremium: true,
        subscriptionDetails: mockSubscriptionDetails,
        lastChecked: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isPremium).toBe(true);
        expect(result.current.subscriptionDetails).toEqual(mockSubscriptionDetails);
        expect(result.current.lastChecked).toBe(cachedData.lastChecked);
      });
    });

    it('should handle corrupted cache data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const { result } = renderHook(() => usePremiumStatus());

      // Should not crash, should use default state
      expect(result.current.isPremium).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Status Checking', () => {
    it('should check premium status successfully', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalled();
      expect(mockPremiumService.getSubscriptionDetails).toHaveBeenCalled();

      expect(result.current.isPremium).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.subscriptionDetails).toEqual(mockSubscriptionDetails);
      expect(result.current.lastChecked).toBeGreaterThan(0);
    });

    it('should handle inactive subscription', async () => {
      mockPremiumService.hasActiveSubscription.mockResolvedValue(false);

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.subscriptionDetails).toBeNull();
    });

    it('should handle loading state during status check', async () => {
      let resolveCheck: (value: boolean) => void;
      const checkPromise = new Promise<boolean>((resolve) => {
        resolveCheck = resolve;
      });

      mockPremiumService.hasActiveSubscription.mockReturnValue(checkPromise);

      const { result } = renderHook(() => usePremiumStatus());

      // Start check
      act(() => {
        result.current.checkStatus();
      });

      expect(result.current.isLoading).toBe(true);

      // Complete check
      act(() => {
        resolveCheck!(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isPremium).toBe(true);
      });
    });

    it('should handle status check errors', async () => {
      const errorMessage = 'Network error';
      mockPremiumService.hasActiveSubscription.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isPremium).toBe(false);
    });

    it('should clear previous errors on successful check', async () => {
      // First check fails
      mockPremiumService.hasActiveSubscription.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.error).toBe('First error');

      // Second check succeeds
      mockPremiumService.hasActiveSubscription.mockResolvedValueOnce(true);

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isPremium).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should cache premium status data', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'premium_status_cache',
        expect.any(String),
      );

      const cachedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(cachedData.isPremium).toBe(true);
      expect(cachedData.subscriptionDetails).toEqual(mockSubscriptionDetails);
      expect(cachedData.lastChecked).toBeDefined();
    });

    it('should use cached data when not expired', async () => {
      const recentCache = {
        isPremium: true,
        subscriptionDetails: mockSubscriptionDetails,
        lastChecked: Date.now() - 5 * 60 * 1000, // 5 minutes ago (within cache limit)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(recentCache));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isPremium).toBe(true);
      });

      // Should not make API calls for fresh cache
      expect(mockPremiumService.hasActiveSubscription).not.toHaveBeenCalled();
    });

    it('should refresh expired cache', async () => {
      const expiredCache = {
        isPremium: true,
        subscriptionDetails: mockSubscriptionDetails,
        lastChecked: Date.now() - 20 * 60 * 1000, // 20 minutes ago (expired)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredCache));

      const { result } = renderHook(() => usePremiumStatus());

      // Wait for cache to be checked and refreshed
      await waitFor(() => {
        expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalled();
      });
    });

    it('should clear cache when requested', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      // Set some cached data
      act(() => {
        result.current.isPremium = true;
        result.current.subscriptionDetails = mockSubscriptionDetails;
        result.current.lastChecked = Date.now();
      });

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.subscriptionDetails).toBeNull();
      expect(result.current.lastChecked).toBeNull();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('premium_status_cache');
    });
  });

  describe('Auto Refresh', () => {
    it('should auto-refresh status periodically', async () => {
      const { result } = renderHook(() =>
        usePremiumStatus({ autoRefresh: true, refreshInterval: 1000 }),
      );

      // Initial check
      await waitFor(() => {
        expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalledTimes(1);
      });

      // Advance time and wait for next refresh
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalledTimes(2);
      });
    });

    it('should disable auto-refresh when option is false', async () => {
      const { result } = renderHook(() => usePremiumStatus({ autoRefresh: false }));

      // Initial check
      await waitFor(() => {
        expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalledTimes(1);
      });

      // Advance time
      jest.advanceTimersByTime(5000);

      // Should not auto-refresh
      expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalledTimes(1);
    });

    it('should handle auto-refresh errors gracefully', async () => {
      mockPremiumService.hasActiveSubscription.mockRejectedValue(new Error('Refresh error'));

      const { result } = renderHook(() =>
        usePremiumStatus({ autoRefresh: true, refreshInterval: 1000 }),
      );

      // Initial check fails
      await waitFor(() => {
        expect(result.current.error).toBe('Refresh error');
      });

      // Advance time - should continue trying
      jest.advanceTimersByTime(1000);

      // Error should be cleared on next attempt
      mockPremiumService.hasActiveSubscription.mockResolvedValue(true);

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.isPremium).toBe(true);
      });
    });
  });

  describe('Subscription Details', () => {
    it('should fetch detailed subscription information', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.subscriptionDetails).toEqual(mockSubscriptionDetails);
    });

    it('should handle subscription details errors', async () => {
      mockPremiumService.getSubscriptionDetails.mockRejectedValue(new Error('Details error'));

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.subscriptionDetails).toBeNull();
      expect(result.current.error).toBe('Details error');
    });

    it('should provide subscription utilities', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.isSubscriptionActive()).toBe(true);
      expect(result.current.getDaysUntilRenewal()).toBeGreaterThan(25); // Approximately 30 days
      expect(result.current.hasFeature('unlimited_swipes')).toBe(true);
      expect(result.current.hasFeature('nonexistent_feature')).toBe(false);
    });

    it('should handle cancelled subscriptions', async () => {
      const cancelledDetails = {
        ...mockSubscriptionDetails,
        cancelAtPeriodEnd: true,
      };

      mockPremiumService.getSubscriptionDetails.mockResolvedValue(cancelledDetails);

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.isSubscriptionActive()).toBe(true); // Still active until period end
      expect(result.current.isSubscriptionCancelled()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during status check', async () => {
      mockPremiumService.hasActiveSubscription.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.error).toBe('Network Error');
    });

    it('should handle server errors with custom messages', async () => {
      mockPremiumService.hasActiveSubscription.mockRejectedValue({
        message: 'Subscription service unavailable',
      });

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.error).toBe('Subscription service unavailable');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      // Should still work despite cache failure
      expect(result.current.isPremium).toBe(true);
    });

    it('should reset error state on successful operations', async () => {
      // First operation fails
      mockPremiumService.hasActiveSubscription.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.error).toBe('First error');

      // Second operation succeeds
      mockPremiumService.hasActiveSubscription.mockResolvedValueOnce(true);

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty subscription details', async () => {
      mockPremiumService.getSubscriptionDetails.mockResolvedValue(null);

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.subscriptionDetails).toBeNull();
      expect(result.current.isPremium).toBe(true); // Status still true from hasActiveSubscription
    });

    it('should handle subscription with no features', async () => {
      const noFeaturesDetails = {
        ...mockSubscriptionDetails,
        features: [],
      };

      mockPremiumService.getSubscriptionDetails.mockResolvedValue(noFeaturesDetails);

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(result.current.hasFeature('any_feature')).toBe(false);
    });

    it('should handle very old cached data', async () => {
      const veryOldCache = {
        isPremium: false,
        subscriptionDetails: null,
        lastChecked: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(veryOldCache));

      const { result } = renderHook(() => usePremiumStatus());

      // Should refresh old cache
      await waitFor(() => {
        expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalled();
      });
    });

    it('should handle rapid consecutive status checks', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      // Multiple rapid checks
      await act(async () => {
        await Promise.all([
          result.current.checkStatus(),
          result.current.checkStatus(),
          result.current.checkStatus(),
        ]);
      });

      // Should only make one API call (due to loading state management)
      expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalledTimes(1);
    });

    it('should handle malformed subscription data', async () => {
      const malformedDetails = {
        isActive: true,
        // Missing required fields
      };

      mockPremiumService.getSubscriptionDetails.mockResolvedValue(malformedDetails as any);

      const { result } = renderHook(() => usePremiumStatus());

      await act(async () => {
        await result.current.checkStatus();
      });

      // Should handle gracefully
      expect(result.current.subscriptionDetails).toBeDefined();
    });
  });

  describe('Hook Configuration', () => {
    it('should accept custom cache key', async () => {
      const { result } = renderHook(() => usePremiumStatus({ cacheKey: 'custom_premium_cache' }));

      await act(async () => {
        await result.current.checkStatus();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'custom_premium_cache',
        expect.any(String),
      );
    });

    it('should accept custom cache expiration', async () => {
      const { result } = renderHook(
        () => usePremiumStatus({ cacheExpirationMs: 1000 }), // Very short cache
      );

      await act(async () => {
        await result.current.checkStatus();
      });

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await act(async () => {
        await result.current.checkStatus(); // Should refresh
      });

      expect(mockPremiumService.hasActiveSubscription).toHaveBeenCalledTimes(2);
    });
  });
});
