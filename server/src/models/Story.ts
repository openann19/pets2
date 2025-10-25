import mongoose, { Schema, Document } from 'mongoose';
import { IStory } from '../types';

/**
 * Story Model
 * 
 * Ephemeral stories that expire after 24 hours (Instagram/Snapchat style)
 * Features:
 * - Automatic TTL expiry (24 hours)
 * - View tracking with deduplication
 * - DM replies support
 * - Photo and video support
 */

const StoryViewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const StoryReplySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const storySchema = new Schema<IStory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    index: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video'],
    },
    url: {
      type: String,
      required: true,
    },
    publicId: String, // Cloudinary public ID
    thumbnailUrl: String, // For videos
    duration: Number, // For videos in seconds
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
    address: String,
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
  isPublic: {
    type: Boolean,
    default: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: [StoryViewSchema],
  replies: [StoryReplySchema],
  analytics: {
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  moderation: {
    isFlagged: { type: Boolean, default: false },
    flaggedBy: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      flaggedAt: { type: Date, default: Date.now },
    }],
    aiAnalysis: {
      confidence: Number,
      flags: [String],
      safe: { type: Boolean, default: true },
    },
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

// Indexes
storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ petId: 1, createdAt: -1 });
storySchema.index({ isPublic: 1, createdAt: -1 });
storySchema.index({ tags: 1 });
storySchema.index({ location: '2dsphere' });

// Virtual for time remaining
storySchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const remaining = this.expiresAt.getTime() - now.getTime();
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

// Virtual for is expired
storySchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for has user viewed
storySchema.virtual('hasUserViewed').get(function() {
  return (userId: string) => {
    return this.views.some((view: any) => view.userId.toString() === userId);
  };
});

// Virtual for has user liked
storySchema.virtual('hasUserLiked').get(function() {
  return (userId: string) => {
    return this.likes.some((like: any) => like.toString() === userId);
  };
});

// Pre-save middleware to set expiration
storySchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

// Pre-save middleware to update analytics
storySchema.pre('save', function(next) {
  this.analytics.viewCount = this.views.length;
  this.analytics.likeCount = this.likes.length;
  this.analytics.replyCount = this.replies.length;
  next();
});

// Instance method to add view
storySchema.methods.addView = function(userId: string) {
  const existingView = this.views.find((view: any) => view.userId.toString() === userId);
  
  if (!existingView) {
    this.views.push({
      userId,
      viewedAt: new Date(),
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to add like
storySchema.methods.addLike = function(userId: string) {
  const existingLike = this.likes.find((like: any) => like.toString() === userId);
  
  if (!existingLike) {
    this.likes.push(userId);
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to remove like
storySchema.methods.removeLike = function(userId: string) {
  this.likes = this.likes.filter((like: any) => like.toString() !== userId);
  return this.save();
};

// Instance method to add reply
storySchema.methods.addReply = function(userId: string, message: string) {
  this.replies.push({
    userId,
    message,
    createdAt: new Date(),
  });
  return this.save();
};

// Instance method to flag story
storySchema.methods.flagStory = function(userId: string, reason: string) {
  const existingFlag = this.moderation.flaggedBy.find((flag: any) => 
    flag.user.toString() === userId
  );
  
  if (!existingFlag) {
    this.moderation.flaggedBy.push({
      user: userId,
      reason,
      flaggedAt: new Date(),
    });
    this.moderation.isFlagged = true;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Static method to get active stories
storySchema.statics.getActiveStories = function(userId?: string, limit: number = 50) {
  const query: any = {
    isPublic: true,
    expiresAt: { $gt: new Date() },
    'moderation.isFlagged': false,
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName avatar')
    .populate('petId', 'name photos')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get stories by location
storySchema.statics.getStoriesByLocation = function(coordinates: [number, number], maxDistance: number = 10) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance * 1000, // Convert km to meters
      },
    },
    isPublic: true,
    expiresAt: { $gt: new Date() },
    'moderation.isFlagged': false,
  })
    .populate('userId', 'firstName lastName avatar')
    .populate('petId', 'name photos')
    .sort({ createdAt: -1 });
};

// Static method to cleanup expired stories
storySchema.statics.cleanupExpiredStories = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// Static method to get story analytics
storySchema.statics.getStoryAnalytics = function(userId?: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const matchStage: any = {
    createdAt: { $gte: startDate },
  };
  
  if (userId) {
    matchStage.userId = userId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalStories: { $sum: 1 },
        totalViews: { $sum: '$analytics.viewCount' },
        totalLikes: { $sum: '$analytics.likeCount' },
        totalReplies: { $sum: '$analytics.replyCount' },
        avgViews: { $avg: '$analytics.viewCount' },
        avgLikes: { $avg: '$analytics.likeCount' },
      },
    },
  ]);
};

export default mongoose.model<IStory>('Story', storySchema);
