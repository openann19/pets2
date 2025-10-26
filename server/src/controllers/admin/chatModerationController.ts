/**
 * Admin Chat Moderation Controller
 * Handles chat message moderation and review
 */

import { Request, Response } from 'express';
import Match from '../../models/Match';
import User from '../../models/User';
import logger from '../../utils/logger';
import { logAdminActivity } from '../../middleware/adminLogger';

interface AdminRequest extends Request {
  userId?: string;
}

/**
 * GET /api/admin/chats/messages
 * Get messages for moderation review
 */
export const getChatMessages = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { filter = 'all', search = '', page = 1, limit = 50 } = req.query as {
      filter?: 'all' | 'flagged' | 'unreviewed';
      search?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query to find messages
    const query: any = { status: 'active' };
    
    // Filter based on review status if needed
    if (filter === 'flagged') {
      // This would require additional field in the Match model for flags
      // For now, return all messages
    }

    // Get matches with messages
    const matches = await Match.find(query)
      .populate('pet1')
      .populate('pet2')
      .sort({ updatedAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Extract messages from all matches
    const messages: any[] = [];
    
    for (const match of matches) {
      if (match.messages && match.messages.length > 0) {
        for (const msg of match.messages as any[]) {
          // Skip deleted messages
          if (msg.isDeleted) continue;

          // Get sender and receiver info
          let senderName = 'Unknown';
          let receiverName = 'Unknown';
          
          if (match.user1) {
            senderName = `${match.user1.firstName} ${match.user1.lastName}`;
          }
          if (match.user2) {
            receiverName = `${match.user2.firstName} ${match.user2.lastName}`;
          }

          const messageData = {
            id: msg._id.toString(),
            chatId: match._id.toString(),
            senderId: msg.sender?.toString() || '',
            senderName,
            receiverName,
            message: msg.content,
            timestamp: msg.sentAt || msg.createdAt,
            flagged: false, // TODO: Implement actual flagging system
            flagReason: undefined,
            reviewed: false,
            reviewedBy: undefined,
            reviewedAt: undefined,
            action: undefined,
          };

          // Apply search filter
          if (search && !messageData.message.toLowerCase().includes(search.toLowerCase())) {
            continue;
          }

          // Apply filter
          if (filter === 'flagged' && !messageData.flagged) {
            continue;
          }
          if (filter === 'unreviewed' && messageData.reviewed) {
            continue;
          }

          messages.push(messageData);
        }
      }
    }

    // Sort by timestamp
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    await logAdminActivity(req, 'VIEW_CHAT_MESSAGES', { filter, count: messages.length });

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: messages.length,
        pages: Math.ceil(messages.length / limitNum),
      },
    });
  } catch (error: any) {
    logger.error('Failed to get chat messages', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get chat messages',
      message: error.message,
    });
  }
};

/**
 * POST /api/admin/chats/messages/:messageId/moderate
 * Moderate a specific message
 */
export const moderateMessage = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { action } = req.body as { action: 'approve' | 'remove' | 'warn' };

    if (!['approve', 'remove', 'warn'].includes(action)) {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Must be approve, remove, or warn',
      });
      return;
    }

    // Find the message across all matches
    const matches = await Match.find({ 'messages._id': messageId });
    
    if (!matches || matches.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Message not found',
      });
      return;
    }

    const match = matches[0];
    const message = match.messages?.find((msg: any) => msg._id.toString() === messageId);

    if (!message) {
      res.status(404).json({
        success: false,
        error: 'Message not found',
      });
      return;
    }

    // Apply moderation action
    let updatedAction: 'approved' | 'removed' | 'warned';
    
    if (action === 'approve') {
      updatedAction = 'approved';
      // Mark as reviewed, no deletion
      if ('isDeleted' in message) {
        message.isDeleted = false;
      }
    } else if (action === 'remove') {
      updatedAction = 'removed';
      if ('isDeleted' in message) {
        message.isDeleted = true;
      }
    } else {
      updatedAction = 'warned';
    }

    // Mark as reviewed
    message.reviewed = true;
    message.reviewedBy = req.userId;
    message.reviewedAt = new Date();
    
    // Add moderation metadata
    if (!message.metadata) {
      message.metadata = {};
    }
    message.metadata.moderationAction = updatedAction;
    message.metadata.moderationTimestamp = new Date();

    await match.save();

    await logAdminActivity(req, 'MODERATE_CHAT_MESSAGE', { messageId, action });

    res.json({
      success: true,
      message: `Message ${action}d successfully`,
      data: {
        messageId,
        action: updatedAction,
        moderatedAt: new Date().toISOString(),
        moderatedBy: req.userId,
      },
    });
  } catch (error: any) {
    logger.error('Failed to moderate message', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to moderate message',
      message: error.message,
    });
  }
};

/**
 * GET /api/admin/chats/stats
 * Get chat moderation statistics
 */
export const getChatModerationStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query as { period?: string };

    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get all active matches
    const matches = await Match.find({ 
      status: 'active',
      updatedAt: { $gte: startDate }
    });

    let totalMessages = 0;
    let flaggedMessages = 0;
    let reviewedMessages = 0;
    let approvedMessages = 0;
    let removedMessages = 0;
    let warnedMessages = 0;

    for (const match of matches) {
      if (match.messages && match.messages.length > 0) {
        for (const msg of match.messages as any[]) {
          totalMessages++;
          
          if (msg.flagged) flaggedMessages++;
          if (msg.reviewed) {
            reviewedMessages++;
            if (msg.metadata?.moderationAction === 'approved') approvedMessages++;
            if (msg.metadata?.moderationAction === 'removed') removedMessages++;
            if (msg.metadata?.moderationAction === 'warned') warnedMessages++;
          }
        }
      }
    }

    const stats = {
      period,
      totalMessages,
      flaggedMessages,
      reviewedMessages,
      pendingReview: totalMessages - reviewedMessages,
      approved: approvedMessages,
      removed: removedMessages,
      warned: warnedMessages,
      reviewRate: totalMessages > 0 ? (reviewedMessages / totalMessages) * 100 : 0,
      timestamp: new Date().toISOString(),
    };

    await logAdminActivity(req, 'VIEW_CHAT_MODERATION_STATS');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Failed to get chat moderation stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get chat moderation stats',
      message: error.message,
    });
  }
};

