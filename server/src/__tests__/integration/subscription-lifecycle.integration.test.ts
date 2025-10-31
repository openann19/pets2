/**
 * Subscription Lifecycle Integration Tests
 * Tests complete subscription flow from purchase to cancellation
 */

import { Request, Response } from 'express';
import * as premiumController from '../../controllers/premiumController';
import * as webhookController from '../../controllers/webhookController';
import * as iapController from '../../controllers/iapController';
import User from '../../models/User';
import * as stripeService from '../../services/stripeService';

jest.mock('../../models/User');
jest.mock('../../services/stripeService');

describe('Subscription Lifecycle Integration', () => {
  let mockUser: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      premium: {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        cancelAtPeriodEnd: false,
        paymentStatus: 'active',
        features: {},
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
        },
      },
      save: jest.fn().mockResolvedValue(mockUser),
    };

    mockRequest = {
      userId: 'user123',
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (User.findById as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
    (User.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
  });

  describe('Complete Subscription Flow', () => {
    it('should handle subscription purchase to activation flow', async () => {
      // Step 1: User initiates subscription purchase
      const checkoutSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      (stripeService.createCheckoutSession as jest.Mock) = jest
        .fn()
        .mockResolvedValue(checkoutSession);

      mockRequest.body = {
        plan: 'premium',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
      };

      await premiumController.subscribeToPremium(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          sessionId: 'cs_test_123',
        }),
      );

      // Step 2: Stripe sends webhook after payment
      const webhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: {
              userId: 'user123',
            },
          },
        },
      };

      mockRequest.body = webhookEvent;

      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [
            {
              price: {
                id: 'price_premium_monthly',
              },
            },
          ],
        },
        metadata: {
          userId: 'user123',
        },
      };

      (stripeService.getStripeClient as jest.Mock).mockReturnValue({
        subscriptions: {
          retrieve: jest.fn().mockResolvedValue(mockSubscription),
        },
      });

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Verify user upgraded
      expect(mockUser.premium.isActive).toBe(true);
      expect(mockUser.premium.plan).toBe('premium');
      expect(mockUser.premium.features.unlimitedLikes).toBe(true);
    });

    it('should handle subscription cancellation flow', async () => {
      // Setup: User with active premium subscription
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';
      mockUser.premium.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // User cancels subscription
      const webhookEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            cancel_at_period_end: true, // Cancelled but still active
            current_period_end: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60,
            items: {
              data: [
                {
                  price: {
                    id: 'price_premium_monthly',
                  },
                },
              ],
            },
            metadata: {
              userId: 'user123',
            },
          },
        },
      };

      mockRequest.body = webhookEvent;

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Subscription still active but will cancel at period end
      expect(mockUser.premium.isActive).toBe(true);
      expect(mockUser.premium.cancelAtPeriodEnd).toBe(true);

      // Simulate period end - subscription deleted
      const deletionEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            metadata: {
              userId: 'user123',
            },
          },
        },
      };

      mockRequest.body = deletionEvent;

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      // User downgraded to free
      expect(mockUser.premium.isActive).toBe(false);
      expect(mockUser.premium.plan).toBe('free');
    });

    it('should handle subscription renewal flow', async () => {
      // Setup: User with active subscription near expiration
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';
      const nearExpiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 1 day left
      mockUser.premium.expiresAt = new Date(nearExpiry * 1000);

      // Stripe sends invoice.paid event (renewal)
      const renewalEvent = {
        type: 'invoice.paid',
        data: {
          object: {
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            amount_paid: 999, // $9.99
            metadata: {
              userId: 'user123',
            },
          },
        },
      };

      mockRequest.body = renewalEvent;

      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Renewed
        items: {
          data: [
            {
              price: {
                id: 'price_premium_monthly',
              },
            },
          ],
        },
        metadata: {
          userId: 'user123',
        },
      };

      (stripeService.getStripeClient as jest.Mock).mockReturnValue({
        subscriptions: {
          retrieve: jest.fn().mockResolvedValue(mockSubscription),
        },
      });

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Subscription renewed
      expect(mockUser.premium.isActive).toBe(true);
      expect(new Date(mockUser.premium.expiresAt).getTime()).toBeGreaterThan(
        nearExpiry * 1000,
      );
    });

    it('should handle payment failure and retry flow', async () => {
      // Setup: User with active subscription
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';
      mockUser.premium.paymentStatus = 'active';

      // Payment fails
      const failureEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            attempt_count: 1,
            next_payment_attempt: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            metadata: {
              userId: 'user123',
            },
          },
        },
      };

      mockRequest.body = failureEvent;

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Payment status updated but subscription still active (grace period)
      expect(mockUser.premium.paymentStatus).toBe('past_due');
      expect(mockUser.premium.isActive).toBe(true); // Still active during grace period

      // Payment succeeds on retry
      const successEvent = {
        type: 'invoice.paid',
        data: {
          object: {
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: {
              userId: 'user123',
            },
          },
        },
      };

      mockRequest.body = successEvent;

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Payment status restored
      expect(mockUser.premium.paymentStatus).toBe('active');
    });
  });

  describe('IAP + Subscription Hybrid Flow', () => {
    it('should allow premium user to use IAP items', async () => {
      // Setup: Premium user purchases IAP super likes
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';
      mockUser.premium.usage.iapSuperLikes = 0;

      mockRequest.body = {
        productId: 'com.pawfectmatch.iap.superlike.pack_10',
        transactionId: 'txn_iap_123',
        receipt: 'receipt_iap_123',
        platform: 'ios',
      };

      await iapController.processPurchase(
        mockRequest as any,
        mockResponse as Response,
      );

      // Premium user still gets IAP balance
      expect(mockUser.premium.usage.iapSuperLikes).toBe(10);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });
});

