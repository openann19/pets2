/**
 * Video Call Service
 * Production-grade video calling with WebRTC
 */

import { logger } from '@pawfectmatch/core';
import { request } from '../services/api';

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
}

class VideoCallService {
  /**
   * Initiate a video call
   */
  async initiateCall(params: VideoCallRequest): Promise<VideoCallSession> {
    try {
      const response = await request<VideoCallSession>('/chat/video-call/initiate', {
        method: 'POST',
        body: params,
      });

      logger.info('Video call initiated', { matchId: params.matchId });
      return response;
    } catch (error) {
      logger.error('Failed to initiate video call', { error, params });
      throw error;
    }
  }

  /**
   * Get video call token for WebRTC
   */
  async getCallToken(sessionId: string): Promise<VideoCallToken> {
    try {
      const response = await request<VideoCallToken>(`/chat/video-call/${sessionId}/token`, {
        method: 'GET',
      });

      logger.info('Video call token retrieved', { sessionId });
      return response;
    } catch (error) {
      logger.error('Failed to get video call token', { error, sessionId });
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

      logger.info('Video call accepted', { sessionId });
      return response;
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

      logger.info('Video call ended', { sessionId });
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
}

export const videoCallService = new VideoCallService();

