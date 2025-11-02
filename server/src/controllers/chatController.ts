const Match = require('../models/Match');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get chat history for a match with pagination
// @route   GET /api/chat/:matchId/messages?page=1&limit=20
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found or access denied'
      });
    }

    // Get total message count
    const totalMessages = match.messages.length;

    // Get paginated messages with sender population (reverse order for latest first)
    const messages = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    })
    .populate({
      path: 'messages.sender',
      select: 'firstName lastName avatar'
    })
    .populate({
      path: 'messages.reactions.user',
      select: 'firstName lastName avatar'
    })
    .populate({
      path: 'messages.replyTo',
      select: 'sender content messageType'
    })
    .then(doc => {
      if (!doc) return [];
      // Sort messages by timestamp and slice for pagination
      const sortedMessages = doc.messages.sort((a, b) => b.sentAt - a.sentAt);
      return sortedMessages.slice(skip, skip + limit);
    });

    const totalPages = Math.ceil(totalMessages / limit);
    const hasMore = page < totalPages;

    // Get unread count for this user
    const unreadCount = match.messages.filter(msg =>
      !msg.readBy.some(read => read.user.toString() === req.userId)
    ).length;

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          totalMessages,
          totalPages,
          hasMore
        },
        unreadCount,
        matchStatus: match.status,
        isArchived: match.isArchivedBy(req.userId),
        isBlocked: match.isUserBlocked(req.userId)
      }
    });

  } catch (error) {
    logger.error('Get messages error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

// @desc    Send a message in a match
// @route   POST /api/chat/:matchId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const {
      content,
      messageType = 'text',
      attachments = [],
      replyTo = null
    } = req.body;

    if (!content && !attachments.length) {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachments are required'
      });
    }

    if (content && content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot exceed 1000 characters'
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found or access denied'
      });
    }

    if (match.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send messages to inactive match'
      });
    }

    if (match.isUserBlocked(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send messages to blocked match'
      });
    }

    // Validate replyTo if provided
    if (replyTo) {
      const replyMessage = match.messages.id(replyTo);
      if (!replyMessage) {
        return res.status(400).json({
          success: false,
          message: 'Reply message not found'
        });
      }
    }

    // Add message using model's method
    const updatedMatch = await match.addMessage(
      req.userId,
      content,
      messageType,
      attachments,
      replyTo
    );

    // Get the newly added message with populated data
    const newMessage = updatedMatch.messages[updatedMatch.messages.length - 1];
    await newMessage.populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'reactions.user', select: 'firstName lastName avatar' },
      {
        path: 'replyTo',
        select: 'sender content messageType',
        populate: { path: 'sender', select: 'firstName lastName avatar' }
      }
    ]);

    // Update analytics
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'analytics.totalMessagesSent': 1 },
      'analytics.lastActive': new Date()
    });

    res.status(201).json({
      success: true,
      data: { message: newMessage }
    });

  } catch (error) {
    logger.error('Send message error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// @desc    Edit a message
// @route   PUT /api/chat/messages/:messageId
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot exceed 1000 characters'
      });
    }

    // Find match containing this message
    const match = await Match.findOne({
      'messages._id': messageId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = match.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only allow editing own messages
    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit other user\'s messages'
      });
    }

    // Only allow editing text messages
    if (message.messageType !== 'text') {
      return res.status(400).json({
        success: false,
        message: 'Only text messages can be edited'
      });
    }

    // Check edit time limit (5 minutes)
    const timeDiff = Date.now() - message.sentAt.getTime();
    if (timeDiff > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'Messages can only be edited within 5 minutes'
      });
    }

    // Update message
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await match.save();

    // Populate updated message
    await message.populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'reactions.user', select: 'firstName lastName avatar' }
    ]);

    res.json({
      success: true,
      data: { message }
    });

  } catch (error) {
    logger.error('Edit message error', { error, userId: req.userId, messageId: req.params.messageId });
    res.status(500).json({
      success: false,
      message: 'Failed to edit message'
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find match containing this message
    const match = await Match.findOne({
      'messages._id': messageId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = match.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only allow deleting own messages
    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete other user\'s messages'
      });
    }

    // Check delete time limit (1 hour)
    const timeDiff = Date.now() - message.sentAt.getTime();
    if (timeDiff > 60 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'Messages can only be deleted within 1 hour'
      });
    }

    // Mark as deleted instead of removing
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';

    await match.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    logger.error('Delete message error', { error, userId: req.userId, messageId: req.params.messageId });
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/chat/messages/:messageId/reactions
// @access  Private
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Reaction emoji is required'
      });
    }

    // Find match containing this message
    const match = await Match.findOne({
      'messages._id': messageId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = match.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(r =>
      r.user.toString() === req.userId && r.emoji === emoji
    );

    if (existingReaction) {
      return res.status(400).json({
        success: false,
        message: 'Already reacted with this emoji'
      });
    }

    // Add reaction
    message.reactions.push({
      user: req.userId,
      emoji,
      reactedAt: new Date()
    });

    await match.save();

    // Populate reaction user
    const newReaction = message.reactions[message.reactions.length - 1];
    await newReaction.populate('user', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: { reaction: newReaction }
    });

  } catch (error) {
    logger.error('Add reaction error', { error, userId: req.userId, messageId: req.params.messageId });
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction'
    });
  }
};

// @desc    Remove reaction from message
// @route   DELETE /api/chat/messages/:messageId/reactions/:emoji
// @access  Private
const removeReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.params;

    // Find match containing this message
    const match = await Match.findOne({
      'messages._id': messageId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = match.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Find and remove reaction
    const reactionIndex = message.reactions.findIndex(r =>
      r.user.toString() === req.userId && r.emoji === emoji
    );

    if (reactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found'
      });
    }

    message.reactions.splice(reactionIndex, 1);
    await match.save();

    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });

  } catch (error) {
    logger.error('Remove reaction error', { error, userId: req.userId, messageId: req.params.messageId });
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction'
    });
  }
};

// @desc    Search messages in a match
// @route   GET /api/chat/:matchId/search?q=query&page=1&limit=20
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found or access denied'
      });
    }

    // Search messages (case-insensitive)
    const searchRegex = new RegExp(query.trim(), 'i');
    const matchingMessages = match.messages
      .filter(msg => !msg.isDeleted && searchRegex.test(msg.content))
      .sort((a, b) => b.sentAt - a.sentAt)
      .slice((page - 1) * limit, page * limit);

    // Populate sender info
    const populatedMessages = await Match.populate(matchingMessages, {
      path: 'sender',
      select: 'firstName lastName avatar'
    });

    const totalMatches = match.messages.filter(msg =>
      !msg.isDeleted && searchRegex.test(msg.content)
    ).length;

    const totalPages = Math.ceil(totalMatches / limit);

    res.json({
      success: true,
      data: {
        messages: populatedMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalMatches,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });

  } catch (error) {
    logger.error('Search messages error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
};

// @desc    Get chat statistics
// @route   GET /api/chat/stats
// @access  Private
const getChatStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all matches for this user
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'active'
    });

    let totalMessages = 0;
    let unreadMessages = 0;
    let totalConversations = matches.length;

    for (const match of matches) {
      totalMessages += match.messages.length;
      unreadMessages += match.messages.filter(msg =>
        !msg.readBy.some(read => read.user.toString() === userId)
      ).length;
    }

    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMatches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      lastMessageAt: { $gte: yesterday }
    });

    const recentActivity = recentMatches.length;

    res.json({
      success: true,
      data: {
        totalConversations,
        totalMessages,
        unreadMessages,
        recentActivity,
        averageMessagesPerConversation: totalConversations > 0 ?
          Math.round(totalMessages / totalConversations) : 0
      }
    });

  } catch (error) {
    logger.error('Get chat stats error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get chat statistics'
    });
  }
};

// @desc    Export chat history
// @route   POST /api/chat/:matchId/export
// @access  Private
const exportChat = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: userId }, { user2: userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Export chat data
    const chatData = {
      matchId: match._id,
      exportedAt: new Date(),
      messages: match.messages.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        messageType: msg.messageType,
        attachments: msg.attachments,
        sentAt: msg.sentAt,
        reactions: msg.reactions
      }))
    };

    // In production, save to cloud storage and email link
    // For now, return JSON
    res.json({
      success: true,
      data: {
        chatData,
        downloadUrl: `/api/chat/${matchId}/export/download?token=TOKEN`
      }
    });

    logger.info('Chat exported', { userId, matchId });

  } catch (error) {
    logger.error('Export chat error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to export chat'
    });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/:matchId/clear
// @access  Private
const clearChatHistory = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: userId }, { user2: userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Keep messages for moderation (soft delete)
    match.messages.forEach(msg => {
      msg.isDeleted = true;
      msg.deletedAt = new Date();
      msg.content = 'This message was deleted';
    });

    match.lastMessageAt = undefined;
    match.messageCount = 0;

    await match.save();

    logger.info('Chat history cleared', { userId, matchId });

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    logger.error('Clear chat error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  searchMessages,
  getChatStats,
  exportChat,
  clearChatHistory
};
