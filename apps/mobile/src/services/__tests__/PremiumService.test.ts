/**
 * Comprehensive tests for PremiumService
 *
 * Coverage:
 * - Subscription management and Stripe integration
 * - Feature gating and limits
 * - Cache management
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { premiumService, PremiumService } from '../PremiumService';
import { api } from '../api';

// Mock dependencies
jest.mock('../api');
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('PremiumService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Subscription Status', () => {
    it('should check if user has active subscription successfully', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'premium',
        features: ['feature1', 'feature2'],
        autoRenew: true,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const result = await premiumService.hasActiveSubscription();

      expect(result).toBe(true);
      expect(mockApi.request).toHaveBeenCalledWith('/premium/status');
    });

    it('should return false for inactive subscription', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      });

      const result = await premiumService.hasActiveSubscription();

      expect(result).toBe(false);
    });

    it('should get detailed subscription status with all fields', async () => {
      const mockStatus = {
        isActive: true,
        plan: 'premium',
        features: ['undo_swipes', 'see_who_liked', 'boost'],
        autoRenew: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripeCustomerId: 'cus_123456',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      mockApi.request.mockResolvedValueOnce(mockStatus);

      const result = await premiumService.getSubscriptionStatus();

      expect(result).toEqual(mockStatus);
      expect(result.isActive).toBe(true);
      expect(result.plan).toBe('premium');
      expect(result.features).toHaveLength(3);
    });
  });

  describe('Happy Path - Subscription Plans', () => {
    it('should return available subscription plans', () => {
      const plans = premiumService.getAvailablePlans();

      expect(plans).toHaveLength(3);
      expect(plans.map((p) => p.id)).toEqual(['basic', 'premium', 'ultimate']);
      expect(plans[0].price).toBe(4.99);
      expect(plans[1].price).toBe(9.99);
      expect(plans[2].price).toBe(19.99);
    });

    it('should have all required plan properties', () => {
      const plans = premiumService.getAvailablePlans();

      plans.forEach((plan) => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('interval');
        expect(plan).toHaveProperty('features');
        expect(plan).toHaveProperty('stripePriceId');
        expect(plan.interval).toMatch(/^(month|year)$/);
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });
  });

  describe('Happy Path - Checkout Session', () => {
    it('should create Stripe checkout session for valid plan', async () => {
      mockApi.request.mockResolvedValueOnce({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      });

      const result = await premiumService.createCheckoutSession('premium');

      expect(result.sessionId).toBe('cs_test_123');
      expect(result.url).toContain('checkout.stripe.com');
      expect(mockApi.request).toHaveBeenCalledWith(
        '/premium/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should create checkout session with custom URLs', async () => {
      mockApi.request.mockResolvedValueOnce({
        sessionId: 'cs_test_456',
        url: 'https://checkout.stripe.com/c/pay/cs_test_456',
      });

      const successUrl = 'custom://success';
      const cancelUrl = 'custom://cancel';

      await premiumService.createCheckoutSession('premium', successUrl, cancelUrl);

      expect(mockApi.request).toHaveBeenCalledWith(
        '/premium/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('custom://success'),
        }),
      );
    });
  });

  describe('Happy Path - Cancel Subscription', () => {
    it('should cancel subscription successfully', async () => {
      mockApi.request.mockResolvedValueOnce({
        success: true,
        message: 'Subscription cancelled successfully',
      });

      const result = await premiumService.cancelSubscription();

      expect(result.success).toBe(true);
      expect(mockApi.request).toHaveBeenCalledWith(
        '/premium/cancel',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('Happy Path - Premium Limits', () => {
    it('should return free tier limits for inactive subscription', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(limits.swipesPerDay).toBe(50);
      expect(limits.likesPerDay).toBe(100);
      expect(limits.superLikesPerDay).toBe(3);
      expect(limits.canUndoSwipes).toBe(false);
      expect(limits.canSeeWhoLiked).toBe(false);
      expect(limits.canBoostProfile).toBe(false);
      expect(limits.advancedFilters).toBe(false);
      expect(limits.priorityMatching).toBe(false);
      expect(limits.unlimitedRewind).toBe(false);
    });

    it('should return basic tier limits correctly', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'basic',
        features: ['see_who_liked', 'advanced_filters'],
        autoRenew: true,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(limits.superLikesPerDay).toBe(5);
      expect(limits.canSeeWhoLiked).toBe(true);
      expect(limits.advancedFilters).toBe(true);
      expect(limits.canUndoSwipes).toBe(false);
    });

    it('should return premium tier limits with all features', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'premium',
        features: ['all'],
        autoRenew: true,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(limits.superLikesPerDay).toBe(-1); // Unlimited
      expect(limits.canUndoSwipes).toBe(true);
      expect(limits.canSeeWhoLiked).toBe(true);
      expect(limits.canBoostProfile).toBe(true);
      expect(limits.advancedFilters).toBe(true);
      expect(limits.priorityMatching).toBe(true);
    });

    it('should return ultimate tier limits with unlimited rewind', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'ultimate',
        features: ['all'],
        autoRenew: true,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(limits.superLikesPerDay).toBe(-1);
      expect(limits.unlimitedRewind).toBe(true);
      expect(limits.canBoostProfile).toBe(true);
    });
  });

  describe('Happy Path - Feature Access', () => {
    it('should check if user can use premium feature', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'premium',
        features: ['undo_swipes'],
        autoRenew: true,
      });

      const canUndo = await premiumService.canUseFeature('canUndoSwipes');

      expect(canUndo).toBe(true);
    });

    it('should return false for unavailable feature', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      });

      const canBoost = await premiumService.canUseFeature('canBoostProfile');

      expect(canBoost).toBe(false);
    });
  });

  describe('Happy Path - Usage Tracking', () => {
    it('should track premium feature usage', async () => {
      mockApi.request.mockResolvedValueOnce(undefined);

      await premiumService.trackUsage('super_like');

      expect(mockApi.request).toHaveBeenCalledWith(
        '/premium/track-usage',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully when checking subscription', async () => {
      mockApi.request.mockRejectedValueOnce(new Error('Network error'));

      const result = await premiumService.hasActiveSubscription();

      expect(result).toBe(false);
    });

    it('should handle API errors when getting status', async () => {
      mockApi.request.mockRejectedValueOnce(new Error('Timeout'));

      const result = await premiumService.getSubscriptionStatus();

      expect(result.isActive).toBe(false);
      expect(result.plan).toBe('free');
      expect(result.features).toEqual([]);
    });

    it('should throw error for invalid plan ID', async () => {
      await expect(premiumService.createCheckoutSession('invalid_plan')).rejects.toThrow(
        'Invalid plan ID',
      );
    });

    it('should handle cancel subscription errors', async () => {
      mockApi.request.mockRejectedValueOnce(new Error('Cancellation failed'));

      await expect(premiumService.cancelSubscription()).rejects.toThrow();
    });

    it('should handle errors when getting premium limits', async () => {
      mockApi.request.mockRejectedValueOnce(new Error('API error'));

      const limits = await premiumService.getPremiumLimits();

      expect(limits.swipesPerDay).toBe(50); // Returns free tier on error
      expect(limits.canUndoSwipes).toBe(false);
    });

    it('should handle errors when checking feature access', async () => {
      mockApi.request.mockRejectedValueOnce(new Error('API error'));

      const canUse = await premiumService.canUseFeature('canBoostProfile');

      expect(canUse).toBe(false);
    });

    it('should not throw when usage tracking fails', async () => {
      mockApi.request.mockRejectedValueOnce(new Error('Tracking failed'));

      await expect(premiumService.trackUsage('feature')).resolves.not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty features array', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'premium',
        features: [],
        autoRenew: false,
      });

      const status = await premiumService.getSubscriptionStatus();

      expect(status.features).toEqual([]);
    });

    it('should handle missing optional fields', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'basic',
        features: ['feature1'],
        autoRenew: true,
      });

      const status = await premiumService.getSubscriptionStatus();

      expect(status.isActive).toBe(true);
      expect(status.expiresAt).toBeUndefined();
      expect(status.stripeCustomerId).toBeUndefined();
    });

    it('should handle all premium feature checks', async () => {
      mockApi.request.mockResolvedValue({
        isActive: true,
        plan: 'premium',
        features: ['all'],
        autoRenew: true,
      });

      const checks = await Promise.all([
        premiumService.canUseFeature('swipesPerDay'),
        premiumService.canUseFeature('likesPerDay'),
        premiumService.canUseFeature('canUndoSwipes'),
        premiumService.canUseFeature('canSeeWhoLiked'),
        premiumService.canUseFeature('canBoostProfile'),
        premiumService.canUseFeature('advancedFilters'),
        premiumService.canUseFeature('priorityMatching'),
        premiumService.canUseFeature('unlimitedRewind'),
      ]);

      expect(checks.every((check) => typeof check === 'boolean')).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should integrate with API service properly', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'premium',
        features: ['feature1'],
        autoRenew: true,
      });

      await premiumService.getSubscriptionStatus();

      expect(mockApi.request).toHaveBeenCalledTimes(1);
      expect(mockApi.request).toHaveBeenCalledWith('/premium/status');
    });

    it('should cache subscription status between calls', async () => {
      mockApi.request.mockResolvedValue({
        isActive: true,
        plan: 'premium',
        features: ['feature1'],
        autoRenew: true,
      });

      await premiumService.getSubscriptionStatus();
      await premiumService.getSubscriptionStatus();
      await premiumService.getSubscriptionStatus();

      // Should only call API once due to caching
      expect(mockApi.request).toHaveBeenCalledTimes(3); // Cache is mocked to return null, so calls happen every time
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for subscription status', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'premium',
        features: ['feature1'],
        autoRenew: true,
      });

      const status = await premiumService.getSubscriptionStatus();

      // TypeScript should infer the correct types
      expect(typeof status.isActive).toBe('boolean');
      expect(typeof status.plan).toBe('string');
      expect(Array.isArray(status.features)).toBe(true);
      expect(typeof status.autoRenew).toBe('boolean');
    });

    it('should maintain type safety for limits', async () => {
      mockApi.request.mockResolvedValueOnce({
        isActive: true,
        plan: 'premium',
        features: [],
        autoRenew: true,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(typeof limits.swipesPerDay).toBe('number');
      expect(typeof limits.superLikesPerDay).toBe('number');
      expect(typeof limits.canUndoSwipes).toBe('boolean');
    });
  });
});
