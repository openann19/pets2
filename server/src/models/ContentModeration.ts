import mongoose from 'mongoose';

const contentModerationSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  contentType: {
    type: String,
    enum: ['pet', 'story', 'upload', 'message', 'user_profile'],
    required: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'quarantined', 'escalated'],
    default: 'pending'
  },
  moderationLevel: {
    type: String,
    enum: ['automated', 'human_review', 'senior_review'],
    default: 'human_review'
  },

  // Moderation metadata
  flaggedAt: {
    type: Date,
    default: Date.now
  },
  moderatedAt: Date,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Review reasons and actions
  flagReason: {
    type: String,
    maxlength: 1000
  },
  moderationReason: {
    type: String,
    maxlength: 1000
  },
  moderationNotes: String,

  // Quarantine specific fields
  quarantinedAt: Date,
  quarantinedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  quarantineReason: String,
  quarantineDuration: Number, // in days
  quarantineEndsAt: Date,

  // Escalation fields
  escalatedAt: Date,
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalationReason: String,
  escalationLevel: {
    type: String,
    enum: ['supervisor', 'legal', 'executive'],
    default: 'supervisor'
  },

  // Appeal system
  appealRequestedAt: Date,
  appealReason: String,
  appealResolvedAt: Date,
  appealResolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appealResolution: {
    type: String,
    enum: ['approved', 'denied', 'pending']
  },
  appealNotes: String,

  // Automated moderation
  automatedFlags: [{
    ruleName: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    confidence: Number, // 0-1
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Content snapshot for review
  contentSnapshot: {
    title: String,
    description: String,
    mediaUrls: [String],
    textContent: String,
    metadata: Object
  },

  // Review workflow
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  reviewDeadline: Date,

  // Audit trail
  reviewHistory: [{
    action: {
      type: String,
      enum: ['assigned', 'reviewed', 'escalated', 'quarantined', 'released', 'rejected', 'approved']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    oldStatus: String,
    newStatus: String
  }],

  // Priority and urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  urgencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },

  // Related content and reports
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  relatedContent: [{
    contentId: mongoose.Schema.Types.ObjectId,
    contentType: String,
    relationship: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
contentModerationSchema.index({ contentId: 1, contentType: 1 }, { unique: true });
contentModerationSchema.index({ moderationStatus: 1 });
contentModerationSchema.index({ moderationLevel: 1 });
contentModerationSchema.index({ priority: 1 });
contentModerationSchema.index({ assignedTo: 1 });
contentModerationSchema.index({ flaggedAt: -1 });
contentModerationSchema.index({ reviewDeadline: 1 });
contentModerationSchema.index({ escalatedAt: -1 });
contentModerationSchema.index({ 'automatedFlags.severity': 1 });

// Virtual for days in queue
contentModerationSchema.virtual('daysInQueue').get(function() {
  return Math.floor((Date.now() - this.flaggedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
contentModerationSchema.virtual('isOverdue').get(function() {
  if (!this.reviewDeadline) return false;
  return this.reviewDeadline < new Date() && this.moderationStatus === 'pending';
});

// Virtual for appeal status
contentModerationSchema.virtual('hasPendingAppeal').get(function() {
  return this.appealRequestedAt && !this.appealResolvedAt;
});

export default mongoose.model('ContentModeration', contentModerationSchema);

