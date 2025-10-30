// Mock for react-native-webrtc
export const RTCPeerConnection = jest.fn().mockImplementation(() => ({
  createOffer: jest.fn().mockResolvedValue({}),
  createAnswer: jest.fn().mockResolvedValue({}),
  setLocalDescription: jest.fn().mockResolvedValue(undefined),
  setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  addIceCandidate: jest.fn().mockResolvedValue(undefined),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

export const RTCIceCandidate = jest.fn().mockImplementation((init) => init);
export const RTCSessionDescription = jest.fn().mockImplementation((init) => init);

export const mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{ _switchCamera: jest.fn() }]
  }),
  enumerateDevices: jest.fn().mockResolvedValue([]),
};

export type MediaStream = {
  getTracks: () => any[];
  getVideoTracks: () => any[];
  getAudioTracks: () => any[];
};

export type MediaStreamTrack = {
  _switchCamera?: () => void;
};
