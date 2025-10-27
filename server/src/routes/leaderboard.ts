/**
 * Leaderboard Routes
 * Handles leaderboard functionality and scoring
 */

import express, { type Request, type Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import {
  getLeaderboard,
  getUserRank,
  updateScore
} from '../controllers/leaderboardController';

const router: Router = express.Router();

// Validation rules
const categoryValidation = param('category').isIn(['overall', 'streak', 'matches', 'engagement'])
  .withMessage('Category must be one of: overall, streak, matches, engagement');

const timeframeValidation = param('timeframe').isIn(['daily', 'weekly', 'monthly', 'allTime'])
  .withMessage('Timeframe must be one of: daily, weekly, monthly, allTime');

const updateScoreValidation = [
  body('category').isIn(['overall', 'streak', 'matches', 'engagement'])
    .withMessage('Category must be one of: overall, streak, matches, engagement'),
  body('points').isNumeric().withMessage('Points must be a number')
];

/**
 * @route   GET /api/leaderboard/:category/:timeframe
 * @desc    Get leaderboard entries for a specific category and timeframe
 * @access  Public
 */
router.get('/:category/:timeframe', 
  categoryValidation, 
  timeframeValidation, 
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      await getLeaderboard(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route   GET /api/leaderboard/user/:userId
 * @desc    Get user's rank and score
 * @access  Public
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    await getUserRank(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   POST /api/leaderboard/update
 * @desc    Update user's leaderboard score
 * @access  Private
 */
router.post('/update', authenticateToken, updateScoreValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await updateScore(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update score',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
