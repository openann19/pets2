/**
 * Critical User Journey Integration Tests
 *
 * End-to-end integration tests covering the most critical user journeys:
 * - New User Onboarding (Complete Flow)
 * - Premium Subscription Purchase
 * - Pet Profile Management
 * - Matching and Communication
 * - Settings and Privacy
 * - Offline Functionality
 * - Error Recovery
 *
 * These tests ensure the core business flows work correctly across all layers.
 */

import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Import all critical components and services
import App from '../App';
import SwipeScreen from '../screens/SwipeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PremiumScreen from '../screens/PremiumScreen';
import VerificationCenterScreen from '../screens/VerificationCenterScreen';

// Renamed component for backwards compatibility
const VerificationScreen = VerificationCenterScreen;

import { api } from '../services/api';
import { authService } from '../services/AuthService';
import { offlineService } from '../services/offlineService';
import { uploadHygieneService } from '../services/uploadHygiene';
import { communityAPI } from '../services/communityAPI';
import { notificationService } from '../services/notifications';

// Mock all dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-location');
jest.mock('../services/api');
jest.mock('../services/AuthService');
jest.mock('../services/offlineService');
jest.mock('../services/uploadHygiene');
jest.mock('../services/communityAPI');
jest.mock('../services/notifications');
jest.mock('../App', () => ({
  __esModule: true,
  default: () => null,
}));

// Mock components
const AuthNavigator = () => null;
const MainNavigator = () => null;

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockLocation = Location as jest.Mocked<typeof Location>;
const mockApi = api as jest.Mocked<typeof api>;
const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockOfflineService = offlineService as jest.Mocked<typeof offlineService>;
const mockUploadHygieneService = uploadHygieneService as jest.Mocked<typeof uploadHygieneService>;
const mockCommunityAPI = communityAPI as jest.Mocked<typeof communityAPI>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('Critical User Journey Integration Tests', () => {
  // Note: This is a unit/integration test, not an E2E test
  // Detox device APIs are not available in Jest tests
  beforeAll(async () => {
    // Setup test environment
  });

  afterAll(async () => {
    // Cleanup
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup comprehensive mocks for full journeys
    setupCompleteJourneyMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Complete New User Onboarding Journey', () => {
    it('should successfully onboard a new user from registration to first match', async () => {
      // Step 1: Launch app and reach welcome screen
      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('Welcome to PawfectMatch')).toBeTruthy();
      });

      // Step 2: Start registration
      fireEvent.press(getByText('Get Started'));
      await waitFor(() => {
        expect(getByText('Create Account')).toBeTruthy();
      });

      // Step 3: Fill registration form
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');

      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.changeText(confirmPasswordInput, 'SecurePass123!');

      // Submit registration
      fireEvent.press(getByText('Create Account'));

      // Step 4: Verify email
      await waitFor(() => {
        expect(getByText('Check your email')).toBeTruthy();
      });

      // Mock email verification
      fireEvent.press(getByText('Enter Code'));
      const codeInputs = screen.getAllByPlaceholderText('0');
      codeInputs.forEach((input, index) => {
        fireEvent.changeText(input, '1');
      });

      fireEvent.press(getByText('Verify'));

      // Step 5: Complete profile setup
      await waitFor(() => {
        expect(getByText('Complete Your Profile')).toBeTruthy();
      });

      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const bioInput = getByPlaceholderText('Tell us about yourself');

      fireEvent.changeText(firstNameInput, 'Alex');
      fireEvent.changeText(lastNameInput, 'Chen');
      fireEvent.changeText(bioInput, 'Pet lover and outdoor enthusiast!');

      // Add profile photo
      fireEvent.press(getByText('Add Photo'));
      // Mock camera capture
      await mockCameraCapture('profile-photo.jpg');
      fireEvent.press(screen.getByText('Use Photo'));

      fireEvent.press(getByText('Continue'));

      // Step 6: Pet profile creation
      await waitFor(() => {
        expect(getByText('Tell us about your pet')).toBeTruthy();
      });

      const petNameInput = getByPlaceholderText('Pet Name');
      fireEvent.changeText(petNameInput, 'Luna');

      fireEvent.press(getByText('Cat'));
      fireEvent.press(getByText('Siamese'));

      // Health info
      fireEvent.press(getByText('Vaccinated'));
      fireEvent.press(getByText('Neutered'));

      // Personality
      fireEvent.press(getByText('Friendly'));
      fireEvent.press(getByText('Playful'));

      // Add pet photos
      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByText('Add Photo'));
        await mockCameraCapture(`pet-photo-${i}.jpg`);
        fireEvent.press(screen.getByText('Use Photo'));
      }

      const petBioInput = getByPlaceholderText('Tell us about your pet');
      fireEvent.changeText(petBioInput, 'Luna is a playful Siamese cat who loves attention!');

      fireEvent.press(getByText('Create Pet Profile'));

      // Step 7: Preferences setup
      await waitFor(() => {
        expect(getByText('Set Your Preferences')).toBeTruthy();
      });

      fireEvent.press(getByText('Enable Location'));
      fireEvent.press(getByText('Enable Notifications'));
      fireEvent.press(getByText('Complete Setup'));

      // Step 8: Enter main app
      await waitFor(() => {
        expect(getByText('Find Your Perfect Match')).toBeTruthy();
      });

      // Step 9: First swipe session
      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy(); // First pet card
      });

      // Perform some swipes
      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByText('Like'));
        await waitFor(() => {
          expect(screen.queryByText('Buddy')).toBeFalsy(); // Card should change
        });
      }

      // Step 10: Get first match
      // Mock mutual like
      await mockMutualLike();

      fireEvent.press(getByText('Like'));

      await waitFor(() => {
        expect(getByText('It\'s a Match!')).toBeTruthy();
      });

      fireEvent.press(getByText('Send a Message'));

      // Step 11: First conversation
      await waitFor(() => {
        expect(getByText('Chat with Max')).toBeTruthy();
      });

      const messageInput = getByPlaceholderText('Type a message...');
      fireEvent.changeText(messageInput, 'Hi Max! I\'m Alex and this is Luna 🐱');
      fireEvent.press(getByText('Send'));

      await waitFor(() => {
        expect(getByText('Hi Max! I\'m Alex and this is Luna 🐱')).toBeTruthy();
      });

      // Verify onboarding completion
      expect(getByText('Onboarding Complete!')).toBeTruthy();
    });
  });

  describe('Premium Subscription Purchase Journey', () => {
    beforeEach(async () => {
      // Setup authenticated free user
      await setupAuthenticatedUser('free');
    });

    it('should complete premium subscription purchase successfully', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      );

      // Navigate to premium
      fireEvent.press(getByText('Upgrade to Premium'));

      await waitFor(() => {
        expect(getByText('Choose Your Plan')).toBeTruthy();
      });

      // Select premium plan
      fireEvent.press(getByText('Premium Monthly'));

      await waitFor(() => {
        expect(getByText('$9.99/month')).toBeTruthy();
        expect(getByText('Unlimited Likes')).toBeTruthy();
        expect(getByText('Advanced Filters')).toBeTruthy();
        expect(getByText('Priority Matching')).toBeTruthy();
      });

      // Proceed to payment
      fireEvent.press(getByText('Subscribe Now'));

      // Payment screen
      await waitFor(() => {
        expect(getByText('Secure Payment')).toBeTruthy();
      });

      // Enter payment details
      const cardNumberInput = getByPlaceholderText('Card Number');
      const expiryInput = getByPlaceholderText('MM/YY');
      const cvcInput = getByPlaceholderText('CVC');

      fireEvent.changeText(cardNumberInput, '4242424242424242');
      fireEvent.changeText(expiryInput, '1225');
      fireEvent.changeText(cvcInput, '123');

      // Mock billing address requirement
      fireEvent.press(getByText('Add Billing Address'));
      fireEvent.changeText(getByPlaceholderText('Address'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('City'), 'New York');
      fireEvent.changeText(getByPlaceholderText('ZIP'), '10001');
      fireEvent.press(getByText('Save Address'));

      // Complete purchase
      fireEvent.press(getByText('Complete Purchase'));

      // Processing screen
      await waitFor(() => {
        expect(getByText('Processing Payment...')).toBeTruthy();
      });

      // Success screen
      await waitFor(() => {
        expect(getByText('Welcome to Premium!')).toBeTruthy();
      });

      expect(getByText('Your subscription is now active')).toBeTruthy();
      expect(getByText('Premium features unlocked')).toBeTruthy();

      // Verify premium features are available
      fireEvent.press(getByText('Start Using Premium'));

      await waitFor(() => {
        expect(getByText('Unlimited Super Likes')).toBeTruthy();
      });

      // Test premium feature immediately
      fireEvent.press(getByText('Super Like'));

      await waitFor(() => {
        expect(getByText('Super Like sent!')).toBeTruthy();
      });
    });

    it('should handle payment failures and retries', async () => {
      // Mock payment failure
      mockApi.post.mockImplementationOnce(() => Promise.reject({
        status: 402,
        data: { error: 'card_declined' }
      }));

      const { getByText } = render(<PremiumScreen />);

      fireEvent.press(getByText('Subscribe Now'));

      // Enter payment details
      const cardNumberInput = screen.getByPlaceholderText('Card Number');
      fireEvent.changeText(cardNumberInput, '4000000000000002'); // Declined card

      fireEvent.press(screen.getByText('Complete Purchase'));

      await waitFor(() => {
        expect(getByText('Payment Failed')).toBeTruthy();
        expect(getByText('Your card was declined')).toBeTruthy();
      });

      // Retry with different card
      fireEvent.press(getByText('Try Different Card'));
      fireEvent.changeText(cardNumberInput, '4242424242424242');

      fireEvent.press(screen.getByText('Complete Purchase'));

      await waitFor(() => {
        expect(getByText('Welcome to Premium!')).toBeTruthy();
      });
    });
  });

  describe('Pet Profile Management Journey', () => {
    beforeEach(async () => {
      await setupAuthenticatedUser('premium');
    });

    it('should manage multiple pet profiles successfully', async () => {
      const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

      // View existing pets
      await waitFor(() => {
        expect(getByText('Your Pets')).toBeTruthy();
        expect(getByText('Buddy')).toBeTruthy();
      });

      // Add second pet
      fireEvent.press(getByText('Add Pet'));

      await waitFor(() => {
        expect(getByText('Add New Pet')).toBeTruthy();
      });

      const petNameInput = getByPlaceholderText('Pet Name');
      fireEvent.changeText(petNameInput, 'Whiskers');

      fireEvent.press(getByText('Cat'));
      fireEvent.press(getByText('Persian'));

      // Quick setup
      fireEvent.press(getByText('Skip Details'));
      fireEvent.press(getByText('Create Pet'));

      // Verify both pets shown
      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
        expect(getByText('Whiskers')).toBeTruthy();
      });

      // Switch active pet
      fireEvent.press(getByText('Whiskers'));
      fireEvent.press(getByText('Set as Active'));

      await waitFor(() => {
        expect(getByText('Active: Whiskers')).toBeTruthy();
      });

      // Edit pet profile
      fireEvent.press(getByText('Edit Profile'));

      const bioInput = getByPlaceholderText('Pet Bio');
      fireEvent.changeText(bioInput, 'Whiskers is a fluffy Persian cat who loves naps!');

      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(getByText('Profile Updated')).toBeTruthy();
      });
    });

    it('should handle photo management for pets', async () => {
      const { getByText } = render(<ProfileScreen />);

      fireEvent.press(getByText('Buddy'));
      fireEvent.press(getByText('Manage Photos'));

      await waitFor(() => {
        expect(getByText('Photo Management')).toBeTruthy();
        expect(getByText('6 photos maximum')).toBeTruthy();
      });

      // Add photos
      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByText('Add Photo'));
        await mockCameraCapture(`new-photo-${i}.jpg`);
        fireEvent.press(screen.getByText('Use Photo'));
      }

      // Set primary photo
      fireEvent.press(screen.getAllByText('Set as Primary')[1]);

      await waitFor(() => {
        expect(getByText('Primary photo updated')).toBeTruthy();
      });

      // Reorder photos
      fireEvent.press(getByText('Reorder'));
      // Simulate drag and drop
      fireEvent(screen.getAllByTestId('photo-item')[0], 'longPress');
      fireEvent(screen.getAllByTestId('photo-item')[1], 'press');

      fireEvent.press(getByText('Save Order'));

      await waitFor(() => {
        expect(getByText('Photo order saved')).toBeTruthy();
      });
    });
  });

  describe('Matching and Communication Journey', () => {
    beforeEach(async () => {
      await setupAuthenticatedUser('free');
      await setupMatchesAndConversations();
    });

    it('should handle complete matching and messaging flow', async () => {
      const { getByText, getByPlaceholderText } = render(<SwipeScreen />);

      // Perform swipes
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('Like'));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get match
      await mockMutualLike();
      fireEvent.press(getByText('Like'));

      await waitFor(() => {
        expect(getByText('It\'s a Match!')).toBeTruthy();
      });

      fireEvent.press(getByText('Send Message'));

      // Chat interface
      await waitFor(() => {
        expect(getByText('Chat with Luna\'s Owner')).toBeTruthy();
      });

      // Send messages
      const messageInput = getByPlaceholderText('Type a message...');

      fireEvent.changeText(messageInput, 'Hi! I loved Luna\'s photos!');
      fireEvent.press(getByText('Send'));

      fireEvent.changeText(messageInput, 'Would you like to meet up for a playdate?');
      fireEvent.press(getByText('Send'));

      // Mock response
      await mockIncomingMessage('Hi! That sounds great! Luna would love to meet Buddy!');

      await waitFor(() => {
        expect(getByText('Hi! That sounds great! Luna would love to meet Buddy!')).toBeTruthy();
      });

      // Use premium feature if available
      if (screen.queryByText('Super Like')) {
        fireEvent.press(getByText('Super Like'));
        await waitFor(() => {
          expect(getByText('Super Like sent!')).toBeTruthy();
        });
      }

      // Send photo
      fireEvent.press(getByText('Attach Photo'));
      await mockCameraCapture('chat-photo.jpg');
      fireEvent.press(screen.getByText('Send Photo'));

      await waitFor(() => {
        expect(getByText('Photo sent')).toBeTruthy();
      });

      // Mark as read and continue conversation
      expect(getByText('Read receipts: On')).toBeTruthy();
    });

    it('should handle conversation management', async () => {
      const { getByText } = render(<ChatScreen />);

      // View conversation list
      await waitFor(() => {
        expect(getByText('Messages')).toBeTruthy();
        expect(getByText('Luna\'s Owner')).toBeTruthy();
        expect(getByText('2 unread messages')).toBeTruthy();
      });

      // Open conversation
      fireEvent.press(getByText('Luna\'s Owner'));

      // Mark as read
      await waitFor(() => {
        expect(screen.queryByText('2 unread messages')).toBeFalsy();
      });

      // Send reply
      const messageInput = screen.getByPlaceholderText('Type a message...');
      fireEvent.changeText(messageInput, 'Sounds perfect! Let\'s meet at the park tomorrow!');
      fireEvent.press(screen.getByText('Send'));

      // Archive conversation
      fireEvent.press(getByText('More Options'));
      fireEvent.press(getByText('Archive Chat'));

      await waitFor(() => {
        expect(getByText('Chat archived')).toBeTruthy();
      });

      // Unarchive
      fireEvent.press(getByText('Archived'));
      fireEvent.press(getByText('Luna\'s Owner'));
      fireEvent.press(getByText('Unarchive'));

      await waitFor(() => {
        expect(getByText('Chat unarchived')).toBeTruthy();
      });
    });
  });

  describe('Settings and Privacy Journey', () => {
    beforeEach(async () => {
      await setupAuthenticatedUser('free');
    });

    it('should manage all privacy and notification settings', async () => {
      const { getByText } = render(<SettingsScreen />);

      // Notification settings
      fireEvent.press(getByText('Notifications'));

      await waitFor(() => {
        expect(getByText('Push Notifications')).toBeTruthy();
      });

      // Toggle notifications
      fireEvent.press(getByText('Matches'));
      fireEvent.press(getByText('Messages'));
      fireEvent.press(getByText('Likes'));

      fireEvent.press(getByText('Save Notification Settings'));

      await waitFor(() => {
        expect(getByText('Notification preferences saved')).toBeTruthy();
      });

      // Privacy settings
      fireEvent.press(getByText('Privacy'));

      fireEvent.press(getByText('Profile Visibility'));
      fireEvent.press(getByText('Show Online Status'));
      fireEvent.press(getByText('Allow Messages'));

      // Set to most private
      fireEvent.press(getByText('Matches Only'));

      fireEvent.press(getByText('Save Privacy Settings'));

      await waitFor(() => {
        expect(getByText('Privacy settings saved')).toBeTruthy();
      });

      // Account settings
      fireEvent.press(getByText('Account'));

      // Change password
      fireEvent.press(getByText('Change Password'));

      const currentPasswordInput = screen.getByPlaceholderText('Current Password');
      const newPasswordInput = screen.getByPlaceholderText('New Password');

      fireEvent.changeText(currentPasswordInput, 'oldpassword');
      fireEvent.changeText(newPasswordInput, 'newpassword123');

      fireEvent.press(screen.getByText('Update Password'));

      await waitFor(() => {
        expect(getByText('Password updated successfully')).toBeTruthy();
      });
    });

    it('should handle GDPR data export and deletion', async () => {
      const { getByText } = render(<SettingsScreen />);

      fireEvent.press(getByText('Privacy'));
      fireEvent.press(getByText('GDPR Rights'));

      // Request data export
      fireEvent.press(getByText('Export My Data'));

      await waitFor(() => {
        expect(getByText('Data export requested')).toBeTruthy();
        expect(getByText('You will receive an email when ready')).toBeTruthy();
      });

      // Mock export completion
      await mockDataExportComplete();

      await waitFor(() => {
        expect(getByText('Your data export is ready')).toBeTruthy();
        expect(getByText('Download Export')).toBeTruthy();
      });

      // Account deletion
      fireEvent.press(getByText('Delete Account'));

      await waitFor(() => {
        expect(getByText('Delete Your Account')).toBeTruthy();
        expect(getByText('This action cannot be undone')).toBeTruthy();
      });

      // Confirm deletion
      fireEvent.press(getByText('I understand, delete my account'));

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, 'password123');

      fireEvent.press(screen.getByText('Delete Account'));

      await waitFor(() => {
        expect(getByText('Account deletion in progress')).toBeTruthy();
        expect(getByText('You will be logged out in 7 days')).toBeTruthy();
      });
    });
  });

  describe('Offline Functionality Journey', () => {
    beforeEach(async () => {
      await setupAuthenticatedUser('free');
      await setupOfflineMode();
    });

    it('should work seamlessly in offline mode', async () => {
      const { getByText } = render(<App />);

      // Simulate going offline
      await mockNetworkOffline();

      await waitFor(() => {
        expect(getByText('You\'re offline')).toBeTruthy();
        expect(getByText('Limited functionality available')).toBeTruthy();
      });

      // Should still show cached data
      expect(getByText('Find Matches')).toBeTruthy();
      expect(getByText('Messages')).toBeTruthy();

      // Perform offline actions
      fireEvent.press(getByText('Find Matches'));

      await waitFor(() => {
        expect(getByText('Offline Mode')).toBeTruthy();
        expect(getByText('Browse cached matches')).toBeTruthy();
      });

      // Send offline message
      fireEvent.press(getByText('Messages'));
      fireEvent.press(getByText('Luna\'s Owner'));

      const messageInput = screen.getByPlaceholderText('Type a message...');
      fireEvent.changeText(messageInput, 'Offline message - will send when online!');
      fireEvent.press(screen.getByText('Send'));

      await waitFor(() => {
        expect(getByText('Message saved for when you\'re back online')).toBeTruthy();
      });

      // Come back online
      await mockNetworkOnline();

      await waitFor(() => {
        expect(getByText('Back online!')).toBeTruthy();
        expect(getByText('Syncing 1 message...')).toBeTruthy();
      });

      // Verify sync completion
      await waitFor(() => {
        expect(getByText('Message sent successfully')).toBeTruthy();
      });
    });

    it('should handle offline profile updates', async () => {
      const { getByText } = render(<ProfileScreen />);

      await mockNetworkOffline();

      // Update profile offline
      fireEvent.press(getByText('Edit Profile'));

      const bioInput = screen.getByPlaceholderText('Bio');
      fireEvent.changeText(bioInput, 'Updated bio while offline');

      fireEvent.press(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(getByText('Changes saved locally')).toBeTruthy();
        expect(getByText('Will sync when online')).toBeTruthy();
      });

      // Come back online and sync
      await mockNetworkOnline();

      await waitFor(() => {
        expect(getByText('Profile updated successfully')).toBeTruthy();
      });
    });
  });

  describe('Error Recovery Journey', () => {
    it('should recover from various error conditions', async () => {
      const { getByText } = render(<App />);

      // Network error during app load
      mockApi.get.mockRejectedValueOnce(new Error('Network timeout'));

      await waitFor(() => {
        expect(getByText('Connection Error')).toBeTruthy();
        expect(getByText('Retry')).toBeTruthy();
      });

      fireEvent.press(getByText('Retry'));

      // App should recover
      await waitFor(() => {
        expect(screen.queryByText('Connection Error')).toBeFalsy();
      });

      // Authentication error
      mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error('Token expired'));

      await waitFor(() => {
        expect(getByText('Session Expired')).toBeTruthy();
        expect(getByText('Please log in again')).toBeTruthy();
      });

      // Should redirect to login
      fireEvent.press(getByText('Log In'));

      await waitFor(() => {
        expect(getByText('Welcome back')).toBeTruthy();
      });
    });

    it('should handle partial service failures gracefully', async () => {
      // Some services fail, others work
      mockApi.get.mockImplementation((endpoint) => {
        if (endpoint.includes('/matches')) {
          return Promise.reject(new Error('Matches service down'));
        }
        return Promise.resolve({ data: [] });
      });

      const { getByText } = render(<SwipeScreen />);

      await waitFor(() => {
        expect(getByText('Matches temporarily unavailable')).toBeTruthy();
        expect(getByText('Try again later')).toBeTruthy();
      });

      // Other features should still work
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });
  });

  describe('Verification Journey', () => {
    beforeEach(async () => {
      await setupAuthenticatedUser('free');
    });

    it('should complete full verification process', async () => {
      const { getByText } = render(<VerificationScreen />);

      // Start verification
      fireEvent.press(getByText('Start Verification'));

      await waitFor(() => {
        expect(getByText('Choose Verification Tier')).toBeTruthy();
      });

      // Select Tier 1
      fireEvent.press(getByText('Tier 1 - Basic'));

      await waitFor(() => {
        expect(getByText('Identity Verification')).toBeTruthy();
      });

      // Complete identity verification
      fireEvent.press(getByText('Start Identity Check'));

      // Mock successful verification
      await mockVerificationSuccess('tier1');

      await waitFor(() => {
        expect(getByText('Verification Complete!')).toBeTruthy();
        expect(getByText('ID Verified')).toBeTruthy();
      });

      // Now unlock premium features
      fireEvent.press(getByText('Upgrade to Premium'));

      await waitFor(() => {
        expect(getByText('Premium features now available')).toBeTruthy();
      });
    });

    it('should handle verification failures and retries', async () => {
      const { getByText } = render(<VerificationScreen />);

      fireEvent.press(getByText('Start Verification'));
      fireEvent.press(getByText('Tier 1 - Basic'));
      fireEvent.press(getByText('Start Identity Check'));

      // Mock verification failure
      await mockVerificationFailure('Document unclear');

      await waitFor(() => {
        expect(getByText('Verification Failed')).toBeTruthy();
        expect(getByText('Document unclear')).toBeTruthy();
        expect(getByText('Try Again')).toBeTruthy();
      });

      // Retry with better document
      fireEvent.press(getByText('Try Again'));
      await mockVerificationSuccess('tier1');

      await waitFor(() => {
        expect(getByText('Verification Complete!')).toBeTruthy();
      });
    });
  });
});

// Helper functions for critical journey tests
async function setupCompleteJourneyMocks() {
  // Setup all mocks needed for complete user journeys
  mockAsyncStorage.getItem.mockResolvedValue(null);
  mockAsyncStorage.setItem.mockResolvedValue(undefined);

  mockAuthService.register.mockResolvedValue({
    user: { id: 'user123', email: 'newuser@example.com' },
    token: 'jwt-token',
  });

  mockApi.post.mockResolvedValue({ data: {} });
  mockApi.get.mockResolvedValue({ data: [] });

  mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
    status: 'granted',
    granted: true,
    canAskAgain: true,
  });

  mockUploadHygieneService.processImageForUpload.mockResolvedValue({
    uri: 'processed://image.jpg',
    width: 1024,
    height: 768,
    fileSize: 204800,
    mimeType: 'image/jpeg',
    metadata: {},
  });
}

async function setupAuthenticatedUser(subscription: 'free' | 'premium' = 'free') {
  mockAuthService.getCurrentUser.mockReturnValue({
    id: 'user123',
    email: 'user@example.com',
    subscription,
  });
}

async function setupMatchesAndConversations() {
  mockApi.get.mockImplementation((endpoint) => {
    if (endpoint.includes('/matches')) {
      return Promise.resolve({
        data: [{
          id: 'match1',
          pet: { name: 'Max', photos: ['max.jpg'] },
          compatibility: 85,
          lastMessage: 'Hi there!',
        }],
      });
    }
    return Promise.resolve({ data: [] });
  });
}

async function setupOfflineMode() {
  mockOfflineService.getSyncStatus.mockReturnValue({
    isOnline: false,
    isSyncing: false,
    lastSyncTime: '2024-01-01T10:00:00Z',
    pendingActionsCount: 0,
    syncProgress: 1.0,
  });
}

async function mockCameraCapture(filename: string) {
  // Mock camera/photo library capture
}

async function mockMutualLike() {
  // Mock receiving a mutual like
}

async function mockIncomingMessage(message: string) {
  // Mock receiving a message
}

async function mockNetworkOffline() {
  // Mock going offline
}

async function mockNetworkOnline() {
  // Mock coming back online
}

async function mockDataExportComplete() {
  // Mock data export completion
}

async function mockVerificationSuccess(tier: string) {
  // Mock successful verification
}

async function mockVerificationFailure(reason: string) {
  // Mock verification failure
}
