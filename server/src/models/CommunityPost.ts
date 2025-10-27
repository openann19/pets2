import mongoose from 'mongoose';

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

export default mongoose.model('CommunityPost', communityPostSchema);

