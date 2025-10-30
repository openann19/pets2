/**
 * Comprehensive tests for useFeatureGating hook
 *
 * Coverage:
 * - Feature access control based on subscription tier
 * - Feature limit enforcement
 * - Usage tracking and limits
 * - Graceful degradation for free users
 * - Real-time limit updates
 * - Feature-specific configurations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFeatureGating } from '../useFeatureGating';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/premiumService', () => ({
  premiumService: {
    getUsageStats: jest.fn(),
    getSubscriptionDetails: jest.fn(),
    hasActiveSubscription: jest.fn(),
  },
}));

// Mock premium status hook
jest.mock('../usePremiumStatus', () => ({
  usePremiumStatus: jest.fn(),
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
import { usePremiumStatus } from '../usePremiumStatus';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockPremiumService = premiumService as jest.Mocked<typeof premiumService>;
const mockUsePremiumStatus = usePremiumStatus as jest.Mock;

describe('useFeatureGating', () => {
  const mockUsageStats = {
    swipesUsed: 25,
    swipesLimit: 50,
    superLikesUsed: 3,
    superLikesLimit: 5,
    boostsUsed: 1,
    boostsLimit: 3,
    profileViews: 150,
    messagesSent: 45,
    matchRate: 0.3,
  };

  const mockPremiumStatus = {
    isPremium: true,
    isLoading: false,
    subscriptionDetails: {
      isActive: true,
      plan: 'premium',
      features: ['unlimited_swipes', 'super_likes', 'boosts'],
    },
    error: null,
    lastChecked: Date.now(),
    checkStatus: jest.fn(),
    clearCache: jest.fn(),
    isSubscriptionActive: jest.fn().mockReturnValue(true),
    getDaysUntilRenewal: jest.fn().mockReturnValue(25),
    hasFeature: jest.fn().mockReturnValue(true),
    isSubscriptionCancelled: jest.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    mockPremiumService.getUsageStats.mockResolvedValue(mockUsageStats);
    mockUsePremiumStatus.mockReturnValue(mockPremiumStatus);
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useFeatureGating());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.features).toEqual({});
      expect(result.current.usageStats).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should load initial data on mount', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.usageStats).toEqual(mockUsageStats);
      expect(mockPremiumService.getUsageStats).toHaveBeenCalled();
    });
  });

  describe('Feature Access Control', () => {
    it('should allow access to premium features for premium users', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canUseFeature('super_likes')).toBe(true);
      expect(result.current.canUseFeature('boosts')).toBe(true);
      expect(result.current.canUseFeature('unlimited_swipes')).toBe(true);
    });

    it('should deny access to premium features for free users', async () => {
      const freeUserStatus = {
        ...mockPremiumStatus,
        isPremium: false,
        hasFeature: jest.fn().mockReturnValue(false),
      };

      mockUsePremiumStatus.mockReturnValue(freeUserStatus);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canUseFeature('super_likes')).toBe(false);
      expect(result.current.canUseFeature('boosts')).toBe(false);
    });

    it('should allow access to free features for all users', async () => {
      const freeUserStatus = {
        ...mockPremiumStatus,
        isPremium: false,
        hasFeature: jest.fn().mockReturnValue(false),
      };

      mockUsePremiumStatus.mockReturnValue(freeUserStatus);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Basic features should be available to all users
      expect(result.current.canUseFeature('basic_swipes')).toBe(true);
      expect(result.current.canUseFeature('view_profiles')).toBe(true);
    });
  });

  describe('Usage Limits', () => {
    it('should check usage limits correctly', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Under limit
      expect(result.current.hasUsageLeft('swipes')).toBe(true);
      expect(result.current.getUsageLeft('swipes')).toBe(25); // 50 - 25

      // At limit
      const highUsageStats = { ...mockUsageStats, swipesUsed: 50 };
      mockPremiumService.getUsageStats.mockResolvedValue(highUsageStats);

      await act(async () => {
        await result.current.refreshUsageStats();
      });

      expect(result.current.hasUsageLeft('swipes')).toBe(false);
      expect(result.current.getUsageLeft('swipes')).toBe(0);
    });

    it('should provide unlimited access for premium features', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Premium users should have unlimited access to premium features
      expect(result.current.hasUsageLeft('super_likes')).toBe(true);
      expect(result.current.getUsageLeft('super_likes')).toBe(-1); // Unlimited
    });

    it('should handle unknown features gracefully', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canUseFeature('unknown_feature')).toBe(false);
      expect(result.current.hasUsageLeft('unknown_feature')).toBe(false);
      expect(result.current.getUsageLeft('unknown_feature')).toBe(0);
    });
  });

  describe('Usage Tracking', () => {
    it('should track feature usage', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const canUse = await result.current.useFeature('swipes');
        expect(canUse).toBe(true);
      });

      // Should trigger usage stats refresh
      expect(mockPremiumService.getUsageStats).toHaveBeenCalledTimes(2);
    });

    it('should prevent usage when at limit', async () => {
      const atLimitStats = { ...mockUsageStats, swipesUsed: 50 };
      mockPremiumService.getUsageStats.mockResolvedValue(atLimitStats);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const canUse = await result.current.useFeature('swipes');
        expect(canUse).toBe(false);
      });
    });

    it('should allow unlimited usage for premium features', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Multiple uses of premium feature
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          const canUse = await result.current.useFeature('super_likes');
          expect(canUse).toBe(true);
        });
      }
    });
  });

  describe('Feature Configurations', () => {
    it('should provide feature-specific configurations', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const swipesConfig = result.current.getFeatureConfig('swipes');
      expect(swipesConfig).toEqual({
        enabled: true,
        limit: 50,
        used: 25,
        isPremium: true,
        resetDate: expect.any(Date),
      });

      const boostsConfig = result.current.getFeatureConfig('boosts');
      expect(boostsConfig.isPremium).toBe(true);
      expect(boostsConfig.limit).toBe(-1); // Unlimited
    });

    it('should provide different configs for free vs premium users', async () => {
      const freeUserStatus = {
        ...mockPremiumStatus,
        isPremium: false,
        hasFeature: jest.fn().mockReturnValue(false),
      };

      mockUsePremiumStatus.mockReturnValue(freeUserStatus);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const swipesConfig = result.current.getFeatureConfig('swipes');
      expect(swipesConfig.limit).toBe(50); // Same limit but not premium
      expect(swipesConfig.isPremium).toBe(false);
    });
  });

  describe('Refresh and Updates', () => {
    it('should refresh usage stats on demand', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedStats = { ...mockUsageStats, swipesUsed: 30 };
      mockPremiumService.getUsageStats.mockResolvedValue(updatedStats);

      await act(async () => {
        await result.current.refreshUsageStats();
      });

      expect(result.current.usageStats?.swipesUsed).toBe(30);
      expect(mockPremiumService.getUsageStats).toHaveBeenCalledTimes(2);
    });

    it('should handle refresh errors gracefully', async () => {
      mockPremiumService.getUsageStats.mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshUsageStats();
      });

      expect(result.current.error).toBe('Refresh failed');
      // Should keep previous stats
      expect(result.current.usageStats).toEqual(mockUsageStats);
    });
  });

  describe('Error Handling', () => {
    it('should handle initial data loading errors', async () => {
      mockPremiumService.getUsageStats.mockRejectedValue(new Error('Loading failed'));

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Loading failed');
      expect(result.current.usageStats).toBeNull();
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still work despite storage errors
      expect(result.current.usageStats).toEqual(mockUsageStats);
    });

    it('should reset error state on successful operations', async () => {
      // First operation fails
      mockPremiumService.getUsageStats.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Second operation succeeds
      mockPremiumService.getUsageStats.mockResolvedValueOnce(mockUsageStats);

      await act(async () => {
        await result.current.refreshUsageStats();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Premium Status Integration', () => {
    it('should react to premium status changes', async () => {
      let currentStatus = { ...mockPremiumStatus };

      mockUsePremiumStatus.mockImplementation(() => currentStatus);

      const { result, rerender } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially premium
      expect(result.current.canUseFeature('boosts')).toBe(true);

      // Change to free user
      currentStatus = {
        ...mockPremiumStatus,
        isPremium: false,
        hasFeature: jest.fn().mockReturnValue(false),
      };

      rerender();

      await waitFor(() => {
        expect(result.current.canUseFeature('boosts')).toBe(false);
      });
    });

    it('should handle premium status loading states', async () => {
      const loadingStatus = {
        ...mockPremiumStatus,
        isLoading: true,
      };

      mockUsePremiumStatus.mockReturnValue(loadingStatus);

      const { result } = renderHook(() => useFeatureGating());

      // Should still show features as available during loading
      expect(result.current.canUseFeature('swipes')).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should cache feature configurations', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'feature_gating_cache',
        expect.any(String),
      );
    });

    it('should load cached data on mount', async () => {
      const cachedData = {
        features: { swipes: { enabled: true, limit: 50, used: 20 } },
        usageStats: mockUsageStats,
        lastUpdated: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.usageStats).toEqual(mockUsageStats);
      });

      // Should not make API calls for fresh cache
      expect(mockPremiumService.getUsageStats).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty usage stats', async () => {
      const emptyStats = {
        swipesUsed: 0,
        swipesLimit: 0,
        superLikesUsed: 0,
        superLikesLimit: 0,
        boostsUsed: 0,
        boostsLimit: 0,
        profileViews: 0,
        messagesSent: 0,
        matchRate: 0,
      };

      mockPremiumService.getUsageStats.mockResolvedValue(emptyStats);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasUsageLeft('swipes')).toBe(false);
      expect(result.current.getUsageLeft('swipes')).toBe(0);
    });

    it('should handle negative usage values', async () => {
      const negativeStats = {
        ...mockUsageStats,
        swipesUsed: -5, // Invalid negative value
      };

      mockPremiumService.getUsageStats.mockResolvedValue(negativeStats);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle gracefully (treat as 0)
      expect(result.current.getUsageLeft('swipes')).toBe(55); // 50 - 0
    });

    it('should handle very high usage limits', async () => {
      const unlimitedStats = {
        ...mockUsageStats,
        swipesLimit: 999999, // Very high limit
      };

      mockPremiumService.getUsageStats.mockResolvedValue(unlimitedStats);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasUsageLeft('swipes')).toBe(true);
      expect(result.current.getUsageLeft('swipes')).toBe(999974);
    });

    it('should handle concurrent feature usage attempts', async () => {
      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Multiple concurrent usage attempts
      const usagePromises = Array.from({ length: 10 }, () =>
        act(async () => result.current.useFeature('swipes')),
      );

      const results = await Promise.all(usagePromises);

      // Should handle all requests
      expect(results.every((r) => r === true)).toBe(true);
    });

    it('should handle malformed feature configurations', async () => {
      // Temporarily break the hook to test error handling
      const originalUsePremiumStatus = mockUsePremiumStatus.getMockImplementation();

      mockUsePremiumStatus.mockReturnValue({
        ...mockPremiumStatus,
        hasFeature: undefined, // Break the function
      });

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle gracefully
      expect(result.current.canUseFeature('swipes')).toBe(true); // Default to true
    });
  });
});
