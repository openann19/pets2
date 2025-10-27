/**
 * Comprehensive tests for SettingsService
 *
 * Coverage:
 * - Getting user settings
 * - Saving user settings
 * - Settings data structure validation
 * - Notification preferences management
 * - User preferences management
 * - Error handling and validation
 * - Edge cases and concurrent operations
 * - Settings persistence and updates
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { getSettings, saveSettings, type Settings } from '../settingsService';

// Mock dependencies
jest.mock('../api', () => ({
  request: jest.fn(),
}));

import { request } from '../api';

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should fetch user settings successfully', async () => {
      const mockSettings: Settings = {
        notifications: {
          matches: true,
          messages: true,
          likes: false,
          activity: true,
          push: true,
          email: false,
        },
        preferences: {
          maxDistance: 50,
          ageRange: { min: 2, max: 10 },
          species: ['dog', 'cat'],
          intents: ['playdate', 'friendship'],
        },
        settings: {
          theme: 'dark',
          language: 'en',
          privacy: 'friends',
        },
      };

      mockRequest.mockResolvedValue(mockSettings);

      const result = await getSettings();

      expect(mockRequest).toHaveBeenCalledWith('/settings/me', {
        method: 'GET',
      });
      expect(result).toEqual(mockSettings);
    });

    it('should handle empty settings response', async () => {
      const emptySettings: Settings = {};

      mockRequest.mockResolvedValue(emptySettings);

      const result = await getSettings();

      expect(result).toEqual({});
    });

    it('should handle partial settings data', async () => {
      const partialSettings: Settings = {
        notifications: {
          matches: true,
          messages: false,
        },
        // Missing preferences and settings
      };

      mockRequest.mockResolvedValue(partialSettings);

      const result = await getSettings();

      expect(result.notifications?.matches).toBe(true);
      expect(result.notifications?.messages).toBe(false);
      expect(result.preferences).toBeUndefined();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockRequest.mockRejectedValue(error);

      await expect(getSettings()).rejects.toThrow('API Error');
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Network timeout');
      mockRequest.mockRejectedValue(timeoutError);

      await expect(getSettings()).rejects.toThrow('Network timeout');
    });

    it('should handle malformed API responses', async () => {
      mockRequest.mockResolvedValue(null);

      const result = await getSettings();

      expect(result).toBeNull();
    });

    it('should handle very large settings objects', async () => {
      const largeSettings: Settings = {
        notifications: {
          matches: true,
          messages: true,
          likes: true,
          activity: true,
          push: true,
          email: true,
        },
        preferences: {
          maxDistance: 1000,
          ageRange: { min: 0, max: 30 },
          species: Array.from({ length: 50 }, (_, i) => `species${i}`),
          intents: Array.from({ length: 20 }, (_, i) => `intent${i}`),
        },
        settings: {
          largeObject: Array.from({ length: 100 }, (_, i) => ({
            key: `item${i}`,
            value: `value${i}`,
            nested: {
              data: `nested${i}`,
              array: Array.from({ length: 10 }, () => Math.random()),
            },
          })),
        },
      };

      mockRequest.mockResolvedValue(largeSettings);

      const result = await getSettings();

      expect(result.preferences?.species).toHaveLength(50);
      expect(result.settings?.largeObject).toHaveLength(100);
    });
  });

  describe('saveSettings', () => {
    it('should save user settings successfully', async () => {
      const settingsToSave: Settings = {
        notifications: {
          matches: false,
          messages: true,
          likes: true,
          activity: false,
          push: true,
          email: true,
        },
        preferences: {
          maxDistance: 25,
          ageRange: { min: 1, max: 8 },
          species: ['dog'],
          intents: ['playdate'],
        },
        settings: {
          theme: 'light',
          language: 'es',
        },
      };

      const savedSettings: Settings = {
        ...settingsToSave,
        // API might add server-generated fields
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockRequest.mockResolvedValue(savedSettings);

      const result = await saveSettings(settingsToSave);

      expect(mockRequest).toHaveBeenCalledWith('/settings/me', {
        method: 'PATCH',
        body: settingsToSave,
      });
      expect(result).toEqual(savedSettings);
    });

    it('should save minimal settings', async () => {
      const minimalSettings: Settings = {
        notifications: {
          push: false,
        },
      };

      mockRequest.mockResolvedValue(minimalSettings);

      const result = await saveSettings(minimalSettings);

      expect(result.notifications?.push).toBe(false);
    });

    it('should save empty settings object', async () => {
      const emptySettings: Settings = {};

      mockRequest.mockResolvedValue(emptySettings);

      const result = await saveSettings(emptySettings);

      expect(result).toEqual({});
    });

    it('should handle API errors during save', async () => {
      const error = new Error('Save failed');
      mockRequest.mockRejectedValue(error);

      const settings: Settings = { notifications: { push: true } };

      await expect(saveSettings(settings)).rejects.toThrow('Save failed');
    });

    it('should handle validation errors from API', async () => {
      const validationError = new Error('Invalid settings format');
      mockRequest.mockRejectedValue(validationError);

      const invalidSettings: Settings = {
        notifications: {
          matches: 'invalid' as any, // Invalid boolean
        },
      };

      await expect(saveSettings(invalidSettings)).rejects.toThrow('Invalid settings format');
    });

    it('should handle concurrent save operations', async () => {
      const settings1: Settings = { notifications: { matches: true } };
      const settings2: Settings = { notifications: { messages: true } };
      const settings3: Settings = { preferences: { maxDistance: 30 } };

      mockRequest.mockResolvedValue((settings: Settings) => settings);

      const promises = [
        saveSettings(settings1),
        saveSettings(settings2),
        saveSettings(settings3),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should preserve complex nested structures', async () => {
      const complexSettings: Settings = {
        notifications: {
          matches: true,
          messages: true,
          likes: false,
          activity: true,
          push: true,
          email: false,
        },
        preferences: {
          maxDistance: 75,
          ageRange: { min: 3, max: 12 },
          species: ['dog', 'cat', 'bird', 'fish'],
          intents: ['friendship', 'playdate', 'breeding'],
        },
        settings: {
          profile: {
            visibility: 'public',
            showOnlineStatus: true,
            allowMessages: true,
          },
          notifications: {
            frequency: 'daily',
            quietHours: {
              start: '22:00',
              end: '08:00',
            },
          },
          privacy: {
            dataSharing: false,
            analytics: true,
            locationTracking: false,
          },
        },
      };

      mockRequest.mockResolvedValue(complexSettings);

      const result = await saveSettings(complexSettings);

      expect(result.preferences?.species).toContain('dog');
      expect(result.preferences?.species).toContain('cat');
      expect(result.settings?.profile?.visibility).toBe('public');
      expect(result.settings?.notifications?.quietHours?.start).toBe('22:00');
      expect(result.settings?.privacy?.dataSharing).toBe(false);
    });
  });

  describe('Settings Data Structure', () => {
    it('should handle notification settings correctly', () => {
      const notificationSettings: Settings = {
        notifications: {
          matches: true,
          messages: false,
          likes: true,
          activity: false,
          push: true,
          email: false,
        },
      };

      expect(notificationSettings.notifications?.matches).toBe(true);
      expect(notificationSettings.notifications?.messages).toBe(false);
      expect(notificationSettings.notifications?.push).toBe(true);
    });

    it('should handle preference settings correctly', () => {
      const preferenceSettings: Settings = {
        preferences: {
          maxDistance: 100,
          ageRange: { min: 1, max: 15 },
          species: ['dog', 'cat', 'rabbit'],
          intents: ['friendship', 'playdate'],
        },
      };

      expect(preferenceSettings.preferences?.maxDistance).toBe(100);
      expect(preferenceSettings.preferences?.ageRange.min).toBe(1);
      expect(preferenceSettings.preferences?.ageRange.max).toBe(15);
      expect(preferenceSettings.preferences?.species).toHaveLength(3);
      expect(preferenceSettings.preferences?.intents).toContain('friendship');
    });

    it('should handle generic settings object', () => {
      const genericSettings: Settings = {
        settings: {
          theme: 'dark',
          language: 'fr',
          timezone: 'Europe/Paris',
          units: 'metric',
          customData: {
            featureFlags: ['newUI', 'betaFeatures'],
            experimentGroups: ['groupA', 'groupB'],
          },
        },
      };

      expect(genericSettings.settings?.theme).toBe('dark');
      expect(genericSettings.settings?.language).toBe('fr');
      expect(genericSettings.settings?.customData?.featureFlags).toContain('newUI');
    });

    it('should handle undefined optional fields', () => {
      const minimalSettings: Settings = {};

      expect(minimalSettings.notifications).toBeUndefined();
      expect(minimalSettings.preferences).toBeUndefined();
      expect(minimalSettings.settings).toBeUndefined();
    });
  });

  describe('Settings Validation and Constraints', () => {
    it('should handle extreme values', async () => {
      const extremeSettings: Settings = {
        preferences: {
          maxDistance: 10000, // Very large distance
          ageRange: { min: 0, max: 100 }, // Wide age range
          species: Array.from({ length: 100 }, (_, i) => `species${i}`), // Many species
          intents: Array.from({ length: 50 }, (_, i) => `intent${i}`), // Many intents
        },
      };

      mockRequest.mockResolvedValue(extremeSettings);

      const result = await saveSettings(extremeSettings);

      expect(result.preferences?.maxDistance).toBe(10000);
      expect(result.preferences?.species).toHaveLength(100);
      expect(result.preferences?.intents).toHaveLength(50);
    });

    it('should handle zero values', async () => {
      const zeroSettings: Settings = {
        preferences: {
          maxDistance: 0,
          ageRange: { min: 0, max: 0 },
          species: [],
          intents: [],
        },
      };

      mockRequest.mockResolvedValue(zeroSettings);

      const result = await saveSettings(zeroSettings);

      expect(result.preferences?.maxDistance).toBe(0);
      expect(result.preferences?.ageRange.min).toBe(0);
      expect(result.preferences?.species).toHaveLength(0);
    });

    it('should handle negative values', async () => {
      const negativeSettings: Settings = {
        preferences: {
          maxDistance: -1, // Invalid but should be handled
          ageRange: { min: -5, max: -1 }, // Invalid age range
        },
      };

      mockRequest.mockResolvedValue(negativeSettings);

      const result = await saveSettings(negativeSettings);

      // Service doesn't validate, just passes through
      expect(result.preferences?.maxDistance).toBe(-1);
    });

    it('should handle special characters and unicode', async () => {
      const unicodeSettings: Settings = {
        settings: {
          language: '中文',
          timezone: 'America/New_York',
          displayName: 'José María ñoño 🚀',
          bio: 'I love pets! 🐶🐱🐭',
        },
      };

      mockRequest.mockResolvedValue(unicodeSettings);

      const result = await saveSettings(unicodeSettings);

      expect(result.settings?.language).toBe('中文');
      expect(result.settings?.displayName).toBe('José María ñoño 🚀');
      expect(result.settings?.bio).toContain('🐶🐱🐭');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle get-modify-save workflow', async () => {
      // Initial settings
      const initialSettings: Settings = {
        notifications: {
          matches: true,
          messages: true,
          push: true,
        },
        preferences: {
          maxDistance: 50,
        },
      };

      mockRequest.mockResolvedValueOnce(initialSettings);

      // Get current settings
      const currentSettings = await getSettings();
      expect(currentSettings.notifications?.matches).toBe(true);

      // Modify settings
      const modifiedSettings: Settings = {
        ...currentSettings,
        notifications: {
          ...currentSettings.notifications,
          likes: true, // Add new preference
          messages: false, // Change existing
        },
        preferences: {
          ...currentSettings.preferences,
          maxDistance: 75, // Update distance
        },
      };

      mockRequest.mockResolvedValueOnce(modifiedSettings);

      // Save modified settings
      const savedSettings = await saveSettings(modifiedSettings);

      expect(savedSettings.notifications?.likes).toBe(true);
      expect(savedSettings.notifications?.messages).toBe(false);
      expect(savedSettings.preferences?.maxDistance).toBe(75);
    });

    it('should handle settings migration scenarios', async () => {
      // Old format settings
      const oldFormatSettings: Settings = {
        notifications: {
          matches: true,
          messages: true,
        },
        // Missing new fields
      };

      mockRequest.mockResolvedValueOnce(oldFormatSettings);

      const current = await getSettings();
      expect(current.notifications?.matches).toBe(true);

      // Migrate to new format
      const migratedSettings: Settings = {
        ...current,
        notifications: {
          ...current.notifications,
          likes: false,
          activity: true,
          push: true,
          email: false,
        },
        preferences: {
          maxDistance: 25,
          ageRange: { min: 1, max: 10 },
          species: ['dog'],
          intents: ['friendship'],
        },
        settings: {
          theme: 'system',
          language: 'en',
        },
      };

      mockRequest.mockResolvedValueOnce(migratedSettings);

      const saved = await saveSettings(migratedSettings);

      expect(saved.notifications?.likes).toBe(false);
      expect(saved.preferences?.maxDistance).toBe(25);
      expect(saved.settings?.theme).toBe('system');
    });

    it('should handle bulk settings updates', async () => {
      const bulkUpdates = [
        { notifications: { matches: true } },
        { notifications: { messages: false } },
        { preferences: { maxDistance: 30 } },
        { settings: { theme: 'dark' } },
      ];

      // Mock responses for each save operation
      bulkUpdates.forEach((update, index) => {
        mockRequest.mockResolvedValueOnce(update);
      });

      const results = await Promise.all(
        bulkUpdates.map(update => saveSettings(update))
      );

      expect(results).toHaveLength(4);
      expect(results[0].notifications?.matches).toBe(true);
      expect(results[1].notifications?.messages).toBe(false);
      expect(results[2].preferences?.maxDistance).toBe(30);
      expect(results[3].settings?.theme).toBe('dark');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle temporary network failures', async () => {
      let callCount = 0;
      mockRequest.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network temporarily unavailable');
        }
        return Promise.resolve({ notifications: { push: true } });
      });

      // First call fails
      await expect(getSettings()).rejects.toThrow('Network temporarily unavailable');

      // Second call succeeds
      const result = await getSettings();
      expect(result.notifications?.push).toBe(true);
    });

    it('should handle partial failures in concurrent operations', async () => {
      let callCount = 0;
      mockRequest.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Second operation failed');
        }
        return Promise.resolve({ success: true });
      });

      const operations = [
        saveSettings({ notifications: { matches: true } }),
        saveSettings({ notifications: { messages: true } }),
        saveSettings({ preferences: { maxDistance: 50 } }),
      ];

      const results = await Promise.allSettled(operations);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect((results[1] as any).reason.message).toBe('Second operation failed');
      expect(results[2].status).toBe('fulfilled');
    });

    it('should handle malformed server responses', async () => {
      mockRequest.mockResolvedValue('invalid json string');

      const result = await getSettings();

      expect(result).toBe('invalid json string');
    });

    it('should handle extremely large responses', async () => {
      const hugeSettings: Settings = {
        settings: {
          massiveData: 'x'.repeat(1000000), // 1MB string
          hugeArray: Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            data: 'x'.repeat(1000), // 1KB per item
          })),
        },
      };

      mockRequest.mockResolvedValue(hugeSettings);

      const result = await getSettings();

      expect(result.settings?.massiveData).toHaveLength(1000000);
      expect(result.settings?.hugeArray).toHaveLength(10000);
    });
  });

  describe('Type Safety and Interface Compliance', () => {
    it('should maintain type safety for notifications', () => {
      const settings: Settings = {
        notifications: {
          matches: true,
          messages: false,
          likes: true,
          activity: false,
          push: true,
          email: false,
        },
      };

      // TypeScript should enforce boolean types
      expect(typeof settings.notifications?.matches).toBe('boolean');
      expect(typeof settings.notifications?.messages).toBe('boolean');
    });

    it('should maintain type safety for preferences', () => {
      const settings: Settings = {
        preferences: {
          maxDistance: 50,
          ageRange: { min: 2, max: 10 },
          species: ['dog', 'cat'],
          intents: ['playdate', 'friendship'],
        },
      };

      expect(typeof settings.preferences?.maxDistance).toBe('number');
      expect(typeof settings.preferences?.ageRange.min).toBe('number');
      expect(Array.isArray(settings.preferences?.species)).toBe(true);
      expect(Array.isArray(settings.preferences?.intents)).toBe(true);
    });

    it('should allow flexible settings object', () => {
      const flexibleSettings: Settings = {
        settings: {
          anyKey: 'anyValue',
          nestedObject: {
            deeply: {
              nested: {
                value: 123,
                array: [1, 2, 3],
                boolean: true,
              },
            },
          },
          mixedArray: [
            'string',
            42,
            true,
            { object: 'in array' },
            [1, 2, 3],
          ],
        },
      };

      expect(flexibleSettings.settings?.anyKey).toBe('anyValue');
      expect(flexibleSettings.settings?.nestedObject.deeply.nested.value).toBe(123);
      expect(flexibleSettings.settings?.mixedArray).toHaveLength(5);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle frequent settings operations', async () => {
      const operations = Array.from({ length: 100 }, (_, i) => ({
        notifications: { [`setting${i}`]: i % 2 === 0 },
      }));

      operations.forEach(op => {
        mockRequest.mockResolvedValueOnce(op);
      });

      const promises = operations.map(op => saveSettings(op));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(100);
      expect(mockRequest).toHaveBeenCalledTimes(100);
    });

    it('should handle settings with circular references', async () => {
      const circularSettings: any = { settings: {} };
      circularSettings.settings.self = circularSettings.settings;

      // Should not crash even with circular references
      mockRequest.mockResolvedValue(circularSettings);

      const result = await saveSettings(circularSettings);

      expect(result.settings?.self).toBe(result.settings);
    });
  });
});
