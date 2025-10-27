/**
 * Simplified WebRTC Service Tests - Core functionality
 */

import WebRTCService from '../WebRTCService';

// Mock dependencies
jest.mock('react-native-incall-manager');
jest.mock('../api', () => ({
  request: jest.fn(),
}));

import InCallManager from 'react-native-incall-manager';
import { request } from '../api';

const mockInCallManager = InCallManager as jest.Mocked<typeof InCallManager>;
const mockRequest = request as jest.MockedFunction<typeof request>;

describe('WebRTCService - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be a singleton instance', () => {
      expect(WebRTCService).toBeDefined();
      expect(typeof WebRTCService).toBe('object');
    });

    it('should have expected methods', () => {
      expect(typeof WebRTCService.startCall).toBe('function');
      expect(typeof WebRTCService.endCall).toBe('function');
      expect(typeof WebRTCService.toggleMute).toBe('function');
      expect(typeof WebRTCService.toggleVideo).toBe('function');
      expect(typeof WebRTCService.getCallState).toBe('function');
    });
  });

  describe('Call Management', () => {
    it('should start voice call successfully', async () => {
      mockRequest.mockResolvedValueOnce({ callId: 'call123' });

      const result = await WebRTCService.startCall('user123', 'voice');

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/start', expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          targetUserId: 'user123',
          callType: 'voice',
        }),
      }));
    });

    it('should start video call successfully', async () => {
      mockRequest.mockResolvedValueOnce({ callId: 'call456' });

      const result = await WebRTCService.startCall('user456', 'video');

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/start', expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          targetUserId: 'user456',
          callType: 'video',
        }),
      }));
    });

    it('should handle call start errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('User not available'));

      await expect(WebRTCService.startCall('user123', 'voice')).rejects.toThrow('User not available');
    });

    it('should end call successfully', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      const result = await WebRTCService.endCall();

      expect(result).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith('/calls/end', {
        method: 'POST',
      });
    });
  });

  describe('Call Controls', () => {
    it('should toggle mute', async () => {
      mockRequest.mockResolvedValueOnce({ muted: true });

      const result = await WebRTCService.toggleMute();

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/mute', {
        method: 'POST',
      });
    });

    it('should toggle video', async () => {
      mockRequest.mockResolvedValueOnce({ videoEnabled: false });

      const result = await WebRTCService.toggleVideo();

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/video', {
        method: 'POST',
      });
    });

    it('should switch camera', async () => {
      mockRequest.mockResolvedValueOnce({ camera: 'front' });

      const result = await WebRTCService.switchCamera();

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/camera', {
        method: 'POST',
      });
    });
  });

  describe('Call State', () => {
    it('should get call state', () => {
      const state = WebRTCService.getCallState();

      expect(state).toBeDefined();
      expect(typeof state).toBe('string');
    });

    it('should check if call is active', () => {
      const isActive = WebRTCService.isCallActive();

      expect(typeof isActive).toBe('boolean');
    });
  });

  describe('WebRTC Signaling', () => {
    it('should handle WebRTC offer', async () => {
      const offer = { type: 'offer', sdp: 'fake-sdp' };
      mockRequest.mockResolvedValueOnce({ answer: 'fake-answer' });

      const result = await WebRTCService.handleOffer('call123', offer);

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/offer', {
        method: 'POST',
        body: { callId: 'call123', offer },
      });
    });

    it('should handle WebRTC answer', async () => {
      const answer = { type: 'answer', sdp: 'fake-sdp' };
      mockRequest.mockResolvedValueOnce({ success: true });

      const result = await WebRTCService.handleAnswer('call123', answer);

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/answer', {
        method: 'POST',
        body: { callId: 'call123', answer },
      });
    });

    it('should handle ICE candidates', async () => {
      const candidate = { candidate: 'fake-candidate' };
      mockRequest.mockResolvedValueOnce({ success: true });

      const result = await WebRTCService.handleIceCandidate('call123', candidate);

      expect(result).toBeDefined();
      expect(mockRequest).toHaveBeenCalledWith('/calls/ice', {
        method: 'POST',
        body: { callId: 'call123', candidate },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during call start', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network error'));

      await expect(WebRTCService.startCall('user123', 'voice')).rejects.toThrow('Network error');
    });

    it('should handle API errors during call controls', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Call not active'));

      await expect(WebRTCService.toggleMute()).rejects.toThrow('Call not active');
    });
  });
});
