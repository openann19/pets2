/**
 * Core Jest setup - Essential polyfills and global setup
 * Minimal setup loaded for all tests
 */

// Polyfill for TextEncoder/TextDecoder (Node.js 18+ has it built-in, but Jest may not)
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Global React Native mocks (to prevent tests from mocking react-native directly)
(global as any).Alert = {
  alert: jest.fn(),
};

(global as any).Platform = {
  OS: 'ios',
  Version: '14.0',
  select: jest.fn((obj) => obj.ios || obj.default),
  isTV: false,
  isTesting: true,
};

(global as any).Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

(global as any).Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

(global as any).Keyboard = {
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
  scheduleLayoutAnimation: jest.fn(),
};

// Global test setup with memory tracking
let testStartMemory: number | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  
  // Track memory usage at test start (if available)
  if ((global as any).gc) {
    (global as any).gc();
    testStartMemory = process.memoryUsage().heapUsed;
  }
});

// Global test cleanup with proper timer handling and memory leak detection
afterEach(() => {
  try {
    // Only check timers if fake timers are active
    // This check avoids errors when tests use real timers
    if (jest.isMockFunction(setTimeout) || jest.isMockFunction(setInterval)) {
      const timerCount = jest.getTimerCount();
      if (timerCount > 0) {
        jest.runOnlyPendingTimers();
      }
    }
  } catch (e) {
    // Ignore errors from timer operations
  }
  
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Always restore real timers to prevent leakage
  try {
    jest.useRealTimers();
  } catch (e) {
    // Timer may not be mocked, ignore
  }
  
  // Memory leak detection (if gc is available)
  if ((global as any).gc && testStartMemory !== null) {
    (global as any).gc();
    const testEndMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = testEndMemory - testStartMemory;
    
    // Warn if memory grew more than 5MB during a single test
    if (memoryGrowth > 5 * 1024 * 1024) {
      console.warn(`Potential memory leak detected: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB growth`);
    }
    
    testStartMemory = null;
  }
});

// Note: Console mocking removed to allow proper debugging
// If needed, tests can mock console individually

