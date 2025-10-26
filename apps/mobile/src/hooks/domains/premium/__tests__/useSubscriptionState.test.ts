/**
 * Comprehensive tests for useSubscriptionState hook
 *
 * Coverage:
 * - Subscription state management
 * - Stripe integration for payments
 * - Subscription lifecycle (create, update, cancel)
 * - Billing cycle management
 * - Payment method handling
 * - Subscription status transitions
 * - Error handling and recovery
 * - Real-time status updates
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscriptionState } from '../useSubscriptionState';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/premiumService', () => ({
  premiumService: {
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    updateSubscription: jest.fn(),
    getSubscriptionDetails: jest.fn(),
    getPaymentMethods: jest.fn(),
    addPaymentMethod: jest.fn(),
    removePaymentMethod: jest.fn(),
    getBillingHistory: jest.fn(),
  },
}));

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  initPaymentSheet: jest.fn(),
  presentPaymentSheet: jest.fn(),
  confirmPaymentSheetPayment: jest.fn(),
  createToken: jest.fn(),
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
import { initPaymentSheet, presentPaymentSheet, createToken } from '@stripe/stripe-react-native';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockPremiumService = premiumService as jest.Mocked<typeof premiumService>;
const mockStripe = {
  initPaymentSheet,
  presentPaymentSheet,
  createToken,
} as jest.Mocked<typeof import('@stripe/stripe-react-native')>;

describe('useSubscriptionState', () => {
  const mockSubscriptionDetails = {
    id: 'sub_123',
    status: 'active',
    currentPeriodStart: new Date('2024-01-01'),
    currentPeriodEnd: new Date('2024-02-01'),
    cancelAtPeriodEnd: false,
    plan: {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      amount: 999,
      currency: 'usd',
      interval: 'month',
    },
    paymentMethod: {
      id: 'pm_123',
      type: 'card',
      last4: '4242',
      brand: 'visa',
    },
  };

  const mockPaymentMethods = [
    {
      id: 'pm_123',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      isDefault: true,
    },
    {
      id: 'pm_456',
      type: 'card',
      last4: '8888',
      brand: 'mastercard',
      isDefault: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    mockPremiumService.getSubscriptionDetails.mockResolvedValue(mockSubscriptionDetails);
    mockPremiumService.getPaymentMethods.mockResolvedValue(mockPaymentMethods);

    mockStripe.initPaymentSheet.mockResolvedValue({ error: null });
    mockStripe.presentPaymentSheet.mockResolvedValue({
      error: null,
      paymentOption: { label: 'Visa **** 4242' },
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSubscriptionState());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.subscription).toBeNull();
      expect(result.current.paymentMethods).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isProcessing).toBe(false);
    });

    it('should load cached subscription data on mount', async () => {
      const cachedData = {
        subscription: mockSubscriptionDetails,
        paymentMethods: mockPaymentMethods,
        lastUpdated: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => useSubscriptionState());

      await waitFor(() => {
        expect(result.current.subscription).toEqual(mockSubscriptionDetails);
        expect(result.current.paymentMethods).toEqual(mockPaymentMethods);
      });
    });
  });

  describe('Subscription Management', () => {
    it('should create subscription successfully', async () => {
      const paymentMethodId = 'pm_123';
      const priceId = 'price_premium_monthly';

      mockPremiumService.createSubscription.mockResolvedValue(mockSubscriptionDetails);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const success = await result.current.createSubscription(paymentMethodId, priceId);
        expect(success).toBe(true);
      });

      expect(mockPremiumService.createSubscription).toHaveBeenCalledWith({
        paymentMethodId,
        priceId,
      });
      expect(result.current.subscription).toEqual(mockSubscriptionDetails);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should handle subscription creation errors', async () => {
      mockPremiumService.createSubscription.mockRejectedValue(new Error('Payment failed'));

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const success = await result.current.createSubscription('pm_123', 'price_123');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Payment failed');
      expect(result.current.isProcessing).toBe(false);
    });

    it('should cancel subscription successfully', async () => {
      const cancelledSubscription = { ...mockSubscriptionDetails, cancelAtPeriodEnd: true };

      mockPremiumService.cancelSubscription.mockResolvedValue(cancelledSubscription);

      const { result } = renderHook(() => useSubscriptionState());

      // Set initial subscription
      act(() => {
        result.current.subscription = mockSubscriptionDetails;
      });

      await act(async () => {
        const success = await result.current.cancelSubscription();
        expect(success).toBe(true);
      });

      expect(result.current.subscription?.cancelAtPeriodEnd).toBe(true);
    });

    it('should update subscription plan', async () => {
      const updatedSubscription = {
        ...mockSubscriptionDetails,
        plan: { ...mockSubscriptionDetails.plan, name: 'Premium Yearly' },
      };

      mockPremiumService.updateSubscription.mockResolvedValue(updatedSubscription);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const success = await result.current.updateSubscription('new_price_id');
        expect(success).toBe(true);
      });

      expect(result.current.subscription?.plan.name).toBe('Premium Yearly');
    });
  });

  describe('Payment Method Management', () => {
    it('should load payment methods', async () => {
      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.loadPaymentMethods();
      });

      expect(result.current.paymentMethods).toEqual(mockPaymentMethods);
      expect(mockPremiumService.getPaymentMethods).toHaveBeenCalled();
    });

    it('should add payment method', async () => {
      const newPaymentMethod = {
        id: 'pm_new',
        type: 'card' as const,
        last4: '1111',
        brand: 'amex',
        isDefault: false,
      };

      const updatedMethods = [...mockPaymentMethods, newPaymentMethod];
      mockPremiumService.addPaymentMethod.mockResolvedValue(updatedMethods);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const success = await result.current.addPaymentMethod('token_123');
        expect(success).toBe(true);
      });

      expect(result.current.paymentMethods).toEqual(updatedMethods);
    });

    it('should remove payment method', async () => {
      const filteredMethods = mockPaymentMethods.filter(pm => pm.id !== 'pm_456');
      mockPremiumService.removePaymentMethod.mockResolvedValue(filteredMethods);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const success = await result.current.removePaymentMethod('pm_456');
        expect(success).toBe(true);
      });

      expect(result.current.paymentMethods).toEqual(filteredMethods);
    });
  });

  describe('Stripe Payment Sheet', () => {
    it('should initialize payment sheet successfully', async () => {
      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const success = await result.current.initializePaymentSheet({
          paymentIntentClientSecret: 'pi_secret_123',
          customerEphemeralKeySecret: 'ek_secret_456',
          customerId: 'cus_789',
        });

        expect(success).toBe(true);
      });

      expect(mockStripe.initPaymentSheet).toHaveBeenCalledWith({
        paymentIntentClientSecret: 'pi_secret_123',
        customerEphemeralKeySecret: 'ek_secret_456',
        customerId: 'cus_789',
        merchantDisplayName: 'PawfectMatch',
      });
    });

    it('should present payment sheet', async () => {
      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const result_sheet = await result.current.presentPaymentSheet();
        expect(result_sheet).toEqual({
          error: null,
          paymentOption: { label: 'Visa **** 4242' },
        });
      });

      expect(mockStripe.presentPaymentSheet).toHaveBeenCalled();
    });

    it('should handle payment sheet errors', async () => {
      mockStripe.initPaymentSheet.mockResolvedValue({
        error: { message: 'Invalid client secret' },
      });

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const success = await result.current.initializePaymentSheet({
          paymentIntentClientSecret: 'invalid_secret',
        });

        expect(success).toBe(false);
      });
    });
  });

  describe('Subscription Status Utilities', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useSubscriptionState());
      act(() => {
        result.current.subscription = mockSubscriptionDetails;
      });
    });

    it('should check if subscription is active', () => {
      const { result } = renderHook(() => useSubscriptionState());

      act(() => {
        result.current.subscription = mockSubscriptionDetails;
      });

      expect(result.current.isSubscriptionActive()).toBe(true);
      expect(result.current.getSubscriptionStatus()).toBe('active');
    });

    it('should check if subscription is cancelled', () => {
      const { result } = renderHook(() => useSubscriptionState());

      act(() => {
        result.current.subscription = { ...mockSubscriptionDetails, cancelAtPeriodEnd: true };
      });

      expect(result.current.isSubscriptionCancelled()).toBe(true);
    });

    it('should calculate days until renewal', () => {
      const { result } = renderHook(() => useSubscriptionState());

      act(() => {
        result.current.subscription = mockSubscriptionDetails;
      });

      const daysLeft = result.current.getDaysUntilRenewal();
      expect(daysLeft).toBeGreaterThan(0);
      expect(daysLeft).toBeLessThanOrEqual(31);
    });

    it('should check if subscription will renew', () => {
      const { result } = renderHook(() => useSubscriptionState());

      act(() => {
        result.current.subscription = mockSubscriptionDetails;
      });

      expect(result.current.willSubscriptionRenew()).toBe(true);

      act(() => {
        result.current.subscription = { ...mockSubscriptionDetails, cancelAtPeriodEnd: true };
      });

      expect(result.current.willSubscriptionRenew()).toBe(false);
    });
  });

  describe('Billing History', () => {
    it('should load billing history', async () => {
      const mockBillingHistory = [
        {
          id: 'inv_123',
          amount: 999,
          currency: 'usd',
          date: new Date('2024-01-01'),
          status: 'paid',
          description: 'Premium Monthly',
        },
      ];

      mockPremiumService.getBillingHistory.mockResolvedValue(mockBillingHistory);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const history = await result.current.getBillingHistory();
        expect(history).toEqual(mockBillingHistory);
      });

      expect(mockPremiumService.getBillingHistory).toHaveBeenCalled();
    });
  });

  describe('Processing States', () => {
    it('should show processing state during operations', async () => {
      let resolveOperation: (value: any) => void;
      const operationPromise = new Promise(resolve => {
        resolveOperation = resolve;
      });

      mockPremiumService.createSubscription.mockReturnValue(operationPromise);

      const { result } = renderHook(() => useSubscriptionState());

      // Start operation
      act(() => {
        result.current.createSubscription('pm_123', 'price_123');
      });

      expect(result.current.isProcessing).toBe(true);

      // Complete operation
      act(() => {
        resolveOperation(mockSubscriptionDetails);
      });

      await waitFor(() => {
        expect(result.current.isProcessing).toBe(false);
      });
    });

    it('should prevent concurrent operations', async () => {
      mockPremiumService.createSubscription.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSubscriptionDetails), 100))
      );

      const { result } = renderHook(() => useSubscriptionState());

      // Start multiple operations
      await act(async () => {
        await Promise.all([
          result.current.createSubscription('pm_1', 'price_1'),
          result.current.createSubscription('pm_2', 'price_2'),
          result.current.createSubscription('pm_3', 'price_3'),
        ]);
      });

      // Should only process one at a time
      expect(mockPremiumService.createSubscription).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockPremiumService.getSubscriptionDetails.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.refreshSubscription();
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle Stripe errors', async () => {
      mockStripe.presentPaymentSheet.mockResolvedValue({
        error: { message: 'Payment declined' },
      });

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        const result_sheet = await result.current.presentPaymentSheet();
        expect(result_sheet.error?.message).toBe('Payment declined');
      });
    });

    it('should handle malformed subscription data', async () => {
      const malformedSubscription = {
        id: 'sub_123',
        // Missing required fields
        status: 'active',
      };

      mockPremiumService.getSubscriptionDetails.mockResolvedValue(malformedSubscription as any);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.refreshSubscription();
      });

      // Should handle gracefully
      expect(result.current.subscription).toBeDefined();
    });

    it('should reset error state on successful operations', async () => {
      // First operation fails
      mockPremiumService.createSubscription.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.createSubscription('pm_123', 'price_123');
      });

      expect(result.current.error).toBe('First error');

      // Second operation succeeds
      mockPremiumService.createSubscription.mockResolvedValueOnce(mockSubscriptionDetails);

      await act(async () => {
        await result.current.createSubscription('pm_456', 'price_456');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Cache Management', () => {
    it('should cache subscription data', async () => {
      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.refreshSubscription();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'subscription_state_cache',
        expect.any(String)
      );
    });

    it('should clear cache when requested', async () => {
      const { result } = renderHook(() => useSubscriptionState());

      // Set some data
      act(() => {
        result.current.subscription = mockSubscriptionDetails;
        result.current.paymentMethods = mockPaymentMethods;
      });

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.subscription).toBeNull();
      expect(result.current.paymentMethods).toEqual([]);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('subscription_state_cache');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty payment methods', async () => {
      mockPremiumService.getPaymentMethods.mockResolvedValue([]);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.loadPaymentMethods();
      });

      expect(result.current.paymentMethods).toEqual([]);
    });

    it('should handle subscription without payment method', async () => {
      const subscriptionWithoutPayment = { ...mockSubscriptionDetails };
      delete (subscriptionWithoutPayment as any).paymentMethod;

      mockPremiumService.getSubscriptionDetails.mockResolvedValue(subscriptionWithoutPayment);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.refreshSubscription();
      });

      expect(result.current.subscription?.paymentMethod).toBeUndefined();
    });

    it('should handle expired subscriptions', async () => {
      const expiredSubscription = {
        ...mockSubscriptionDetails,
        currentPeriodEnd: new Date(Date.now() - 86400000), // Yesterday
        status: 'past_due',
      };

      mockPremiumService.getSubscriptionDetails.mockResolvedValue(expiredSubscription);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.refreshSubscription();
      });

      expect(result.current.isSubscriptionActive()).toBe(false);
      expect(result.current.getSubscriptionStatus()).toBe('past_due');
    });

    it('should handle very long billing cycles', async () => {
      const yearlySubscription = {
        ...mockSubscriptionDetails,
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      };

      mockPremiumService.getSubscriptionDetails.mockResolvedValue(yearlySubscription);

      const { result } = renderHook(() => useSubscriptionState());

      await act(async () => {
        await result.current.refreshSubscription();
      });

      const daysLeft = result.current.getDaysUntilRenewal();
      expect(daysLeft).toBeGreaterThan(300);
      expect(daysLeft).toBeLessThanOrEqual(366);
    });
  });
});
