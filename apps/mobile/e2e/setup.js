/**
 * E2E Test Setup
 * Global setup for Detox tests
 */

const { device, element, by, waitFor } = require('detox');

beforeAll(async () => {
  await device.launchApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});

// Global test utilities
global.testUtils = {
  // Wait for element to be visible
  waitForElement: async (testID, timeout = 10000) => {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Wait for element to be not visible
  waitForElementToDisappear: async (testID, timeout = 10000) => {
    await waitFor(element(by.id(testID)))
      .not.toBeVisible()
      .withTimeout(timeout);
  },

  // Tap element by testID
  tapElement: async (testID) => {
    await element(by.id(testID)).tap();
  },

  // Type text into input
  typeText: async (testID, text) => {
    await element(by.id(testID)).typeText(text);
  },

  // Clear text from input
  clearText: async (testID) => {
    await element(by.id(testID)).clearText();
  },

  // Scroll to element
  scrollToElement: async (testID, direction = 'down') => {
    await element(by.id(testID)).scroll(direction);
  },

  // Take screenshot
  takeScreenshot: async (name) => {
    await device.takeScreenshot(name);
  },

  // Wait for network requests to complete
  waitForNetworkIdle: async (timeout = 5000) => {
    await new Promise(resolve => setTimeout(resolve, timeout));
  },

  // Mock network responses
  mockNetworkResponse: async (url, response) => {
    // Implementation depends on your network mocking strategy
    console.log(`Mocking ${url} with response:`, response);
  },

  // Reset app state
  resetApp: async () => {
    await device.reloadReactNative();
  },

  // Navigate back
  goBack: async () => {
    if (device.getPlatform() === 'ios') {
      await element(by.traits(['button'])).atIndex(0).tap();
    } else {
      await device.pressBack();
    }
  },

  // Swipe gestures
  swipeLeft: async (testID) => {
    await element(by.id(testID)).swipe('left');
  },

  swipeRight: async (testID) => {
    await element(by.id(testID)).swipe('right');
  },

  swipeUp: async (testID) => {
    await element(by.id(testID)).swipe('up');
  },

  swipeDown: async (testID) => {
    await element(by.id(testID)).swipe('down');
  },

  // Long press
  longPress: async (testID) => {
    await element(by.id(testID)).longPress();
  },

  // Check if element exists
  elementExists: async (testID) => {
    try {
      await element(by.id(testID)).toBeVisible();
      return true;
    } catch {
      return false;
    }
  },

  // Get element text
  getElementText: async (testID) => {
    const attributes = await element(by.id(testID)).getAttributes();
    return attributes.text || attributes.label;
  },

  // Wait for specific text to appear
  waitForText: async (text, timeout = 10000) => {
    await waitFor(element(by.text(text)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Check accessibility
  checkAccessibility: async (testID) => {
    const attributes = await element(by.id(testID)).getAttributes();
    return {
      accessible: attributes.accessible,
      accessibilityLabel: attributes.accessibilityLabel,
      accessibilityHint: attributes.accessibilityHint,
    };
  },

  // Platform-specific helpers
  isIOS: () => device.getPlatform() === 'ios',
  isAndroid: () => device.getPlatform() === 'android',

  // Device info
  getDeviceInfo: async () => {
    return {
      platform: device.getPlatform(),
      version: await device.getPlatformVersion(),
    };
  },

  // Network state
  setNetworkState: async (state) => {
    // Implementation depends on your network mocking
    console.log(`Setting network state to: ${state}`);
  },

  // Biometric authentication simulation
  simulateBiometricAuth: async (success = true) => {
    if (device.getPlatform() === 'ios') {
      // iOS biometric simulation
      console.log(`Simulating biometric auth: ${success ? 'success' : 'failure'}`);
    } else {
      // Android biometric simulation
      console.log(`Simulating biometric auth: ${success ? 'success' : 'failure'}`);
    }
  },

  // Location simulation
  setLocation: async (latitude, longitude) => {
    console.log(`Setting location to: ${latitude}, ${longitude}`);
  },

  // Camera simulation
  simulateCameraCapture: async (imagePath) => {
    console.log(`Simulating camera capture with image: ${imagePath}`);
  },

  // Push notification simulation
  simulatePushNotification: async (notification) => {
    console.log(`Simulating push notification:`, notification);
  },

  // Deep link simulation
  openDeepLink: async (url) => {
    await device.openURL({ url });
  },

  // App state management
  backgroundApp: async () => {
    await device.sendToHome();
  },

  foregroundApp: async () => {
    await device.launchApp();
  },

  // Performance monitoring
  startPerformanceMonitoring: async () => {
    console.log('Starting performance monitoring');
  },

  stopPerformanceMonitoring: async () => {
    console.log('Stopping performance monitoring');
  },

  // Memory usage
  getMemoryUsage: async () => {
    // Implementation depends on platform
    return { used: 0, total: 0 };
  },

  // Battery level
  getBatteryLevel: async () => {
    // Implementation depends on platform
    return 100;
  },

  // Network speed simulation
  setNetworkSpeed: async (speed) => {
    console.log(`Setting network speed to: ${speed}`);
  },

  // Error simulation
  simulateError: async (errorType) => {
    console.log(`Simulating error: ${errorType}`);
  },

  // Database operations (for testing)
  clearDatabase: async () => {
    console.log('Clearing test database');
  },

  seedDatabase: async (data) => {
    console.log('Seeding test database with:', data);
  },

  // File system operations
  createTestFile: async (path, content) => {
    console.log(`Creating test file: ${path}`);
  },

  deleteTestFile: async (path) => {
    console.log(`Deleting test file: ${path}`);
  },

  // Async operations
  delay: async (ms) => {
    await new Promise(resolve => setTimeout(resolve, ms));
  },

  // Retry mechanism
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxAttempts - 1) throw error;
        await global.testUtils.delay(delay);
      }
    }
  },
};

// Custom matchers for E2E tests
expect.extend({
  toBeVisibleOnScreen: async (element) => {
    try {
      await element.toBeVisible();
      return { pass: true, message: () => 'Element is visible' };
    } catch (error) {
      return { pass: false, message: () => `Element is not visible: ${error.message}` };
    }
  },

  toHaveText: async (element, expectedText) => {
    try {
      const attributes = await element.getAttributes();
      const actualText = attributes.text || attributes.label;
      const pass = actualText === expectedText;
      return {
        pass,
        message: () => pass 
          ? `Element has expected text: ${expectedText}`
          : `Expected text "${expectedText}", but got "${actualText}"`
      };
    } catch (error) {
      return { pass: false, message: () => `Error getting element text: ${error.message}` };
    }
  },

  toBeAccessible: async (element) => {
    try {
      const attributes = await element.getAttributes();
      const pass = attributes.accessible === true;
      return {
        pass,
        message: () => pass 
          ? 'Element is accessible'
          : 'Element is not accessible'
      };
    } catch (error) {
      return { pass: false, message: () => `Error checking accessibility: ${error.message}` };
    }
  },
});

