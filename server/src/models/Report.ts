import mongoose, { Schema, Document } from 'mongoose';
import { IReport } from '../types';

const reportSchema = new Schema<IReport>({
  reporterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reportedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  reportedPetId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    index: true,
  },
  reportedMessageId: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    index: true,
  },
  reason: {
    type: String,
    required: true,
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
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'video', 'text', 'url'],
    },
    url: String,
    content: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Admin user
  },
  adminNotes: {
    type: String,
    maxlength: 2000,
  },
  resolution: {
    action: {
      type: String,
      enum: ['warning', 'suspension', 'ban', 'content_removal', 'no_action'],
    },
    details: String,
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
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
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ status: 1, priority: 1 });
reportSchema.index({ assignedTo: 1 });
reportSchema.index({ createdAt: -1 });

// Virtual for time since creation
reportSchema.virtual('timeAgo').get(function() {
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

// Virtual for is overdue
reportSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'dismissed') return false;
  
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60);
  
  // Different thresholds based on priority
  const thresholds = {
    urgent: 2,    // 2 hours
    high: 24,     // 24 hours
    medium: 72,   // 72 hours
    low: 168,     // 1 week
  };
  
  return hoursSinceCreation > thresholds[this.priority as keyof typeof thresholds];
});

// Instance method to assign to admin
reportSchema.methods.assignToAdmin = function(adminId: string) {
  this.assignedTo = adminId;
  this.status = 'investigating';
  return this.save();
};

// Instance method to add admin note
reportSchema.methods.addAdminNote = function(note: string, adminId: string) {
  this.adminNotes = (this.adminNotes || '') + `\n[${new Date().toISOString()}] ${note}`;
  return this.save();
};

// Instance method to resolve report
reportSchema.methods.resolve = function(action: string, details: string, resolvedBy: string) {
  this.status = 'resolved';
  this.resolution = {
    action: action as any,
    details,
    resolvedAt: new Date(),
    resolvedBy: resolvedBy as any,
  };
  return this.save();
};

// Instance method to dismiss report
reportSchema.methods.dismiss = function(reason: string, dismissedBy: string) {
  this.status = 'dismissed';
  this.resolution = {
    action: 'no_action',
    details: reason,
    resolvedAt: new Date(),
    resolvedBy: dismissedBy as any,
  };
  return this.save();
};

// Instance method to escalate priority
reportSchema.methods.escalatePriority = function(newPriority: string) {
  const priorityOrder = ['low', 'medium', 'high', 'urgent'];
  const currentIndex = priorityOrder.indexOf(this.priority);
  const newIndex = priorityOrder.indexOf(newPriority);
  
  if (newIndex > currentIndex) {
    this.priority = newPriority;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Static method to create report
reportSchema.statics.createReport = function(reportData: {
  reporterId: string;
  reportedUserId?: string;
  reportedPetId?: string;
  reportedMessageId?: string;
  reason: string;
  description?: string;
  evidence?: any[];
}) {
  return this.create({
    ...reportData,
    createdAt: new Date(),
  });
};

// Static method to get reports by status
reportSchema.statics.getReportsByStatus = function(status: string, limit: number = 50) {
  return this.find({ status })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species breed')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get reports by priority
reportSchema.statics.getReportsByPriority = function(priority: string, limit: number = 50) {
  return this.find({ 
    priority,
    status: { $in: ['pending', 'investigating'] }
  })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reportedPetId', 'name species breed')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get overdue reports
reportSchema.statics.getOverdueReports = function() {
  const now = new Date();
  const urgentThreshold = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours
  const highThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours
  const mediumThreshold = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours
  
  return this.find({
    status: { $in: ['pending', 'investigating'] },
    $or: [
      { priority: 'urgent', createdAt: { $lt: urgentThreshold } },
      { priority: 'high', createdAt: { $lt: highThreshold } },
      { priority: 'medium', createdAt: { $lt: mediumThreshold } },
    ],
  })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to get report statistics
reportSchema.statics.getReportStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        pendingReports: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        investigatingReports: {
          $sum: { $cond: [{ $eq: ['$status', 'investigating'] }, 1, 0] }
        },
        resolvedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        dismissedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] }
        },
        urgentReports: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        highPriorityReports: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
      },
    },
  ]);
};

// Static method to get reports by reason
reportSchema.statics.getReportsByReason = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

export default mongoose.model<IReport>('Report', reportSchema);
