import Conversation from '../models/Conversation';
import User from '../models/User';
import logger from '../utils/logger';
import type { Server as SocketIOServer } from 'socket.io';

// Interface for story reply data
export interface StoryReplyData {
  conversationId: string;
  message: any;
}

/**
 * Ensure a conversation exists between two users
 * @param userA - First user ID
 * @param userB - Second user ID
 * @returns The conversation object
 */
export async function ensureConversation(userA: string, userB: string): Promise<any> {
  try {
    return await Conversation.findOrCreateOneToOne(userA, userB);
  } catch (err) {
    logger.error('Failed to ensure conversation', { err: (err as Error)?.message });
    throw err;
  }
}

/**
 * Create a DM from a story reply by sending a message to the story owner.
 * Returns conversationId and message when successful.
 * @param replierId - ID of the user replying to the story
 * @param ownerId - ID of the story owner
 * @param message - Message text
 * @param storyId - ID of the story being replied to
 * @param io - Socket.IO server instance (optional)
 * @returns Object with conversationId and message
 */
export async function createDMFromStoryReply(
  replierId: string,
  ownerId: string,
  message: string,
  storyId: string,
  io?: SocketIOServer
): Promise<StoryReplyData> {
  try {
    if (!replierId || !ownerId || !message) {
      throw new Error('Missing required parameters');
    }

    // Validate users exist
    const [replier, owner] = await Promise.all([
      User.findById(replierId).select('_id firstName').lean(),
      User.findById(ownerId).select('_id firstName').lean(),
    ]);
    
    if (!replier || !owner) {
      throw new Error('User(s) not found');
    }

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
          title: `New reply from ${(replier as any).firstName || 'Someone'}`,
          body: message.substring(0, 100),
          chatId: String(conv._id),
          senderId: String(replierId),
        });
      }
    } catch (socketErr) {
      logger.warn('Socket emit failed for DM from story reply', { 
        error: (socketErr as Error)?.message 
      });
    }

    return { conversationId: String(conv._id), message: sent };
  } catch (error) {
    logger.error('createDMFromStoryReply error', { error: (error as Error)?.message });
    throw error;
  }
}

// Export default object for backward compatibility
export default {
  createDMFromStoryReply,
  ensureConversation
};

