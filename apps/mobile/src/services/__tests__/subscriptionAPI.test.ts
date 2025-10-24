import {  } from '../api';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Subscription API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    (fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  describe('getCurrentSubscription', () => {
    it('should return subscription data when request succeeds', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        plan: {
          id: 'plan_premium',
          name: 'Premium',
          interval: 'month',
        },
        currentPeriodStart: '2025-09-10T00:00:00.000Z',
        currentPeriodEnd: '2025-10-10T00:00:00.000Z',
      };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSubscription),
        })
      );

      const result = await subscriptionAPI.getCurrentSubscription();
      
      expect(result).toEqual(mockSubscription);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscription\/current$/),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should return null when request fails', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      const result = await subscriptionAPI.getCurrentSubscription();
      
      expect(result).toBeNull();
    });
  });

  describe('getUsageStats', () => {
    it('should return usage stats when request succeeds', async () => {
      const mockUsageStats = {
        swipesRemaining: 50,
        totalSwipes: 100,
        superLikesRemaining: 5,
        totalSuperLikes: 5,
        resetDate: '2025-10-15T00:00:00.000Z',
      };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageStats),
        })
      );

      const result = await subscriptionAPI.getUsageStats();
      
      expect(result).toEqual(mockUsageStats);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscription\/usage$/),
        expect.any(Object)
      );
    });

    it('should return null when request fails', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      const result = await subscriptionAPI.getUsageStats();
      
      expect(result).toBeNull();
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session with the correct parameters', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        status: 'open',
      };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
      );

      const params = {
        priceId: 'price_premium_monthly',
        successUrl: 'pawfectmatch://subscription/success',
        cancelUrl: 'pawfectmatch://subscription/cancel',
        metadata: { tier: 'premium' },
      };

      const result = await subscriptionAPI.createCheckoutSession(params);
      
      expect(result).toEqual(mockSession);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscription\/create-checkout$/),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params),
        })
      );
    });

    it('should handle errors when creating a checkout session', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid price ID' }),
        })
      );

      const params = {
        priceId: 'invalid_price_id',
        successUrl: 'pawfectmatch://subscription/success',
        cancelUrl: 'pawfectmatch://subscription/cancel',
      };

      await expect(subscriptionAPI.createCheckoutSession(params)).rejects.toThrow();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription successfully', async () => {
      const mockResponse = { 
        id: 'sub_123',
        status: 'canceled',
        cancel_at_period_end: true,
      };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await subscriptionAPI.cancelSubscription('sub_123');
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscription\/sub_123\/cancel$/),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate a canceled subscription', async () => {
      const mockResponse = { 
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: false,
      };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await subscriptionAPI.reactivateSubscription('sub_123');
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscription\/sub_123\/reactivate$/),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('getPlans', () => {
    it('should return available subscription plans', async () => {
      const mockPlans = [
        {
          id: 'price_basic_monthly',
          name: 'Basic',
          interval: 'month',
          amount: 999,
          currency: 'USD',
        },
        {
          id: 'price_premium_monthly',
          name: 'Premium',
          interval: 'month',
          amount: 1999,
          currency: 'USD',
        },
      ];

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlans),
        })
      );

      const result = await subscriptionAPI.getPlans();
      
      expect(result).toEqual(mockPlans);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscription\/plans$/),
        expect.any(Object)
      );
    });

    it('should return empty array when request fails', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      const result = await subscriptionAPI.getPlans();
      
      expect(result).toEqual([]);
    });
  });

  describe('updatePaymentMethod', () => {
    it('should update the payment method successfully', async () => {
      const mockResponse = { 
        success: true,
        subscription: {
          id: 'sub_123',
          default_payment_method: 'pm_123',
        },
      };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await subscriptionAPI.updatePaymentMethod('pm_123');
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscription\/payment-method$/),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ paymentMethodId: 'pm_123' }),
        })
      );
    });
  });
});