import { Request, Response } from 'express';
import Favorite from '../models/Favorite';
import Pet from '../models/Pet';
import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Request interfaces
 */
interface AuthenticatedRequest extends Request {
  userId: string;
  user?: any;
}

interface AddFavoriteRequest extends AuthenticatedRequest {
  body: {
    petId: string;
  };
}

interface RemoveFavoriteRequest extends AuthenticatedRequest {
  params: {
    petId: string;
  };
}

interface GetFavoritesRequest extends AuthenticatedRequest {
  query: {
    page?: string;
    limit?: string;
  };
}

interface CheckFavoriteRequest extends AuthenticatedRequest {
  params: {
    petId: string;
  };
}

interface GetPetFavoriteCountRequest extends AuthenticatedRequest {
  params: {
    petId: string;
  };
}

/**
 * @desc    Add pet to favorites
 * @route   POST /api/favorites
 * @access  Private
 */
export const addFavorite = async (
  req: AddFavoriteRequest,
  res: Response
): Promise<void> => {
  try {
    const { petId } = req.body;
    const userId = req.user?._id || req.userId;

    if (!petId) {
      res.status(400).json({
        success: false,
        message: 'petId is required',
      });
      return;
    }

    // Validate petId format
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid petId',
      });
      return;
    }

    // Ensure pet exists
    const petExists = await Pet.exists({ _id: petId });
    if (!petExists) {
      res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
      return;
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ userId, petId });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Pet already favorited',
      });
      return;
    }

    // Create favorite
    const favorite = new Favorite({
      userId,
      petId,
    });

    await favorite.save();

    // Populate pet data for response
    await favorite.populate('petId', 'name breed age photos location');

    logger.info('Pet added to favorites', {
      userId,
      petId,
    });

    res.status(201).json({
      success: true,
      favorite,
      message: 'Pet added to favorites',
    });
  } catch (error) {
    logger.error('Error adding favorite', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite',
    });
  }
};

/**
 * @desc    Remove pet from favorites
 * @route   DELETE /api/favorites/:petId
 * @access  Private
 */
export const removeFavorite = async (
  req: RemoveFavoriteRequest,
  res: Response
): Promise<void> => {
  try {
    const { petId } = req.params;
    const userId = req.user?._id || req.userId;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid petId',
      });
      return;
    }

    const favorite = await Favorite.findOne({ userId, petId });
    if (!favorite) {
      res.status(404).json({
        success: false,
        message: 'not found in favorites',
      });
      return;
    }

    await Favorite.deleteOne({ _id: favorite._id, userId });

    logger.info('Pet removed from favorites', {
      userId,
      petId,
    });

    res.json({
      success: true,
      message: 'Pet removed from favorites',
    });
  } catch (error) {
    logger.error('Error removing favorite', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite',
    });
  }
};

/**
 * @desc    Get user's favorites
 * @route   GET /api/favorites
 * @access  Private
 */
export const getFavorites = async (
  req: GetFavoritesRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id || req.userId;
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const hasPage = typeof pageRaw !== 'undefined';
    const hasLimit = typeof limitRaw !== 'undefined';

    if ((hasPage && isNaN(parseInt(pageRaw, 10))) || (hasLimit && isNaN(parseInt(limitRaw, 10)))) {
      res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
      return;
    }

    const page = hasPage ? Math.max(1, parseInt(pageRaw, 10)) : 1;
    const limit = hasLimit ? Math.max(1, parseInt(limitRaw, 10)) : 50;

    const result = await Favorite.getUserFavorites(userId, page, limit);

    res.json({
      success: true,
      favorites: result.favorites,
      totalFavorites: result.totalFavorites,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      hasNextPage: result.hasNextPage,
    });
  } catch (error) {
    logger.error('Error fetching favorites', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
    });
  }
};

/**
 * @desc    Check if pet is favorited
 * @route   GET /api/favorites/check/:petId
 * @access  Private
 */
export const checkFavorite = async (
  req: CheckFavoriteRequest,
  res: Response
): Promise<void> => {
  try {
    const { petId } = req.params;
    const userId = req.user?._id || req.userId;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      res.status(400).json({ success: false, message: 'Invalid petId' });
      return;
    }

    const isFavorited = await Favorite.isFavorited(userId, petId);

    res.json({
      success: true,
      isFavorited,
    });
  } catch (error) {
    logger.error('Error checking favorite', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status',
    });
  }
};

/**
 * @desc    Get pet's favorite count
 * @route   GET /api/favorites/count/:petId
 * @access  Private
 */
export const getPetFavoriteCount = async (
  req: GetPetFavoriteCountRequest,
  res: Response
): Promise<void> => {
  try {
    const { petId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      res.status(400).json({ success: false, message: 'Invalid petId' });
      return;
    }

    const count = await Favorite.getPetFavoriteCount(petId);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    logger.error('Error getting favorite count', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get favorite count',
    });
  }
};
