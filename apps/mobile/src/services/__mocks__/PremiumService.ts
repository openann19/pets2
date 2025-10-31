/**
 * Manual Jest mock for PremiumService.
 * Mirrors the public API so tests can stub behaviour deterministically.
 */
import { jest } from '@jest/globals';

const premiumServiceMock = {
  hasActiveSubscription: jest.fn(),
  getSubscriptionStatus: jest.fn(),
  getPremiumLimits: jest.fn(),
  getAvailablePlans: jest.fn(),
  createCheckoutSession: jest.fn(),
  createPaymentSheet: jest.fn(),
  confirmPaymentSheet: jest.fn(),
  cancelSubscription: jest.fn(),
  canUseFeature: jest.fn(),
  trackUsage: jest.fn(),
  getUsageStats: jest.fn(),
  refreshSubscriptionStatus: jest.fn(),
} satisfies Record<string, ReturnType<typeof jest.fn>>;

export type PremiumServiceMock = typeof premiumServiceMock;

export const __resetPremiumServiceMocks = (): void => {
  Object.values(premiumServiceMock).forEach((mockFn) => {
    mockFn.mockReset();
  });
};

export { premiumServiceMock as premiumService };
export default premiumServiceMock;
