/**
 * Pre-setup for React Native mocks
 * This file runs BEFORE jest.setup.ts to ensure react-native is mocked
 * before any modules are imported
 */

// Mock React Native FIRST - Jest will automatically use __mocks__/react-native.js
// This ensures StyleSheet and Dimensions are available when modules are evaluated
jest.mock('react-native', () => {
  return {
    StatusBar: {
      setBarStyle: jest.fn(),
      setHidden: jest.fn(),
      setBackgroundColor: jest.fn(),
      setTranslucent: jest.fn(),
      setNetworkActivityIndicatorVisible: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    InteractionManager: {
      runAfterInteractions: jest.fn((callback: any) => {
        if (typeof callback === 'function') {
          callback();
        }
        return { then: jest.fn() };
      }),
      createInteractionHandle: jest.fn(() => 1),
      clearInteractionHandle: jest.fn(),
      setDeadline: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      Version: 15,
      select: jest.fn((obj: any) => obj?.ios || obj?.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812, scale: 2 })),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
    StyleSheet: {
      create: jest.fn((styles: any) => styles),
      flatten: jest.fn((style: any) => style),
    },
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
      currentState: 'active',
    },
  };
});


