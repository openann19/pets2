import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import {
  IStory,
  IStoryMethods,
  IStoryModel,
  IStoryView,
  IStoryReply
} from '../types/mongoose.d';

/**
 * Story View Schema
 */
const storyViewSchema = new Schema<IStoryView>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * Story Reply Schema
 */
const storyReplySchema = new Schema<IStoryReply>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

/**
 * Story Schema
 * Ephemeral stories that expire after 24 hours (Instagram/Snapchat style)
 * Features:
 * - Automatic TTL expiry (24 hours)
 * - View tracking with deduplication
 * - DM replies support
 * - Photo and video support
 */
const storySchema = new Schema<IStory, IStoryModel, IStoryMethods>({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  mediaType: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  caption: {
    type: String,
    maxlength: 2200
  },
  duration: {
    type: Number,
    default: 5, // seconds for photos, actual duration for videos
    min: 1,
    max: 60
  },
  views: {
    type: [storyViewSchema],
    default: []
  },
  viewCount: {
    type: Number,
    default: 0
  },
  replies: {
    type: [storyReplySchema],
    default: []
  },
  replyCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
// Compound index for user's stories sorted by creation time
storySchema.index({ userId: 1, createdAt: -1 });

// TTL index for automatic expiry (also supports lookups by expiresAt)
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Add a view to the story (deduplicated by userId)
 */
storySchema.methods.addView = function(this: any, userId: string): boolean {
  // Check if user already viewed
  const existingView = this.views.find(
    (view: IStoryView) => view.userId.toString() === userId.toString()
  );

  if (existingView) {
    return false; // Already viewed
  }

  this.views.push({
    userId,
    viewedAt: new Date()
  });

  this.viewCount = this.views.length;
  return true; // New view added
};

/**
 * Add a reply to the story
 */
storySchema.methods.addReply = function(this: any, userId: string, message: string): void {
  this.replies.push({
    userId,
    message,
    createdAt: new Date()
  });

  this.replyCount = this.replies.length;
};

/**
 * Check if story is expired
 */
storySchema.methods.isExpired = function(this: any): boolean {
  return new Date() > this.expiresAt;
};

/**
 * Check if user has viewed this story
 */
storySchema.methods.hasUserViewed = function(this: any, userId: string): boolean {
  return this.views.some(
    (view: IStoryView) => view.userId.toString() === userId.toString()
  );
};

/**
 * Get active stories for a user's feed (following + own)
 */
storySchema.statics.getActiveFeedStories = async function(userId: string, followingIds: string[] = [], options: Record<string, unknown> = {}): Promise<any> {
  const interpretedAsOptions = followingIds && !Array.isArray(followingIds) && typeof followingIds === 'object';
  const normalizedFollowingIds = interpretedAsOptions ? [] : followingIds;
  const optionsConfig = interpretedAsOptions ? followingIds : options;

  const now = new Date();
  const userIds = [userId, ...normalizedFollowingIds];

  const query: Record<string, unknown> = {
    userId: { $in: userIds },
    expiresAt: { $gt: now }
  };

  if (optionsConfig && (optionsConfig as any).cursor) {
    const cursorDate = new Date((optionsConfig as any).cursor);
    if (!isNaN(cursorDate.getTime())) {
      query.createdAt = { $lt: cursorDate };
    }
  }

  const limit = optionsConfig && Number.isInteger((optionsConfig as any).limit)
    ? Math.max(1, Math.min((optionsConfig as any).limit, 100))
    : undefined;

  return this.find(query)
    .populate('userId', 'name profilePhoto username')
    .sort({ createdAt: -1 })
    .limit(limit || 0)
    .lean();
};

/**
 * Get user's active stories
 */
storySchema.statics.getUserActiveStories = async function(userId: string, options: Record<string, unknown> = {}): Promise<any> {
  const now = new Date();
  const query: Record<string, unknown> = {
    userId,
    expiresAt: { $gt: now }
  };

  if (options && (options as any).cursor) {
    const cursorDate = new Date((options as any).cursor);
    if (!isNaN(cursorDate.getTime())) {
      query.createdAt = { $lt: cursorDate };
    }
  }

  const limit = options && Number.isInteger((options as any).limit) 
    ? Math.max(1, Math.min((options as any).limit, 100)) 
    : undefined;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit || 0)
    .lean();
};

/**
 * Get stories grouped by user (for stories bar)
 */
storySchema.statics.getStoriesGroupedByUser = async function(userId: string, followingIds: string[] = [], options: Record<string, unknown> = {}): Promise<any> {
  const interpretedAsOptions = followingIds && !Array.isArray(followingIds) && typeof followingIds === 'object';
  const normalizedFollowingIds = interpretedAsOptions ? [] : followingIds;
  const optionsConfig = interpretedAsOptions ? followingIds : options;
  const now = new Date();
  const userIds = [userId, ...normalizedFollowingIds];

  const match: Record<string, unknown> = {
    userId: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) },
    expiresAt: { $gt: now }
  };

  if (optionsConfig && (optionsConfig as any).cursor) {
    const cursorDate = new Date((optionsConfig as any).cursor);
    if (!isNaN(cursorDate.getTime())) {
      match.createdAt = { $lt: cursorDate };
    }
  }

  const pipeline: any[] = [
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$userId',
        stories: { $push: '$$ROOT' },
        latestStory: { $first: '$$ROOT' },
        storyCount: { $sum: 1 },
        hasUnseen: {
          $sum: {
            $cond: [
              {
                $not: {
                  $in: [new mongoose.Types.ObjectId(userId), '$views.userId']
                }
              },
              1,
              0
            ]
          }
        }
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
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        user: {
          _id: '$user._id',
          name: '$user.name',
          username: '$user.username',
          profilePhoto: '$user.profilePhoto'
        },
        stories: 1,
        storyCount: 1,
        hasUnseen: { $gt: ['$hasUnseen', 0] },
        latestStoryTime: '$latestStory.createdAt'
      }
    },
    { $sort: { hasUnseen: -1, latestStoryTime: -1 } }
  ];

  if (optionsConfig && Number.isInteger((optionsConfig as any).limit)) {
    const limit = Math.max(1, Math.min((optionsConfig as any).limit, 100));
    pipeline.push({ $limit: limit });
  }

  return this.aggregate(pipeline);
};

/**
 * Delete expired stories (manual cleanup, TTL is primary)
 */
storySchema.statics.deleteExpiredStories = async function(): Promise<number> {
  const now = new Date();

  const result = await this.deleteMany({
    expiresAt: { $lt: now }
  });

  return result.deletedCount || 0;
};

/**
 * Pre-save hook: Set expiresAt if not already set (24 hours from creation)
 */
storySchema.pre('save', function(this: any, next) {
  if (!this.expiresAt) {
    const baseDate = this.createdAt instanceof Date ? this.createdAt : new Date();
    this.expiresAt = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  }
  next();
});

/**
 * Virtual properties
 */
storySchema.virtual('isActive').get(function(this: any): boolean {
  return new Date() < this.expiresAt;
});

storySchema.virtual('timeRemaining').get(function(this: any): number {
  const now = new Date();
  return Math.max(0, this.expiresAt.getTime() - now.getTime());
});

// Ensure virtuals are included in JSON
storySchema.set('toJSON', { virtuals: true });
storySchema.set('toObject', { virtuals: true });

export type IStoryDocument = HydratedDocument<IStory, IStoryMethods>;

// Export the model
const Story = mongoose.model<IStory, IStoryModel>('Story', storySchema);

export default Story;
