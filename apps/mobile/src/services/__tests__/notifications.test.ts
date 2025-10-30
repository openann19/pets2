/**
 * Comprehensive tests for NotificationService
 *
 * Coverage:
 * - Push token initialization and registration
 * - Permission handling and device support
 * - Local notification scheduling and management
 * - Badge count operations
 * - Notification channels (Android)
 * - Specialized notification types (match, message, like)
 * - Event listeners and notification handling
 * - Backend registration and cleanup
 * - Error handling and edge cases
 * - Platform-specific behavior
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService, NotificationService } from '../notifications';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getBadgeCountAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  AndroidImportance: {
    MAX: 'max',
    HIGH: 'high',
    DEFAULT: 'default',
    LOW: 'low',
  },
}));

// Mock API service
jest.mock('../api', () => ({
  api: {
    request: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockDevice = Device as jest.Mocked<typeof Device>;
const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const apiModule = require('../api');
const mockApi = apiModule.api as jest.Mocked<typeof apiModule.api>;

describe('NotificationService', () => {
  let service: NotificationService;
  let mockNotificationListener: jest.Mock;
  let mockResponseListener: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset service instance
    service = new NotificationService();

    // Setup default mocks
    mockDevice.isDevice = true;
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'test-token-123' });
    mockNotifications.setNotificationChannelAsync.mockResolvedValue(undefined);
    mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');
    mockNotifications.getBadgeCountAsync.mockResolvedValue(5);
    mockNotifications.setBadgeCountAsync.mockResolvedValue(undefined);

    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    mockApi.request.mockResolvedValue({ success: true });

    // Mock listeners
    mockNotificationListener = jest.fn();
    mockResponseListener = jest.fn();

    mockNotifications.addNotificationReceivedListener.mockReturnValue({
      remove: jest.fn(),
    });
    mockNotifications.addNotificationResponseReceivedListener.mockReturnValue({
      remove: jest.fn(),
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully on physical device', async () => {
      const token = await service.initialize();

      expect(token).toBe('test-token-123');
      expect(service.getExpoPushToken()).toBe('test-token-123');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('expo_push_token', 'test-token-123');
      expect(mockNotifications.setNotificationHandler).toHaveBeenCalled();
    });

    it('should return null on simulator/emulator', async () => {
      mockDevice.isDevice = false;

      const token = await service.initialize();

      expect(token).toBeNull();
    });

    it('should request permissions if not granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });

      await service.initialize();

      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return null if permissions denied', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const token = await service.initialize();

      expect(token).toBeNull();
    });

    it('should handle token retrieval errors', async () => {
      mockNotifications.getExpoPushTokenAsync.mockRejectedValue(new Error('Token error'));

      const token = await service.initialize();

      expect(token).toBeNull();
    });

    it('should setup Android notification channels', async () => {
      Platform.OS = 'android';

      await service.initialize();

      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', {
        name: 'default',
        importance: 'max',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    });

    it('should setup notification listeners', async () => {
      await service.initialize();

      expect(mockNotifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });

    it('should register token with backend', async () => {
      await service.initialize();

      expect(mockApi.request).toHaveBeenCalledWith('/notifications/register-token', {
        method: 'POST',
        body: expect.objectContaining({
          token: 'test-token-123',
          platform: Platform.OS,
          deviceId: expect.any(String),
        }),
      });
    });

    it('should handle backend registration errors gracefully', async () => {
      mockApi.request.mockRejectedValue(new Error('Backend error'));

      const token = await service.initialize();

      // Should still return token despite backend error
      expect(token).toBe('test-token-123');
    });
  });

  describe('Notification Channels (Android)', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('should create specialized notification channels', async () => {
      await service.initialize();

      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith('matches', {
        name: 'New Matches',
        importance: 'high',
        description: 'Notifications for new matches',
        sound: 'match_sound.wav',
        vibrationPattern: [0, 250, 250, 250],
      });

      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith('messages', {
        name: 'Messages',
        importance: 'high',
        description: 'New message notifications',
        sound: 'message_sound.wav',
        vibrationPattern: [0, 250, 250, 250],
      });
    });
  });

  describe('Local Notifications', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should send immediate local notification', async () => {
      const notificationData = {
        type: 'match' as const,
        title: 'New Match!',
        body: 'You have a new match!',
        data: { matchId: '123' },
      };

      const result = await service.sendLocalNotification(notificationData);

      expect(result).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'New Match!',
          body: 'You have a new match!',
          data: { matchId: '123' },
          sound: 'match_sound.wav',
        },
        trigger: null,
      });
    });

    it('should send scheduled local notification', async () => {
      const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
      const notificationData = {
        type: 'reminder' as const,
        title: 'Reminder',
        body: 'Check your matches!',
        scheduledFor: scheduledTime,
      };

      await service.sendLocalNotification(notificationData);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          title: 'Reminder',
          body: 'Check your matches!',
          sound: 'default_sound.wav',
        }),
        trigger: {
          date: scheduledTime,
        },
      });
    });

    it('should handle notification scheduling errors', async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('Schedule failed'));

      const result = await service.sendLocalNotification({
        type: 'match',
        title: 'Test',
        body: 'Test body',
      });

      expect(result).toBeNull();
    });
  });

  describe('Badge Management', () => {
    it('should get current badge count', async () => {
      const count = await service.getBadgeCount();

      expect(count).toBe(5);
      expect(mockNotifications.getBadgeCountAsync).toHaveBeenCalled();
    });

    it('should handle badge count retrieval errors', async () => {
      mockNotifications.getBadgeCountAsync.mockRejectedValue(new Error('Badge error'));

      const count = await service.getBadgeCount();

      expect(count).toBe(0);
    });

    it('should set badge count', async () => {
      const result = await service.setBadgeCount(10);

      expect(result).toBe(true);
      expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(10);
    });

    it('should handle badge count setting errors', async () => {
      mockNotifications.setBadgeCountAsync.mockRejectedValue(new Error('Set badge failed'));

      const result = await service.setBadgeCount(10);

      expect(result).toBe(false);
    });

    it('should clear badge', async () => {
      await service.clearBadge();

      expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    });
  });

  describe('Notification Management', () => {
    it('should cancel specific notification', async () => {
      const result = await service.cancelNotification('notification-id');

      expect(result).toBe(true);
      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notification-id',
      );
    });

    it('should cancel all notifications', async () => {
      const result = await service.cancelAllNotifications();

      expect(result).toBe(true);
      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle cancellation errors', async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValue(
        new Error('Cancel failed'),
      );

      const result = await service.cancelNotification('notification-id');

      expect(result).toBe(false);
    });
  });

  describe('Specialized Notifications', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should send match notification', async () => {
      const result = await service.sendMatchNotification('Buddy', 'buddy.jpg');

      expect(result).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'New Match! 🎉',
          body: 'You matched with Buddy!',
          data: {
            type: 'match',
            petName: 'Buddy',
            petPhoto: 'buddy.jpg',
          },
          sound: 'match_sound.wav',
        },
        trigger: null,
      });
    });

    it('should send message notification', async () => {
      const result = await service.sendMessageNotification('John', 'Hey there!', 'match123');

      expect(result).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Message from John',
          body: 'Hey there!',
          data: {
            type: 'message',
            senderName: 'John',
            message: 'Hey there!',
            matchId: 'match123',
          },
          sound: 'message_sound.wav',
        },
        trigger: null,
      });
    });

    it('should truncate long messages in notification', async () => {
      const longMessage = 'A'.repeat(60);
      await service.sendMessageNotification('John', longMessage, 'match123');

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          body: 'A'.repeat(50) + '...',
        }),
        trigger: null,
      });
    });

    it('should send like notification', async () => {
      const result = await service.sendLikeNotification('Max', true);

      expect(result).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Super Like! ⭐',
          body: 'Max super liked your pet!',
          data: {
            type: 'super_like',
            petName: 'Max',
          },
          sound: 'like_sound.wav',
        },
        trigger: null,
      });
    });

    it('should send regular like notification', async () => {
      await service.sendLikeNotification('Max', false);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          title: 'New Like! ❤️',
          body: 'Max liked your pet!',
        }),
        trigger: null,
      });
    });

    it('should schedule reminder notification', async () => {
      const result = await service.scheduleReminderNotification(24);

      expect(result).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Missing Your Furry Friends!',
          body: "It's been 24 hours since your last visit. Check out new potential matches!",
          data: {
            type: 'reminder',
          },
          sound: 'default_sound.wav',
        },
        trigger: expect.objectContaining({
          date: expect.any(Date),
        }),
      });
    });
  });

  describe('Notification Handling', () => {
    it('should handle notification received events', async () => {
      await service.initialize();

      const mockNotification = {
        request: {
          content: {
            data: { type: 'match' },
          },
        },
      };

      // Simulate notification received
      const listenerCallback = mockNotifications.addNotificationReceivedListener.mock.calls[0][0];
      listenerCallback(mockNotification);

      // Should handle different notification types without errors
      expect(() => {
        const matchNotification = {
          request: {
            content: {
              data: { type: 'match' },
            },
          },
        };
        listenerCallback(matchNotification);
      }).not.toThrow();
    });

    it('should handle notification response events', async () => {
      await service.initialize();

      const mockResponse = {
        notification: {
          request: {
            content: {
              data: { type: 'message', matchId: 'match123' },
            },
          },
        },
      };

      // Simulate notification response
      const listenerCallback =
        mockNotifications.addNotificationResponseReceivedListener.mock.calls[0][0];
      listenerCallback(mockResponse);

      // Should handle different response types without errors
      expect(() => {
        const matchResponse = {
          notification: {
            request: {
              content: {
                data: { type: 'match' },
              },
            },
          },
        };
        listenerCallback(matchResponse);
      }).not.toThrow();
    });

    it('should handle malformed notification data gracefully', async () => {
      await service.initialize();

      const mockNotification = {
        request: {
          content: {
            data: { type: 123 }, // Invalid type
          },
        },
      };

      const listenerCallback = mockNotifications.addNotificationReceivedListener.mock.calls[0][0];

      // Should not throw with invalid data
      expect(() => {
        listenerCallback(mockNotification);
      }).not.toThrow();
    });
  });

  describe('Sound and Channel Management', () => {
    it('should return correct sound for notification types', () => {
      expect((service as any).getSoundForType('match')).toBe('match_sound.wav');
      expect((service as any).getSoundForType('message')).toBe('message_sound.wav');
      expect((service as any).getSoundForType('like')).toBe('like_sound.wav');
      expect((service as any).getSoundForType('super_like')).toBe('like_sound.wav');
      expect((service as any).getSoundForType('unknown')).toBe('default_sound.wav');
    });
  });

  describe('Device and Backend Management', () => {
    it('should generate and store device ID', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null); // No existing device ID

      const deviceId = await (service as any).getDeviceId();

      expect(deviceId).toMatch(/^mobile_\d+_[a-z0-9]+$/);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('device_id', deviceId);
    });

    it('should retrieve existing device ID', async () => {
      const existingId = 'existing-device-id';
      mockAsyncStorage.getItem.mockResolvedValueOnce(existingId);

      const deviceId = await (service as any).getDeviceId();

      expect(deviceId).toBe(existingId);
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should register token with backend', async () => {
      await (service as any).registerTokenWithBackend('test-token', 'device-123');

      expect(mockApi.request).toHaveBeenCalledWith('/notifications/register-token', {
        method: 'POST',
        body: {
          token: 'test-token',
          platform: Platform.OS,
          deviceId: 'device-123',
        },
      });
    });

    it('should unregister token from backend', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('device-123');

      const result = await service.unregisterToken();

      expect(result).toBe(true);
      expect(mockApi.request).toHaveBeenCalledWith('/notifications/unregister-token', {
        method: 'DELETE',
        body: { deviceId: 'device-123' },
      });
    });

    it('should unregister with provided device ID', async () => {
      const result = await service.unregisterToken('custom-device-id');

      expect(mockApi.request).toHaveBeenCalledWith('/notifications/unregister-token', {
        method: 'DELETE',
        body: { deviceId: 'custom-device-id' },
      });
    });

    it('should handle backend unregistration errors', async () => {
      mockApi.request.mockRejectedValue(new Error('Backend error'));

      const result = await service.unregisterToken();

      expect(result).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', async () => {
      (service as any).expoPushToken = 'test-token';
      (service as any).notificationListener = { remove: jest.fn() };
      (service as any).responseListener = { remove: jest.fn() };

      await service.cleanup();

      expect(mockApi.request).toHaveBeenCalledWith('/notifications/unregister-token', {
        method: 'DELETE',
        body: { deviceId: expect.any(String) },
      });
      expect((service as any).notificationListener.remove).toHaveBeenCalled();
      expect((service as any).responseListener.remove).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      (service as any).expoPushToken = 'test-token';
      mockApi.request.mockRejectedValue(new Error('Cleanup error'));

      // Should not throw
      await expect(service.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const token = await service.initialize();

      expect(token).toBeNull();
    });

    it('should handle notification handler setup errors', async () => {
      mockNotifications.setNotificationHandler.mockImplementation(() => {
        throw new Error('Handler error');
      });

      // Should not crash the service
      expect(() => new NotificationService()).not.toThrow();
    });

    it('should handle channel creation errors on Android', async () => {
      Platform.OS = 'android';
      mockNotifications.setNotificationChannelAsync.mockRejectedValue(new Error('Channel error'));

      const token = await service.initialize();

      // Should still return token despite channel errors
      expect(token).toBe('test-token-123');
    });

    it('should handle listener setup errors', async () => {
      mockNotifications.addNotificationReceivedListener.mockImplementation(() => {
        throw new Error('Listener error');
      });

      const token = await service.initialize();

      // Should still return token
      expect(token).toBe('test-token-123');
    });

    it('should handle invalid notification data types', async () => {
      await service.initialize();

      const mockNotification = {
        request: {
          content: {
            data: { type: null, invalidField: undefined },
          },
        },
      };

      const listenerCallback = mockNotifications.addNotificationReceivedListener.mock.calls[0][0];

      // Should handle invalid data without crashing
      expect(() => {
        listenerCallback(mockNotification);
      }).not.toThrow();
    });

    it('should handle scheduling with missing data', async () => {
      const result = await service.sendLocalNotification({
        type: 'match',
        title: 'Test',
        body: 'Test body',
        data: undefined,
      });

      expect(result).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          data: {},
        }),
        trigger: null,
      });
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should handle iOS-specific behavior', () => {
      Platform.OS = 'ios';

      // iOS should work without Android-specific channels
      expect(() => new NotificationService()).not.toThrow();
    });

    it('should handle Android-specific behavior', () => {
      Platform.OS = 'android';

      // Android should work with notification channels
      expect(() => new NotificationService()).not.toThrow();
    });
  });

  describe('Token Management', () => {
    it('should return current push token', async () => {
      await service.initialize();

      expect(service.getExpoPushToken()).toBe('test-token-123');
    });

    it('should return null when no token available', () => {
      expect(service.getExpoPushToken()).toBeNull();
    });

    it('should load stored token on initialization', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('stored-token-456');

      await service.initialize();

      expect(service.getExpoPushToken()).toBe('test-token-123'); // New token takes precedence
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('expo_push_token');
    });
  });
});
