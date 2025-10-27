/**
 * Leaderboard Controller for PawfectMatch
 * Handles leaderboard functionality and scoring
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import User from '../models/User';
import Match from '../models/Match';
import Conversation from '../models/Conversation';
import LeaderboardScore from '../models/LeaderboardScore';
const logger = require('../utils/logger');

// Try to load Message model
let Message: typeof import('../models/Message').default | null = null;
try {
  Message = require('../models/Message').default;
} catch (error) {
  Message = null;
  logger.warn?.('Message model unavailable for engagement leaderboard', { error: (error as Error)?.message });
}

interface AuthRequest extends Request {
  userId?: string;
  user?: IUserDocument;
}

// Type definitions
interface LeaderboardQuery {
  limit?: string | number;
  offset?: string | number;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  avatar?: string;
  badge?: string;
}

interface LeaderboardResponse {
  category: string;
  timeframe: string;
  entries: LeaderboardEntry[];
  userRank?: number;
  userScore?: number;
  totalEntries: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Calculate date range for timeframe
 */
const getDateRange = (timeframe: string): DateRange => {
  const now = new Date();
  const startDate = new Date();

  switch (timeframe) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'allTime':
      startDate.setFullYear(2020, 0, 1); // Start of platform
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate: now };
};

/**
 * Get leaderboard entries for a specific category and timeframe
 * GET /api/leaderboard/:category/:timeframe
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category: categoryParam, timeframe: timeframeParam } = req.params;
    const { limit = 50, offset = 0 }: LeaderboardQuery = req.query;

    // Validate inputs
    if (!categoryParam || !timeframeParam) {
      res.status(400).json({
        success: false,
        message: 'Category and timeframe are required'
      });
      return;
    }

    const category = categoryParam;
    const timeframe = timeframeParam;

    // Validate category
    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: overall, streak, matches, engagement'
      });
      return;
    }

    // Validate timeframe
    const validTimeframes = ['daily', 'weekly', 'monthly', 'allTime'];
    if (!validTimeframes.includes(timeframe)) {
      res.status(400).json({
        success: false,
        message: 'Invalid timeframe. Must be one of: daily, weekly, monthly, allTime'
      });
      return;
    }

    // Calculate date range
    const dateRange = getDateRange(timeframe);

    // Get leaderboard entries based on category
    const entries = await getLeaderboardEntries(category, timeframe, dateRange, Number(limit) || 50, Number(offset) || 0);
    const totalEntries = await getTotalEntries(category, timeframe);

    const response: LeaderboardResponse = {
      category,
      timeframe,
      entries,
      totalEntries
    };

    // Include current user's rank if authenticated
    if ((req as AuthRequest).userId) {
      const userRank = await getUserRankInCategory((req as AuthRequest).userId!, category, timeframe);
      const userScore = await getUserScoreInCategory((req as AuthRequest).userId!, category, timeframe);

      response.userRank = userRank;
      response.userScore = userScore;
    }

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Get leaderboard error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
};

/**
 * Get user's rank in a specific category
 * GET /api/leaderboard/rank/:category/:timeframe
 */
export const getUserRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category: categoryParam, timeframe: timeframeParam } = req.params;
    const userId = (req as AuthRequest).userId!;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Validate inputs
    if (!categoryParam || !timeframeParam) {
      res.status(400).json({
        success: false,
        message: 'Category and timeframe are required'
      });
      return;
    }

    const category = categoryParam;
    const timeframe = timeframeParam;

    // Validate category
    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: overall, streak, matches, engagement'
      });
      return;
    }

    // Validate timeframe
    const validTimeframes = ['daily', 'weekly', 'monthly', 'allTime'];
    if (!validTimeframes.includes(timeframe)) {
      res.status(400).json({
        success: false,
        message: 'Invalid timeframe. Must be one of: daily, weekly, monthly, allTime'
      });
      return;
    }

    const rank = await getUserRankInCategory(userId, category, timeframe);
    const score = await getUserScoreInCategory(userId, category, timeframe);

    res.json({
      success: true,
      data: {
        category,
        timeframe,
        rank,
        score
      }
    });

  } catch (error) {
    logger.error('Get user rank error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user rank'
    });
  }
};

/**
 * Update user's score (internal use)
 * POST /api/leaderboard/update-score
 */
export const updateScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, category, score, metadata } = req.body;

    // Validate required fields
    if (!userId || !category || typeof score !== 'number') {
      res.status(400).json({
        success: false,
        message: 'userId, category, and score are required'
      });
      return;
    }

    // Update or create leaderboard score
    await LeaderboardScore.findOneAndUpdate(
      { userId, category },
      {
        $set: {
          score,
          metadata: metadata || {},
          lastUpdated: new Date()
        },
        $inc: { totalUpdates: 1 }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Score updated successfully'
    });

  } catch (error) {
    logger.error('Update score error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to update score'
    });
  }
};

// Helper functions
async function getLeaderboardEntries(
  category: string,
  timeframe: string,
  dateRange: DateRange,
  limit: number,
  offset: number
): Promise<LeaderboardEntry[]> {
  try {
    let aggregationPipeline: Record<string, unknown>[] = [];

    switch (category) {
      case 'overall':
        // Aggregate user activity across multiple metrics
        aggregationPipeline = [
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $match: {
              'user.isActive': true,
              'user.isBlocked': { $ne: true }
            }
          },
          {
            $group: {
              _id: '$userId',
              userName: { $first: '$user.firstName' },
              avatar: { $first: '$user.avatar' },
              totalScore: { $sum: '$score' },
              lastUpdated: { $max: '$lastUpdated' }
            }
          },
          {
            $sort: { totalScore: -1, lastUpdated: -1 }
          },
          {
            $skip: offset
          },
          {
            $limit: limit
          }
        ];
        break;

      case 'matches':
        // Count successful matches
        aggregationPipeline = [
          {
            $match: {
              isMatch: true,
              createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
          },
          {
            $group: {
              _id: '$pet1.owner',
              matchCount: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $match: {
              'user.isActive': true,
              'user.isBlocked': { $ne: true }
            }
          },
          {
            $project: {
              userId: '$_id',
              userName: '$user.firstName',
              avatar: '$user.avatar',
              score: '$matchCount'
            }
          },
          {
            $sort: { score: -1 }
          },
          {
            $skip: offset
          },
          {
            $limit: limit
          }
        ];
        break;

      case 'engagement':
        // Calculate engagement based on messages, swipes, etc.
        if (Message) {
          aggregationPipeline = [
            {
              $match: {
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
              }
            },
            {
              $group: {
                _id: '$senderId',
                messageCount: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
              }
            },
            {
              $unwind: '$user'
            },
            {
              $match: {
                'user.isActive': true,
                'user.isBlocked': { $ne: true }
              }
            },
            {
              $project: {
                userId: '$_id',
                userName: '$user.firstName',
                avatar: '$user.avatar',
                score: '$messageCount'
              }
            },
            {
              $sort: { score: -1 }
            },
            {
              $skip: offset
            },
            {
              $limit: limit
            }
          ];
        }
        break;

      default:
        // Fallback to overall scores
        aggregationPipeline = [
          {
            $match: {
              category: 'overall',
              lastUpdated: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $match: {
              'user.isActive': true,
              'user.isBlocked': { $ne: true }
            }
          },
          {
            $sort: { score: -1, lastUpdated: -1 }
          },
          {
            $skip: offset
          },
          {
            $limit: limit
          },
          {
            $project: {
              userId: '$userId',
              userName: '$user.firstName',
              avatar: '$user.avatar',
              score: 1
            }
          }
        ];
    }

    const results = await LeaderboardScore.aggregate(aggregationPipeline);

    // Add rank numbers
    return results.map((entry: {
      _id: string;
      totalScore: number;
      userName: string;
      userAvatar?: string;
    }, index: number) => ({
      userId: entry.userId.toString(),
      userName: entry.userName || 'Anonymous',
      score: entry.score || entry.totalScore || 0,
      rank: offset + index + 1,
      avatar: entry.avatar,
      badge: getBadgeForScore(entry.score || entry.totalScore || 0, category)
    }));

  } catch (error) {
    logger.error('Get leaderboard entries error', { error: (error as Error).message });
    return [];
  }
}

async function getTotalEntries(category: string, timeframe: string): Promise<number> {
  try {
    // Simplified total count - in production, this should match the aggregation logic
    return await LeaderboardScore.countDocuments({ category });
  } catch (error) {
    logger.error('Get total entries error', { error: (error as Error).message });
    return 0;
  }
}

async function getUserRankInCategory(userId: string, category: string, timeframe: string): Promise<number> {
  try {
    // This is a simplified implementation
    // In production, you would use aggregation to calculate exact rank
    const userScore = await LeaderboardScore.findOne({ userId, category });

    if (!userScore) return 0;

    // Count users with higher scores
    const higherScores = await LeaderboardScore.countDocuments({
      category,
      score: { $gt: userScore.score }
    });

    return higherScores + 1;

  } catch (error) {
    logger.error('Get user rank error', { error: (error as Error).message });
    return 0;
  }
}

async function getUserScoreInCategory(userId: string, category: string, timeframe: string): Promise<number> {
  try {
    const scoreDoc = await LeaderboardScore.findOne({ userId, category });
    return scoreDoc ? scoreDoc.score : 0;
  } catch (error) {
    logger.error('Get user score error', { error: (error as Error).message });
    return 0;
  }
}

function getBadgeForScore(score: number, category: string): string {
  if (score >= 1000) return 'legend';
  if (score >= 500) return 'expert';
  if (score >= 100) return 'advanced';
  if (score >= 50) return 'intermediate';
  return 'beginner';
}

interface LeaderboardController {
  getLeaderboard: (req: Request, res: Response) => Promise<void>;
  getUserRank: (req: Request, res: Response) => Promise<void>;
  updateScore: (req: Request, res: Response) => Promise<void>;
}

const leaderboardController: LeaderboardController = {
  getLeaderboard,
  getUserRank,
  updateScore
};

export default leaderboardController;
