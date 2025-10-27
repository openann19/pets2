/**
 * WebSocket Server for Real-time Updates
 * Handles community feed, chat, and notifications
 */

import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { logger } from './src/utils/logger.js';

interface SocketUser {
  id: string;
  socketId: string;
}

function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Track connected users
  const connectedUsers = new Map<string, string>();

  io.on('connection', (socket: Socket) => {
    logger.info(`✅ Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join:feed', (userId: string) => {
      socket.join(`feed:${userId}`);
      connectedUsers.set(socket.id, userId);
      logger.debug(`User ${userId} joined feed`);
    });

    // Community feed events
    socket.on('post:create', (post: any) => {
      // Broadcast to all users in the feed
      io.emit('feed:update', {
        type: 'new_post',
        post,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('post:like', ({ postId, userId }: { postId: string; userId: string }) => {
      io.emit('feed:update', {
        type: 'like',
        postId,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('post:comment', ({ postId, userId, comment }: { postId: string; userId: string; comment: string }) => {
      io.emit('feed:update', {
        type: 'comment',
        postId,
        userId,
        comment,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('post:delete', ({ postId, userId }: { postId: string; userId: string }) => {
      io.emit('feed:update', {
        type: 'delete',
        postId,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Chat events
    socket.on('join:chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logger.debug(`Socket ${socket.id} joined chat ${chatId}`);
    });

    socket.on('message:send', ({ chatId, message }: { chatId: string; message: any }) => {
      io.to(`chat:${chatId}`).emit('message:received', {
        chatId,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('typing:start', ({ chatId, userId }: { chatId: string; userId: string }) => {
      socket.to(`chat:${chatId}`).emit('user:typing', { userId, typing: true });
    });

    socket.on('typing:stop', ({ chatId, userId }: { chatId: string; userId: string }) => {
      socket.to(`chat:${chatId}`).emit('user:typing', { userId, typing: false });
    });

    // Notification events
    socket.on('join:notifications', (userId: string) => {
      socket.join(`notifications:${userId}`);
    });

    // Match events
    socket.on('match:new', ({ userId, matchData }: { userId: string; matchData: any }) => {
      io.to(`notifications:${userId}`).emit('notification:match', {
        type: 'new_match',
        data: matchData,
        timestamp: new Date().toISOString(),
      });
    });

    // Online presence
    socket.on('presence:online', (userId: string) => {
      io.emit('user:online', { userId, online: true });
    });

    socket.on('presence:offline', (userId: string) => {
      io.emit('user:online', { userId, online: false });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        io.emit('user:online', { userId, online: false });
        connectedUsers.delete(socket.id);
      }
      logger.info(`❌ Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error: Error) => {
      logger.error(`Socket error for ${socket.id}:`, { error: error.message });
    });
  });

  // Heartbeat to detect stale connections
  const heartbeatInterval = setInterval(() => {
    io.emit('ping');
  }, 30000);

  // Live streaming chat namespace
  io.of(/^\/live:.+$/).on('connection', (socket: Socket) => {
    logger.info(`✅ Live stream connected: ${socket.nsp.name}`);
    
    const roomName = socket.nsp.name.replace('/live:', '');

    socket.on('chat:message', (payload: any) => {
      socket.nsp.emit('chat:message', {
        userId: (socket as any).data?.userId || 'anon',
        text: String(payload.text || '').slice(0, 1000),
        ts: Date.now(),
      });
    });

    socket.on('reaction', (emoji: string) => {
      socket.nsp.emit('reaction', { emoji, ts: Date.now() });
    });

    socket.on('disconnect', () => {
      logger.info(`❌ Live stream disconnected: ${socket.nsp.name}`);
    });
  });

  logger.info('🚀 WebSocket server initialized');

  // Return both io instance and cleanup function
  return {
    io,
    cleanup: () => {
      clearInterval(heartbeatInterval);
      io.close();
    }
  };
}

export { initializeSocket };
