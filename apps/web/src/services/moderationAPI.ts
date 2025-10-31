/**
 * 🛡️ Moderation API
 * Content moderation and reporting matching mobile app structure
 */

import { apiInstance } from './api';

export interface ModerationStats {
  pendingReports: number;
  activeModerators: number;
  resolutionRate: number;
}

export interface ModerationQueueItem {
  _id: string;
  type: string;
  status: string;
  contentId: string;
  reportedBy: string;
  reason?: string;
  createdAt: string;
}

export interface ModerationQueueResponse {
  items: ModerationQueueItem[];
  total: number;
}

export interface ModerationActionResponse {
  success: boolean;
  message?: string;
}

/**
 * Moderation API matching mobile app structure
 */
export const moderationAPI = {
  /**
   * Get moderation statistics
   */
  getStats: async (): Promise<ModerationStats> => {
    try {
      const response = await apiInstance.request<ModerationStats>('/moderation/stats', {
        method: 'GET',
      });

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to get moderation stats');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to get moderation stats');
    }
  },

  /**
   * Get moderation queue
   */
  getQueue: async (params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'all';
    limit?: number;
  }): Promise<ModerationQueueResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const query = queryParams.toString();
      const endpoint = `/moderation/queue${query ? `?${query}` : ''}`;

      const response = await apiInstance.request<ModerationQueueResponse>(endpoint, {
        method: 'GET',
      });

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to get moderation queue');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to get moderation queue');
    }
  },

  /**
   * Approve moderation item
   */
  approve: async (
    moderationId: string,
    options?: { notes?: string },
  ): Promise<ModerationActionResponse> => {
    try {
      const response = await apiInstance.request<ModerationActionResponse>(
        `/moderation/${moderationId}/approve`,
        {
          method: 'POST',
          body: JSON.stringify(options ?? {}),
        },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to approve moderation item');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to approve moderation item');
    }
  },

  /**
   * Reject moderation item
   */
  reject: async (
    moderationId: string,
    options?: { reason?: string; category?: string; notes?: string },
  ): Promise<ModerationActionResponse> => {
    try {
      const response = await apiInstance.request<ModerationActionResponse>(
        `/moderation/${moderationId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify(options ?? {}),
        },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to reject moderation item');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to reject moderation item');
    }
  },
};

export default moderationAPI;

