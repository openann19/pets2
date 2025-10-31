/**
 * Advanced Video Call Controller
 * Production-grade video calling with LiveKit integration, quality monitoring, and analytics
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import Match from '../models/Match';
import User from '../models/User';
import logger from '../utils/logger';
// Try to import LiveKit SDK, fallback to placeholder if not available
let AccessToken: any;
try {
  AccessToken = require('livekit-server-sdk').AccessToken;
} catch {
  // Fallback: LiveKit SDK not installed - will use placeholder tokens
  AccessToken = null;
}

// Get Socket.IO instance from global (set in server.ts)
const getSocketIO = () => {
  return (global as any).socketIO as import('socket.io').Server | undefined;
};

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface InitiateCallRequest extends AuthenticatedRequest {
  body: {
    matchId: string;
    receiverId: string;
  };
}

interface CallActionRequest extends AuthenticatedRequest {
  params: {
    sessionId: string;
  };
}

interface ToggleMuteRequest extends AuthenticatedRequest {
  params: {
    sessionId: string;
  };
  body: {
    muted: boolean;
  };
}

interface ToggleVideoRequest extends AuthenticatedRequest {
  params: {
    sessionId: string;
  };
  body: {
    videoEnabled: boolean;
  };
}

interface QualityReportRequest extends AuthenticatedRequest {
  params: {
    sessionId: string;
  };
  body: {
    audioBitrate: number;
    videoBitrate: number;
    packetLoss: number;
    jitter: number;
    latency: number;
    resolution: { width: number; height: number };
    frameRate: number;
  };
}

interface GetCallHistoryRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  query: {
    limit?: string;
  };
}

// In-memory storage for active calls (in production, use Redis)
const activeCalls = new Map<string, {
  sessionId: string;
  matchId: string;
  callerId: string;
  receiverId: string;
  status: 'initiating' | 'ringing' | 'active' | 'ended' | 'rejected' | 'missed';
  startedAt?: Date;
  endedAt?: Date;
  roomName: string;
  qualityMetrics?: Map<string, any>;
}>();

// Call history storage (in production, use MongoDB)
const callHistory: Array<{
  sessionId: string;
  matchId: string;
  callerId: string;
  receiverId: string;
  status: string;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  roomName: string;
  qualityMetrics?: any;
}> = [];

/**
 * Generate LiveKit access token
 */
function generateLiveKitToken(
  roomName: string,
  participantName: string,
  canPublish: boolean,
  canSubscribe: boolean,
): string {
  const apiKey = process.env['LIVEKIT_API_KEY'] || '';
  const apiSecret = process.env['LIVEKIT_API_SECRET'] || '';

  if (!apiKey || !apiSecret || !AccessToken) {
    logger.warn('LiveKit credentials not configured, using placeholder token');
    return Buffer.from(JSON.stringify({ roomName, participantName })).toString('base64');
  }

  try {
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish,
      canSubscribe,
      canPublishData: true,
      canUpdateMetadata: true,
    });

    return token.toJwt();
  } catch (error) {
    logger.error('Failed to generate LiveKit token', { error });
    throw error;
  }
}

/**
 * @desc    Initiate a video call with LiveKit
 * @route   POST /api/chat/video-call/initiate
 * @access  Private
 */
export const initiateCall = async (
  req: InitiateCallRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId, receiverId } = req.body;
    const callerId = req.userId;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: callerId }, { user2: callerId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    // Check if other user is in the match
    const otherUserId = match.user1.toString() === callerId
      ? match.user2.toString()
      : match.user1.toString();

    if (otherUserId !== receiverId) {
      res.status(403).json({
        success: false,
        message: 'Cannot call user outside of match',
      });
      return;
    }

    // Check if there's already an active call
    const existingCall = Array.from(activeCalls.values()).find(
      (call) => call.matchId === matchId && call.status === 'active',
    );

    if (existingCall) {
      res.status(400).json({
        success: false,
        message: 'There is already an active call in this match',
      });
      return;
    }

    const sessionId = `call_${Date.now()}_${callerId}`;
    const roomName = `room_${matchId}_${sessionId}`;

    // Create call session
    activeCalls.set(sessionId, {
      sessionId,
      matchId,
      callerId,
      receiverId,
      status: 'initiating',
      roomName,
      qualityMetrics: new Map(),
    });

    // Generate LiveKit tokens
    const callerToken = generateLiveKitToken(roomName, callerId, true, true);
    const receiverToken = generateLiveKitToken(roomName, receiverId, false, true);

    const call = activeCalls.get(sessionId)!;
    call.status = 'ringing';

    // Notify receiver via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to(`user_${receiverId}`).emit('video_call_incoming', {
        sessionId,
        matchId,
        callerId,
        caller: {
          id: req.userId,
          name: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`,
          avatar: req.user?.avatar,
        },
        roomName,
        token: receiverToken,
      });
    }

    // Update user analytics
    await User.findByIdAndUpdate(callerId, {
      $inc: { 'analytics.videoCallsInitiated': 1 },
      'analytics.lastActive': new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        matchId,
        callerId,
        receiverId,
        status: 'ringing',
        token: callerToken,
        roomId: roomName,
        roomName,
        serverUrl: process.env['LIVEKIT_URL'] || process.env['WEBRTC_SERVER_URL'] || 'wss://livekit.pawfectmatch.com',
      },
    });
  } catch (error) {
    logger.error('Initiate video call error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to initiate video call',
    });
  }
};

/**
 * @desc    Get video call token
 * @route   GET /api/chat/video-call/:sessionId/token
 * @access  Private
 */
export const getCallToken = async (
  req: CallActionRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const call = activeCalls.get(sessionId);

    if (!call) {
      res.status(404).json({
        success: false,
        message: 'Call session not found',
      });
      return;
    }

    // Verify user is part of the call
    if (call.callerId !== req.userId && call.receiverId !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    const canPublish = call.callerId === req.userId || call.status === 'active';
    const token = generateLiveKitToken(call.roomName, req.userId, canPublish, true);

    res.json({
      success: true,
      data: {
        token,
        roomId: call.roomName,
        roomName: call.roomName,
        serverUrl: process.env['LIVEKIT_URL'] || process.env['WEBRTC_SERVER_URL'] || 'wss://livekit.pawfectmatch.com',
      },
    });
  } catch (error) {
    logger.error('Get call token error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get call token',
    });
  }
};

/**
 * @desc    Accept video call
 * @route   POST /api/chat/video-call/:sessionId/accept
 * @access  Private
 */
export const acceptCall = async (
  req: CallActionRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const call = activeCalls.get(sessionId);

    if (!call) {
      res.status(404).json({
        success: false,
        message: 'Call session not found',
      });
      return;
    }

    if (call.receiverId !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Only the receiver can accept the call',
      });
      return;
    }

    call.status = 'active';
    call.startedAt = new Date();

    // Generate token for receiver
    const token = generateLiveKitToken(call.roomName, req.userId, true, true);

    // Notify caller via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to(`user_${call.callerId}`).emit('video_call_accepted', {
        sessionId,
        roomName: call.roomName,
      });
    }

    // Update analytics
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'analytics.videoCallsAccepted': 1 },
      'analytics.lastActive': new Date(),
    });

    res.json({
      success: true,
      data: {
        sessionId,
        status: 'active',
        startedAt: call.startedAt.toISOString(),
        token,
        roomId: call.roomName,
        roomName: call.roomName,
        serverUrl: process.env['LIVEKIT_URL'] || process.env['WEBRTC_SERVER_URL'] || 'wss://livekit.pawfectmatch.com',
      },
    });
  } catch (error) {
    logger.error('Accept video call error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to accept video call',
    });
  }
};

/**
 * @desc    Reject video call
 * @route   POST /api/chat/video-call/:sessionId/reject
 * @access  Private
 */
export const rejectCall = async (
  req: CallActionRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const call = activeCalls.get(sessionId);

    if (!call) {
      res.status(404).json({
        success: false,
        message: 'Call session not found',
      });
      return;
    }

    if (call.receiverId !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Only the receiver can reject the call',
      });
      return;
    }

    call.status = 'rejected';
    call.endedAt = new Date();

    callHistory.push({
      sessionId: call.sessionId,
      matchId: call.matchId,
      callerId: call.callerId,
      receiverId: call.receiverId,
      status: 'rejected',
      endedAt: call.endedAt,
      roomName: call.roomName,
    });

    // Notify caller via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to(`user_${call.callerId}`).emit('video_call_rejected', {
        sessionId,
      });
    }

    // Clean up after delay
    setTimeout(() => {
      activeCalls.delete(sessionId);
    }, 60000);

    res.json({
      success: true,
      message: 'Call rejected',
    });
  } catch (error) {
    logger.error('Reject video call error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to reject video call',
    });
  }
};

/**
 * @desc    End video call
 * @route   POST /api/chat/video-call/:sessionId/end
 * @access  Private
 */
export const endCall = async (
  req: CallActionRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const call = activeCalls.get(sessionId);

    if (!call) {
      res.status(404).json({
        success: false,
        message: 'Call session not found',
      });
      return;
    }

    if (call.callerId !== req.userId && call.receiverId !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    const duration = call.startedAt
      ? Math.floor((Date.now() - call.startedAt.getTime()) / 1000)
      : 0;

    call.status = 'ended';
    call.endedAt = new Date();

    // Store in history
    const historyEntry: {
      sessionId: string;
      matchId: string;
      callerId: string;
      receiverId: string;
      status: string;
      startedAt?: Date;
      endedAt?: Date;
      duration?: number;
      roomName: string;
      qualityMetrics?: any;
    } = {
      sessionId: call.sessionId,
      matchId: call.matchId,
      callerId: call.callerId,
      receiverId: call.receiverId,
      status: 'ended',
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      duration,
      roomName: call.roomName,
      qualityMetrics: Array.from(call.qualityMetrics?.values() || []),
    };
    callHistory.push(historyEntry);

    // Notify other participant via Socket.IO
    const io = getSocketIO();
    const otherUserId = call.callerId === req.userId ? call.receiverId : call.callerId;
    if (io) {
      io.to(`user_${otherUserId}`).emit('video_call_ended', {
        sessionId,
        duration,
      });
    }

    // Update analytics
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'analytics.videoCallsCompleted': 1 },
      'analytics.lastActive': new Date(),
    });

    await User.findByIdAndUpdate(otherUserId, {
      $inc: { 'analytics.videoCallsCompleted': 1 },
    });

    // Clean up after delay
    setTimeout(() => {
      activeCalls.delete(sessionId);
    }, 60000);

    res.json({
      success: true,
      data: {
        sessionId,
        status: 'ended',
        duration,
        endedAt: call.endedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('End video call error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to end video call',
    });
  }
};

/**
 * @desc    Get active call
 * @route   GET /api/chat/video-call/active/:matchId
 * @access  Private
 */
export const getActiveCall = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;

    const call = Array.from(activeCalls.values()).find(
      (c) => c.matchId === matchId && c.status === 'active',
    );

    if (!call) {
      res.json({
        success: true,
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      data: {
        sessionId: call.sessionId,
        matchId: call.matchId,
        callerId: call.callerId,
        receiverId: call.receiverId,
        status: call.status,
        startedAt: call.startedAt?.toISOString(),
        roomName: call.roomName,
      },
    });
  } catch (error) {
    logger.error('Get active call error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get active call',
    });
  }
};

/**
 * @desc    Toggle mute
 * @route   POST /api/chat/video-call/:sessionId/mute
 * @access  Private
 */
export const toggleMute = async (
  req: ToggleMuteRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { muted } = req.body;

    const call = activeCalls.get(sessionId);

    if (!call || call.status !== 'active') {
      res.status(404).json({
        success: false,
        message: 'Active call not found',
      });
      return;
    }

    // Notify other participant via Socket.IO
    const io = getSocketIO();
    const otherUserId = call.callerId === req.userId ? call.receiverId : call.callerId;
    if (io) {
      io.to(`user_${otherUserId}`).emit('video_call_mute_changed', {
        sessionId,
        muted,
      });
    }

    res.json({
      success: true,
      message: `Audio ${muted ? 'muted' : 'unmuted'}`,
    });
  } catch (error) {
    logger.error('Toggle mute error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to toggle mute',
    });
  }
};

/**
 * @desc    Toggle video
 * @route   POST /api/chat/video-call/:sessionId/video
 * @access  Private
 */
export const toggleVideo = async (
  req: ToggleVideoRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { videoEnabled } = req.body;

    const call = activeCalls.get(sessionId);

    if (!call || call.status !== 'active') {
      res.status(404).json({
        success: false,
        message: 'Active call not found',
      });
      return;
    }

    // Notify other participant via Socket.IO
    const io = getSocketIO();
    const otherUserId = call.callerId === req.userId ? call.receiverId : call.callerId;
    if (io) {
      io.to(`user_${otherUserId}`).emit('video_call_video_changed', {
        sessionId,
        videoEnabled,
      });
    }

    res.json({
      success: true,
      message: `Video ${videoEnabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    logger.error('Toggle video error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to toggle video',
    });
  }
};

/**
 * @desc    Switch camera
 * @route   POST /api/chat/video-call/:sessionId/switch-camera
 * @access  Private
 */
export const switchCamera = async (
  req: CallActionRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const call = activeCalls.get(sessionId);

    if (!call || call.status !== 'active') {
      res.status(404).json({
        success: false,
        message: 'Active call not found',
      });
      return;
    }

    // Camera switching is handled client-side, just acknowledge
    res.json({
      success: true,
      message: 'Camera switch requested',
    });
  } catch (error) {
    logger.error('Switch camera error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to switch camera',
    });
  }
};

/**
 * @desc    Report call quality metrics
 * @route   POST /api/chat/video-call/:sessionId/quality
 * @access  Private
 */
export const reportCallQuality = async (
  req: QualityReportRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const metrics = req.body;

    const call = activeCalls.get(sessionId);

    if (!call || call.status !== 'active') {
      res.status(404).json({
        success: false,
        message: 'Active call not found',
      });
      return;
    }

    // Store quality metrics
    if (!call.qualityMetrics) {
      call.qualityMetrics = new Map();
    }
    call.qualityMetrics.set(req.userId, {
      ...metrics,
      timestamp: new Date(),
    });

    // Log quality issues
    if (metrics.packetLoss > 5 || metrics.latency > 500) {
      logger.warn('Poor call quality detected', {
        sessionId,
        userId: req.userId,
        metrics,
      });
    }

    res.json({
      success: true,
      message: 'Quality metrics recorded',
    });
  } catch (error) {
    logger.error('Report call quality error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to report call quality',
    });
  }
};

/**
 * @desc    Get call history
 * @route   GET /api/chat/video-call/history/:matchId
 * @access  Private
 */
export const getCallHistory = async (
  req: GetCallHistoryRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const limit = parseInt(req.query.limit || '50');

    // Filter call history for this match
    const history = callHistory
      .filter((call) => call.matchId === matchId)
      .sort((a, b) => {
        const aTime = a.startedAt?.getTime() || 0;
        const bTime = b.startedAt?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, limit)
      .map((call) => ({
        sessionId: call.sessionId,
        status: call.status,
        startedAt: call.startedAt?.toISOString(),
        endedAt: call.endedAt?.toISOString(),
        duration: call.duration,
      }));

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Get call history error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get call history',
    });
  }
};
