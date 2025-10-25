export {};// Added to mark file as a module
// WebRTC signaling socket handler for PawfectMatch calling
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = function attachWebRTCNamespace(io) {
  const nsp = io.of('/webrtc');

  // Store active calls and user connections
  const activeCalls = new Map(); // callId -> { caller, callee, status }
  const userSockets = new Map(); // userId -> socketId
  const socketUsers = new Map(); // socketId -> userId

  // Middleware for authentication
  nsp.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  nsp.on('connection', (socket) => {
    logger.info('WebRTC client connected', { socketId: socket.id, userId: socket.userId });
    
    // Store user-socket mapping
    userSockets.set(socket.userId, socket.id);
    socketUsers.set(socket.id, socket.userId);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle call initiation
    socket.on('initiate-call', async (callData) => {
      let callId = null;
      try {
        const { callId: extractedCallId, matchId, callerId, callerName, callType } = callData;
        callId = extractedCallId;
        
        // Get the match to find the other user
        // In a real implementation, you'd query your database
        // For now, we'll simulate finding the other user
        const otherUserId = await getOtherUserFromMatch(matchId, callerId);
        
        if (!otherUserId) {
          socket.emit('call-error', { message: 'User not found' });
          return;
        }

        // Store call information
        activeCalls.set(callId, {
          callerId,
          calleeId: otherUserId,
          matchId,
          callType,
          status: 'ringing',
          startTime: Date.now()
        });

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
      } catch (error) {
        logger.error('Error initiating call:', { error: error.message, callId, callerId: socket.userId });
        socket.emit('call-error', { message: 'Failed to initiate call' });
      }
    });

    // Handle call answer
    socket.on('answer-call', (data) => {
      const { callId, matchId } = data;
      const call = activeCalls.get(callId);
      
      if (!call) {
        socket.emit('call-error', { message: 'Call not found' });
        return;
      }

      // Update call status
      call.status = 'answered';
      call.answeredTime = Date.now();

      // Notify caller that call was answered
      const callerSocketId = userSockets.get(call.callerId);
      if (callerSocketId) {
        nsp.to(callerSocketId).emit('call-answered', { callId, matchId });
      }
    });

    // Handle call rejection
    socket.on('reject-call', (data) => {
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
    socket.on('end-call', (data) => {
      const { callId } = data;
      const call = activeCalls.get(callId);
      
      if (call) {
        // Notify both parties that call ended
        const callerSocketId = userSockets.get(call.callerId);
        const calleeSocketId = userSockets.get(call.calleeId);
        
        [callerSocketId, calleeSocketId].forEach(socketId => {
          if (socketId && socketId !== socket.id) {
            nsp.to(socketId).emit('call-ended', { callId, reason: 'ended' });
          }
        });
        
        // Log call duration for analytics
        const duration = Date.now() - (call.answeredTime || call.startTime);
        logger.info('Call ended', { callId, duration, callerId: call.callerId, calleeId: call.calleeId });
        
        activeCalls.delete(callId);
      }
    });

    // WebRTC signaling events
    socket.on('webrtc-offer', (data) => {
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

    socket.on('webrtc-answer', (data) => {
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

    socket.on('webrtc-ice-candidate', (data) => {
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

  // Helper function to get other user from match
  async function getOtherUserFromMatch(matchId, currentUserId) {
    // In a real implementation, query your database
    // For demo purposes, we'll return a mock user ID
    // You should replace this with actual database query
    
    try {
      // Example database query:
      // const match = await Match.findById(matchId).populate('user1 user2');
      // return match.user1._id.toString() === currentUserId ? match.user2._id.toString() : match.user1._id.toString();
      
      // Mock implementation - return a different user ID
      return currentUserId === 'user1' ? 'user2' : 'user1';
    } catch (error) {
      logger.error('Error getting other user from match:', { error });
      return null;
    }
  }

  // Utility functions for external use
  return {
    // Get active calls count
    getActiveCallsCount: () => activeCalls.size,
    
    // Get online users count
    getOnlineUsersCount: () => userSockets.size,
    
    // Force end a call (for admin purposes)
    forceEndCall: (callId) => {
      const call = activeCalls.get(callId);
      if (call) {
        const callerSocketId = userSockets.get(call.callerId);
        const calleeSocketId = userSockets.get(call.calleeId);
        
        [callerSocketId, calleeSocketId].forEach(socketId => {
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
};
