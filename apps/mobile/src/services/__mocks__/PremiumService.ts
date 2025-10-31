/**
 * Manual Jest mock for PremiumService.
 * Mirrors the public API so tests can stub behaviour deterministically.
 */

import type {
  SubscriptionStatus,
  PremiumLimits,
  SubscriptionPlan,
  PaymentMethod,
} from '../PremiumService';

const mockSubscriptionDetails: SubscriptionStatus = {
  isActive: true,
  plan: 'premium',
  features: ['unlimited_swipes', 'super_likes', 'boosts'],
  autoRenew: true,
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  stripeCustomerId: 'cus_mock123',
};

const mockPremiumLimits: PremiumLimits = {
  swipesPerDay: -1, // Unlimited
  likesPerDay: -1,
  superLikesPerDay: 5,
  canUndoSwipes: true,
  canSeeWhoLiked: true,
  canBoostProfile: true,
  advancedFilters: true,
  priorityMatching: true,
  unlimitedRewind: false,
};

const mockPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['5 daily swipes'],
    stripePriceId: '',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    features: ['Unlimited swipes', 'See who liked you'],
    stripePriceId: 'price_mock_premium',
    popular: true,
  },
];

// Create mocks with proper typing
const hasActiveSubscription = jest.fn<Promise<boolean>, []>();
hasActiveSubscription.mockResolvedValue(true);

const getSubscriptionDetails = jest.fn<Promise<SubscriptionStatus | null>, []>();
getSubscriptionDetails.mockResolvedValue(mockSubscriptionDetails);

const getSubscriptionStatus = jest.fn<Promise<SubscriptionStatus | null>, []>();
getSubscriptionStatus.mockResolvedValue(mockSubscriptionDetails);

const createSubscription = jest.fn<
  Promise<{ success: boolean; subscriptionId?: string; error?: string }>,
  [string, PaymentMethod?]
>();
createSubscription.mockResolvedValue({ success: true, subscriptionId: 'mock-subscription-id' });

const cancelSubscription = jest.fn<
  Promise<{ success: boolean; error?: string }>,
  [string?]
>();
cancelSubscription.mockResolvedValue({ success: true });

const updateSubscription = jest.fn<
  Promise<{ success: boolean; error?: string }>,
  [string, string]
>();
updateSubscription.mockResolvedValue({ success: true });

const refreshSubscriptionStatus = jest.fn<Promise<SubscriptionStatus | null>, []>();
refreshSubscriptionStatus.mockResolvedValue(mockSubscriptionDetails);

const getPremiumLimits = jest.fn<Promise<PremiumLimits>, []>();
getPremiumLimits.mockResolvedValue(mockPremiumLimits);

const getAvailablePlans = jest.fn<Promise<SubscriptionPlan[]>, []>();
getAvailablePlans.mockResolvedValue(mockPlans);

const createCheckoutSession = jest.fn<
  Promise<{ success: boolean; sessionId?: string; error?: string }>,
  [string]
>();
createCheckoutSession.mockResolvedValue({ success: true, sessionId: 'session_mock123' });

const createPaymentSheet = jest.fn<
  Promise<{ success: boolean; paymentIntentId?: string; error?: string }>,
  [string]
>();
createPaymentSheet.mockResolvedValue({ success: true, paymentIntentId: 'pi_mock123' });

const confirmPaymentSheet = jest.fn<
  Promise<{ success: boolean; subscriptionId?: string; error?: string }>,
  [string]
>();
confirmPaymentSheet.mockResolvedValue({ success: true, subscriptionId: 'sub_mock123' });

const premiumServiceMock = {
  // Primary status functions
  hasActiveSubscription,
  getSubscriptionDetails,
  getSubscriptionStatus,
  refreshSubscriptionStatus,
  
  // Subscription management
  createSubscription,
  cancelSubscription,
  updateSubscription,
  
  // Feature access
  canAccessFeature: jest.fn<boolean, [string]>().mockReturnValue(true),
  canUseFeature: jest.fn<boolean, [string]>().mockReturnValue(true),
  getRemainingFeatureUsage: jest.fn<number, [string]>().mockReturnValue(10),
  logFeatureUsage: jest.fn<Promise<{ success: boolean }>, [string]>().mockResolvedValue({
    success: true,
  }),
  
  // Analytics and stats
  getUsageStats: jest.fn<Promise<{ totalMatches: number; totalLikes: number; totalMessages: number }>, []>()
    .mockResolvedValue({
      totalMatches: 35,
      totalLikes: 124,
      totalMessages: 280,
    }),
  trackUsage: jest.fn<Promise<void>, [string, Record<string, unknown>?]>(),
  
  // Premium limits and plans
  getPremiumLimits,
  getAvailablePlans,
  
  // Payment processing
  createCheckoutSession,
  createPaymentSheet,
  confirmPaymentSheet,
  
  // Helper methods
  restorePurchases: jest.fn<Promise<{ success: boolean }>, []>().mockResolvedValue({ success: true }),
  validateReceipt: jest.fn<Promise<{ valid: boolean }>, [string]>().mockResolvedValue({ valid: true }),
  
  // Payment methods
  getPaymentMethods: jest.fn<Promise<PaymentMethod[]>, []>().mockResolvedValue([]),
  addPaymentMethod: jest.fn<Promise<{ success: boolean; paymentMethodId?: string }>, [PaymentMethod]>()
    .mockResolvedValue({ success: true, paymentMethodId: 'pm_mock123' }),
  removePaymentMethod: jest.fn<Promise<{ success: boolean }>, [string]>().mockResolvedValue({ success: true }),
  setDefaultPaymentMethod: jest.fn<Promise<{ success: boolean }>, [string]>().mockResolvedValue({ success: true }),
};

export type PremiumServiceMock = typeof premiumServiceMock;

export const __resetPremiumServiceMocks = (): void => {
  Object.values(premiumServiceMock).forEach((mockFn) => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockReset();
    }
  });
  
  // Restore default implementations
  hasActiveSubscription.mockResolvedValue(true);
  getSubscriptionDetails.mockResolvedValue(mockSubscriptionDetails);
  getSubscriptionStatus.mockResolvedValue(mockSubscriptionDetails);
  getPremiumLimits.mockResolvedValue(mockPremiumLimits);
  getAvailablePlans.mockResolvedValue(mockPlans);
  createSubscription.mockResolvedValue({ success: true, subscriptionId: 'mock-subscription-id' });
  cancelSubscription.mockResolvedValue({ success: true });
  updateSubscription.mockResolvedValue({ success: true });
  refreshSubscriptionStatus.mockResolvedValue(mockSubscriptionDetails);
  premiumServiceMock.canAccessFeature.mockReturnValue(true);
  premiumServiceMock.canUseFeature.mockReturnValue(true);
  premiumServiceMock.getRemainingFeatureUsage.mockReturnValue(10);
};

export { premiumServiceMock as premiumService };
export default premiumServiceMock;
