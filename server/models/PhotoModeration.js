/**
 * Photo Moderation Model
 * Tracks all uploaded photos through AI detection and manual review process
 */

const mongoose = require('mongoose');

const photoModerationSchema = new mongoose.Schema({
  // User who uploaded the photo
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Photo details
  photoUrl: {
    type: String,
    required: true
  },
  
  cloudinaryPublicId: {
    type: String,
    required: true
  },

  photoType: {
    type: String,
    enum: ['profile', 'pet', 'gallery', 'chat'],
    default: 'profile'
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Image metadata
  imageMetadata: {
    width: Number,
    height: Number,
    format: String,
    fileSize: Number
  },

  // Moderation Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under-review'],
    default: 'pending',
    index: true
  },

  priority: {
    type: String,
    enum: ['normal', 'high'],
    default: 'normal',
    index: true
  },

  // Manual Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  reviewedAt: Date,

  reviewNotes: String,

  rejectionReason: String,

  rejectionCategory: {
    type: String,
    enum: ['explicit', 'violence', 'self-harm', 'drugs', 'hate-speech', 'spam', 'other']
  },

  // User Context (cached for faster queries)
  userHistory: {
    totalUploads: { type: Number, default: 0 },
    rejectedUploads: { type: Number, default: 0 },
    approvedUploads: { type: Number, default: 0 },
    isTrustedUser: { type: Boolean, default: false },
    accountAge: Number // in days
  },

  // Appeal Process
  appeal: {
    submittedAt: Date,
    reason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    decision: {
      type: String,
      enum: ['pending', 'upheld', 'overturned']
    },
    notes: String
  },

  // Compliance
  expiresAt: {
    type: Date,
    // Auto-delete rejected photos after 90 days
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
photoModerationSchema.index({ status: 1, priority: -1, uploadedAt: 1 });
photoModerationSchema.index({ userId: 1, status: 1 });
photoModerationSchema.index({ reviewedBy: 1, reviewedAt: -1 });

// Methods
photoModerationSchema.methods.approve = async function(moderatorId, notes) {
  this.status = 'approved';
  this.reviewedBy = moderatorId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  await this.save();
};

photoModerationSchema.methods.reject = async function(moderatorId, reason, category, notes) {
  this.status = 'rejected';
  this.reviewedBy = moderatorId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.rejectionCategory = category;
  this.reviewNotes = notes;
  this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  await this.save();
};

// Static methods
photoModerationSchema.statics.getQueueStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const priorityStats = await this.aggregate([
    {
      $match: { status: { $in: ['pending', 'under-review'] } }
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    byStatus: stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byPriority: priorityStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

photoModerationSchema.statics.getModeratorStats = async function(moderatorId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await this.aggregate([
    {
      $match: {
        reviewedBy: moderatorId,
        reviewedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgReviewTime: {
          $avg: {
            $subtract: ['$reviewedAt', '$uploadedAt']
          }
        }
      }
    }
  ]);

  return stats;
};

const PhotoModeration = mongoose.model('PhotoModeration', photoModerationSchema);

module.exports = PhotoModeration;
