export {};// Added to mark file as a module
const mongoose = require('mongoose');

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
  return Math.floor((Date.now() - this.flaggedAt) / (1000 * 60 * 60 * 24));
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

// Method to assign to moderator
contentModerationSchema.methods.assignToModerator = function(moderatorId, deadline = null) {
  this.assignedTo = moderatorId;
  this.assignedAt = new Date();
  this.reviewDeadline = deadline || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default

  this.reviewHistory.push({
    action: 'assigned',
    performedBy: moderatorId,
    oldStatus: this.moderationStatus,
    newStatus: this.moderationStatus,
    notes: `Assigned to moderator for review`
  });

  return this.save();
};

// Method to update moderation status
contentModerationSchema.methods.updateModerationStatus = function(newStatus, moderatorId, reason = '', notes = '') {
  const oldStatus = this.moderationStatus;
  this.moderationStatus = newStatus;
  this.moderatedAt = new Date();
  this.moderatedBy = moderatorId;
  this.moderationReason = reason;
  this.moderationNotes = notes;

  // Set specific timestamps based on status
  if (newStatus === 'quarantined') {
    this.quarantinedAt = new Date();
    this.quarantinedBy = moderatorId;
    this.quarantineReason = reason;
  } else if (newStatus === 'escalated') {
    this.escalatedAt = new Date();
    this.escalatedBy = moderatorId;
    this.escalationReason = reason;
  }

  this.reviewHistory.push({
    action: newStatus,
    performedBy: moderatorId,
    oldStatus,
    newStatus,
    notes: notes || reason
  });

  return this.save();
};

// Method to submit appeal
contentModerationSchema.methods.submitAppeal = function(reason) {
  if (this.moderationStatus !== 'rejected') {
    throw new Error('Appeals can only be submitted for rejected content');
  }

  this.appealRequestedAt = new Date();
  this.appealReason = reason;
  this.appealResolution = 'pending';

  return this.save();
};

// Method to resolve appeal
contentModerationSchema.methods.resolveAppeal = function(resolution, moderatorId, notes = '') {
  if (!this.appealRequestedAt) {
    throw new Error('No appeal request found');
  }

  this.appealResolvedAt = new Date();
  this.appealResolvedBy = moderatorId;
  this.appealResolution = resolution;
  this.appealNotes = notes;

  // If appeal is approved, change status back to approved
  if (resolution === 'approved') {
    this.moderationStatus = 'approved';
    this.reviewHistory.push({
      action: 'appeal_approved',
      performedBy: moderatorId,
      oldStatus: 'rejected',
      newStatus: 'approved',
      notes: `Appeal approved: ${notes}`
    });
  }

  return this.save();
};

// Static method to get moderation queue
contentModerationSchema.statics.getModerationQueue = function(options = {}) {
  const {
    status = 'pending',
    priority = null,
    assignedTo = null,
    limit = 20,
    skip = 0,
    sortBy = 'priority',
    sortOrder = -1
  } = options;

  const query = { moderationStatus: status };

  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;

  const sort = {};
  sort[sortBy] = sortOrder;
  sort.flaggedAt = 1; // Secondary sort by flagged date

  return this.find(query)
    .populate('assignedTo', 'firstName lastName email')
    .populate('moderatedBy', 'firstName lastName')
    .populate('contentId') // Will populate based on contentType
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get moderation statistics
contentModerationSchema.statics.getModerationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$moderationStatus',
        count: { $sum: 1 },
        avgProcessingTime: {
          $avg: {
            $cond: {
              if: { $and: ['$moderatedAt', '$flaggedAt'] },
              then: { $subtract: ['$moderatedAt', '$flaggedAt'] },
              else: null
            }
          }
        }
      }
    }
  ]);
};

// Pre-save middleware to calculate urgency score
contentModerationSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('priority') || this.isModified('moderationLevel')) {
    let score = 50; // Base score

    // Priority multiplier
    const priorityScores = { low: 20, medium: 50, high: 75, urgent: 100 };
    score = priorityScores[this.priority] || 50;

    // Moderation level adjustment
    if (this.moderationLevel === 'senior_review') score += 20;

    // Automated flags adjustment
    if (this.automatedFlags && this.automatedFlags.length > 0) {
      const highSeverityFlags = this.automatedFlags.filter(f => f.severity === 'high' || f.severity === 'critical');
      score += highSeverityFlags.length * 10;
    }

    // Time-based urgency
    const daysInQueue = Math.floor((Date.now() - this.flaggedAt) / (1000 * 60 * 60 * 24));
    if (daysInQueue > 7) score += 20;
    if (daysInQueue > 14) score += 30;

    this.urgencyScore = Math.min(100, score);
  }

  next();
});

module.exports = mongoose.model('ContentModeration', contentModerationSchema);
