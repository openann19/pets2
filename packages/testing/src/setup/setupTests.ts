/**
 * Comprehensive Test Setup
 * Advanced test setup for error boundaries, payment flows, offline scenarios, and edge cases
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [0];
  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
  configurable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  send: jest.fn(),
  readyState: 1,
}));

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
});

// Mock Permissions API
Object.defineProperty(navigator, 'permissions', {
  writable: true,
  value: {
    query: jest.fn().mockResolvedValue({ state: 'granted' }),
  },
});

// Mock Geolocation API
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock Camera API
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
    enumerateDevices: jest.fn().mockResolvedValue([]),
  },
});

// Mock Battery API
Object.defineProperty(navigator, 'getBattery', {
  writable: true,
  value: jest.fn().mockResolvedValue({
    charging: true,
    chargingTime: Infinity,
    dischargingTime: Infinity,
    level: 1,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
});

// Mock Vibration API
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
});

// Mock Clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
});

// Mock Payment Request API
Object.defineProperty(window, 'PaymentRequest', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    show: jest.fn().mockResolvedValue({
      complete: jest.fn().mockResolvedValue(undefined),
      details: {},
      methodName: 'basic-card',
      payerEmail: 'test@example.com',
      payerName: 'Test User',
      payerPhone: '+1234567890',
      shippingAddress: null,
      shippingOption: null,
    }),
    canMakePayment: jest.fn().mockResolvedValue(true),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    createPaymentMethod: jest.fn().mockResolvedValue({
      paymentMethod: { id: 'pm_test' },
    }),
    confirmCardPayment: jest.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
    }),
    createPaymentIntent: jest.fn().mockResolvedValue({
      paymentIntent: { id: 'pi_test', client_secret: 'pi_test_secret' },
    }),
    retrievePaymentIntent: jest.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
    }),
  })),
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn().mockResolvedValue(true),
  },
  NetInfo: {
    fetch: jest.fn().mockResolvedValue({ isConnected: true }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock React Native Biometrics
jest.mock('react-native-biometrics', () => ({
  isSensorAvailable: jest.fn().mockResolvedValue({ available: true, biometryType: 'TouchID' }),
  createKeys: jest.fn().mockResolvedValue({ publicKey: 'test-key' }),
  deleteKeys: jest.fn().mockResolvedValue(undefined),
  biometricKeysExist: jest.fn().mockResolvedValue({ keysExist: true }),
  simplePrompt: jest.fn().mockResolvedValue({ success: true }),
  createSignature: jest.fn().mockResolvedValue({ success: true, signature: 'test-signature' }),
}));

// Mock React Native WebRTC
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn().mockImplementation(() => ({
    createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'test-sdp' }),
    createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'test-sdp' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    setRemoteDescription: jest.fn().mockResolvedValue(undefined),
    addIceCandidate: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  RTCSessionDescription: jest.fn(),
  RTCIceCandidate: jest.fn(),
  mediaDevices: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
}));

// Mock React Native InCall Manager
jest.mock('react-native-incall-manager', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  setSpeakerphoneOn: jest.fn(),
  setKeepScreenOn: jest.fn(),
  setForceSpeakerphoneOn: jest.fn(),
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useMotionValue: jest.fn(() => ({ get: jest.fn(), set: jest.fn() })),
  useTransform: jest.fn(() => jest.fn()),
  useSpring: jest.fn(() => ({})),
  useAnimation: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  })),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Zustand
jest.mock('zustand', () => ({
  create: jest.fn((fn) => fn),
  subscribeWithSelector: jest.fn((fn) => fn),
}));

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    setValue: jest.fn(),
    getValues: jest.fn(),
    reset: jest.fn(),
    watch: jest.fn(),
  })),
  Controller: ({ render }: { render: (props: unknown) => React.ReactNode }) => render({}),
}));

// Mock Zod
jest.mock('zod', () => ({
  z: {
    string: jest.fn(() => ({
      min: jest.fn(() => ({ parse: jest.fn() })),
      email: jest.fn(() => ({ parse: jest.fn() })),
      parse: jest.fn(),
    })),
    object: jest.fn(() => ({
      parse: jest.fn(),
    })),
  },
}));

// Mock Sentry
jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() })),
  configureScope: jest.fn(),
}));

// Mock Analytics
jest.mock('@analytics/core', () => ({
  track: jest.fn(),
  identify: jest.fn(),
  page: jest.fn(),
  reset: jest.fn(),
}));

// Global test utilities
declare global {
  // eslint-disable-next-line no-var
  var mockFetch: (response: unknown, options?: { ok?: boolean; status?: number; headers?: Record<string, string> }) => void;
  // eslint-disable-next-line no-var
  var mockFetchError: (error: unknown) => void;
  // eslint-disable-next-line no-var
  var mockNetworkError: () => void;
}

global.mockFetch = (response: unknown, options: { ok?: boolean; status?: number; headers?: Record<string, string> } = {}) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(response),
    ...options,
  });
};

global.mockFetchError = (error: unknown) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(error);
};

global.mockNetworkError = () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
};

global.mockOffline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false,
  });
  window.dispatchEvent(new Event('offline'));
};

global.mockOnline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });
  window.dispatchEvent(new Event('online'));
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Export test utilities
export {
  localStorageMock,
  sessionStorageMock,
};