import mongoose, { Schema, Document } from 'mongoose';
import { IAdminActivityLog } from '../types';

// This model logs all admin activities for audit and compliance purposes
const adminActivityLogSchema = new Schema<IAdminActivityLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      // Action types should follow a consistent naming pattern: VERB_RESOURCE_ACTION
      // e.g., UPDATE_STRIPE_CONFIG, DELETE_USER, CREATE_PROMOTION, etc.
    },
    targetType: {
      type: String,
      enum: ['user', 'pet', 'match', 'payment', 'config', 'moderation', 'analytics']
    },
    targetId: {
      type: Schema.Types.ObjectId
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    }
  },
  {
    timestamps: true,
    collection: 'admin_activity_logs',
  }
);

// Create compound index for efficient querying
adminActivityLogSchema.index({ adminId: 1, action: 1, timestamp: -1 });
adminActivityLogSchema.index({ targetType: 1, targetId: 1 });
adminActivityLogSchema.index({ success: 1, timestamp: -1 });
adminActivityLogSchema.index({ timestamp: -1 });

// Static method to log admin activity
adminActivityLogSchema.statics.logActivity = function(activityData: {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}) {
  return this.create({
    ...activityData,
    timestamp: new Date()
  });
};

// Static method to get admin activities
adminActivityLogSchema.statics.getAdminActivities = function(adminId?: string, limit: number = 100) {
  const query: any = {};
  if (adminId) {
    query.adminId = adminId;
  }
  
  return this.find(query)
    .populate('adminId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get activities by target
adminActivityLogSchema.statics.getActivitiesByTarget = function(targetType: string, targetId: string) {
  return this.find({ targetType, targetId })
    .populate('adminId', 'firstName lastName email')
    .sort({ timestamp: -1 });
};

// Static method to get audit trail
adminActivityLogSchema.statics.getAuditTrail = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }

  return this.find(matchStage)
    .populate('adminId', 'firstName lastName email')
    .sort({ timestamp: -1 });
};

export default mongoose.model<IAdminActivityLog>('AdminActivityLog', adminActivityLogSchema);
