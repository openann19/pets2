import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Declare global variables and types for tests
declare global {
  const __DEV__: boolean;
  
  namespace jest {
    interface Matchers<R> {
      toHaveAnimatedStyle: (style: object) => R;
      toBeReanimated: (value: number) => R;
    }
  }
}

// Configure Jest environment
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (initial: number) => ({ value: initial }),
  withTiming: (toValue: number) => toValue,
  withSpring: (toValue: number) => toValue,
  withDelay: (_: number, animation: any) => animation,
  runOnJS: (fn: Function) => fn,
  withSequence: (...animations: number[]) => animations[animations.length - 1],
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-keychain', () => ({
  SECURITY_LEVEL_ANY: 'MOCK_SECURITY_LEVEL_ANY',
  SECURITY_LEVEL_SECURE_SOFTWARE: 'MOCK_SECURITY_LEVEL_SECURE_SOFTWARE',
  SECURITY_LEVEL_SECURE_HARDWARE: 'MOCK_SECURITY_LEVEL_SECURE_HARDWARE',
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {
    ACTIVE: 'ACTIVE',
    END: 'END',
  },
}));

beforeAll(() => {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
});

afterEach(() => {
  jest.clearAllMocks();
});
