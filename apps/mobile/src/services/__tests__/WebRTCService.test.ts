// Mock InCallManager specifically for this test - MUST be first
jest.mock('react-native-incall-manager', () => ({
  __esModule: true,
  default: {
    setSpeakerphoneOn: jest.fn(),
    setKeepScreenOn: jest.fn(),
    setForceSpeakerphoneOn: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    displayIncomingCall: jest.fn(),
    getSpeakerphoneOn: jest.fn(() => false),
    setMicrophoneMute: jest.fn(),
    turnScreenOn: jest.fn(),
    turnScreenOff: jest.fn(),
    setWiredHeadsetHfpOn: jest.fn(),
    setBluetoothScoOn: jest.fn(),
    setBluetoothScoOff: jest.fn(),
  },
}));

import { mediaDevices, RTCPeerConnection } from 'react-native-webrtc';

// Get the mocked InCallManager
const InCallManager = require('react-native-incall-manager').default;

// Import WebRTCService after mocks are set up
import WebRTCService from '../WebRTCService';

// Create an instance for testing
const webRTCService = new WebRTCService();

// Mock interfaces
interface MockMediaStreamTrack {
  enabled: boolean;
  stop?: jest.Mock;
  _switchCamera?: jest.Mock;
}

interface MockMediaStream {
  getTracks: jest.Mock;
  getAudioTracks: jest.Mock;
  getVideoTracks: jest.Mock;
}

// Mock dependencies
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn(),
  RTCIceCandidate: jest.fn(),
  RTCSessionDescription: jest.fn(),
  mediaDevices: {
    getUserMedia: jest.fn(),
  },
}));

jest.mock('react-native-incall-manager', () => ({
  default: {
    setSpeakerphoneOn: jest.fn(),
    setKeepScreenOn: jest.fn(),
    setForceSpeakerphoneOn: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    displayIncomingCall: jest.fn(),
    getSpeakerphoneOn: jest.fn(),
  },
}));

const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  connected: true,
};

const mockPeerConnection = {
  addTrack: jest.fn(),
  createOffer: jest.fn(),
  createAnswer: jest.fn(),
  setLocalDescription: jest.fn(),
  setRemoteDescription: jest.fn(),
  addIceCandidate: jest.fn(),
  close: jest.fn(),
  onicecandidate: null,
  ontrack: null,
  onconnectionstatechange: null,
  connectionState: 'new',
};

const mockMediaStream: MockMediaStream = {
  getTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => []),
};

describe('webRTCService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (RTCPeerConnection as jest.Mock).mockImplementation(() => mockPeerConnection);
    (mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockMediaStream);
    
    // Reset service state
    webRTCService.endCall();
  });

  describe('Initialization', () => {
    it('should initialize with socket', () => {
      webRTCService.initialize(mockSocket);
      
      expect(mockSocket.on).toHaveBeenCalledWith('incoming-call', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('call-answered', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('call-ended', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('webrtc-offer', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('webrtc-answer', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('webrtc-ice-candidate', expect.any(Function));
    });

    it('should setup InCallManager correctly', () => {
      // Debug: Check if InCallManager methods were called
      console.log('InCallManager.setKeepScreenOn calls:', InCallManager.setKeepScreenOn.mock.calls.length);
      console.log('InCallManager.setForceSpeakerphoneOn calls:', InCallManager.setForceSpeakerphoneOn.mock.calls.length);
      
      expect(InCallManager.setKeepScreenOn).toHaveBeenCalledWith(true);
      expect(InCallManager.setForceSpeakerphoneOn).toHaveBeenCalledWith(false);
    });
  });

  describe('Starting Calls', () => {
    beforeEach(() => {
      webRTCService.initialize(mockSocket);
    });

    it('should start voice call successfully', async () => {
      const mockAudioTrack: MockMediaStreamTrack = { enabled: true };
      mockMediaStream.getTracks.mockReturnValue([mockAudioTrack as any]);
      
      const result = await webRTCService.startCall('test-match-id', 'voice');
      
      expect(result).toBe(true);
      expect(mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
        video: false,
      });
      expect(RTCPeerConnection).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('initiate-call', expect.objectContaining({
        matchId: 'test-match-id',
        callType: 'voice',
      }));
      expect(InCallManager.start).toHaveBeenCalledWith({ media: 'audio' });
    });

    it('should start video call successfully', async () => {
      const mockVideoTrack: MockMediaStreamTrack = { enabled: true };
      const mockAudioTrack: MockMediaStreamTrack = { enabled: true };
      mockMediaStream.getTracks.mockReturnValue([mockAudioTrack as any, mockVideoTrack as any]);
      
      const result = await webRTCService.startCall('test-match-id', 'video');
      
      expect(result).toBe(true);
      expect(mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
        video: {
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          frameRate: { min: 16, ideal: 30 }
        },
      });
      expect(InCallManager.start).toHaveBeenCalledWith({ media: 'video' });
    });

    it('should handle getUserMedia failure', async () => {
      const error = new Error('Permission denied');
      (mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(error);
      
      const result = await webRTCService.startCall('test-match-id', 'voice');
      
      expect(result).toBe(false);
    });

    it('should emit call state changes', async () => {
      const mockListener = jest.fn();
      webRTCService.on('callStateChanged', mockListener);
      
      await webRTCService.startCall('test-match-id', 'voice');
      
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        isActive: true,
        isIncoming: false,
      }));
    });
  });

  describe('Answering Calls', () => {
    beforeEach(() => {
      webRTCService.initialize(mockSocket);
    });

    it('should answer incoming call successfully', async () => {
      // Simulate incoming call
      const callData = {
        callId: 'test-call-id',
        matchId: 'test-match-id',
        callerId: 'test-caller-id',
        callerName: 'Test Caller',
        callType: 'voice' as const,
        timestamp: Date.now(),
      };

      // Set up incoming call state
      const incomingCallHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'incoming-call'
      )?.[1];
      
      if (incomingCallHandler) {
        incomingCallHandler(callData);
      }

      const result = await webRTCService.answerCall();
      
      expect(result).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('answer-call', expect.objectContaining({
        matchId: 'test-match-id',
      }));
      expect(InCallManager.start).toHaveBeenCalled();
    });

    it('should handle answer call without call data', async () => {
      const result = await webRTCService.answerCall();
      
      expect(result).toBe(false);
    });
  });

  describe('Call Controls', () => {
    beforeEach(() => {
      webRTCService.initialize(mockSocket);
    });

    it('should toggle mute', async () => {
      const mockAudioTrack: MockMediaStreamTrack = { enabled: true };
      mockMediaStream.getAudioTracks.mockReturnValue([mockAudioTrack as any]);
      
      await webRTCService.startCall('test-match-id', 'voice');
      
      webRTCService.toggleMute();
      
      expect(mockAudioTrack.enabled).toBe(false);
    });

    it('should toggle video', async () => {
      const mockVideoTrack: MockMediaStreamTrack = { enabled: true };
      mockMediaStream.getVideoTracks.mockReturnValue([mockVideoTrack as any]);
      
      await webRTCService.startCall('test-match-id', 'video');
      
      webRTCService.toggleVideo();
      
      expect(mockVideoTrack.enabled).toBe(false);
    });

    it('should switch camera', async () => {
      const mockVideoTrack: MockMediaStreamTrack = { enabled: true, _switchCamera: jest.fn() };
      mockMediaStream.getVideoTracks.mockReturnValue([mockVideoTrack as any]);
      
      await webRTCService.startCall('test-match-id', 'video');
      
      await webRTCService.switchCamera();
      
      expect(mockVideoTrack._switchCamera).toHaveBeenCalled();
    });

    it('should toggle speaker', () => {
      webRTCService.toggleSpeaker();
      
      expect(InCallManager.setForceSpeakerphoneOn).toHaveBeenCalledWith(true);
    });
  });

  describe('Ending Calls', () => {
    beforeEach(() => {
      webRTCService.initialize(mockSocket);
    });

    it('should end call and clean up resources', async () => {
      const mockTrack: MockMediaStreamTrack = { enabled: true, stop: jest.fn() };
      mockMediaStream.getTracks.mockReturnValue([mockTrack as any]);
      
      await webRTCService.startCall('test-match-id', 'voice');
      
      webRTCService.endCall();
      
      expect(mockPeerConnection.close).toHaveBeenCalled();
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(InCallManager.stop).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('end-call', expect.any(Object));
    });

    it('should reject incoming call', () => {
      const callData = {
        callId: 'test-call-id',
        matchId: 'test-match-id',
        callerId: 'test-caller-id',
        callerName: 'Test Caller',
        callType: 'voice' as const,
        timestamp: Date.now(),
      };

      // Simulate incoming call
      const incomingCallHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'incoming-call'
      )?.[1];
      
      if (incomingCallHandler) {
        incomingCallHandler(callData);
      }

      webRTCService.rejectCall();
      
      expect(mockSocket.emit).toHaveBeenCalledWith('reject-call', expect.objectContaining({
        callId: 'test-call-id',
        matchId: 'test-match-id',
      }));
    });
  });

  describe('Call State Management', () => {
    it('should return correct call state', () => {
      const initialState = webRTCService.getCallState();
      
      expect(initialState).toEqual({
        isActive: false,
        isConnected: false,
        isIncoming: false,
        isMuted: false,
        isVideoEnabled: true,
        callDuration: 0,
      });
    });

    it('should return correct call active status', () => {
      expect(webRTCService.isCallActive()).toBe(false);
    });

    it('should update call state during call', async () => {
      await webRTCService.startCall('test-match-id', 'voice');
      
      expect(webRTCService.isCallActive()).toBe(true);
      
      const state = webRTCService.getCallState();
      expect(state.isActive).toBe(true);
      expect(state.isIncoming).toBe(false);
    });
  });

  describe('WebRTC Signaling', () => {
    beforeEach(() => {
      webRTCService.initialize(mockSocket);
    });

    it('should handle WebRTC offer', async () => {
      const mockOffer = { type: 'offer', sdp: 'mock-sdp' };
      mockPeerConnection.createAnswer.mockResolvedValue(mockOffer);
      
      await webRTCService.startCall('test-match-id', 'voice');
      
      const offerHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'webrtc-offer'
      )?.[1];
      
      if (offerHandler) {
        await offerHandler({ offer: mockOffer });
      }
      
      expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
      expect(mockPeerConnection.createAnswer).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('webrtc-answer', expect.any(Object));
    });

    it('should handle WebRTC answer', async () => {
      const mockAnswer = { type: 'answer', sdp: 'mock-sdp' };
      
      await webRTCService.startCall('test-match-id', 'voice');
      
      const answerHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'webrtc-answer'
      )?.[1];
      
      if (answerHandler) {
        await answerHandler({ answer: mockAnswer });
      }
      
      expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
    });

    it('should handle ICE candidates', async () => {
      const mockCandidate = { candidate: 'mock-candidate' };
      
      await webRTCService.startCall('test-match-id', 'voice');
      
      const candidateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'webrtc-ice-candidate'
      )?.[1];
      
      if (candidateHandler) {
        await candidateHandler({ candidate: mockCandidate });
      }
      
      expect(mockPeerConnection.addIceCandidate).toHaveBeenCalled();
    });
  });
});
