import mongoose, { Schema, Document } from 'mongoose';
import { IContentModeration } from '../types';

const contentModerationSchema = new Schema<IContentModeration>({
  contentId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  contentType: {
    type: String,
    enum: ['photo', 'message', 'profile', 'story'],
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true,
  },
  aiAnalysis: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    flags: [{
      type: String,
      enum: [
        'inappropriate_content',
        'violence',
        'nudity',
        'harassment',
        'spam',
        'fake_content',
        'copyright_violation',
        'hate_speech',
        'adult_content',
        'other'
      ],
    }],
    categories: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
    },
    toxicityScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  humanReview: {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    decision: {
      type: String,
      enum: ['approve', 'reject'],
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  flags: [{
    type: String,
    enum: [
      'inappropriate_content',
      'violence',
      'nudity',
      'harassment',
      'spam',
      'fake_content',
      'copyright_violation',
      'hate_speech',
      'adult_content',
      'other'
    ],
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  autoModerationEnabled: {
    type: Boolean,
    default: true,
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
contentModerationSchema.index({ contentId: 1, contentType: 1 });
contentModerationSchema.index({ status: 1, priority: 1 });
contentModerationSchema.index({ userId: 1 });
contentModerationSchema.index({ createdAt: -1 });
contentModerationSchema.index({ 'aiAnalysis.confidence': -1 });

// Virtual for is high priority
contentModerationSchema.virtual('isHighPriority').get(function() {
  return this.priority === 'high' || this.priority === 'urgent';
});

// Virtual for needs human review
contentModerationSchema.virtual('needsHumanReview').get(function() {
  return this.status === 'pending' && (
    this.confidence < 0.8 || 
    this.flags.length > 0 || 
    this.escalationLevel > 0
  );
});

// Virtual for time since creation
contentModerationSchema.virtual('timeAgo').get(function() {
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

// Instance method to approve content
contentModerationSchema.methods.approve = function(reviewerId: string, notes?: string) {
  this.status = 'approved';
  this.humanReview = {
    reviewerId: reviewerId as any,
    decision: 'approve',
    reviewedAt: new Date(),
    notes,
  };
  return this.save();
};

// Instance method to reject content
contentModerationSchema.methods.reject = function(reviewerId: string, reason: string, notes?: string) {
  this.status = 'rejected';
  this.humanReview = {
    reviewerId: reviewerId as any,
    decision: 'reject',
    reason,
    reviewedAt: new Date(),
    notes,
  };
  return this.save();
};

// Instance method to flag content
contentModerationSchema.methods.flag = function(flags: string[], confidence: number) {
  this.status = 'flagged';
  this.flags = flags;
  this.confidence = confidence;
  return this.save();
};

// Instance method to escalate
contentModerationSchema.methods.escalate = function() {
  this.escalationLevel = Math.min(this.escalationLevel + 1, 3);
  this.priority = this.escalationLevel >= 2 ? 'high' : 'medium';
  return this.save();
};

// Instance method to update AI analysis
contentModerationSchema.methods.updateAIAnalysis = function(analysis: any) {
  this.aiAnalysis = {
    ...this.aiAnalysis,
    ...analysis,
    processedAt: new Date(),
  };
  this.confidence = analysis.confidence || this.confidence;
  return this.save();
};

// Static method to create moderation record
contentModerationSchema.statics.createModeration = function(moderationData: {
  contentId: string;
  contentType: string;
  userId?: string;
  aiAnalysis?: any;
  flags?: string[];
  confidence?: number;
}) {
  return this.create({
    ...moderationData,
    createdAt: new Date(),
  });
};

// Static method to get pending moderation
contentModerationSchema.statics.getPendingModeration = function(limit: number = 50) {
  return this.find({ 
    status: 'pending' 
  })
    .populate('userId', 'firstName lastName email')
    .populate('humanReview.reviewerId', 'firstName lastName email')
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit);
};

// Static method to get flagged content
contentModerationSchema.statics.getFlaggedContent = function(limit: number = 50) {
  return this.find({ 
    status: 'flagged' 
  })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get moderation by content
contentModerationSchema.statics.getModerationByContent = function(contentId: string, contentType: string) {
  return this.findOne({ 
    contentId, 
    contentType 
  });
};

// Static method to get moderation statistics
contentModerationSchema.statics.getModerationStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalModerations: { $sum: 1 },
        pendingModerations: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedModerations: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedModerations: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        flaggedModerations: {
          $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] }
        },
        avgConfidence: { $avg: '$confidence' },
        highPriorityModerations: {
          $sum: { $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0] }
        },
      },
    },
  ]);
};

// Static method to get moderation by content type
contentModerationSchema.statics.getModerationByContentType = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$contentType',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        flagged: {
          $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] }
        },
        avgConfidence: { $avg: '$confidence' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to cleanup old moderation records
contentModerationSchema.statics.cleanupOldModerations = function(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    status: { $in: ['approved', 'rejected'] },
    createdAt: { $lt: cutoffDate },
  });
};

export default mongoose.model<IContentModeration>('ContentModeration', contentModerationSchema);
