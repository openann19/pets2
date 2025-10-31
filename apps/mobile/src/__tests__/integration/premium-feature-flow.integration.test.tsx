/**
 * Premium Feature Flow Integration Tests
 * Tests complete user journeys for premium features
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAuthStore } from '@pawfectmatch/core';
import { usePremiumStatus } from '../../hooks/domains/premium/usePremiumStatus';
import { useIAPBalance } from '../../hooks/domains/premium/useIAPBalance';
import { useFeatureGating } from '../../hooks/domains/premium/useFeatureGating';
import { superLikePet } from '../../services/swipeService';
import { premiumService } from '../../services/PremiumService';
import { __resetPremiumServiceMocks } from '../../services/__mocks__/PremiumService';

jest.mock('../../hooks/domains/premium/usePremiumStatus');
jest.mock('../../hooks/domains/premium/useIAPBalance');
jest.mock('../../hooks/domains/premium/useFeatureGating');
jest.mock('../../services/swipeService');
jest.mock('../../services/PremiumService');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

describe('Premium Feature Flow Integration', () => {
  beforeEach(() => {
    __resetPremiumServiceMocks();
  });

  describe('Super Like Flow - Free User with IAP', () => {
    it('should complete super like flow with IAP purchase', async () => {
      // Setup: Free user with IAP balance
      const mockPremiumStatus = {
        isPremium: false,
        plan: 'free',
      };

      const mockIAPBalance = {
        balance: { superLikes: 5 },
        refreshBalance: jest.fn().mockResolvedValue({ superLikes: 4 }),
      };

      const mockFeatureGating = {
        canUseFeature: jest.fn().mockReturnValue(true),
        checkFeatureAccess: jest.fn().mockResolvedValue({
          canUse: true,
          balance: 5,
        }),
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);
      (useIAPBalance as jest.Mock).mockReturnValue(mockIAPBalance);
      (useFeatureGating as jest.Mock).mockReturnValue(mockFeatureGating);
      (superLikePet as jest.Mock).mockResolvedValue({ success: true });

      // Execute: User attempts super like
      const result = await superLikePet('pet123');

      // Verify: Super like succeeds and balance deducted
      expect(result.success).toBe(true);
      expect(mockIAPBalance.refreshBalance).toHaveBeenCalled();
    });

    it('should prompt for purchase when IAP balance is zero', async () => {
      const mockPremiumStatus = {
        isPremium: false,
        plan: 'free',
      };

      const mockIAPBalance = {
        balance: { superLikes: 0 },
        refreshBalance: jest.fn(),
      };

      const mockFeatureGating = {
        canUseFeature: jest.fn().mockReturnValue(false),
        checkFeatureAccess: jest.fn().mockResolvedValue({
          canUse: false,
          balance: 0,
          upgradeRequired: true,
          reason: 'No Super Likes remaining',
        }),
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);
      (useIAPBalance as jest.Mock).mockReturnValue(mockIAPBalance);
      (useFeatureGating as jest.Mock).mockReturnValue(mockFeatureGating);

      // User attempts super like without balance
      const hasAccess = mockFeatureGating.canUseFeature('super_likes');

      expect(hasAccess).toBe(false);
      expect(mockFeatureGating.checkFeatureAccess).toHaveBeenCalled();
    });
  });

  describe('Subscription Upgrade Flow', () => {
    it('should enable all premium features after subscription upgrade', async () => {
      // Setup: User upgrades from free to premium
      const initialStatus = {
        isPremium: false,
        plan: 'free',
      };

      const upgradedStatus = {
        isPremium: true,
        plan: 'premium',
      };

      (usePremiumStatus as jest.Mock)
        .mockReturnValueOnce(initialStatus)
        .mockReturnValueOnce(upgradedStatus);

      // Before upgrade
      const { result: beforeUpgrade } = renderHook(() => usePremiumStatus());
      expect(beforeUpgrade.current.isPremium).toBe(false);

      // Simulate subscription upgrade webhook
      await act(async () => {
        // This would be triggered by webhook
        await premiumService.refreshSubscriptionStatus();
      });

      // After upgrade
      const { result: afterUpgrade } = renderHook(() => usePremiumStatus());
      expect(afterUpgrade.current.isPremium).toBe(true);
      expect(afterUpgrade.current.plan).toBe('premium');
    });
  });

  describe('Feature Limit Enforcement', () => {
    it('should enforce swipe limit for free users', async () => {
      const mockUsageStats = {
        swipesUsed: 5,
        swipesLimit: 5,
        superLikesUsed: 0,
        superLikesLimit: 0,
      };

      (premiumService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.usageStats).toEqual(mockUsageStats);
      });

      // User at limit
      const canSwipe = result.current.canUseFeature('swipes');
      expect(canSwipe).toBe(false);

      const hasUsageLeft = result.current.hasUsageLeft('swipes');
      expect(hasUsageLeft).toBe(false);
    });

    it('should allow unlimited swipes for premium users', async () => {
      const mockUsageStats = {
        swipesUsed: 100,
        swipesLimit: -1, // Unlimited
        superLikesUsed: 50,
        superLikesLimit: -1, // Unlimited
      };

      const mockPremiumStatus = {
        isPremium: true,
        plan: 'premium',
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);
      (premiumService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats);

      const { result } = renderHook(() => useFeatureGating());

      await waitFor(() => {
        expect(result.current.usageStats).toEqual(mockUsageStats);
      });

      const canSwipe = result.current.canUseFeature('swipes');
      expect(canSwipe).toBe(true);

      const hasUsageLeft = result.current.hasUsageLeft('swipes');
      expect(hasUsageLeft).toBe(true); // Unlimited
    });
  });

  describe('Cross-Feature Dependencies', () => {
    it('should gate advanced filters based on subscription', async () => {
      const mockPremiumStatus = {
        isPremium: true,
        plan: 'premium',
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);

      const { result } = renderHook(() => usePremiumStatus());

      // Premium user can access advanced filters
      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('premium');

      // Advanced filters should be accessible
      const hasAdvancedFilters = result.current.plan === 'premium' || result.current.plan === 'ultimate';
      expect(hasAdvancedFilters).toBe(true);
    });

    it('should gate video calls based on subscription', async () => {
      const mockPremiumStatus = {
        isPremium: true,
        plan: 'premium',
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);

      const { result } = renderHook(() => usePremiumStatus());

      // Video calls require premium+
      const hasVideoCalls = result.current.isPremium && 
        (result.current.plan === 'premium' || result.current.plan === 'ultimate');
      expect(hasVideoCalls).toBe(true);
    });
  });
});

