/**
 * Critical User Journeys E2E Tests
 * Tests the most important and frequently used user flows
 *
 * This suite focuses on:
 * - New user onboarding and registration
 * - Core matching and swiping functionality
 * - Premium feature discovery and purchase
 * - Critical error scenarios and recovery
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { device, element, by, waitFor } from 'detox';

// Critical user personas for testing
const personas = {
  newUser: {
    email: 'newuser@test.com',
    password: 'TestPass123!',
    name: 'Alex Chen',
    preferences: ['dogs', 'cats', 'active'],
  },
  premiumUser: {
    email: 'premium@test.com',
    password: 'PremiumPass123!',
    name: 'Sarah Johnson',
    subscription: 'premium',
  },
  busyUser: {
    email: 'busy@test.com',
    password: 'BusyPass123!',
    name: 'Mike Wilson',
    scenario: 'limited_time',
  },
};

describe('Critical User Journeys E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        location: 'always',
        camera: 'YES',
        photos: 'YES',
        notifications: 'YES',
        microphone: 'YES',
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

  describe('🚀 New User Onboarding Journey', () => {
    it('should guide new user through complete onboarding in under 3 minutes', async () => {
      const startTime = Date.now();

      // Step 1: Welcome & Registration (30s target)
      await expect(element(by.id('welcome-screen'))).toBeVisible();
      await element(by.id('get-started-button')).tap();

      // Registration form
      await expect(element(by.id('register-screen'))).toBeVisible();
      await element(by.id('email-input')).typeText(personas.newUser.email);
      await element(by.id('password-input')).typeText(personas.newUser.password);
      await element(by.id('register-button')).tap();

      // Email verification (mocked)
      await expect(element(by.id('email-verification-screen'))).toBeVisible();
      await element(by.id('verify-email-button')).tap();

      // Step 2: Profile Setup (45s target)
      await expect(element(by.id('profile-setup-screen'))).toBeVisible();

      // Upload photo
      await element(by.id('profile-photo-button')).tap();
      await element(by.id('camera-option')).tap();
      await element(by.id('capture-photo-button')).tap();
      await element(by.id('use-photo-button')).tap();

      // Basic info
      await element(by.id('name-input')).typeText(personas.newUser.name);
      await element(by.id('age-input')).typeText('28');
      await element(by.id('occupation-input')).typeText('Software Engineer');

      await element(by.id('continue-button')).tap();

      // Step 3: Pet Preferences (30s target)
      await expect(element(by.id('pet-preferences-screen'))).toBeVisible();

      // Select preferences
      await element(by.id('dogs-toggle')).tap();
      await element(by.id('cats-toggle')).tap();
      await element(by.id('small-pets-toggle')).tap();
      await element(by.id('medium-pets-toggle')).tap();

      // Activity preferences
      await element(by.id('active-lifestyle-toggle')).tap();
      await element(by.id('homebody-toggle')).tap();

      await element(by.id('save-preferences-button')).tap();

      // Step 4: Location Setup (20s target)
      await expect(element(by.id('location-screen'))).toBeVisible();
      await element(by.id('enable-location-button')).tap();

      // Handle permission dialog
      await waitFor(element(by.label('Allow location access')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.label('Allow location access')).tap();

      // Step 5: First Swipe Tutorial (20s target)
      await expect(element(by.id('swipe-tutorial-screen'))).toBeVisible();
      await element(by.id('got-it-button')).tap();

      // Step 6: Enter Main App (10s target)
      await expect(element(by.id('home-screen'))).toBeVisible();

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Performance assertion: Complete onboarding in under 3 minutes
      expect(totalTime).toBeLessThan(180000); // 3 minutes in milliseconds

      console.log(`Onboarding completed in ${totalTime / 1000} seconds`);
    });

    it('should handle onboarding interruptions and resume correctly', async () => {
      // Start onboarding
      await element(by.id('get-started-button')).tap();
      await element(by.id('email-input')).typeText(personas.newUser.email);

      // Simulate app backgrounding (user gets distracted)
      await device.sendToHome();
      await device.launchApp({ newInstance: false });

      // Verify state is preserved
      await expect(element(by.id('register-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toHaveText(personas.newUser.email);

      // Complete registration
      await element(by.id('password-input')).typeText(personas.newUser.password);
      await element(by.id('register-button')).tap();

      // Should continue to email verification
      await expect(element(by.id('email-verification-screen'))).toBeVisible();
    });
  });

  describe('💕 Core Matching Experience', () => {
    beforeEach(async () => {
      await loginAsUser(personas.newUser);
    });

    it('should enable seamless swiping experience with 60fps performance', async () => {
      await navigateToSwipeScreen();

      // Verify smooth loading
      await expect(element(by.id('swipe-screen'))).toBeVisible();

      // Measure swipe performance
      const startTime = Date.now();

      // Perform 10 rapid swipes
      for (let i = 0; i < 10; i++) {
        await element(by.id(`pet-card-${i}`)).swipe('right');
        await expect(element(by.id(`pet-card-${i + 1}`))).toBeVisible();
      }

      const endTime = Date.now();
      const avgSwipeTime = (endTime - startTime) / 10;

      // Performance assertion: Average swipe under 200ms
      expect(avgSwipeTime).toBeLessThan(200);

      console.log(`Average swipe time: ${avgSwipeTime}ms`);
    });

    it('should create matches and enable immediate messaging', async () => {
      await navigateToSwipeScreen();

      // Setup mutual like scenario
      await setupMutualLikeScenario();

      // Swipe right to like
      await element(by.id('pet-card-0')).swipe('right');

      // Verify match modal appears instantly
      await waitFor(element(by.id('match-modal')))
        .toBeVisible()
        .withTimeout(1000);

      await expect(element(by.text('It\'s a Match!'))).toBeVisible();

      // Send first message immediately
      await element(by.id('match-message-input')).typeText('Hi! Love your dog! 🐕');
      await element(by.id('match-send-button')).tap();

      // Verify message sent
      await expect(element(by.text('Hi! Love your dog! 🐕'))).toBeVisible();

      // Continue to chat
      await element(by.id('continue-to-chat-button')).tap();

      // Verify chat screen opens
      await expect(element(by.id('chat-screen'))).toBeVisible();
      await expect(element(by.text('Hi! Love your dog! 🐕'))).toBeVisible();
    });

    it('should handle swipe errors gracefully with retry options', async () => {
      await navigateToSwipeScreen();

      // Simulate network error during swipe
      await simulateNetworkError();

      await element(by.id('pet-card-0')).swipe('right');

      // Verify error handling
      await waitFor(element(by.id('swipe-error-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Connection Error'))).toBeVisible();
      await expect(element(by.id('retry-swipe-button'))).toBeVisible();

      // Retry should work
      await element(by.id('retry-swipe-button')).tap();
      await waitFor(element(by.id('swipe-error-modal')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('should prevent accidental swipes with confirmation for critical actions', async () => {
      await navigateToSwipeScreen();

      // Setup pet with special requirements
      await setupSpecialNeedsPet();

      // Attempt to pass (swipe left)
      await element(by.id('pet-card-0')).swipe('left', 0.3); // Partial swipe

      // Should show confirmation for special needs pets
      await waitFor(element(by.id('special-needs-confirmation-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Special Care Required'))).toBeVisible();

      // Confirm pass
      await element(by.id('confirm-pass-button')).tap();

      // Verify swipe completes
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });
  });

  describe('💎 Premium Feature Discovery & Purchase', () => {
    beforeEach(async () => {
      await loginAsUser(personas.newUser);
    });

    it('should smoothly guide users to premium upgrade during key moments', async () => {
      // Scenario 1: Limited likes reached
      await navigateToSwipeScreen();
      await exhaustFreeLikes();

      await element(by.id('pet-card-0')).swipe('right');

      // Should show premium prompt
      await waitFor(element(by.id('premium-upgrade-prompt')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Unlock Unlimited Likes'))).toBeVisible();

      // User explores premium
      await element(by.id('explore-premium-button')).tap();

      // Verify premium screen loads
      await expect(element(by.id('premium-screen'))).toBeVisible();

      // Scenario 2: Advanced filters accessed
      await element(by.id('home-tab')).tap();
      await element(by.id('advanced-filters-button')).tap();

      // Should show premium prompt for advanced filters
      await waitFor(element(by.id('premium-required-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Advanced Filters Require Premium'))).toBeVisible();
    });

    it('should complete premium purchase with confidence and security', async () => {
      await navigateToPremiumScreen();

      // Select plan
      await element(by.id('yearly-plan')).tap();
      await expect(element(by.id('yearly-plan-selected'))).toBeVisible();

      // Proceed to checkout
      await element(by.id('subscribe-button')).tap();

      // Verify secure checkout
      await expect(element(by.id('secure-checkout-screen'))).toBeVisible();
      await expect(element(by.text('🔒 Secure Payment'))).toBeVisible();

      // Enter payment details
      await element(by.id('card-number-input')).typeText('4242424242424242');
      await element(by.id('expiry-input')).typeText('1225');
      await element(by.id('cvv-input')).typeText('123');
      await element(by.id('billing-name-input')).typeText(personas.newUser.name);

      // Complete purchase
      await element(by.id('complete-purchase-button')).tap();

      // Verify success with immediate feature access
      await waitFor(element(by.id('premium-success-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Welcome to Premium! 🎉'))).toBeVisible();

      // Verify immediate premium features
      await element(by.id('explore-features-button')).tap();
      await expect(element(by.id('unlimited-likes-indicator'))).toBeVisible();
      await expect(element(by.id('advanced-filters-available'))).toBeVisible();
    });

    it('should handle payment failures gracefully with clear retry options', async () => {
      await navigateToPremiumScreen();
      await element(by.id('monthly-plan')).tap();
      await element(by.id('subscribe-button')).tap();

      // Simulate payment failure
      await setupPaymentFailure();

      await element(by.id('card-number-input')).typeText('4000000000000002'); // Declined card
      await element(by.id('complete-purchase-button')).tap();

      // Verify error handling
      await waitFor(element(by.id('payment-error-modal')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Payment Declined'))).toBeVisible();
      await expect(element(by.id('retry-payment-button'))).toBeVisible();
      await expect(element(by.id('change-payment-method-button'))).toBeVisible();

      // Retry with valid card should succeed
      await element(by.id('retry-payment-button')).tap();
      await element(by.id('card-number-input')).clearText();
      await element(by.id('card-number-input')).typeText('4242424242424242');
      await element(by.id('complete-purchase-button')).tap();

      await expect(element(by.id('premium-success-screen'))).toBeVisible();
    });
  });

  describe('🚨 Critical Error Recovery', () => {
    beforeEach(async () => {
      await loginAsUser(personas.newUser);
    });

    it('should recover from complete network loss during critical operations', async () => {
      await navigateToSwipeScreen();

      // Start swipe gesture
      await element(by.id('pet-card-0')).swipe('right', 0.5); // Halfway through swipe

      // Simulate complete network loss
      await simulateCompleteNetworkFailure();

      // Should complete swipe optimistically
      await expect(element(by.id('optimistic-swipe-feedback'))).toBeVisible();

      // Should queue action for retry
      await expect(element(by.id('offline-queue-indicator'))).toBeVisible();

      // Restore network
      await simulateNetworkRecovery();

      // Should sync queued actions automatically
      await waitFor(element(by.id('sync-success-indicator')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Actions synced successfully'))).toBeVisible();
    });

    it('should handle app crashes during premium purchase gracefully', async () => {
      await navigateToPremiumScreen();
      await element(by.id('yearly-plan')).tap();
      await element(by.id('subscribe-button')).tap();

      // Enter payment details
      await element(by.id('card-number-input')).typeText('4242424242424242');
      await element(by.id('expiry-input')).typeText('1225');

      // Simulate app crash during payment processing
      await simulateAppCrash();

      // App should recover and restore purchase flow
      await device.launchApp({ newInstance: false });

      // Should detect incomplete purchase and offer to resume
      await waitFor(element(by.id('resume-purchase-modal')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Resume Your Purchase'))).toBeVisible();

      // Complete purchase
      await element(by.id('resume-purchase-button')).tap();
      await expect(element(by.id('premium-success-screen'))).toBeVisible();
    });

    it('should recover from corrupted local data with user guidance', async () => {
      // Simulate corrupted local storage
      await simulateCorruptedLocalData();

      // App should detect corruption on launch
      await device.launchApp({ newInstance: true });

      // Should show recovery screen
      await waitFor(element(by.id('data-recovery-screen')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Data Recovery Required'))).toBeVisible();
      await expect(element(by.id('restore-from-cloud-button'))).toBeVisible();
      await expect(element(by.id('start-fresh-button'))).toBeVisible();

      // Choose cloud restore
      await element(by.id('restore-from-cloud-button')).tap();

      // Verify successful recovery
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(10000);

      await expect(element(by.text('Data restored successfully'))).toBeVisible();
    });

    it('should handle concurrent critical operations without conflicts', async () => {
      // Start multiple critical operations simultaneously
      await navigateToSwipeScreen();

      // Start swipe, message send, and profile update simultaneously
      const swipePromise = element(by.id('pet-card-0')).swipe('right');
      const messagePromise = sendMessageInBackground('Test message');
      const profilePromise = updateProfileInBackground();

      // All should complete without conflicts
      await Promise.all([swipePromise, messagePromise, profilePromise]);

      // Verify all operations succeeded
      await expect(element(by.id('match-modal'))).toBeVisible(); // Swipe resulted in match
      await expect(element(by.text('Test message'))).toBeVisible(); // Message sent
      await expect(element(by.id('profile-updated-toast'))).toBeVisible(); // Profile updated
    });
  });

  // Helper functions
  async function loginAsUser(user: typeof personas.newUser) {
    // Mock login process
    await device.reloadReactNative();
  }

  async function navigateToSwipeScreen() {
    await element(by.id('swipe-tab')).tap();
    await expect(element(by.id('swipe-screen'))).toBeVisible();
  }

  async function navigateToPremiumScreen() {
    await element(by.id('premium-tab')).tap();
    await expect(element(by.id('premium-screen'))).toBeVisible();
  }

  async function setupMutualLikeScenario() {
    // Mock API to return mutual like
  }

  async function exhaustFreeLikes() {
    // Mock reaching free limit
  }

  async function setupSpecialNeedsPet() {
    // Mock pet with special requirements
  }

  async function simulateNetworkError() {
    // Mock network failure
  }

  async function setupPaymentFailure() {
    // Mock payment processor failure
  }

  async function simulateCompleteNetworkFailure() {
    // Mock complete network loss
  }

  async function simulateNetworkRecovery() {
    // Mock network restoration
  }

  async function simulateAppCrash() {
    // Mock app crash scenario
  }

  async function simulateCorruptedLocalData() {
    // Mock data corruption
  }

  async function sendMessageInBackground(message: string) {
    // Send message in background
  }

  async function updateProfileInBackground() {
    // Update profile in background
  }
});
