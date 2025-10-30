/**
 * Mock setup for jest tests
 * This file runs before all tests to set up necessary mocks
 */

// Mock the logger to avoid unnecessary output during tests
jest.mock('../src/utils/logger', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    request: jest.fn(),
    apiError: jest.fn(),
    security: jest.fn(),
    performance: jest.fn(),
  },
}));

// Mock Sentry
jest.mock('../src/config/sentry', () => ({
  initSentry: jest.fn(),
}));
