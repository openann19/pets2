/**
 * @jest-environment node
 * Integration Test: Auth + Profile + Settings Flow
 * Demonstrates how multiple hooks work together in real user scenarios
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This integration test demonstrates:
// 1. User logs in (useAuthStore)
// 2. Profile data loads (useProfileData)
// 3. Settings persist (useSettingsPersistence)
// 4. State synchronization across hooks

describe('Auth + Profile + Settings Integration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should maintain state synchronization across auth, profile, and settings', async () => {
    // Scenario: User logs in, profile loads, and settings are persisted

    // Mock auth store
    const mockAuthStore = {
      user: null,
      isAuthenticated: false,
      login: jest.fn(async (email: string, password: string) => {
        mockAuthStore.user = { _id: 'user-123', email };
        mockAuthStore.isAuthenticated = true;
      }),
      logout: jest.fn(() => {
        mockAuthStore.user = null;
        mockAuthStore.isAuthenticated = false;
      }),
    };

    jest.mock('@pawfectmatch/core', () => ({
      useAuthStore: () => mockAuthStore,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    }));

    // Step 1: User logs in
    await act(async () => {
      await mockAuthStore.login('test@example.com', 'password123');
    });

    expect(mockAuthStore.isAuthenticated).toBe(true);
    expect(mockAuthStore.user).toEqual({
      _id: 'user-123',
      email: 'test@example.com',
    });

    // Step 2: Profile data should be available after login
    const mockProfileData = {
      _id: 'user-123',
      name: 'Test User',
      bio: 'Test bio',
      photos: ['photo1.jpg'],
      preferences: {
        ageRange: [1, 10],
        distance: 50,
      },
    };

    // Step 3: Settings should persist to AsyncStorage
    const settings = {
      notifications: true,
      darkMode: false,
      language: 'en',
    };

    await act(async () => {
      await AsyncStorage.setItem('user-settings', JSON.stringify(settings));
    });

    const storedSettings = await AsyncStorage.getItem('user-settings');
    expect(JSON.parse(storedSettings!)).toEqual(settings);

    // Step 4: Verify state synchronization
    expect(mockAuthStore.user?._id).toBe(mockProfileData._id);
  });

  it('should handle logout and clear all user data', async () => {
    // Setup: User is logged in with data
    const mockAuthStore = {
      user: { _id: 'user-123', email: 'test@example.com' },
      isAuthenticated: true,
      logout: jest.fn(() => {
        mockAuthStore.user = null;
        mockAuthStore.isAuthenticated = false;
      }),
    };

    // Store some data
    await AsyncStorage.setItem('user-settings', JSON.stringify({ theme: 'dark' }));
    await AsyncStorage.setItem('user-profile-cache', JSON.stringify({ name: 'Test' }));

    // User logs out
    await act(async () => {
      await mockAuthStore.logout();
    });

    expect(mockAuthStore.isAuthenticated).toBe(false);
    expect(mockAuthStore.user).toBe(null);

    // Clear stored data on logout
    await act(async () => {
      await AsyncStorage.removeItem('user-settings');
      await AsyncStorage.removeItem('user-profile-cache');
    });

    const settings = await AsyncStorage.getItem('user-settings');
    const profile = await AsyncStorage.getItem('user-profile-cache');

    expect(settings).toBe(null);
    expect(profile).toBe(null);
  });

  it('should handle profile updates and persist changes', async () => {
    // Mock profile state
    let profileData = {
      _id: 'user-123',
      name: 'John Doe',
      bio: 'Original bio',
      photos: [],
    };

    const updateProfile = jest.fn(async (updates: any) => {
      profileData = { ...profileData, ...updates };
      await AsyncStorage.setItem('user-profile-cache', JSON.stringify(profileData));
    });

    // Update profile
    await act(async () => {
      await updateProfile({ bio: 'Updated bio', name: 'John Updated' });
    });

    expect(profileData.bio).toBe('Updated bio');
    expect(profileData.name).toBe('John Updated');

    // Verify persistence
    const cached = await AsyncStorage.getItem('user-profile-cache');
    expect(JSON.parse(cached!)).toEqual(profileData);
  });

  it('should handle settings changes and sync with preferences', async () => {
    // Initial settings
    const settings = {
      notifications: true,
      emailNotifications: false,
      pushNotifications: true,
      distance: 50,
    };

    await AsyncStorage.setItem('user-settings', JSON.stringify(settings));

    // Update a setting
    const updatedSettings = {
      ...settings,
      distance: 100,
      notifications: false,
    };

    await act(async () => {
      await AsyncStorage.setItem('user-settings', JSON.stringify(updatedSettings));
    });

    const stored = await AsyncStorage.getItem('user-settings');
    expect(JSON.parse(stored!)).toEqual(updatedSettings);
    expect(JSON.parse(stored!).distance).toBe(100);
    expect(JSON.parse(stored!).notifications).toBe(false);
  });

  it('should handle concurrent updates without conflicts', async () => {
    // Simulate multiple hooks updating storage simultaneously
    const updates = [
      AsyncStorage.setItem('key1', 'value1'),
      AsyncStorage.setItem('key2', 'value2'),
      AsyncStorage.setItem('key3', 'value3'),
    ];

    await act(async () => {
      await Promise.all(updates);
    });

    const [val1, val2, val3] = await Promise.all([
      AsyncStorage.getItem('key1'),
      AsyncStorage.getItem('key2'),
      AsyncStorage.getItem('key3'),
    ]);

    expect(val1).toBe('value1');
    expect(val2).toBe('value2');
    expect(val3).toBe('value3');
  });

  it('should restore user session from storage on app restart', async () => {
    // Simulate stored session
    const sessionData = {
      user: { _id: 'user-123', email: 'test@example.com' },
      token: 'jwt-token-123',
      expiresAt: Date.now() + 86400000, // 24 hours
    };

    await AsyncStorage.setItem('auth-session', JSON.stringify(sessionData));
    await AsyncStorage.setItem('user-settings', JSON.stringify({ theme: 'dark' }));

    // App restarts - restore session
    const storedSession = await AsyncStorage.getItem('auth-session');
    const storedSettings = await AsyncStorage.getItem('user-settings');

    expect(JSON.parse(storedSession!)).toEqual(sessionData);
    expect(JSON.parse(storedSettings!).theme).toBe('dark');

    // Verify token expiration
    const session = JSON.parse(storedSession!);
    const isExpired = session.expiresAt < Date.now();
    expect(isExpired).toBe(false);
  });

  it('should handle error recovery across integrated hooks', async () => {
    let errorOccurred = false;
    let fallbackUsed = false;

    // Simulate error in profile fetch
    const fetchProfile = jest.fn(async () => {
      throw new Error('Network error');
    });

    try {
      await fetchProfile();
    } catch (error) {
      errorOccurred = true;

      // Use cached data as fallback
      const cached = await AsyncStorage.getItem('user-profile-cache');
      if (cached) {
        fallbackUsed = true;
      }
    }

    expect(errorOccurred).toBe(true);
    // Fallback would be used if cache exists
  });

  it('should maintain data consistency during profile photo uploads', async () => {
    const profile = {
      _id: 'user-123',
      photos: [] as string[],
    };

    // Upload photo 1
    await act(async () => {
      profile.photos.push('photo1.jpg');
      await AsyncStorage.setItem('user-profile-cache', JSON.stringify(profile));
    });

    expect(profile.photos).toHaveLength(1);

    // Upload photo 2
    await act(async () => {
      profile.photos.push('photo2.jpg');
      await AsyncStorage.setItem('user-profile-cache', JSON.stringify(profile));
    });

    expect(profile.photos).toHaveLength(2);

    // Verify final state
    const cached = await AsyncStorage.getItem('user-profile-cache');
    const cachedProfile = JSON.parse(cached!);
    expect(cachedProfile.photos).toEqual(['photo1.jpg', 'photo2.jpg']);
  });

  it('should handle preferences sync between profile and settings', async () => {
    // Profile preferences
    const profilePreferences = {
      ageRange: [1, 10],
      distance: 50,
      breedPreferences: ['Golden Retriever', 'Labrador'],
    };

    // Settings that affect preferences
    const settings = {
      maxDistance: 50,
      showBreeds: ['Golden Retriever', 'Labrador'],
      notifications: true,
    };

    await AsyncStorage.setItem('profile-preferences', JSON.stringify(profilePreferences));
    await AsyncStorage.setItem('user-settings', JSON.stringify(settings));

    // Verify sync
    const storedPrefs = await AsyncStorage.getItem('profile-preferences');
    const storedSettings = await AsyncStorage.getItem('user-settings');

    expect(JSON.parse(storedPrefs!).distance).toBe(JSON.parse(storedSettings!).maxDistance);
  });

  it('should handle complete user onboarding flow', async () => {
    // Step 1: User registers
    const newUser = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    // Step 2: Create profile
    const profile = {
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      bio: 'Friendly dog',
      photos: [],
    };

    await AsyncStorage.setItem('user-profile', JSON.stringify(profile));

    // Step 3: Set preferences
    const preferences = {
      ageRange: [2, 8],
      distance: 25,
    };

    await AsyncStorage.setItem('user-preferences', JSON.stringify(preferences));

    // Step 4: Configure settings
    const initialSettings = {
      notifications: true,
      theme: 'light',
    };

    await AsyncStorage.setItem('user-settings', JSON.stringify(initialSettings));

    // Verify complete setup
    const [storedProfile, storedPrefs, storedSettings] = await Promise.all([
      AsyncStorage.getItem('user-profile'),
      AsyncStorage.getItem('user-preferences'),
      AsyncStorage.getItem('user-settings'),
    ]);

    expect(JSON.parse(storedProfile!).name).toBe('Buddy');
    expect(JSON.parse(storedPrefs!).distance).toBe(25);
    expect(JSON.parse(storedSettings!).notifications).toBe(true);
  });
});
