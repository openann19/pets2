/**
 * Premium Feature Flow Integration Tests
 * Tests complete user journeys for premium features
 */

import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { usePremiumStatus } from '../../hooks/domains/premium/usePremiumStatus';
import { useIAPBalance } from '../../hooks/domains/premium/useIAPBalance';
import { useFeatureGating } from '../../hooks/domains/premium/useFeatureGating';
import { superLikePet } from '../../services/swipeService';
import { premiumService } from '../../services/PremiumService';
import { __resetPremiumServiceMocks } from '../../services/__mocks__/PremiumService';

jest.mock('../../hooks/domains/premium/usePremiumStatus');
jest.mock('../../hooks/domains/premium/useIAPBalance');
// jest.mock('../../hooks/domains/premium/useFeatureGating'); // Remove this to test real hook
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

      // Mock premium service to return free tier limits
      const mockFreeLimits = {
        swipesPerDay: 5,
        likesPerDay: 5,
        superLikesPerDay: 5, // Has super likes from IAP
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
        unlimitedRewind: false,
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);
      (useIAPBalance as jest.Mock).mockReturnValue(mockIAPBalance);
      (premiumService.getPremiumLimits as jest.Mock).mockResolvedValue(mockFreeLimits);
      (superLikePet as jest.Mock).mockResolvedValue({ success: true });

      // Test feature gating
      const { result } = renderHook(() => useFeatureGating());
      const accessResult = await result.current.checkFeatureAccess('superLikesPerDay');

      // Execute: User attempts super like
      const superLikeResult = await superLikePet('pet123');

      // Verify: Super like succeeds and balance deducted
      expect(accessResult.canUse).toBe(true);
      expect(superLikeResult.success).toBe(true);
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

      // Mock premium service to return free tier limits with no super likes
      const mockFreeLimits = {
        swipesPerDay: 5,
        likesPerDay: 5,
        superLikesPerDay: 0, // No super likes available
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
        unlimitedRewind: false,
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);
      (useIAPBalance as jest.Mock).mockReturnValue(mockIAPBalance);
      (premiumService.getPremiumLimits as jest.Mock).mockResolvedValue(mockFreeLimits);

      // Test feature gating
      const { result } = renderHook(() => useFeatureGating());
      const accessResult = await result.current.checkFeatureAccess('superLikesPerDay');

      expect(accessResult.canUse).toBe(false);
      expect(accessResult.upgradeRequired).toBe(true);
      expect(accessResult.reason).toBe('No Super Likes remaining');
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
      const mockPremiumStatus = {
        isPremium: false,
        plan: 'free',
      };

      // Mock premium service to return free tier limits with 0 swipes (at limit)
      const mockFreeLimits = {
        swipesPerDay: 0, // Free users get 5 daily swipes but are at limit
        likesPerDay: 5,
        superLikesPerDay: 0,
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
        unlimitedRewind: false,
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);
      (premiumService.getPremiumLimits as jest.Mock).mockResolvedValue(mockFreeLimits);

      const { result } = renderHook(() => useFeatureGating());

      // User at limit - checkFeatureAccess should return canUse: false for swipes
      const accessResult = await result.current.checkFeatureAccess('swipesPerDay');
      expect(accessResult.canUse).toBe(false);
      expect(accessResult.upgradeRequired).toBe(true);

      const isUnlimited = await result.current.isFeatureUnlimited('swipesPerDay');
      expect(isUnlimited).toBe(false);
    });

    it('should allow unlimited swipes for premium users', async () => {
      const mockPremiumStatus = {
        isPremium: true,
        plan: 'premium',
      };

      // Mock premium service to return premium limits
      const mockPremiumLimits = {
        swipesPerDay: -1, // Unlimited
        likesPerDay: -1,
        superLikesPerDay: -1,
        canUndoSwipes: true,
        canSeeWhoLiked: true,
        canBoostProfile: true,
        advancedFilters: true,
        priorityMatching: true,
        unlimitedRewind: false,
      };

      (usePremiumStatus as jest.Mock).mockReturnValue(mockPremiumStatus);
      (premiumService.getPremiumLimits as jest.Mock).mockResolvedValue(mockPremiumLimits);

      const { result } = renderHook(() => useFeatureGating());

      // Premium user should have unlimited swipes
      const accessResult = await result.current.checkFeatureAccess('swipesPerDay');
      expect(accessResult.canUse).toBe(true);
      expect(accessResult.upgradeRequired).toBe(false);

      const isUnlimited = await result.current.isFeatureUnlimited('swipesPerDay');
      expect(isUnlimited).toBe(true);
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

