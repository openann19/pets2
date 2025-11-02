/**
 * Notification Service for PawfectMatch
 * Handles push notifications, email notifications, and in-app notifications
 */

import User from '../models/User';
import Notification from '../models/Notification';
import logger from '../utils/logger';

class NotificationService {
  /**
   * Send push notification
   */
  async sendPushNotification(userId: string, title: string, body: string, data: any = {}): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found for push notification', { userId });
        return;
      }

      // Mock push notification sending
      logger.info('Push notification sent', { 
        userId, 
        title, 
        body, 
        data 
      });

      // Store notification in database
      await this.storeNotification(userId, 'push', title, body, data);
    } catch (error) {
      logger.error('Error sending push notification', { error, userId, title });
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(userId: string, subject: string, content: string, data: any = {}): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found for email notification', { userId });
        return;
      }

      // Mock email sending
      logger.info('Email notification sent', { 
        userId, 
        email: user.email, 
        subject, 
        data 
      });

      // Store notification in database
      await this.storeNotification(userId, 'email', subject, content, data);
    } catch (error) {
      logger.error('Error sending email notification', { error, userId, subject });
    }
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(userId: string, title: string, message: string, data: any = {}): Promise<void> {
    try {
      // Store notification in database
      await this.storeNotification(userId, 'in_app', title, message, data);
      
      logger.info('In-app notification sent', { 
        userId, 
        title, 
        message, 
        data 
      });
    } catch (error) {
      logger.error('Error sending in-app notification', { error, userId, title });
    }
  }

  /**
   * Store notification in database
   */
  private async storeNotification(userId: string, type: string, title: string, content: string, data: any): Promise<void> {
    try {
      const notification = new Notification({
        user: userId,
        type,
        title,
        content,
        data,
        isRead: false,
        createdAt: new Date()
      });

      await notification.save();
    } catch (error) {
      logger.error('Error storing notification', { error, userId, type });
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return notifications;
    } catch (error) {
      logger.error('Error getting user notifications', { error, userId });
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true, readAt: new Date() }
      );
      
      logger.debug('Notification marked as read', { notificationId, userId });
    } catch (error) {
      logger.error('Error marking notification as read', { error, notificationId, userId });
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      
      logger.info('All notifications marked as read', { userId });
    } catch (error) {
      logger.error('Error marking all notifications as read', { error, userId });
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await Notification.countDocuments({ 
        user: userId, 
        isRead: false 
      });
      
      return count;
    } catch (error) {
      logger.error('Error getting unread count', { error, userId });
      return 0;
    }
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      logger.info('Old notifications deleted', { 
        deletedCount: result.deletedCount, 
        daysToKeep 
      });
    } catch (error) {
      logger.error('Error deleting old notifications', { error, daysToKeep });
    }
  }
}

export default new NotificationService();
