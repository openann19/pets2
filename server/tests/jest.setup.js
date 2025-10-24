/**
 * Jest Setup File for PawfectMatch Tests
 * 
 * This file is run before each test file to set up the testing environment
 * It includes global mocks and configuration for all tests
 */

/* eslint-disable no-undef */

// Make Jest globals available
global.jest = jest;
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// Mock fetch for all tests
global.fetch = jest.fn();

// Setup environment variables for tests
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.STRIPE_SECRET_KEY = 'test_stripe_secret';
process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.CLIENT_URL = 'http://localhost:3000';

// Helper to check if a function is mocked
global.isMockFunction = (fn) => {
  return !!fn && !!fn.mock;
};

// Helper for timing tests
global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper for JWT tokens in tests
global.generateTestToken = (userId = 'test123', role = 'user') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Helper for failed assertions
global.fail = (message) => {
  throw new Error(message);
};

// Mock console methods to keep test output clean
const consoleRef = globalThis.console;
const originalConsole = {
  log: consoleRef.log,
  error: consoleRef.error,
  warn: consoleRef.warn
};
global.silenceConsole = () => {
  consoleRef.log = jest.fn();
  consoleRef.error = jest.fn();
  consoleRef.warn = jest.fn();
};
global.restoreConsole = () => {
  consoleRef.log = originalConsole.log;
  consoleRef.error = originalConsole.error;
  consoleRef.warn = originalConsole.warn;
};

// Useful for schema validation tests
global.expectValidationError = async (promise, errorMessage) => {
  try {
    await promise;
    fail('Expected validation error but none was thrown');
  } catch (error) {
    if (errorMessage) {
      expect(error.message).toContain(errorMessage);
    }
    expect(error).toBeDefined();
  }
};

// Clean up any resources when tests are done
afterAll(() => {
  jest.clearAllMocks();
});

/* eslint-enable no-undef */
