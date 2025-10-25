/**
 * Admin Notifications Service for PawfectMatch
 * Real-time Socket.IO notifications for admin panel
 */

import { Server as SocketIOServer } from 'socket.io';
import logger from '../utils/logger';

interface AdminNotificationData {
  id: string;
  type: string;
  category?: string;
  reportedUserId?: string;
  reportedPetId?: string;
  reporterId?: string;
  reason?: string;
  status?: string;
  priority?: string;
  createdAt: Date;
}

interface ContentFlaggedData {
  contentType: string;
  contentId: string;
  userId: string;
  scores: any;
  violatedCategories: string[];
  provider: string;
}

interface UserActionData {
  action: string;
  targetUserId: string;
  adminId: string;
  reason: string;
}

class AdminNotificationsService {
  private io: SocketIOServer | null = null;

  /**
   * Initialize the Socket.IO instance
   */
  setSocketIO(socketIO: SocketIOServer): void {
    this.io = socketIO;
    logger.info('Admin notification service initialized with Socket.IO');
  }

  /**
   * Broadcast a new report notification to all admins
   */
  notifyNewReport(report: AdminNotificationData): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized, cannot send admin notification');
      return;
    }

    try {
      this.io.to('admin-notifications').emit('new-report', {
        id: report.id,
        type: report.type,
        category: report.category,
        reportedUserId: report.reportedUserId,
        reportedPetId: report.reportedPetId,
        reporterId: report.reporterId,
        reason: report.reason,
        status: report.status,
        priority: report.priority,
        createdAt: report.createdAt,
      });

      logger.info('Admin notification sent: new-report', { reportId: report.id });
    } catch (error) {
      logger.error('Failed to send admin notification', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Broadcast a content flagged notification to all admins
   */
  notifyContentFlagged(data: ContentFlaggedData): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized, cannot send admin notification');
      return;
    }

    try {
      this.io.to('admin-notifications').emit('content-flagged', {
        contentType: data.contentType,
        contentId: data.contentId,
        userId: data.userId,
        scores: data.scores,
        violatedCategories: data.violatedCategories,
        provider: data.provider,
        timestamp: new Date().toISOString(),
      });

      logger.info('Admin notification sent: content-flagged', { contentId: data.contentId });
    } catch (error) {
      logger.error('Failed to send admin notification', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Broadcast a user action notification to all admins
   */
  notifyUserAction(data: UserActionData): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized, cannot send admin notification');
      return;
    }

    try {
      this.io.to('admin-notifications').emit('user-action', {
        action: data.action,
        targetUserId: data.targetUserId,
        adminId: data.adminId,
        reason: data.reason,
        timestamp: new Date().toISOString(),
      });

      logger.info('Admin notification sent: user-action', { 
        action: data.action, 
        targetUserId: data.targetUserId 
      });
    } catch (error) {
      logger.error('Failed to send admin notification', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Set up Socket.IO admin room join/leave handlers
   */
  setupAdminRoom(socketIO: SocketIOServer): void {
    socketIO.on('connection', (socket) => {
      // Check if user is admin (you'll need to pass user data via socket.handshake.auth)
      const userId = socket.handshake.auth?.userId;
      const isAdmin = socket.handshake.auth?.isAdmin;

      if (isAdmin) {
        socket.join('admin-notifications');
        logger.info('Admin joined notification room', { userId, socketId: socket.id });

        socket.on('disconnect', () => {
          logger.info('Admin left notification room', { userId, socketId: socket.id });
        });
      }
    });
  }
}

export default new AdminNotificationsService();
