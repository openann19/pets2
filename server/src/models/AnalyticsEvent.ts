import mongoose, { Schema, Document } from 'mongoose';
import { IAnalyticsEvent } from '../types';

const analyticsEventSchema = new Schema<IAnalyticsEvent>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    index: true 
  },
  eventType: { 
    type: String, 
    required: true, 
    index: true 
  },
  entityType: { 
    type: String 
  },
  entityId: { 
    type: Schema.Types.ObjectId 
  },
  durationMs: { 
    type: Number 
  },
  success: { 
    type: Boolean, 
    default: true 
  },
  errorCode: { 
    type: String 
  },
  metadata: { 
    type: Schema.Types.Mixed 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
}, {
  timestamps: false,
});

// Indexes
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, createdAt: -1 });
analyticsEventSchema.index({ entityType: 1, entityId: 1 });
analyticsEventSchema.index({ success: 1, createdAt: -1 });

// Static method to track event
analyticsEventSchema.statics.trackEvent = function(eventData: {
  userId?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  durationMs?: number;
  success?: boolean;
  errorCode?: string;
  metadata?: any;
}) {
  return this.create({
    ...eventData,
    createdAt: new Date()
  });
};

// Static method to get events by user
analyticsEventSchema.statics.getUserEvents = function(userId: string, limit: number = 100) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get events by type
analyticsEventSchema.statics.getEventsByType = function(eventType: string, limit: number = 100) {
  return this.find({ eventType })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get analytics summary
analyticsEventSchema.statics.getAnalyticsSummary = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        avgDuration: {
          $avg: '$durationMs'
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export default mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
