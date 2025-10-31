/**
 * Setup file for Jest tests
 */

// Mock modules
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

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));
