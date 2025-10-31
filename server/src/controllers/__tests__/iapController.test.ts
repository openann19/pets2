/**
 * IAP Controller Tests
 * Comprehensive test suite for IAP purchase processing
 * Business Model: Microtransactions as per business.md
 */

import { Response } from 'express';
import * as iapController from '../iapController';
import User from '../../models/User';
import { getErrorMessage } from '../../../utils/errorHandler';

jest.mock('../../models/User');
jest.mock('../../../utils/errorHandler');

const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  premium: {
    isActive: false,
    plan: 'free',
    usage: {
      swipesUsed: 0,
      swipesLimit: 5,
      superLikesUsed: 0,
      superLikesLimit: 0,
      boostsUsed: 0,
      boostsLimit: 0,
      messagesSent: 0,
      profileViews: 0,
      rewindsUsed: 0,
      iapSuperLikes: 0,
      iapBoosts: 0,
    },
  },
  analytics: {
    totalSwipes: 0,
    totalLikes: 0,
    totalMatches: 0,
    profileViews: 0,
    lastActive: new Date(),
    totalPetsCreated: 0,
    totalMessagesSent: 0,
    totalSubscriptionsStarted: 0,
    totalSubscriptionsCancelled: 0,
    totalPremiumFeaturesUsed: 0,
    events: [],
  },
  save: jest.fn(),
};

describe('IAP Controller', () => {
  let mockRequest: any;
  let mockResponse: Response;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      userId: 'user123',
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (getErrorMessage as jest.Mock).mockImplementation((error) =>
      error instanceof Error ? error.message : String(error)
    );
  });

  describe('processPurchase', () => {
    it('should process Super Like purchase successfully', async () => {
      mockRequest.body = {
        productId: 'superlike_single',
        transactionId: 'txn_test_123',
        receipt: 'receipt_test_123',
        platform: 'ios',
      };

      await iapController.processPurchase(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          balance: expect.objectContaining({
            superLikes: 1,
          }),
        })
      );
      expect(mockUser.premium.usage.iapSuperLikes).toBe(1);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should process Super Like pack (10) purchase', async () => {
      mockRequest.body = {
        productId: 'superlike_pack_10',
        transactionId: 'txn_test_456',
        receipt: 'receipt_test_456',
        platform: 'ios',
      };

      await iapController.processPurchase(mockRequest, mockResponse);

      expect(mockUser.premium.usage.iapSuperLikes).toBe(10);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          balance: expect.objectContaining({
            superLikes: 10,
          }),
        })
      );
    });

    it('should process Boost purchase', async () => {
      mockRequest.body = {
        productId: 'boost_30min',
        transactionId: 'txn_test_789',
        receipt: 'receipt_test_789',
        platform: 'android',
        purchaseToken: 'token_test_789',
      };

      await iapController.processPurchase(mockRequest, mockResponse);

      expect(mockUser.premium.usage.iapBoosts).toBe(1);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          balance: expect.objectContaining({
            boosts: 1,
          }),
        })
      );
    });

    it('should prevent duplicate transaction processing', async () => {
      // First purchase
      mockRequest.body = {
        productId: 'superlike_single',
        transactionId: 'txn_duplicate',
        receipt: 'receipt_duplicate',
        platform: 'ios',
      };

      await iapController.processPurchase(mockRequest, mockResponse);

      // Attempt duplicate
      await iapController.processPurchase(mockRequest, mockResponse);

      // Should only increment once
      expect(mockUser.premium.usage.iapSuperLikes).toBe(1);
    });

    it('should return 401 for unauthorized requests', async () => {
      mockRequest.userId = undefined;

      await iapController.processPurchase(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return 404 for non-existent user', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await iapController.processPurchase(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 400 for invalid receipt', async () => {
      mockRequest.body = {
        productId: 'superlike_single',
        transactionId: 'txn_test',
        receipt: '', // Invalid empty receipt
        platform: 'ios',
      };

      await iapController.processPurchase(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid receipt',
      });
    });

    it('should return 400 for unknown product', async () => {
      mockRequest.body = {
        productId: 'unknown_product',
        transactionId: 'txn_test',
        receipt: 'receipt_test',
        platform: 'ios',
      };

      await iapController.processPurchase(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Unknown product'),
        })
      );
    });
  });

  describe('getBalance', () => {
    it('should return current IAP balance', async () => {
      mockUser.premium.usage.iapSuperLikes = 5;
      mockUser.premium.usage.iapBoosts = 2;

      await iapController.getBalance(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        superLikes: 5,
        boosts: 2,
        filters: 0,
        photos: 0,
        videos: 0,
        gifts: 0,
      });
    });

    it('should return empty balance for new user', async () => {
      await iapController.getBalance(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        superLikes: 0,
        boosts: 0,
        filters: 0,
        photos: 0,
        videos: 0,
        gifts: 0,
      });
    });

    it('should return 401 for unauthorized requests', async () => {
      mockRequest.userId = undefined;

      await iapController.getBalance(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 for non-existent user', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await iapController.getBalance(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('useItem', () => {
    beforeEach(() => {
      mockUser.premium.usage.iapSuperLikes = 10;
      mockUser.premium.usage.iapBoosts = 5;
    });

    it('should successfully use a Super Like', async () => {
      mockRequest.body = {
        type: 'superlike',
        quantity: 1,
      };

      await iapController.useItem(mockRequest, mockResponse);

      expect(mockUser.premium.usage.iapSuperLikes).toBe(9);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          balance: expect.objectContaining({
            superLikes: 9,
          }),
        })
      );
    });

    it('should successfully use a Boost', async () => {
      mockRequest.body = {
        type: 'boost',
        quantity: 1,
      };

      await iapController.useItem(mockRequest, mockResponse);

      expect(mockUser.premium.usage.iapBoosts).toBe(4);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          balance: expect.objectContaining({
            boosts: 4,
          }),
        })
      );
    });

    it('should return 403 for insufficient balance', async () => {
      mockUser.premium.usage.iapSuperLikes = 0;
      mockRequest.body = {
        type: 'superlike',
        quantity: 1,
      };

      await iapController.useItem(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Insufficient balance'),
        })
      );
    });

    it('should return 400 for invalid item type', async () => {
      mockRequest.body = {
        type: 'invalid_type',
        quantity: 1,
      };

      await iapController.useItem(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Invalid item type'),
        })
      );
    });

    it('should handle multiple quantity usage', async () => {
      mockRequest.body = {
        type: 'superlike',
        quantity: 3,
      };

      await iapController.useItem(mockRequest, mockResponse);

      expect(mockUser.premium.usage.iapSuperLikes).toBe(7);
    });
  });
});

