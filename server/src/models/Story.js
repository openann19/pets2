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

const mongoose = require('mongoose');
const { Schema } = mongoose;

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
}, { _id: true });

const StorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    mediaType: {
        type: String,
        enum: ['photo', 'video'],
        required: true,
    },
    mediaUrl: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
    },
    caption: {
        type: String,
        // Align with shared schema: allow up to Instagram-like caption length
        maxlength: 2200,
    },
    duration: {
        type: Number,
        default: 5, // seconds for photos, actual duration for videos
        min: 1,
        max: 60,
    },
    views: {
        type: [StoryViewSchema],
        default: [],
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    replies: {
        type: [StoryReplySchema],
        default: [],
    },
    replyCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});

// ============================================================================
// Indexes
// ============================================================================

// Compound index for user's stories sorted by creation time
StorySchema.index({ userId: 1, createdAt: -1 });

// TTL index for automatic expiry (also supports lookups by expiresAt)
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================================================
// Methods
// ============================================================================

/**
 * Add a view to the story (deduplicated by userId)
 */
StorySchema.methods.addView = function (userId) {
    // Check if user already viewed
    const existingView = this.views.find(
        view => view.userId.toString() === userId.toString()
    );

    if (existingView) {
        return false; // Already viewed
    }

    this.views.push({
        userId,
        viewedAt: new Date(),
    });

    this.viewCount = this.views.length;
    return true; // New view added
};

/**
 * Add a reply to the story
 */
StorySchema.methods.addReply = function (userId, message) {
    this.replies.push({
        userId,
        message,
        createdAt: new Date(),
    });

    this.replyCount = this.replies.length;
};

/**
 * Check if story is expired
 */
StorySchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

/**
 * Check if user has viewed this story
 */
StorySchema.methods.hasUserViewed = function (userId) {
    return this.views.some(
        view => view.userId.toString() === userId.toString()
    );
};

// ============================================================================
// Statics
// ============================================================================

/**
 * Get active stories for a user's feed (following + own)
 */
StorySchema.statics.getActiveFeedStories = async function (userId, followingIds = [], options = {}) {
    const interpretedAsOptions = followingIds && !Array.isArray(followingIds) && typeof followingIds === 'object';
    const normalizedFollowingIds = interpretedAsOptions ? [] : followingIds;
    const optionsConfig = interpretedAsOptions ? followingIds : options;

    const now = new Date();
    const userIds = [userId, ...normalizedFollowingIds];

    const query = {
        userId: { $in: userIds },
        expiresAt: { $gt: now },
    };

    if (optionsConfig && optionsConfig.cursor) {
        const cursorDate = new Date(optionsConfig.cursor);
        if (!isNaN(cursorDate.getTime())) {
            query.createdAt = { $lt: cursorDate };
        }
    }

    const limit = optionsConfig && Number.isInteger(optionsConfig.limit)
        ? Math.max(1, Math.min(optionsConfig.limit, 100))
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
StorySchema.statics.getUserActiveStories = async function (userId, options = {}) {
    const now = new Date();
    const query = {
        userId,
        expiresAt: { $gt: now },
    };

    if (options && options.cursor) {
        const cursorDate = new Date(options.cursor);
        if (!isNaN(cursorDate.getTime())) {
            query.createdAt = { $lt: cursorDate };
        }
    }

    const limit = options && Number.isInteger(options.limit) ? Math.max(1, Math.min(options.limit, 100)) : undefined;

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 0)
        .lean();
};

/**
 * Get stories grouped by user (for stories bar)
 */
StorySchema.statics.getStoriesGroupedByUser = async function (userId, followingIds = [], options = {}) {
    const interpretedAsOptions = followingIds && !Array.isArray(followingIds) && typeof followingIds === 'object';
    const normalizedFollowingIds = interpretedAsOptions ? [] : followingIds;
    const optionsConfig = interpretedAsOptions ? followingIds : options;
    const now = new Date();
    const userIds = [userId, ...normalizedFollowingIds];

    const match = {
        userId: { $in: userIds.map(id => mongoose.Types.ObjectId(id)) },
        expiresAt: { $gt: now },
    };
    if (optionsConfig && optionsConfig.cursor) {
        const cursorDate = new Date(optionsConfig.cursor);
        if (!isNaN(cursorDate.getTime())) {
            match.createdAt = { $lt: cursorDate };
        }
    }

    const pipeline = [
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
                                    $in: [mongoose.Types.ObjectId(userId), '$views.userId'],
                                },
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },
        {
            $project: {
                userId: '$_id',
                user: {
                    _id: '$user._id',
                    name: '$user.name',
                    username: '$user.username',
                    profilePhoto: '$user.profilePhoto',
                },
                stories: 1,
                storyCount: 1,
                hasUnseen: { $gt: ['$hasUnseen', 0] },
                latestStoryTime: '$latestStory.createdAt',
            },
        },
        { $sort: { hasUnseen: -1, latestStoryTime: -1 } },
    ];

    if (optionsConfig && Number.isInteger(optionsConfig.limit)) {
        const limit = Math.max(1, Math.min(optionsConfig.limit, 100));
        pipeline.push({ $limit: limit });
    }

    return this.aggregate(pipeline);
};

/**
 * Delete expired stories (manual cleanup, TTL is primary)
 */
StorySchema.statics.deleteExpiredStories = async function () {
    const now = new Date();

    const result = await this.deleteMany({
        expiresAt: { $lt: now },
    });

    return result.deletedCount;
};

// ============================================================================
// Pre-save Hook
// ============================================================================

StorySchema.pre('save', function (next) {
    // Set expiresAt if not already set (24 hours from creation)
    if (!this.expiresAt) {
        const baseDate = this.createdAt instanceof Date ? this.createdAt : new Date();
        this.expiresAt = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
    }
    next();
});

// ============================================================================
// Virtual Properties
// ============================================================================

StorySchema.virtual('isActive').get(function () {
    return new Date() < this.expiresAt;
});

StorySchema.virtual('timeRemaining').get(function () {
    const now = new Date();
    return Math.max(0, this.expiresAt - now);
});

// Ensure virtuals are included in JSON
StorySchema.set('toJSON', { virtuals: true });
StorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Story', StorySchema);
