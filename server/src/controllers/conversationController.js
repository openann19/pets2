'use strict';

const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

function ok(res, status, payload) {
    return res.status(status).json({ success: true, ...payload });
}

function fail(res, status, message, meta) {
    const body = { success: false, message };
    if (meta && process.env.NODE_ENV !== 'production') body.meta = meta;
    return res.status(status).json(body);
}

function ensureAuth(req, res) {
    const userId = req.userId || req.user?._id;
    if (!userId) {
        fail(res, 401, 'Unauthorized');
        return null;
    }
    return String(userId);
}

async function ensureMembership(conversationId, userId) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) return null;
    return Conversation.findOne({ _id: conversationId, participants: { $in: [userId] } });
}

// GET /api/conversations/:conversationId/messages?before=&limit=
exports.getMessages = async (req, res) => {
    try {
        const userId = ensureAuth(req, res);
        if (!userId) return;

        const { conversationId } = req.params;
        const { before, limit: limitStr } = req.query || {};
        const limit = Math.max(1, Math.min(parseInt(limitStr, 10) || 20, 100));

        const conv = await ensureMembership(conversationId, userId);
        if (!conv) return fail(res, 404, 'Conversation not found');

        const page = await Conversation.getMessagesPage(conv._id, { before, limit });
        return ok(res, 200, { ...page });
    } catch (error) {
        logger.error('getMessages error', { error: error?.message });
        return fail(res, 500, 'Failed to fetch messages');
    }
};

// POST /api/conversations/:conversationId/messages
exports.sendMessage = async (req, res) => {
    try {
        const userId = ensureAuth(req, res);
        if (!userId) return;

        const { conversationId } = req.params;
        const { content, attachments = [] } = req.body || {};

        if ((!content || typeof content !== 'string' || content.trim().length === 0) && (!Array.isArray(attachments) || attachments.length === 0)) {
            return fail(res, 400, 'Message content or attachments are required');
        }

        const conv = await ensureMembership(conversationId, userId);
        if (!conv) return fail(res, 404, 'Conversation not found');

        const trimmed = typeof content === 'string' ? content.trim() : '';
        const msg = await conv.addMessage(userId, trimmed, attachments);

        // Emit socket events
        try {
            if (req.io) {
                req.io.to(`chat:${String(conv._id)}`).emit('message:received', {
                    chatId: String(conv._id),
                    message: msg,
                });

                // Notify other participants
                const others = (conv.participants || []).map(String).filter((id) => id !== String(userId));
                for (const other of others) {
                    req.io.to(`notifications:${other}`).emit('notification', {
                        type: 'new_message',
                        title: 'New message',
                        body: trimmed.substring(0, 100),
                        chatId: String(conv._id),
                        senderId: String(userId),
                    });
                }
            }
        } catch (socketErr) {
            logger.warn?.('Socket emit failed for sendMessage', { error: socketErr?.message });
        }

        return ok(res, 201, { message: msg });
    } catch (error) {
        logger.error('sendMessage error', { error: error?.message });
        return fail(res, 500, 'Failed to send message');
    }
};

// POST /api/conversations/:conversationId/read
exports.markRead = async (req, res) => {
    try {
        const userId = ensureAuth(req, res);
        if (!userId) return;
        const { conversationId } = req.params;

        const conv = await ensureMembership(conversationId, userId);
        if (!conv) return fail(res, 404, 'Conversation not found');

        const changed = await conv.markMessagesAsRead(userId);

        try {
            if (changed && req.io) {
                req.io.to(`chat:${String(conv._id)}`).emit('message:read', {
                    chatId: String(conv._id),
                    userId: String(userId),
                    readAt: new Date().toISOString(),
                });
            }
        } catch (socketErr) {
            logger.warn?.('Socket emit failed for markRead', { error: socketErr?.message });
        }

        return ok(res, 200, { changed });
    } catch (error) {
        logger.error('markRead error', { error: error?.message });
        return fail(res, 500, 'Failed to mark messages as read');
    }
};

module.exports = exports;
