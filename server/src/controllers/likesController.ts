/**
 * Likes Controller - See Who Liked You Feature
 * Premium feature that shows users who have liked your pet profiles
 */

import { Response } from 'express';
import type { Request } from 'express';
import { logger } from '../utils/logger';
import User from '../models/User';
import Pet from '../models/Pet';
import type { ISwipedPet, IPetDocument } from '../types/mongoose';

/**
 * @desc    Get users who liked your pets
 * @route   GET /api/likes/received
 * @access  Private (Premium Required)
 */
export const getReceivedLikes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate<{ pets: IPetDocument[] }>('pets');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check premium status - "See Who Liked You" is a premium feature
    const isPremium = user.premium?.isActive &&
      (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());

    if (!isPremium) {
      res.status(403).json({
        success: false,
        message: 'Premium subscription required to see who liked you',
        code: 'PREMIUM_REQUIRED',
        upgradeRequired: true,
      });
      return;
    }

    // Get all pets owned by this user
    const userPetIds = (user.pets || []).map((pet) => String(pet._id));

    // Find all users who have swiped on any of this user's pets with 'like' or 'superlike'
    const usersWhoLiked = await User.find({
      'swipedPets.petId': { $in: userPetIds },
      'swipedPets.action': { $in: ['like', 'superlike'] },
    })
      .populate('pets')
      .select('name email pets profilePicture location createdAt swipedPets');

    // Process the results to show which pets were liked
    const likesData = usersWhoLiked.map((liker) => {
      const likedPets = (liker.swipedPets || []).filter((swipe: ISwipedPet) =>
        userPetIds.includes(String(swipe.petId)) &&
        (swipe.action === 'like' || swipe.action === 'superlike'),
      );

      return {
        userId: liker._id,
        name: liker.name,
        profilePicture: liker.profilePicture,
        location: liker.location,
        likedAt: likedPets[0]?.swipedAt || new Date(),
        isSuperLike: likedPets.some((swipe: ISwipedPet) => swipe.action === 'superlike'),
        petsLiked: likedPets.map((swipe: ISwipedPet) => ({
          petId: swipe.petId,
          action: swipe.action,
          likedAt: swipe.swipedAt,
        })),
      };
    });

    logger.info('Retrieved received likes', {
      userId,
      count: likesData.length,
    });

    res.json({
      success: true,
      data: {
        likes: likesData,
        total: likesData.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get received likes', {
      error: errorMessage,
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve likes',
    });
  }
};

/**
 * @desc    Get mutual likes (matches waiting to happen)
 * @route   GET /api/likes/mutual
 * @access  Private (Premium Required)
 */
export const getMutualLikes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check premium status
    const isPremium = user.premium?.isActive &&
      (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());

    if (!isPremium) {
      res.status(403).json({
        success: false,
        message: 'Premium subscription required',
        code: 'PREMIUM_REQUIRED',
        upgradeRequired: true,
      });
      return;
    }

    // Find users where:
    // 1. Current user has liked them
    // 2. They have liked current user's pets
    // 3. But no match exists yet

    const userPets = await Pet.find({ owner: userId });
    const userPetIds = userPets.map((pet) => pet._id.toString());

    const usersLikedByMe = (user.swipedPets || [])
      .filter((swipe: ISwipedPet) => swipe.action === 'like' || swipe.action === 'superlike')
      .map((swipe: ISwipedPet) => {
        // Find the pet to get the owner
        return swipe.petId;
      });

    // Get owners of pets we liked
    const petsWeLiked = await Pet.find({
      _id: { $in: usersLikedByMe },
    }).populate<{ owner: { _id: unknown; swipedPets?: ISwipedPet[]; name?: string; profilePicture?: string } }>('owner');

    const potentialMatches = await Promise.all(
      petsWeLiked.map(async (pet) => {
        const owner = pet.owner;
        if (!owner) return null;

        // Check if owner has liked any of our pets
        const hasLikedUs = (owner.swipedPets || []).some((swipe: ISwipedPet) =>
          userPetIds.includes(String(swipe.petId)) &&
          (swipe.action === 'like' || swipe.action === 'superlike'),
        );

        if (hasLikedUs) {
          return {
            userId: owner._id,
            name: owner.name,
            profilePicture: owner.profilePicture,
            petId: pet._id,
            petName: pet.name,
            petPicture: pet.photos?.[0],
            mutualLike: true,
          };
        }

        return null;
      }),
    );

    const mutualLikes = potentialMatches.filter((match) => match !== null);

    logger.info('Retrieved mutual likes', {
      userId,
      count: mutualLikes.length,
    });

    res.json({
      success: true,
      data: {
        mutualLikes,
        total: mutualLikes.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get mutual likes', {
      error: errorMessage,
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mutual likes',
    });
  }
};

