export {};// Added to mark file as a module
const Match = require('../models/Match');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// ============= CHAT MODERATION =============

// @desc    Get all chats with pagination
// @route   GET /api/admin/chats
// @access  Admin
const getAllChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

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

    // Get message counts for each chat
    const chatsWithMessageCounts = await Promise.all(
      chats.map(async (chat) => {
        const messageCount = await Message.countDocuments({ matchId: chat._id });
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

  } catch (error) {
    logger.error('Error getting all chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats',
      error: error.message
    });
  }
};

// @desc    Get specific chat details
// @route   GET /api/admin/chats/:id
// @access  Admin
const getChatDetails = async (req, res) => {
  try {
    const chat = await Match.findById(req.params.id)
      .populate('user1', 'firstName lastName email')
      .populate('user2', 'firstName lastName email')
      .populate('pet1', 'name species photos')
      .populate('pet2', 'name species photos')
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Get recent messages
    const messages = await Message.find({ matchId: req.params.id })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: {
        chat,
        messages: messages.reverse()
      }
    });

  } catch (error) {
    logger.error('Error getting chat details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat details',
      error: error.message
    });
  }
};

// @desc    Delete specific message
// @route   DELETE /api/admin/chats/:id/messages/:messageId
// @access  Admin
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.matchId.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Message does not belong to this chat'
      });
    }

    // Soft delete the message
    await Message.findByIdAndUpdate(req.params.messageId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.userId,
      deletionReason: req.body.reason
    });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'delete_message',
      resourceType: 'message',
      resourceId: req.params.messageId,
      details: {
        chatId: req.params.id,
        reason: req.body.reason,
        senderId: message.sender
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Message ${req.params.messageId} deleted by admin ${req.userId}`, {
      reason: req.body.reason,
      chatId: req.params.id
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// @desc    Block chat between users
// @route   PUT /api/admin/chats/:id/block
// @access  Admin
const blockChat = async (req, res) => {
  try {
    const chat = await Match.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const blockData = {
      isBlocked: true,
      blockedAt: new Date(),
      blockedBy: req.userId,
      blockReason: req.body.reason,
      blockDuration: req.body.duration || null
    };

    // Set block end date if duration provided
    if (req.body.duration) {
      blockData.blockEndsAt = new Date(Date.now() + (req.body.duration * 24 * 60 * 60 * 1000));
    }

    await Match.findByIdAndUpdate(req.params.id, blockData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'block_chat',
      resourceType: 'chat',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        duration: req.body.duration,
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

  } catch (error) {
    logger.error('Error blocking chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block chat',
      error: error.message
    });
  }
};

// @desc    Unblock chat
// @route   PUT /api/admin/chats/:id/unblock
// @access  Admin
const unblockChat = async (req, res) => {
  try {
    const chat = await Match.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const unblockData = {
      isBlocked: false,
      unblockedAt: new Date(),
      unblockedBy: req.userId,
      unblockReason: req.body.reason,
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
        reason: req.body.reason,
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

  } catch (error) {
    logger.error('Error unblocking chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock chat',
      error: error.message
    });
  }
};

// @desc    Get chat analytics
// @route   GET /api/admin/chats/analytics
// @access  Admin
const getChatAnalytics = async (req, res) => {
  try {
    const totalChats = await Match.countDocuments();
    const activeChats = await Match.countDocuments({ status: 'active' });
    const blockedChats = await Match.countDocuments({ isBlocked: true });
    const totalMessages = await Message.countDocuments();
    const deletedMessages = await Message.countDocuments({ isDeleted: true });

    // Recent activity
    const recentChats = await Match.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const recentMessages = await Message.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        totalChats,
        activeChats,
        blockedChats,
        totalMessages,
        deletedMessages,
        recentActivity: {
          chats24h: recentChats,
          messages24h: recentMessages
        }
      }
    });

  } catch (error) {
    logger.error('Error getting chat analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat analytics',
      error: error.message
    });
  }
};

module.exports = {
  getAllChats,
  getChatDetails,
  deleteMessage,
  blockChat,
  unblockChat,
  getChatAnalytics
};
