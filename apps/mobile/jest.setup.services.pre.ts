/**
 * Services pre-setup: runs before modules are loaded.
 * Ensures native/ESM-heavy modules are mocked for Node/Jest.
 */

// Sentry: prevent native wrapper access during services tests
jest.mock('@sentry/react-native', () => ({
  __esModule: true,
  default: {},
  addBreadcrumb: jest.fn(),
  addIntegration: jest.fn(),
  captureException: jest.fn(),
  captureEvent: jest.fn(),
  captureFeedback: jest.fn(),
  captureMessage: jest.fn(),
  Scope: jest.fn(),
  setContext: jest.fn(),
  setExtra: jest.fn(),
  setExtras: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
}));

// Native modules used by services
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  ACCESS_CONTROL: {
    USER_PRESENCE: 'userPresence',
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'biometryAnyOrDevicePasscode',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
  },
}));

jest.mock('react-native-aes-crypto', () => ({
  pbkdf2: jest.fn().mockResolvedValue('key'),
  encrypt: jest.fn().mockResolvedValue('cipher'),
  decrypt: jest.fn().mockResolvedValue('plain'),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
}));

// Logger: provide a silent mock to avoid async logging after tests complete
jest.mock(require.resolve('./src/services/logger.ts'), () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    security: jest.fn(),
    trackFeature: jest.fn(),
  },
}));

export {};

// Provide a minimal react-native mock for services tests to satisfy NativeModules usage
jest.mock('react-native', () => ({
  NativeModules: {
    RNSentry: {
      nativeCrash: jest.fn(),
    },
  },
  Alert: { alert: jest.fn() },
}));

// Mock react-native-webrtc to avoid native module usage
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn(() => ({
    addStream: jest.fn(),
    addTrack: jest.fn(),
    addIceCandidate: jest.fn(),
    createOffer: jest.fn().mockResolvedValue({ sdp: 'offer', type: 'offer' }),
    createAnswer: jest.fn().mockResolvedValue({ sdp: 'answer', type: 'answer' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    setRemoteDescription: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
    onicecandidate: null,
    onconnectionstatechange: null,
    oniceconnectionstatechange: null,
  })),
  RTCIceCandidate: jest.fn().mockImplementation((init: any) => init),
  RTCSessionDescription: jest.fn().mockImplementation((init: any) => init),
  mediaDevices: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn(() => []),
      getVideoTracks: jest.fn(() => []),
      getAudioTracks: jest.fn(() => []),
    }),
  },
}));

// Mock react-native-incall-manager to be a no-op object
jest.mock('react-native-incall-manager', () => ({
  __esModule: true,
  default: {
    start: jest.fn(),
    stop: jest.fn(),
    setForceSpeakerphoneOn: jest.fn(),
    setMicrophoneMute: jest.fn(),
  },
}));

// Note: axios is mocked in specific tests (e.g., ApiClient). Avoid global axios mock here to prevent conflicts.

// Mock core exports used by services (logger + UnifiedAPIClient)
jest.mock('@pawfectmatch/core', () => {
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    security: jest.fn(),
    trackFeature: jest.fn(),
  };

  class UnifiedAPIClient {
    constructor(_config?: any) {}
    setOnlineStatus = jest.fn();
    getCircuitBreakerMetrics = jest.fn(() => ({
      open: false,
      failureCount: 0,
      successCount: 0,
    }));
    getQueueStats = jest.fn(() => ({ size: 0 }));
    destroy = jest.fn();
  }

  return { logger, UnifiedAPIClient };
});

// Mock NetInfo to avoid real network listeners
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((handler: (state: { isConnected?: boolean }) => void) => {
    // Optionally notify initial state
    try { handler({ isConnected: true }); } catch {}
    // Return unsubscribe noop
    return jest.fn();
  }),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock AsyncStorage used by ApiClient
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Note: socket.io-client is mocked within specific tests; avoid global mock here.
