/**
 * Chat Socket Service for PawfectMatch
 * Real-time chat functionality with Socket.IO
 */

import jwt from 'jsonwebtoken';
import { Server as SocketIOServer, Socket } from 'socket.io';
import Match from '../models/Match';
import User from '../models/User';
import logger from '../utils/logger';

interface OnlineUser {
  socketId: string;
  lastSeen: Date;
  isOnline: boolean;
}

interface TypingUser {
  timestamp: number;
  userName: string;
  timeout: NodeJS.Timeout;
}

interface ChatSocketData {
  matchId: string;
  content?: string;
  messageType?: string;
  attachments?: any[];
  replyTo?: string;
  messageId?: string;
  emoji?: string;
  isTyping?: boolean;
  action?: string;
}

interface AuthenticatedSocket extends Socket {
  userId: string;
  user: any;
}

const chatSocket = (io: SocketIOServer) => {
  // In-memory storage for presence and typing (in production, use Redis)
  const onlineUsers = new Map<string, OnlineUser>();
  const typingUsers = new Map<string, Map<string, TypingUser>>();

  // Middleware to authenticate socket connections
  io.use(async (socket: Socket, next) => {
    try {
      const token = (socket.handshake.auth as any).token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env['JWT_SECRET'] || '') as any;
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');

      if (!user || !user.isActive || user.isBlocked) {
        return next(new Error('Authentication error: Invalid user'));
      }

      (socket as AuthenticatedSocket).userId = user._id.toString();
      (socket as AuthenticatedSocket).user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', { error });
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.user.firstName} connected`, { socketId: socket.id, userId: socket.userId });

    // Update user presence
    updateUserPresence(socket.userId, socket.id, true);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining match rooms
    socket.on('join_match', async (matchId: string) => {
      try {
        // Verify user is part of this match
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
          ]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found or access denied' });
          return;
        }

        // Check if match is blocked
        if (match.isUserBlocked(socket.userId)) {
          socket.emit('error', { message: 'Cannot join blocked match' });
          return;
        }

        socket.join(`match_${matchId}`);
        logger.info(`User joined match`, { userId: socket.userId, matchId });

        // Mark messages as read
        await match.markMessagesAsRead(socket.userId);

        // Notify other user that this user is online
        socket.to(`match_${matchId}`).emit('user_online', {
          userId: socket.userId,
          userName: socket.user.firstName,
          onlineAt: new Date()
        });

        // Send current typing status
        const matchTyping = typingUsers.get(matchId);
        if (matchTyping) {
          const activeTyping = Array.from(matchTyping.entries())
            .filter(([userId, data]) => userId !== socket.userId && data.timestamp > Date.now() - 5000)
            .map(([userId, data]) => ({
              userId,
              userName: data.userName,
              timestamp: data.timestamp
            }));

          if (activeTyping.length > 0) {
            socket.emit('typing_status', { matchId, typing: activeTyping });
          }
        }

      } catch (error) {
        logger.error('Join match error:', { error });
        socket.emit('error', { message: 'Failed to join match' });
      }
    });

    // Handle leaving match rooms
    socket.on('leave_match', (matchId: string) => {
      socket.leave(`match_${matchId}`);

      // Notify other user that this user went offline
      socket.to(`match_${matchId}`).emit('user_offline', {
        userId: socket.userId,
        offlineAt: new Date()
      });

      logger.info(`User left match`, { userId: socket.userId, matchId });
    });

    // Handle sending messages
    socket.on('send_message', async (data: ChatSocketData) => {
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
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
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

        if (match.isUserBlocked(socket.userId)) {
          socket.emit('error', { message: 'Cannot send message to blocked match' });
          return;
        }

        // Validate replyTo if provided
        if (replyTo) {
          const replyMessage = match.messages.id(replyTo);
          if (!replyMessage) {
            socket.emit('error', { message: 'Reply message not found' });
            return;
          }
        }

        // Add message to match
        const message = {
          sender: socket.userId,
          content: content.trim(),
          messageType,
          attachments,
          replyTo,
          sentAt: new Date(),
          readBy: [{
            user: socket.userId,
            readAt: new Date()
          }],
          status: 'sent',
          reactions: []
        };

        match.messages.push(message);
        match.lastActivity = new Date();
        match.lastMessageAt = new Date();
        await match.save();

        // Get the saved message with populated sender
        const savedMessage = match.messages[match.messages.length - 1];
        savedMessage.sender = socket.user;

        // Populate replyTo if present
        if (replyTo) {
          const replyMessage = match.messages.id(replyTo);
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
        const otherUserId = match.user1._id.toString() === socket.userId
          ? match.user2._id.toString()
          : match.user1._id.toString();

        const otherUserSockets = await io.in(`user_${otherUserId}`).fetchSockets();

        if (otherUserSockets.length === 0) {
          // Other user is offline, send push notification
          const otherUser = match.user1._id.toString() === socket.userId ? match.user2 : match.user1;

          if (otherUser.preferences.notifications.messages) {
            // Here you would integrate with a push notification service
            // For now, we'll emit to their user room in case they connect
            io.to(`user_${otherUserId}`).emit('notification', {
              type: 'new_message',
              title: `New message from ${socket.user.firstName}`,
              body: content.substring(0, 100),
              matchId,
              senderId: socket.userId,
              messageId: savedMessage._id
            });
          }
        }

        logger.info(`Message sent in match`, { userId: socket.userId, matchId });

      } catch (error) {
        logger.error('Send message error:', { error });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle editing messages
    socket.on('edit_message', async (data: ChatSocketData) => {
      try {
        const { matchId, messageId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: socket.userId }, { user2: socket.userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = match.messages.id(messageId);
        if (!message || message.sender.toString() !== socket.userId) {
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
        await message.populate('sender', 'firstName lastName avatar');

        // Emit update to match room
        io.to(`match_${matchId}`).emit('message_edited', {
          matchId,
          messageId,
          message
        });

      } catch (error) {
        logger.error('Edit message error:', { error });
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle deleting messages
    socket.on('delete_message', async (data: ChatSocketData) => {
      try {
        const { matchId, messageId } = data;

        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: socket.userId }, { user2: socket.userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = match.messages.id(messageId);
        if (!message || message.sender.toString() !== socket.userId) {
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
        logger.error('Delete message error:', { error });
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle adding reactions
    socket.on('add_reaction', async (data: ChatSocketData) => {
      try {
        const { matchId, messageId, emoji } = data;

        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: socket.userId }, { user2: socket.userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = match.messages.id(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find((r: any) =>
          r.user.toString() === socket.userId && r.emoji === emoji
        );

        if (existingReaction) {
          socket.emit('error', { message: 'Already reacted with this emoji' });
          return;
        }

        // Add reaction
        message.reactions.push({
          user: socket.userId,
          emoji,
          reactedAt: new Date()
        });

        await match.save();

        // Populate reaction user
        const newReaction = message.reactions[message.reactions.length - 1];
        await newReaction.populate('user', 'firstName lastName avatar');

        // Emit reaction to match room
        io.to(`match_${matchId}`).emit('reaction_added', {
          matchId,
          messageId,
          reaction: newReaction
        });

      } catch (error) {
        logger.error('Add reaction error:', { error });
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle removing reactions
    socket.on('remove_reaction', async (data: ChatSocketData) => {
      try {
        const { matchId, messageId, emoji } = data;

        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: socket.userId }, { user2: socket.userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = match.messages.id(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Find and remove reaction
        const reactionIndex = message.reactions.findIndex((r: any) =>
          r.user.toString() === socket.userId && r.emoji === emoji
        );

        if (reactionIndex === -1) {
          socket.emit('error', { message: 'Reaction not found' });
          return;
        }

        message.reactions.splice(reactionIndex, 1);
        await match.save();

        // Emit reaction removal to match room
        io.to(`match_${matchId}`).emit('reaction_removed', {
          matchId,
          messageId,
          userId: socket.userId,
          emoji
        });

      } catch (error) {
        logger.error('Remove reaction error:', { error });
        socket.emit('error', { message: 'Failed to remove reaction' });
      }
    });

    // Handle typing indicators with timeout
    socket.on('typing', (data: ChatSocketData) => {
      const { matchId, isTyping } = data;

      if (isTyping) {
        // Set typing status with 5-second timeout
        setTypingStatus(matchId, socket.userId, socket.user.firstName);

        // Emit typing status to match room (excluding sender)
        socket.to(`match_${matchId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.firstName,
          isTyping: true,
          timestamp: Date.now()
        });
      } else {
        // Clear typing status
        clearTypingStatus(matchId, socket.userId);

        // Emit typing stopped to match room
        socket.to(`match_${matchId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.firstName,
          isTyping: false,
          timestamp: Date.now()
        });
      }
    });

    // Handle message read receipts
    socket.on('mark_messages_read', async (data: ChatSocketData) => {
      try {
        const { matchId } = data;

        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
          ]
        });

        if (match) {
          await match.markMessagesAsRead(socket.userId);

          // Notify other user that messages were read
          socket.to(`match_${matchId}`).emit('messages_read', {
            userId: socket.userId,
            readAt: new Date()
          });
        }

      } catch (error) {
        logger.error('Mark messages read error:', { error });
      }
    });

    // Handle match actions (archive, block, favorite, etc.)
    socket.on('match_action', async (data: ChatSocketData) => {
      try {
        const { matchId, action } = data;

        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
          ]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        switch (action) {
          case 'archive':
            await match.toggleArchive(socket.userId);
            socket.emit('match_archived', { matchId });
            socket.to(`match_${matchId}`).emit('match_updated', { matchId, action: 'archived' });
            break;

          case 'unarchive':
            await match.toggleArchive(socket.userId);
            socket.emit('match_unarchived', { matchId });
            socket.to(`match_${matchId}`).emit('match_updated', { matchId, action: 'unarchived' });
            break;

          case 'favorite':
            await match.toggleFavorite(socket.userId);
            socket.emit('match_favorited', { matchId });
            break;

          case 'unfavorite':
            await match.toggleFavorite(socket.userId);
            socket.emit('match_unfavorited', { matchId });
            break;

          case 'block': {
            const userKey = match.user1.toString() === socket.userId ? 'user1' : 'user2';
            match.userActions[userKey].isBlocked = true;
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
        logger.error('Match action error:', { error });
        socket.emit('error', { message: 'Failed to perform match action' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason: string) => {
      logger.info(`User disconnected`, { userId: socket.userId, reason, userName: socket.user?.firstName });

      // Update user presence
      updateUserPresence(socket.userId, socket.id, false);

      // Update last seen time
      User.findByIdAndUpdate(socket.userId, {
        'analytics.lastActive': new Date()
      }).catch((error) => logger.error('Presence update error:', { error }));

      // Notify all match rooms that user went offline
      socket.rooms.forEach(room => {
        if (room.startsWith('match_')) {
          socket.to(room).emit('user_offline', {
            userId: socket.userId,
            offlineAt: new Date()
          });
        }
      });
    });

    // Handle connection errors
    socket.on('error', (error: Error) => {
      logger.error('Socket error for user', { userId: socket.userId, error });
    });
  });

  return io;
};

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
(chatSocket as any).getOnlineUsers = () => {
  return Array.from(onlineUsers.entries())
    .filter(([, presence]) => presence.isOnline)
    .map(([userId, presence]) => ({
      userId,
      lastSeen: presence.lastSeen
    }));
};

(chatSocket as any).getTypingUsers = (matchId: string) => {
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

export default chatSocket;
