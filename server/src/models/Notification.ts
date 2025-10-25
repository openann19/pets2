import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '../types';

/**
 * Notification Model
 * Stores notification history for users
 */

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['match', 'message', 'like', 'system', 'premium'],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  actionUrl: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  sentAt: {
    type: Date
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
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

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark as sent
notificationSchema.methods.markAsSent = function() {
  this.sentAt = new Date();
  this.deliveryStatus = 'sent';
  return this.save();
};

// Instance method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.deliveryStatus = 'delivered';
  return this.save();
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = function() {
  this.deliveryStatus = 'failed';
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(notificationData: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  priority?: string;
  scheduledFor?: Date;
}) {
  return this.create({
    ...notificationData,
    createdAt: new Date()
  });
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId: string, limit: number = 50, unreadOnly: boolean = false) {
  const query: any = { userId };
  if (unreadOnly) {
    query.isRead = false;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to get notifications by type
notificationSchema.statics.getNotificationsByType = function(userId: string, type: string, limit: number = 20) {
  return this.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to cleanup old notifications
notificationSchema.statics.cleanupOldNotifications = function(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Static method to get notification stats
notificationSchema.statics.getNotificationStats = function(userId?: string) {
  const matchStage: any = {};
  if (userId) {
    matchStage.userId = userId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: ['$isRead', 0, 1] }
        },
        sent: {
          $sum: { $cond: [{ $eq: ['$deliveryStatus', 'sent'] }, 1, 0] }
        },
        delivered: {
          $sum: { $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$deliveryStatus', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);
};

export default mongoose.model<INotification>('Notification', notificationSchema);
