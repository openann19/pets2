/**
 * Webhook Controller Tests
 * Comprehensive test suite for Stripe webhook processing
 * Tests subscription lifecycle management, idempotency, and plan mapping
 */

import { Request, Response } from 'express';
import * as webhookController from '../webhookController';
import User from '../../models/User';
import logger from '../../utils/logger';
import * as stripeService from '../../services/stripeService';

jest.mock('../../models/User');
jest.mock('../../utils/logger');
jest.mock('../../services/stripeService');

describe('Webhook Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: any;

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
      body: {},
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    (User.findById as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
    (User.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
  });

  describe('handleStripeWebhook', () => {
    it('should verify webhook signature', async () => {
      mockRequest.body = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            mode: 'subscription',
          },
        },
      };
      mockRequest.headers = {
        'stripe-signature': 'test_signature',
      };

      (stripeService.getWebhookSecret as jest.Mock).mockReturnValue('whsec_test');
      (stripeService.verifyWebhookSignature as jest.Mock) = jest.fn().mockReturnValue(true);

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(stripeService.verifyWebhookSignature).toHaveBeenCalled();
    });

    it('should handle checkout.session.completed event', async () => {
      mockRequest.body = {
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
                product: 'prod_premium',
              },
            },
          ],
        },
      };

      (stripeService.getStripeClient as jest.Mock).mockReturnValue({
        subscriptions: {
          retrieve: jest.fn().mockResolvedValue(mockSubscription),
        },
      });

      (webhookController.getPlanNameFromPriceId as jest.Mock) = jest
        .fn()
        .mockReturnValue('premium');

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockUser.premium.isActive).toBe(true);
      expect(mockUser.premium.plan).toBe('premium');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle customer.subscription.created event', async () => {
      mockRequest.body = {
        type: 'customer.subscription.created',
        data: {
          object: {
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
          },
        },
      };

      (webhookController.getPlanNameFromPriceId as jest.Mock) = jest
        .fn()
        .mockReturnValue('premium');

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockUser.premium.isActive).toBe(true);
      expect(mockUser.premium.plan).toBe('premium');
    });

    it('should handle customer.subscription.updated event', async () => {
      mockRequest.body = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            cancel_at_period_end: false,
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            items: {
              data: [
                {
                  price: {
                    id: 'price_ultimate_monthly',
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

      (webhookController.getPlanNameFromPriceId as jest.Mock) = jest
        .fn()
        .mockReturnValue('ultimate');

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockUser.premium.plan).toBe('ultimate');
      expect(mockUser.premium.cancelAtPeriodEnd).toBe(false);
    });

    it('should handle customer.subscription.deleted event', async () => {
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';

      mockRequest.body = {
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

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockUser.premium.isActive).toBe(false);
      expect(mockUser.premium.plan).toBe('free');
    });

    it('should handle invoice.payment_failed event', async () => {
      mockRequest.body = {
        type: 'invoice.payment_failed',
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

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockUser.premium.paymentStatus).toBe('past_due');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should prevent duplicate event processing with idempotency', async () => {
      mockRequest.body = {
        type: 'checkout.session.completed',
        id: 'evt_test_123',
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

      // Mock idempotency check - event already processed
      (User.findOne as jest.Mock).mockResolvedValueOnce({
        _id: 'user123',
        premium: {
          webhookEvents: ['evt_test_123'],
        },
      });

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Should not update user again
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should handle getPlanNameFromPriceId with environment variables', async () => {
      process.env.STRIPE_PRICE_PREMIUM_MONTHLY = 'price_premium_monthly';
      process.env.STRIPE_PRICE_ULTIMATE_MONTHLY = 'price_ultimate_monthly';

      const planName = await webhookController.getPlanNameFromPriceId('price_premium_monthly');

      expect(planName).toBe('premium');
    });

    it('should query Stripe API if price ID not in env vars', async () => {
      delete process.env.STRIPE_PRICE_PREMIUM_MONTHLY;

      const mockPrice = {
        id: 'price_premium_monthly',
        product: 'prod_premium',
      };

      const mockProduct = {
        id: 'prod_premium',
        name: 'Premium Monthly',
      };

      const mockStripe = {
        prices: {
          retrieve: jest.fn().mockResolvedValue(mockPrice),
        },
        products: {
          retrieve: jest.fn().mockResolvedValue(mockProduct),
        },
      };

      (stripeService.getStripeClient as jest.Mock).mockReturnValue(mockStripe);

      const planName = await webhookController.getPlanNameFromPriceId('price_premium_monthly');

      expect(planName).toMatch(/premium/i);
      expect(mockStripe.prices.retrieve).toHaveBeenCalledWith('price_premium_monthly');
    });

    it('should use pattern matching as fallback', async () => {
      delete process.env.STRIPE_PRICE_PREMIUM_MONTHLY;

      const mockStripe = {
        prices: {
          retrieve: jest.fn().mockRejectedValue(new Error('Not found')),
        },
      };

      (stripeService.getStripeClient as jest.Mock).mockReturnValue(mockStripe);

      const planName = await webhookController.getPlanNameFromPriceId('price_premium_monthly_v2');

      // Should fallback to pattern matching
      expect(planName).toMatch(/premium/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid webhook signature', async () => {
      mockRequest.body = {
        type: 'checkout.session.completed',
      };
      mockRequest.headers = {
        'stripe-signature': 'invalid_signature',
      };

      (stripeService.verifyWebhookSignature as jest.Mock) = jest
        .fn()
        .mockReturnValue(false);

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle missing user in metadata', async () => {
      mockRequest.body = {
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_test_123',
            metadata: {},
          },
        },
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockRequest.body = {
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_test_123',
            metadata: {
              userId: 'user123',
            },
          },
        },
      };

      mockUser.save = jest.fn().mockRejectedValue(new Error('Database error'));

      await webhookController.handleStripeWebhook(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});

