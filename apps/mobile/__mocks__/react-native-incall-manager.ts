// Mock for react-native-incall-manager
const InCallManager = {
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
};

export default InCallManager;
