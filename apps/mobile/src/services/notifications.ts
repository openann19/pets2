/**
 * Push Notifications Service for PawfectMatch Mobile
 * Professional implementation with Expo Notifications
 * This is the PRIMARY implementation - pushNotificationService.ts is deprecated
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { api } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'match' | 'message' | 'like' | 'super_like' | 'premium' | 'reminder';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  scheduledFor?: Date;
}

export interface NotificationPermissionStatus {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private shouldRequestPermission: boolean = false; // Flag to delay permission request

  /**
   * Get current permission status without requesting
   */
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      if (!Device.isDevice) {
        return { status: 'undetermined', canAskAgain: false };
      }

      const { status } = await Notifications.getPermissionsAsync();
      const statusString = String(status);
      
      return {
        status: statusString === 'granted' ? 'granted' : statusString === 'denied' ? 'denied' : 'undetermined',
        canAskAgain: statusString !== 'denied',
      };
    } catch (error) {
      logger.error('Failed to get notification permission status', { error });
      return { status: 'undetermined', canAskAgain: false };
    }
  }

  /**
   * Request notification permission with better UX
   * Call this after showing an in-app explanation to the user
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    try {
      if (!Device.isDevice) {
        logger.warn('Must use physical device for Push Notifications');
        return { status: 'undetermined', canAskAgain: false };
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const statusString = String(status);
      
      const result: NotificationPermissionStatus = {
        status: statusString === 'granted' ? 'granted' : statusString === 'denied' ? 'denied' : 'undetermined',
        canAskAgain: statusString !== 'denied',
      };

      if (result.status === 'granted') {
        // Initialize token after permission granted
        await this.initializeToken();
      }

      return result;
    } catch (error) {
      logger.error('Failed to request notification permission', { error });
      return { status: 'denied', canAskAgain: false };
    }
  }

  /**
   * Initialize token (called after permission is granted)
   */
  private async initializeToken(): Promise<string | null> {
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      this.expoPushToken = token;

      // Store token locally
      await AsyncStorage.setItem('expo_push_token', token);

      // Register token with backend
      try {
        const deviceId = await this.getDeviceId();
        await this.registerTokenWithBackend(token, deviceId);
      } catch (error) {
        logger.warn('Failed to register push token with backend', { error });
        // Non-critical - continue without backend registration
      }

      logger.info('Push notification token initialized');
      return token;
    } catch (error) {
      logger.error('Failed to initialize push token', { error });
      return null;
    }
  }

  async initialize(autoRequest: boolean = false): Promise<string | null> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        logger.warn('Must use physical device for Push Notifications');
        return null;
      }

      // Get existing permission status
      const permissionStatus = await this.getPermissionStatus();

      // If already granted, initialize token
      if (permissionStatus.status === 'granted') {
        return await this.initializeToken();
      }

      // If auto-request is enabled and we can ask, request permission
      if (autoRequest && permissionStatus.canAskAgain) {
        const result = await this.requestPermission();
        if (result.status === 'granted') {
          return this.expoPushToken;
        }
      }

      // Set flag to request permission later (via explicit user action)
      this.shouldRequestPermission = permissionStatus.canAskAgain;

      // Configure notification channel for Android (even without permission)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B6B',
        });

        // Create specific channels for different notification types
        await this.createNotificationChannels();
      }

      // Set up listeners
      this.setupListeners();

      logger.info('Push notifications ready for permission request');
      return null;
    } catch (error) {
      logger.error('Error initializing push notifications', { error });
      return null;
    }
  }

  private async createNotificationChannels() {
    const channels = [
      {
        id: 'matches',
        name: 'New Matches',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Notifications for new matches',
        sound: 'match_sound.wav',
      },
      {
        id: 'messages',
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'New message notifications',
        sound: 'message_sound.wav',
      },
      {
        id: 'likes',
        name: 'Likes',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Someone liked your pet',
        sound: 'like_sound.wav',
      },
      {
        id: 'reminders',
        name: 'Reminders',
        importance: Notifications.AndroidImportance.LOW,
        description: 'App usage reminders',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        description: channel.description,
        ...(channel.sound ? { sound: channel.sound } : {}),
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }

  private setupListeners() {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        logger.debug('Notification received', { notification });
        this.handleNotificationReceived(notification);
      },
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const { data } = response.notification.request.content;
        this.handleNotificationResponse(data as Record<string, unknown>);
      },
    );
  }

  private async handleNotificationReceived(notification: Notifications.Notification) {
    const { data } = notification.request.content;

    // Handle different notification types with safe type checking
    const notificationType = data && typeof data['type'] === 'string' ? data['type'] : '';

    // Update badge count when notification is received
    try {
      const currentBadgeCount = await this.getBadgeCount();
      await this.setBadgeCount(currentBadgeCount + 1);
    } catch (error) {
      logger.error('Failed to update badge count on notification received', { error });
    }

    switch (notificationType) {
      case 'match':
        // Could trigger a celebration animation
        break;
      case 'message':
        // Could update unread count
        break;
      case 'like':
        // Could show a brief toast
        break;
    }
  }

  private async handleNotificationResponse(data: Record<string, unknown>) {
    // Navigate to appropriate screen based on notification type
    const notificationType = typeof data['type'] === 'string' ? data['type'] : '';
    const matchId = typeof data['matchId'] === 'string' ? data['matchId'] : '';

    // Clear badge count or reduce it when user taps notification
    // (App will refresh badge count when it comes to foreground)
    try {
      const currentBadgeCount = await this.getBadgeCount();
      if (currentBadgeCount > 0) {
        await this.setBadgeCount(Math.max(0, currentBadgeCount - 1));
      }
    } catch (error) {
      logger.error('Failed to update badge count on notification response', { error });
    }

    switch (notificationType) {
      case 'match':
        // Navigate to matches screen
        break;
      case 'message':
        // Navigate to specific chat
        if (matchId !== '') {
          // Navigate to specific chat with matchId
        }
        break;
      case 'like':
        // Navigate to likes screen
        break;
      case 'reminder':
        // Navigate to home screen
        break;
    }
  }

  // Helper to get sound for notification type
  private getSoundForType(type: string): string {
    switch (type) {
      case 'match':
        return 'match_sound.wav';
      case 'message':
        return 'message_sound.wav';
      case 'like':
      case 'super_like':
        return 'like_sound.wav';
      default:
        return 'default_sound.wav';
    }
  }

  // Helper to get notification channel for type
  // private getChannelForType(type: string): string {
  //   switch (type) {
  //     case 'match':
  //       return 'matches';
  //     case 'message':
  //       return 'messages';
  //     case 'like':
  //     case 'super_like':
  //       return 'likes';
  //     case 'reminder':
  //       return 'reminders';
  //     default:
  //       return 'default';
  //   }
  // }

  // Send a local notification
  async sendLocalNotification(notificationData: NotificationData): Promise<string | null> {
    try {
      // Get sound and channel based on notification type
      const sound = this.getSoundForType(notificationData.type);
      // const channelId = Platform.OS === 'android' ? this.getChannelForType(notificationData.type) : undefined;

      // Configure trigger (immediate or scheduled)
      let trigger: Notifications.NotificationTriggerInput | undefined = undefined;
      if (notificationData.scheduledFor !== undefined) {
        trigger = {
          type: 'date',
          date: notificationData.scheduledFor,
        };
      }

      // Schedule the notification
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data ?? {},
          sound,
        },
        ...(trigger ? { trigger } : {}),
      });

      return identifier;
    } catch (error) {
      logger.error('Error sending local notification', { error });
      return null;
    }
  }

  // Get current badge count
  async getBadgeCount(): Promise<number> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      logger.error('Error getting badge count', { error });
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(count);
      return true;
    } catch (error) {
      logger.error('Error setting badge count', { error, count });
      return false;
    }
  }

  // Clear badge count
  async clearBadge(): Promise<boolean> {
    return await this.setBadgeCount(0);
  }

  // Cancel a specific notification
  async cancelNotification(identifier: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      return true;
    } catch (error) {
      logger.error('Error canceling notification', { error, identifier });
      return false;
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      logger.error('Error canceling all notifications', { error });
      return false;
    }
  }

  // Send match notification
  async sendMatchNotification(petName: string, petPhoto: string): Promise<string | null> {
    return this.sendLocalNotification({
      type: 'match',
      title: 'New Match! 🎉',
      body: `You matched with ${petName}!`,
      data: {
        type: 'match',
        petName,
        petPhoto,
      },
    });
  }

  // Send message notification
  async sendMessageNotification(
    senderName: string,
    message: string,
    matchId: string,
  ): Promise<string | null> {
    return this.sendLocalNotification({
      type: 'message',
      title: `Message from ${senderName}`,
      body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: {
        type: 'message',
        senderName,
        message,
        matchId,
      },
    });
  }

  // Send like notification
  async sendLikeNotification(petName: string, isSuper = false): Promise<string | null> {
    return this.sendLocalNotification({
      type: isSuper ? 'super_like' : 'like',
      title: isSuper ? 'Super Like! ⭐' : 'New Like! ❤️',
      body: `${petName} ${isSuper ? 'super liked' : 'liked'} your pet!`,
      data: {
        type: isSuper ? 'super_like' : 'like',
        petName,
      },
    });
  }

  // Schedule a reminder notification
  async scheduleReminderNotification(hours: number): Promise<string | null> {
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + hours);

    return this.sendLocalNotification({
      type: 'reminder',
      title: 'Missing Your Furry Friends!',
      body: `It's been ${String(hours)} hours since your last visit. Check out new potential matches!`,
      data: {
        type: 'reminder',
      },
      scheduledFor: scheduledTime,
    });
  }

  // Get current token
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Get or create device ID
  private async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `mobile_${String(Date.now())}_${Math.random().toString(36).substring(2, 9)}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  // Register token with backend
  private async registerTokenWithBackend(token: string, deviceId: string): Promise<void> {
    try {
      await api.request('/notifications/register-token', {
        method: 'POST',
        body: {
          token,
          platform: Platform.OS,
          deviceId,
        },
      });
      logger.info('Push token registered with backend', { deviceId });
    } catch (error) {
      logger.error('Failed to register push token with backend', { error });
      throw error;
    }
  }

  // Unregister token from backend
  async unregisterToken(deviceId?: string): Promise<boolean> {
    try {
      const id = deviceId || (await this.getDeviceId());
      await api.request('/notifications/unregister-token', {
        method: 'DELETE',
        body: { deviceId: id },
      });
      logger.info('Push token unregistered from backend', { deviceId: id });
      return true;
    } catch (error) {
      logger.error('Failed to unregister push token', { error });
      return false;
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    // Unregister from backend
    if (this.expoPushToken) {
      await this.unregisterToken().catch(() => {
        // Non-critical
      });
    }

    // Remove listeners
    if (this.notificationListener !== null) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener !== null) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  // ===== SECURITY CONTROLS =====
}

// Export a singleton instance
export const notificationService = new NotificationService();
export const initializeNotificationsService = () => notificationService.initialize();
// Export permission methods for use in components
export { notificationService as default };
