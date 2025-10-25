import Conversation from '../models/Conversation';
import User from '../models/User';
import logger from '../utils/logger';
import { ChatService } from '../types';
import { Server as SocketIOServer } from 'socket.io';

// Chat service types
interface StoryReplyResult {
  conversationId: string;
  message: {
    _id: string;
    content: string;
    senderId: string;
    timestamp: Date;
  };
}

async function ensureConversation(userA: string, userB: string, matchId?: string) {
  try {
    return await Conversation.findOrCreateOneToOne(userA, userB, matchId || '');
  } catch (err) {
    logger.error('Failed to ensure conversation', { err: err instanceof Error ? err.message : 'Unknown error' });
    throw err;
  }
}

/**
 * Create a DM from a story reply by sending a message to the story owner.
 * Returns { conversationId, message } when successful.
 */
async function createDMFromStoryReply(replierId: string, ownerId: string, message: string, storyId: string, io?: SocketIOServer): Promise<StoryReplyResult> {
  try {
    if (!replierId || !ownerId || !message) {
      throw new Error('Missing required parameters');
    }

    // Validate users exist
    const [replier, owner] = await Promise.all([
      User.findById(replierId).select('_id firstName'),
      User.findById(ownerId).select('_id firstName'),
    ]);
    if (!replier || !owner) throw new Error('User(s) not found');

    const conv = await ensureConversation(replierId, ownerId);
    const sent = await conv.addMessage(replierId, message.trim(), [
      JSON.stringify({ type: 'story-ref', storyId: String(storyId) })
    ]);

    // Emit socket events if available
    try {
      if (io) {
        io.to(`chat:${String(conv._id)}`).emit('message:received', {
          chatId: String(conv._id),
          message: sent,
        });
        io.to(`notifications:${String(ownerId)}`).emit('notification', {
          type: 'new_message',
          title: `New reply from ${replier.firstName || 'Someone'}`,
          body: message.substring(0, 100),
          chatId: String(conv._id),
          senderId: String(replierId),
        });
      }
    } catch (socketError) {
      logger.warn('Socket emission failed (non-critical)', { socketError });
    }

    return { conversationId: String(conv._id), message: sent };
  } catch (err) {
    logger.error('Failed to create DM from story reply', { err: err instanceof Error ? err.message : 'Unknown error' });
    throw err;
  }
}

/**
 * Send message to a conversation
 * @param matchId - Match ID
 * @param senderId - Sender user ID
 * @param content - Message content
 * @param type - Message type
 * @returns Sent message
 */
export const sendMessage = async (matchId: string, senderId: string, content: string, type: string = 'text'): Promise<any> => {
  try {
    if (!matchId || !senderId || !content) {
      throw new Error('Missing required parameters');
    }

    // Get match to find both users
    const Match = require('../models/Match');
    const match = await Match.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    const otherUserId = match.users.find((id: string) => id.toString() !== senderId);
    if (!otherUserId) {
      throw new Error('Other user not found in match');
    }

    // Ensure conversation exists
    const conversation = await ensureConversation(senderId, otherUserId.toString(), matchId);
    
    // Add message
    const message = await conversation.addMessage(senderId, content, [], type);
    
    logger.info('Message sent successfully', { 
      matchId, 
      senderId, 
      messageId: message._id,
      type 
    });

    return message;
  } catch (error) {
    logger.error('Error sending message', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      matchId, 
      senderId, 
      content: content.substring(0, 100)
    });
    throw error;
  }
};

/**
 * Get messages for a conversation
 * @param matchId - Match ID
 * @param page - Page number
 * @param limit - Messages per page
 * @returns Messages array
 */
export const getMessages = async (matchId: string, page: number = 1, limit: number = 50): Promise<any> => {
  try {
    if (!matchId) {
      throw new Error('Match ID is required');
    }

    // Get match to find both users
    const Match = require('../models/Match');
    const match = await Match.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      matchId,
      isActive: true
    });

    if (!conversation) {
      return { messages: [], total: 0, page, limit };
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = conversation.messages
      .slice(skip, skip + limit)
      .reverse(); // Most recent first

    return {
      messages,
      total: conversation.messages.length,
      page,
      limit,
      hasMore: skip + limit < conversation.messages.length
    };
  } catch (error) {
    logger.error('Error getting messages', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      matchId, 
      page, 
      limit 
    });
    throw error;
  }
};

/**
 * Mark messages as read
 * @param matchId - Match ID
 * @param userId - User ID
 * @returns Success status
 */
export const markAsRead = async (matchId: string, userId: string): Promise<void> => {
  try {
    if (!matchId || !userId) {
      throw new Error('Match ID and user ID are required');
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      matchId,
      isActive: true
    });

    if (!conversation) {
      logger.warn('Conversation not found for mark as read', { matchId, userId });
      return;
    }

    // Mark messages as read
    await conversation.markMessagesAsRead(userId);
    
    logger.info('Messages marked as read', { matchId, userId });
  } catch (error) {
    logger.error('Error marking messages as read', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      matchId, 
      userId 
    });
    throw error;
  }
};

/**
 * Get conversations for a user
 * @param userId - User ID
 * @returns Conversations array
 */
export const getConversations = async (userId: string): Promise<any> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const conversations = await Conversation.getUserConversations(userId);
    
    // Add unread count for each conversation
    const conversationsWithUnread = conversations.map((conv: Conversation) => ({
      ...conv.toObject(),
      unreadCount: conv.getUnreadCount(userId)
    }));

    return conversationsWithUnread;
  } catch (error) {
    logger.error('Error getting conversations', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId 
    });
    throw error;
  }
};

/**
 * Delete a message
 * @param messageId - Message ID
 * @param userId - User ID (for authorization)
 * @returns Success status
 */
export const deleteMessage = async (messageId: string, userId: string): Promise<void> => {
  try {
    if (!messageId || !userId) {
      throw new Error('Message ID and user ID are required');
    }

    // Find conversation containing the message
    const conversation = await Conversation.findOne({
      'messages._id': messageId,
      isActive: true
    });

    if (!conversation) {
      throw new Error('Message not found');
    }

    // Find the message
    const message = conversation.messages.id(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is authorized to delete (sender or admin)
    if (message.sender.toString() !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    // Remove the message
    message.remove();
    await conversation.save();
    
    logger.info('Message deleted successfully', { messageId, userId });
  } catch (error) {
    logger.error('Error deleting message', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      messageId, 
      userId 
    });
    throw error;
  }
};

/**
 * Get conversation by participants
 * @param userA - First user ID
 * @param userB - Second user ID
 * @param matchId - Match ID
 * @returns Conversation or null
 */
export const getConversationByParticipants = async (userA: string, userB: string, matchId?: string): Promise<any> => {
  try {
    if (!userA || !userB) {
      throw new Error('Both user IDs are required');
    }

    return await Conversation.getConversationByParticipants(userA, userB, matchId || '');
  } catch (error) {
    logger.error('Error getting conversation by participants', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userA, 
      userB, 
      matchId 
    });
    throw error;
  }
};

/**
 * Archive a conversation
 * @param matchId - Match ID
 * @param userId - User ID
 * @returns Success status
 */
export const archiveConversation = async (matchId: string, userId: string): Promise<void> => {
  try {
    if (!matchId || !userId) {
      throw new Error('Match ID and user ID are required');
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      matchId,
      isActive: true
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Archive the conversation
    await conversation.archive();
    
    logger.info('Conversation archived successfully', { matchId, userId });
  } catch (error) {
    logger.error('Error archiving conversation', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      matchId, 
      userId 
    });
    throw error;
  }
};

/**
 * Get conversation statistics
 * @param userId - User ID
 * @returns Conversation statistics
 */
export const getConversationStats = async (userId: string): Promise<any> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const conversations = await Conversation.getUserConversations(userId);
    
    const stats = {
      totalConversations: conversations.length,
      activeConversations: conversations.filter((conv: Conversation) => conv.isActive).length,
      totalMessages: conversations.reduce((sum: number, conv: Conversation) => sum + conv.messages.length, 0),
      unreadMessages: conversations.reduce((sum: number, conv: Conversation) => sum + conv.getUnreadCount(userId), 0),
      lastActivity: conversations.length > 0 ? Math.max(...conversations.map((conv: Conversation) => conv.lastMessage?.timestamp?.getTime() || 0)) : null
    };

    return stats;
  } catch (error) {
    logger.error('Error getting conversation stats', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId 
    });
    throw error;
  }
};

// Export the service interface
const chatService: ChatService = {
  sendMessage,
  getMessages,
  markAsRead,
  getConversations,
};

export default chatService;
