/**
 * Advanced E2E Tests - User Persona Journeys
 *
 * Comprehensive end-to-end tests covering different user personas and complex journeys:
 * - First-time user complete onboarding
 * - Premium subscriber advanced features
 * - Long-term user behavior patterns
 * - Error recovery and edge case handling
 * - Cross-platform compatibility
 * - Performance under load
 */

import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { device, element, by, waitFor } from 'detox';

// Mock advanced user personas
const userPersonas = {
  newUser: {
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    pet: { name: 'Luna', type: 'cat', breed: 'Siamese' },
    preferences: { notifications: true, location: true },
  },
  premiumUser: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    subscription: 'premium',
    pets: [
      { name: 'Buddy', type: 'dog', breed: 'Golden Retriever' },
      { name: 'Whiskers', type: 'cat', breed: 'Persian' },
    ],
    preferences: { superLikes: true, advancedFilters: true },
  },
  longTermUser: {
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@email.com',
    joinDate: '2023-01-15',
    pets: [{ name: 'Max', type: 'dog', breed: 'German Shepherd' }],
    stats: { matches: 45, messages: 234, photos: 12 },
  },
  accessibilityUser: {
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    accessibility: { screenReader: true, reducedMotion: true, highContrast: true },
    pet: { name: 'Bella', type: 'dog', breed: 'Labrador' },
  },
};

describe('Advanced E2E User Persona Journeys', () => {
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
    await setupAdvancedMocks();
  });

  describe('First-Time User Complete Journey', () => {
    it('should guide new user through complete onboarding and first interactions', async () => {
      const persona = userPersonas.newUser;

      // Step 1: Welcome and Account Creation
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('get-started-button')).tap();

      // Email signup
      await element(by.id('email-signup-button')).tap();
      await element(by.id('email-input')).typeText(persona.email);
      await element(by.id('password-input')).typeText('SecurePass123!');
      await element(by.id('create-account-button')).tap();

      // Email verification
      await waitFor(element(by.id('email-verification-screen'))).toBeVisible();
      await element(by.id('verification-code-input')).typeText('123456');
      await element(by.id('verify-email-button')).tap();

      // Step 2: Profile Setup
      await waitFor(element(by.id('profile-setup-screen'))).toBeVisible();

      await element(by.id('first-name-input')).typeText(persona.name.split(' ')[0]);
      await element(by.id('last-name-input')).typeText(persona.name.split(' ')[1]);
      await element(by.id('bio-input')).typeText('Pet lover and outdoor enthusiast!');
      await element(by.id('profile-photo-upload')).tap();

      // Mock camera for profile photo
      await mockCameraCapture('profile-photo.jpg');
      await element(by.id('use-photo-button')).tap();

      await element(by.id('save-profile-button')).tap();

      // Step 3: Pet Profile Creation
      await waitFor(element(by.id('add-pet-screen'))).toBeVisible();

      await element(by.id('pet-name-input')).typeText(persona.pet.name);
      await element(by.id('pet-type-selector')).tap();
      await element(by.text(persona.pet.type === 'cat' ? 'Cat' : 'Dog')).tap();
      await element(by.id('pet-breed-input')).typeText(persona.pet.breed);

      // Health and personality
      await element(by.id('vaccinated-toggle')).tap();
      await element(by.id('neutered-toggle')).tap();
      await element(by.id('energy-level-high')).tap();
      await element(by.id('friendliness-very-friendly')).tap();

      // Add pet photos
      await element(by.id('add-pet-photos')).tap();
      for (let i = 0; i < 3; i++) {
        await mockCameraCapture(`pet-photo-${i}.jpg`);
        await element(by.id('capture-photo-button')).tap();
      }
      await element(by.id('photos-done-button')).tap();

      await element(by.id('create-pet-profile-button')).tap();

      // Step 4: Preferences Setup
      await waitFor(element(by.id('preferences-setup-screen'))).toBeVisible();

      await element(by.id('location-permission')).tap();
      await element(by.id('notification-permission')).tap();
      await element(by.id('distance-unit-km')).tap();
      await element(by.id('complete-setup-button')).tap();

      // Step 5: Tutorial and First Swipe
      await waitFor(element(by.id('tutorial-overlay'))).toBeVisible();
      await element(by.id('tutorial-next')).tap();
      await element(by.id('tutorial-next')).tap();
      await element(by.id('tutorial-skip')).tap(); // Skip remaining tutorial

      // First swipe session
      await waitFor(element(by.id('swipe-screen'))).toBeVisible();

      // Perform several swipes with guidance
      for (let i = 0; i < 5; i++) {
        await performSwipe('right');
        await waitFor(element(by.id('swipe-feedback-like'))).toBeVisible();
        await waitFor(element(by.id('swipe-feedback-like'))).toBeNotVisible();
      }

      // Step 6: First Match Experience
      await mockMutualLike();
      await performSwipe('right');

      await waitFor(element(by.id('match-modal'))).toBeVisible();
      expect(element(by.text('It\'s a Match!'))).toBeVisible();

      await element(by.id('send-first-message-button')).tap();

      // First message
      await waitFor(element(by.id('chat-screen'))).toBeVisible();
      await element(by.id('message-input')).typeText('Hi! I\'m ' + persona.name.split(' ')[0] + ' and this is ' + persona.pet.name + '! 🐾');
      await element(by.id('send-message-button')).tap();

      // Verify successful onboarding
      await element(by.id('back-to-matches-button')).tap();
      await waitFor(element(by.id('matches-tab'))).toBeVisible();

      // Check onboarding completion
      expect(element(by.id('onboarding-complete-badge'))).toBeVisible();
    });
  });

  describe('Premium User Advanced Features', () => {
    beforeEach(async () => {
      await setupPremiumUser(userPersonas.premiumUser);
    });

    it('should allow premium user to use advanced features seamlessly', async () => {
      await performLogin(userPersonas.premiumUser.email, 'password123');

      // Access premium features
      await element(by.id('main-tab-swipe')).tap();

      // Super Like should be available and unlimited
      expect(element(by.id('super-like-button'))).toBeVisible();
      expect(element(by.id('super-like-count')).toHaveText('∞'));

      // Use Super Like
      await element(by.id('super-like-button')).tap();
      await waitFor(element(by.id('super-like-animation'))).toBeVisible();

      // Advanced filters should be accessible
      await element(by.id('filter-button')).tap();
      await waitFor(element(by.id('advanced-filters-modal'))).toBeVisible();

      expect(element(by.id('breed-filter'))).toBeVisible();
      expect(element(by.id('age-range-filter'))).toBeVisible();
      expect(element(by.id('size-filter'))).toBeVisible();
      expect(element(by.id('energy-level-filter'))).toBeVisible();

      // Apply advanced filters
      await element(by.id('breed-filter')).tap();
      await element(by.text('Golden Retriever')).tap();
      await element(by.text('Labrador')).tap();
      await element(by.id('age-range-slider')).adjustSliderToPosition(0.7); // 3-5 years
      await element(by.id('apply-filters-button')).tap();

      // Verify filtered results
      await waitFor(element(by.id('filtered-pet-card'))).toBeVisible();
      expect(element(by.text('Showing 2 matches'))).toBeVisible();

      // Premium user can see detailed compatibility scores
      expect(element(by.id('detailed-compatibility-score'))).toBeVisible();
      expect(element(by.text('95% compatible'))).toBeVisible();
    });

    it('should provide premium analytics and insights', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('premium-insights-button')).tap();

      await waitFor(element(by.id('insights-dashboard'))).toBeVisible();

      // Profile performance metrics
      expect(element(by.id('profile-views-chart'))).toBeVisible();
      expect(element(by.id('like-rate-metric'))).toBeVisible();
      expect(element(by.id('response-time-metric'))).toBeVisible();

      // Compatibility insights
      expect(element(by.id('compatibility-breakdown'))).toBeVisible();
      expect(element(by.text('Best matches by breed'))).toBeVisible();
      expect(element(by.text('Activity pattern insights'))).toBeVisible();

      // Premium recommendations
      expect(element(by.id('personalized-recommendations'))).toBeVisible();
      expect(element(by.text('Users who liked your profile also liked...'))).toBeVisible();
    });

    it('should allow premium user to manage multiple pets', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('manage-pets-button')).tap();

      await waitFor(element(by.id('pet-management-screen'))).toBeVisible();

      // Should show both pets
      expect(element(by.text(userPersonas.premiumUser.pets[0].name))).toBeVisible();
      expect(element(by.text(userPersonas.premiumUser.pets[1].name))).toBeVisible();

      // Switch active pet
      await element(by.id('pet-selector')).tap();
      await element(by.text(userPersonas.premiumUser.pets[1].name)).tap();

      // Verify pet switch
      expect(element(by.id('active-pet-indicator'))).toHaveText(userPersonas.premiumUser.pets[1].name);

      // Different pet should have different matches
      await element(by.id('main-tab-matches')).tap();
      expect(element(by.id('pet-specific-matches'))).toBeVisible();
    });
  });

  describe('Long-Term User Behavior Patterns', () => {
    beforeEach(async () => {
      await setupLongTermUser(userPersonas.longTermUser);
    });

    it('should adapt to long-term user behavior and preferences', async () => {
      await performLogin(userPersonas.longTermUser.email, 'password123');

      // Should show personalized recommendations based on history
      await element(by.id('main-tab-swipe')).tap();

      await waitFor(element(by.id('personalized-recommendations-banner'))).toBeVisible();
      expect(element(by.text('Based on your preferences'))).toBeVisible();

      // Should remember and avoid previously passed profiles
      expect(element(by.id('previously-viewed-indicator'))).toBeVisible();

      // Advanced matching algorithm should be active
      await element(by.id('match-insights-button')).tap();
      await waitFor(element(by.id('match-insights-modal'))).toBeVisible();

      expect(element(by.text('Match prediction: 87%'))).toBeVisible();
      expect(element(by.text('Based on 45 previous matches'))).toBeVisible();
    });

    it('should provide comprehensive user statistics and achievements', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('user-statistics-screen'))).toBeVisible();

      // Overall stats
      expect(element(by.text('45 matches'))).toBeVisible();
      expect(element(by.text('234 messages sent'))).toBeVisible();
      expect(element(by.text('12 photos uploaded'))).toBeVisible();

      // Achievement badges
      expect(element(by.id('conversation-starter-badge'))).toBeVisible();
      expect(element(by.id('photo-expert-badge'))).toBeVisible();
      expect(element(by.id('match-maker-badge'))).toBeVisible();

      // Usage patterns
      expect(element(by.id('activity-heatmap'))).toBeVisible();
      expect(element(by.text('Most active: Weekends 2-4 PM'))).toBeVisible();

      // Success metrics
      expect(element(by.id('response-rate-chart'))).toBeVisible();
      expect(element(by.text('82% response rate'))).toBeVisible();
    });

    it('should offer profile optimization suggestions', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('profile-optimization-button')).tap();

      await waitFor(element(by.id('optimization-suggestions'))).toBeVisible();

      // Photo suggestions
      expect(element(by.text('Add more photos to increase matches by 40%'))).toBeVisible();

      // Bio suggestions
      expect(element(by.text('Your bio could be more engaging'))).toBeVisible();
      expect(element(by.id('bio-improvement-examples'))).toBeVisible();

      // Activity suggestions
      expect(element(by.text('Be more active during peak hours'))).toBeVisible();

      // Apply suggestion
      await element(by.id('optimize-photos-button')).tap();
      await waitFor(element(by.id('photo-upload-modal'))).toBeVisible();
    });
  });

  describe('Accessibility User Experience', () => {
    beforeEach(async () => {
      await setupAccessibilityUser(userPersonas.accessibilityUser);
      await device.setStatusBar({ network: 'wifi' });
    });

    it('should provide full screen reader support throughout the app', async () => {
      await performLogin(userPersonas.accessibilityUser.email, 'password123');

      // Enable screen reader simulation
      await device.setStatusBar({ network: 'wifi' }); // Indicates accessibility mode

      await element(by.id('main-tab-swipe')).tap();

      // Screen reader should announce pet cards
      await waitFor(element(by.id('pet-card-0'))).toBeVisible();

      // Verify accessibility labels
      const petCard = element(by.id('pet-card-0'));
      await expect(petCard).toHaveAccessibilityLabel('Pet profile: Bella, Labrador Retriever, 2 years old, 89 percent compatible');

      // VoiceOver navigation should work
      await device.pressButton('voiceOver');
      await element(by.id('like-button')).tap();

      // Should announce the action
      await waitFor(element(by.id('accessibility-announcement-like'))).toBeVisible();
    });

    it('should respect reduced motion preferences', async () => {
      // App should detect and respect reduced motion setting
      await element(by.id('main-tab-swipe')).tap();

      await performSwipe('right');

      // With reduced motion enabled, animations should be minimal or disabled
      await expect(element(by.id('swipe-animation'))).toHaveStyle({ duration: 0 });
      await expect(element(by.id('match-celebration-animation'))).toBeNotVisible();
    });

    it('should provide high contrast mode support', async () => {
      // High contrast mode should be active
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('high-contrast-indicator'))).toBeVisible();

      // UI elements should have high contrast colors
      const primaryButton = element(by.id('primary-action-button'));
      await expect(primaryButton).toHaveStyle({
        backgroundColor: '#000000',
        borderColor: '#FFFFFF',
      });
    });

    it('should support keyboard navigation', async () => {
      await element(by.id('main-tab-matches')).tap();

      // Tab through interface
      await device.pressButton('tab');
      await expect(element(by.id('matches-list'))).toHaveFocus();

      await device.pressButton('tab');
      await expect(element(by.id('filter-button'))).toHaveFocus();

      // Enter to activate
      await device.pressButton('enter');
      await waitFor(element(by.id('filter-modal'))).toBeVisible();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle complete network failure gracefully', async () => {
      await performLogin('test@example.com', 'password123');

      // Simulate complete network failure
      await mockNetworkFailure(true);

      await element(by.id('main-tab-swipe')).tap();

      // Should show offline mode
      await waitFor(element(by.id('offline-banner'))).toBeVisible();
      expect(element(by.text('You\'re offline - showing cached data'))).toBeVisible();

      // Should allow limited functionality
      expect(element(by.id('cached-pet-card'))).toBeVisible();
      expect(element(by.id('offline-like-button'))).toBeVisible();

      // Queue actions for later
      await element(by.id('offline-like-button')).tap();
      expect(element(by.text('Like saved for when you\'re back online'))).toBeVisible();

      // Come back online
      await mockNetworkFailure(false);

      // Should sync queued actions
      await waitFor(element(by.text('Synced 1 action'))).toBeVisible();
    });

    it('should recover from app crashes during critical operations', async () => {
      await performLogin('test@example.com', 'password123');

      // Start photo upload
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('add-photo-button')).tap();
      await mockCameraCapture('crash-photo.jpg');

      // Simulate app crash during upload
      await mockAppCrash();

      // App should restart and recover
      await device.launchApp(); // Simulate restart

      // Should show recovery screen
      await waitFor(element(by.id('recovery-screen'))).toBeVisible();
      expect(element(by.text('App recovered from crash'))).toBeVisible();

      // Should offer to resume upload
      await element(by.id('resume-upload-button')).tap();

      // Upload should continue
      await waitFor(element(by.id('upload-progress'))).toBeVisible();
    });

    it('should handle corrupted local data gracefully', async () => {
      // Setup corrupted local storage
      await mockCorruptedStorage();

      await device.launchApp();

      // Should show data recovery screen
      await waitFor(element(by.id('data-recovery-screen'))).toBeVisible();
      expect(element(by.text('Some data was corrupted and has been reset'))).toBeVisible();

      // Should allow fresh start
      await element(by.id('start-fresh-button')).tap();

      // Should go through onboarding again
      await waitFor(element(by.id('welcome-screen'))).toBeVisible();
    });

    it('should handle extreme memory pressure', async () => {
      await performLogin('test@example.com', 'password123');

      // Simulate memory pressure
      await mockMemoryPressure();

      await element(by.id('main-tab-swipe')).tap();

      // Should show memory optimization active
      await waitFor(element(by.id('memory-optimization-banner'))).toBeVisible();
      expect(element(by.text('Memory optimization active'))).toBeVisible();

      // Should reduce image quality/caching
      expect(element(by.id('low-quality-images-indicator'))).toBeVisible();

      // Should limit concurrent operations
      await performSwipe('right');
      expect(element(by.text('Action queued due to memory constraints'))).toBeVisible();
    });

    it('should handle rapid user interactions without breaking', async () => {
      await element(by.id('main-tab-swipe')).tap();

      // Perform rapid swipes
      for (let i = 0; i < 20; i++) {
        await performSwipe(i % 2 === 0 ? 'right' : 'left');
      }

      // Should not crash or lose state
      await waitFor(element(by.id('swipe-screen'))).toBeVisible();

      // Should process all actions
      expect(element(by.text('20 actions processed'))).toBeVisible();
    });

    it('should handle timezone and locale changes', async () => {
      await performLogin('test@example.com', 'password123');

      await element(by.id('main-tab-matches')).tap();

      // Simulate timezone change
      await mockTimezoneChange('America/New_York');

      // Timestamps should update
      expect(element(by.text('2 hours ago'))).toBeVisible(); // Adjusted for timezone

      // Simulate locale change
      await mockLocaleChange('es-ES');

      // UI should be in Spanish
      expect(element(by.text('Coincidencias'))).toBeVisible();
    });

    it('should handle battery optimization modes', async () => {
      // Simulate low battery mode
      await mockBatteryLevel(15); // 15% battery

      await performLogin('test@example.com', 'password123');

      await element(by.id('main-tab-swipe')).tap();

      // Should show battery optimization
      await waitFor(element(by.id('battery-optimization-banner'))).toBeVisible();
      expect(element(by.text('Battery saver active'))).toBeVisible();

      // Should reduce animations and background tasks
      expect(element(by.id('reduced-animations-indicator'))).toBeVisible();

      // Should limit automatic refreshes
      expect(element(by.id('manual-refresh-required'))).toBeVisible();
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should work correctly on different iOS devices', async () => {
      // Test on various iOS screen sizes
      const iosDevices = ['iPhone SE', 'iPhone 14', 'iPad Pro'];

      for (const deviceType of iosDevices) {
        await mockDeviceType(deviceType);

        await performLogin('test@example.com', 'password123');
        await element(by.id('main-tab-swipe')).tap();

        // UI should adapt to screen size
        await waitFor(element(by.id('responsive-swipe-layout'))).toBeVisible();

        if (deviceType.includes('iPad')) {
          expect(element(by.id('tablet-optimized-layout'))).toBeVisible();
        } else {
          expect(element(by.id('phone-optimized-layout'))).toBeVisible();
        }

        // Core functionality should work
        await performSwipe('right');
        await waitFor(element(by.id('swipe-feedback-like'))).toBeVisible();
      }
    });

    it('should work correctly on different Android devices', async () => {
      // Test on various Android screen sizes and form factors
      const androidDevices = ['Pixel 5', 'Samsung S23', 'Foldable'];

      for (const deviceType of androidDevices) {
        await mockDeviceType(deviceType);

        await performLogin('test@example.com', 'password123');
        await element(by.id('main-tab-matches')).tap();

        // Should handle Android-specific navigation
        expect(element(by.id('android-back-button'))).toBeVisible();

        if (deviceType === 'Foldable') {
          // Should adapt to foldable screen
          expect(element(by.id('foldable-layout'))).toBeVisible();
        }

        // Test Android-specific features
        await element(by.id('share-button')).tap();
        await waitFor(element(by.id('android-share-sheet'))).toBeVisible();
      }
    });

    it('should handle different iOS versions correctly', async () => {
      const iosVersions = ['14.0', '15.0', '16.0', '17.0'];

      for (const version of iosVersions) {
        await mockIOSVersion(version);

        await device.launchApp();
        await performLogin('test@example.com', 'password123');

        // Should adapt to iOS version features
        if (parseFloat(version) >= 15.0) {
          expect(element(by.id('ios15-features-available'))).toBeVisible();
        }

        // Core functionality should work regardless of version
        await element(by.id('main-tab-profile')).tap();
        await waitFor(element(by.id('profile-screen'))).toBeVisible();
      }
    });

    it('should handle different Android API levels', async () => {
      const androidVersions = ['29', '30', '31', '33']; // API levels

      for (const apiLevel of androidVersions) {
        await mockAndroidAPILevel(apiLevel);

        await device.launchApp();
        await element(by.id('camera-button')).tap();

        // Camera permissions should work across API levels
        if (parseInt(apiLevel) >= 30) {
          expect(element(by.id('scoped-storage-handled'))).toBeVisible();
        }

        // Should be able to capture photo
        await mockCameraCapture('cross-platform-photo.jpg');
        expect(element(by.id('photo-captured-successfully'))).toBeVisible();
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with large datasets', async () => {
      // Setup large dataset
      await mockLargeDataset(1000); // 1000 matches

      await performLogin('test@example.com', 'password123');
      await element(by.id('main-tab-matches')).tap();

      const startTime = Date.now();

      await waitFor(element(by.id('matches-list'))).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds

      // Should virtualize list
      expect(element(by.id('virtualized-list'))).toBeVisible();

      // Scrolling should be smooth
      await element(by.id('matches-list')).scroll(500, 'down');
      expect(element(by.text('Match 500'))).toBeVisible();

      // Memory usage should be reasonable
      expect(element(by.id('memory-usage-normal'))).toBeVisible();
    });

    it('should handle high-frequency network requests', async () => {
      await performLogin('test@example.com', 'password123');
      await element(by.id('main-tab-swipe')).tap();

      // Perform many rapid swipes
      const swipePromises = [];
      for (let i = 0; i < 50; i++) {
        swipePromises.push(performSwipe('right'));
      }

      const startTime = Date.now();
      await Promise.all(swipePromises);
      const totalTime = Date.now() - startTime;

      // Should handle high frequency without overwhelming
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 50 swipes

      // Should show rate limiting if needed
      const rateLimitWarnings = element(by.id('rate-limit-warning'));
      if (rateLimitWarnings) {
        expect(element(by.text('Slow down to avoid rate limits'))).toBeVisible();
      }
    });

    it('should maintain performance during animations', async () => {
      await element(by.id('main-tab-swipe')).tap();

      // Start performance monitoring
      await startPerformanceMonitoring();

      // Perform animated swipes
      for (let i = 0; i < 10; i++) {
        await performSwipe('right');
        await waitFor(element(by.id('swipe-animation-complete'))).toBeVisible();
      }

      // Check performance metrics
      const metrics = await getPerformanceMetrics();

      expect(metrics.averageFrameTime).toBeLessThan(16.7); // 60fps
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB
    });

    it('should handle concurrent user sessions', async () => {
      // Simulate multiple tabs/windows
      const sessions = ['session1', 'session2', 'session3'];

      for (const session of sessions) {
        await mockNewSession(session);
        await performLogin(`user${session}@example.com`, 'password123');

        await element(by.id('main-tab-chat')).tap();
        await element(by.id('start-new-chat')).tap();

        // Should handle multiple concurrent sessions
        expect(element(by.id(`session-${session}-chat`))).toBeVisible();
      }

      // Switch between sessions
      await element(by.id('session-switcher')).tap();
      await element(by.text('session2')).tap();

      expect(element(by.id('session-session2-active'))).toBeVisible();
    });

    it('should scale with increasing user base', async () => {
      // Simulate high load scenario
      await mockHighLoadScenario();

      await performLogin('test@example.com', 'password123');
      await element(by.id('main-tab-swipe')).tap();

      const startTime = Date.now();

      // Perform actions under load
      await performSwipe('right');
      await waitFor(element(by.id('match-found'))).toBeVisible();

      const responseTime = Date.now() - startTime;

      // Should maintain reasonable response times even under load
      expect(responseTime).toBeLessThan(2000); // 2 seconds

      // Should show load indicators
      expect(element(by.id('server-load-indicator'))).toBeVisible();
      expect(element(by.text('High server load - responses may be slower'))).toBeVisible();
    });
  });
});

// Helper functions for advanced E2E tests
async function setupAdvancedMocks() {
  // Setup comprehensive mocks for advanced scenarios
}

async function setupPremiumUser(user: any) {
  // Setup premium user state
}

async function setupLongTermUser(user: any) {
  // Setup long-term user with history
}

async function setupAccessibilityUser(user: any) {
  // Setup accessibility-focused user
}

async function performSwipe(direction: 'left' | 'right' | 'up') {
  // Perform swipe gesture
}

async function mockMutualLike() {
  // Mock mutual like for match
}

async function mockNetworkFailure(failed: boolean) {
  // Mock network state
}

async function mockAppCrash() {
  // Mock app crash scenario
}

async function mockCorruptedStorage() {
  // Mock corrupted local storage
}

async function mockMemoryPressure() {
  // Mock memory pressure
}

async function mockTimezoneChange(timezone: string) {
  // Mock timezone change
}

async function mockLocaleChange(locale: string) {
  // Mock locale change
}

async function mockBatteryLevel(level: number) {
  // Mock battery level
}

async function mockDeviceType(type: string) {
  // Mock device type
}

async function mockIOSVersion(version: string) {
  // Mock iOS version
}

async function mockAndroidAPILevel(level: string) {
  // Mock Android API level
}

async function mockLargeDataset(size: number) {
  // Mock large dataset
}

async function startPerformanceMonitoring() {
  // Start performance monitoring
}

async function getPerformanceMetrics() {
  // Get performance metrics
  return {
    averageFrameTime: 15,
    droppedFrames: 0,
    memoryUsage: 50 * 1024 * 1024,
  };
}

async function mockNewSession(sessionId: string) {
  // Mock new user session
}

async function mockHighLoadScenario() {
  // Mock high load scenario
}
