/**
 * Complete User Journey E2E Tests
 * Full end-to-end testing of the entire PawfectMatch user experience
 *
 * This test suite covers the complete user journey from first app launch
 * through registration, onboarding, swiping, matching, messaging, and premium features.
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { device, element, by, waitFor } from 'detox';

// Test data fixtures
const testUser = {
  email: 'testuser@example.com',
  password: 'TestPass123!',
  firstName: 'Alex',
  lastName: 'Johnson',
  phone: '+1234567890',
  location: 'San Francisco, CA',
};

const testPet = {
  name: 'Max',
  breed: 'Golden Retriever',
  age: '2 years',
  size: 'Large',
  energy: 'High',
  description: 'Friendly golden retriever who loves to play fetch and cuddle!',
};

const matchUser = {
  name: 'Sarah',
  petName: 'Luna',
  compatibility: '95%',
};

describe('Complete User Journey E2E', () => {
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
    // Setup fresh mock data for each test
    await setupTestData();
  });

  it('should complete full user registration and onboarding journey', async () => {
    // Step 1: App Launch & Welcome Screen
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify welcome content
    await expect(element(by.text('Welcome to PawfectMatch'))).toBeVisible();
    await expect(element(by.text('Find your perfect pet match'))).toBeVisible();

    // Tap Get Started
    await element(by.id('get-started-button')).tap();

    // Step 2: Registration Flow
    await waitFor(element(by.id('register-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Fill registration form
    await element(by.id('email-input')).typeText(testUser.email);
    await element(by.id('password-input')).typeText(testUser.password);
    await element(by.id('confirm-password-input')).typeText(testUser.password);
    await element(by.id('first-name-input')).typeText(testUser.firstName);
    await element(by.id('last-name-input')).typeText(testUser.lastName);

    // Submit registration
    await element(by.id('register-button')).tap();

    // Verify email verification screen
    await waitFor(element(by.id('email-verification-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Simulate email verification (in real app, user would check email)
    await element(by.id('verify-email-button')).tap();

    // Step 3: Phone Verification
    await waitFor(element(by.id('phone-verification-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('phone-input')).typeText(testUser.phone);
    await element(by.id('send-code-button')).tap();

    // Enter verification code
    await element(by.id('code-input')).typeText('123456');
    await element(by.id('verify-code-button')).tap();

    // Step 4: Location Setup
    await waitFor(element(by.id('location-setup-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('location-input')).typeText(testUser.location);
    await element(by.id('use-current-location-button')).tap();

    // Grant location permission
    await waitFor(element(by.label('Allow location access')))
      .toBeVisible()
      .withTimeout(2000);
    await element(by.label('Allow location access')).tap();

    // Step 5: Profile Setup
    await waitFor(element(by.id('profile-setup-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Upload profile photo
    await element(by.id('profile-photo-button')).tap();
    await element(by.label('Choose from Gallery')).tap();
    await element(by.id('photo-item-0')).tap(); // Select first photo

    // Complete profile
    await element(by.id('continue-button')).tap();

    // Step 6: Pet Preferences Setup
    await waitFor(element(by.id('pet-preferences-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Select preferences
    await element(by.id('dog-toggle')).tap();
    await element(by.id('size-large-toggle')).tap();
    await element(by.id('energy-high-toggle')).tap();
    await element(by.id('age-adult-toggle')).tap();

    await element(by.id('save-preferences-button')).tap();

    // Step 7: Onboarding Complete - Enter Main App
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify we're in the main app
    await expect(element(by.id('tab-bar'))).toBeVisible();
    await expect(element(by.id('home-tab'))).toBeVisible();
  });

  it('should complete pet creation and profile setup journey', async () => {
    // Assume user is logged in and on home screen
    await navigateToLoggedInState();

    // Navigate to profile
    await element(by.id('profile-tab')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap Add Pet
    await element(by.id('add-pet-button')).tap();
    await waitFor(element(by.id('create-pet-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Fill pet information
    await element(by.id('pet-name-input')).typeText(testPet.name);
    await element(by.id('pet-breed-input')).typeText(testPet.breed);
    await element(by.id('pet-age-input')).typeText(testPet.age);

    // Select pet size
    await element(by.id('pet-size-selector')).tap();
    await element(by.text(testPet.size)).tap();

    // Select energy level
    await element(by.id('pet-energy-selector')).tap();
    await element(by.text(testPet.energy)).tap();

    // Upload pet photos
    await element(by.id('add-photos-button')).tap();
    await element(by.label('Choose from Gallery')).tap();

    // Select multiple photos
    for (let i = 0; i < 3; i++) {
      await element(by.id(`photo-item-${i}`)).tap();
    }
    await element(by.id('done-button')).tap();

    // Add description
    await element(by.id('pet-description-input')).typeText(testPet.description);

    // Add pet characteristics
    await element(by.id('friendly-toggle')).tap();
    await element(by.id('playful-toggle')).tap();
    await element(by.id('house-trained-toggle')).tap();

    // Generate AI bio (if available)
    await element(by.id('generate-ai-bio-button')).tap();
    await waitFor(element(by.id('ai-bio-loading')))
      .toBeVisible()
      .withTimeout(2000);
    await waitFor(element(by.id('ai-bio-result')))
      .not.toBeVisible()
      .withTimeout(10000);

    // Save pet profile
    await element(by.id('save-pet-button')).tap();

    // Verify pet was created successfully
    await waitFor(element(by.id('pet-profile-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text(testPet.name))).toBeVisible();
    await expect(element(by.text(testPet.breed))).toBeVisible();
  });

  it('should complete full swiping and matching journey', async () => {
    // Assume user has pet profile and is logged in
    await navigateToLoggedInState();
    await setupMockPets();

    // Navigate to swipe screen
    await element(by.id('swipe-tab')).tap();
    await waitFor(element(by.id('swipe-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify pet card is visible
    await expect(element(by.id('pet-card-0'))).toBeVisible();

    // Like first pet (swipe right)
    await element(by.id('pet-card-0')).swipe('right');

    // Verify like animation and next card
    await waitFor(element(by.id('pet-card-1')))
      .toBeVisible()
      .withTimeout(2000);

    // Pass on second pet (swipe left)
    await element(by.id('pet-card-1')).swipe('left');

    // Like third pet
    await element(by.id('pet-card-2')).swipe('right');

    // Super like fourth pet (swipe up)
    await element(by.id('pet-card-3')).swipe('up');

    // Continue swiping through several pets
    for (let i = 4; i < 10; i++) {
      await element(by.id(`pet-card-${i}`)).swipe('right');
      await waitFor(element(by.id(`pet-card-${i + 1}`)))
        .toBeVisible()
        .withTimeout(1000);
    }

    // Verify match modal appears
    await waitFor(element(by.id('match-modal')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('It\'s a Match!'))).toBeVisible();
    await expect(element(by.text(matchUser.petName))).toBeVisible();
    await expect(element(by.text(`${matchUser.compatibility} Compatible`))).toBeVisible();

    // Send first message
    await element(by.id('send-message-input')).typeText('Hi! I love your pet! 🐕');
    await element(by.id('send-message-button')).tap();

    // Verify message was sent
    await expect(element(by.text('Hi! I love your pet! 🐕'))).toBeVisible();

    // Close match modal
    await element(by.id('continue-matching-button')).tap();

    // Continue swiping
    await element(by.id('pet-card-10')).swipe('right');
  });

  it('should complete messaging and chat journey', async () => {
    // Assume user has a match
    await navigateToLoggedInState();
    await setupMockMatch();

    // Navigate to messages
    await element(by.id('messages-tab')).tap();
    await waitFor(element(by.id('messages-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Open chat with match
    await element(by.id('chat-item-0')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify chat header
    await expect(element(by.text(matchUser.name))).toBeVisible();
    await expect(element(by.text(matchUser.petName))).toBeVisible();

    // Send text message
    await element(by.id('message-input')).typeText('Thanks for matching with me!');
    await element(by.id('send-button')).tap();

    // Send another message
    await element(by.id('message-input')).typeText('My dog would love to meet your cat 🐶😺');
    await element(by.id('send-button')).tap();

    // Send voice message
    await element(by.id('voice-message-button')).longPress();
    await waitFor(element(by.id('recording-indicator')))
      .toBeVisible()
      .withTimeout(1000);

    // Hold for 2 seconds then release
    await new Promise(resolve => setTimeout(resolve, 2000));
    await element(by.id('voice-message-button')).tap();

    // Verify voice message was sent
    await expect(element(by.id('voice-message-0'))).toBeVisible();

    // Use reactions
    await element(by.id('message-0')).longPress();
    await waitFor(element(by.id('reaction-picker')))
      .toBeVisible()
      .withTimeout(1000);

    await element(by.text('❤️')).tap();
    await expect(element(by.id('reaction-heart-0'))).toBeVisible();

    // Send photo
    await element(by.id('attach-button')).tap();
    await element(by.id('photo-option')).tap();
    await element(by.id('photo-item-0')).tap();

    // Add caption
    await element(by.id('caption-input')).typeText('Check out my dog!');
    await element(by.id('send-photo-button')).tap();

    // Verify photo was sent
    await expect(element(by.id('photo-message-0'))).toBeVisible();

    // Go back to messages list
    await element(by.id('back-button')).tap();
    await expect(element(by.id('messages-screen'))).toBeVisible();
  });

  it('should complete premium subscription journey', async () => {
    // Assume user is logged in
    await navigateToLoggedInState();

    // Navigate to premium screen
    await element(by.id('premium-tab')).tap();
    await waitFor(element(by.id('premium-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify premium plans
    await expect(element(by.text('Premium Plans'))).toBeVisible();
    await expect(element(by.id('monthly-plan'))).toBeVisible();
    await expect(element(by.id('yearly-plan'))).toBeVisible();

    // Select yearly plan (better value)
    await element(by.id('yearly-plan')).tap();
    await expect(element(by.id('yearly-plan-selected'))).toBeVisible();

    // Proceed to checkout
    await element(by.id('subscribe-button')).tap();
    await waitFor(element(by.id('checkout-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Enter payment information
    await element(by.id('card-number-input')).typeText('4242424242424242');
    await element(by.id('expiry-input')).typeText('1225');
    await element(by.id('cvv-input')).typeText('123');
    await element(by.id('cardholder-input')).typeText(`${testUser.firstName} ${testUser.lastName}`);

    // Complete purchase
    await element(by.id('complete-purchase-button')).tap();

    // Verify success screen
    await waitFor(element(by.id('premium-success-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('Welcome to Premium!'))).toBeVisible();
    await expect(element(by.text('Enjoy unlimited features'))).toBeVisible();

    // Verify premium features are now available
    await element(by.id('explore-premium-button')).tap();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check for premium indicators
    await expect(element(by.id('premium-indicator'))).toBeVisible();

    // Navigate to swipe screen to verify unlimited likes
    await element(by.id('swipe-tab')).tap();
    await expect(element(by.id('unlimited-likes-indicator'))).toBeVisible();
  });

  it('should complete settings and privacy journey', async () => {
    // Assume user is logged in
    await navigateToLoggedInState();

    // Navigate to settings
    await element(by.id('settings-tab')).tap();
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Test account settings
    await element(by.id('account-settings')).tap();
    await waitFor(element(by.id('account-settings-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Update profile information
    await element(by.id('edit-profile-button')).tap();
    await element(by.id('bio-input')).typeText('Dog lover and hiking enthusiast!');
    await element(by.id('save-profile-button')).tap();

    // Go back to main settings
    await element(by.id('back-button')).tap();

    // Test notification settings
    await element(by.id('notification-settings')).tap();
    await waitFor(element(by.id('notification-settings-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Toggle notification preferences
    await element(by.id('match-notifications-toggle')).tap();
    await element(by.id('message-notifications-toggle')).tap();
    await element(by.id('marketing-notifications-toggle')).tap(); // Turn off

    // Save settings
    await element(by.id('save-settings-button')).tap();

    // Test privacy settings
    await element(by.id('privacy-settings')).tap();
    await waitFor(element(by.id('privacy-settings-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Test location privacy
    await element(by.id('location-privacy-toggle')).tap();

    // Test data export
    await element(by.id('export-data-button')).tap();
    await waitFor(element(by.id('export-progress')))
      .toBeVisible()
      .withTimeout(2000);
    await waitFor(element(by.id('export-complete')))
      .toBeVisible()
      .withTimeout(10000);

    // Test account deletion
    await element(by.id('delete-account-button')).tap();
    await waitFor(element(by.id('delete-confirmation-modal')))
      .toBeVisible()
      .withTimeout(2000);

    // Confirm deletion
    await element(by.id('confirm-delete-input')).typeText('DELETE');
    await element(by.id('confirm-delete-button')).tap();

    // Verify deletion success
    await waitFor(element(by.id('account-deleted-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('Account Deleted Successfully'))).toBeVisible();
  });

  it('should handle offline functionality journey', async () => {
    // Assume user is logged in
    await navigateToLoggedInState();

    // Navigate to swipe screen
    await element(by.id('swipe-tab')).tap();
    await waitFor(element(by.id('swipe-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Simulate going offline
    await simulateNetworkOffline();

    // Verify offline indicator appears
    await waitFor(element(by.id('offline-indicator')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('You\'re offline'))).toBeVisible();

    // Try to swipe while offline
    await element(by.id('pet-card-0')).swipe('right');

    // Verify offline action is queued
    await expect(element(by.id('offline-queue-indicator'))).toBeVisible();
    await expect(element(by.text('Action queued for when you\'re back online'))).toBeVisible();

    // Try to send message while offline
    await element(by.id('messages-tab')).tap();
    await element(by.id('chat-item-0')).tap();
    await element(by.id('message-input')).typeText('Offline message');
    await element(by.id('send-button')).tap();

    // Verify message is queued
    await expect(element(by.text('Message will be sent when online'))).toBeVisible();

    // Simulate coming back online
    await simulateNetworkOnline();

    // Verify sync begins
    await waitFor(element(by.id('sync-indicator')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('Syncing offline actions...'))).toBeVisible();

    // Verify sync completes
    await waitFor(element(by.id('sync-complete-indicator')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('All actions synced!'))).toBeVisible();
  });

  it('should complete accessibility and theme journey', async () => {
    // Assume user is logged in
    await navigateToLoggedInState();

    // Navigate to settings
    await element(by.id('settings-tab')).tap();
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Test theme switching
    await element(by.id('appearance-settings')).tap();
    await waitFor(element(by.id('appearance-settings-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Switch to dark theme
    await element(by.id('dark-theme-option')).tap();
    await expect(element(by.id('dark-theme-applied'))).toBeVisible();

    // Switch to light theme
    await element(by.id('light-theme-option')).tap();
    await expect(element(by.id('light-theme-applied'))).toBeVisible();

    // Switch to system theme
    await element(by.id('system-theme-option')).tap();
    await expect(element(by.id('system-theme-applied'))).toBeVisible();

    // Test accessibility settings
    await element(by.id('accessibility-settings')).tap();
    await waitFor(element(by.id('accessibility-settings-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Enable reduce motion
    await element(by.id('reduce-motion-toggle')).tap();
    await expect(element(by.id('reduce-motion-enabled'))).toBeVisible();

    // Enable larger text
    await element(by.id('larger-text-toggle')).tap();
    await expect(element(by.id('larger-text-enabled'))).toBeVisible();

    // Test voice over (accessibility)
    await element(by.id('voice-over-test-button')).tap();
    await expect(element(by.id('voice-over-feedback'))).toBeVisible();

    // Test keyboard navigation
    await device.pressKey('Tab');
    await device.pressKey('Enter');

    // Go back and verify settings persist
    await element(by.id('back-button')).tap();
    await element(by.id('back-button')).tap();

    // Navigate to different screens to verify accessibility
    await element(by.id('swipe-tab')).tap();
    await waitFor(element(by.id('swipe-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify accessibility labels are present
    await expect(element(by.label('Swipe right to like'))).toBeVisible();
    await expect(element(by.label('Swipe left to pass'))).toBeVisible();
  });

  // Helper functions
  async function navigateToLoggedInState() {
    // Mock login process
    await device.reloadReactNative();
    // In real implementation, this would handle login flow
  }

  async function setupTestData() {
    // Setup mock data for consistent testing
  }

  async function setupMockPets() {
    // Setup mock pet data
  }

  async function setupMockMatch() {
    // Setup mock match data
  }

  async function simulateNetworkOffline() {
    // Simulate network going offline
  }

  async function simulateNetworkOnline() {
    // Simulate network coming back online
  }
});
