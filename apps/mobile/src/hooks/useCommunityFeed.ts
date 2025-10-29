/**
 * Community Feed Hook
 *
 * Production-grade state management for community feed functionality including:
 * - Post fetching with pagination
 * - Like/unlike actions
 * - Comment management
 * - Activity participation
 * - Report and block functionality
 * - Offline queue support
 */

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import type {
  CommunityPost,
  CommunityComment,
  CreatePostRequest,
  CreateCommentRequest,
} from '../services/communityAPI';
import { communityAPI } from '../services/communityAPI';

interface UseCommunityFeedReturn {
  // State
  posts: CommunityPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNextPage: boolean;
  currentPage: number;

  // Actions
  refreshFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  createPost: (data: CreatePostRequest) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, data: CreateCommentRequest) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  reportPost: (postId: string, reason: string, description?: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  joinActivity: (postId: string) => Promise<void>;
  leaveActivity: (postId: string) => Promise<void>;
}

const POSTS_PER_PAGE = 20;

export const useCommunityFeed = (): UseCommunityFeedReturn => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load initial feed
  const loadFeed = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      const response = await communityAPI.getFeed({
        page,
        limit: POSTS_PER_PAGE,
      });

      if (response.success) {
        if (isRefresh || page === 1) {
          setPosts(response.posts);
        } else {
          setPosts((prev) => [...prev, ...response.posts]);
        }

        setHasNextPage(page < response.pagination.pages);
        setCurrentPage(page);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load community feed';
      setError(errorMessage);
      logger.error('Error loading feed:', { error: err });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    await loadFeed(1, true);
  }, [loadFeed]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (!isLoadingMore && !isLoading && hasNextPage) {
      await loadFeed(currentPage + 1, false);
    }
  }, [isLoadingMore, isLoading, hasNextPage, currentPage, loadFeed]);

  // Create post
  const createPost = useCallback(async (data: CreatePostRequest) => {
    try {
      const response = await communityAPI.createPost(data);
      if (response.success) {
        // Add new post to the beginning of the feed
        setPosts((prev) => [response.post, ...prev]);
      }
    } catch (err) {
      logger.error('Error creating post:', { error: err });
      throw err;
    }
  }, []);

  // Like/unlike post
  const likePost = useCallback(async (postId: string) => {
    try {
      const response = await communityAPI.likePost(postId);
      if (response.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, liked: response.post.liked, likes: response.post.likes }
              : post,
          ),
        );
      }
    } catch (err) {
      logger.error('Error liking post:', { error: err });
    }
  }, []);

  // Add comment
  const addComment = useCallback(async (postId: string, data: CreateCommentRequest) => {
    try {
      const response = await communityAPI.addComment(postId, data);
      if (response.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: [...post.comments, response.comment],
                }
              : post,
          ),
        );
      }
    } catch (err) {
      logger.error('Error adding comment:', { error: err });
      throw err;
    }
  }, []);

  // Delete post
  const deletePost = useCallback(async (postId: string) => {
    try {
      await communityAPI.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      logger.error('Error deleting post:', { error: err });
      throw err;
    }
  }, []);

  // Report post
  const reportPost = useCallback(async (postId: string, reason: string, description?: string) => {
    try {
      await communityAPI.reportContent({
        type: 'post',
        targetId: postId,
        reason,
        description,
      });
    } catch (err) {
      logger.error('Error reporting post:', { error: err });
      throw err;
    }
  }, []);

  // Block user
  const blockUser = useCallback(async (userId: string) => {
    try {
      await communityAPI.blockUser(userId);
      // Remove posts from blocked user
      setPosts((prev) => prev.filter((post) => post.author._id !== userId));
    } catch (err) {
      logger.error('Error blocking user:', { error: err });
      throw err;
    }
  }, []);

  // Join activity
  const joinActivity = useCallback(async (postId: string) => {
    try {
      const response = await communityAPI.joinActivity(postId);
      if (response.success && response.post.activityDetails) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  activityDetails: response.post.activityDetails,
                }
              : post,
          ),
        );
      }
    } catch (err) {
      logger.error('Error joining activity:', { error: err });
      throw err;
    }
  }, []);

  // Leave activity
  const leaveActivity = useCallback(async (postId: string) => {
    try {
      const response = await communityAPI.leaveActivity(postId);
      if (response.success && response.post.activityDetails) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  activityDetails: response.post.activityDetails,
                }
              : post,
          ),
        );
      }
    } catch (err) {
      logger.error('Error leaving activity:', { error: err });
      throw err;
    }
  }, []);

  // Load initial feed on mount
  useEffect(() => {
    loadFeed(1, false);
  }, []);

  return {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasNextPage,
    currentPage,
    refreshFeed,
    loadMore,
    createPost,
    likePost,
    addComment,
    deletePost,
    reportPost,
    blockUser,
    joinActivity,
    leaveActivity,
  };
};

export default useCommunityFeed;
