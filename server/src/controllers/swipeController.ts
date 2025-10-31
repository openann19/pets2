import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/express';
import type { IUserDocument } from '../types/mongoose';
import User from '../models/User';

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

    // Check premium status for super like - Business Model: Premium users get unlimited super likes OR use IAP
    const isPremium = user.premium?.isActive && 
      (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());
    
    // Premium users with unlimited super likes feature can use unlimited
    // Others (free or premium without unlimited) must use IAP balance
    const hasUnlimitedSuperLikes = isPremium && user.premium?.features?.unlimitedLikes;
    const iapSuperLikes = user.premium?.usage?.iapSuperLikes || 0;
    
    // Check if user has access to super likes
    if (!hasUnlimitedSuperLikes && iapSuperLikes <= 0) {
      res.status(403).json({
        success: false,
        message: 'No Super Likes remaining. Purchase more from the Premium screen.',
        code: 'SUPERLIKE_INSUFFICIENT_BALANCE',
        canPurchase: true,
        balance: iapSuperLikes,
        upgradeRequired: !isPremium,
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

    // Initialize premium.usage if needed
    if (!user.premium) {
      user.premium = {
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
      };
    }

    if (!user.premium.usage) {
      user.premium.usage = {
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
      };
    }

    // Deduct IAP super like if not unlimited
    if (!hasUnlimitedSuperLikes) {
      user.premium.usage.iapSuperLikes = Math.max(0, iapSuperLikes - 1);
    }

    // Track usage
    user.premium.usage.superLikesUsed = (user.premium.usage.superLikesUsed || 0) + 1;

    // Add to swiped pets
    if (!user.swipedPets) {
      user.swipedPets = [];
    }
    user.swipedPets.push({
          petId,
          action: 'superlike',
          swipedAt: new Date()
    });

    // Update analytics
    if (!user.analytics) {
      user.analytics = {
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
      };
    }
    user.analytics.totalSwipes = (user.analytics.totalSwipes || 0) + 1;
    user.analytics.lastActive = new Date();
    user.analytics.events = user.analytics.events || [];
    user.analytics.events.push({
      type: 'superlike',
      petId,
      timestamp: new Date(),
    });

    await user.save();

    res.json({ 
      success: true,
      message: 'Super Like sent successfully',
      balance: user.premium.usage.iapSuperLikes,
    });

  } catch (error: unknown) {
    logger.error('Super like pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to super like pet',
      error: getErrorMessage(error)
    });
  }
};

