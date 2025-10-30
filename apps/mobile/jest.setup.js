/**
 * Jest Setup File for Mobile App
 * 
 * This file sets up the testing environment for React Native/Expo
 * with proper mocks and global configurations.
 */

import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native modules that might cause issues
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

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
  MediaTypeOptions: {
    Images: 'images',
    Videos: 'videos',
    All: 'all',
  },
}));

// Mock React Native specific modules
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
}));

jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
}));

// Mock Metro bundler
jest.mock('metro-react-native-babel-preset');

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
