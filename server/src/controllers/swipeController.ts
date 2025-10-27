import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import logger from '../utils/logger';
import { getErrorMessage } from '../../utils/errorHandler';

interface AuthRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

/**
 * @desc    Rewind last swipe action
 * @route   POST /api/swipe/rewind
 * @access  Private
 */
export const rewindLastSwipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check premium status for rewind feature
    const isPremium = user.premium?.isActive && 
      (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());
    
    // Check rewind limits
    const rewindsUsed = user.premium?.usage?.rewindsUsed || 0;
    const rewindLimit = isPremium ? 10 : 0; // Premium users get 10 rewinds per period
    
    if (!isPremium) {
      res.status(403).json({
        success: false,
        message: 'Rewind is a premium feature',
        code: 'REWIND_PREMIUM_REQUIRED'
      });
      return;
    }

    if (rewindsUsed >= rewindLimit) {
      res.status(403).json({
        success: false,
        message: 'Rewind limit reached',
        code: 'REWIND_LIMIT_EXCEEDED'
      });
      return;
    }

    // Get last swipe
    const swipedPets = user.swipedPets || [];
    
    if (swipedPets.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No swipes to rewind'
      });
      return;
    }

    // Get the most recent swipe
    const lastSwipe = swipedPets[swipedPets.length - 1];
    if (!lastSwipe) {
      res.status(400).json({
        success: false,
        message: 'No swipes to undo'
      });
      return;
    }
    const petId = lastSwipe.petId;

    // Remove the last swipe from the array
    swipedPets.pop();

    // Update user
    await User.findByIdAndUpdate(req.userId, {
      $set: { swipedPets },
      $inc: {
        'premium.usage.rewindsUsed': 1,
        'analytics.totalSwipes': -1
      }
    });

    // Remove the match record if it exists
    await Match.findOneAndDelete({
      $or: [
        { pet1: petId, user1: req.userId },
        { pet2: petId, user1: req.userId },
        { pet1: req.userId, user2: petId },
        { pet2: req.userId, user2: petId }
      ]
    });

    // Get the pet details
    const restoredPet = await Pet.findById(petId);

    res.json({
      success: true,
      restoredPet
    });

  } catch (error: unknown) {
    logger.error('Rewind swipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rewind swipe',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Like a pet
 * @route   POST /api/pets/like
 * @access  Private
 */
export const likePet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { petId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check if already swiped
    const alreadySwiped = (user.swipedPets || []).some(
      (swipe: { petId: string; action: string; swipedAt: Date }) => swipe.petId.toString() === petId
    );

    if (alreadySwiped) {
      res.status(400).json({
        success: false,
        message: 'Already swiped on this pet'
      });
      return;
    }

    // Add to swiped pets
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        swipedPets: {
          petId,
          action: 'like',
          swipedAt: new Date()
        }
      },
      $inc: {
        'analytics.totalSwipes': 1,
        'analytics.totalLikes': 1
      }
    });

    res.json({ success: true });

  } catch (error: unknown) {
    logger.error('Like pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like pet',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Pass a pet
 * @route   POST /api/pets/pass
 * @access  Private
 */
export const passPet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { petId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check if already swiped
    const alreadySwiped = (user.swipedPets || []).some(
      (swipe: { petId: string; action: string; swipedAt: Date }) => swipe.petId.toString() === petId
    );

    if (alreadySwiped) {
      res.status(400).json({
        success: false,
        message: 'Already swiped on this pet'
      });
      return;
    }

    // Add to swiped pets
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        swipedPets: {
          petId,
          action: 'pass',
          swipedAt: new Date()
        }
      },
      $inc: {
        'analytics.totalSwipes': 1
      }
    });

    res.json({ success: true });

  } catch (error: unknown) {
    logger.error('Pass pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pass pet',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Super like a pet
 * @route   POST /api/pets/super-like
 * @access  Private
 */
export const superLikePet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { petId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check premium status for super like
    const isPremium = user.premium?.isActive && 
      (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());
    
    const superLikesUsed = user.premium?.usage?.superLikesUsed || 0;
    const superLikeLimit = isPremium ? 5 : 0;
    
    if (!isPremium || superLikesUsed >= superLikeLimit) {
      res.status(403).json({
        success: false,
        message: 'Super like is a premium feature',
        code: 'SUPERLIKE_PREMIUM_REQUIRED'
      });
      return;
    }

    // Check if already swiped
    const alreadySwiped = (user.swipedPets || []).some(
      (swipe: { petId: string; action: string; swipedAt: Date }) => swipe.petId.toString() === petId
    );

    if (alreadySwiped) {
      res.status(400).json({
        success: false,
        message: 'Already swiped on this pet'
      });
      return;
    }

    // Add to swiped pets
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        swipedPets: {
          petId,
          action: 'superlike',
          swipedAt: new Date()
        }
      },
      $inc: {
        'analytics.totalSwipes': 1,
        'analytics.totalMatches': 1,
        'premium.usage.superLikesUsed': 1
      }
    });

    res.json({ success: true });

  } catch (error: unknown) {
    logger.error('Super like pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to super like pet',
      error: getErrorMessage(error)
    });
  }
};

