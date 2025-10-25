import mongoose, { Schema, Document } from 'mongoose';
import { IUserBlock } from '../types';

const userBlockSchema = new Schema<IUserBlock>({
  blockerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true,
  },
  blockedId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true,
  },
  reason: { 
    type: String, 
    maxlength: 1000,
    trim: true,
  },
  category: {
    type: String,
    enum: ['harassment', 'inappropriate_content', 'spam', 'fake_profile', 'safety', 'other'],
    default: 'other',
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
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

// Compound unique index to prevent duplicate blocks
userBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
userBlockSchema.index({ blockerId: 1 });
userBlockSchema.index({ blockedId: 1 });
userBlockSchema.index({ category: 1 });
userBlockSchema.index({ createdAt: -1 });

// Virtual for time since block
userBlockSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Instance method to unblock user
userBlockSchema.methods.unblock = function() {
  this.isActive = false;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to reactivate block
userBlockSchema.methods.reactivate = function() {
  this.isActive = true;
  this.updatedAt = new Date();
  return this.save();
};

// Static method to block user
userBlockSchema.statics.blockUser = function(blockerId: string, blockedId: string, reason?: string, category?: string) {
  return this.findOneAndUpdate(
    { blockerId, blockedId },
    {
      blockerId,
      blockedId,
      reason,
      category: category || 'other',
      isActive: true,
      createdAt: new Date(),
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Static method to unblock user
userBlockSchema.statics.unblockUser = function(blockerId: string, blockedId: string) {
  return this.findOneAndUpdate(
    { blockerId, blockedId },
    { 
      isActive: false,
      updatedAt: new Date(),
    },
    { new: true }
  );
};

// Static method to check if user is blocked
userBlockSchema.statics.isUserBlocked = function(blockerId: string, blockedId: string) {
  return this.findOne({ 
    blockerId, 
    blockedId, 
    isActive: true 
  });
};

// Static method to get blocked users
userBlockSchema.statics.getBlockedUsers = function(userId: string) {
  return this.find({ 
    blockerId: userId, 
    isActive: true 
  })
    .populate('blockedId', 'firstName lastName avatar')
    .sort({ createdAt: -1 });
};

// Static method to get users who blocked this user
userBlockSchema.statics.getUsersWhoBlocked = function(userId: string) {
  return this.find({ 
    blockedId: userId, 
    isActive: true 
  })
    .populate('blockerId', 'firstName lastName avatar')
    .sort({ createdAt: -1 });
};

// Static method to get block statistics
userBlockSchema.statics.getBlockStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalBlocks: { $sum: 1 },
        activeBlocks: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        blocksByCategory: {
          $push: {
            category: '$category',
            count: 1,
          },
        },
        uniqueBlockers: { $addToSet: '$blockerId' },
        uniqueBlocked: { $addToSet: '$blockedId' },
      },
    },
    {
      $project: {
        totalBlocks: 1,
        activeBlocks: 1,
        uniqueBlockers: { $size: '$uniqueBlockers' },
        uniqueBlocked: { $size: '$uniqueBlocked' },
        blocksByCategory: 1,
      },
    },
  ]);
};

// Static method to get blocks by category
userBlockSchema.statics.getBlocksByCategory = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to cleanup old blocks
userBlockSchema.statics.cleanupOldBlocks = function(daysOld: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    isActive: false,
    createdAt: { $lt: cutoffDate },
  });
};

// Static method to get mutual blocks
userBlockSchema.statics.getMutualBlocks = function(userId1: string, userId2: string) {
  return this.find({
    $or: [
      { blockerId: userId1, blockedId: userId2 },
      { blockerId: userId2, blockedId: userId1 },
    ],
    isActive: true,
  });
};

export default mongoose.model<IUserBlock>('UserBlock', userBlockSchema);
