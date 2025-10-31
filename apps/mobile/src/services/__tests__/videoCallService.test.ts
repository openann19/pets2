/**
 * Video Call Service Tests
 * Comprehensive test suite for video call service
 */

import { videoCallService } from '../videoCallService';
import { request } from '../../services/api';
import { logger } from '@pawfectmatch/core';

jest.mock('../../services/api');
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('VideoCallService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateCall', () => {
    it('should successfully initiate a call', async () => {
      const mockResponse = {
        sessionId: 'session123',
        matchId: 'match123',
        callerId: 'caller123',
        receiverId: 'receiver123',
        status: 'ringing' as const,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await videoCallService.initiateCall({
        matchId: 'match123',
        receiverId: 'receiver123',
        callerId: 'caller123',
      });

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/initiate', {
        method: 'POST',
        body: {
          matchId: 'match123',
          receiverId: 'receiver123',
          callerId: 'caller123',
        },
      });
      expect(logger.info).toHaveBeenCalledWith('Video call initiated', {
        matchId: 'match123',
      });
    });

    it('should handle initiation errors', async () => {
      const error = new Error('Network error');
      mockRequest.mockRejectedValue(error);

      await expect(
        videoCallService.initiateCall({
          matchId: 'match123',
          receiverId: 'receiver123',
          callerId: 'caller123',
        }),
      ).rejects.toThrow('Network error');

      expect(logger.error).toHaveBeenCalledWith('Failed to initiate video call', {
        error,
        params: {
          matchId: 'match123',
          receiverId: 'receiver123',
          callerId: 'caller123',
        },
      });
    });
  });

  describe('getCallToken', () => {
    it('should successfully get call token', async () => {
      const mockResponse = {
        token: 'token123',
        roomId: 'room123',
        serverUrl: 'wss://example.com',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await videoCallService.getCallToken('session123');

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/session123/token', {
        method: 'GET',
      });
    });
  });

  describe('acceptCall', () => {
    it('should successfully accept a call', async () => {
      const mockResponse = {
        sessionId: 'session123',
        status: 'active' as const,
        startedAt: new Date().toISOString(),
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await videoCallService.acceptCall('session123');

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/session123/accept', {
        method: 'POST',
      });
      expect(logger.info).toHaveBeenCalledWith('Video call accepted', {
        sessionId: 'session123',
      });
    });
  });

  describe('rejectCall', () => {
    it('should successfully reject a call', async () => {
      mockRequest.mockResolvedValue(undefined);

      await videoCallService.rejectCall('session123');

      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/session123/reject', {
        method: 'POST',
      });
      expect(logger.info).toHaveBeenCalledWith('Video call rejected', {
        sessionId: 'session123',
      });
    });
  });

  describe('endCall', () => {
    it('should successfully end a call', async () => {
      const mockResponse = {
        sessionId: 'session123',
        status: 'ended' as const,
        duration: 60,
        endedAt: new Date().toISOString(),
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await videoCallService.endCall('session123');

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/session123/end', {
        method: 'POST',
      });
      expect(logger.info).toHaveBeenCalledWith('Video call ended', {
        sessionId: 'session123',
      });
    });
  });

  describe('getActiveCall', () => {
    it('should return active call when exists', async () => {
      const mockResponse = {
        sessionId: 'session123',
        matchId: 'match123',
        callerId: 'caller123',
        receiverId: 'receiver123',
        status: 'active' as const,
        startedAt: new Date().toISOString(),
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await videoCallService.getActiveCall('match123');

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/active/match123', {
        method: 'GET',
      });
    });

    it('should return null when no active call', async () => {
      mockRequest.mockResolvedValue(null);

      const result = await videoCallService.getActiveCall('match123');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      const result = await videoCallService.getActiveCall('match123');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('toggleMute', () => {
    it('should successfully toggle mute', async () => {
      mockRequest.mockResolvedValue(undefined);

      await videoCallService.toggleMute('session123', true);

      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/session123/mute', {
        method: 'POST',
        body: { muted: true },
      });
      expect(logger.info).toHaveBeenCalledWith('Mute toggled', {
        sessionId: 'session123',
        muted: true,
      });
    });
  });

  describe('toggleVideo', () => {
    it('should successfully toggle video', async () => {
      mockRequest.mockResolvedValue(undefined);

      await videoCallService.toggleVideo('session123', false);

      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/session123/video', {
        method: 'POST',
        body: { videoEnabled: false },
      });
      expect(logger.info).toHaveBeenCalledWith('Video toggled', {
        sessionId: 'session123',
        videoEnabled: false,
      });
    });
  });

  describe('switchCamera', () => {
    it('should successfully switch camera', async () => {
      mockRequest.mockResolvedValue(undefined);

      await videoCallService.switchCamera('session123');

      expect(mockRequest).toHaveBeenCalledWith('/chat/video-call/session123/switch-camera', {
        method: 'POST',
      });
      expect(logger.info).toHaveBeenCalledWith('Camera switched', {
        sessionId: 'session123',
      });
    });
  });
});

