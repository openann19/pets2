import mongoose, { Schema, Document } from 'mongoose';
import { IAuditLog } from '../types';

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User Management
      'get_all_users', 'get_user_details', 'suspend_user', 'ban_user', 'activate_user', 'update_user_role', 'get_user_activity',
      // Pet Management
      'get_all_pets', 'get_pet_details', 'delete_pet', 'moderate_pet',
      // Match Management
      'get_all_matches', 'get_match_details', 'delete_match', 'moderate_match',
      // Message Management
      'get_all_messages', 'get_message_details', 'delete_message', 'moderate_message',
      // Analytics
      'get_analytics', 'export_analytics', 'get_user_analytics',
      // Moderation
      'get_moderation_queue', 'moderate_content', 'approve_content', 'reject_content',
      // Reports
      'get_all_reports', 'get_report_details', 'resolve_report', 'dismiss_report',
      // System
      'update_settings', 'get_system_status', 'backup_data', 'restore_data',
      // API Management
      'create_api_key', 'update_api_key', 'delete_api_key', 'get_api_keys',
      // Other
      'other'
    ],
    index: true,
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'pet', 'match', 'message', 'report', 'analytics', 'system', 'api_key', 'other'],
    index: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    index: true,
  },
  changes: {
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
  success: {
    type: Boolean,
    default: true,
    index: true,
  },
  errorMessage: {
    type: String,
    maxlength: 1000,
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
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ success: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1 });

// TTL index: keep logs for 1 year
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Virtual for time ago
auditLogSchema.virtual('timeAgo').get(function() {
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
auditLogSchema.virtual('isRecent').get(function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.timestamp > oneHourAgo;
});

// Static method to log action
auditLogSchema.statics.logAction = function(logData: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
  metadata?: any;
}) {
  return this.create({
    ...logData,
    timestamp: new Date(),
  });
};

// Static method to get audit trail
auditLogSchema.statics.getAuditTrail = function(userId?: string, limit: number = 100) {
  const query: any = {};
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get actions by resource
auditLogSchema.statics.getActionsByResource = function(resource: string, resourceId?: string, limit: number = 100) {
  const query: any = { resource };
  if (resourceId) {
    query.resourceId = resourceId;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get failed actions
auditLogSchema.statics.getFailedActions = function(limit: number = 100) {
  return this.find({ success: false })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get actions by IP
auditLogSchema.statics.getActionsByIP = function(ipAddress: string, limit: number = 100) {
  return this.find({ ipAddress })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get audit statistics
auditLogSchema.statics.getAuditStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successfulActions: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        failedActions: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueIPs: { $addToSet: '$ipAddress' },
        actionsByType: {
          $push: {
            action: '$action',
            count: 1,
          },
        },
        resourcesByType: {
          $push: {
            resource: '$resource',
            count: 1,
          },
        },
      },
    },
    {
      $project: {
        totalActions: 1,
        successfulActions: 1,
        failedActions: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        uniqueIPs: { $size: '$uniqueIPs' },
        successRate: {
          $divide: ['$successfulActions', '$totalActions']
        },
        actionsByType: 1,
        resourcesByType: 1,
      },
    },
  ]);
};

// Static method to get actions by user
auditLogSchema.statics.getActionsByUser = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$userId',
        actionCount: { $sum: 1 },
        lastAction: { $max: '$timestamp' },
        successfulActions: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        failedActions: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        uniqueIPs: { $addToSet: '$ipAddress' },
        actions: { $push: '$action' },
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
        successfulActions: 1,
        failedActions: 1,
        uniqueIPs: { $size: '$uniqueIPs' },
        successRate: {
          $divide: ['$successfulActions', '$actionCount']
        },
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
auditLogSchema.statics.getSuspiciousActivity = function(hours: number = 24) {
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
        failedActions: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        actions: { $push: '$action' },
        lastAction: { $max: '$timestamp' },
      },
    },
    {
      $match: {
        $or: [
          { actionCount: { $gte: 20 } }, // More than 20 actions
          { failedActions: { $gte: 5 } }, // More than 5 failed actions
        ],
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
        failedActions: 1,
        lastAction: 1,
        actions: 1,
        failureRate: {
          $divide: ['$failedActions', '$actionCount']
        },
      },
    },
    { $sort: { actionCount: -1 } },
  ]);
};

// Static method to cleanup old logs
auditLogSchema.statics.cleanupOldLogs = function(daysOld: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
  });
};

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
