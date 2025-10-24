/**
 * Leaderboard Routes
 * Handles leaderboard functionality and scoring
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  getLeaderboard,
  getUserRank,
  updateScore
} = require('../controllers/leaderboardController');

const router = express.Router();

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
  async (req, res) => {
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
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/leaderboard/user/:userId
 * @desc    Get user's rank and score
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    await getUserRank(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/leaderboard/update
 * @desc    Update user's leaderboard score
 * @access  Private
 */
router.post('/update', authenticateToken, updateScoreValidation, async (req, res) => {
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
      error: error.message
    });
  }
});

module.exports = router;
