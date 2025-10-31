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
  auth?: {
    token?: string;
    userId?: string;
    isAdmin?: boolean;
  };
  headers?: {
    cookie?: string;
    [key: string]: string | string[] | undefined;
  };
  token?: string; // Legacy support
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

interface MessageAttachment {
  url?: string;
  type?: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
}

interface MessageData {
  matchId: string;
  content: string;
  messageType?: string;
  attachments?: MessageAttachment[];
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
  // SECURITY: Supports both token-based (legacy) and cookie-based (httpOnly) authentication
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      // SECURITY: Try to get token from auth first (legacy support)
      let token = (socket.handshake.auth as { token?: string })?.token;

      // SECURITY: If no token in auth, try to get from cookies (httpOnly cookie support)
      // Socket.IO automatically includes cookies in handshake.headers if CORS credentials enabled
      if (!token) {
        try {
          const cookieHeader = socket.handshake.headers.cookie as string | undefined;
          if (cookieHeader) {
            // Parse cookies manually (no cookie-parser dependency)
            const map: Record<string, string> = Object.create(null);
            for (const part of cookieHeader.split(';')) {
              const [k, ...v] = part.trim().split('=');
              if (!k) continue;
              map[decodeURIComponent(k)] = decodeURIComponent(v.join('='));
            }
            token = map['accessToken'] || map['access_token'] || map['pm_access'] || null;
          }
        } catch (cookieError) {
          // Ignore cookie parsing errors, fall through to token check
          logger.debug('Cookie parsing error in socket auth', { error: cookieError });
        }
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided (check token or cookies)'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const User = require('../models/User').default;
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');

      if (!user || !user.isActive || user.isBlocked) {
        return next(new Error('Authentication error: Invalid user'));
      }

      interface AuthenticatedSocket extends Socket {
        userId?: string;
        user?: SocketUser;
      }
      const authenticatedSocket = socket as AuthenticatedSocket;
      authenticatedSocket.userId = user._id.toString();
      authenticatedSocket.user = user;
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Socket authentication error:', { error: errorMessage });
      next(new Error('Authentication error'));
    }
  });

  interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: SocketUser;
  }
  
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    const userId = socket.userId;
    
    if (!user || !userId) {
      logger.error('Socket connection missing user data', { socketId: socket.id });
      socket.disconnect();
      return;
    }

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
        interface MatchWithMethods {
          isUserBlocked?: (userId: string) => boolean;
          markMessagesAsRead?: (userId: string) => Promise<unknown>;
        }
        const matchWithMethods = match as unknown as MatchWithMethods;
        
        if (matchWithMethods.isUserBlocked && matchWithMethods.isUserBlocked(userId)) {
          socket.emit('error', { message: 'Cannot join blocked match' });
          return;
        }

        socket.join(`match_${matchId}`);
        logger.info(`User joined match`, { userId, matchId });

        // Mark messages as read
        if (matchWithMethods.markMessagesAsRead) {
          await matchWithMethods.markMessagesAsRead(userId);
        }

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

        interface MatchWithMessages extends MatchWithMethods {
          messages?: {
            id: (messageId: string) => { _id?: { toString: () => string } | string } | null;
            push: (message: unknown) => number;
            length: number;
            filter: (predicate: (msg: unknown) => boolean) => unknown[];
            [index: number]: {
              _id?: { toString: () => string } | string;
              sender?: { toString: () => string } | string;
              content?: string;
              readBy?: Array<{ user: { toString: () => string } | string }>;
              populate?: (fields: string, select: string) => Promise<unknown>;
              reactions?: Array<{
                user?: { toString: () => string } | string;
                emoji?: string;
              }>;
              find?: (predicate: (r: unknown) => boolean) => unknown | undefined;
              findIndex?: (predicate: (r: unknown) => boolean) => number;
              push?: (reaction: unknown) => number;
              splice?: (start: number, deleteCount: number) => unknown[];
              length?: number;
            };
          };
          lastActivity?: Date;
          lastMessageAt?: Date;
          save: () => Promise<unknown>;
        }
        const matchWithMessages = match as unknown as MatchWithMessages;
        
        if (matchWithMessages.isUserBlocked && matchWithMessages.isUserBlocked(userId)) {
          socket.emit('error', { message: 'Cannot send message to blocked match' });
          return;
        }

        // Validate replyTo if provided
        if (replyTo && matchWithMessages.messages) {
          const replyMessage = matchWithMessages.messages.id(replyTo);
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
          status: 'sent', // sent → delivered → read
          reactions: []
        };

        if (matchWithMessages.messages) {
          matchWithMessages.messages.push(message);
        }
        matchWithMessages.lastActivity = new Date();
        matchWithMessages.lastMessageAt = new Date();
        await matchWithMessages.save();

        // Get the saved message with populated sender
        const savedMessage = matchWithMessages.messages && matchWithMessages.messages.length > 0
          ? matchWithMessages.messages[matchWithMessages.messages.length - 1]
          : null;
        savedMessage.sender = user;

        // Populate replyTo if present
        if (replyTo && matchWithMessages.messages) {
          const replyMessage = matchWithMessages.messages.id(replyTo);
          if (replyMessage) {
            const replyMsgId = typeof replyMessage._id === 'string' ? replyMessage._id : replyMessage._id?.toString();
            savedMessage.replyTo = {
              _id: replyMsgId,
              sender: replyMessage.sender,
              content: replyMessage.content,
              messageType: replyMessage.messageType
            };
          }
        }

        // Check if recipient is online
        const otherUserId = match.user1._id.toString() === userId
          ? match.user2._id.toString()
          : match.user1._id.toString();

        const otherUserSockets = await io.in(`user_${otherUserId}`).fetchSockets();
        const isRecipientOnline = otherUserSockets.length > 0;

        // Update message status based on recipient online status
        if (isRecipientOnline) {
          savedMessage.status = 'delivered';
        } else {
          savedMessage.status = 'sent';
        }

        // Emit message with status to sender first
        socket.emit('message_sent', {
          matchId,
          messageId: savedMessage._id.toString(),
          message: savedMessage
        });

        // Emit message to all users in the match room (including sender for delivered status)
        io.to(`match_${matchId}`).emit('new_message', {
          matchId,
          message: savedMessage
        });

        // If recipient is online, emit delivered status to sender
        if (isRecipientOnline) {
          socket.emit('message_delivered', {
            matchId,
            messageId: savedMessage._id.toString(),
            deliveredAt: new Date()
          });
        }

        // Send push notification to other user if they're offline
        const otherUserId = match.user1._id.toString() === userId
          ? match.user2._id.toString()
          : match.user1._id.toString();

        const otherUserSockets = await io.in(`user_${otherUserId}`).fetchSockets();

        if (otherUserSockets.length === 0) {
          // Other user is offline, send push notification
          const otherUser = match.user1._id.toString() === userId ? match.user2 : match.user1;

          interface UserWithPreferences {
            preferences?: {
              notifications?: {
                messages?: boolean;
              };
            };
          }
          const userWithPrefs = otherUser as unknown as UserWithPreferences;

          if (userWithPrefs.preferences?.notifications?.messages) {
            // Check if user has quiet hours enabled
            try {
              const NotificationPreference = (await import('../models/NotificationPreference')).default;
              const notificationPrefs = await NotificationPreference.findOne({ userId: otherUserId });

              if (notificationPrefs && notificationPrefs.quietHours?.enabled) {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                const { quietHours } = notificationPrefs;

                const [startHour, startMin] = quietHours.start.split(':').map(Number);
                const [endHour, endMin] = quietHours.end.split(':').map(Number);
                const startTime = startHour * 60 + startMin;
                const endTime = endHour * 60 + endMin;
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                let isQuietHours = false;
                if (startTime > endTime) {
                  isQuietHours = currentMinutes >= startTime || currentMinutes < endTime;
                } else {
                  isQuietHours = currentMinutes >= startTime && currentMinutes < endTime;
                }

                if (isQuietHours) {
                  logger.info('Skipping push notification due to quiet hours', { otherUserId });
                  return;
                }
              }

              // Send push notification via FCM
              // Phase 1: Use rich push notifications if enabled
              try {
                const { sendConversationPreview } = await import('../services/richPushNotificationService');
                await sendConversationPreview(
                  otherUserId,
                  matchId,
                  user.firstName || 'Someone',
                  content.substring(0, 100),
                  user.avatar
                );
              } catch {
                // Fallback to basic push
                const { sendPushToUser } = await import('../services/pushNotificationService');
                await sendPushToUser(otherUserId, {
                  title: `New message from ${user.firstName}`,
                  body: content.substring(0, 100),
                  data: {
                    type: 'new_message',
                    matchId,
                    senderId: userId,
                    messageId: savedMessage._id.toString(),
                  },
                });
              }
            } catch (pushError) {
              logger.error('Failed to send push notification', {
                error: pushError instanceof Error ? pushError.message : 'Unknown error',
                otherUserId,
              });
            }

            // Also emit to their user room in case they connect
            io.to(`user_${otherUserId}`).emit('notification', {
              type: 'new_message',
              title: `New message from ${user.firstName}`,
              body: content.substring(0, 100),
              matchId,
              senderId: userId,
              messageId: savedMessage._id,
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

        const matchWithMessages = match as unknown as MatchWithMessages;
        
        if (!matchWithMessages.messages) {
          socket.emit('error', { message: 'Match has no messages' });
          return;
        }
        
        const message = matchWithMessages.messages.id(messageId);
        if (!message || typeof message.sender === 'string' ? message.sender !== userId : message.sender?.toString() !== userId) {
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
        interface MessageWithPopulate {
          populate?: (fields: string, select: string) => Promise<unknown>;
          sender?: unknown;
          content?: string;
          isEdited?: boolean;
          editedAt?: Date;
          sentAt?: Date;
        }
        const messageWithPopulate = message as unknown as MessageWithPopulate;
        if (messageWithPopulate.populate) {
          await messageWithPopulate.populate('sender', 'firstName lastName avatar');
        }

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

        const matchWithMessages = match as unknown as MatchWithMessages;
        
        if (!matchWithMessages.messages) {
          socket.emit('error', { message: 'Match has no messages' });
          return;
        }
        
        const message = matchWithMessages.messages.id(messageId);
        if (!message || typeof message.sender === 'string' ? message.sender !== userId : message.sender?.toString() !== userId) {
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

        const matchWithMessages = match as unknown as MatchWithMessages;
        
        if (!matchWithMessages.messages) {
          socket.emit('error', { message: 'Match has no messages' });
          return;
        }
        
        const message = matchWithMessages.messages.id(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        interface MessageWithReactions {
          reactions?: Array<{
            user?: { toString: () => string } | string;
            emoji?: string;
            reactedAt?: Date;
            populate?: (fields: string, select: string) => Promise<unknown>;
          }>;
          find?: (predicate: (r: unknown) => boolean) => unknown | undefined;
          findIndex?: (predicate: (r: unknown) => boolean) => number;
          push?: (reaction: unknown) => number;
          splice?: (start: number, deleteCount: number) => unknown[];
          length?: number;
        }
        
        const messageWithReactions = message as unknown as MessageWithReactions;
        
        if (!messageWithReactions.reactions) {
          messageWithReactions.reactions = [];
        }
        
        // Check if user already reacted with this emoji
        const existingReaction = messageWithReactions.reactions.find((r) => {
          const rUserId = typeof r.user === 'string' ? r.user : r.user?.toString();
          return rUserId === userId && r.emoji === emoji;
        });

        if (existingReaction) {
          socket.emit('error', { message: 'Already reacted with this emoji' });
          return;
        }

        // Add reaction
        const reaction = {
          user: userId,
          emoji,
          reactedAt: new Date()
        };
        
        if (messageWithReactions.reactions.push) {
          messageWithReactions.reactions.push(reaction);
        } else {
          messageWithReactions.reactions = [...messageWithReactions.reactions, reaction];
        }

        await match.save();

        // Populate reaction user
        const reactionsLength = messageWithReactions.reactions.length || 0;
        const newReaction = reactionsLength > 0 ? messageWithReactions.reactions[reactionsLength - 1] : null;
        if (newReaction && newReaction.populate) {
          await newReaction.populate('user', 'firstName lastName avatar');
        }

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

        const matchWithMessages = match as unknown as MatchWithMessages;
        
        if (!matchWithMessages.messages) {
          socket.emit('error', { message: 'Match has no messages' });
          return;
        }
        
        const message = matchWithMessages.messages.id(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }
        
        interface MessageWithReactions {
          reactions?: Array<{
            user?: { toString: () => string } | string;
            emoji?: string;
          }>;
          findIndex?: (predicate: (r: unknown) => boolean) => number;
          splice?: (start: number, deleteCount: number) => unknown[];
        }
        
        const messageWithReactions = message as unknown as MessageWithReactions;
        
        if (!messageWithReactions.reactions) {
          socket.emit('error', { message: 'Message has no reactions' });
          return;
        }
        
        // Find and remove reaction
        const reactionIndex = messageWithReactions.reactions.findIndex((r) => {
          const rUserId = typeof r.user === 'string' ? r.user : r.user?.toString();
          return rUserId === userId && r.emoji === emoji;
        });

        if (reactionIndex === -1) {
          socket.emit('error', { message: 'Reaction not found' });
          return;
        }

        if (messageWithReactions.reactions.splice) {
          messageWithReactions.reactions.splice(reactionIndex, 1);
        } else {
          messageWithReactions.reactions = messageWithReactions.reactions.filter((_, idx) => idx !== reactionIndex);
        }
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
    // Business Model: Read receipts are Premium+ feature (business.md)
    socket.on('mark_messages_read', async (data: MarkReadData) => {
      try {
        const { matchId } = data;

        // Check premium status for read receipts - Premium+ required
        const User = require('../models/User').default;
        const user = await User.findById(userId);
        
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const hasReadReceipts = user.premium?.isActive &&
          (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
          (user.premium.plan?.toLowerCase() === 'premium' || user.premium.plan?.toLowerCase() === 'ultimate') &&
          user.premium.features?.readReceipts;

        if (!hasReadReceipts) {
          socket.emit('error', {
            message: 'Premium subscription required: Read receipts are available for Premium subscribers ($9.99/month)',
            code: 'PREMIUM_FEATURE_REQUIRED',
            requiredFeature: 'readReceipts',
            upgradeRequired: true
          });
          return;
        }

        const Match = require('../models/Match').default;
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        });

        if (match) {
          const matchWithMessages = match as unknown as MatchWithMessages;
          
          if (!matchWithMessages.messages) {
            return;
          }
          
          interface UnreadMessage {
            _id?: { toString: () => string } | string;
            sender?: { toString: () => string } | string;
            readBy?: Array<{ user?: { toString: () => string } | string }>;
            status?: string;
          }
          
          const unreadMessages = matchWithMessages.messages.filter((msg) => {
            const msgWithReadBy = msg as unknown as UnreadMessage;
            const senderId = typeof msgWithReadBy.sender === 'string' ? msgWithReadBy.sender : msgWithReadBy.sender?.toString();
            const isOwnMessage = senderId === userId;
            const isRead = (msgWithReadBy.readBy || []).some((r) => {
              const rUserId = typeof r.user === 'string' ? r.user : r.user?.toString();
              return rUserId === userId;
            });
            return !isOwnMessage && !isRead;
          }) as unknown as UnreadMessage[];

          if (matchWithMessages.markMessagesAsRead) {
            await matchWithMessages.markMessagesAsRead(userId);
          }

          // Update message status to 'read' for unread messages
          const messageIds: string[] = [];
          for (const msg of unreadMessages) {
            msg.status = 'read';
            const msgId = typeof msg._id === 'string' ? msg._id : msg._id?.toString();
            if (msgId) {
              messageIds.push(msgId);
            }
          }

          if (messageIds.length > 0) {
            await match.save();

            // Notify sender that their messages were read
            const otherUserId = match.user1._id.toString() === userId
              ? match.user2._id.toString()
              : match.user1._id.toString();

            io.to(`user_${otherUserId}`).emit('messages_read', {
              matchId,
              messageIds,
              readBy: userId,
              readAt: new Date()
            });
          }

          // Notify other user in match room that messages were read
          socket.to(`match_${matchId}`).emit('messages_read', {
            userId,
            messageIds,
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

        const matchWithMethods = match as unknown as MatchWithMethods;

        switch (action) {
          case 'archive':
            if (matchWithMethods.toggleArchive) {
              await matchWithMethods.toggleArchive(userId);
            }
            socket.emit('match_archived', { matchId });
            socket.to(`match_${matchId}`).emit('match_updated', { matchId, action: 'archived' });
            break;

          case 'unarchive':
            if (matchWithMethods.toggleArchive) {
              await matchWithMethods.toggleArchive(userId);
            }
            socket.emit('match_unarchived', { matchId });
            socket.to(`match_${matchId}`).emit('match_updated', { matchId, action: 'unarchived' });
            break;

          case 'favorite':
            if (matchWithMethods.toggleFavorite) {
              await matchWithMethods.toggleFavorite(userId);
            }
            socket.emit('match_favorited', { matchId });
            break;

          case 'unfavorite':
            if (matchWithMethods.toggleFavorite) {
              await matchWithMethods.toggleFavorite(userId);
            }
            socket.emit('match_unfavorited', { matchId });
            break;

          case 'block': {
            interface MatchWithUserActions {
              userActions?: {
                user1?: { isBlocked?: boolean };
                user2?: { isBlocked?: boolean };
              };
              user1?: { toString: () => string } | string;
              user2?: { toString: () => string } | string;
              save: () => Promise<unknown>;
            }
            const matchWithUserActions = match as unknown as MatchWithUserActions;
            const userKey = typeof matchWithUserActions.user1 === 'string' 
              ? (matchWithUserActions.user1 === userId ? 'user1' : 'user2')
              : (matchWithUserActions.user1?.toString() === userId ? 'user1' : 'user2');
            
            if (matchWithUserActions.userActions) {
              if (userKey === 'user1') {
                matchWithUserActions.userActions.user1 = matchWithUserActions.userActions.user1 || {};
                matchWithUserActions.userActions.user1.isBlocked = true;
              } else {
                matchWithUserActions.userActions.user2 = matchWithUserActions.userActions.user2 || {};
                matchWithUserActions.userActions.user2.isBlocked = true;
              }
              await matchWithUserActions.save();
            }
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
// Export helper functions
interface ChatSocketModule {
  getOnlineUsers: () => Array<{ userId: string; lastSeen: Date }>;
  getTypingUsers: (matchId: string) => Array<{ userId: string; userName: string; timestamp: number }>;
}

const chatSocketModule = chatSocket as unknown as ChatSocketModule;
chatSocketModule.getOnlineUsers = (): Array<{ userId: string; lastSeen: Date }> => {
  return Array.from(onlineUsers.entries())
    .filter(([, presence]) => presence.isOnline)
    .map(([userId, presence]) => ({
      userId,
      lastSeen: presence.lastSeen
    }));
};

chatSocketModule.getTypingUsers = (matchId: string): Array<{ userId: string; userName: string; timestamp: number }> => {
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
