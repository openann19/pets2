/**
 * Admin Notification Service for PawfectMatch
 * Broadcasts moderation events to all connected admin users via Socket.IO
 */

import type { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../utils/logger';

// Type definitions
interface ReportData {
  _id: string;
  type: string;
  category: string;
  reportedUserId: string;
  reportedPetId?: string;
  reporterId: string;
  reason: string;
  status: string;
  priority: string;
  createdAt: Date;
}

interface ContentFlaggedData {
  contentType: 'text' | 'image';
  contentId: string;
  userId: string;
  scores: Record<string, number>;
  violatedCategories: string[];
  provider: string;
}

interface UserActionData {
  action: 'block' | 'ban' | 'suspend';
  targetUserId: string;
  adminId: string;
  reason: string;
}

interface CustomNotificationData {
  [key: string]: unknown;
  timestamp?: string;
}

interface SystemEventDetails {
  [key: string]: unknown;
}

class AdminNotificationService {
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
  notifyNewReport(report: ReportData): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized, cannot send admin notification');
      return;
    }

    try {
      this.io.to('admin-notifications').emit('new-report', {
        id: report._id,
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

      logger.info('Admin notification sent: new-report', { reportId: report._id });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send admin notification', { error: errorMessage });
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send admin notification', { error: errorMessage });
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send admin notification', { error: errorMessage });
    }
  }

  /**
   * Set up Socket.IO admin room join/leave handlers
   * Call this from the main socket initialization
   */
  setupAdminRoom(socketIO: SocketIOServer): void {
    this.io = socketIO;

    socketIO.on('connection', (socket: Socket) => {
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

  /**
   * Send custom notification to admin room
   */
  sendCustomNotification(type: string, data: CustomNotificationData): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized, cannot send custom notification');
      return;
    }

    try {
      this.io.to('admin-notifications').emit(type, {
        ...data,
        timestamp: new Date().toISOString(),
      });

      logger.info('Custom admin notification sent', { type });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send custom notification', { type, error: errorMessage });
    }
  }

  /**
   * Notify admins of system event
   */
  notifySystemEvent(event: string, details: SystemEventDetails): void {
    this.sendCustomNotification('system-event', {
      event,
      details
    });
  }
}

// Export singleton instance
export default new AdminNotificationService();
