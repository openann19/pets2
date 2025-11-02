export {};// Added to mark file as a module
/**
 * Leaderboard Score Model
 * Stores user scores for different leaderboard categories
 */

const mongoose = require('mongoose');

const leaderboardScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['overall', 'streak', 'matches', 'engagement'],
    index: true
  },
  timeframe: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'allTime'],
    index: true
  },
  score: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  rank: {
    type: Number,
    min: 1
  },
  percentile: {
    type: Number,
    min: 0,
    max: 100
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for performance
leaderboardScoreSchema.index({ userId: 1, category: 1, timeframe: 1 }, { unique: true });
leaderboardScoreSchema.index({ category: 1, timeframe: 1, score: -1 });
leaderboardScoreSchema.index({ category: 1, timeframe: 1, rank: 1 });
leaderboardScoreSchema.index({ updatedAt: -1 });

// Ensure unique combination of userId, category, and timeframe
leaderboardScoreSchema.index({ userId: 1, category: 1, timeframe: 1 }, { unique: true });

module.exports = mongoose.model('LeaderboardScore', leaderboardScoreSchema);
