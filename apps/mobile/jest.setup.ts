/**
 * Main Jest setup file
 * Loads modular setup files conditionally based on test needs
 */

import '@testing-library/jest-native/extend-expect';

// React Native Reanimated recommended mock tweak
// @ts-ignore
global.ReanimatedDataMock = { now: () => Date.now() };

// Silence RN Animated warnings in tests
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock logger globally to prevent infinite loops
jest.mock('./src/services/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    security: jest.fn(),
    bufferOfflineLog: jest.fn().mockResolvedValue(undefined),
    flushOfflineLogs: jest.fn().mockResolvedValue(undefined),
    setUserInfo: jest.fn(),
    clearUserInfo: jest.fn(),
    getSessionId: jest.fn().mockReturnValue('test-session'),
    destroy: jest.fn(),
  }
}));

// Setup MSW server for API mocking (only in unit/integration tests)
// Temporarily disabled due to import issues - individual tests should mock APIs directly
// if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
//   try {
//     const { server } = require('./src/test-utils/msw/server');
//     
//     // Establish API mocking before all tests
//     beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
//     
//     // Reset any request handlers that may have been added during tests
//     afterEach(() => server.resetHandlers());
//     
//     // Clean up after all tests
//     afterAll(() => server.close());
//   } catch (error) {
//     // MSW not available, tests should mock APIs individually
//   }
// }

// Always load core setup
import './jest.setup.core';

// Load all mocks - modular files handle conditional logic internally
// Using require to ensure proper load order
require('./jest.setup.mocks.native');
require('./jest.setup.mocks.expo');
require('./jest.setup.mocks.navigation');
require('./jest.setup.mocks.external');
