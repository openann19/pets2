/**
 * Comprehensive tests for useSettingsScreen hook
 *
 * Coverage:
 * - Settings data fetching and state management
 * - Privacy settings and account management
 * - Notification preferences
 * - App preferences and customization
 * - Data export and account deletion
 * - Cache management and persistence
 * - Real-time updates and synchronization
 * - Error handling and validation
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsScreen } from '../useSettingsScreen';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
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

describe('useSettingsScreen', () => {
  const mockSettingsData = {
    user: {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      createdAt: '2024-01-01T00:00:00Z',
    },
    privacy: {
      profileVisible: true,
      showDistance: true,
      showAge: true,
      allowMessagesFromStrangers: false,
      dataSharing: {
        analytics: true,
        marketing: false,
        thirdParty: false,
      },
    },
    notifications: {
      push: {
        matches: true,
        messages: true,
        likes: false,
        superLikes: true,
        reminders: false,
      },
      email: {
        weeklyDigest: true,
        matchAlerts: true,
        securityAlerts: true,
        marketing: false,
      },
      sms: {
        securityAlerts: true,
        importantUpdates: false,
      },
    },
    preferences: {
      theme: 'system' as const,
      language: 'en' as const,
      units: 'metric' as const,
      maxDistance: 25,
      ageRange: { min: 21, max: 50 },
      petPreferences: {
        species: ['dogs', 'cats'],
        sizes: ['small', 'medium'],
        energyLevels: ['moderate', 'high'],
      },
    },
    account: {
      isPremium: false,
      subscriptionStatus: 'free',
      verificationStatus: 'verified',
      lastLogin: '2024-01-15T10:30:00Z',
      loginDevices: [
        { id: 'device1', name: 'iPhone 12', lastActive: '2024-01-15T10:30:00Z', current: true },
        { id: 'device2', name: 'iPad Pro', lastActive: '2024-01-10T15:20:00Z', current: false },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    mockApi.get.mockResolvedValue({ data: mockSettingsData });
    mockApi.post.mockResolvedValue({ data: { success: true } });
    mockApi.put.mockResolvedValue({ data: { success: true } });
    mockApi.delete.mockResolvedValue({ data: { success: true } });

    mockUseColorScheme.mockReturnValue('light');
  });

  describe('Initial State and Data Loading', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useSettingsScreen());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.settings).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isSaving).toBe(false);
    });

    it('should load settings data on mount', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual(mockSettingsData);
      expect(mockApi.get).toHaveBeenCalledWith('/settings');
      expect(mockAnalyticsService.trackScreenView).toHaveBeenCalledWith('SettingsScreen');
    });

    it('should load cached data when available', async () => {
      const cachedData = {
        settings: mockSettingsData,
        lastUpdated: Date.now() - (5 * 60 * 1000), // 5 minutes ago (fresh)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.settings).toEqual(mockSettingsData);
      });

      // Should not make API calls for fresh cache
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should handle loading errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Settings not available'));

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Settings not available');
      expect(result.current.settings).toBeNull();
    });
  });

  describe('Privacy Settings', () => {
    it('should update privacy settings successfully', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPrivacySettings = {
        profileVisible: false,
        showDistance: false,
        allowMessagesFromStrangers: true,
        dataSharing: {
          analytics: false,
          marketing: true,
          thirdParty: false,
        },
      };

      mockApi.put.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updatePrivacySettings(newPrivacySettings);
        expect(success).toBe(true);
      });

      expect(result.current.settings?.privacy).toEqual(newPrivacySettings);
      expect(mockApi.put).toHaveBeenCalledWith('/settings/privacy', newPrivacySettings);
    });

    it('should toggle individual privacy settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.put.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        await result.current.togglePrivacySetting('profileVisible');
      });

      expect(result.current.settings?.privacy.profileVisible).toBe(false);

      await act(async () => {
        await result.current.togglePrivacySetting('showAge');
      });

      expect(result.current.settings?.privacy.showAge).toBe(false);
    });
  });

  describe('Notification Settings', () => {
    it('should update push notification settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPushSettings = {
        matches: false,
        messages: false,
        likes: true,
        superLikes: true,
        reminders: true,
      };

      mockApi.put.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updatePushNotifications(newPushSettings);
        expect(success).toBe(true);
      });

      expect(result.current.settings?.notifications.push).toEqual(newPushSettings);
    });

    it('should update email notification settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newEmailSettings = {
        weeklyDigest: false,
        matchAlerts: false,
        securityAlerts: true,
        marketing: true,
      };

      mockApi.put.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updateEmailNotifications(newEmailSettings);
        expect(success).toBe(true);
      });

      expect(result.current.settings?.notifications.email).toEqual(newEmailSettings);
    });

    it('should toggle individual notification settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.put.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        await result.current.toggleNotification('push', 'likes');
      });

      expect(result.current.settings?.notifications.push.likes).toBe(true);
    });
  });

  describe('App Preferences', () => {
    it('should update app preferences', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPreferences = {
        theme: 'dark' as const,
        language: 'es' as const,
        units: 'imperial' as const,
        maxDistance: 50,
        ageRange: { min: 25, max: 60 },
        petPreferences: {
          species: ['dogs'],
          sizes: ['large'],
          energyLevels: ['low', 'moderate'],
        },
      };

      mockApi.put.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updatePreferences(newPreferences);
        expect(success).toBe(true);
      });

      expect(result.current.settings?.preferences).toEqual(newPreferences);
    });

    it('should update individual preference settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.put.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        await result.current.updatePreference('theme', 'dark');
      });

      expect(result.current.settings?.preferences.theme).toBe('dark');

      await act(async () => {
        await result.current.updatePreference('maxDistance', 100);
      });

      expect(result.current.settings?.preferences.maxDistance).toBe(100);
    });
  });

  describe('Account Management', () => {
    it('should handle account deletion request', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Account deletion requested',
          deletionId: 'del-123',
        }
      });

      await act(async () => {
        const success = await result.current.requestAccountDeletion('User request');
        expect(success).toBe(true);
      });

      expect(mockApi.post).toHaveBeenCalledWith('/settings/account/delete', {
        reason: 'User request',
      });
    });

    it('should export user data', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockExportedData = {
        profile: { name: 'John Doe', email: 'john@example.com' },
        preferences: mockSettingsData.preferences,
        activity: { logins: 25, matches: 12 },
      };

      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          exportId: 'export-123',
          data: mockExportedData,
        }
      });

      await act(async () => {
        const data = await result.current.exportUserData();
        expect(data).toEqual(mockExportedData);
      });

      expect(mockApi.post).toHaveBeenCalledWith('/settings/account/export');
    });

    it('should logout from current device', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.post.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        const success = await result.current.logoutFromDevice();
        expect(success).toBe(true);
      });

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should logout from all devices', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.post.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        const success = await result.current.logoutFromAllDevices();
        expect(success).toBe(true);
      });

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout-all');
    });
  });

  describe('Device Management', () => {
    it('should get login devices', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getLoginDevices()).toEqual(mockSettingsData.account.loginDevices);
      expect(result.current.getCurrentDevice()).toEqual(mockSettingsData.account.loginDevices[0]);
    });

    it('should revoke device access', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockApi.delete.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        const success = await result.current.revokeDeviceAccess('device2');
        expect(success).toBe(true);
      });

      expect(mockApi.delete).toHaveBeenCalledWith('/settings/devices/device2');
      expect(result.current.getLoginDevices()).toHaveLength(1);
    });
  });

  describe('Settings Validation', () => {
    it('should validate privacy settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test invalid data sharing settings
      const invalidSettings = {
        profileVisible: true,
        dataSharing: null, // Invalid
      };

      await act(async () => {
        const success = await result.current.updatePrivacySettings(invalidSettings as any);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Invalid privacy settings');
    });

    it('should validate preference settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test invalid age range
      const invalidPreferences = {
        ageRange: { min: 50, max: 25 }, // Invalid range
      };

      await act(async () => {
        const success = await result.current.updatePreferences(invalidPreferences as any);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Invalid age range');
    });

    it('should validate notification settings', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test invalid notification type
      const invalidNotifications = {
        push: {
          invalidType: true,
        },
      };

      await act(async () => {
        const success = await result.current.updatePushNotifications(invalidNotifications.push as any);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Invalid notification settings');
    });
  });

  describe('Cache Management', () => {
    it('should cache settings data', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'settings_screen_cache',
        expect.any(String)
      );
    });

    it('should clear cache when requested', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      // Set some data
      act(() => {
        result.current.settings = mockSettingsData;
      });

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.settings).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('settings_screen_cache');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during updates', async () => {
      mockApi.put.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.updatePrivacySettings({ profileVisible: false });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle server validation errors', async () => {
      mockApi.put.mockRejectedValue({
        message: 'Invalid preference value',
        code: 'VALIDATION_ERROR',
      });

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.updatePreferences({ theme: 'invalid' as any });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Invalid preference value');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still work despite storage errors
      expect(result.current.settings).toEqual(mockSettingsData);
    });

    it('should reset error state on successful operations', async () => {
      // First operation fails
      mockApi.put.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePrivacySettings({ profileVisible: false });
      });

      expect(result.current.error).toBe('First error');

      // Second operation succeeds
      mockApi.put.mockResolvedValueOnce({ data: { success: true } });

      await act(async () => {
        const success = await result.current.updatePrivacySettings({ profileVisible: true });
        expect(success).toBe(true);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Real-time Updates', () => {
    it('should handle settings updates from server', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedSettings = {
        ...mockSettingsData,
        privacy: {
          ...mockSettingsData.privacy,
          profileVisible: false,
        },
      };

      act(() => {
        result.current.handleSettingsUpdate(updatedSettings);
      });

      expect(result.current.settings?.privacy.profileVisible).toBe(false);
    });

    it('should handle preference changes from system', async () => {
      let currentTheme = 'light';
      mockUseColorScheme.mockImplementation(() => currentTheme);

      const { result, rerender } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change system theme
      currentTheme = 'dark';
      rerender();

      // Hook should adapt to system theme change
      expect(result.current.getCurrentTheme()).toBe('dark');
    });
  });

  describe('Analytics and Tracking', () => {
    it('should track settings interactions', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackSettingsInteraction('privacy_toggle', { setting: 'profileVisible' });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'settings_interaction',
        {
          element: 'privacy_toggle',
          action: 'toggle',
          setting: 'profileVisible',
        },
        'user123'
      );
    });

    it('should track settings changes', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePrivacySettings({ profileVisible: false });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'settings_changed',
        {
          category: 'privacy',
          changes: { profileVisible: false },
        },
        'user123'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty settings data', async () => {
      const emptySettings = {
        user: { id: 'user123', name: '', email: '' },
        privacy: {},
        notifications: { push: {}, email: {}, sms: {} },
        preferences: {},
        account: { isPremium: false },
      };

      mockApi.get.mockResolvedValue({ data: emptySettings });

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual(emptySettings);
      expect(result.current.getCurrentTheme()).toBe('light'); // Default to system
    });

    it('should handle settings with missing optional fields', async () => {
      const minimalSettings = {
        user: { id: 'user123' },
        privacy: { profileVisible: true },
        notifications: {},
        preferences: {},
        account: {},
      };

      mockApi.get.mockResolvedValue({ data: minimalSettings });

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings?.user.id).toBe('user123');
      expect(result.current.settings?.privacy.profileVisible).toBe(true);
    });

    it('should handle very large preference data', async () => {
      const largePreferences = {
        ...mockSettingsData.preferences,
        petPreferences: {
          species: Array.from({ length: 50 }, (_, i) => `species${i}`),
          sizes: Array.from({ length: 20 }, (_, i) => `size${i}`),
          energyLevels: Array.from({ length: 10 }, (_, i) => `energy${i}`),
        },
      };

      const settingsWithLargePrefs = {
        ...mockSettingsData,
        preferences: largePreferences,
      };

      mockApi.get.mockResolvedValue({ data: settingsWithLargePrefs });

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings?.preferences.petPreferences.species).toHaveLength(50);
    });

    it('should handle malformed cached data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"invalid": json}');

      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should load fresh data despite corrupted cache
      expect(result.current.settings).toEqual(mockSettingsData);
    });

    it('should handle concurrent settings updates', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Multiple concurrent updates
      const updates = [
        result.current.updatePrivacySettings({ profileVisible: false }),
        result.current.updatePreferences({ theme: 'dark' }),
        result.current.updatePushNotifications({ matches: false }),
      ];

      const results = await Promise.all(updates);

      // Should handle all operations
      expect(results.some(r => r === true)).toBe(true);
    });

    it('should handle rapid preference toggles', async () => {
      const { result } = renderHook(() => useSettingsScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Rapid toggles
      await act(async () => {
        await result.current.togglePrivacySetting('profileVisible');
        await result.current.togglePrivacySetting('profileVisible');
        await result.current.togglePrivacySetting('profileVisible');
      });

      // Should end up in correct state
      expect(result.current.settings?.privacy.profileVisible).toBe(false);
    });
  });
});
