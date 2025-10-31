/**
 * 👀 Likes API - Who Liked You Feature
 * Premium feature matching mobile app structure
 */

import { apiInstance } from './api';
import type { ApiResponse } from '../types';

export interface ReceivedLike {
  userId: string;
  name: string;
  profilePicture?: string;
  location?: string;
  likedAt: string;
  isSuperLike: boolean;
  petsLiked: Array<{
    petId: string;
    action: 'like' | 'superlike';
    likedAt: string;
  }>;
}

export interface ReceivedLikesResponse {
  success: boolean;
  data: {
    likes: ReceivedLike[];
    total: number;
  };
}

/**
 * Likes API matching mobile app structure
 */
export const likesAPI = {
  /**
   * Get users who liked your pets (Premium feature)
   */
  getReceivedLikes: async (): Promise<ReceivedLike[]> => {
    try {
      const response = await apiInstance.request<ReceivedLikesResponse>('/likes/received');

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to fetch received likes');
      }

      return response.data.likes;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to fetch received likes');
    }
  },

  /**
   * Get mutual likes (potential matches)
   */
  getMutualLikes: async (): Promise<ReceivedLike[]> => {
    try {
      const response = await apiInstance.request<ReceivedLikesResponse>('/likes/mutual');

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to fetch mutual likes');
      }

      return response.data.likes;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to fetch mutual likes');
    }
  },
};

export default likesAPI;

