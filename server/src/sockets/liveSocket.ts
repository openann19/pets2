import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import logger from "../utils/logger";
import { LiveStream } from "../models/LiveStream";

interface SocketUser {
  id: string;
  socketId: string;
  isOwner?: boolean;
}

interface AuthenticatedLiveSocket extends Socket {
  user: SocketUser;
}

interface JwtDecoded extends JwtPayload {
  userId?: string;
  id?: string;
}

interface LiveMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  reactions?: Array<{ emoji: string; count: number }>;
}

interface Gift {
  id: string;
  userId: string;
  giftType: string;
  value: number;
  message?: string;
  timestamp: Date;
}

interface DataChannelReaction {
  type: "reaction";
  emoji: string;
  userId: string;
  timestamp: Date;
}

export default function liveSocket(io: SocketIOServer): SocketIOServer {
  // Live streaming namespace
  const liveNamespace = io.of(/^\/live:/);
  
  // Message rate limiting tracking per user
  const messageCounts = new Map<string, { count: number; lastReset: number }>();
  const MESSAGE_LIMIT = 30; // 30 messages per minute
  const MESSAGE_WINDOW = 60 * 1000; // 1 minute

  liveNamespace.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as JwtDecoded;
      (socket as AuthenticatedLiveSocket).user = {
        id: decoded.userId || decoded.id || '',
        socketId: socket.id,
      } as SocketUser;
      next();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Live socket auth error", { error: errorMessage });
      next(new Error("Authentication failed"));
    }
  });

  liveNamespace.on("connection", (socket: AuthenticatedLiveSocket) => {
    const user = socket.user;
    const roomName = socket.nsp.name.replace("/live:", "");

    logger.info("Live stream client connected", { userId: user.id, roomName });

    // Join live stream room
    socket.join(roomName);

    // Load stream and check if user is owner
    LiveStream.findOne({ roomName })
      .then((stream) => {
        if (stream) {
          user.isOwner = String(stream.ownerId) === user.id;

          // Emit initial state
          socket.emit("live:state", {
            title: stream.title,
            viewers: stream.viewers,
            isOwner: user.isOwner,
            pinnedMessages: stream.pinnedMessages,
            totalGifts: stream.totalGifts,
          });
        }
      })
      .catch((error) => {
        logger.error("Failed to load stream", { error, roomName });
      });

    // Handle chat messages in live stream with rate limiting
    socket.on("live:message", async (data: { content: string }) => {
      try {
        // Rate limiting: check if user has exceeded message limit
        const now = Date.now();
        const userKey = `${user.id}:${roomName}`;
        const tracker = messageCounts.get(userKey);
        
        if (!tracker || now - tracker.lastReset > MESSAGE_WINDOW) {
          // Reset window
          messageCounts.set(userKey, { count: 1, lastReset: now });
        } else if (tracker.count >= MESSAGE_LIMIT) {
          // Rate limit exceeded
          socket.emit("error", { 
            message: "Message rate limit exceeded. Please slow down.",
            retryAfter: Math.ceil((MESSAGE_WINDOW - (now - tracker.lastReset)) / 1000)
          });
          logger.warn("Message rate limit exceeded", { userId: user.id, count: tracker.count });
          return;
        } else {
          // Increment count
          tracker.count++;
        }

        // Validate content length
        if (!data.content || data.content.trim().length === 0) {
          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }
        
        if (data.content.length > 500) {
          socket.emit("error", { message: "Message too long (max 500 characters)" });
          return;
        }

        const message: LiveMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          userId: user.id,
          content: data.content.trim(),
          timestamp: new Date(),
        };

        // Broadcast to all viewers in the room
        liveNamespace.to(roomName).emit("live:message", message);

        logger.debug("Live chat message sent", { userId: user.id, roomName });
      } catch (error) {
        logger.error("Error handling live message", { error, userId: user.id });
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle gifts
    socket.on("live:gift", async (data: { giftType: string; value: number; message?: string }) => {
      try {
        const stream = await LiveStream.findOne({ roomName });
        if (!stream) {
          socket.emit("error", { message: "Stream not found" });
          return;
        }

        const gift: Gift = {
          id: `gift_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          userId: user.id,
          giftType: data.giftType,
          value: data.value,
          message: data.message,
          timestamp: new Date(),
        };

        // Update total gifts
        stream.totalGifts += data.value;
        await stream.save();

        // Broadcast gift to all viewers
        liveNamespace.to(roomName).emit("live:gift", gift);

        logger.info("Live gift sent", { userId: user.id, giftType: data.giftType, value: data.value });

        // Special notification for high-value gifts
        if (data.value >= 100) {
          liveNamespace.to(roomName).emit("live:gift:highlight", gift);
        }
      } catch (error) {
        logger.error("Error handling live gift", { error, userId: user.id });
        socket.emit("error", { message: "Failed to send gift" });
      }
    });

    // Handle live reactions via Socket.IO (alternative to data channel)
    socket.on("live:reaction", async (data: { emoji: string }) => {
      try {
        const reaction = {
          emoji: data.emoji,
          userId: user.id,
          timestamp: new Date(),
        };

        // Broadcast to all viewers except sender
        socket.to(roomName).emit("live:reaction", reaction);

        logger.debug("Live reaction sent", { userId: user.id, emoji: data.emoji, roomName });
      } catch (error) {
        logger.error("Error handling live reaction", { error, userId: user.id });
      }
    });

    // Handle pinning messages (owner only)
    socket.on("live:pin", async (data: { messageId: string; content: string }) => {
      try {
        const stream = await LiveStream.findOne({ roomName });
        if (!stream) {
          socket.emit("error", { message: "Stream not found" });
          return;
        }

        // Check if user is owner
        if (String(stream.ownerId) !== user.id) {
          socket.emit("error", { message: "Only owner can pin messages" });
          return;
        }

        // Add pinned message
        stream.pinnedMessages.push({
          messageId: data.messageId,
          authorId: user.id,
          content: data.content,
          timestamp: new Date(),
        });

        // Limit to last 5 pinned messages
        if (stream.pinnedMessages.length > 5) {
          stream.pinnedMessages = stream.pinnedMessages.slice(-5);
        }

        await stream.save();

        // Broadcast pinned message update
        liveNamespace.to(roomName).emit("live:pinned:updated", {
          pinnedMessages: stream.pinnedMessages,
        });

        logger.info("Message pinned", { userId: user.id, messageId: data.messageId });
      } catch (error) {
        logger.error("Error pinning message", { error, userId: user.id });
        socket.emit("error", { message: "Failed to pin message" });
      }
    });

    // Owner controls
    if (user.isOwner) {
      // Handle starting/stopping recording
      socket.on("live:record:start", async () => {
        try {
          const stream = await LiveStream.findOne({ roomName });
          if (!stream) {
            socket.emit("error", { message: "Stream not found" });
            return;
          }

          // Recording will be started via API
          socket.emit("live:record:starting");
        } catch (error) {
          logger.error("Error starting recording", { error, userId: user.id });
          socket.emit("error", { message: "Failed to start recording" });
        }
      });

      socket.on("live:record:stop", async () => {
        try {
          const stream = await LiveStream.findOne({ roomName });
          if (!stream) {
            socket.emit("error", { message: "Stream not found" });
            return;
          }

          socket.emit("live:record:stopping");
        } catch (error) {
          logger.error("Error stopping recording", { error, userId: user.id });
          socket.emit("error", { message: "Failed to stop recording" });
        }
      });
    }

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info("Live stream client disconnected", { userId: user.id, roomName });

      // Clean up rate limiting tracking
      const userKey = `${user.id}:${roomName}`;
      messageCounts.delete(userKey);

      // Broadcast viewer count update (would need to track actual count)
      socket.to(roomName).emit("live:viewer-left", { userId: user.id });
    });

    // Handle errors
    socket.on("error", (error: Error) => {
      logger.error("Live socket error", { error, userId: user.id, roomName });
    });
  });

  logger.info("Live streaming socket initialized");
  return io;
}

