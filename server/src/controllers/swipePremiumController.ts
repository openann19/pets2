/**
 * Swipe Premium Controller
 * Phase 2 Product Enhancement - Premium swipe features
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import {
  getPremiumUsage,
  useRewind,
  useSuperLike,
  activateBoost,
} from '../services/swipePremiumService';
import logger from '../utils/logger';

/**
 * @desc    Get premium usage for user
 * @route   GET /api/swipe/premium/usage
 * @access  Private
 */
export const getUsage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const usage = await getPremiumUsage(userId);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    logger.error('Failed to get premium usage', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get premium usage',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Use rewind feature
 * @route   POST /api/swipe/premium/rewind
 * @access  Private
 */
export const useRewindAction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { petId } = req.body;
    if (!petId) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: petId',
      });
      return;
    }

    const result = await useRewind(userId, petId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Failed to use rewind', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Use super like feature
 * @route   POST /api/swipe/premium/super-like
 * @access  Private
 */
export const useSuperLikeAction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { matchId } = req.body;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: matchId',
      });
      return;
    }

    const result = await useSuperLike(userId, matchId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Failed to use super like', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Activate profile boost
 * @route   POST /api/swipe/premium/boost
 * @access  Private
 */
export const activateBoostAction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const result = await activateBoost(userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Failed to activate boost', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

