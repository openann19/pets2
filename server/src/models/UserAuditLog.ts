import mongoose, { Schema, Document } from 'mongoose';
import { IUserAuditLog } from '../types';

const userAuditLogSchema = new Schema<IUserAuditLog>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'register', 'profile_update', 'password_change',
      'pet_create', 'pet_update', 'pet_delete',
      'match_create', 'match_delete', 'match_unmatch',
      'message_send', 'message_delete',
      'story_create', 'story_delete', 'story_reply',
      'photo_upload', 'photo_delete',
      'verification_submit', 'verification_complete',
      'subscription_start', 'subscription_cancel',
      'report_create', 'report_resolve',
      'block_user', 'unblock_user',
      'mute_user', 'unmute_user',
      'other'
    ],
    index: true,
  },
  details: { 
    type: Schema.Types.Mixed,
    default: {},
  },
  ipAddress: { 
    type: String,
    maxlength: 45, // IPv6 max length
  },
  userAgent: { 
    type: String,
    maxlength: 500,
  },
  requestId: { 
    type: String,
    maxlength: 100,
  },
  metadata: { 
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userAuditLogSchema.index({ userId: 1, timestamp: -1 });
userAuditLogSchema.index({ action: 1, timestamp: -1 });
userAuditLogSchema.index({ ipAddress: 1 });
userAuditLogSchema.index({ requestId: 1 });

// TTL index: keep logs for 180 days
userAuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

// Virtual for time ago
userAuditLogSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Virtual for is recent
userAuditLogSchema.virtual('isRecent').get(function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.timestamp > oneHourAgo;
});

// Static method to log user action
userAuditLogSchema.statics.logAction = function(logData: {
  userId: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: any;
}) {
  return this.create({
    ...logData,
    timestamp: new Date(),
  });
};

// Static method to get user audit trail
userAuditLogSchema.statics.getUserAuditTrail = function(userId: string, limit: number = 100) {
  return this.find({ userId })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get actions by type
userAuditLogSchema.statics.getActionsByType = function(action: string, limit: number = 100) {
  return this.find({ action })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get recent actions
userAuditLogSchema.statics.getRecentActions = function(hours: number = 24, limit: number = 100) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({ timestamp: { $gte: cutoffDate } })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get actions by IP
userAuditLogSchema.statics.getActionsByIP = function(ipAddress: string, limit: number = 100) {
  return this.find({ ipAddress })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get audit statistics
userAuditLogSchema.statics.getAuditStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueIPs: { $addToSet: '$ipAddress' },
        actionsByType: {
          $push: {
            action: '$action',
            count: 1,
          },
        },
        avgActionsPerUser: {
          $avg: { $size: '$userId' }
        },
      },
    },
    {
      $project: {
        totalActions: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        uniqueIPs: { $size: '$uniqueIPs' },
        actionsByType: 1,
        avgActionsPerUser: 1,
      },
    },
  ]);
};

// Static method to get actions by user
userAuditLogSchema.statics.getActionsByUser = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$userId',
        actionCount: { $sum: 1 },
        lastAction: { $max: '$timestamp' },
        actions: { $push: '$action' },
        uniqueIPs: { $addToSet: '$ipAddress' },
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
    {
      $unwind: '$user',
    },
    {
      $project: {
        userId: '$_id',
        user: { firstName: 1, lastName: 1, email: 1 },
        actionCount: 1,
        lastAction: 1,
        uniqueIPs: { $size: '$uniqueIPs' },
        mostCommonAction: {
          $arrayElemAt: [
            {
              $map: {
                input: { $slice: ['$actions', 1] },
                as: 'action',
                in: '$$action',
              },
            },
            0,
          ],
        },
      },
    },
    { $sort: { actionCount: -1 } },
  ]);
};

// Static method to get suspicious activity
userAuditLogSchema.statics.getSuspiciousActivity = function(hours: number = 24) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: cutoffDate } } },
    {
      $group: {
        _id: {
          userId: '$userId',
          ipAddress: '$ipAddress',
        },
        actionCount: { $sum: 1 },
        actions: { $push: '$action' },
        lastAction: { $max: '$timestamp' },
      },
    },
    {
      $match: {
        actionCount: { $gte: 10 }, // More than 10 actions in the time period
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        userId: '$_id.userId',
        ipAddress: '$_id.ipAddress',
        user: { firstName: 1, lastName: 1, email: 1 },
        actionCount: 1,
        lastAction: 1,
        actions: 1,
      },
    },
    { $sort: { actionCount: -1 } },
  ]);
};

// Static method to cleanup old logs
userAuditLogSchema.statics.cleanupOldLogs = function(daysOld: number = 180) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
  });
};

export default mongoose.model<IUserAuditLog>('UserAuditLog', userAuditLogSchema);
