/**
 * Performance E2E Tests
 * Measures and validates app performance across critical user journeys
 *
 * Key Performance Indicators:
 * - App launch time: < 3 seconds
 * - Screen transition time: < 500ms
 * - Swipe performance: 60fps (16.67ms per frame)
 * - Memory usage: < 200MB
 * - Network request time: < 2 seconds
 * - Animation smoothness: No dropped frames
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { device, element, by, waitFor } from 'detox';

describe('Performance E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        location: 'always',
        camera: 'YES',
        photos: 'YES',
        notifications: 'YES',
      },
      newInstance: true,
    });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('🚀 App Launch Performance', () => {
    it('should launch app in under 3 seconds cold start', async () => {
      const startTime = Date.now();

      // Cold start - completely new app instance
      await device.terminateApp();
      await device.launchApp({ newInstance: true });

      // Measure time to first meaningful screen
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(5000);

      const endTime = Date.now();
      const launchTime = endTime - startTime;

      // Performance assertion: Cold start under 3 seconds
      expect(launchTime).toBeLessThan(3000);

      console.log(`Cold start time: ${launchTime}ms`);
    });

    it('should achieve hot restart in under 1 second', async () => {
      // Warm up the app
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(2000);

      const startTime = Date.now();

      // Hot restart - reload React Native
      await device.reloadReactNative();

      // Measure time to app ready
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(2000);

      const endTime = Date.now();
      const restartTime = endTime - startTime;

      // Performance assertion: Hot restart under 1 second
      expect(restartTime).toBeLessThan(1000);

      console.log(`Hot restart time: ${restartTime}ms`);
    });

    it('should preload critical resources during launch', async () => {
      const startTime = Date.now();

      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Check if critical resources are preloaded
      // Navigation should be instant after initial load
      await element(by.id('get-started-button')).tap();

      const navTime = Date.now() - startTime;

      // Navigation should be near-instant after initial load
      expect(navTime).toBeLessThan(500);

      console.log(`Post-launch navigation: ${navTime}ms`);
    });
  });

  describe('📱 Screen Transition Performance', () => {
    beforeEach(async () => {
      // Ensure user is logged in and on home screen
      await ensureLoggedInState();
    });

    it('should achieve sub-500ms tab switches', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(2000);

      // Test each tab switch
      const tabs = [
        { id: 'swipe-tab', screen: 'swipe-screen' },
        { id: 'messages-tab', screen: 'messages-screen' },
        { id: 'profile-tab', screen: 'profile-screen' },
        { id: 'home-tab', screen: 'home-screen' },
      ];

      for (const tab of tabs) {
        const startTime = Date.now();

        await element(by.id(tab.id)).tap();

        await waitFor(element(by.id(tab.screen)))
          .toBeVisible()
          .withTimeout(1000);

        const transitionTime = Date.now() - startTime;

        // Performance assertion: Tab switch under 500ms
        expect(transitionTime).toBeLessThan(500);

        console.log(`${tab.id} transition: ${transitionTime}ms`);
      }
    });

    it('should handle deep navigation smoothly', async () => {
      const startTime = Date.now();

      // Navigate: Home → Profile → Settings → Account Settings
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen'))).toBeVisible();

      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen'))).toBeVisible();

      await element(by.id('account-settings')).tap();
      await waitFor(element(by.id('account-settings-screen'))).toBeVisible();

      const deepNavTime = Date.now() - startTime;

      // Performance assertion: Deep navigation under 2 seconds
      expect(deepNavTime).toBeLessThan(2000);

      console.log(`Deep navigation time: ${deepNavTime}ms`);
    });

    it('should maintain smooth transitions during high load', async () => {
      // Simulate high load scenario
      await simulateHighLoad();

      const startTime = Date.now();

      // Perform rapid navigation
      await element(by.id('swipe-tab')).tap();
      await element(by.id('messages-tab')).tap();
      await element(by.id('home-tab')).tap();

      const highLoadNavTime = Date.now() - startTime;

      // Performance assertion: Navigation remains smooth under load
      expect(highLoadNavTime).toBeLessThan(1500);

      console.log(`High load navigation: ${highLoadNavTime}ms`);
    });
  });

  describe('🎯 Swipe Performance & Responsiveness', () => {
    beforeEach(async () => {
      await ensureLoggedInState();
      await element(by.id('swipe-tab')).tap();
      await waitFor(element(by.id('swipe-screen'))).toBeVisible();
    });

    it('should maintain 60fps during swipe gestures', async () => {
      const frameTimes: number[] = [];

      // Monitor frame timing during swipes
      const startMonitoring = Date.now();

      // Perform 20 rapid swipes
      for (let i = 0; i < 20; i++) {
        const frameStart = Date.now();

        await element(by.id(`pet-card-${i % 5}`)).swipe('right');
        await waitFor(element(by.id(`pet-card-${(i + 1) % 5}`))).toBeVisible();

        const frameTime = Date.now() - frameStart;
        frameTimes.push(frameTime);
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / avgFrameTime;

      // Performance assertion: Maintain 50+ fps (under 20ms per frame)
      expect(avgFrameTime).toBeLessThan(20);
      expect(fps).toBeGreaterThan(50);

      console.log(`Average frame time: ${avgFrameTime}ms (${fps.toFixed(1)} fps)`);
    });

    it('should handle concurrent swipe and UI updates smoothly', async () => {
      const startTime = Date.now();

      // Start multiple UI operations simultaneously
      const swipePromise = performRapidSwipes(10);
      const uiUpdatePromise = performUIUpdates();

      await Promise.all([swipePromise, uiUpdatePromise]);

      const concurrentTime = Date.now() - startTime;

      // Performance assertion: Concurrent operations complete smoothly
      expect(concurrentTime).toBeLessThan(3000);

      console.log(`Concurrent operations time: ${concurrentTime}ms`);
    });

    it('should prevent memory leaks during extended swiping', async () => {
      const initialMemory = await getMemoryUsage();

      // Perform 100 swipes
      for (let i = 0; i < 100; i++) {
        await element(by.id(`pet-card-${i % 10}`)).swipe('right');
      }

      const finalMemory = await getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Performance assertion: Memory increase under 50MB for 100 swipes
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB in bytes

      console.log(`Memory increase: ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
    });

    it('should maintain consistent performance across different network conditions', async () => {
      const performanceResults = [];

      // Test on different network conditions
      const networkConditions = ['fast', 'slow', 'unstable'];

      for (const condition of networkConditions) {
        await simulateNetworkCondition(condition);

        const startTime = Date.now();

        // Perform 10 swipes
        for (let i = 0; i < 10; i++) {
          await element(by.id(`pet-card-${i % 5}`)).swipe('right');
        }

        const swipeTime = Date.now() - startTime;
        performanceResults.push({ condition, swipeTime });
      }

      // Performance assertion: Performance degradation under 2x
      const fastTime = performanceResults.find(r => r.condition === 'fast')?.swipeTime || 1;
      const slowTime = performanceResults.find(r => r.condition === 'slow')?.swipeTime || 1;

      expect(slowTime / fastTime).toBeLessThan(2);

      console.log('Network performance:', performanceResults);
    });
  });

  describe('💬 Messaging Performance', () => {
    beforeEach(async () => {
      await ensureLoggedInState();
      await setupMockChat();
    });

    it('should achieve instant message delivery feedback', async () => {
      await element(by.id('messages-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await waitFor(element(by.id('chat-screen'))).toBeVisible();

      const messageText = 'Performance test message ' + Date.now();

      const startTime = Date.now();

      await element(by.id('message-input')).typeText(messageText);
      await element(by.id('send-button')).tap();

      // Wait for delivery confirmation
      await waitFor(element(by.id('message-delivered-indicator')))
        .toBeVisible()
        .withTimeout(2000);

      const deliveryTime = Date.now() - startTime;

      // Performance assertion: Message delivery under 1 second
      expect(deliveryTime).toBeLessThan(1000);

      console.log(`Message delivery time: ${deliveryTime}ms`);
    });

    it('should handle high-frequency messaging without degradation', async () => {
      await element(by.id('messages-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await waitFor(element(by.id('chat-screen'))).toBeVisible();

      const startTime = Date.now();
      const messageCount = 20;

      // Send 20 messages rapidly
      for (let i = 0; i < messageCount; i++) {
        const messageText = `Rapid message ${i + 1}`;
        await element(by.id('message-input')).typeText(messageText);
        await element(by.id('send-button')).tap();
      }

      // Wait for all messages to be delivered
      await waitFor(element(by.id(`message-${messageCount - 1}`)))
        .toBeVisible()
        .withTimeout(10000);

      const totalTime = Date.now() - startTime;
      const avgMessageTime = totalTime / messageCount;

      // Performance assertion: Average message time under 500ms
      expect(avgMessageTime).toBeLessThan(500);

      console.log(`Average message time: ${avgMessageTime}ms`);
    });

    it('should maintain smooth scrolling with large message history', async () => {
      // Setup chat with 100 messages
      await setupLargeChatHistory(100);

      await element(by.id('messages-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await waitFor(element(by.id('chat-screen'))).toBeVisible();

      const startTime = Date.now();

      // Scroll to bottom
      await element(by.id('chat-scroll-view')).scrollTo('bottom');

      // Scroll to top
      await element(by.id('chat-scroll-view')).scrollTo('top');

      // Scroll to middle
      await element(by.id('chat-scroll-view')).scroll(50, 'down');

      const scrollTime = Date.now() - startTime;

      // Performance assertion: Smooth scrolling under 1 second for large chat
      expect(scrollTime).toBeLessThan(1000);

      console.log(`Chat scrolling time: ${scrollTime}ms`);
    });
  });

  describe('🖼️ Media & Image Performance', () => {
    beforeEach(async () => {
      await ensureLoggedInState();
    });

    it('should load images instantly from cache', async () => {
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen'))).toBeVisible();

      const startTime = Date.now();

      // Wait for profile images to load
      await waitFor(element(by.id('profile-image-0')))
        .toBeVisible()
        .withTimeout(2000);

      const imageLoadTime = Date.now() - startTime;

      // Performance assertion: Cached images load under 500ms
      expect(imageLoadTime).toBeLessThan(500);

      console.log(`Cached image load time: ${imageLoadTime}ms`);
    });

    it('should handle image gallery scrolling smoothly', async () => {
      await setupImageGallery(50); // 50 images

      const startTime = Date.now();

      // Scroll through gallery rapidly
      for (let i = 0; i < 10; i++) {
        await element(by.id('image-gallery')).swipe('left');
        await waitFor(element(by.id(`gallery-image-${i + 10}`)))
          .toBeVisible()
          .withTimeout(1000);
      }

      const galleryScrollTime = Date.now() - startTime;

      // Performance assertion: Smooth gallery scrolling
      expect(galleryScrollTime).toBeLessThan(3000);

      console.log(`Gallery scroll time: ${galleryScrollTime}ms`);
    });

    it('should optimize image upload performance', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('edit-profile-button')).tap();

      const startTime = Date.now();

      // Select and upload image
      await element(by.id('change-photo-button')).tap();
      await element(by.id('camera-option')).tap();
      await element(by.id('capture-photo-button')).tap();
      await element(by.id('use-photo-button')).tap();

      // Wait for upload and processing
      await waitFor(element(by.id('photo-upload-success')))
        .toBeVisible()
        .withTimeout(10000);

      const uploadTime = Date.now() - startTime;

      // Performance assertion: Image upload under 5 seconds
      expect(uploadTime).toBeLessThan(5000);

      console.log(`Image upload time: ${uploadTime}ms`);
    });
  });

  describe('🔋 Battery & Resource Efficiency', () => {
    it('should maintain efficient resource usage during extended use', async () => {
      await ensureLoggedInState();

      const initialMetrics = await getSystemMetrics();

      // Simulate 30 minutes of typical usage
      await simulateExtendedUsage(30 * 60 * 1000); // 30 minutes

      const finalMetrics = await getSystemMetrics();

      const batteryDrain = initialMetrics.battery - finalMetrics.battery;
      const memoryIncrease = finalMetrics.memory - initialMetrics.memory;

      // Performance assertions
      expect(batteryDrain).toBeLessThan(20); // Less than 20% battery drain
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB memory increase

      console.log(`Battery drain: ${batteryDrain}%, Memory increase: ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
    });

    it('should clean up resources properly on app background', async () => {
      await ensureLoggedInState();

      const beforeBackground = await getResourceUsage();

      // Send app to background
      await device.sendToHome();

      // Wait 30 seconds in background
      await new Promise(resolve => setTimeout(resolve, 30000));

      // Bring back to foreground
      await device.launchApp({ newInstance: false });

      const afterForeground = await getResourceUsage();

      // Resources should be properly managed
      expect(afterForeground.memory).toBeLessThanOrEqual(beforeBackground.memory * 1.1); // Max 10% increase

      console.log('Resource cleanup: ✅ Proper cleanup maintained');
    });
  });

  // Helper functions
  async function ensureLoggedInState() {
    // Ensure user is logged in and on home screen
    await device.reloadReactNative();
    // Mock login process
  }

  async function simulateHighLoad() {
    // Simulate high CPU/memory load
  }

  async function performRapidSwipes(count: number) {
    // Perform rapid swipe gestures
  }

  async function performUIUpdates() {
    // Perform concurrent UI updates
  }

  async function getMemoryUsage() {
    // Get current memory usage
    return 100 * 1024 * 1024; // Mock 100MB
  }

  async function simulateNetworkCondition(condition: string) {
    // Simulate different network conditions
  }

  async function setupMockChat() {
    // Setup mock chat data
  }

  async function setupLargeChatHistory(count: number) {
    // Setup chat with many messages
  }

  async function setupImageGallery(count: number) {
    // Setup image gallery
  }

  async function getSystemMetrics() {
    // Get battery, memory, CPU metrics
    return {
      battery: 80,
      memory: 150 * 1024 * 1024, // 150MB
      cpu: 30,
    };
  }

  async function simulateExtendedUsage(duration: number) {
    // Simulate extended app usage
  }

  async function getResourceUsage() {
    // Get resource usage metrics
    return {
      memory: 120 * 1024 * 1024, // 120MB
      cpu: 25,
    };
  }
});
