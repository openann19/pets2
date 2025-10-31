/**
 * Admin Chat Moderation Controller
 * Handles chat message moderation and review
 */

import type { Request, Response } from 'express';
import Match from '../../models/Match';
import User from '../../models/User';
import FlaggedMessage from '../../models/FlaggedMessage';
import logger from '../../utils/logger';
import { logAdminActivity } from '../../middleware/adminLogger';
import { getErrorMessage } from '../../utils/errorHandler';

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

    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query to find messages
    const query: Record<string, unknown> = { status: 'active' };
    
    // Filter based on review status if needed
    if (filter === 'flagged') {
      // This would require additional field in the Match model for flags
      // For now, return all messages
    }

    // Get matches with messages
    const matches = await Match.find(query)
      .populate('pet1')
      .populate('pet2')
      .populate('user1', 'firstName lastName')
      .populate('user2', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Extract messages from all matches
    interface ChatMessage {
      _id: { toString: () => string } | string;
      sender?: { toString: () => string } | string;
      content?: string;
      sentAt?: Date;
      createdAt?: Date;
      isDeleted?: boolean;
      reviewed?: boolean;
      reviewedBy?: string;
      reviewedAt?: Date;
      metadata?: {
        moderationAction?: string;
        moderationTimestamp?: Date;
      };
    }
    
    interface MatchWithUsers {
      _id: { toString: () => string } | string;
      user1?: { firstName?: string; lastName?: string };
      user2?: { firstName?: string; lastName?: string };
      messages?: ChatMessage[];
    }
    
    // Get all flagged messages for the matches we're looking at
    const matchIds = matches.map(m => m._id.toString());
    const flaggedMessages = await FlaggedMessage.find({
      chatId: { $in: matchIds },
      flagged: true
    }).lean();

    // Create a map of messageId -> flagged message data for quick lookup
    const flaggedMap = new Map<string, typeof flaggedMessages[0]>();
    flaggedMessages.forEach((flagged) => {
      flaggedMap.set(flagged.messageId, flagged);
    });
    
    const messages: Array<{
      id: string;
      chatId: string;
      senderId: string;
      senderName: string;
      receiverName: string;
      message: string;
      timestamp?: Date;
      flagged: boolean;
      flagReason?: string;
      reviewed: boolean;
      reviewedBy?: string;
      reviewedAt?: Date;
      action?: string;
    }> = [];
    
    for (const match of matches) {
      const matchWithUsers = match as unknown as MatchWithUsers;
      if (matchWithUsers.messages && matchWithUsers.messages.length > 0) {
        for (const msg of matchWithUsers.messages) {
          // Skip deleted messages
          if (msg.isDeleted) continue;

          const messageId = msg._id.toString();
          const chatId = match._id.toString();

          // Check if message is flagged
          const flaggedRecord = flaggedMap.get(messageId);
          const isFlagged = flaggedRecord?.flagged || false;
          const flagReason = flaggedRecord?.flagReason;
          const reviewed = flaggedRecord?.reviewed || msg.reviewed || false;
          const reviewedBy = flaggedRecord?.reviewedBy || msg.reviewedBy;
          const reviewedAt = flaggedRecord?.reviewedAt || msg.reviewedAt;
          const action = flaggedRecord?.moderationAction || msg.metadata?.moderationAction;

          // Get sender and receiver info
          let senderName = 'Unknown';
          let receiverName = 'Unknown';
          
          if (matchWithUsers.user1) {
            senderName = `${matchWithUsers.user1.firstName || ''} ${matchWithUsers.user1.lastName || ''}`.trim() || 'Unknown';
          }
          if (matchWithUsers.user2) {
            receiverName = `${matchWithUsers.user2.firstName || ''} ${matchWithUsers.user2.lastName || ''}`.trim() || 'Unknown';
          }

          const messageData = {
            id: messageId,
            chatId,
            senderId: msg.sender?.toString() || '',
            senderName,
            receiverName,
            message: msg.content || '',
            timestamp: msg.sentAt || msg.createdAt,
            flagged: isFlagged,
            flagReason,
            reviewed,
            reviewedBy,
            reviewedAt,
            action,
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
  } catch (error: unknown) {
    logger.error('Failed to get chat messages', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get chat messages',
      message: getErrorMessage(error),
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
    if (!match) {
      res.status(404).json({
        success: false,
        error: 'Message not found',
      });
      return;
    }
    
    interface MessageWithModeration extends ChatMessage {
      reviewed?: boolean;
      reviewedBy?: string;
      reviewedAt?: Date;
      metadata?: {
        moderationAction?: string;
        moderationTimestamp?: Date;
        [key: string]: unknown;
      };
    }
    
    const message = match.messages?.find((msg) => {
      const msgId = typeof msg._id === 'string' ? msg._id : msg._id?.toString();
      return msgId === messageId;
    }) as MessageWithModeration | undefined;

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
      message.isDeleted = false;
    } else if (action === 'remove') {
      updatedAction = 'removed';
      message.isDeleted = true;
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
  } catch (error: unknown) {
    logger.error('Failed to moderate message', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to moderate message',
      message: getErrorMessage(error),
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
      const matchWithMessages = match as unknown as MatchWithUsers;
      if (matchWithMessages.messages && matchWithMessages.messages.length > 0) {
        for (const msg of matchWithMessages.messages) {
          totalMessages++;
          
          if ((msg as ChatMessage & { flagged?: boolean }).flagged) flaggedMessages++;
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
  } catch (error: unknown) {
    logger.error('Failed to get chat moderation stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get chat moderation stats',
      message: getErrorMessage(error),
    });
  }
};

