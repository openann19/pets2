// Simple setup for basic hook testing
import { jest } from '@jest/globals';

// Mock React Native
jest.mock('react-native', () => ({
  StyleSheet: {
    create: (styles) => styles,
  },
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
  },
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn(() => ({})),
      setValue: jest.fn(),
    })),
    View: 'View',
    Text: 'Text',
    createAnimatedComponent: (component) => component,
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
  removeEventListener: jest.fn(),
}));
