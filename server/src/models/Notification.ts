/**
 * Notification Model
 * Stores notification history for users
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { INotification } from '../types';

interface INotificationDocument extends INotification, Document {
  markAsRead(): Promise<void>;
}

interface INotificationModel extends Model<INotificationDocument> {
  getUnreadCount(userId: mongoose.Types.ObjectId): Promise<number>;
  markAllAsRead(userId: mongoose.Types.ObjectId): Promise<any>;
}

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
    enum: ['match', 'message', 'like', 'super_like', 'reminder', 'system', 'test'],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  read: {
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
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function(this: INotificationDocument): Promise<void> {
  this.read = true;
  this.readAt = new Date();
  await this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId: mongoose.Types.ObjectId): Promise<number> {
  return await this.countDocuments({ userId, read: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId: mongoose.Types.ObjectId): Promise<any> {
  return await this.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
};

export default mongoose.model<INotificationDocument, INotificationModel>('Notification', notificationSchema);
