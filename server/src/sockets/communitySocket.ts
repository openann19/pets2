import type { Server as SocketServer, Socket } from 'socket.io';
import logger from '../utils/logger';

// Define authenticated socket interface
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export const initializeCommunitySocket = (io: SocketServer): void => {
  const communityNamespace = io.of('/community');

  communityNamespace.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Authentication middleware for community namespace
      const token = socket.handshake.auth['token'];
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token and attach user to socket
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET!) as any;

      socket.userId = decoded.id;
      socket.userEmail = decoded.email;

      logger.info('Community socket authenticated', { userId: socket.userId });
      next();
    } catch (error) {
      logger.error('Community socket authentication failed', { error });
      next(new Error('Authentication failed'));
    }
  });

  communityNamespace.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('User connected to community socket', { userId: socket.userId });

    // Handle feed room joining
    socket.on('feed:join', (data: { filters?: any }) => {
      socket.join(`feed:${socket.userId}`);
      logger.info('User joined feed room', { userId: socket.userId, filters: data.filters });
    });

    // Handle feed room leaving
    socket.on('feed:leave', () => {
      socket.leave(`feed:${socket.userId}`);
      logger.info('User left feed room', { userId: socket.userId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('User disconnected from community socket', { userId: socket.userId });
    });
  });

  logger.info('✅ Community socket service initialized');
};

// Helper function to broadcast new pets to feed subscribers
export const broadcastNewPets = (io: SocketServer, userId: string, pets: any[], pagination: any): void => {
  io.of('/community').to(`feed:${userId}`).emit('feed:new_pets', { pets, pagination });
};

// Helper function to broadcast feed updates
export const broadcastFeedUpdate = (io: SocketServer, userId: string, type: 'new' | 'update' | 'remove', pet: any): void => {
  io.of('/community').to(`feed:${userId}`).emit('feed:update', { type, pet });
};

// Helper function to broadcast matches
export const broadcastMatch = (io: SocketServer, userId: string, petId: string, matchedPet: any, match: any): void => {
  io.of('/community').to(`feed:${userId}`).emit('feed:match', { petId, matchedPet, match });
};

export default initializeCommunitySocket;