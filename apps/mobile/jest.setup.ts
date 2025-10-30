import { jest, beforeAll, afterAll } from '@jest/globals';

// Mock React Native FIRST to avoid ReactCurrentOwner errors
jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn((styles: Record<string, unknown>) => styles),
    flatten: jest.fn((style: unknown) => style),
  },
  Animated: {
    timing: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    delay: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    Value: jest.fn(() => ({ setValue: jest.fn(), addListener: jest.fn() })),
  },
  Platform: {
    OS: 'ios',
    select: (obj: any) => obj?.ios ?? obj?.default,
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  NativeModules: {
    RNKeychainManager: {},
  },
  Easing: {
    bezier: (_x1: number, _y1: number, _x2: number, _y2: number) => (t: number) => t,
  },
  AccessibilityInfo: {
    addEventListener: jest.fn((_event: string, _listener: (...args: unknown[]) => void) => ({
      remove: jest.fn(),
    })),
    removeEventListener: jest.fn(),
    setAccessibilityFocus: jest.fn(),
    isScreenReaderEnabled: jest.fn(async () => false),
    isBoldTextEnabled: jest.fn(async () => false),
    isGrayscaleEnabled: jest.fn(async () => false),
    isInvertColorsEnabled: jest.fn(async () => false),
    isReduceMotionEnabled: jest.fn(async () => false),
    isReduceTransparencyEnabled: jest.fn(async () => false),
  },
}));

// Silence noisy RN timers etc. when needed
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (objs: any) => objs.ios
}));

// If you need a design-token fallback to avoid hex literals in tests:
jest.mock('@pawfectmatch/design-tokens', () => ({
  __esModule: true,
  COLORS: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    success: {
      500: '#10b981',
    },
    warning: {
      500: '#f59e0b',
    },
    error: {
      500: '#ef4444',
    },
    info: {
      500: '#3b82f6',
    },
  },
  SPACING: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  RADIUS: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  createTheme: jest.fn(() => ({
    colors: {
      primary: '#2563EB',
      bg: '#FFFFFF',
      surface: '#F8FAFC',
      onBg: '#1E293B',
      onSurface: '#64748B',
      onPrimary: '#FFFFFF',
      danger: '#DC2626',
      success: '#16A34A',
      warning: '#D97706',
      border: '#E2E8F0',
      onMuted: '#64748B',
    },
    palette: {
      neutral: {
        50: '#F8FAFC',
        200: '#E2E8F0',
        900: '#000000',
        950: '#111111',
      },
      brand: {
        500: '#64748B',
      },
    },
  })),
}));

// Ensure React 18 act semantics
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill TextEncoder/TextDecoder for Node environment
const { TextEncoder, TextDecoder } = require('util') as any;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress console warnings during tests (act warnings, etc.)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress known warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: An update to') ||
       args[0].includes('Warning: ReactDOM.render is no longer supported'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Ensure React 18 act semantics
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

// Deterministic time + timers
jest.useFakeTimers({ legacyFakeTimers: false });
jest.setSystemTime(new Date('2024-01-01T00:00:00Z') as unknown as number);
// Deterministic RNG (override in tests if needed)
const fixedRandom = () => 0.421337;
Math.random = fixedRandom;

// RN Reanimated official mock - SINGLE SOURCE OF TRUTH
// All test files should use this mock from jest.setup.ts
// Do not add Reanimated mocks in individual test files
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
// Silence useNativeDriver warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Gesture Handler official mock (per user instructions)
jest.mock('react-native-gesture-handler', () => require('react-native-gesture-handler/jestSetup'));

// Expo Haptics: no-op (assert calls via mocks)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Common native/Expo modules
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children || null),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Expo modules mock (prevent NativeUnimoduleProxy errors)
jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  EventEmitter: class MockEventEmitter {
    addListener() {}
    removeListener() {}
    removeAllListeners() {}
  },
  requireNativeViewManager: jest.fn(() => ({})),
  requireNativeModule: jest.fn(() => ({})),
  createPermissionHook: jest.fn(() => () => [{ status: 'granted' }, jest.fn()]),
}));

// Mock expo-font to prevent font loading issues
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(async () => undefined),
  isLoaded: jest.fn(() => true),
  FontSource: {
    GoogleSans: {},
  },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => {
  const mockNetInfoState = {
    isConnected: true,
    type: 'wifi',
    isInternetReachable: true,
    details: null,
  };

  return {
    __esModule: true,
    default: {
      fetch: jest.fn(() => Promise.resolve(mockNetInfoState)),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      configure: jest.fn(),
      getCurrentState: jest.fn(() => Promise.resolve(mockNetInfoState)),
    },
    NetInfoStateType: {
      unknown: 'unknown',
      none: 'none',
      cellular: 'cellular',
      wifi: 'wifi',
      bluetooth: 'bluetooth',
      ethernet: 'ethernet',
      wimax: 'wimax',
      vpn: 'vpn',
      other: 'other',
    },
  };
});

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {},
}));

jest.mock('expo-linear-gradient', () => 'LinearGradient');

jest.mock('expo-av', () => ({
  Audio: {},
  Video: {},
}));

jest.mock('expo-camera', () => ({
  Camera: {},
  CameraType: {},
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  MediaTypeOptions: {
    Images: 'images',
    Videos: 'videos',
    All: 'all',
  },
  ImagePickerOptions: {},
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: null,
      accuracy: 10,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({
    remove: jest.fn(),
  })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve(null)),
  hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  LocationActivityType: {
    Other: 1,
    AutomotiveNavigation: 2,
    Fitness: 3,
    OtherNavigation: 4,
    Airborne: 5,
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturerName: 'Apple',
  modelName: 'iPhone',
  modelId: 'iPhone13,2',
  designName: 'iPhone',
  productName: 'iPhone',
  deviceYearClass: 2021,
  totalMemory: 4096,
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '15.0',
  osBuildId: '19A346',
  osInternalBuildId: '19A346',
  osBuildFingerprint: '',
  platformApiLevel: null,
  deviceName: 'iPhone',
  deviceType: 1,
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'expo-push-token' })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  NotificationPermissionsStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  AndroidImportance: {
    DEFAULT: 'default',
    HIGH: 'high',
    MAX: 'max',
    LOW: 'low',
    MIN: 'min',
    NONE: 'none',
    UNSPECIFIED: 'unspecified',
  },
}));

// Mock react-native-device-info
// Removed - package not installed

// Mock Metro bundler
jest.mock('metro-react-native-babel-preset');

// Mock Sentry to prevent ES module issues
jest.mock('@sentry/react-native', () => ({
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
  setUser: jest.fn(),
  startInactiveSpan: jest.fn(),
  startSpan: jest.fn(),
  startSpanManual: jest.fn(),
  getActiveSpan: jest.fn(),
  getRootSpan: jest.fn(),
  withActiveSpan: jest.fn(),
  suppressTracing: jest.fn(),
  spanToJSON: jest.fn(),
  spanIsSampled: jest.fn(),
  setMeasurement: jest.fn(),
  getCurrentScope: jest.fn(),
  getGlobalScope: jest.fn(),
  getIsolationScope: jest.fn(),
  getClient: jest.fn(),
  setCurrentClient: jest.fn(),
  addEventProcessor: jest.fn(),
  lastEventId: jest.fn(),
}));

// Mock expo-secure-store - must be before other mocks that use it
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  whenAvailable: jest.fn(),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
    ALWAYS: 'ALWAYS',
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  },
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2])),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  LocalAuthenticationResult: {
    Success: 'success',
    Cancel: 'cancel',
    NotEnrolled: 'notEnrolled',
    NotAvailable: 'notAvailable',
  },
  SecurityLevel: {
    NONE: 0,
    SECRET: 1,
    BIOMETRIC: 2,
  },
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  canImplyAuthentication: jest.fn(),
  getSupportedBiometryType: jest.fn(),
  ACCESS_CONTROL: {},
  ACCESSIBLE: {},
  AUTHENTICATION_TYPE: {},
  BIOMETRY_TYPE: {},
}));

// Mock react-native-aes-crypto
jest.mock('react-native-aes-crypto', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  generateKey: jest.fn(),
  hash: jest.fn(),
}));

// Mock react-native-encrypted-storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock logger with all required methods
jest.mock('@pawfectmatch/core', () => ({
  ...jest.requireActual('@pawfectmatch/core'),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    security: jest.fn(),
    trackFeature: jest.fn(),
    bufferOfflineLog: jest.fn().mockResolvedValue(undefined),
    flushOfflineLogs: jest.fn().mockResolvedValue(undefined),
    setUserInfo: jest.fn(),
    clearUserInfo: jest.fn(),
    getSessionId: jest.fn().mockReturnValue('test-session'),
    destroy: jest.fn(),
  },
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock @react-native-masked-view/masked-view (required by react-navigation)
jest.mock('@react-native-masked-view/masked-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    default: React.forwardRef((props: any, ref: any) => React.createElement(View, { ...props, ref })),
  };
});

// Mock react-navigation/elements native view manager
jest.mock('@react-navigation/elements', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ...jest.requireActual('@react-navigation/elements'),
    MaskedView: View,
    MaskedViewNative: {
      getViewManagerConfig: jest.fn(() => ({})),
    },
  };
});

// Navigation helpers (only if you have tests relying on navigation)
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native') as typeof import('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), dispatch: jest.fn() }),
  } as typeof import('@react-navigation/native');
});

// Global test utilities
global.__DEV__ = true;

// Silence console warnings in tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Mock fetch for API calls
global.fetch = jest.fn();

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
});

// Ensure async operations complete before tests finish
afterEach(() => {
  // Clear any pending timers (using fake timers)
  jest.clearAllTimers();
  // Note: Real async operations should be awaited in tests
  // Fake timers are used, so setTimeout won't work here
});

// Extend expect with React Native matchers after all mocks are set up
import '@testing-library/jest-native/extend-expect';
