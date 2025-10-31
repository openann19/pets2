import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import logger from '../utils/logger';
import Match from '../models/Match';
import type { SocketIOServer, Socket } from 'socket.io';
import type { NextFunction } from 'express';
import type {
  AuthenticatedSocket,
  WebRTCCallData,
  WebRTCAnswerData,
  WebRTCRejectData,
  WebRTCSignalOfferData,
  WebRTCSignalAnswerData,
  WebRTCIceCandidateData,
  WebRTCCallEndData,
  WebRTCActiveCall,
} from '../types/socket';

export default function attachWebRTCNamespace(io: SocketIOServer) {
  const nsp = io.of('/webrtc');

  // Store active calls and user connections
  const activeCalls = new Map<string, WebRTCActiveCall>(); // callId -> call info
  const userSockets = new Map<string, string>(); // userId -> socketId
  const socketUsers = new Map<string, string>(); // socketId -> userId

  // Middleware for authentication
  nsp.use((socket: AuthenticatedSocket, next: NextFunction) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.userId = decoded.id as string;
      next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  nsp.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('WebRTC client connected', { socketId: socket.id, userId: socket.userId });
    
    // Store user-socket mapping
    userSockets.set(socket.userId, socket.id);
    socketUsers.set(socket.id, socket.userId);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle call initiation
    socket.on('initiate-call', async (callData: WebRTCCallData) => {
      let callId: string | null = null;
      try {
        const { callId: extractedCallId, matchId, callerId, callerName, callType } = callData;
        callId = extractedCallId;
        
        // Check premium status - Video/voice calls are Premium+ feature
        const User = (await import('../models/User')).default;
        const user = await User.findById(callerId);
        
        if (!user) {
          socket.emit('call-error', { message: 'User not found' });
          return;
        }
        
        const isPremium = user.premium?.isActive &&
          (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());
        const hasVideoCalls = isPremium && (user.premium?.plan === 'premium' || user.premium?.plan === 'ultimate');
        
        if (!hasVideoCalls) {
          socket.emit('call-error', {
            message: 'Premium subscription required for video/voice calls',
            code: 'PREMIUM_FEATURE_REQUIRED',
            upgradeRequired: true,
          });
          return;
        }
        
        // Get the match to find the other user from database
        const match = await Match.findById(matchId);
        
        if (!match) {
          socket.emit('call-error', { message: 'Match not found' });
          return;
        }

        // Determine the other user ID based on which participant is the caller
        const matchObj = match.toObject() as { user1: { toString: () => string } | string; user2: { toString: () => string } | string };
        const user1Id = typeof matchObj.user1 === 'string' ? matchObj.user1 : matchObj.user1?.toString();
        const user2Id = typeof matchObj.user2 === 'string' ? matchObj.user2 : matchObj.user2?.toString();
        const otherUserId = user1Id === callerId ? user2Id : user1Id;
        
        if (!otherUserId) {
          logger.error('Could not determine other user from match', { matchId, callerId });
          socket.emit('call-error', { message: 'Could not find call recipient' });
          return;
        }

        // Store call information
        if (otherUserId && callId) {
          activeCalls.set(callId, {
            callerId,
            calleeId: otherUserId,
            matchId,
            callType,
            status: 'ringing',
            startTime: Date.now()
          });
        }

        // Send incoming call to the other user
        const calleeSocketId = userSockets.get(otherUserId);
        if (calleeSocketId) {
          nsp.to(calleeSocketId).emit('incoming-call', {
            callId,
            matchId,
            callerId,
            callerName,
            callType,
            timestamp: Date.now()
          });
        } else {
          // User is offline - could implement push notifications here
          socket.emit('call-error', { message: 'User is offline' });
          activeCalls.delete(callId);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error initiating call:', { error: errorMessage, callId, callerId: socket.userId });
        socket.emit('call-error', { message: 'Failed to initiate call' });
      }
    });

    // Handle call answer
    socket.on('answer-call', (data: WebRTCAnswerData) => {
      const { callId, matchId } = data;
      const call = activeCalls.get(callId);
      
      if (!call) {
        socket.emit('call-error', { message: 'Call not found' });
        return;
      }

      // Update call status
      call.status = 'active';
      call.answeredTime = Date.now();

      // Notify caller that call was answered
      const callerSocketId = userSockets.get(call.callerId);
      if (callerSocketId) {
        nsp.to(callerSocketId).emit('call-answered', { callId, matchId });
      }
    });

    // Handle call rejection
    socket.on('reject-call', (data: WebRTCRejectData) => {
      const { callId } = data;
      const call = activeCalls.get(callId);
      
      if (call) {
        // Notify caller that call was rejected
        const callerSocketId = userSockets.get(call.callerId);
        if (callerSocketId) {
          nsp.to(callerSocketId).emit('call-ended', { callId, reason: 'rejected' });
        }
        
        activeCalls.delete(callId);
      }
    });

    // Handle call end
    socket.on('end-call', (data: WebRTCCallEndData) => {
      const { callId } = data;
      const call = activeCalls.get(callId);
      
      if (call) {
        // Notify both parties that call ended
        const callerSocketId = userSockets.get(call.callerId);
        const calleeSocketId = userSockets.get(call.calleeId);
        
        [callerSocketId, calleeSocketId].forEach((socketId: string | undefined) => {
          if (socketId && socketId !== socket.id) {
            nsp.to(socketId).emit('call-ended', { callId, reason: data.reason || 'ended' });
          }
        });
        
        // Log call duration for analytics
        const duration = Date.now() - (call.answeredTime || call.startTime);
        logger.info('Call ended', { callId, duration, callerId: call.callerId, calleeId: call.calleeId });
        
        activeCalls.delete(callId);
      }
    });

    // WebRTC signaling events
    socket.on('webrtc-offer', (data: WebRTCSignalOfferData) => {
      const { callId, offer } = data;
      const call = activeCalls.get(callId);
      
      if (call) {
        const targetUserId = call.callerId === socket.userId ? call.calleeId : call.callerId;
        const targetSocketId = userSockets.get(targetUserId);
        
        if (targetSocketId) {
          nsp.to(targetSocketId).emit('webrtc-offer', { callId, offer });
        }
      }
    });

    socket.on('webrtc-answer', (data: WebRTCSignalAnswerData) => {
      const { callId, answer } = data;
      const call = activeCalls.get(callId);
      
      if (call) {
        const targetUserId = call.callerId === socket.userId ? call.calleeId : call.callerId;
        const targetSocketId = userSockets.get(targetUserId);
        
        if (targetSocketId) {
          nsp.to(targetSocketId).emit('webrtc-answer', { callId, answer });
        }
      }
    });

    socket.on('webrtc-ice-candidate', (data: WebRTCIceCandidateData) => {
      const { callId, candidate } = data;
      const call = activeCalls.get(callId);
      
      if (call) {
        const targetUserId = call.callerId === socket.userId ? call.calleeId : call.callerId;
        const targetSocketId = userSockets.get(targetUserId);
        
        if (targetSocketId) {
          nsp.to(targetSocketId).emit('webrtc-ice-candidate', { callId, candidate });
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info('WebRTC client disconnected', { socketId: socket.id, userId: socket.userId });
      
      // Clean up user mappings
      userSockets.delete(socket.userId);
      socketUsers.delete(socket.id);
      
      // End any active calls for this user
      for (const [callId, call] of activeCalls.entries()) {
        if (call.callerId === socket.userId || call.calleeId === socket.userId) {
          // Notify the other party
          const otherUserId = call.callerId === socket.userId ? call.calleeId : call.callerId;
          const otherSocketId = userSockets.get(otherUserId);
          
          if (otherSocketId) {
            nsp.to(otherSocketId).emit('call-ended', { callId, reason: 'disconnected' });
          }
          
          activeCalls.delete(callId);
        }
      }
    });
  });

  // Utility functions for external use
  return {
    // Get active calls count
    getActiveCallsCount: () => activeCalls.size,
    
    // Get online users count
    getOnlineUsersCount: () => userSockets.size,
    
    // Force end a call (for admin purposes)
    forceEndCall: (callId: string) => {
      const call = activeCalls.get(callId);
      if (call) {
        const callerSocketId = userSockets.get(call.callerId);
        const calleeSocketId = userSockets.get(call.calleeId);
        
        [callerSocketId, calleeSocketId].forEach((socketId: string | undefined) => {
          if (socketId) {
            nsp.to(socketId).emit('call-ended', { callId, reason: 'admin' });
          }
        });
        
        activeCalls.delete(callId);
        return true;
      }
      return false;
    }
  };
}

