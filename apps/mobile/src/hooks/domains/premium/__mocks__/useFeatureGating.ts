/**
 * Mock for useFeatureGate hook
 */

export const useFeatureGate = jest.fn().mockReturnValue({
  canUseFeature: jest.fn().mockReturnValue(true),
  isPremiumUser: true,
  requiredPlan: 'free',
  isLoading: false,
  error: null,
  refreshStatus: jest.fn(),
  usageRemaining: 999,
});

export default { useFeatureGate };
