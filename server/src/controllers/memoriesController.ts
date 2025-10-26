import { Response } from 'express';
import Match from '../models/Match';
import logger from '../utils/logger';
import Conversation from '../models/Conversation';
import { Request } from 'express';

/**
 * Request interface
 */
interface AuthenticatedRequest extends Request {
  userId: string;
  user?: any;
  params: {
    matchId: string;
  };
}

/**
 * Memory node type
 */
interface MemoryNode {
  id: string;
  type: 'text' | 'image' | 'video' | 'location';
  content: string;
  title: string;
  timestamp: string;
  metadata?: {
    location?: string;
    participants: string[];
    emotion?: 'happy' | 'excited' | 'love' | 'playful';
  };
}

/**
 * Get memories for a match
 */
export const getMemories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    // Find the match and verify user has access
    const match = await Match.findById(matchId).populate('pet1 pet2 user1 user2');
    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    // Check if user is part of this match
    const matchUser1 = (match as any).user1?.toString();
    const matchUser2 = (match as any).user2?.toString();
    if (matchUser1 !== userId && matchUser2 !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Get messages for this match
    let messages: any[] = [];
    try {
      const Message = require('../models/Message');
      if (Message && typeof Message.find === 'function') {
        messages = await Message.find({
          match: matchId,
          isDeleted: { $ne: true }
        })
          .populate('sender', 'firstName lastName')
          .sort({ createdAt: 1 })
          .limit(50); // Limit to prevent too many memories
      }
    } catch (error) {
      logger.warn?.('Message model unavailable', { error: (error as Error)?.message });
    }

    // Fallback: derive messages from Conversation between the two users
    if (messages.length === 0) {
      const participants = [matchUser1, matchUser2].map(id => id.toString());
      const convo = await Conversation.findOne({ participants: { $all: participants, $size: 2 } })
        .lean();
      
      if (convo && Array.isArray((convo as any).messages)) {
        // Mimic Message shape minimally
        messages = (convo as any).messages
          .slice()
          .sort((a: any, b: any) => new Date(a.sentAt || a.createdAt).getTime() - new Date(b.sentAt || b.createdAt).getTime())
          .slice(0, 50)
          .map((m: any) => ({
            _id: m._id,
            content: m.content,
            createdAt: m.sentAt || m.createdAt || new Date(),
            sender: { _id: m.sender, firstName: '', lastName: '' }
          }));
      }
    }

    // Convert messages to memory nodes
    const memories: MemoryNode[] = messages.map((message: any) => {
      const sender = message.sender || {};

      // Generate different types of memories based on message content
      let type: 'text' | 'image' | 'video' | 'location' = 'text';
      let title = '';
      let emotion: 'happy' | 'excited' | 'love' | 'playful' | undefined;

      const contentLower = (message.content || '').toLowerCase();

      // Analyze message content to determine memory type
      if (contentLower.includes('photo') ||
        contentLower.includes('picture')) {
        type = 'image';
        title = `Shared a photo`;
        emotion = 'happy';
      } else if (contentLower.includes('location') ||
        contentLower.includes('meet')) {
        type = 'location';
        title = `Suggested meeting up`;
        emotion = 'excited';
      } else if (contentLower.includes('love') ||
        contentLower.includes('cute') ||
        contentLower.includes('adorable')) {
        emotion = 'love';
        title = `Expressed affection`;
      } else if (contentLower.includes('play') ||
        contentLower.includes('fun') ||
        contentLower.includes('excited')) {
        emotion = 'playful';
        title = `Shared playful moment`;
      } else if (contentLower.includes('happy') ||
        contentLower.includes('great') ||
        contentLower.includes('awesome')) {
        emotion = 'happy';
        title = `Shared happy news`;
      } else {
        // Default text memory
        const firstWords = (message.content || '').split(' ').slice(0, 3).join(' ');
        title = `"${firstWords}${firstWords.length < (message.content || '').length ? '...' : ''}"`;
        emotion = 'happy';
      }

      return {
        id: message._id.toString(),
        type,
        content: message.content || '',
        title: title || `Memory from conversation`,
        timestamp: message.createdAt.toISOString(),
        metadata: {
          participants: [`${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'User'],
          emotion,
          location: type === 'location' ? 'Local area' : undefined
        }
      };
    });

    // Add some milestone memories
    if (messages.length > 0) {
      const firstMessage = messages[0];
      const firstSender = firstMessage.sender || {};

      // First contact memory
      memories.unshift({
        id: `milestone_first_${matchId}`,
        type: 'text',
        content: `Started a conversation with ${(match as any).pet1?.name || 'pet'} and ${(match as any).pet2?.name || 'pet'}`,
        title: 'First Contact',
        timestamp: firstMessage.createdAt.toISOString(),
        metadata: {
          participants: [`${firstSender.firstName || ''} ${firstSender.lastName || ''}`.trim() || 'User'],
          emotion: 'excited'
        }
      });

      // Add milestone memories based on message count
      if (messages.length >= 10) {
        memories.splice(1, 0, {
          id: `milestone_10_${matchId}`,
          type: 'text',
          content: `Reached 10 messages! Getting to know each other better.`,
          title: 'Growing Connection',
          timestamp: messages[9].createdAt.toISOString(),
          metadata: {
            participants: ['Both of you'],
            emotion: 'happy'
          }
        });
      }

      if (messages.length >= 25) {
        memories.splice(2, 0, {
          id: `milestone_25_${matchId}`,
          type: 'text',
          content: `25 messages shared! Building a real connection.`,
          title: 'Stronger Bond',
          timestamp: messages[24].createdAt.toISOString(),
          metadata: {
            participants: ['Both of you'],
            emotion: 'love'
          }
        });
      }
    }

    // Sort memories by timestamp (newest first for the weave)
    memories.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      memories,
      match: {
        id: match._id,
        pet1: (match as any).pet1 ? {
          name: (match as any).pet1.name,
          species: (match as any).pet1.species
        } : null,
        pet2: (match as any).pet2 ? {
          name: (match as any).pet2.name,
          species: (match as any).pet2.species
        } : null
      }
    });

  } catch (error) {
    logger.error('Get memories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load memories',
      error: (error as Error).message
    });
  }
};

