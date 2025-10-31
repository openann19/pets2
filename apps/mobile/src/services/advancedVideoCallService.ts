/**
 * Advanced Video Call Service with LiveKit Integration
 * Production-grade WebRTC video calling with SFU architecture
 */

import { logger } from '@pawfectmatch/core';
import { request } from '../services/api';
import { AccessToken } from 'livekit-client';

interface VideoCallToken {
  token: string;
  roomId: string;
  serverUrl: string;
}

interface VideoCallRequest {
  matchId: string;
  callerId: string;
  receiverId: string;
}

interface VideoCallSession {
  sessionId: string;
  matchId: string;
  callerId: string;
  receiverId: string;
  status: 'initiating' | 'ringing' | 'active' | 'ended' | 'rejected' | 'missed';
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  roomName: string;
}

interface CallQualityMetrics {
  audioBitrate: number;
  videoBitrate: number;
  packetLoss: number;
  jitter: number;
  latency: number;
  resolution: { width: number; height: number };
  frameRate: number;
}

class AdvancedVideoCallService {
  private livekitServerUrl: string;
  private livekitApiKey: string;
  private livekitApiSecret: string;

  constructor() {
    this.livekitServerUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL || 'wss://livekit.pawfectmatch.com';
    this.livekitApiKey = process.env.LIVEKIT_API_KEY || '';
    this.livekitApiSecret = process.env.LIVEKIT_API_SECRET || '';
  }

  /**
   * Generate LiveKit access token for WebRTC
   */
  private generateLiveKitToken(
    roomName: string,
    participantName: string,
    canPublish: boolean,
    canSubscribe: boolean,
  ): string {
    try {
      const token = new AccessToken(this.livekitApiKey, this.livekitApiSecret, {
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
   * Initiate a video call with LiveKit
   */
  async initiateCall(params: VideoCallRequest): Promise<VideoCallSession> {
    try {
      const response = await request<VideoCallSession>('/chat/video-call/initiate', {
        method: 'POST',
        body: params,
      });

      // Generate LiveKit token
      const token = this.generateLiveKitToken(
        response.roomId,
        params.callerId,
        true,
        true,
      );

      logger.info('Video call initiated with LiveKit', {
        matchId: params.matchId,
        sessionId: response.sessionId,
        roomName: response.roomId,
      });

      return {
        ...response,
        token,
      };
    } catch (error) {
      logger.error('Failed to initiate video call', { error, params });
      throw error;
    }
  }

  /**
   * Get video call token for WebRTC
   */
  async getCallToken(sessionId: string, userId: string, canPublish: boolean): Promise<VideoCallToken> {
    try {
      const response = await request<{ roomId: string }>(`/chat/video-call/${sessionId}/token`, {
        method: 'GET',
      });

      // Generate LiveKit token
      const token = this.generateLiveKitToken(
        response.roomId,
        userId,
        canPublish,
        true,
      );

      return {
        token,
        roomId: response.roomId,
        serverUrl: this.livekitServerUrl,
      };
    } catch (error) {
      logger.error('Failed to get call token', { error, sessionId });
      throw error;
    }
  }

  /**
   * Accept video call
   */
  async acceptCall(sessionId: string): Promise<VideoCallSession> {
    try {
      const response = await request<VideoCallSession>(`/chat/video-call/${sessionId}/accept`, {
        method: 'POST',
      });

      // Generate LiveKit token for receiver
      const token = this.generateLiveKitToken(
        response.roomName,
        response.receiverId,
        true,
        true,
      );

      logger.info('Video call accepted', { sessionId });
      return {
        ...response,
        token,
      };
    } catch (error) {
      logger.error('Failed to accept video call', { error, sessionId });
      throw error;
    }
  }

  /**
   * Reject video call
   */
  async rejectCall(sessionId: string): Promise<void> {
    try {
      await request(`/chat/video-call/${sessionId}/reject`, {
        method: 'POST',
      });

      logger.info('Video call rejected', { sessionId });
    } catch (error) {
      logger.error('Failed to reject video call', { error, sessionId });
      throw error;
    }
  }

  /**
   * End video call
   */
  async endCall(sessionId: string): Promise<VideoCallSession> {
    try {
      const response = await request<VideoCallSession>(`/chat/video-call/${sessionId}/end`, {
        method: 'POST',
      });

      logger.info('Video call ended', { sessionId, duration: response.duration });
      return response;
    } catch (error) {
      logger.error('Failed to end video call', { error, sessionId });
      throw error;
    }
  }

  /**
   * Get active call session
   */
  async getActiveCall(matchId: string): Promise<VideoCallSession | null> {
    try {
      const response = await request<VideoCallSession | null>(
        `/chat/video-call/active/${matchId}`,
        {
          method: 'GET',
        },
      );

      logger.info('Active call retrieved', { matchId });
      return response;
    } catch (error) {
      logger.error('Failed to get active call', { error, matchId });
      return null;
    }
  }

  /**
   * Toggle mute during call
   */
  async toggleMute(sessionId: string, muted: boolean): Promise<void> {
    try {
      await request(`/chat/video-call/${sessionId}/mute`, {
        method: 'POST',
        body: { muted },
      });

      logger.info('Mute toggled', { sessionId, muted });
    } catch (error) {
      logger.error('Failed to toggle mute', { error, sessionId });
      throw error;
    }
  }

  /**
   * Toggle video during call
   */
  async toggleVideo(sessionId: string, videoEnabled: boolean): Promise<void> {
    try {
      await request(`/chat/video-call/${sessionId}/video`, {
        method: 'POST',
        body: { videoEnabled },
      });

      logger.info('Video toggled', { sessionId, videoEnabled });
    } catch (error) {
      logger.error('Failed to toggle video', { error, sessionId });
      throw error;
    }
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(sessionId: string): Promise<void> {
    try {
      await request(`/chat/video-call/${sessionId}/switch-camera`, {
        method: 'POST',
      });

      logger.info('Camera switched', { sessionId });
    } catch (error) {
      logger.error('Failed to switch camera', { error, sessionId });
      throw error;
    }
  }

  /**
   * Report call quality metrics
   */
  async reportCallQuality(sessionId: string, metrics: CallQualityMetrics): Promise<void> {
    try {
      await request(`/chat/video-call/${sessionId}/quality`, {
        method: 'POST',
        body: metrics,
      });

      logger.info('Call quality metrics reported', { sessionId, metrics });
    } catch (error) {
      logger.error('Failed to report call quality', { error, sessionId });
      // Don't throw - quality reporting is non-critical
    }
  }

  /**
   * Get call history
   */
  async getCallHistory(matchId: string, limit: number = 50): Promise<VideoCallSession[]> {
    try {
      const response = await request<VideoCallSession[]>(
        `/chat/video-call/history/${matchId}`,
        {
          method: 'GET',
          params: { limit },
        },
      );

      logger.info('Call history retrieved', { matchId, count: response.length });
      return response;
    } catch (error) {
      logger.error('Failed to get call history', { error, matchId });
      throw error;
    }
  }
}

export const advancedVideoCallService = new AdvancedVideoCallService();

