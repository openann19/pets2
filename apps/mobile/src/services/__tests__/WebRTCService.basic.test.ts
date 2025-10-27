/**
 * Simplified WebRTC Service Tests - Basic functionality
 */

import WebRTCService from '../WebRTCService';

// Mock dependencies
jest.mock('react-native-incall-manager');
jest.mock('react-native-webrtc', () => ({
  mediaDevices: {
    getUserMedia: jest.fn().mockResolvedValue({
      getAudioTracks: jest.fn().mockReturnValue([
        { enabled: true, _switchCamera: jest.fn() }
      ]),
      getVideoTracks: jest.fn().mockReturnValue([
        { enabled: true, _switchCamera: jest.fn() }
      ]),
      getTracks: jest.fn().mockReturnValue([]),
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
    }),
    enumerateDevices: jest.fn().mockResolvedValue([]),
  },
  RTCPeerConnection: jest.fn().mockImplementation(() => ({
    createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'fake-sdp' }),
    createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'fake-sdp' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    setRemoteDescription: jest.fn().mockResolvedValue(undefined),
    addIceCandidate: jest.fn().mockResolvedValue(undefined),
    addStream: jest.fn(),
    removeStream: jest.fn(),
    close: jest.fn(),
    onicecandidate: null,
    onaddstream: null,
    onremovestream: null,
    oniceconnectionstatechange: null,
  })),
  RTCIceCandidate: jest.fn(),
  RTCSessionDescription: jest.fn(),
}));

jest.mock('../api', () => ({
  request: jest.fn(),
}));

import InCallManager from 'react-native-incall-manager';
import { request } from '../api';

const mockInCallManager = InCallManager as jest.Mocked<typeof InCallManager>;
const mockRequest = request as jest.MockedFunction<typeof request>;

describe('WebRTCService - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock InCallManager methods
    mockInCallManager.setKeepScreenOn = jest.fn();
    mockInCallManager.setForceSpeakerphoneOn = jest.fn();
    mockInCallManager.start = jest.fn();
    mockInCallManager.stop = jest.fn();
  });

  describe('Service Availability', () => {
    it('should be a singleton instance', () => {
      expect(WebRTCService).toBeDefined();
      expect(typeof WebRTCService).toBe('object');
    });

    it('should have core methods', () => {
      expect(typeof WebRTCService.startCall).toBe('function');
      expect(typeof WebRTCService.endCall).toBe('function');
      expect(typeof WebRTCService.getCallState).toBe('function');
      expect(typeof WebRTCService.isCallActive).toBe('function');
    });
  });

  describe('Call State Management', () => {
    it('should get call state', () => {
      const state = WebRTCService.getCallState();

      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
      expect(state).toHaveProperty('isActive');
      expect(state).toHaveProperty('isMuted');
      expect(state).toHaveProperty('isVideoEnabled');
    });

    it('should check if call is active', () => {
      const isActive = WebRTCService.isCallActive();

      expect(typeof isActive).toBe('boolean');
    });

    it('should indicate call is not active by default', () => {
      const isActive = WebRTCService.isCallActive();
      const state = WebRTCService.getCallState();

      expect(isActive).toBe(false);
      expect(state.isActive).toBe(false);
    });
  });

  describe('Call Controls (with mock stream)', () => {
    beforeEach(() => {
      // Mock the localStream on the service
      (WebRTCService as any).localStream = {
        getAudioTracks: jest.fn().mockReturnValue([
          { enabled: true, _switchCamera: jest.fn() }
        ]),
        getVideoTracks: jest.fn().mockReturnValue([
          { enabled: true, _switchCamera: jest.fn() }
        ]),
        getTracks: jest.fn().mockReturnValue([]),
      };

      (WebRTCService as any).callState = {
        isActive: true,
        isMuted: false,
        isVideoEnabled: true,
        callType: 'voice',
        remoteUserId: 'user123',
      };
    });

    it('should toggle mute when stream exists', () => {
      WebRTCService.toggleMute();

      const state = WebRTCService.getCallState();
      expect(state.isMuted).toBe(true);
    });

    it('should toggle video when stream exists', () => {
      WebRTCService.toggleVideo();

      const state = WebRTCService.getCallState();
      expect(state.isVideoEnabled).toBe(false);
    });

    it('should switch camera when stream exists', () => {
      WebRTCService.switchCamera();

      // Camera switching is handled internally, just verify no errors
      expect(WebRTCService.getCallState().isActive).toBe(true);
    });
  });

  describe('WebRTC Signaling', () => {
    it('should have WebRTC signaling methods available', () => {
      // Just verify the methods exist and are functions
      expect(typeof WebRTCService.handleOffer).toBe('function');
      expect(typeof WebRTCService.handleAnswer).toBe('function');
      expect(typeof WebRTCService.handleIceCandidate).toBe('function');
    });
  });
});
