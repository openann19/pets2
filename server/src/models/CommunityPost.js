const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    cloudinaryPublicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack'
  },
  type: {
    type: String,
    enum: ['post', 'activity', 'announcement'],
    default: 'post'
  },
  activityDetails: {
    date: Date,
    location: String,
    maxAttendees: Number,
    currentAttendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    requirements: [String],
    contactInfo: {
      email: String,
      phone: String
    }
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: Date
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  moderatedAt: Date,
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  engagementScore: {
    type: Number,
    default: 0
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: {
      platform: String,
      browser: String,
      os: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ packId: 1 });
communityPostSchema.index({ type: 1 });
communityPostSchema.index({ moderationStatus: 1 });
communityPostSchema.index({ isPinned: -1, createdAt: -1 });
communityPostSchema.index({ engagementScore: -1 });
communityPostSchema.index({ 'metadata.location': '2dsphere' });
communityPostSchema.index({ tags: 1 });

// Compound indexes
communityPostSchema.index({ packId: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, type: 1 });

// Virtual for like count
communityPostSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// Virtual for comment count
communityPostSchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

// Virtual for share count
communityPostSchema.virtual('shareCount').get(function() {
  return this.shares?.length || 0;
});

// Method to check if user liked this post
communityPostSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user?.toString() === userId?.toString());
};

// Method to toggle like
communityPostSchema.methods.toggleLike = function(userId) {
  const index = this.likes.findIndex(like => like.user?.toString() === userId?.toString());
  
  if (index > -1) {
    this.likes.splice(index, 1);
    return false; // Unlike
  } else {
    this.likes.push({ user: userId, likedAt: new Date() });
    return true; // Like
  }
};

// Method to add comment
communityPostSchema.methods.addComment = function(comment) {
  this.comments.push({
    author: comment.author,
    content: comment.content,
    likes: [],
    replies: [],
    createdAt: new Date()
  });
};

// Method to calculate engagement score
communityPostSchema.methods.calculateEngagementScore = function() {
  const now = Date.now();
  const postAge = now - this.createdAt.getTime();
  const dayInMs = 24 * 60 * 60 * 1000;
  const daysOld = postAge / dayInMs;
  
  // Weight recent engagement higher
  const timeDecay = Math.exp(-daysOld / 30);
  
  // Calculate base score
  const likeScore = this.likes.length * 1;
  const commentScore = this.comments.length * 3;
  const shareScore = this.shares.length * 5;
  const viewScore = Math.min(this.viewCount / 100, 5);
  
  // Apply time decay
  this.engagementScore = (likeScore + commentScore + shareScore + viewScore) * timeDecay;
  
  return this.engagementScore;
};

// Static method to get trending posts
communityPostSchema.statics.getTrendingPosts = function(limit = 20, skip = 0) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.find({
    createdAt: { $gte: yesterday },
    moderationStatus: 'approved',
    isArchived: false
  })
    .populate('author', 'firstName lastName avatar')
    .populate('packId', 'name')
    .sort({ engagementScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get posts by pack
communityPostSchema.statics.getPostsByPack = function(packId, limit = 20, skip = 0) {
  return this.find({
    packId,
    moderationStatus: 'approved',
    isArchived: false
  })
    .populate('author', 'firstName lastName avatar')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get user's posts
communityPostSchema.statics.getUserPosts = function(authorId, limit = 20, skip = 0) {
  return this.find({
    author: authorId,
    moderationStatus: 'approved',
    isArchived: false
  })
    .populate('packId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to update engagement score
communityPostSchema.pre('save', function(next) {
  if (this.isModified('likes') || this.isModified('comments') || this.isModified('shares')) {
    this.calculateEngagementScore();
  }
  next();
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);

