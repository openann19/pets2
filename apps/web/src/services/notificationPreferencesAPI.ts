/**
 * 🔔 Notification Preferences API
 * Notification settings management matching mobile app structure
 */

import { apiInstance } from './api';

export interface NotificationPreferences {
  enabled: boolean;
  matches: boolean;
  messages: boolean;
  likes: boolean;
  reminders: boolean;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'instant' | 'batched' | 'daily';
  sound: boolean;
  vibration: boolean;
}

/**
 * Notification Preferences API matching mobile app structure
 */
export const notificationPreferencesAPI = {
  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await apiInstance.request<NotificationPreferences>(
        '/user/notifications/preferences',
        { method: 'GET' },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to get notification preferences');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to get notification preferences');
    }
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (
    preferences: NotificationPreferences,
  ): Promise<NotificationPreferences> => {
    try {
      const response = await apiInstance.request<NotificationPreferences>(
        '/user/notifications/preferences',
        {
          method: 'PUT',
          body: JSON.stringify(preferences),
        },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to update notification preferences');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to update notification preferences');
    }
  },
};

export default notificationPreferencesAPI;

