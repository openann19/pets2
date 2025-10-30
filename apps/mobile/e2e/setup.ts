/**
 * E2E Test Setup and Utilities
 * 
 * Global setup and teardown for Detox E2E tests.
 * Provides authentication, test data, and helper functions.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { device, expect, by, element } from 'detox';

// Global test timeout (default is 120s, increase for complex flows)
const E2E_TIMEOUT = 180000; // 3 minutes

/**
 * Global setup runs once before all E2E tests
 */
beforeAll(async () => {
  console.log('🔧 Setting up E2E test environment...');
  
  try {
    // Ensure app is installed and running
    await device.launchApp({
      newInstance: true,
      permissions: {
        notifications: 'YES',
        camera: 'YES',
        microphone: 'YES',
        location: 'always',
        photos: 'all',
      },
    });
    
    console.log('✅ Device ready');
  } catch (error) {
    console.error('❌ Failed to set up device:', error);
    throw error;
  }
});

/**
 * Global teardown runs once after all E2E tests
 */
afterAll(async () => {
  console.log('🧹 Cleaning up E2E test environment...');
  
  try {
    // Clean up any remaining state
    await device.clearScreenshot();
    await device.terminateApp();
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error);
  }
});

/**
 * Setup before each test
 */
beforeEach(async () => {
  // Relaunch app for clean state (optional, for isolation)
  // await device.relaunchApp();
});

/**
 * Teardown after each test
 */
afterEach(async () => {
  // Take screenshot on failure
  if (jasmine.currentSpec?.result?.failedExamples?.length > 0) {
    await device.takeScreenshot('test-failure');
  }
});

/**
 * Test utilities and helpers
 */
export const testHelpers = {
  /**
   * Wait for element to be visible
   */
  waitForElement: async (id: string, timeout: number = 5000) => {
    await waitFor(element(by.id(id)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  /**
   * Wait for element to be not visible
   */
  waitForElementHidden: async (id: string, timeout: number = 5000) => {
    await waitFor(element(by.id(id)))
      .toBeNotVisible()
      .withTimeout(timeout);
  },

  /**
   * Tap element by id
   */
  tapById: async (id: string) => {
    await element(by.id(id)).tap();
  },

  /**
   * Tap element by text
   */
  tapByText: async (text: string) => {
    await element(by.text(text)).tap();
  },

  /**
   * Type text into input
   */
  typeText: async (id: string, text: string) => {
    await element(by.id(id)).typeText(text);
  },

  /**
   * Clear text in input
   */
  clearText: async (id: string) => {
    await element(by.id(id)).clearText();
  },

  /**
   * Assert element is visible
   */
  expectVisible: async (id: string) => {
    await expect(element(by.id(id))).toBeVisible();
  },

  /**
   * Assert element has text
   */
  expectText: async (id: string, text: string) => {
    await expect(element(by.id(id))).toHaveText(text);
  },

  /**
   * Scroll to element
   */
  scrollTo: async (id: string, direction: 'up' | 'down' | 'left' | 'right' = 'down', distance?: number) => {
    await element(by.id(id)).scroll(distance || 200, direction);
  },

  /**
   * Long press element
   */
  longPress: async (id: string) => {
    await element(by.id(id)).longPress();
  },

  /**
   * Swipe element
   */
  swipe: async (id: string, direction: 'left' | 'right' | 'up' | 'down', fast?: boolean) => {
    await element(by.id(id)).swipe(direction, 'fast', 0.7, 0.5);
  },

  /**
   * Relaunch app (for clean state)
   */
  relaunchApp: async () => {
    await device.relaunchApp();
  },

  /**
   * Take screenshot with custom name
   */
  takeScreenshot: async (name: string) => {
    await device.takeScreenshot(name);
  },

  /**
   * Go back (Android hardware back button or iOS back gesture)
   */
  goBack: async () => {
    if (device.getPlatform() === 'ios') {
      // iOS uses back gesture or navigation
      await element(by.label('Back')).tap();
    } else {
      // Android hardware back button
      await device.pressBack();
    }
  },

  /**
   * Mock network condition
   */
  setNetworkCondition: async (condition: 'wifi' | 'cellular' | 'offline') => {
    // This would be implemented based on your test setup
    console.log(`📡 Network condition set to: ${condition}`);
  },

  /**
   * Authenticate test user
   */
  authenticate: async (email: string, password: string) => {
    await element(by.id('login-email-input')).typeText(email);
    await element(by.id('login-password-input')).typeText(password);
    await element(by.id('login-submit-button')).tap();
    
    // Wait for successful login
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  },

  /**
   * Skip onboarding if present
   */
  skipOnboarding: async () => {
    try {
      await waitFor(element(by.id('onboarding-skip-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('onboarding-skip-button')).tap();
    } catch (e) {
      // Onboarding not present, continue
    }
  },

  /**
   * Navigate to tab
   */
  navigateToTab: async (tabName: 'Home' | 'Explore' | 'Matches' | 'Profile') => {
    await element(by.id(`tab-${tabName.toLowerCase()}`)).tap();
    
    // Wait for screen to load
    await waitFor(element(by.id(`${tabName.toLowerCase()}-screen`)))
      .toBeVisible()
      .withTimeout(5000);
  },
};

// Export default timeouts
export const E2E_CONFIG = {
  TIMEOUT: E2E_TIMEOUT,
  ANIMATION_TIMEOUT: 2000,
  NETWORK_TIMEOUT: 10000,
  LOADING_TIMEOUT: 5000,
};

// Jest timeout
jest.setTimeout(E2E_TIMEOUT);

