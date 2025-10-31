/**
 * Swipe Controller Feature Gates Tests
 * Tests Super Like feature gating with premium and IAP balance checks
 */

import { Request, Response } from 'express';
import * as swipeController from '../swipeController';
import User from '../../models/User';
import Pet from '../../models/Pet';
import logger from '../../utils/logger';

jest.mock('../../models/User');
jest.mock('../../models/Pet');
jest.mock('../../utils/logger');

describe('Swipe Controller - Feature Gates', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: any;
  let mockPet: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user123',
      premium: {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        features: {
          unlimitedLikes: false,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          iapSuperLikes: 0,
          iapBoosts: 0,
        },
      },
      swipedPets: [],
      analytics: {
        totalSwipes: 0,
        events: [],
      },
      save: jest.fn().mockResolvedValue(mockUser),
    };

    mockPet = {
      _id: 'pet123',
      name: 'Fluffy',
      owner: 'user123',
    };

    mockRequest = {
      userId: 'user123',
      body: {
        petId: 'pet123',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (User.findById as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
    (Pet.findById as jest.Mock) = jest.fn().mockResolvedValue(mockPet);
  });

  describe('superLikePet - Feature Gating', () => {
    it('should allow super like for premium users with unlimited feature', async () => {
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';
      mockUser.premium.features.unlimitedLikes = true;

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should allow super like for free users with IAP balance', async () => {
      mockUser.premium.usage.iapSuperLikes = 5;

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
      expect(mockUser.premium.usage.iapSuperLikes).toBe(4); // Deducted
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should deny super like for free users without IAP balance', async () => {
      mockUser.premium.usage.iapSuperLikes = 0;

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'SUPERLIKE_INSUFFICIENT_BALANCE',
          canPurchase: true,
          balance: 0,
        }),
      );
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should deny super like when already swiped', async () => {
      mockUser.premium.usage.iapSuperLikes = 5;
      mockUser.swipedPets = [
        {
          petId: 'pet123',
          action: 'like',
          swipedAt: new Date(),
        },
      ];

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Already swiped on this pet',
        }),
      );
    });

    it('should deduct IAP balance correctly for premium users without unlimited', async () => {
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';
      mockUser.premium.features.unlimitedLikes = false; // Premium but no unlimited feature
      mockUser.premium.usage.iapSuperLikes = 3;

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockUser.premium.usage.iapSuperLikes).toBe(2);
      expect(mockUser.premium.usage.superLikesUsed).toBe(1);
    });

    it('should not deduct IAP balance for premium users with unlimited', async () => {
      mockUser.premium.isActive = true;
      mockUser.premium.plan = 'premium';
      mockUser.premium.features.unlimitedLikes = true;
      mockUser.premium.usage.iapSuperLikes = 10;

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockUser.premium.usage.iapSuperLikes).toBe(10); // Not deducted
      expect(mockUser.premium.usage.superLikesUsed).toBe(1);
    });

    it('should initialize premium.usage if missing', async () => {
      mockUser.premium.usage = undefined;
      mockUser.premium.usage = {
        iapSuperLikes: 5,
      };

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockUser.premium.usage).toBeDefined();
      expect(mockUser.premium.usage.superLikesUsed).toBe(1);
    });

    it('should initialize analytics if missing', async () => {
      mockUser.analytics = undefined;
      mockUser.premium.usage.iapSuperLikes = 5;

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockUser.analytics).toBeDefined();
      expect(mockUser.analytics.totalSwipes).toBe(1);
      expect(mockUser.analytics.events).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User not found',
        }),
      );
    });

    it('should handle database errors', async () => {
      mockUser.premium.usage.iapSuperLikes = 5;
      mockUser.save = jest.fn().mockRejectedValue(new Error('Database error'));

      await swipeController.superLikePet(
        mockRequest as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

