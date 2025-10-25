/**
 * Community API Service
 * Handles community feed, posts, comments, and social interactions
 */

import { api } from "./api";
import { logger } from "@pawfectmatch/core";

export interface CommunityPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: CommunityComment[];
  createdAt: string;
  packId?: string;
  packName?: string;
  type: "post" | "activity";
  activityDetails?: {
    date: string;
    location: string;
    maxAttendees: number;
    currentAttendees: number;
  };
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
    packId?: string;
    userId?: string;
    type?: string;
    matchedCount: number;
  };
}

export interface CreatePostPayload {
  content: string;
  images?: string[];
  packId?: string;
  type?: "post" | "activity";
  activityDetails?: {
    date: string;
    location: string;
    maxAttendees: number;
  };
}

export interface CommentResponse {
  success: boolean;
  comment: CommunityComment;
  message: string;
}

export interface LikeResponse {
  success: boolean;
  likes: number;
  message: string;
}

class CommunityAPIService {
  /**
   * Get community feed with pagination and filters
   */
  async getFeed(
    params: {
      page?: number;
      limit?: number;
      packId?: string;
      userId?: string;
      type?: string;
    } = {},
  ): Promise<CommunityFeedResponse> {
    try {
      const response = await api.get("/community/posts", { params });
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch community feed", { error, params });
      throw error;
    }
  }

  /**
   * Create a new community post
   */
  async createPost(
    payload: CreatePostPayload,
  ): Promise<{ success: boolean; post: CommunityPost; message: string }> {
    try {
      const response = await api.post("/community/posts", payload);
      return response.data;
    } catch (error) {
      logger.error("Failed to create community post", { error, payload });
      throw error;
    }
  }

  /**
   * Like or unlike a community post
   */
  async likePost(postId: string): Promise<LikeResponse> {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      logger.error("Failed to like post", { error, postId });
      throw error;
    }
  }

  /**
   * Add a comment to a community post
   */
  async addComment(postId: string, content: string): Promise<CommentResponse> {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, {
        content,
      });
      return response.data;
    } catch (error) {
      logger.error("Failed to add comment", { error, postId, content });
      throw error;
    }
  }

  /**
   * Get comments for a specific post
   */
  async getComments(
    postId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<{
    success: boolean;
    comments: CommunityComment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    postId: string;
  }> {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`, {
        params,
      });
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch comments", { error, postId, params });
      throw error;
    }
  }

  /**
   * Report inappropriate content
   */
  async reportContent(payload: {
    targetType: "post" | "user" | "comment";
    targetId: string;
    reason: string;
    details?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post("/community/report", payload);
      return response.data;
    } catch (error) {
      logger.error("Failed to report content", { error, payload });
      throw error;
    }
  }

  /**
   * Block a user
   */
  async blockUser(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/community/block/${userId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to block user", { error, userId });
      throw error;
    }
  }

  /**
   * Follow a user
   */
  async followUser(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/community/follow/${userId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to follow user", { error, userId });
      throw error;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/community/unfollow/${userId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to unfollow user", { error, userId });
      throw error;
    }
  }

  /**
   * Get pack groups for filtering
   */
  async getPackGroups(): Promise<{
    success: boolean;
    packs: Array<{
      _id: string;
      name: string;
      description: string;
      memberCount: number;
      isMember: boolean;
    }>;
  }> {
    try {
      const response = await api.get("/community/packs");
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch pack groups", { error });
      throw error;
    }
  }

  /**
   * Join a pack group
   */
  async joinPack(
    packId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/community/packs/${packId}/join`);
      return response.data;
    } catch (error) {
      logger.error("Failed to join pack", { error, packId });
      throw error;
    }
  }

  /**
   * Leave a pack group
   */
  async leavePack(
    packId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/community/packs/${packId}/leave`);
      return response.data;
    } catch (error) {
      logger.error("Failed to leave pack", { error, packId });
      throw error;
    }
  }
}

export const communityAPI = new CommunityAPIService();
