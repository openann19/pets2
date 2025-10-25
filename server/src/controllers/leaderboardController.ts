export {};// Added to mark file as a module
/**
 * Leaderboard Controller
 * Handles leaderboard functionality and scoring
 */

const User = require('../models/User');
const Match = require('../models/Match');
let Message = null;
try {
  Message = require('../models/Message');
} catch (error) {
  Message = null;
  logger.warn?.('Message model unavailable for engagement leaderboard', { error: error?.message });
}
const Conversation = require('../models/Conversation');
const LeaderboardScore = require('../models/LeaderboardScore');
const logger = require('../utils/logger');

/**
 * Get leaderboard entries for a specific category and timeframe
 * @route GET /api/leaderboard/:category/:timeframe
 * @access Public
 */
const getLeaderboard = async (req, res) => {
  try {
    const { category, timeframe } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Validate category
    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: overall, streak, matches, engagement'
      });
    }

    // Validate timeframe
    const validTimeframes = ['daily', 'weekly', 'monthly', 'allTime'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timeframe. Must be one of: daily, weekly, monthly, allTime'
      });
    }

    // Calculate date range
    const dateRange = getDateRange(timeframe);

    // Get leaderboard entries based on category
    let entries = [];

    switch (category) {
      case 'overall': {
        entries = await getOverallLeaderboard(dateRange, limit, offset);
        break;
      }
      case 'streak': {
        entries = await getStreakLeaderboard(dateRange, limit, offset);
        break;
      }
      case 'matches': {
        entries = await getMatchesLeaderboard(dateRange, limit, offset);
        break;
      }
      case 'engagement': {
        entries = await getEngagementLeaderboard(dateRange, limit, offset);
        break;
      }
    }

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.userId) {
      userRank = await getUserRank(req.userId, category, timeframe);
    }

    res.json({
      success: true,
      data: {
        entries,
        userRank,
        category,
        timeframe,
        total: entries.length
      }
    });

  } catch (error) {
    logger.error('Leaderboard fetch error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

/**
 * Get user's rank and score
 * @route GET /api/leaderboard/user/:userId
 * @access Public
 */
const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category = 'overall', timeframe = 'weekly' } = req.query;

    // Validate category and timeframe
    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    const validTimeframes = ['daily', 'weekly', 'monthly', 'allTime'];

    if (!validCategories.includes(category) || !validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category or timeframe'
      });
    }

    const dateRange = getDateRange(timeframe);

    // Get user's score and rank
    const userScore = await calculateUserScore(userId, category, dateRange);
    const rank = await calculateUserRank(userId, category, dateRange);

    // Calculate percentile
    const totalUsers = await User.countDocuments({ isActive: true });
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100) : 0;

    res.json({
      success: true,
      data: {
        userId,
        category,
        timeframe,
        score: userScore,
        rank,
        percentile
      }
    });

  } catch (error) {
    logger.error('User rank fetch error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: error.message
    });
  }
};

/**
 * Update user's leaderboard score
 * @route POST /api/leaderboard/update
 * @access Private
 */
const updateScore = async (req, res) => {
  try {
    const { category, points } = req.body;
    const userId = req.userId;

    if (!category || typeof points !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Category and points are required'
      });
    }

    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Update or create leaderboard score
    await LeaderboardScore.findOneAndUpdate(
      { userId, category },
      {
        $inc: { score: points },
        $set: { updatedAt: new Date() }
      },
      { upsert: true, new: true }
    );

    logger.info('Leaderboard score updated', { userId, category, points });

    res.json({
      success: true,
      message: 'Score updated successfully'
    });

  } catch (error) {
    logger.error('Score update error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update score',
      error: error.message
    });
  }
};

// Helper functions

/**
 * Get date range based on timeframe
 */
const getDateRange = (timeframe) => {
  const now = new Date();
  const start = new Date();

  switch (timeframe) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'allTime':
      start.setFullYear(2020); // App launch year
      break;
  }

  return { start, end: now };
};

/**
 * Get overall leaderboard (total points across all activities)
 */
const getOverallLeaderboard = async (dateRange, limit, offset) => {
  const scores = await LeaderboardScore.aggregate([
    {
      $match: {
        category: 'overall',
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end }
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
        'user.isBlocked': false
      }
    },
    {
      $project: {
        userId: '$user._id',
        username: '$user.username',
        avatar: '$user.avatar',
        score: 1,
        rank: { $rank: { orderBy: { score: -1 } } }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $skip: parseInt(offset)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  return scores.map(entry => ({
    userId: entry.userId.toString(),
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score,
    rank: entry.rank
  }));
};

/**
 * Get streak leaderboard (daily login streaks)
 */
const getStreakLeaderboard = async (dateRange, limit, offset) => {
  const users = await User.aggregate([
    {
      $match: {
        isActive: true,
        isBlocked: false
      }
    },
    {
      $project: {
        userId: '$_id',
        username: 1,
        avatar: 1,
        score: '$analytics.currentStreak',
        rank: { $rank: { orderBy: { 'analytics.currentStreak': -1 } } }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $skip: parseInt(offset)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  return users.map(entry => ({
    userId: entry.userId.toString(),
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score || 0,
    rank: entry.rank
  }));
};

/**
 * Get matches leaderboard (most successful matches)
 */
const getMatchesLeaderboard = async (dateRange, limit, offset) => {
  const matches = await Match.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'matched'
      }
    },
    {
      $group: {
        _id: '$pet1Owner',
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
        'user.isBlocked': false
      }
    },
    {
      $project: {
        userId: '$user._id',
        username: '$user.username',
        avatar: '$user.avatar',
        score: '$matchCount',
        rank: { $rank: { orderBy: { matchCount: -1 } } }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $skip: parseInt(offset)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  return matches.map(entry => ({
    userId: entry.userId.toString(),
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score,
    rank: entry.rank
  }));
};

/**
 * Get engagement leaderboard (messages and interactions)
 */
const getEngagementLeaderboard = async (dateRange, limit, offset) => {
  let engagement;
  if (Message) {
    engagement = await Message.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$senderId', messageCount: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.isActive': true, 'user.isBlocked': false } },
      { $project: { userId: '$user._id', username: '$user.username', avatar: '$user.avatar', score: '$messageCount' } },
      { $sort: { score: -1 } },
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) }
    ]);
  } else {
    // Fallback: derive engagement from Conversation embedded messages
    engagement = await Conversation.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.sentAt': { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$messages.sender', messageCount: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.isActive': true, 'user.isBlocked': false } },
      { $project: { userId: '$user._id', username: '$user.username', avatar: '$user.avatar', score: '$messageCount' } },
      { $sort: { score: -1 } },
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) }
    ]);
  }

  // Assign rank based on sorted order
  return engagement.map((entry, idx) => ({
    userId: entry.userId?.toString?.() || entry.userId,
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score || entry.messageCount || 0,
    rank: idx + 1
  }));
};

/**
 * Calculate user's score for a specific category
 */
const calculateUserScore = async (userId, category, dateRange) => {
  if (category === 'overall') {
    const overallScore = await LeaderboardScore.findOne({ userId, category });
    return overallScore ? overallScore.score : 0;
  }

  if (category === 'streak') {
    const user = await User.findById(userId);
    return user?.analytics?.currentStreak || 0;
  }

  if (category === 'matches') {
    const matchCount = await Match.countDocuments({
      $or: [{ pet1Owner: userId }, { pet2Owner: userId }],
      status: 'matched',
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });
    return matchCount;
  }

  if (category === 'engagement') {
    if (Message) {
      const messageCount = await Message.countDocuments({
        senderId: userId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      });
      return messageCount;
    }

    const convAgg = await Conversation.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.sender': new (require('mongoose').Types.ObjectId)(String(userId)), 'messages.sentAt': { $gte: dateRange.start, $lte: dateRange.end } } },
      { $count: 'count' }
    ]);
    return convAgg[0]?.count || 0;
  }

  return 0;
};

/**
 * Calculate user's rank for a specific category
 */
const calculateUserRank = async (userId, category, dateRange) => {
  const userScore = await calculateUserScore(userId, category, dateRange);

  if (category === 'overall') {
    const count = await LeaderboardScore.countDocuments({
      category,
      score: { $gt: userScore },
      updatedAt: { $gte: dateRange.start, $lte: dateRange.end }
    });
    return count + 1;
  }

  if (category === 'streak') {
    const count = await User.countDocuments({
      'analytics.currentStreak': { $gt: userScore },
      isActive: true,
      isBlocked: false
    });
    return count + 1;
  }

  if (category === 'matches') {
    return 1; // Simplified: treat user as top rank when using fallback query
  }

  if (category === 'engagement') {
    return 1; // Simplified: requires aggregate ranking logic
  }

  return 1;
};

module.exports = {
  getLeaderboard,
  getUserRank,
  updateScore
};
