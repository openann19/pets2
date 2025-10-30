/**
 * Comprehensive tests for useProfileScreen hook
 *
 * Coverage:
 * - Profile data fetching and state management
 * - Profile editing and update operations
 * - Photo management and upload
 * - Privacy settings and visibility controls
 * - Social interactions (likes, views, matches)
 * - Profile completion status and validation
 * - Cache management and offline support
 * - Real-time updates and synchronization
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useProfileScreen } from '../useProfileScreen';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-image-picker');
jest.mock('../../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../../services/analyticsService', () => ({
  analyticsService: {
    trackEvent: jest.fn(),
    trackScreenView: jest.fn(),
  },
}));

jest.mock('../../../hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { api } from '../../../services/api';
import { analyticsService } from '../../../services/analyticsService';
import { useColorScheme } from '../../../hooks/useColorScheme';

const mockApi = api as jest.Mocked<typeof api>;
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;
const mockUseColorScheme = useColorScheme as jest.Mock;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('useProfileScreen', () => {
  const mockProfileData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'I love pets and outdoor activities!',
    age: 28,
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
    photos: [
      { id: 'photo1', url: 'profile1.jpg', isPrimary: true, order: 1 },
      { id: 'photo2', url: 'profile2.jpg', isPrimary: false, order: 2 },
      { id: 'photo3', url: 'profile3.jpg', isPrimary: false, order: 3 },
    ],
    preferences: {
      petTypes: ['dogs', 'cats'],
      maxDistance: 25,
      ageRange: { min: 1, max: 10 },
      breed: 'Golden Retriever',
    },
    stats: {
      profileViews: 150,
      likesReceived: 45,
      matches: 12,
      superLikes: 3,
    },
    settings: {
      profileVisible: true,
      showDistance: true,
      showAge: true,
      notifications: {
        matches: true,
        messages: true,
        likes: false,
      },
    },
    isComplete: true,
    completionPercentage: 95,
  };

  const mockPets = [
    {
      id: 'pet1',
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 2,
      photos: ['buddy1.jpg', 'buddy2.jpg'],
      isActive: true,
    },
    {
      id: 'pet2',
      name: 'Luna',
      species: 'cat',
      breed: 'Siamese',
      age: 1,
      photos: ['luna1.jpg'],
      isActive: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    mockApi.get.mockImplementation((endpoint) => {
      if (endpoint === '/profile') {
        return Promise.resolve({ data: mockProfileData });
      }
      if (endpoint === '/profile/pets') {
        return Promise.resolve({ data: mockPets });
      }
      return Promise.resolve({ data: {} });
    });

    mockApi.post.mockResolvedValue({ data: { success: true } });
    mockApi.put.mockResolvedValue({ data: { success: true } });

    mockUseColorScheme.mockReturnValue('light');

    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
      status: 'granted',
    });

    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'new-photo.jpg', type: 'image/jpeg' }],
    });
  });

  describe('Initial State and Data Loading', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useProfileScreen());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.profile).toBeNull();
      expect(result.current.pets).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load profile data on mount', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toEqual(mockProfileData);
      expect(result.current.pets).toEqual(mockPets);
      expect(mockApi.get).toHaveBeenCalledWith('/profile');
      expect(mockApi.get).toHaveBeenCalledWith('/profile/pets');
      expect(mockAnalyticsService.trackScreenView).toHaveBeenCalledWith('ProfileScreen');
    });

    it('should handle loading errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Profile not found'));

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Profile not found');
      expect(result.current.profile).toBeNull();
    });
  });

  describe('Profile Updates', () => {
    it('should update profile successfully', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { bio: 'Updated bio!', age: 29 };
      const updatedProfile = { ...mockProfileData, ...updates };

      mockApi.put.mockResolvedValueOnce({ data: updatedProfile });

      await act(async () => {
        const success = await result.current.updateProfile(updates);
        expect(success).toBe(true);
      });

      expect(result.current.profile?.bio).toBe('Updated bio!');
      expect(result.current.profile?.age).toBe(29);
      expect(mockApi.put).toHaveBeenCalledWith('/profile', updates);
    });

    it('should handle profile update errors', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.put.mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        const success = await result.current.updateProfile({ bio: 'New bio' });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Update failed');
    });

    it('should validate profile updates', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test invalid age
      await act(async () => {
        const success = await result.current.updateProfile({ age: -5 });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Invalid age');

      // Test invalid bio length
      const longBio = 'A'.repeat(1000);
      await act(async () => {
        const success = await result.current.updateProfile({ bio: longBio });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Bio is too long');
    });
  });

  describe('Photo Management', () => {
    it('should add photo successfully', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPhoto = { id: 'photo4', url: 'new-photo.jpg', isPrimary: false, order: 4 };
      mockApi.post.mockResolvedValueOnce({ data: newPhoto });

      await act(async () => {
        const success = await result.current.addPhoto();
        expect(success).toBe(true);
      });

      expect(result.current.profile?.photos).toContain(newPhoto);
    });

    it('should remove photo successfully', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.delete.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.removePhoto('photo2');
        expect(success).toBe(true);
      });

      expect(result.current.profile?.photos.find((p) => p.id === 'photo2')).toBeUndefined();
    });

    it('should set primary photo', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.put.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.setPrimaryPhoto('photo2');
        expect(success).toBe(true);
      });

      const primaryPhoto = result.current.profile?.photos.find((p) => p.id === 'photo2');
      const oldPrimary = result.current.profile?.photos.find((p) => p.id === 'photo1');

      expect(primaryPhoto?.isPrimary).toBe(true);
      expect(oldPrimary?.isPrimary).toBe(false);
    });

    it('should reorder photos', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newOrder = ['photo3', 'photo1', 'photo2'];
      mockApi.put.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.reorderPhotos(newOrder);
        expect(success).toBe(true);
      });

      expect(result.current.profile?.photos[0].id).toBe('photo3');
      expect(result.current.profile?.photos[1].id).toBe('photo1');
      expect(result.current.profile?.photos[2].id).toBe('photo2');
    });

    it('should handle photo permission denied', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
        granted: false,
        status: 'denied',
      });

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.addPhoto();
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Photo library permission denied');
    });
  });

  describe('Pet Management', () => {
    it('should add pet successfully', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPet = {
        name: 'Max',
        species: 'dog',
        breed: 'Labrador',
        age: 3,
      };

      mockApi.post.mockResolvedValueOnce({ data: { ...newPet, id: 'pet3' } });

      await act(async () => {
        const success = await result.current.addPet(newPet);
        expect(success).toBe(true);
      });

      expect(result.current.pets).toHaveLength(3);
    });

    it('should update pet successfully', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { name: 'Buddy Jr.', age: 3 };
      mockApi.put.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updatePet('pet1', updates);
        expect(success).toBe(true);
      });

      const updatedPet = result.current.pets.find((p) => p.id === 'pet1');
      expect(updatedPet?.name).toBe('Buddy Jr.');
      expect(updatedPet?.age).toBe(3);
    });

    it('should remove pet successfully', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.delete.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.removePet('pet2');
        expect(success).toBe(true);
      });

      expect(result.current.pets).toHaveLength(1);
      expect(result.current.pets.find((p) => p.id === 'pet2')).toBeUndefined();
    });

    it('should get active pets only', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getActivePets()).toHaveLength(1);
      expect(result.current.getActivePets()[0].name).toBe('Buddy');
    });
  });

  describe('Privacy and Settings', () => {
    it('should update privacy settings', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newSettings = {
        profileVisible: false,
        showDistance: false,
        notifications: { matches: false, messages: true, likes: true },
      };

      mockApi.put.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updatePrivacySettings(newSettings);
        expect(success).toBe(true);
      });

      expect(result.current.profile?.settings).toEqual(newSettings);
    });

    it('should toggle profile visibility', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.put.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        await result.current.toggleProfileVisibility();
      });

      expect(result.current.profile?.settings.profileVisible).toBe(false);
    });
  });

  describe('Profile Completion', () => {
    it('should calculate completion percentage', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getCompletionPercentage()).toBe(95);
      expect(result.current.isProfileComplete()).toBe(true);
    });

    it('should get completion requirements', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const requirements = result.current.getCompletionRequirements();
      expect(requirements).toContain('Add profile photo');
      expect(requirements).toContain('Write a bio');
      expect(requirements).toContain('Add pet information');
    });

    it('should validate profile completeness', async () => {
      const incompleteProfile = {
        ...mockProfileData,
        bio: '',
        photos: [],
        completionPercentage: 45,
      };

      mockApi.get.mockResolvedValueOnce({ data: incompleteProfile });

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isProfileComplete()).toBe(false);
      expect(result.current.getCompletionPercentage()).toBe(45);
    });
  });

  describe('Statistics and Analytics', () => {
    it('should provide profile statistics', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getProfileStats()).toEqual(mockProfileData.stats);
      expect(result.current.getEngagementRate()).toBeCloseTo(0.3); // 45 likes / 150 views
    });

    it('should track profile interactions', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackProfileView();
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'profile_view',
        { profileId: 'user123' },
        'user123',
      );
    });
  });

  describe('Cache Management', () => {
    it('should cache profile data', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'profile_screen_cache',
        expect.any(String),
      );
    });

    it('should clear cache when requested', async () => {
      const { result } = renderHook(() => useProfileScreen());

      // Set some data
      act(() => {
        result.current.profile = mockProfileData;
        result.current.pets = mockPets;
      });

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.pets).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApi.put.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.updateProfile({ bio: 'New bio' });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still work despite storage errors
      expect(result.current.profile).toEqual(mockProfileData);
    });

    it('should reset error state on successful operations', async () => {
      // First operation fails
      mockApi.put.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateProfile({ bio: 'Bio 1' });
      });

      expect(result.current.error).toBe('First error');

      // Second operation succeeds
      mockApi.put.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updateProfile({ bio: 'Bio 2' });
        expect(success).toBe(true);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time profile updates', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedProfile = { ...mockProfileData, profileViews: 200 };

      act(() => {
        result.current.handleProfileUpdate(updatedProfile);
      });

      expect(result.current.profile?.stats.profileViews).toBe(200);
    });

    it('should handle real-time pet updates', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedPet = { ...mockPets[0], name: 'Buddy Updated' };

      act(() => {
        result.current.handlePetUpdate(updatedPet);
      });

      const pet = result.current.pets.find((p) => p.id === 'pet1');
      expect(pet?.name).toBe('Buddy Updated');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty profile data', async () => {
      const emptyProfile = {
        id: 'user123',
        name: '',
        photos: [],
        stats: { profileViews: 0, likesReceived: 0, matches: 0, superLikes: 0 },
        isComplete: false,
        completionPercentage: 0,
      };

      mockApi.get.mockResolvedValueOnce({ data: emptyProfile });

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isProfileComplete()).toBe(false);
      expect(result.current.getCompletionPercentage()).toBe(0);
      expect(result.current.profile?.photos).toEqual([]);
    });

    it('should handle profile with no pets', async () => {
      mockApi.get.mockImplementation((endpoint) => {
        if (endpoint === '/profile') {
          return Promise.resolve({ data: mockProfileData });
        }
        if (endpoint === '/profile/pets') {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: {} });
      });

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pets).toEqual([]);
      expect(result.current.getActivePets()).toEqual([]);
    });

    it('should handle very large photo arrays', async () => {
      const profileWithManyPhotos = {
        ...mockProfileData,
        photos: Array.from({ length: 20 }, (_, i) => ({
          id: `photo${i}`,
          url: `photo${i}.jpg`,
          isPrimary: i === 0,
          order: i + 1,
        })),
      };

      mockApi.get.mockResolvedValueOnce({ data: profileWithManyPhotos });

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile?.photos).toHaveLength(20);
    });

    it('should handle malformed cached data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{invalid json}');

      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should load fresh data despite corrupted cache
      expect(result.current.profile).toEqual(mockProfileData);
    });

    it('should handle concurrent operations', async () => {
      const { result } = renderHook(() => useProfileScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Multiple concurrent updates
      const updates = [
        result.current.updateProfile({ bio: 'Bio 1' }),
        result.current.updateProfile({ bio: 'Bio 2' }),
        result.current.updateProfile({ bio: 'Bio 3' }),
      ];

      const results = await Promise.all(updates);

      // Should handle all operations
      expect(results.some((r) => r === true)).toBe(true);
    });
  });
});
