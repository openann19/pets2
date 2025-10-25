import mongoose, { Schema, Document } from 'mongoose';
import { ILeaderboardScore } from '../types';

/**
 * Leaderboard Score Model
 * Stores user scores for different leaderboard categories
 */

const leaderboardScoreSchema = new Schema<ILeaderboardScore>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['overall', 'streak', 'matches', 'engagement', 'likes', 'messages', 'events'],
    index: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  rank: {
    type: Number,
    required: true,
    default: 0,
    min: 1,
  },
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'all-time'],
    index: true,
  },
  metadata: {
    previousScore: Number,
    scoreChange: Number,
    rankChange: Number,
    achievements: [String],
    milestones: [String],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes
leaderboardScoreSchema.index({ category: 1, period: 1, rank: 1 });
leaderboardScoreSchema.index({ userId: 1, category: 1, period: 1 }, { unique: true });
leaderboardScoreSchema.index({ category: 1, period: 1, score: -1 });

// Virtual for score change percentage
leaderboardScoreSchema.virtual('scoreChangePercentage').get(function() {
  if (!this.metadata?.previousScore || this.metadata.previousScore === 0) {
    return 0;
  }
  return Math.round(((this.score - this.metadata.previousScore) / this.metadata.previousScore) * 100);
});

// Virtual for is top performer
leaderboardScoreSchema.virtual('isTopPerformer').get(function() {
  return this.rank <= 10;
});

// Virtual for rank change direction
leaderboardScoreSchema.virtual('rankChangeDirection').get(function() {
  if (!this.metadata?.rankChange) return 'stable';
  return this.metadata.rankChange > 0 ? 'up' : this.metadata.rankChange < 0 ? 'down' : 'stable';
});

// Instance method to update score
leaderboardScoreSchema.methods.updateScore = function(newScore: number, achievements?: string[]) {
  const previousScore = this.score;
  const scoreChange = newScore - previousScore;
  
  this.score = newScore;
  this.metadata = {
    ...this.metadata,
    previousScore,
    scoreChange,
    achievements: [...(this.metadata?.achievements || []), ...(achievements || [])],
  };
  this.lastUpdated = new Date();
  
  return this.save();
};

// Instance method to update rank
leaderboardScoreSchema.methods.updateRank = function(newRank: number) {
  const previousRank = this.rank;
  const rankChange = previousRank - newRank; // Positive means moved up
  
  this.rank = newRank;
  this.metadata = {
    ...this.metadata,
    rankChange,
  };
  
  return this.save();
};

// Static method to create or update score
leaderboardScoreSchema.statics.createOrUpdateScore = function(scoreData: {
  userId: string;
  category: string;
  period: string;
  score: number;
  achievements?: string[];
}) {
  return this.findOneAndUpdate(
    { 
      userId: scoreData.userId, 
      category: scoreData.category, 
      period: scoreData.period 
    },
    {
      ...scoreData,
      lastUpdated: new Date(),
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Static method to get leaderboard
leaderboardScoreSchema.statics.getLeaderboard = function(category: string, period: string, limit: number = 100) {
  return this.find({ category, period })
    .populate('userId', 'firstName lastName avatar')
    .sort({ rank: 1 })
    .limit(limit);
};

// Static method to get user's rank
leaderboardScoreSchema.statics.getUserRank = function(userId: string, category: string, period: string) {
  return this.findOne({ userId, category, period });
};

// Static method to recalculate ranks
leaderboardScoreSchema.statics.recalculateRanks = function(category: string, period: string) {
  return this.find({ category, period })
    .sort({ score: -1 })
    .then((scores) => {
      const updatePromises = scores.map((score, index) => {
        const newRank = index + 1;
        return score.updateRank(newRank);
      });
      return Promise.all(updatePromises);
    });
};

// Static method to get top performers
leaderboardScoreSchema.statics.getTopPerformers = function(category: string, period: string, limit: number = 10) {
  return this.find({ 
    category, 
    period,
    rank: { $lte: limit }
  })
    .populate('userId', 'firstName lastName avatar')
    .sort({ rank: 1 });
};

// Static method to get user's position in leaderboard
leaderboardScoreSchema.statics.getUserPosition = function(userId: string, category: string, period: string) {
  return this.findOne({ userId, category, period })
    .populate('userId', 'firstName lastName avatar');
};

// Static method to get leaderboard statistics
leaderboardScoreSchema.statics.getLeaderboardStats = function(category: string, period: string) {
  return this.aggregate([
    { $match: { category, period } },
    {
      $group: {
        _id: null,
        totalParticipants: { $sum: 1 },
        avgScore: { $avg: '$score' },
        maxScore: { $max: '$score' },
        minScore: { $min: '$score' },
        topScore: { $first: '$score' },
        medianScore: { $median: '$score' },
      },
    },
  ]);
};

// Static method to get category statistics
leaderboardScoreSchema.statics.getCategoryStats = function(period: string) {
  return this.aggregate([
    { $match: { period } },
    {
      $group: {
        _id: '$category',
        totalParticipants: { $sum: 1 },
        avgScore: { $avg: '$score' },
        maxScore: { $max: '$score' },
        topPerformer: { $first: '$userId' },
      },
    },
    { $sort: { totalParticipants: -1 } },
  ]);
};

// Static method to cleanup old scores
leaderboardScoreSchema.statics.cleanupOldScores = function(daysOld: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    period: { $in: ['daily', 'weekly'] },
    createdAt: { $lt: cutoffDate },
  });
};

export default mongoose.model<ILeaderboardScore>('LeaderboardScore', leaderboardScoreSchema);
