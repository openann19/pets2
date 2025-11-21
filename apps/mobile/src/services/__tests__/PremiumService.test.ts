/**
 * PremiumService Test Suite
 * Comprehensive tests for premium subscription functionality
 * 
 * WI-005: Premium Subscription Gating
 */
import { premiumService } from "../PremiumService";
import { api } from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@pawfectmatch/core";

// Mock dependencies
jest.mock("../api");
jest.mock("@react-native-async-storage/async-storage");
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe("PremiumService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear AsyncStorage
    mockedAsyncStorage.getItem.mockResolvedValue(null);
    mockedAsyncStorage.setItem.mockResolvedValue();
  });

  describe("Subscription Status", () => {
    it("should return active subscription status", async () => {
      const mockStatus = {
        isActive: true,
        plan: "premium",
        features: ["unlimited_swipes", "ai_matching"],
        autoRenew: true,
        stripeCustomerId: "cus_123",
        currentPeriodEnd: "2024-12-31T23:59:59Z",
      };

      mockedApi.request.mockResolvedValue(mockStatus);

      const status = await premiumService.getSubscriptionStatus();

      expect(status).toEqual(mockStatus);
      expect(mockedApi.request).toHaveBeenCalledWith("/premium/status");
    });

    it("should return free tier status when API fails", async () => {
      mockedApi.request.mockRejectedValue(new Error("API Error"));

      const status = await premiumService.getSubscriptionStatus();

      expect(status).toEqual({
        isActive: false,
        plan: "free",
        features: [],
        autoRenew: false,
      });
    });

    it("should cache subscription status", async () => {
      const mockStatus = {
        isActive: true,
        plan: "premium",
        features: ["unlimited_swipes"],
        autoRenew: true,
      };

      mockedApi.request.mockResolvedValue(mockStatus);

      await premiumService.getSubscriptionStatus();

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        "premium_status_cache",
        expect.stringContaining('"isActive":true')
      );
    });

    it("should use cached status when valid", async () => {
      const cachedStatus = {
        status: {
          isActive: true,
          plan: "premium",
          features: ["unlimited_swipes"],
          autoRenew: true,
        },
        timestamp: Date.now() - 2 * 60 * 1000, // 2 minutes ago
      };

      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedStatus));

      const status = await premiumService.getSubscriptionStatus();

      expect(status).toEqual(cachedStatus.status);
      expect(mockedApi.request).not.toHaveBeenCalled();
    });
  });

  describe("Premium Limits", () => {
    it("should return free tier limits for non-subscribers", async () => {
      mockedApi.request.mockResolvedValue({
        isActive: false,
        plan: "free",
        features: [],
        autoRenew: false,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(limits).toEqual({
        swipesPerDay: 50,
        likesPerDay: 100,
        superLikesPerDay: 3,
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
        unlimitedRewind: false,
      });
    });

    it("should return premium limits for premium subscribers", async () => {
      mockedApi.request.mockResolvedValue({
        isActive: true,
        plan: "premium",
        features: ["unlimited_swipes"],
        autoRenew: true,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(limits).toEqual({
        swipesPerDay: 50,
        likesPerDay: 100,
        superLikesPerDay: -1, // Unlimited
        canUndoSwipes: true,
        canSeeWhoLiked: true,
        canBoostProfile: true,
        advancedFilters: true,
        priorityMatching: true,
        unlimitedRewind: false,
      });
    });

    it("should return ultimate limits for ultimate subscribers", async () => {
      mockedApi.request.mockResolvedValue({
        isActive: true,
        plan: "ultimate",
        features: ["unlimited_swipes"],
        autoRenew: true,
      });

      const limits = await premiumService.getPremiumLimits();

      expect(limits).toEqual({
        swipesPerDay: 50,
        likesPerDay: 100,
        superLikesPerDay: -1, // Unlimited
        canUndoSwipes: true,
        canSeeWhoLiked: true,
        canBoostProfile: true,
        advancedFilters: true,
        priorityMatching: true,
        unlimitedRewind: true,
      });
    });
  });

  describe("Feature Access", () => {
    it("should allow access to boolean features for premium users", async () => {
      mockedApi.request
        .mockResolvedValueOnce({
          isActive: true,
          plan: "premium",
          features: [],
          autoRenew: true,
        })
        .mockResolvedValueOnce({ count: 5 });

      const canUse = await premiumService.canUseFeature("canUndoSwipes");

      expect(canUse).toBe(true);
    });

    it("should check numeric limits for usage-based features", async () => {
      mockedApi.request
        .mockResolvedValueOnce({
          isActive: true,
          plan: "premium",
          features: [],
          autoRenew: true,
        })
        .mockResolvedValueOnce({ count: 3 });

      const canUse = await premiumService.canUseFeature("superLikesPerDay");

      expect(canUse).toBe(true);
      expect(mockedApi.request).toHaveBeenCalledWith("/premium/usage/superLikesPerDay");
    });

    it("should deny access when usage limit exceeded", async () => {
      mockedApi.request
        .mockResolvedValueOnce({
          isActive: true,
          plan: "premium",
          features: [],
          autoRenew: true,
        })
        .mockResolvedValueOnce({ count: 10 });

      const canUse = await premiumService.canUseFeature("likesPerDay");

      expect(canUse).toBe(false);
    });
  });

  describe("Usage Tracking", () => {
    it("should track feature usage", async () => {
      mockedApi.request.mockResolvedValue({});

      await premiumService.trackUsage("swipe_like");

      expect(mockedApi.request).toHaveBeenCalledWith("/premium/usage", {
        method: "POST",
        body: { feature: "swipe_like", timestamp: expect.any(Number) },
      });
    });

    it("should not throw on tracking failure", async () => {
      mockedApi.request.mockRejectedValue(new Error("Tracking failed"));

      await expect(premiumService.trackUsage("swipe_like")).resolves.not.toThrow();
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Failed to track usage",
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe("Subscription Plans", () => {
    it("should return available plans", () => {
      const plans = premiumService.getAvailablePlans();

      expect(plans).toHaveLength(3);
      expect(plans[0].id).toBe("basic");
      expect(plans[1].id).toBe("premium");
      expect(plans[2].id).toBe("ultimate");
    });

    it("should find plan by ID", () => {
      const plan = premiumService.getPlanById("premium");

      expect(plan).not.toBeNull();
      expect(plan?.name).toBe("Premium");
      expect(plan?.price).toBe(9.99);
    });

    it("should return null for non-existent plan", () => {
      const plan = premiumService.getPlanById("nonexistent");

      expect(plan).toBeNull();
    });
  });

  describe("Stripe Integration", () => {
    it("should initialize payment sheet successfully", async () => {
      const mockCheckoutSession = {
        clientSecret: "pi_123_secret_456",
      };

      mockedApi.request.mockResolvedValue(mockCheckoutSession);

      // Mock Stripe functions
      const mockInitPaymentSheet = jest.fn().mockResolvedValue({});
      jest.doMock("@stripe/stripe-react-native", () => ({
        initPaymentSheet: mockInitPaymentSheet,
        presentPaymentSheet: jest.fn(),
      }));

      const result = await premiumService.initializePaymentSheet("premium");

      expect(result.success).toBe(true);
      expect(mockedApi.request).toHaveBeenCalledWith("/premium/checkout", {
        method: "POST",
        body: expect.objectContaining({
          priceId: expect.any(String),
          successUrl: "pawfectmatch://premium/success",
          cancelUrl: "pawfectmatch://premium/cancel",
        }),
      });
    });

    it("should handle payment sheet initialization failure", async () => {
      mockedApi.request.mockRejectedValue(new Error("Checkout failed"));

      const result = await premiumService.initializePaymentSheet("premium");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Checkout failed");
    });

    it("should handle invalid plan ID", async () => {
      const result = await premiumService.initializePaymentSheet("invalid");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Plan invalid not found");
    });
  });

  describe("Restore Purchases", () => {
    it("should restore purchases successfully", async () => {
      mockedApi.request.mockResolvedValue({
        success: true,
        message: "Purchases restored successfully",
      });

      const result = await premiumService.restorePurchases();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Purchases restored successfully");
      expect(mockedApi.request).toHaveBeenCalledWith("/premium/restore", {
        method: "POST",
      });
    });

    it("should handle no purchases found", async () => {
      mockedApi.request.mockResolvedValue({
        success: false,
        message: "No purchases found to restore",
      });

      const result = await premiumService.restorePurchases();

      expect(result.success).toBe(false);
      expect(result.message).toBe("No purchases found to restore");
    });

    it("should handle restore failure", async () => {
      mockedApi.request.mockRejectedValue(new Error("Restore failed"));

      const result = await premiumService.restorePurchases();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Restore failed");
    });
  });

  describe("Subscription Management", () => {
    it("should cancel subscription successfully", async () => {
      mockedApi.request.mockResolvedValue({
        success: true,
        message: "Subscription cancelled successfully",
      });

      const result = await premiumService.cancelSubscription();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Subscription cancelled successfully");
    });

    it("should handle cancellation failure", async () => {
      mockedApi.request.mockRejectedValue(new Error("Cancellation failed"));

      const result = await premiumService.cancelSubscription();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Cancellation failed");
    });
  });

  describe("Cache Management", () => {
    it("should refresh subscription status", async () => {
      const mockStatus = {
        isActive: true,
        plan: "premium",
        features: ["unlimited_swipes"],
        autoRenew: true,
      };

      mockedApi.request.mockResolvedValue(mockStatus);

      await premiumService.refreshSubscriptionStatus();

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        "premium_status_cache",
        expect.stringContaining('"isActive":true')
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Subscription status refreshed",
        expect.objectContaining({ isActive: true, plan: "premium" })
      );
    });

    it("should handle refresh failure gracefully", async () => {
      mockedApi.request.mockRejectedValue(new Error("Refresh failed"));

      await expect(premiumService.refreshSubscriptionStatus()).resolves.not.toThrow();
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Failed to refresh subscription status",
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      mockedApi.request.mockRejectedValue(new Error("Network error"));

      const hasActive = await premiumService.hasActiveSubscription();

      expect(hasActive).toBe(false);
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Failed to check premium status",
        expect.objectContaining({ error: expect.any(Error) })
      );
    });

    it("should handle malformed API responses", async () => {
      mockedApi.request.mockResolvedValue(null);

      const status = await premiumService.getSubscriptionStatus();

      expect(status).toEqual({
        isActive: false,
        plan: "free",
        features: [],
        autoRenew: false,
      });
    });
  });
});
