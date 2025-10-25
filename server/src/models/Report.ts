export {};// Added to mark file as a module
const mongoose = require('mongoose');

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

// Indexes for performance
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

// Virtual for report age in days
reportSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for time to resolution in hours
reportSchema.virtual('timeToResolution').get(function() {
  if (this.resolvedAt) {
    return Math.floor((this.resolvedAt - this.submittedAt) / (1000 * 60 * 60));
  }
  return null;
});

// Method to check if report is overdue
reportSchema.methods.isOverdue = function() {
  const ageInDays = this.ageInDays;
  const overdueThresholds = {
    urgent: 1,
    high: 3,
    medium: 7,
    low: 14
  };
  return ageInDays > (overdueThresholds[this.priority] || 7);
};

// Method to check if report needs follow-up
reportSchema.methods.needsFollowUp = function() {
  return this.followUpRequired && 
         this.followUpDate && 
         this.followUpDate <= new Date() &&
         this.status !== 'resolved';
};

// Static method to get reports by status
reportSchema.statics.getReportsByStatus = function(status, limit = 20, skip = 0) {
  return this.find({ status })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species')
    .populate('reviewedBy', 'firstName lastName')
    .populate('resolvedBy', 'firstName lastName')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get reports by priority
reportSchema.statics.getReportsByPriority = function(priority, limit = 20, skip = 0) {
  return this.find({ priority })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get pending reports
reportSchema.statics.getPendingReports = function(limit = 20, skip = 0) {
  return this.find({ status: 'pending' })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species')
    .sort({ priority: -1, submittedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get overdue reports
reportSchema.statics.getOverdueReports = function(limit = 20, skip = 0) {
  const overdueThresholds = {
    urgent: 1,
    high: 3,
    medium: 7,
    low: 14
  };
  
  const cutoffDates = {};
  Object.keys(overdueThresholds).forEach(priority => {
    cutoffDates[priority] = new Date(Date.now() - overdueThresholds[priority] * 24 * 60 * 60 * 1000);
  });
  
  return this.find({
    status: { $in: ['pending', 'under_review'] },
    $or: [
      { priority: 'urgent', submittedAt: { $lt: cutoffDates.urgent } },
      { priority: 'high', submittedAt: { $lt: cutoffDates.high } },
      { priority: 'medium', submittedAt: { $lt: cutoffDates.medium } },
      { priority: 'low', submittedAt: { $lt: cutoffDates.low } }
    ]
  })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species')
    .sort({ priority: -1, submittedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get report statistics
reportSchema.statics.getReportStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get reports by type
reportSchema.statics.getReportsByType = function(type, limit = 20, skip = 0) {
  return this.find({ type })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get reports by category
reportSchema.statics.getReportsByCategory = function(category, limit = 20, skip = 0) {
  return this.find({ category })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get reports requiring follow-up
reportSchema.statics.getReportsRequiringFollowUp = function(limit = 20, skip = 0) {
  return this.find({
    followUpRequired: true,
    followUpDate: { $lte: new Date() },
    status: { $ne: 'resolved' }
  })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species')
    .sort({ followUpDate: 1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to update timestamps
reportSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'under_review') {
      this.reviewedAt = new Date();
    } else if (this.status === 'resolved') {
      this.resolvedAt = new Date();
    }
  }
  
  next();
});

// Pre-save middleware to validate required fields based on category
reportSchema.pre('save', function(next) {
  if (this.category === 'user' && !this.reportedUserId) {
    return next(new Error('Reported user ID is required for user reports'));
  }
  
  if (this.category === 'pet' && !this.reportedPetId) {
    return next(new Error('Reported pet ID is required for pet reports'));
  }
  
  if (this.category === 'chat' && !this.reportedMatchId) {
    return next(new Error('Reported match ID is required for chat reports'));
  }
  
  if (this.category === 'message' && !this.reportedMessageId) {
    return next(new Error('Reported message ID is required for message reports'));
  }
  
  next();
});

// Pre-save middleware to auto-assign priority based on type
reportSchema.pre('save', function(next) {
  if (this.isNew) {
    const priorityMap = {
      'animal_abuse': 'urgent',
      'underage': 'urgent',
      'scam': 'high',
      'harassment': 'high',
      'inappropriate_content': 'medium',
      'fake_profile': 'medium',
      'spam': 'low',
      'other': 'medium'
    };
    
    if (!this.priority || this.priority === 'medium') {
      this.priority = priorityMap[this.type] || 'medium';
    }
  }
  
  next();
});

module.exports = mongoose.model('Report', reportSchema);
