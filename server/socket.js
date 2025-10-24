/**
 * WebSocket Server for Real-time Updates
 * Handles community feed, chat, and notifications
 */

const { Server } = require('socket.io');
const logger = require('./src/utils/logger');

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Track connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    logger.info(`✅ Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join:feed', (userId) => {
      socket.join(`feed:${userId}`);
      connectedUsers.set(socket.id, userId);
      logger.debug(`User ${userId} joined feed`);
    });

    // Community feed events
    socket.on('post:create', (post) => {
      // Broadcast to all users in the feed
      io.emit('feed:update', {
        type: 'new_post',
        post,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('post:like', ({ postId, userId }) => {
      io.emit('feed:update', {
        type: 'like',
        postId,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('post:comment', ({ postId, userId, comment }) => {
      io.emit('feed:update', {
        type: 'comment',
        postId,
        userId,
        comment,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('post:delete', ({ postId, userId }) => {
      io.emit('feed:update', {
        type: 'delete',
        postId,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Chat events
    socket.on('join:chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      logger.debug(`Socket ${socket.id} joined chat ${chatId}`);
    });

    socket.on('message:send', ({ chatId, message }) => {
      io.to(`chat:${chatId}`).emit('message:received', {
        chatId,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('typing:start', ({ chatId, userId }) => {
      socket.to(`chat:${chatId}`).emit('user:typing', { userId, typing: true });
    });

    socket.on('typing:stop', ({ chatId, userId }) => {
      socket.to(`chat:${chatId}`).emit('user:typing', { userId, typing: false });
    });

    // Notification events
    socket.on('join:notifications', (userId) => {
      socket.join(`notifications:${userId}`);
    });

    // Match events
    socket.on('match:new', ({ userId, matchData }) => {
      io.to(`notifications:${userId}`).emit('notification:match', {
        type: 'new_match',
        data: matchData,
        timestamp: new Date().toISOString(),
      });
    });

    // Online presence
    socket.on('presence:online', (userId) => {
      io.emit('user:online', { userId, online: true });
    });

    socket.on('presence:offline', (userId) => {
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
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, { error: error.message });
    });
  });

  // Heartbeat to detect stale connections
  const heartbeatInterval = setInterval(() => {
    io.emit('ping');
  }, 30000);

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

module.exports = { initializeSocket };
