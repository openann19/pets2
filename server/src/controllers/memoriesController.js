const Match = require('../models/Match');
const logger = require('../utils/logger');
let Message;
try {
  Message = require('../models/Message');
} catch (error) {
  Message = null;
  logger.warn?.('Message model unavailable', { error: error?.message });
}
const Conversation = require('../models/Conversation');

/**
 * @typedef {Object} MemoryNode
 * @property {string} id
 * @property {'text'|'image'|'video'|'location'} type
 * @property {string} content
 * @property {string} title
 * @property {string} timestamp
 * @property {Object} [metadata]
 * @property {string} [metadata.location]
 * @property {string[]} [metadata.participants]
 * @property {'happy'|'excited'|'love'|'playful'} [metadata.emotion]
 */

// Get memories for a match
const getMemories = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    // Find the match and verify user has access
    const match = await Match.findById(matchId).populate('pet1 pet2 user1 user2');
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is part of this match
    if (match.user1.toString() !== userId && match.user2.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages for this match
    let messages = [];
    if (Message && typeof Message.find === 'function') {
      messages = await Message.find({
        match: matchId,
        isDeleted: { $ne: true }
      })
        .populate('sender', 'firstName lastName')
        .sort({ createdAt: 1 })
        .limit(50); // Limit to prevent too many memories
    } else {
      // Fallback: derive messages from Conversation between the two users
      const participants = [match.user1, match.user2].map(id => id.toString());
      const convo = await Conversation.findOne({ participants: { $all: participants, $size: 2 } })
        .lean();
      if (convo && Array.isArray(convo.messages)) {
        // Mimic Message shape minimally
        messages = convo.messages
          .slice()
          .sort((a, b) => new Date(a.sentAt || a.createdAt) - new Date(b.sentAt || b.createdAt))
          .slice(0, 50)
          .map(m => ({
            _id: m._id,
            content: m.content,
            createdAt: m.sentAt || m.createdAt || new Date(),
            sender: { _id: m.sender, firstName: '', lastName: '' }
          }));
      }
    }

    // Convert messages to memory nodes
    const memories = messages.map((message) => {
      const sender = message.sender;

      // Generate different types of memories based on message content
      let type = 'text';
      let title = '';
      let emotion;

      // Analyze message content to determine memory type
      if (message.content.toLowerCase().includes('photo') ||
        message.content.toLowerCase().includes('picture')) {
        type = 'image';
        title = `Shared a photo`;
        emotion = 'happy';
      } else if (message.content.toLowerCase().includes('location') ||
        message.content.toLowerCase().includes('meet')) {
        type = 'location';
        title = `Suggested meeting up`;
        emotion = 'excited';
      } else if (message.content.toLowerCase().includes('love') ||
        message.content.toLowerCase().includes('cute') ||
        message.content.toLowerCase().includes('adorable')) {
        emotion = 'love';
        title = `Expressed affection`;
      } else if (message.content.toLowerCase().includes('play') ||
        message.content.toLowerCase().includes('fun') ||
        message.content.toLowerCase().includes('excited')) {
        emotion = 'playful';
        title = `Shared playful moment`;
      } else if (message.content.toLowerCase().includes('happy') ||
        message.content.toLowerCase().includes('great') ||
        message.content.toLowerCase().includes('awesome')) {
        emotion = 'happy';
        title = `Shared happy news`;
      } else {
        // Default text memory
        const firstWords = message.content.split(' ').slice(0, 3).join(' ');
        title = `"${firstWords}${firstWords.length < message.content.length ? '...' : ''}"`;
        emotion = 'happy';
      }

      return {
        id: message._id.toString(),
        type,
        content: message.content,
        title: title || `Memory from conversation`,
        timestamp: message.createdAt.toISOString(),
        metadata: {
          participants: [`${sender.firstName} ${sender.lastName}`],
          emotion,
          location: type === 'location' ? 'Local area' : undefined
        }
      };
    });

    // Add some milestone memories
    if (messages.length > 0) {
      const firstMessage = messages[0];
      const firstSender = firstMessage.sender;

      // First contact memory
      memories.unshift({
        id: `milestone_first_${matchId}`,
        type: 'text',
        content: `Started a conversation with ${match.pet1 && match.pet1.name} and ${match.pet2 && match.pet2.name}`,
        title: 'First Contact',
        timestamp: firstMessage.createdAt.toISOString(),
        metadata: {
          participants: [`${firstSender.firstName} ${firstSender.lastName}`],
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
        pet1: match.pet1 ? {
          name: match.pet1.name,
          species: match.pet1.species
        } : null,
        pet2: match.pet2 ? {
          name: match.pet2.name,
          species: match.pet2.species
        } : null
      }
    });

  } catch (error) {
    logger.error('Get memories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load memories',
      error: error.message
    });
  }
};

module.exports = {
  getMemories
};
