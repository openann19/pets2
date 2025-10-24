/**
 * Integration tests for video call functionality
 * Covers WebRTC connection setup, signaling, and media handling
 */

import { videoCallService } from '../services/VideoCallService';
import { api } from '../services/api';
import { logger } from '../services/logger';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock WebRTC APIs
const mockGetUserMedia = jest.fn();
const mockGetDisplayMedia = jest.fn();
const mockRTCPeerConnection = jest.fn();
const mockCreateOffer = jest.fn();
const mockCreateAnswer = jest.fn();
const mockSetLocalDescription = jest.fn();
const mockSetRemoteDescription = jest.fn();

// Setup navigator.mediaDevices mock using Object.defineProperty
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    getDisplayMedia: mockGetDisplayMedia,
  },
  writable: true,
  configurable: true,
});

global.RTCPeerConnection = mockRTCPeerConnection as unknown;

describe('Video Call Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock video call API methods
    (api as unknown).videoCall = {
      createCall: jest.fn(),
      joinCall: jest.fn(),
      endCall: jest.fn(),
      sendOffer: jest.fn(),
      getAnswer: jest.fn(),
      sendIceCandidate: jest.fn(),
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    };

    // Mock logger methods
    (logger.info as jest.Mock) = jest.fn();
    (logger.warn as jest.Mock) = jest.fn();
    (logger.error as jest.Mock) = jest.fn();

    // Mock MediaStream and related classes
    mockGetUserMedia.mockResolvedValue({
      getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
      getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
    });

    mockGetDisplayMedia.mockResolvedValue({
      getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
      getAudioTracks: () => [],
    });
  });

  describe('WebRTC Connection Setup', () => {
    it('initializes peer connection with correct configuration', async () => {
      const mockPeerConnection = {
        createOffer: mockCreateOffer,
        createAnswer: mockCreateAnswer,
        setLocalDescription: mockSetLocalDescription,
        setRemoteDescription: mockSetRemoteDescription,
        addIceCandidate: jest.fn(),
        onicecandidate: null,
        ontrack: null,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPeerConnection);
      mockCreateOffer.mockResolvedValue({ type: 'offer', sdp: 'test-sdp' });
      mockSetLocalDescription.mockResolvedValue(undefined);

      const peerConnection = videoCallService.initializePeerConnection();

      expect(mockRTCPeerConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          iceServers: expect.arrayContaining([
            expect.objectContaining({ urls: expect.stringContaining('stun:') }),
          ]),
        }),
      );

      expect(peerConnection).toBeDefined();
    });

    it('handles peer connection errors gracefully', async () => {
      mockRTCPeerConnection.mockImplementation(() => {
        throw new Error('WebRTC not supported');
      });

      try {
        videoCallService.initializePeerConnection();
      } catch (error) {
        expect(error).toBeDefined();
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });

  describe('Signaling Server Communication', () => {
    it('sends offer to signaling server', async () => {
      // Use correct RTCSessionDescriptionInit type with 'offer' as RTCSdpType
      const mockOffer = { type: 'offer' as RTCSdpType, sdp: 'test-sdp-offer' };
      const mockCallId = 'call-123';

      (api.videoCall.sendOffer as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Offer sent successfully',
      });

      const result = await videoCallService.sendOffer(mockCallId, mockOffer);

      expect(api.videoCall.sendOffer).toHaveBeenCalledWith(mockCallId, mockOffer);
      expect(result.success).toBe(true);
    });

    it('handles answer from signaling server', async () => {
      const mockAnswer = { type: 'answer' as RTCSdpType, sdp: 'test-sdp-answer' };
      const mockCallId = 'call-123';

      (api.videoCall.getAnswer as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAnswer,
      });

      const result = await videoCallService.getAnswer(mockCallId);

      expect(api.videoCall.getAnswer).toHaveBeenCalledWith(mockCallId);
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('answer');
    });

    it('exchanges ICE candidates', async () => {
      const mockCandidate = {
        candidate: 'test-candidate',
        sdpMid: '0',
        sdpMLineIndex: 0,
      };
      const mockCallId = 'call-123';

      (api.videoCall.sendIceCandidate as jest.Mock).mockResolvedValue({
        success: true,
        message: 'ICE candidate sent',
      });

      const result = await videoCallService.sendIceCandidate(mockCallId, mockCandidate);
      expect(api.videoCall.sendIceCandidate).toHaveBeenCalledWith(mockCallId, mockCandidate);
      expect(result.success).toBe(true);
    });
  });

  describe('Media Stream Handling', () => {
    it('gets user media stream', async () => {
      const stream = await videoCallService.getUserMedia();

      expect(stream).toBeDefined();
      expect(stream.getVideoTracks()).toHaveLength(1);
      expect(stream.getAudioTracks()).toHaveLength(1);
    });

    it('handles camera permission denied', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      try {
        await videoCallService.getUserMedia();
      } catch (error) {
        expect(error).toBeDefined();
        expect(logger.warn).toHaveBeenCalledWith('Camera permission denied', expect.any(Object));
      }
    });

    it('toggles video track enabled state', () => {
      const mockTrack = { enabled: true, stop: jest.fn() };
      const mockStream = {
        getVideoTracks: () => [mockTrack],
        getAudioTracks: () => [],
      } as unknown;

      videoCallService.toggleVideoTrack(mockStream);

      expect(mockTrack.enabled).toBe(false);
    });

    it('toggles audio track enabled state', () => {
      const mockTrack = { enabled: true, stop: jest.fn() };
      const mockStream = {
        getVideoTracks: () => [],
        getAudioTracks: () => [mockTrack],
      } as unknown;

      videoCallService.toggleAudioTrack(mockStream);

      expect(mockTrack.enabled).toBe(false);
    });
  });

  describe('Call Management', () => {
    it('creates video call session', async () => {
      const mockSession = {
        callId: 'call-123',
        initiator: 'user-123',
        receiver: 'user-456',
      };

      (api.videoCall.createCall as jest.Mock).mockResolvedValue({
        success: true,
        data: mockSession,
      });

      const result = await videoCallService.createCall('user-456');

      expect(api.videoCall.createCall).toHaveBeenCalledWith('user-456');
      expect(result.data).toBe(mockSession);
    });

    it('joins existing video call', async () => {
      const mockCallId = 'call-123';

      (api.videoCall.joinCall as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Joined call successfully',
      });

      const result = await videoCallService.joinCall(mockCallId);

      expect(api.videoCall.joinCall).toHaveBeenCalledWith(mockCallId);
      expect(result.success).toBe(true);
    });

    it('ends video call session', async () => {
      const mockCallId = 'call-123';

      (api.videoCall.endCall as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Call ended successfully',
      });

      const result = await videoCallService.endCall(mockCallId);

      // Just verify the API was called correctly
      expect(api.videoCall.endCall).toHaveBeenCalledWith(mockCallId);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('handles signaling server connection errors', async () => {
      (api.videoCall.createCall as jest.Mock).mockRejectedValue(
        new Error('Signaling server unavailable'),
      );

      try {
        await videoCallService.createCall('user-456');
      } catch (error) {
        expect(error).toBeDefined();
        expect(logger.error).toHaveBeenCalledWith(
          'Failed to create video call',
          expect.any(Object),
        );
      }
    });

    it('handles WebRTC negotiation failures', async () => {
      mockCreateOffer.mockRejectedValue(new Error('SDP negotiation failed'));

      try {
        await videoCallService.createOffer();
      } catch (error) {
        expect(error).toBeDefined();
        expect(logger.error).toHaveBeenCalledWith('Failed to create offer', expect.any(Object));
      }
    });

    it('handles ICE candidate exchange failures', async () => {
      (api.videoCall.sendIceCandidate as jest.Mock).mockRejectedValue(
        new Error('ICE candidate exchange failed'),
      );

      try {
        await videoCallService.sendIceCandidate('call-123', { candidate: 'test' });
      } catch (error) {
        expect(error).toBeDefined();
        expect(logger.error).toHaveBeenCalledWith(
          'Failed to send ICE candidate',
          expect.any(Object),
        );
      }
    });
  });

  describe('Recording Functionality', () => {
    it('starts call recording', async () => {
      const mockCallId = 'call-123';

      (api.videoCall.startRecording as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Recording started',
      });

      const result = await videoCallService.startRecording(mockCallId);

      expect(api.videoCall.startRecording).toHaveBeenCalledWith(mockCallId);
      expect(result.success).toBe(true);
    });

    it('stops call recording', async () => {
      const mockCallId = 'call-123';

      (api.videoCall.stopRecording as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Recording stopped',
      });

      const result = await videoCallService.stopRecording(mockCallId);

      expect(api.videoCall.stopRecording).toHaveBeenCalledWith(mockCallId);
      expect(result.success).toBe(true);
    });

    it('handles recording permission errors', async () => {
      const mockCallId = 'call-123';

      (api.videoCall.startRecording as jest.Mock).mockRejectedValue(
        new Error('Recording permission denied'),
      );

      try {
        await videoCallService.startRecording(mockCallId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(logger.warn).toHaveBeenCalledWith('Recording permission denied', expect.any(Object));
      }
    });
  });

  describe('Screen Sharing', () => {
    it('initiates screen sharing stream', async () => {
      const mockStream = {
        getVideoTracks: () => [{ enabled: true }],
        getAudioTracks: () => [],
      };

      mockGetDisplayMedia.mockResolvedValue(mockStream);

      const stream = await videoCallService.getScreenShareStream();

      // Check that getDisplayMedia was called
      expect(mockGetDisplayMedia).toHaveBeenCalled();

      // Check that the stream was returned
      expect(stream).toBe(mockStream);
    });

    it('handles screen sharing cancellation', async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error('Screen sharing cancelled'));

      try {
        await videoCallService.getScreenShareStream();
        // Should not reach here
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(logger.info).toHaveBeenCalledWith(
          'Screen sharing cancelled by user',
          expect.any(Object),
        );
      }
    });
  });
});
