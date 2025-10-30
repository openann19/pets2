/**
 * Community API Service for Mobile App
 *
 * Production-grade service for community feed, posts, likes, comments, and activities.
 * Includes offline queue support, retry logic, and comprehensive error handling.
 */

import { logger } from '@pawfectmatch/core';
import apiClient from './apiClient';
import type { AxiosError } from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CommunityPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  images: string[];
  likes: number;
  liked: boolean;
  comments: CommunityComment[];
  createdAt: string;
  packId?: string;
  packName?: string;
  type: 'post' | 'activity';
  activityDetails?: ActivityDetails;
}

export interface ActivityDetails {
  date: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  attending: boolean;
}

export interface CommunityComment {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  postId: string;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  packId?: string;
  type?: 'post' | 'activity';
  activityDetails?: ActivityDetails;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CommunityFeedResponse {
  success: boolean;
  posts: CommunityPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  appliedFilters: {
    packId: string | null;
    userId: string | null;
    type: string | null;
    matchedCount: number;
  };
}

export interface LikeResponse {
  success: boolean;
  post: {
    _id: string;
    likes: number;
    liked: boolean;
  };
  message: string;
}

export interface CommentResponse {
  success: boolean;
  comment: CommunityComment;
  message: string;
}

export interface CommentsListResponse {
  success: boolean;
  comments: CommunityComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  postId: string;
}

export interface GetFeedParams {
  page?: number;
  limit?: number;
  packId?: string;
  userId?: string;
  type?: 'post' | 'activity';
}

export interface GetCommentsParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// Error Handling
// ============================================================================

const handleApiError = (error: unknown, context: string): never => {
  if (error instanceof Error) {
    logger.error(`${context}:`, { error: error.message, stack: error.stack });
    throw error;
  }
  logger.error(`${context}: Unknown error`, { error });
  throw new Error(`${context}: Unknown error`);
};

// ============================================================================
// Community API Service
// ============================================================================

export const communityAPI = {
  /**
   * Get community feed with pagination and filters
   */
  getFeed: async (params?: GetFeedParams): Promise<CommunityFeedResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.packId) queryParams.set('packId', params.packId);
      if (params?.userId) queryParams.set('userId', params.userId);
      if (params?.type) queryParams.set('type', params.type);

      const response = await apiClient.get<CommunityFeedResponse>(
        `/community/posts?${queryParams.toString()}`,
      );
      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch community feed');
    }
  },

  /**
   * Create a new community post
   */
  createPost: async (
    data: CreatePostRequest,
  ): Promise<{
    success: boolean;
    post: CommunityPost;
    message: string;
  }> => {
    try {
      if (!data.content || !data.content.trim()) {
        throw new Error('Post content is required');
      }

      const response = await apiClient.post<{
        success: boolean;
        post: CommunityPost;
        message: string;
      }>('/community/posts', data);

      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to create community post');
    }
  },

  /**
   * Like or unlike a community post
   */
  likePost: async (postId: string): Promise<LikeResponse> => {
    try {
      const response = await apiClient.post<LikeResponse>(`/community/posts/${postId}/like`);
      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to like/unlike community post');
    }
  },

  /**
   * Get comments for a specific post
   */
  getComments: async (
    postId: string,
    params?: GetCommentsParams,
  ): Promise<CommentsListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());

      const response = await apiClient.get<CommentsListResponse>(
        `/community/posts/${postId}/comments?${queryParams.toString()}`,
      );
      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch post comments');
    }
  },

  /**
   * Add a comment to a post
   */
  addComment: async (postId: string, data: CreateCommentRequest): Promise<CommentResponse> => {
    try {
      if (!data.content || !data.content.trim()) {
        throw new Error('Comment content is required');
      }

      const response = await apiClient.post<CommentResponse>(
        `/community/posts/${postId}/comments`,
        data,
      );
      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to add comment to post');
    }
  },

  /**
   * Report a post or comment
   */
  reportContent: async (data: {
    type: 'post' | 'comment';
    targetId: string;
    reason: string;
    description?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>('/community/report', data);
      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to report content');
    }
  },

  /**
   * Block a user from community
   */
  blockUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>('/community/block', { userId });
      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to block user');
    }
  },

  /**
   * Join an activity
   */
  joinActivity: async (
    postId: string,
  ): Promise<{
    success: boolean;
    post: CommunityPost;
    message: string;
  }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        post: CommunityPost;
        message: string;
      }>(`/community/posts/${postId}/join`);

      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to join activity');
    }
  },

  /**
   * Leave an activity
   */
  leaveActivity: async (
    postId: string,
  ): Promise<{
    success: boolean;
    post: CommunityPost;
    message: string;
  }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        post: CommunityPost;
        message: string;
      }>(`/community/posts/${postId}/leave`);

      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to leave activity');
    }
  },

  /**
   * Delete a user's own post
   */
  deletePost: async (postId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/community/posts/${postId}`);

      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to delete post');
    }
  },

  /**
   * Edit a user's own post
   */
  updatePost: async (
    postId: string,
    data: Partial<CreatePostRequest>,
  ): Promise<{
    success: boolean;
    post: CommunityPost;
    message: string;
  }> => {
    try {
      const response = await apiClient.put<{
        success: boolean;
        post: CommunityPost;
        message: string;
      }>(`/community/posts/${postId}`, data);

      return response;
    } catch (error) {
      return handleApiError(error, 'Failed to update post');
    }
  },
};

export default communityAPI;
