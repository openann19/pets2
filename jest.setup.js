// Jest setup file for PawfectMatch monorepo
// This file contains global test setup that applies to all workspaces

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out React warnings that are not relevant to our tests
  const message = args.join(' ');
  if (
    message.includes('Warning: ReactDOM.render is no longer supported') ||
    message.includes('Warning: ReactDOMTestUtils') ||
    message.includes('Warning: An update to') && message.includes('inside a test was not wrapped in act(...)')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to flush promises
  flushPromises: () => new Promise(resolve => setImmediate(resolve)),

  // Helper to create mock functions with implementation
  createMock: (implementation = () => {}) => jest.fn(implementation),

  // Helper to mock async functions
  createAsyncMock: (result = null) => jest.fn().mockResolvedValue(result),
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Global test timeout
jest.setTimeout(10000);
