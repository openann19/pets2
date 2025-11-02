/**
 * Tests for Premium Hooks
 * Tests usePremium, usePremiumFeature, and useSwipeLimits hooks
 */
import { renderHook, act } from "@testing-library/react-native";
import { usePremium, usePremiumFeature, useSwipeLimits } from "../../hooks/usePremium";
import { premiumService } from "../PremiumService";

// Mock PremiumService
jest.mock("../PremiumService");
const mockedPremiumService = premiumService as jest.Mocked<typeof premiumService>;

describe("usePremium Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return initial loading state", () => {
    mockedPremiumService.getSubscriptionStatus.mockResolvedValue({
      isActive: false,
      plan: "free",
      features: [],
      autoRenew: false,
    });
    mockedPremiumService.getPremiumLimits.mockResolvedValue({
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

    const { result } = renderHook(() => usePremium());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isActive).toBe(false);
    expect(result.current.plan).toBe("free");
  });

  it("should load premium status on mount", async () => {
    const mockStatus = {
      isActive: true,
      plan: "premium",
      features: ["unlimited_swipes"],
      autoRenew: true,
    };
    const mockLimits = {
      swipesPerDay: -1,
      likesPerDay: -1,
      superLikesPerDay: -1,
      canUndoSwipes: true,
      canSeeWhoLiked: true,
      canBoostProfile: true,
      advancedFilters: true,
      priorityMatching: true,
      unlimitedRewind: false,
    };

    mockedPremiumService.getSubscriptionStatus.mockResolvedValue(mockStatus);
    mockedPremiumService.getPremiumLimits.mockResolvedValue(mockLimits);

    const { result } = renderHook(() => usePremium());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isActive).toBe(true);
    expect(result.current.plan).toBe("premium");
    expect(result.current.limits.canUndoSwipes).toBe(true);
  });

  it("should refresh status when called", async () => {
    mockedPremiumService.getSubscriptionStatus.mockResolvedValue({
      isActive: false,
      plan: "free",
      features: [],
      autoRenew: false,
    });
    mockedPremiumService.getPremiumLimits.mockResolvedValue({
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

    const { result } = renderHook(() => usePremium());

    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(mockedPremiumService.getSubscriptionStatus).toHaveBeenCalledTimes(2);
    expect(mockedPremiumService.getPremiumLimits).toHaveBeenCalledTimes(2);
  });

  it("should check feature access", async () => {
    mockedPremiumService.canUseFeature.mockResolvedValue(true);

    const { result } = renderHook(() => usePremium());

    await act(async () => {
      const canUse = await result.current.checkFeatureAccess("canUndoSwipes");
      expect(canUse).toBe(true);
    });

    expect(mockedPremiumService.canUseFeature).toHaveBeenCalledWith("canUndoSwipes");
  });

  it("should track usage", async () => {
    mockedPremiumService.trackUsage.mockResolvedValue();

    const { result } = renderHook(() => usePremium());

    await act(async () => {
      await result.current.trackUsage("test_feature");
    });

    expect(mockedPremiumService.trackUsage).toHaveBeenCalledWith("test_feature");
  });

  it("should handle errors gracefully", async () => {
    mockedPremiumService.getSubscriptionStatus.mockRejectedValue(new Error("API error"));
    mockedPremiumService.getPremiumLimits.mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => usePremium());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("API error");
  });
});

describe("usePremiumFeature Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track feature usage", async () => {
    mockedPremiumService.getSubscriptionStatus.mockResolvedValue({
      isActive: true,
      plan: "premium",
      features: [],
      autoRenew: true,
    });
    mockedPremiumService.getPremiumLimits.mockResolvedValue({
      swipesPerDay: -1,
      likesPerDay: -1,
      superLikesPerDay: -1,
      canUndoSwipes: true,
      canSeeWhoLiked: true,
      canBoostProfile: true,
      advancedFilters: true,
      priorityMatching: true,
      unlimitedRewind: false,
    });
    mockedPremiumService.trackUsage.mockResolvedValue();

    const { result } = renderHook(() => usePremiumFeature("canUndoSwipes"));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.canUse).toBe(true);

    await act(async () => {
      const success = await result.current.useFeature();
      expect(success).toBe(true);
    });

    expect(result.current.usageCount).toBe(1);
    expect(mockedPremiumService.trackUsage).toHaveBeenCalledWith("canUndoSwipes");
  });

  it("should return false when feature is not available", async () => {
    mockedPremiumService.getSubscriptionStatus.mockResolvedValue({
      isActive: false,
      plan: "free",
      features: [],
      autoRenew: false,
    });
    mockedPremiumService.getPremiumLimits.mockResolvedValue({
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

    const { result } = renderHook(() => usePremiumFeature("canUndoSwipes"));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.canUse).toBe(false);

    await act(async () => {
      const success = await result.current.useFeature();
      expect(success).toBe(false);
    });

    expect(mockedPremiumService.trackUsage).not.toHaveBeenCalled();
  });
});

describe("useSwipeLimits Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track swipe actions", async () => {
    mockedPremiumService.getSubscriptionStatus.mockResolvedValue({
      isActive: false,
      plan: "free",
      features: [],
      autoRenew: false,
    });
    mockedPremiumService.getPremiumLimits.mockResolvedValue({
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
    mockedPremiumService.trackUsage.mockResolvedValue();

    const { result } = renderHook(() => useSwipeLimits());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.canSwipe).toBe(true);
    expect(result.current.canLike).toBe(true);
    expect(result.current.canSuperLike).toBe(true);

    await act(async () => {
      await result.current.trackSwipe("like");
    });

    expect(result.current.counts.likes).toBe(1);
    expect(mockedPremiumService.trackUsage).toHaveBeenCalledWith("swipe_like");
  });

  it("should reset counts", async () => {
    mockedPremiumService.getSubscriptionStatus.mockResolvedValue({
      isActive: false,
      plan: "free",
      features: [],
      autoRenew: false,
    });
    mockedPremiumService.getPremiumLimits.mockResolvedValue({
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
    mockedPremiumService.trackUsage.mockResolvedValue();

    const { result } = renderHook(() => useSwipeLimits());

    await act(async () => {
      await result.current.trackSwipe("like");
      await result.current.trackSwipe("pass");
      await result.current.trackSwipe("superlike");
    });

    expect(result.current.counts.likes).toBe(1);
    expect(result.current.counts.swipes).toBe(1);
    expect(result.current.counts.superLikes).toBe(1);

    await act(async () => {
      result.current.resetCounts();
    });

    expect(result.current.counts.likes).toBe(0);
    expect(result.current.counts.swipes).toBe(0);
    expect(result.current.counts.superLikes).toBe(0);
  });
});
