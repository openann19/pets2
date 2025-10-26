/**
 * Integration Tests for PawfectMatch Mobile App
 *
 * Tests that verify the interaction between multiple components,
 * services, and systems working together correctly.
 *
 * Coverage:
 * - User journey flows
 * - Service integration
 * - State management across components
 * - Data flow between services
 * - Cross-cutting concerns
 * - Real-world usage scenarios
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all major services and components
import { api } from '../services/api';
import { offlineService } from '../services/offlineService';
import { authService } from '../services/AuthService';
import { notificationService } from '../services/notifications';
import { communityAPI } from '../services/communityAPI';
import { aiService } from '../services/aiService';
import { uploadHygieneService } from '../services/uploadHygiene';

// Import key screens
import App from '../App';

// Mock all dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../services/api');
jest.mock('../services/offlineService');
jest.mock('../services/AuthService');
jest.mock('../services/notifications');
jest.mock('../services/communityAPI');
jest.mock('../services/aiService');
jest.mock('../services/uploadHygiene');
jest.mock('../App', () => ({
  __esModule: true,
  default: () => null,
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockApi = api as jest.Mocked<typeof api>;
const mockOfflineService = offlineService as jest.Mocked<typeof offlineService>;
const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockCommunityAPI = communityAPI as jest.Mocked<typeof communityAPI>;
const mockAiService = aiService as jest.Mocked<typeof aiService>;
const mockUploadHygieneService = uploadHygieneService as jest.Mocked<typeof uploadHygieneService>;
const mockAuthNavigator = AuthNavigator as jest.Mocked<typeof AuthNavigator>;
const mockMainNavigator = MainNavigator as jest.Mocked<typeof MainNavigator>;

describe('PawfectMatch Integration Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAuthService.getCurrentUser.mockReturnValue(null);
    mockOfflineService.getSyncStatus.mockReturnValue({
      isOnline: true,
      isSyncing: false,
      lastSyncTime: new Date().toISOString(),
      pendingActionsCount: 0,
      syncProgress: 1.0,
    });
  });

  describe('Complete User Onboarding Flow', () => {
    it('should complete full user onboarding from registration to first match', async () => {
      // Mock successful registration
      mockAuthService.register.mockResolvedValue({
        user: { id: 'user123', email: 'newuser@example.com' },
        token: 'jwt-token',
      });

      // Mock pet creation
      mockApi.post.mockResolvedValue({
        data: {
          pet: {
            id: 'pet123',
            name: 'Buddy',
            breed: 'Golden Retriever',
            photos: ['photo1.jpg'],
          },
        },
      });

      // Mock initial data fetch
      mockApi.get.mockResolvedValue({
        data: {
          pets: [
            { id: 'pet1', name: 'Luna', photos: ['luna1.jpg'], compatibility: 85 },
            { id: 'pet2', name: 'Max', photos: ['max1.jpg'], compatibility: 72 },
          ],
        },
      });

      // Mock AI compatibility computation
      mockAiService.computeCompatibility.mockResolvedValue({
        score: 85,
        breakdown: {
          breed: 90,
          size: 85,
          energy: 80,
          age: 85,
          traits: 85,
        },
      });

      const { getByText, getByPlaceholderText } = render(<App />);

      // Step 1: Registration
      const registerButton = getByText('Get Started');
      fireEvent.press(registerButton);

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const registerSubmitButton = getByText('Create Account');

      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(registerSubmitButton);

      await waitFor(() => {
        expect(mockAuthService.register).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
        });
      });

      // Step 2: Email verification (mocked)
      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeTruthy();
      });

      // Mock email verification
      act(() => {
        mockAuthService.verifyEmail('verification-code');
      });

      // Step 3: Profile setup
      await waitFor(() => {
        expect(screen.getByText('Complete Your Profile')).toBeTruthy();
      });

      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const bioInput = getByPlaceholderText('Tell us about yourself');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(bioInput, 'Pet lover and adventurer!');
      fireEvent.press(getByText('Continue'));

      // Step 4: Pet creation
      await waitFor(() => {
        expect(screen.getByText('Add Your Pet')).toBeTruthy();
      });

      const petNameInput = getByPlaceholderText('Pet Name');
      const petTypeButton = getByText('Dog');
      const breedInput = getByPlaceholderText('Breed');

      fireEvent.changeText(petNameInput, 'Buddy');
      fireEvent.press(petTypeButton);
      fireEvent.changeText(breedInput, 'Golden Retriever');
      fireEvent.press(getByText('Add Photos'));

      // Mock photo upload
      act(() => {
        mockUploadHygieneService.processImageForUpload.mockResolvedValue({
          uri: 'processed-photo.jpg',
          width: 1024,
          height: 768,
          fileSize: 256000,
          mimeType: 'image/jpeg',
          metadata: { originalWidth: 2048, originalHeight: 1536 },
        });
      });

      fireEvent.press(getByText('Create Pet Profile'));

      // Step 5: Enter main app and first swipe
      await waitFor(() => {
        expect(screen.getByText('Find Matches')).toBeTruthy();
      });

      // Verify data integration
      expect(mockOfflineService.getPets).toHaveBeenCalled();
      expect(mockApi.get).toHaveBeenCalledWith('/pets/matches');

      // First swipe
      const likeButton = getByText('Like');
      fireEvent.press(likeButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/pets/swipe', {
          petId: 'pet123',
          targetPetId: 'pet1',
          action: 'like',
        });
      });

      // Should show match modal
      await waitFor(() => {
        expect(screen.getByText('It\'s a Match!')).toBeTruthy();
      });

      // Verify all services worked together
      expect(mockAuthService.register).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledTimes(2); // Pet creation + swipe
      expect(mockOfflineService.getPets).toHaveBeenCalled();
      expect(mockNotificationService.scheduleLocalNotification).toHaveBeenCalledWith(
        'New Match!',
        'You matched with Luna!'
      );
    });
  });

  describe('Offline-Online Data Synchronization', () => {
    it('should handle offline actions and sync when online', async () => {
      // Setup offline state
      mockOfflineService.getSyncStatus.mockReturnValue({
        isOnline: false,
        isSyncing: false,
        lastSyncTime: '2024-01-01T10:00:00Z',
        pendingActionsCount: 0,
        syncProgress: 1.0,
      });

      const { getByText } = render(<App />);

      // User performs actions while offline
      const likeButton = getByText('Like');
      fireEvent.press(likeButton);

      // Should queue action offline
      expect(mockOfflineService.addPendingAction).toHaveBeenCalledWith('swipe', {
        petId: 'current-pet',
        targetPetId: 'target-pet',
        direction: 'like',
      });

      // Come back online
      act(() => {
        mockOfflineService.getSyncStatus.mockReturnValue({
          isOnline: true,
          isSyncing: true,
          lastSyncTime: '2024-01-01T10:00:00Z',
          pendingActionsCount: 1,
          syncProgress: 0.5,
        });
      });

      // Trigger sync
      fireEvent.press(getByText('Sync Now'));

      await waitFor(() => {
        expect(mockOfflineService.triggerSync).toHaveBeenCalled();
      });

      // Verify sync completed
      act(() => {
        mockOfflineService.getSyncStatus.mockReturnValue({
          isOnline: true,
          isSyncing: false,
          lastSyncTime: new Date().toISOString(),
          pendingActionsCount: 0,
          syncProgress: 1.0,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Sync Complete')).toBeTruthy();
      });

      // Verify offline actions were processed
      expect(mockApi.post).toHaveBeenCalledWith('/pets/swipe', {
        petId: 'current-pet',
        targetPetId: 'target-pet',
        action: 'like',
      });
    });
  });

  describe('Community Features Integration', () => {
    beforeEach(async () => {
      // Login user
      mockAuthService.getCurrentUser.mockReturnValue({
        id: 'user123',
        email: 'user@example.com',
        pets: [{ id: 'pet123', name: 'Buddy' }],
      });
    });

    it('should integrate community posting with AI bio generation', async () => {
      const { getByText, getByPlaceholderText } = render(<CommunityScreen />);

      // Navigate to create post
      fireEvent.press(getByText('Create Post'));

      // Choose AI-generated bio option
      fireEvent.press(getByText('Generate with AI'));

      const keywordsInput = getByPlaceholderText('Enter keywords (e.g., friendly, playful)');
      fireEvent.changeText(keywordsInput, 'friendly, energetic, loves walks');

      fireEvent.press(getByText('Generate Bio'));

      // Mock AI service call
      act(() => {
        mockAiService.generateBio.mockResolvedValue(
          'Meet Buddy, a friendly and energetic companion who absolutely loves long walks in the park!'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Meet Buddy, a friendly and energetic companion...')).toBeTruthy();
      });

      // Add photo
      fireEvent.press(getByText('Add Photo'));

      act(() => {
        mockUploadHygieneService.pickAndProcessImage.mockResolvedValue({
          uri: 'processed-community-photo.jpg',
          width: 1024,
          height: 768,
          fileSize: 200000,
          mimeType: 'image/jpeg',
          metadata: {},
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Photo added')).toBeTruthy();
      });

      // Publish post
      fireEvent.press(getByText('Share Post'));

      await waitFor(() => {
        expect(mockCommunityAPI.createPost).toHaveBeenCalledWith({
          content: 'Meet Buddy, a friendly and energetic companion who absolutely loves long walks in the park!',
          images: ['processed-community-photo.jpg'],
          type: 'post',
        });
      });

      expect(screen.getByText('Post shared successfully!')).toBeTruthy();
    });

    it('should handle community interactions across services', async () => {
      const { getByText } = render(<CommunityFeed />);

      // Load feed
      await waitFor(() => {
        expect(mockCommunityAPI.getFeed).toHaveBeenCalled();
      });

      // Mock feed data with posts
      act(() => {
        mockCommunityAPI.getFeed.mockResolvedValue({
          success: true,
          posts: [
            {
              _id: 'post1',
              author: { _id: 'user456', name: 'Jane Doe' },
              content: 'Beautiful park today!',
              likes: 5,
              liked: false,
              comments: [],
              createdAt: '2024-01-01T12:00:00Z',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 },
          appliedFilters: { packId: null, userId: null, type: null, matchedCount: 1 },
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Beautiful park today!')).toBeTruthy();
      });

      // Like the post
      fireEvent.press(getByText('Like'));

      await waitFor(() => {
        expect(mockCommunityAPI.likePost).toHaveBeenCalledWith('post1');
      });

      // Add comment
      const commentInput = screen.getByPlaceholderText('Write a comment...');
      fireEvent.changeText(commentInput, 'Looks amazing!');
      fireEvent.press(getByText('Comment'));

      await waitFor(() => {
        expect(mockCommunityAPI.addComment).toHaveBeenCalledWith('post1', {
          content: 'Looks amazing!',
        });
      });

      // Verify notification integration
      expect(mockNotificationService.scheduleLocalNotification).toHaveBeenCalledWith(
        'Comment Added',
        'Your comment was posted successfully'
      );
    });
  });

  describe('Premium Feature Integration', () => {
    it('should integrate premium features across the app', async () => {
      // Setup free user
      mockAuthService.getCurrentUser.mockReturnValue({
        id: 'user123',
        subscription: 'free',
      });

      const { getByText } = render(<SwipeScreen />);

      // Try to use premium feature
      fireEvent.press(getByText('Super Like'));

      await waitFor(() => {
        expect(screen.getByText('Upgrade to Premium')).toBeTruthy();
        expect(screen.getByText('Get unlimited Super Likes!')).toBeTruthy();
      });

      // Start upgrade flow
      fireEvent.press(getByText('Upgrade Now'));

      // Mock payment success
      act(() => {
        mockApi.post.mockResolvedValue({
          data: {
            subscription: {
              status: 'active',
              plan: 'premium',
              features: ['super_likes', 'advanced_filters', 'priority_matching'],
            },
          },
        });
      });

      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        // User should now have premium status
        expect(screen.getByText('Premium Active')).toBeTruthy();
      });

      // Verify premium features are now available
      const superLikeButton = getByText('Super Like');
      expect(superLikeButton).not.toBeDisabled();

      // Test advanced filters (premium feature)
      fireEvent.press(getByText('Filters'));
      expect(screen.getByText('Advanced Filters')).toBeTruthy();
      expect(screen.getByText('Breed Preferences')).toBeTruthy();
      expect(screen.getByText('Size Preferences')).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors across multiple services', async () => {
      // Setup network failure for multiple services
      mockApi.get.mockRejectedValue(new Error('Network Error'));
      mockCommunityAPI.getFeed.mockRejectedValue(new Error('Community API Error'));
      mockOfflineService.getPets.mockRejectedValue(new Error('Offline Error'));

      const { getByText } = render(<MainScreen />);

      // Try to load data
      await waitFor(() => {
        expect(screen.getByText('Connection Error')).toBeTruthy();
      });

      // Should show offline mode
      expect(getByText('Offline Mode')).toBeTruthy();
      expect(getByText('Using cached data')).toBeTruthy();

      // Verify error reporting
      expect(mockNotificationService.scheduleLocalNotification).toHaveBeenCalledWith(
        'Connection Issues',
        'Some features may not be available offline'
      );
    });

    it('should handle authentication errors across services', async () => {
      // Mock auth token expiry
      mockApi.get.mockRejectedValue(new Error('Unauthorized'));
      mockAuthService.refreshToken.mockRejectedValue(new Error('Token refresh failed'));

      const { getByText } = render(<ProtectedScreen />);

      await waitFor(() => {
        expect(screen.getByText('Session Expired')).toBeTruthy();
      });

      // Should redirect to login
      expect(getByText('Please log in again')).toBeTruthy();

      // Verify cleanup
      expect(mockOfflineService.clearOfflineData).toHaveBeenCalled();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should handle partial service failures gracefully', async () => {
      // Some services work, others fail
      mockApi.get.mockResolvedValue({ data: [] }); // Works
      mockCommunityAPI.getFeed.mockRejectedValue(new Error('Feed unavailable')); // Fails
      mockOfflineService.getPets.mockResolvedValue([]); // Works

      const { getByText } = render(<Dashboard />);

      await waitFor(() => {
        expect(getByText('Dashboard')).toBeTruthy();
      });

      // Should show partial data
      expect(getByText('Recent Matches')).toBeTruthy();
      expect(screen.getByText('Community feed temporarily unavailable')).toBeTruthy();
      expect(getByText('Your Pets')).toBeTruthy();

      // Should not crash the entire app
      expect(screen.queryByText('App Error')).toBeNull();
    });
  });

  describe('State Management Integration', () => {
    it('should synchronize state across components', async () => {
      const { getByText } = render(<AppWithMultipleComponents />);

      // Update user profile in one component
      fireEvent.press(getByText('Edit Profile'));
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.changeText(nameInput, 'Updated Name');
      fireEvent.press(getByText('Save Profile'));

      // Verify update propagates to other components
      await waitFor(() => {
        expect(mockApi.put).toHaveBeenCalledWith('/user/profile', {
          name: 'Updated Name',
        });
      });

      // Check that header component shows updated name
      expect(screen.getByText('Welcome, Updated Name')).toBeTruthy();

      // Check that settings component reflects changes
      fireEvent.press(getByText('Settings'));
      expect(screen.getByText('Updated Name')).toBeTruthy();
    });

    it('should handle concurrent state updates', async () => {
      const { result } = renderHook(() => useConcurrentState());

      act(() => {
        result.current.updateState1({ count: 1 });
        result.current.updateState2({ value: 'test' });
        result.current.updateState1({ count: 2 });
      });

      await waitFor(() => {
        expect(result.current.getState().count).toBe(2); // Last update wins
        expect(result.current.getState().value).toBe('test');
        expect(result.current.getUpdateCount()).toBe(3);
      });
    });

    it('should handle navigation state integration', async () => {
      const { getByText } = render(<NavigationIntegration />);

      // Navigate through different screens
      fireEvent.press(getByText('Go to Profile'));
      expect(screen.getByText('Profile Screen')).toBeTruthy();

      fireEvent.press(getByText('Go to Settings'));
      expect(screen.getByText('Settings Screen')).toBeTruthy();

      fireEvent.press(getByText('Go to Matches'));
      expect(screen.getByText('Matches Screen')).toBeTruthy();

      // Verify navigation state is maintained
      expect(mockOfflineService.getSyncStatus).toHaveBeenCalled();
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeMatches = Array.from({ length: 1000 }, (_, i) => ({
        id: `match${i}`,
        pet: {
          name: `Pet${i}`,
          photos: [`photo${i}.jpg`],
        },
        compatibility: Math.floor(Math.random() * 100),
      }));

      mockApi.get.mockResolvedValue({ data: largeMatches });

      const { getByText } = render(<MatchesList />);

      // Should load without performance issues
      await waitFor(() => {
        expect(getByText('Pet0')).toBeTruthy();
        expect(getByText('Pet999')).toBeTruthy();
      }, { timeout: 5000 }); // Allow time for large list

      // Verify virtualization or pagination is working
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    it('should optimize image loading and caching', async () => {
      const { getByText } = render(<ImageGallery />);

      // Load images
      await waitFor(() => {
        expect(mockUploadHygieneService.getImageCache).toHaveBeenCalled();
      });

      // Should use cached images when available
      expect(screen.getByText('Images loaded from cache')).toBeTruthy();

      // Should lazy load additional images
      fireEvent.press(getByText('Load More'));
      expect(mockApi.get).toHaveBeenCalledWith('/images?page=2');
    });

    it('should handle memory warnings gracefully', async () => {
      const { result } = renderHook(() => useMemoryIntegration());

      // Simulate memory warning
      act(() => {
        result.current.simulateMemoryWarning();
      });

      await waitFor(() => {
        expect(result.current.getMemoryOptimizations()).toContain('cleared_image_cache');
        expect(result.current.getMemoryOptimizations()).toContain('reduced_list_size');
      });

      // App should continue functioning
      expect(result.current.isAppStable()).toBe(true);
    });
  });

  describe('Analytics Integration', () => {
    it('should track user journey across screens', async () => {
      const { getByText } = render(<AnalyticsIntegration />);

      // Navigate through user journey
      fireEvent.press(getByText('Start'));
      expect(screen.getByText('Step 1')).toBeTruthy();

      fireEvent.press(getByText('Continue'));
      expect(screen.getByText('Step 2')).toBeTruthy();

      fireEvent.press(getByText('Complete'));
      expect(screen.getByText('Finished')).toBeTruthy();

      // Verify analytics events were tracked
      expect(mockApi.post).toHaveBeenCalledWith('/analytics/event', {
        event: 'journey_started',
        properties: { step: 0 },
      });

      expect(mockApi.post).toHaveBeenCalledWith('/analytics/event', {
        event: 'journey_step_completed',
        properties: { step: 1 },
      });

      expect(mockApi.post).toHaveBeenCalledWith('/analytics/event', {
        event: 'journey_completed',
        properties: { totalSteps: 3 },
      });
    });

    it('should integrate analytics with error reporting', async () => {
      // Cause an error
      mockApi.get.mockRejectedValue(new Error('API Error'));

      const { getByText } = render(<ErrorAnalytics />);

      fireEvent.press(getByText('Trigger Error'));

      await waitFor(() => {
        expect(screen.getByText('Error occurred')).toBeTruthy();
      });

      // Verify error was reported with analytics context
      expect(mockApi.post).toHaveBeenCalledWith('/analytics/error', {
        error: 'API Error',
        context: 'ErrorAnalytics component',
        userId: 'current-user',
        sessionId: 'current-session',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Notification Integration', () => {
    it('should handle push notifications and in-app navigation', async () => {
      // Mock push notification received
      act(() => {
        mockNotificationService.handleNotification({
          type: 'match',
          data: { matchId: 'match123', petName: 'Luna' },
        });
      });

      await waitFor(() => {
        expect(screen.getByText('New Match!')).toBeTruthy();
        expect(screen.getByText('You matched with Luna!')).toBeTruthy();
      });

      // Tap notification
      fireEvent.press(screen.getByText('View Match'));

      // Should navigate to match screen
      await waitFor(() => {
        expect(screen.getByText('Match Details')).toBeTruthy();
        expect(mockApi.get).toHaveBeenCalledWith('/matches/match123');
      });
    });

    it('should integrate notifications with offline queue', async () => {
      // Go offline
      mockOfflineService.getSyncStatus.mockReturnValue({
        isOnline: false,
        isSyncing: false,
        lastSyncTime: '2024-01-01T10:00:00Z',
        pendingActionsCount: 0,
        syncProgress: 1.0,
      });

      const { getByText } = render(<NotificationOffline />);

      fireEvent.press(getByText('Send Message'));

      // Should queue notification for later
      await waitFor(() => {
        expect(screen.getByText('Message will be sent when online')).toBeTruthy();
      });

      // Come back online
      mockOfflineService.getSyncStatus.mockReturnValue({
        isOnline: true,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        pendingActionsCount: 0,
        syncProgress: 1.0,
      });

      await waitFor(() => {
        expect(mockNotificationService.scheduleLocalNotification).toHaveBeenCalledWith(
          'Message Sent',
          'Your message was delivered successfully'
        );
      });
    });
  });
});

// Mock components for integration testing
function CommunityScreen() { return null; }
function CommunityFeed() { return null; }
function MainScreen() { return null; }
function SwipeScreen() { return null; }
function ProtectedScreen() { return null; }
function Dashboard() { return null; }
function MatchesList() { return null; }
function ImageGallery() { return null; }
function AppWithMultipleComponents() { return null; }
function NavigationIntegration() { return null; }
function ErrorAnalytics() { return null; }
function NotificationOffline() { return null; }

// Helper hooks for integration testing
function useConcurrentState() {
  return {
    updateState1: jest.fn(),
    updateState2: jest.fn(),
    getState: jest.fn(),
    getUpdateCount: jest.fn(),
  };
}

function useMemoryIntegration() {
  return {
    simulateMemoryWarning: jest.fn(),
    getMemoryOptimizations: jest.fn(),
    isAppStable: jest.fn(),
  };
}
