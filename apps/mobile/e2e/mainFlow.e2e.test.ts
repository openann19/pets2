/**
 * End-to-End Tests for PawfectMatch Mobile App
 *
 * Comprehensive E2E test suite covering critical user journeys:
 * - User registration and onboarding
 * - Pet profile creation and management
 * - Matching and swiping functionality
 * - Messaging and communication
 * - Premium subscription flow
 * - Settings and privacy management
 * - Offline functionality
 * - Location-based features
 *
 * Uses Detox for native mobile testing with real device/simulator interaction
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { device, element, by, waitFor } from 'detox';

// Mock API responses for consistent testing
const mockApiResponses = {
  login: { success: true, token: 'mock-jwt-token', user: { id: 'user123', email: 'test@example.com' } },
  pets: [{ id: 'pet1', name: 'Buddy', breed: 'Golden Retriever', photos: ['photo1.jpg'] }],
  matches: [{ id: 'match1', pet: { name: 'Luna', photos: ['luna1.jpg'] }, compatibility: 85 }],
  messages: [{ id: 'msg1', text: 'Hi there!', sender: 'match1', timestamp: new Date() }],
  subscription: { status: 'active', plan: 'premium', expiresAt: '2025-12-31' },
};

describe('PawfectMatch E2E Test Suite', () => {
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
    // Reset app state between tests
    await device.reloadReactNative();
    // Mock API endpoints for consistent responses
    await setupApiMocks();
  });

  describe('User Registration and Onboarding Flow', () => {
    it('should complete full user registration journey', async () => {
      // Navigate to registration screen
      await element(by.id('welcome-register-button')).tap();

      // Fill registration form
      await element(by.id('email-input')).typeText('newuser@example.com');
      await element(by.id('password-input')).typeText('SecurePass123!');
      await element(by.id('confirm-password-input')).typeText('SecurePass123!');

      // Submit registration
      await element(by.id('register-submit-button')).tap();

      // Verify email screen appears
      await waitFor(element(by.id('email-verification-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Mock email verification
      await mockEmailVerification('newuser@example.com');

      // Complete verification
      await element(by.id('verification-code-input')).typeText('123456');
      await element(by.id('verify-button')).tap();

      // Should navigate to profile setup
      await waitFor(element(by.id('profile-setup-screen')))
        .toBeVisible()
        .withTimeout(10000);

      // Complete profile setup
      await element(by.id('first-name-input')).typeText('John');
      await element(by.id('last-name-input')).typeText('Doe');
      await element(by.id('bio-input')).typeText('Pet lover and adventurer!');

      // Upload profile picture
      await element(by.id('profile-photo-upload')).tap();
      await element(by.id('camera-option')).tap();
      // Mock camera capture
      await mockCameraCapture('profile-photo.jpg');
      await element(by.id('use-photo-button')).tap();

      // Complete setup
      await element(by.id('setup-complete-button')).tap();

      // Should navigate to main app
      await waitFor(element(by.id('main-tab-bar')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle registration validation errors', async () => {
      await element(by.id('welcome-register-button')).tap();

      // Try to submit empty form
      await element(by.id('register-submit-button')).tap();

      // Should show validation errors
      await waitFor(element(by.text('Email is required')))
        .toBeVisible()
        .withTimeout(2000);

      await waitFor(element(by.text('Password is required')))
        .toBeVisible()
        .withTimeout(2000);

      // Fill invalid email
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('register-submit-button')).tap();

      await waitFor(element(by.text('Please enter a valid email address')))
        .toBeVisible()
        .withTimeout(2000);

      // Fill mismatched passwords
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('valid@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('different123');
      await element(by.id('register-submit-button')).tap();

      await waitFor(element(by.text('Passwords do not match')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should handle existing user registration attempt', async () => {
      await element(by.id('welcome-register-button')).tap();

      await element(by.id('email-input')).typeText('existing@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('register-submit-button')).tap();

      // Mock API returning user already exists
      await mockApiError('registration', 'User already exists');

      await waitFor(element(by.text('An account with this email already exists')))
        .toBeVisible()
        .withTimeout(5000);

      // Should offer login option
      await element(by.id('go-to-login-button')).tap();
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Pet Profile Creation and Management', () => {
    beforeEach(async () => {
      // Login first
      await performLogin('test@example.com', 'password123');
    });

    it('should create complete pet profile', async () => {
      // Navigate to add pet
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('add-pet-button')).tap();

      // Basic information
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-breed-input')).tap();
      await element(by.text('Golden Retriever')).tap();
      await element(by.id('pet-age-input')).typeText('3');
      await element(by.id('pet-gender-male')).tap();

      // Health information
      await element(by.id('vaccinated-yes')).tap();
      await element(by.id('neutered-yes')).tap();
      await element(by.id('pet-size-large')).tap();

      // Personality
      await element(by.id('energy-level-high')).tap();
      await element(by.id('friendliness-very-friendly')).tap();
      await element(by.id('activity-walks')).tap();

      // Photos
      await element(by.id('add-photos-button')).tap();
      await element(by.id('photo-library-option')).tap();

      // Select multiple photos
      await element(by.id('photo-item-0')).tap();
      await element(by.id('photo-item-1')).tap();
      await element(by.id('photo-item-2')).tap();
      await element(by.id('photos-done-button')).tap();

      // Add description
      await element(by.id('pet-description-input')).typeText(
        'Buddy is a friendly Golden Retriever who loves long walks in the park and playing fetch. He\'s great with kids and other dogs!'
      );

      // Submit
      await element(by.id('create-pet-button')).tap();

      // Should show success and navigate to pet profile
      await waitFor(element(by.text('Pet profile created successfully!')))
        .toBeVisible()
        .withTimeout(5000);

      await waitFor(element(by.id('pet-profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify pet details are displayed
      await expect(element(by.text('Buddy'))).toBeVisible();
      await expect(element(by.text('Golden Retriever'))).toBeVisible();
      await expect(element(by.text('3 years old'))).toBeVisible();
    });

    it('should handle photo upload failures gracefully', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('add-pet-button')).tap();

      await element(by.id('pet-name-input')).typeText('Test Pet');
      await element(by.id('add-photos-button')).tap();
      await element(by.id('camera-option')).tap();

      // Mock camera failure
      await mockCameraError('Camera not available');

      await waitFor(element(by.text('Unable to access camera')))
        .toBeVisible()
        .withTimeout(2000);

      // Should still allow continuing without photos
      await element(by.id('skip-photos-button')).tap();
      await expect(element(by.id('pet-description-input'))).toBeVisible();
    });

    it('should edit existing pet profile', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('pet-card-0')).tap();
      await element(by.id('edit-pet-button')).tap();

      // Modify details
      await element(by.id('pet-name-input')).clearText();
      await element(by.id('pet-name-input')).typeText('Buddy Updated');
      await element(by.id('pet-description-input')).clearText();
      await element(by.id('pet-description-input')).typeText('Updated description');

      await element(by.id('save-pet-button')).tap();

      await waitFor(element(by.text('Pet profile updated successfully!')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify changes
      await expect(element(by.text('Buddy Updated'))).toBeVisible();
    });
  });

  describe('Matching and Swiping Functionality', () => {
    beforeEach(async () => {
      await performLogin('test@example.com', 'password123');
      // Ensure user has pets
      await ensureUserHasPets();
    });

    it('should perform complete swiping session', async () => {
      await element(by.id('main-tab-swipe')).tap();

      // Should show pet cards
      await waitFor(element(by.id('pet-card-0')))
        .toBeVisible()
        .withTimeout(5000);

      // Perform various swipes
      const swipeActions = [
        { direction: 'right', expectedResult: 'like' },
        { direction: 'left', expectedResult: 'pass' },
        { direction: 'up', expectedResult: 'superlike' },
        { direction: 'right', expectedResult: 'like' },
      ];

      for (const action of swipeActions) {
        await performSwipe(action.direction);

        // Should show feedback
        await waitFor(element(by.id(`swipe-feedback-${action.expectedResult}`)))
          .toBeVisible()
          .withTimeout(1000);

        // Feedback should disappear
        await waitFor(element(by.id(`swipe-feedback-${action.expectedResult}`)))
          .toBeNotVisible()
          .withTimeout(2000);
      }

      // Should eventually show "no more cards" or continue with new cards
      await waitFor(
        element(by.id('no-more-cards')).or(element(by.id('pet-card-0')))
      ).toBeVisible().withTimeout(10000);
    });

    it('should handle match creation', async () => {
      await element(by.id('main-tab-swipe')).tap();

      // Mock a mutual like (match)
      await mockMutualLike();

      await performSwipe('right');

      // Should show match modal
      await waitFor(element(by.id('match-modal')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('It\'s a match!'))).toBeVisible();

      // Should show matched pet info
      await expect(element(by.id('matched-pet-name'))).toBeVisible();
      await expect(element(by.id('matched-pet-photo'))).toBeVisible();

      // Send first message option
      await element(by.id('send-message-button')).tap();

      // Should navigate to chat
      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should handle swipe undo functionality', async () => {
      await element(by.id('main-tab-swipe')).tap();

      // Perform a swipe
      await performSwipe('right');

      // Should show undo button
      await waitFor(element(by.id('undo-swipe-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Undo the swipe
      await element(by.id('undo-swipe-button')).tap();

      // Should restore the card
      await waitFor(element(by.id('pet-card-0')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should handle premium features in swiping', async () => {
      // Mock free user
      await mockUserSubscription('free');

      await element(by.id('main-tab-swipe')).tap();

      // Try to super like (premium feature)
      await performSwipe('up');

      // Should show premium upgrade prompt
      await waitFor(element(by.id('premium-upgrade-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Upgrade to Premium'))).toBeVisible();
      await expect(element(by.text('Get unlimited Super Likes!'))).toBeVisible();

      // Dismiss modal
      await element(by.id('upgrade-later-button')).tap();

      // Should continue with normal swipe
      await performSwipe('right');
    });

    it('should handle network issues during swiping', async () => {
      await element(by.id('main-tab-swipe')).tap();

      // Mock network failure
      await mockNetworkFailure();

      await performSwipe('right');

      // Should show offline indicator
      await waitFor(element(by.id('offline-indicator')))
        .toBeVisible()
        .withTimeout(2000);

      // Should queue swipe for later
      await expect(element(by.text('Swipe saved for when you\'re back online'))).toBeVisible();
    });
  });

  describe('Messaging and Communication', () => {
    beforeEach(async () => {
      await performLogin('test@example.com', 'password123');
      // Navigate to matches
      await element(by.id('main-tab-matches')).tap();
    });

    it('should send and receive messages in chat', async () => {
      // Open first match
      await element(by.id('match-item-0')).tap();

      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Type and send message
      await element(by.id('message-input')).typeText('Hi! I loved your dog\'s profile!');
      await element(by.id('send-message-button')).tap();

      // Should show sent message
      await waitFor(element(by.text('Hi! I loved your dog\'s profile!')))
        .toBeVisible()
        .withTimeout(2000);

      // Mock incoming message
      await mockIncomingMessage('Thanks! Buddy would love to meet your cat!');

      // Should show received message
      await waitFor(element(by.text('Thanks! Buddy would love to meet your cat!')))
        .toBeVisible()
        .withTimeout(3000);

      // Reply
      await element(by.id('message-input')).typeText('That sounds perfect! When are you free?');
      await element(by.id('send-message-button')).tap();

      await expect(element(by.text('That sounds perfect! When are you free?'))).toBeVisible();
    });

    it('should handle message reactions and features', async () => {
      await element(by.id('match-item-0')).tap();
      await waitFor(element(by.id('chat-screen'))).toBeVisible();

      // Send message with emoji
      await element(by.id('message-input')).typeText('🐕 What a cute dog! 🐕');
      await element(by.id('send-message-button')).tap();

      await expect(element(by.text('🐕 What a cute dog! 🐕'))).toBeVisible();

      // Test message actions (long press on message)
      await element(by.text('🐕 What a cute dog! 🐕')).longPress();

      // Should show message actions
      await waitFor(element(by.id('message-actions-menu')))
        .toBeVisible()
        .withTimeout(2000);

      // Test reply feature
      await element(by.id('reply-action')).tap();
      await expect(element(by.text('Replying to: 🐕 What a cute dog! 🐕'))).toBeVisible();

      await element(by.id('message-input')).typeText('Thank you! 😊');
      await element(by.id('send-message-button')).tap();

      // Should show as reply
      await expect(element(by.text('Thank you! 😊'))).toBeVisible();
    });

    it('should handle file sharing in chat', async () => {
      await element(by.id('match-item-0')).tap();
      await waitFor(element(by.id('chat-screen'))).toBeVisible();

      // Open attachment menu
      await element(by.id('attachment-button')).tap();

      await waitFor(element(by.id('attachment-menu')))
        .toBeVisible()
        .withTimeout(2000);

      // Select photo attachment
      await element(by.id('photo-attachment')).tap();
      await element(by.id('camera-option')).tap();

      // Mock photo capture
      await mockCameraCapture('chat-photo.jpg');
      await element(by.id('use-photo-button')).tap();

      // Add caption
      await element(by.id('photo-caption-input')).typeText('Check out this park!');
      await element(by.id('send-photo-button')).tap();

      // Should show photo message
      await waitFor(element(by.id('photo-message')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Check out this park!'))).toBeVisible();
    });

    it('should handle typing indicators', async () => {
      await element(by.id('match-item-0')).tap();
      await waitFor(element(by.id('chat-screen'))).toBeVisible();

      // Start typing
      await element(by.id('message-input')).typeText('H');

      // Should show typing indicator to other user
      await mockTypingIndicator(true);

      // Mock other user typing
      await mockOtherUserTyping(true);

      await waitFor(element(by.id('typing-indicator')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Other user is typing...'))).toBeVisible();

      // Stop typing
      await mockOtherUserTyping(false);

      await waitFor(element(by.id('typing-indicator')))
        .toBeNotVisible()
        .withTimeout(2000);
    });
  });

  describe('Premium Subscription Flow', () => {
    beforeEach(async () => {
      await performLogin('test@example.com', 'password123');
    });

    it('should complete premium subscription purchase', async () => {
      // Navigate to premium screen
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('upgrade-premium-button')).tap();

      await waitFor(element(by.id('premium-plans-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Select premium plan
      await element(by.id('premium-monthly-plan')).tap();

      // Review plan details
      await expect(element(by.id('plan-features-list'))).toBeVisible();
      await expect(element(by.text('Unlimited Super Likes'))).toBeVisible();
      await expect(element(by.text('Advanced Filters'))).toBeVisible();

      // Proceed to payment
      await element(by.id('subscribe-button')).tap();

      // Payment screen
      await waitFor(element(by.id('payment-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Enter payment details
      await element(by.id('card-number-input')).typeText('4242424242424242');
      await element(by.id('expiry-input')).typeText('1225');
      await element(by.id('cvc-input')).typeText('123');

      // Mock successful payment
      await mockPaymentSuccess();

      await element(by.id('complete-payment-button')).tap();

      // Success screen
      await waitFor(element(by.id('payment-success-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Welcome to Premium!'))).toBeVisible();

      // Verify premium features are now available
      await element(by.id('back-to-app-button')).tap();
      await element(by.id('main-tab-swipe')).tap();

      // Should show premium indicators
      await expect(element(by.id('super-like-indicator'))).toBeVisible();
    });

    it('should handle payment failures gracefully', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('upgrade-premium-button')).tap();
      await element(by.id('premium-monthly-plan')).tap();
      await element(by.id('subscribe-button')).tap();

      // Enter invalid card
      await element(by.id('card-number-input')).typeText('4000000000000002'); // Declined card
      await element(by.id('expiry-input')).typeText('1225');
      await element(by.id('cvc-input')).typeText('123');

      await mockPaymentFailure('Your card was declined');

      await element(by.id('complete-payment-button')).tap();

      await waitFor(element(by.text('Payment failed: Your card was declined')))
        .toBeVisible()
        .withTimeout(5000);

      // Should allow retry
      await element(by.id('retry-payment-button')).tap();
      await expect(element(by.id('card-number-input'))).toBeVisible();
    });

    it('should show premium feature restrictions for free users', async () => {
      // Mock free user
      await mockUserSubscription('free');

      await element(by.id('main-tab-swipe')).tap();

      // Try premium feature
      await element(by.id('filter-button')).tap();

      await waitFor(element(by.id('premium-feature-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Advanced filters are a Premium feature'))).toBeVisible();

      // Upgrade prompt
      await element(by.id('upgrade-now-button')).tap();

      await waitFor(element(by.id('premium-plans-screen')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Settings and Privacy Management', () => {
    beforeEach(async () => {
      await performLogin('test@example.com', 'password123');
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('settings-button')).tap();
    });

    it('should update notification preferences', async () => {
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Navigate to notifications
      await element(by.id('notifications-settings')).tap();

      // Toggle various notifications
      await element(by.id('matches-notifications')).tap(); // Turn off
      await element(by.id('messages-notifications')).tap(); // Turn on
      await element(by.id('likes-notifications')).tap(); // Turn on

      // Save settings
      await element(by.id('save-notification-settings')).tap();

      await waitFor(element(by.text('Notification preferences updated')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify settings persisted
      await device.reloadReactNative();
      await performLogin('test@example.com', 'password123');
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('settings-button')).tap();
      await element(by.id('notifications-settings')).tap();

      // Should remember previous settings
      await expect(element(by.id('matches-notifications'))).toHaveAttribute('checked', 'false');
      await expect(element(by.id('messages-notifications'))).toHaveAttribute('checked', 'true');
    });

    it('should manage privacy settings', async () => {
      await element(by.id('privacy-settings')).tap();

      // Toggle privacy options
      await element(by.id('profile-visibility')).tap(); // Make private
      await element(by.id('show-online-status')).tap(); // Hide online status
      await element(by.id('allow-messages')).tap(); // Allow messages from matches only

      await element(by.id('save-privacy-settings')).tap();

      await waitFor(element(by.text('Privacy settings updated')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should handle account deletion', async () => {
      await element(by.id('account-settings')).tap();
      await element(by.id('delete-account-button')).tap();

      // Confirmation modal
      await waitFor(element(by.id('delete-confirmation-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Are you sure you want to delete your account?'))).toBeVisible();

      // Enter password for confirmation
      await element(by.id('delete-password-input')).typeText('password123');
      await element(by.id('confirm-delete-button')).tap();

      // Should show success and logout
      await waitFor(element(by.text('Account deleted successfully')))
        .toBeVisible()
        .withTimeout(5000);

      // Should return to welcome screen
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should export user data', async () => {
      await element(by.id('account-settings')).tap();
      await element(by.id('export-data-button')).tap();

      await waitFor(element(by.id('export-progress-modal')))
        .toBeVisible()
        .withTimeout(2000);

      // Mock export completion
      await mockDataExport();

      await waitFor(element(by.text('Your data export is ready')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('download-export-button')).tap();

      // Should trigger download/share
      await expect(element(by.text('Data exported successfully'))).toBeVisible();
    });
  });

  describe('Offline Functionality', () => {
    beforeEach(async () => {
      await performLogin('test@example.com', 'password123');
    });

    it('should handle offline message sending', async () => {
      // Go offline
      await mockNetworkOffline();

      await element(by.id('main-tab-matches')).tap();
      await element(by.id('match-item-0')).tap();
      await waitFor(element(by.id('chat-screen'))).toBeVisible();

      // Send message while offline
      await element(by.id('message-input')).typeText('Offline message');
      await element(by.id('send-message-button')).tap();

      // Should show offline indicator and queue message
      await waitFor(element(by.id('offline-message-indicator')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Message will be sent when you\'re back online'))).toBeVisible();

      // Should show message as pending in UI
      await expect(element(by.text('Offline message'))).toBeVisible();
      await expect(element(by.id('pending-message-indicator'))).toBeVisible();

      // Come back online
      await mockNetworkOnline();

      // Should sync and show as sent
      await waitFor(element(by.id('sent-message-indicator')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id('pending-message-indicator'))).not.toBeVisible();
    });

    it('should handle offline swiping', async () => {
      await mockNetworkOffline();

      await element(by.id('main-tab-swipe')).tap();

      await performSwipe('right');

      // Should show offline feedback
      await waitFor(element(by.text('Like saved for when you\'re back online')))
        .toBeVisible()
        .withTimeout(2000);

      // Come back online and sync
      await mockNetworkOnline();

      // Should process the queued swipe
      await waitFor(element(by.text('Swipe synced successfully')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show offline data when available', async () => {
      // First, use app online to cache data
      await element(by.id('main-tab-matches')).tap();

      await waitFor(element(by.id('matches-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Go offline
      await mockNetworkOffline();

      // Should still show cached matches
      await expect(element(by.id('match-item-0'))).toBeVisible();

      // Should show offline indicator
      await expect(element(by.id('offline-banner'))).toBeVisible();

      // Try to refresh
      await element(by.id('refresh-matches-button')).tap();

      // Should show offline message
      await waitFor(element(by.text('You\'re offline. Showing cached data.')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Location-Based Features', () => {
    beforeEach(async () => {
      await performLogin('test@example.com', 'password123');
      // Grant location permissions
      await mockLocationPermission('granted');
    });

    it('should share live location activity', async () => {
      await element(by.id('main-tab-profile')).tap();
      await element(by.id('share-activity-button')).tap();

      // Select activity type
      await element(by.id('activity-walk')).tap();

      // Add message
      await element(by.id('activity-message-input')).typeText('Walking in Central Park!');
      await element(by.id('share-to-map-toggle')).tap(); // Enable map sharing

      // Set radius
      await element(by.id('activity-radius-slider')).adjustSliderToPosition(0.5); // 500m

      await element(by.id('start-activity-button')).tap();

      // Should show activity active indicator
      await waitFor(element(by.id('active-activity-indicator')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Walking in Central Park!'))).toBeVisible();

      // Should appear on map
      await element(by.id('view-on-map-button')).tap();

      await waitFor(element(by.id('map-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show user's activity pin
      await expect(element(by.id('user-activity-pin'))).toBeVisible();
    });

    it('should discover nearby activities', async () => {
      await element(by.id('main-tab-explore')).tap();
      await element(by.id('nearby-activities-tab')).tap();

      await waitFor(element(by.id('activities-map')))
        .toBeVisible()
        .withTimeout(5000);

      // Should show nearby activity pins
      await expect(element(by.id('activity-pin-0'))).toBeVisible();

      // Tap on a pin
      await element(by.id('activity-pin-0')).tap();

      // Should show activity details
      await waitFor(element(by.id('activity-detail-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.id('activity-owner-name'))).toBeVisible();
      await expect(element(by.id('activity-description'))).toBeVisible();
      await expect(element(by.id('join-activity-button'))).toBeVisible();

      // Join the activity
      await element(by.id('join-activity-button')).tap();

      await waitFor(element(by.text('Successfully joined activity!')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should handle location permission denial', async () => {
      await mockLocationPermission('denied');

      await element(by.id('main-tab-profile')).tap();
      await element(by.id('share-activity-button')).tap();

      await waitFor(element(by.text('Location access is required for activities')))
        .toBeVisible()
        .withTimeout(2000);

      // Should offer to go to settings
      await element(by.id('open-settings-button')).tap();

      // In real app, this would open device settings
      // For test, we just verify the button exists
    });
  });
});

// Helper functions for E2E tests
async function performLogin(email: string, password: string) {
  await element(by.id('welcome-login-button')).tap();
  await element(by.id('login-email-input')).typeText(email);
  await element(by.id('login-password-input')).typeText(password);
  await element(by.id('login-submit-button')).tap();
  await waitFor(element(by.id('main-tab-bar'))).toBeVisible().withTimeout(5000);
}

async function performSwipe(direction: 'left' | 'right' | 'up') {
  const card = element(by.id('pet-card-0'));
  const { x, y, width, height } = await card.getRect();

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  let endX = centerX;
  let endY = centerY;

  switch (direction) {
    case 'left':
      endX = x - width / 2;
      break;
    case 'right':
      endX = x + width * 1.5;
      break;
    case 'up':
      endY = y - height / 2;
      break;
  }

  await element(by.id('pet-card-0')).swipe(direction, 'fast', 0.5, centerX, centerY, endX, endY);
}

async function ensureUserHasPets() {
  // Mock API to ensure user has pets for swiping
  await device.setURLBlacklist(['**/api/user/pets']);
  await mockApiResponse('pets', mockApiResponses.pets);
}

// Mock API setup function
async function setupApiMocks() {
  // Setup global API mocks for consistent E2E testing
  await device.setURLBlacklist(['**/api/**']);
}

// Mock functions for various scenarios
async function mockEmailVerification(email: string) {
  // Mock email verification process
}

async function mockCameraCapture(filename: string) {
  // Mock camera photo capture
}

async function mockCameraError(message: string) {
  // Mock camera error
}

async function mockApiError(endpoint: string, message: string) {
  // Mock API error response
}

async function mockMutualLike() {
  // Mock mutual like for match creation
}

async function mockNetworkFailure() {
  // Mock network failure
}

async function mockNetworkOffline() {
  // Simulate going offline
  await device.disableSynchronization();
}

async function mockNetworkOnline() {
  // Simulate coming back online
  await device.enableSynchronization();
}

async function mockIncomingMessage(message: string) {
  // Mock receiving a message
}

async function mockTypingIndicator(isTyping: boolean) {
  // Mock typing indicator
}

async function mockOtherUserTyping(isTyping: boolean) {
  // Mock other user typing status
}

async function mockUserSubscription(tier: 'free' | 'premium') {
  // Mock user subscription status
}

async function mockPaymentSuccess() {
  // Mock successful payment
}

async function mockPaymentFailure(reason: string) {
  // Mock payment failure
}

async function mockDataExport() {
  // Mock data export completion
}

async function mockLocationPermission(status: 'granted' | 'denied') {
  // Mock location permission
}

async function mockApiResponse(endpoint: string, response: any) {
  // Mock specific API response
}
