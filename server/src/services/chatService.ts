export {};// Added to mark file as a module
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const logger = require('../utils/logger');

async function ensureConversation(userA, userB) {
    try {
        return await Conversation.findOrCreateOneToOne(userA, userB);
    } catch (err) {
        logger.error('Failed to ensure conversation', { err: err?.message });
        throw err;
    }
}

/**
 * Create a DM from a story reply by sending a message to the story owner.
 * Returns { conversationId, message } when successful.
 */
async function createDMFromStoryReply(replierId, ownerId, message, storyId, io) {
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
        } catch (socketErr) {
            logger.warn?.('Socket emit failed for DM from story reply', { error: socketErr?.message });
        }

        return { conversationId: String(conv._id), message: sent };
    } catch (error) {
        logger.error('createDMFromStoryReply error', { error: error?.message });
        throw error;
    }
}

module.exports = { createDMFromStoryReply };
