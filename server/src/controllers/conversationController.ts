import { Response } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import logger from '../utils/logger';
import { AuthRequest } from '../types/express';

/**
 * Request interfaces
 */
interface GetMessagesRequest extends AuthRequest {
  params: {
    conversationId: string;
  };
  query: {
    before?: string;
    limit?: string;
  };
}

interface SendMessageRequest extends AuthRequest {
  params: {
    conversationId: string;
  };
  body: {
    content?: string;
    attachments?: any[];
  };
  io?: any; // Socket.io instance
}

interface MarkReadRequest extends AuthRequest {
  params: {
    conversationId: string;
  };
  io?: any; // Socket.io instance
}

/**
 * Helper functions
 */
function ok(res: Response, status: number, payload: Record<string, any>): Response {
  return res.status(status).json({ success: true, ...payload });
}

function fail(res: Response, status: number, message: string, meta?: Record<string, any>): Response {
  const body: { success: boolean; message: string; meta?: Record<string, any> } = { success: false, message };
  if (meta && process.env.NODE_ENV !== 'production') {
    body.meta = meta;
  }
  return res.status(status).json(body);
}

function ensureAuth(req: AuthRequest, res: Response): string | null {
  const userId = req.userId || req.user?._id;
  if (!userId) {
    fail(res, 401, 'Unauthorized');
    return null;
  }
  return String(userId);
}

async function ensureMembership(conversationId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) return null;
  return Conversation.findOne({ _id: conversationId, participants: { $in: [userId] } });
}

/**
 * GET /api/conversations/:conversationId/messages?before=&limit=
 */
export const getMessages = async (req: GetMessagesRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = ensureAuth(req, res);
    if (!userId) return;

    const { conversationId } = req.params;
    const { before, limit: limitStr } = req.query || {};
    const limit = Math.max(1, Math.min(parseInt(limitStr || '20', 10), 100));

    const conv = await ensureMembership(conversationId, userId);
    if (!conv) return fail(res, 404, 'Conversation not found');

    const page = await Conversation.getMessagesPage(conv._id, { before, limit });
    return ok(res, 200, { ...page });
  } catch (error: any) {
    logger.error('getMessages error', { error: error?.message });
    return fail(res, 500, 'Failed to fetch messages');
  }
};

/**
 * POST /api/conversations/:conversationId/messages
 */
export const sendMessage = async (req: SendMessageRequest, res: Response): Promise<Response | void> => {
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
    } catch (socketErr: any) {
      logger.warn?.('Socket emit failed for sendMessage', { error: socketErr?.message });
    }

    return ok(res, 201, { message: msg });
  } catch (error: any) {
    logger.error('sendMessage error', { error: error?.message });
    return fail(res, 500, 'Failed to send message');
  }
};

/**
 * POST /api/conversations/:conversationId/read
 */
export const markRead = async (req: MarkReadRequest, res: Response): Promise<Response | void> => {
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
    } catch (socketErr: any) {
      logger.warn?.('Socket emit failed for markRead', { error: socketErr?.message });
    }

    return ok(res, 200, { changed });
  } catch (error: any) {
    logger.error('markRead error', { error: error?.message });
    return fail(res, 500, 'Failed to mark messages as read');
  }
};

