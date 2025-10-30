/**
 * Chat Socket Service for PawfectMatch
 * Real-time chat functionality with Socket.IO
 */

import jwt from 'jsonwebtoken';
import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { IMatch } from '../models/Match';
import type { IUser } from '../models/User';
import logger from '../utils/logger';

// Type definitions
interface SocketUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  isBlocked: boolean;
  preferences?: {
    notifications?: {
      messages?: boolean;
    };
  };
  analytics?: {
    lastActive?: Date;
  };
  premium?: {
    isActive: boolean;
    stripeSubscriptionId?: string;
  };
  pushTokens?: string[];
}

interface SocketHandshake {
  token?: string;
  userId?: string;
  isAdmin?: boolean;
}

interface TypingData {
  timestamp: number;
  userName: string;
  timeout: NodeJS.Timeout;
}

interface UserPresence {
  socketId: string;
  lastSeen: Date;
  isOnline: boolean;
}

interface MessageData {
  matchId: string;
  content: string;
  messageType?: string;
  attachments?: any[];
  replyTo?: string;
}

interface EditMessageData {
  matchId: string;
  messageId: string;
  content: string;
}

interface DeleteMessageData {
  matchId: string;
  messageId: string;
}

interface ReactionData {
  matchId: string;
  messageId: string;
  emoji: string;
}

interface MatchActionData {
  matchId: string;
  action: 'archive' | 'unarchive' | 'favorite' | 'unfavorite' | 'block' | 'report';
}

interface TypingDataEvent {
  matchId: string;
  isTyping: boolean;
}

interface MarkReadData {
  matchId: string;
}

// In-memory storage for presence and typing (in production, use Redis)
const onlineUsers = new Map<string, UserPresence>(); // userId -> { socketId, lastSeen, isOnline }
const typingUsers = new Map<string, Map<string, TypingData>>(); // matchId -> Map of userId -> { timestamp, timeout }

export default function chatSocket(io: SocketIOServer): SocketIOServer {
  // Middleware to authenticate socket connections
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const handshake = socket.handshake as SocketHandshake;
      const token = handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const User = require('../models/User').default;
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');

      if (!user || !user.isActive || user.isBlocked) {
        return next(new Error('Authentication error: Invalid user'));
      }

      (socket as any).userId = user._id.toString();
      (socket as any).user = user;
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Socket authentication error:', { error: errorMessage });
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as SocketUser;
    const userId = (socket as any).userId as string;

    logger.info(`User ${user.firstName} connected`, { socketId: socket.id, userId });

    // Update user presence
    updateUserPresence(userId, socket.id, true);

    // Join user to their personal room for notifications
    socket.join(`user_${userId}`);

    // Handle joining match rooms
    socket.on('join_match', async (matchId: string) => {
      try {
        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found or access denied' });
          return;
        }

        // Check if match is blocked
        if ((match as any).isUserBlocked(userId)) {
          socket.emit('error', { message: 'Cannot join blocked match' });
          return;
        }

        socket.join(`match_${matchId}`);
        logger.info(`User joined match`, { userId, matchId });

        // Mark messages as read
        await (match as any).markMessagesAsRead(userId);

        // Notify other user that this user is online
        socket.to(`match_${matchId}`).emit('user_online', {
          userId,
          userName: user.firstName,
          onlineAt: new Date()
        });

        // Send current typing status
        const matchTyping = typingUsers.get(matchId);
        if (matchTyping) {
          const activeTyping = Array.from(matchTyping.entries())
            .filter(([uid, data]) => uid !== userId && data.timestamp > Date.now() - 5000)
            .map(([uid, data]) => ({
              userId: uid,
              userName: data.userName,
              timestamp: data.timestamp
            }));

          if (activeTyping.length > 0) {
            socket.emit('typing_status', { matchId, typing: activeTyping });
          }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Join match error:', { error: errorMessage });
        socket.emit('error', { message: 'Failed to join match' });
      }
    });

    // Handle leaving match rooms
    socket.on('leave_match', (matchId: string) => {
      socket.leave(`match_${matchId}`);

      // Notify other user that this user went offline
      socket.to(`match_${matchId}`).emit('user_offline', {
        userId,
        offlineAt: new Date()
      });

      logger.info(`User left match`, { userId, matchId });
    });

    // Handle sending messages
    socket.on('send_message', async (data: MessageData) => {
      try {
        const { matchId, content, messageType = 'text', attachments = [], replyTo = null } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        if (content.length > 1000) {
          socket.emit('error', { message: 'Message too long (max 1000 characters)' });
          return;
        }

        // Find and validate match
        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        }).populate('user1 user2', 'firstName lastName avatar');

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        if (match.status !== 'active') {
          socket.emit('error', { message: 'Cannot send message to inactive match' });
          return;
        }

        if ((match as any).isUserBlocked(userId)) {
          socket.emit('error', { message: 'Cannot send message to blocked match' });
          return;
        }

        // Validate replyTo if provided
        if (replyTo) {
          const replyMessage = (match as any).messages.id(replyTo);
          if (!replyMessage) {
            socket.emit('error', { message: 'Reply message not found' });
            return;
          }
        }

        // Add message to match
        const message = {
          sender: userId,
          content: content.trim(),
          messageType,
          attachments,
          replyTo,
          sentAt: new Date(),
          readBy: [{
            user: userId,
            readAt: new Date()
          }],
          status: 'sent',
          reactions: []
        };

        (match as any).messages.push(message);
        match.lastActivity = new Date();
        (match as any).lastMessageAt = new Date();
        await match.save();

        // Get the saved message with populated sender
        const savedMessage = (match as any).messages[(match as any).messages.length - 1];
        savedMessage.sender = user;

        // Populate replyTo if present
        if (replyTo) {
          const replyMessage = (match as any).messages.id(replyTo);
          if (replyMessage) {
            savedMessage.replyTo = {
              _id: replyMessage._id,
              sender: replyMessage.sender,
              content: replyMessage.content,
              messageType: replyMessage.messageType
            };
          }
        }

        // Update message status to delivered
        savedMessage.status = 'delivered';

        // Emit message to all users in the match room
        io.to(`match_${matchId}`).emit('new_message', {
          matchId,
          message: savedMessage
        });

        // Send push notification to other user if they're offline
        const otherUserId = match.user1._id.toString() === userId
          ? match.user2._id.toString()
          : match.user1._id.toString();

        const otherUserSockets = await io.in(`user_${otherUserId}`).fetchSockets();

        if (otherUserSockets.length === 0) {
          // Other user is offline, send push notification
          const otherUser = match.user1._id.toString() === userId ? match.user2 : match.user1;

          if ((otherUser as any).preferences?.notifications?.messages) {
            // Here you would integrate with a push notification service
            // For now, we'll emit to their user room in case they connect
            io.to(`user_${otherUserId}`).emit('notification', {
              type: 'new_message',
              title: `New message from ${user.firstName}`,
              body: content.substring(0, 100),
              matchId,
              senderId: userId,
              messageId: savedMessage._id
            });
          }
        }

        logger.info(`Message sent in match`, { userId, matchId });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Send message error:', { error: errorMessage });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle editing messages
    socket.on('edit_message', async (data: EditMessageData) => {
      try {
        const { matchId, messageId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: userId }, { user2: userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = (match as any).messages.id(messageId);
        if (!message || message.sender.toString() !== userId) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Check edit time limit (5 minutes)
        const timeDiff = Date.now() - message.sentAt.getTime();
        if (timeDiff > 5 * 60 * 1000) {
          socket.emit('error', { message: 'Messages can only be edited within 5 minutes' });
          return;
        }

        // Update message
        message.content = content.trim();
        message.isEdited = true;
        message.editedAt = new Date();

        await match.save();

        // Populate updated message
        await (message as any).populate('sender', 'firstName lastName avatar');

        // Emit update to match room
        io.to(`match_${matchId}`).emit('message_edited', {
          matchId,
          messageId,
          message
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Edit message error:', { error: errorMessage });
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle deleting messages
    socket.on('delete_message', async (data: DeleteMessageData) => {
      try {
        const { matchId, messageId } = data;

        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: userId }, { user2: userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = (match as any).messages.id(messageId);
        if (!message || message.sender.toString() !== userId) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Check delete time limit (1 hour)
        const timeDiff = Date.now() - message.sentAt.getTime();
        if (timeDiff > 60 * 60 * 1000) {
          socket.emit('error', { message: 'Messages can only be deleted within 1 hour' });
          return;
        }

        // Mark as deleted
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = 'This message was deleted';

        await match.save();

        // Emit deletion to match room
        io.to(`match_${matchId}`).emit('message_deleted', {
          matchId,
          messageId,
          deletedAt: new Date()
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Delete message error:', { error: errorMessage });
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle adding reactions
    socket.on('add_reaction', async (data: ReactionData) => {
      try {
        const { matchId, messageId, emoji } = data;

        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: userId }, { user2: userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = (match as any).messages.id(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user already reacted with this emoji
        const existingReaction = (message as any).reactions.find((r: any) =>
          r.user.toString() === userId && r.emoji === emoji
        );

        if (existingReaction) {
          socket.emit('error', { message: 'Already reacted with this emoji' });
          return;
        }

        // Add reaction
        (message as any).reactions.push({
          user: userId,
          emoji,
          reactedAt: new Date()
        });

        await match.save();

        // Populate reaction user
        const newReaction = (message as any).reactions[(message as any).reactions.length - 1];
        await (newReaction as any).populate('user', 'firstName lastName avatar');

        // Emit reaction to match room
        io.to(`match_${matchId}`).emit('reaction_added', {
          matchId,
          messageId,
          reaction: newReaction
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Add reaction error:', { error: errorMessage });
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle removing reactions
    socket.on('remove_reaction', async (data: ReactionData) => {
      try {
        const { matchId, messageId, emoji } = data;

        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: userId }, { user2: userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = (match as any).messages.id(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Find and remove reaction
        const reactionIndex = (message as any).reactions.findIndex((r: any) =>
          r.user.toString() === userId && r.emoji === emoji
        );

        if (reactionIndex === -1) {
          socket.emit('error', { message: 'Reaction not found' });
          return;
        }

        (message as any).reactions.splice(reactionIndex, 1);
        await match.save();

        // Emit reaction removal to match room
        io.to(`match_${matchId}`).emit('reaction_removed', {
          matchId,
          messageId,
          userId,
          emoji
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Remove reaction error:', { error: errorMessage });
        socket.emit('error', { message: 'Failed to remove reaction' });
      }
    });

    // Handle typing indicators with timeout
    socket.on('typing', (data: TypingDataEvent) => {
      const { matchId, isTyping } = data;

      if (isTyping) {
        // Set typing status with 5-second timeout
        setTypingStatus(matchId, userId, user.firstName);

        // Emit typing status to match room (excluding sender)
        socket.to(`match_${matchId}`).emit('user_typing', {
          userId,
          userName: user.firstName,
          isTyping: true,
          timestamp: Date.now()
        });
      } else {
        // Clear typing status
        clearTypingStatus(matchId, userId);

        // Emit typing stopped to match room
        socket.to(`match_${matchId}`).emit('user_typing', {
          userId,
          userName: user.firstName,
          isTyping: false,
          timestamp: Date.now()
        });
      }
    });

    // Handle message read receipts
    socket.on('mark_messages_read', async (data: MarkReadData) => {
      try {
        const { matchId } = data;

        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        });

        if (match) {
          await (match as any).markMessagesAsRead(userId);

          // Notify other user that messages were read
          socket.to(`match_${matchId}`).emit('messages_read', {
            userId,
            readAt: new Date()
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Mark messages read error:', { error: errorMessage });
      }
    });

    // Handle match actions (archive, block, favorite, etc.)
    socket.on('match_action', async (data: MatchActionData) => {
      try {
        const { matchId, action } = data;

        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        switch (action) {
          case 'archive':
            await (match as any).toggleArchive(userId);
            socket.emit('match_archived', { matchId });
            socket.to(`match_${matchId}`).emit('match_updated', { matchId, action: 'archived' });
            break;

          case 'unarchive':
            await (match as any).toggleArchive(userId);
            socket.emit('match_unarchived', { matchId });
            socket.to(`match_${matchId}`).emit('match_updated', { matchId, action: 'unarchived' });
            break;

          case 'favorite':
            await (match as any).toggleFavorite(userId);
            socket.emit('match_favorited', { matchId });
            break;

          case 'unfavorite':
            await (match as any).toggleFavorite(userId);
            socket.emit('match_unfavorited', { matchId });
            break;

          case 'block': {
            const userKey = match.user1.toString() === userId ? 'user1' : 'user2';
            (match as any).userActions[userKey].isBlocked = true;
            await match.save();

            // Remove both users from the match room
            io.to(`match_${matchId}`).emit('match_blocked', { matchId });
            break;
          }

          case 'report':
            // Handle reporting (would integrate with moderation system)
            socket.emit('match_reported', { matchId });
            break;

          default:
            socket.emit('error', { message: 'Invalid match action' });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Match action error:', { error: errorMessage });
        socket.emit('error', { message: 'Failed to perform match action' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason: string) => {
      logger.info(`User disconnected`, { userId, reason, userName: user?.firstName });

      // Update user presence
      updateUserPresence(userId, socket.id, false);

      // Update last seen time
      const User = require('../models/User').default;
      User.findByIdAndUpdate(userId, {
        'analytics.lastActive': new Date()
      }).catch((error) => logger.error('Presence update error:', { error }));

      // Notify all match rooms that user went offline
      socket.rooms.forEach(room => {
        if (room.startsWith('match_')) {
          socket.to(room).emit('user_offline', {
            userId,
            offlineAt: new Date()
          });
        }
      });
    });

    // Handle connection errors
    socket.on('error', (error: Error) => {
      logger.error('Socket error for user', { userId, error });
    });
  });

  return io;
}

// Helper functions for presence and typing management
function updateUserPresence(userId: string, socketId: string, isOnline: boolean): void {
  if (isOnline) {
    onlineUsers.set(userId, {
      socketId,
      lastSeen: new Date(),
      isOnline: true
    });
  } else {
    const presence = onlineUsers.get(userId);
    if (presence && presence.socketId === socketId) {
      presence.isOnline = false;
      presence.lastSeen = new Date();
    }
  }
}

function setTypingStatus(matchId: string, userId: string, userName: string): void {
  if (!typingUsers.has(matchId)) {
    typingUsers.set(matchId, new Map());
  }

  const matchTyping = typingUsers.get(matchId)!;

  // Clear existing timeout if any
  if (matchTyping.has(userId)) {
    clearTimeout(matchTyping.get(userId)!.timeout);
  }

  // Set typing with 5-second timeout
  const timeout = setTimeout(() => {
    clearTypingStatus(matchId, userId);
  }, 5000);

  matchTyping.set(userId, {
    timestamp: Date.now(),
    userName,
    timeout
  });
}

function clearTypingStatus(matchId: string, userId: string): void {
  const matchTyping = typingUsers.get(matchId);
  if (matchTyping && matchTyping.has(userId)) {
    clearTimeout(matchTyping.get(userId)!.timeout);
    matchTyping.delete(userId);

    // Clean up empty match typing maps
    if (matchTyping.size === 0) {
      typingUsers.delete(matchId);
    }
  }
}

// Export helper functions for external use
(chatSocket as any).getOnlineUsers = (): Array<{ userId: string; lastSeen: Date }> => {
  return Array.from(onlineUsers.entries())
    .filter(([, presence]) => presence.isOnline)
    .map(([userId, presence]) => ({
      userId,
      lastSeen: presence.lastSeen
    }));
};

(chatSocket as any).getTypingUsers = (matchId: string): Array<{ userId: string; userName: string; timestamp: number }> => {
  const matchTyping = typingUsers.get(matchId);
  if (!matchTyping) return [];

  return Array.from(matchTyping.entries())
    .filter(([, data]) => data.timestamp > Date.now() - 5000)
    .map(([userId, data]) => ({
      userId,
      userName: data.userName,
      timestamp: data.timestamp
    }));
};
