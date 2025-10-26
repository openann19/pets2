/**
 * Admin Chat Management Controller for PawfectMatch
 * Handles chat moderation operations for administrators
 */

import type { Request, Response } from 'express';
import Match from '../../models/Match';
import Conversation from '../../models/Conversation';
// @ts-ignore - AuditLog is a JS file without types
import AuditLog from '../../models/AuditLog';
const logger = require('../../utils/logger');

// Type definitions
interface AdminRequest extends Request {
  userId?: string;
}

interface GetAllChatsQuery {
  page?: string;
  limit?: string;
  status?: string;
  blocked?: string;
}

interface DeleteMessageBody {
  reason?: string;
}

interface BlockChatBody {
  reason?: string;
  duration?: number;
}

interface UnblockChatBody {
  reason?: string;
}

// ============= CHAT MODERATION =============

/**
 * @desc    Get all chats with pagination
 * @route   GET /api/admin/chats
 * @access  Admin
 */
export const getAllChats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.blocked) {
      filter.isBlocked = req.query.blocked === 'true';
    }

    const chats = await Match.find(filter)
      .populate('user1', 'firstName lastName email')
      .populate('user2', 'firstName lastName email')
      .populate('pet1', 'name species photos')
      .populate('pet2', 'name species photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Match.countDocuments(filter);

    // Get message counts for each chat from conversations
    const chatsWithMessageCounts = await Promise.all(
      chats.map(async (chat: any) => {
        // Find conversations between the two users
        const conversation = await Conversation.findOne({
          participants: { $all: [chat.user1._id, chat.user2._id] }
        });
        
        const messageCount = conversation ? conversation.messages.length : 0;
        return { ...chat, messageCount };
      })
    );

    res.json({
      success: true,
      data: {
        chats: chatsWithMessageCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    logger.error('Error getting all chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats',
      error: error.message
    });
  }
};

/**
 * @desc    Get specific chat details
 * @route   GET /api/admin/chats/:id
 * @access  Admin
 */
export const getChatDetails = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const chat = await Match.findById(req.params.id)
      .populate('user1', 'firstName lastName email')
      .populate('user2', 'firstName lastName email')
      .populate('pet1', 'name species photos')
      .populate('pet2', 'name species photos')
      .lean();

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
      return;
    }

    // Get conversation between users
    const chatData: any = chat;
    const conversation = await Conversation.findOne({
      participants: { $all: [chatData.user1._id, chatData.user2._id] }
    });

    const messages = conversation?.messages || [];

    res.json({
      success: true,
      data: {
        chat,
        messages: messages.slice(-50).reverse() // Get last 50 messages
      }
    });

  } catch (error: any) {
    logger.error('Error getting chat details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat details',
      error: error.message
    });
  }
};

/**
 * @desc    Delete specific message
 * @route   DELETE /api/admin/chats/:id/messages/:messageId
 * @access  Admin
 */
export const deleteMessage = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const chat = await Match.findById(req.params.id)
      .populate('user1', 'firstName lastName email')
      .populate('user2', 'firstName lastName email')
      .lean();

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
      return;
    }

    const chatData: any = chat;
    
    // Find the conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [chatData.user1._id, chatData.user2._id] }
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    // Find the specific message
    const messageIndex = conversation.messages.findIndex(
      (m: any) => String(m._id) === req.params.messageId
    );
    
    if (messageIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    const body: DeleteMessageBody = req.body;

    // Soft delete the message by marking it as deleted
    const message = conversation.messages[messageIndex];
    (message as any).isDeleted = true;
    (message as any).deletedAt = new Date();
    (message as any).deletedBy = req.userId;
    (message as any).deletionReason = body.reason;

    await conversation.save();

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'delete_message',
      resourceType: 'message',
      resourceId: req.params.messageId,
      details: {
        chatId: req.params.id,
        reason: body.reason,
        senderId: (message as any).sender
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Message ${req.params.messageId} deleted by admin ${req.userId}`, {
      reason: body.reason,
      chatId: req.params.id
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error: any) {
    logger.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

/**
 * @desc    Block chat between users
 * @route   PUT /api/admin/chats/:id/block
 * @access  Admin
 */
export const blockChat = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const chat = await Match.findById(req.params.id);

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
      return;
    }

    const body: BlockChatBody = req.body;
    const blockData: any = {
      isBlocked: true,
      blockedAt: new Date(),
      blockedBy: req.userId,
      blockReason: body.reason,
      blockDuration: body.duration || null
    };

    // Set block end date if duration provided
    if (body.duration) {
      blockData.blockEndsAt = new Date(Date.now() + (body.duration * 24 * 60 * 60 * 1000));
    }

    await Match.findByIdAndUpdate(req.params.id, blockData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'block_chat',
      resourceType: 'chat',
      resourceId: req.params.id,
      details: {
        reason: body.reason,
        duration: body.duration,
        user1Id: chat.user1,
        user2Id: chat.user2
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Chat ${req.params.id} blocked by admin ${req.userId}`, blockData);

    res.json({
      success: true,
      message: 'Chat blocked successfully',
      data: blockData
    });

  } catch (error: any) {
    logger.error('Error blocking chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block chat',
      error: error.message
    });
  }
};

/**
 * @desc    Unblock chat
 * @route   PUT /api/admin/chats/:id/unblock
 * @access  Admin
 */
export const unblockChat = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const chat = await Match.findById(req.params.id);

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
      return;
    }

    const body: UnblockChatBody = req.body;
    const unblockData: any = {
      isBlocked: false,
      unblockedAt: new Date(),
      unblockedBy: req.userId,
      unblockReason: body.reason,
      blockReason: null,
      blockEndsAt: null
    };

    await Match.findByIdAndUpdate(req.params.id, unblockData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'unblock_chat',
      resourceType: 'chat',
      resourceId: req.params.id,
      details: {
        reason: body.reason,
        user1Id: chat.user1,
        user2Id: chat.user2
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Chat ${req.params.id} unblocked by admin ${req.userId}`, unblockData);

    res.json({
      success: true,
      message: 'Chat unblocked successfully',
      data: unblockData
    });

  } catch (error: any) {
    logger.error('Error unblocking chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock chat',
      error: error.message
    });
  }
};

/**
 * @desc    Get chat analytics
 * @route   GET /api/admin/chats/analytics
 * @access  Admin
 */
export const getChatAnalytics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const totalChats = await Match.countDocuments();
    const activeChats = await Match.countDocuments({ status: 'active' });
    const blockedChats = await Match.countDocuments({ isBlocked: true });
    
    // Get message counts from conversations
    const totalMessages = await Conversation.aggregate([
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);

    const totalMsgCount = totalMessages[0]?.total || 0;

    const deletedMessages = await Conversation.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.isDeleted': true } },
      { $count: 'deleted' }
    ]);

    const deletedMsgCount = deletedMessages[0]?.deleted || 0;

    // Recent activity
    const recentChats = await Match.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const recentMessages = await Conversation.aggregate([
      {
        $unwind: '$messages'
      },
      {
        $match: {
          'messages.sentAt': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $count: 'messages'
      }
    ]);

    const recentMsgCount = recentMessages[0]?.messages || 0;

    res.json({
      success: true,
      data: {
        totalChats,
        activeChats,
        blockedChats,
        totalMessages: totalMsgCount,
        deletedMessages: deletedMsgCount,
        recentActivity: {
          chats24h: recentChats,
          messages24h: recentMsgCount
        }
      }
    });

  } catch (error: any) {
    logger.error('Error getting chat analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat analytics',
      error: error.message
    });
  }
};

// Export all functions
export default {
  getAllChats,
  getChatDetails,
  deleteMessage,
  blockChat,
  unblockChat,
  getChatAnalytics
};

