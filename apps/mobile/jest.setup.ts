import { jest } from '@jest/globals';
// import '@testing-library/jest-native/extend-expect'; // Moved to end after mocks

// Silence noisy RN timers etc. when needed
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (objs: any) => objs.ios
}));

// If you need a design-token fallback to avoid hex literals in tests:
jest.mock('@pawfectmatch/design-tokens', () => ({
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

// RN Reanimated official mock
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
// Silence useNativeDriver warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

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
}));

// Mock expo-font to prevent font loading issues
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(async () => undefined),
  isLoaded: jest.fn(() => true),
  FontSource: {
    GoogleSans: {},
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Feather: 'Feather',
}));

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

// Mock React Native modules to avoid TurboModuleRegistry issues while preserving AccessibilityInfo
jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native') as typeof import('react-native');
  const mockedStyleSheet = {
    ...(actualReactNative.StyleSheet as any),
    create: jest.fn((styles: Record<string, unknown>) => styles),
    flatten: jest.fn((style: unknown) => style),
  } as typeof actualReactNative.StyleSheet;

  const mockedAnimated = {
    ...(actualReactNative.Animated as any),
    timing: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    delay: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    Value: jest.fn(() => ({ setValue: jest.fn(), addListener: jest.fn() })),
  } as typeof actualReactNative.Animated;

  const mockedPlatform = {
    ...(actualReactNative.Platform as any),
    OS: 'ios',
    select: (obj: any) => obj?.ios ?? obj?.default,
  } as typeof actualReactNative.Platform;

  const mockedDimensions = {
    ...(actualReactNative.Dimensions as any),
    get: jest.fn(() => ({ width: 375, height: 812 })),
  } as typeof actualReactNative.Dimensions;

  const mockedNativeModules = {
    ...(actualReactNative.NativeModules as any),
    RNKeychainManager: {},
  } as typeof actualReactNative.NativeModules;

  return {
    ...(actualReactNative as any),
    StyleSheet: mockedStyleSheet,
    Animated: mockedAnimated,
    Platform: mockedPlatform,
    Dimensions: mockedDimensions,
    NativeModules: mockedNativeModules,
  } as typeof import('react-native');
});

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Navigation helpers (only if you have tests relying on navigation)
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), dispatch: jest.fn() }),
  };
});
