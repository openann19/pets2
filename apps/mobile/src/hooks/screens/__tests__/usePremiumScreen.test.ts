/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { usePremiumScreen } from '../usePremiumScreen';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
} as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock premium service
const mockCreateCheckoutSession = jest.fn();
const mockGetAvailablePlans = jest.fn();

jest.mock('../../../services/PremiumService', () => ({
  premiumService: {
    createCheckoutSession: mockCreateCheckoutSession,
    getAvailablePlans: mockGetAvailablePlans,
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock Linking
jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

describe('usePremiumScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailablePlans.mockReturnValue([
      { id: 'premium', name: 'Premium', price: 9.99 },
      { id: 'ultimate', name: 'Ultimate', price: 19.99 },
    ]);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePremiumScreen());

    expect(result.current.billingPeriod).toBe('monthly');
    expect(result.current.selectedTier).toBe('premium');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.subscriptionTiers).toHaveLength(3);
  });

  it('should provide all subscription tiers', () => {
    const { result } = renderHook(() => usePremiumScreen());

    expect(result.current.subscriptionTiers).toHaveLength(3);
    expect(result.current.subscriptionTiers[0].id).toBe('basic');
    expect(result.current.subscriptionTiers[1].id).toBe('premium');
    expect(result.current.subscriptionTiers[2].id).toBe('ultimate');
  });

  it('should mark premium tier as popular', () => {
    const { result } = renderHook(() => usePremiumScreen());

    const premiumTier = result.current.subscriptionTiers.find((t) => t.id === 'premium');
    expect(premiumTier?.popular).toBe(true);
  });

  it('should change billing period', () => {
    const { result } = renderHook(() => usePremiumScreen());

    act(() => {
      result.current.setBillingPeriod('yearly');
    });

    expect(result.current.billingPeriod).toBe('yearly');
  });

  it('should change selected tier', () => {
    const { result } = renderHook(() => usePremiumScreen());

    act(() => {
      result.current.setSelectedTier('ultimate');
    });

    expect(result.current.selectedTier).toBe('ultimate');
  });

  it('should handle subscription for paid tier', async () => {
    mockCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com/session123',
    });

    const { result } = renderHook(() => usePremiumScreen());

    await act(async () => {
      await result.current.handleSubscribe('premium');
    });

    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      'price_premium_monthly',
      'pawfectmatch://subscription/success',
      'pawfectmatch://subscription/cancel',
    );

    expect(Linking.openURL).toHaveBeenCalledWith('https://checkout.stripe.com/session123');
  });

  it('should use correct price ID for yearly billing', async () => {
    mockCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com/session123',
    });

    const { result } = renderHook(() => usePremiumScreen());

    act(() => {
      result.current.setBillingPeriod('yearly');
    });

    await act(async () => {
      await result.current.handleSubscribe('premium');
    });

    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      'price_premium_yearly',
      'pawfectmatch://subscription/success',
      'pawfectmatch://subscription/cancel',
    );
  });

  it('should not create checkout for free tier', async () => {
    const { result } = renderHook(() => usePremiumScreen());

    await act(async () => {
      await result.current.handleSubscribe('basic');
    });

    expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('should set loading state during subscription', async () => {
    mockCreateCheckoutSession.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ url: 'https://checkout.stripe.com/session123' }), 100),
        ),
    );

    const { result } = renderHook(() => usePremiumScreen());

    const subscribePromise = act(async () => {
      await result.current.handleSubscribe('premium');
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);

    await subscribePromise;

    // Should finish loading
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle subscription error', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePremiumScreen());

    await act(async () => {
      await result.current.handleSubscribe('premium');
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Subscription Error',
      'Failed to start checkout process. Please try again.',
      [{ text: 'OK' }],
    );

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle invalid tier ID', async () => {
    const { result } = renderHook(() => usePremiumScreen());

    await act(async () => {
      await result.current.handleSubscribe('invalid-tier');
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Subscription Error',
      'Failed to start checkout process. Please try again.',
      [{ text: 'OK' }],
    );
  });

  it('should handle missing checkout URL', async () => {
    mockCreateCheckoutSession.mockResolvedValue({ url: null });

    const { result } = renderHook(() => usePremiumScreen());

    await act(async () => {
      await result.current.handleSubscribe('premium');
    });

    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should navigate back when requested', () => {
    const { result } = renderHook(() => usePremiumScreen());

    act(() => {
      result.current.handleGoBack();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('should provide available plans from service', () => {
    const { result } = renderHook(() => usePremiumScreen());

    expect(result.current.availablePlans).toHaveLength(2);
    expect(mockGetAvailablePlans).toHaveBeenCalled();
  });

  it('should include feature lists for each tier', () => {
    const { result } = renderHook(() => usePremiumScreen());

    const basicTier = result.current.subscriptionTiers.find((t) => t.id === 'basic');
    const premiumTier = result.current.subscriptionTiers.find((t) => t.id === 'premium');
    const ultimateTier = result.current.subscriptionTiers.find((t) => t.id === 'ultimate');

    expect(basicTier?.features).toContain('5 daily swipes');
    expect(premiumTier?.features).toContain('Unlimited swipes');
    expect(ultimateTier?.features).toContain('AI-powered recommendations');
  });

  it('should provide pricing for monthly and yearly periods', () => {
    const { result } = renderHook(() => usePremiumScreen());

    const premiumTier = result.current.subscriptionTiers.find((t) => t.id === 'premium');

    expect(premiumTier?.price.monthly).toBe(9.99);
    expect(premiumTier?.price.yearly).toBe(99.99);
  });

  it('should have correct stripe price IDs', () => {
    const { result } = renderHook(() => usePremiumScreen());

    const premiumTier = result.current.subscriptionTiers.find((t) => t.id === 'premium');

    expect(premiumTier?.stripePriceId.monthly).toBe('price_premium_monthly');
    expect(premiumTier?.stripePriceId.yearly).toBe('price_premium_yearly');
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => usePremiumScreen());

    const firstSetBillingPeriod = result.current.setBillingPeriod;
    const firstHandleSubscribe = result.current.handleSubscribe;

    rerender();

    expect(result.current.setBillingPeriod).toBe(firstSetBillingPeriod);
    expect(result.current.handleSubscribe).toBe(firstHandleSubscribe);
  });
});
