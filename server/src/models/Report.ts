import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedPetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  reportedMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  reportedMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  type: {
    type: String,
    enum: [
      'inappropriate_content',
      'harassment',
      'spam',
      'fake_profile',
      'underage',
      'animal_abuse',
      'scam',
      'inappropriate_behavior',
      'copyright_violation',
      'other'
    ],
    required: true
  },
  category: {
    type: String,
    enum: ['user', 'pet', 'chat', 'message', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  description: {
    type: String,
    maxlength: 2000
  },
  evidence: [{
    type: {
      type: String,
      enum: ['screenshot', 'message', 'photo', 'video', 'other'],
      required: true
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed', 'escalated'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    enum: ['action_taken', 'no_violation', 'warning_issued', 'account_suspended', 'account_banned', 'content_removed', 'other']
  },
  resolutionNotes: String,
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'suspension', 'ban', 'content_removal', 'account_restriction', 'other']
  },
  actionDetails: String,
  escalatedAt: Date,
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalationReason: String,
  moderatedAt: Date,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationReason: String,
  moderationNotes: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    reportSource: {
      type: String,
      enum: ['web', 'mobile'],
      default: 'web'
    },
    deviceInfo: {
      type: String,
      browser: String,
      os: String
    }
  },
  tags: [String],
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: String,
  followUpDate: Date
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ reporterId: 1 });
reportSchema.index({ reportedUserId: 1 });
reportSchema.index({ reportedPetId: 1 });
reportSchema.index({ reportedMatchId: 1 });
reportSchema.index({ reportedMessageId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ submittedAt: -1 });
reportSchema.index({ reviewedAt: -1 });
reportSchema.index({ resolvedAt: -1 });

// Compound indexes
reportSchema.index({ status: 1, priority: 1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ reportedUserId: 1, status: 1 });

export default mongoose.model('Report', reportSchema);

