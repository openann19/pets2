/**
 * 💎 Premium/Subscription API
 * Premium features and subscription management matching mobile app structure
 */

import { apiInstance } from './api';

export interface CurrentSubscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
}

export interface DailySwipeStatus {
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  warningThreshold: number;
}

/**
 * Premium API matching mobile app structure
 */
export const premiumAPI = {
  /**
   * Get current subscription
   */
  getCurrentSubscription: async (): Promise<CurrentSubscription | null> => {
    try {
      const response = await apiInstance.request<CurrentSubscription>(
        '/premium/subscription',
        { method: 'GET' },
      );

      if (!response || !response.success || !response.data) {
        // Return null if no subscription (matching mobile behavior)
        return null;
      }

      return response.data;
    } catch (error) {
      // Mobile returns null on error, not an exception
      return null;
    }
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (): Promise<boolean> => {
    try {
      const response = await apiInstance.request<{ success: boolean }>(
        '/premium/subscription/cancel',
        { method: 'POST' },
      );

      return response?.success ?? false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get daily swipe status
   */
  getDailySwipeStatus: async (): Promise<DailySwipeStatus> => {
    try {
      const response = await apiInstance.request<DailySwipeStatus>(
        '/premium/daily-swipe-status',
        { method: 'GET' },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to get daily swipe status');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to get daily swipe status');
    }
  },
};

export default premiumAPI;

