/**
 * Comprehensive tests for CommunityAPI
 *
 * Coverage:
 * - Feed management (get feed with pagination and filters)
 * - Post operations (create, update, delete, like/unlike)
 * - Comment management (get comments, add comments)
 * - Activity participation (join/leave activities)
 * - Content moderation (report, block users)
 * - Error handling and validation
 * - Pagination and filtering
 * - Edge cases and concurrent operations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { communityAPI } from '../communityAPI';

// Mock dependencies
jest.mock('../apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
  },
}));

import { apiClient } from '../apiClient';
import { logger } from '@pawfectmatch/core';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('CommunityAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should fetch community feed without parameters', async () => {
      const mockResponse = {
        success: true,
        posts: [
          {
            _id: 'post1',
            author: { _id: 'user1', name: 'John Doe', avatar: 'avatar.jpg' },
            content: 'Hello community!',
            images: ['image1.jpg'],
            likes: 5,
            liked: false,
            comments: [],
            createdAt: '2024-01-01T00:00:00Z',
            type: 'post' as const,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
        appliedFilters: {
          packId: null,
          userId: null,
          type: null,
          matchedCount: 1,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await communityAPI.getFeed();

      expect(mockApiClient.get).toHaveBeenCalledWith('/community/posts');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch community feed with pagination and filters', async () => {
      const mockResponse = {
        success: true,
        posts: [],
        pagination: { page: 2, limit: 10, total: 25, pages: 3 },
        appliedFilters: {
          packId: 'pack123',
          userId: 'user456',
          type: 'activity',
          matchedCount: 0,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = {
        page: 2,
        limit: 10,
        packId: 'pack123',
        userId: 'user456',
        type: 'activity' as const,
      };

      const result = await communityAPI.getFeed(params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/community/posts?page=2&limit=10&packId=pack123&userId=user456&type=activity'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(communityAPI.getFeed()).rejects.toThrow('Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch community feed:', {
        error: 'Network error',
        stack: error.stack,
      });
    });

    it('should handle empty feed response', async () => {
      const mockResponse = {
        success: true,
        posts: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        appliedFilters: { packId: null, userId: null, type: null, matchedCount: 0 },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await communityAPI.getFeed();

      expect(result.posts).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('createPost', () => {
    it('should create a new post successfully', async () => {
      const postData = {
        content: 'New community post!',
        images: ['image1.jpg', 'image2.jpg'],
        packId: 'pack123',
      };

      const mockResponse = {
        success: true,
        post: {
          _id: 'newpost123',
          author: { _id: 'user1', name: 'John Doe', avatar: 'avatar.jpg' },
          content: postData.content,
          images: postData.images,
          likes: 0,
          liked: false,
          comments: [],
          createdAt: '2024-01-01T00:00:00Z',
          packId: postData.packId,
          type: 'post' as const,
        },
        message: 'Post created successfully',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.createPost(postData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/posts', postData);
      expect(result).toEqual(mockResponse);
    });

    it('should create an activity post with details', async () => {
      const activityData = {
        content: 'Join our pet meetup!',
        type: 'activity' as const,
        activityDetails: {
          date: '2024-01-15',
          location: 'Central Park',
          maxAttendees: 20,
          currentAttendees: 0,
          attending: false,
        },
      };

      const mockResponse = {
        success: true,
        post: {
          _id: 'activity123',
          content: activityData.content,
          type: 'activity',
          activityDetails: activityData.activityDetails,
        },
        message: 'Activity created successfully',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.createPost(activityData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/posts', activityData);
      expect(result.post.type).toBe('activity');
    });

    it('should validate required content', async () => {
      await expect(communityAPI.createPost({ content: '' })).rejects.toThrow(
        'Post content is required'
      );

      await expect(communityAPI.createPost({ content: '   ' })).rejects.toThrow(
        'Post content is required'
      );

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors during post creation', async () => {
      const error = new Error('API error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(communityAPI.createPost({ content: 'Test post' })).rejects.toThrow(
        'API error'
      );

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create community post:', {
        error: 'API error',
        stack: error.stack,
      });
    });
  });

  describe('likePost', () => {
    it('should like/unlike a post', async () => {
      const mockResponse = {
        success: true,
        post: {
          _id: 'post123',
          likes: 6,
          liked: true,
        },
        message: 'Post liked successfully',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.likePost('post123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/posts/post123/like');
      expect(result).toEqual(mockResponse);
      expect(result.post.liked).toBe(true);
    });

    it('should handle API errors during like operation', async () => {
      const error = new Error('Like failed');
      mockApiClient.post.mockRejectedValue(error);

      await expect(communityAPI.likePost('post123')).rejects.toThrow('Like failed');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to like/unlike community post:', {
        error: 'Like failed',
        stack: error.stack,
      });
    });
  });

  describe('getComments', () => {
    it('should fetch comments for a post', async () => {
      const mockResponse = {
        success: true,
        comments: [
          {
            _id: 'comment1',
            author: { _id: 'user1', name: 'John Doe', avatar: 'avatar.jpg' },
            content: 'Great post!',
            createdAt: '2024-01-01T00:00:00Z',
            postId: 'post123',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
        postId: 'post123',
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await communityAPI.getComments('post123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/community/posts/post123/comments');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch comments with pagination', async () => {
      const mockResponse = {
        success: true,
        comments: [],
        pagination: { page: 2, limit: 5, total: 12, pages: 3 },
        postId: 'post123',
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await communityAPI.getComments('post123', { page: 2, limit: 5 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/community/posts/post123/comments?page=2&limit=5'
      );
      expect(result.pagination.page).toBe(2);
    });

    it('should handle API errors when fetching comments', async () => {
      const error = new Error('Comments fetch failed');
      mockApiClient.get.mockRejectedValue(error);

      await expect(communityAPI.getComments('post123')).rejects.toThrow(
        'Comments fetch failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch post comments:', {
        error: 'Comments fetch failed',
        stack: error.stack,
      });
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      const commentData = { content: 'This is a great comment!' };
      const mockResponse = {
        success: true,
        comment: {
          _id: 'comment123',
          author: { _id: 'user1', name: 'John Doe', avatar: 'avatar.jpg' },
          content: commentData.content,
          createdAt: '2024-01-01T00:00:00Z',
          postId: 'post123',
        },
        message: 'Comment added successfully',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.addComment('post123', commentData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/community/posts/post123/comments',
        commentData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should validate comment content', async () => {
      await expect(
        communityAPI.addComment('post123', { content: '' })
      ).rejects.toThrow('Comment content is required');

      await expect(
        communityAPI.addComment('post123', { content: '   ' })
      ).rejects.toThrow('Comment content is required');

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors when adding comments', async () => {
      const error = new Error('Comment creation failed');
      mockApiClient.post.mockRejectedValue(error);

      await expect(
        communityAPI.addComment('post123', { content: 'Test comment' })
      ).rejects.toThrow('Comment creation failed');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to add comment to post:', {
        error: 'Comment creation failed',
        stack: error.stack,
      });
    });
  });

  describe('Activity Participation', () => {
    const mockActivityResponse = {
      success: true,
      post: {
        _id: 'activity123',
        type: 'activity',
        activityDetails: {
          date: '2024-01-15',
          location: 'Central Park',
          maxAttendees: 20,
          currentAttendees: 6,
          attending: true,
        },
      },
      message: 'Successfully joined activity',
    };

    it('should join an activity', async () => {
      mockApiClient.post.mockResolvedValue(mockActivityResponse);

      const result = await communityAPI.joinActivity('activity123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/posts/activity123/join');
      expect(result).toEqual(mockActivityResponse);
      expect(result.post.activityDetails?.attending).toBe(true);
    });

    it('should leave an activity', async () => {
      const leaveResponse = {
        ...mockActivityResponse,
        post: {
          ...mockActivityResponse.post,
          activityDetails: {
            ...mockActivityResponse.post.activityDetails,
            currentAttendees: 5,
            attending: false,
          },
        },
        message: 'Successfully left activity',
      };

      mockApiClient.post.mockResolvedValue(leaveResponse);

      const result = await communityAPI.leaveActivity('activity123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/posts/activity123/leave');
      expect(result.post.activityDetails?.attending).toBe(false);
    });

    it('should handle API errors for activity operations', async () => {
      const error = new Error('Activity operation failed');
      mockApiClient.post.mockRejectedValue(error);

      await expect(communityAPI.joinActivity('activity123')).rejects.toThrow(
        'Activity operation failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to join activity:', {
        error: 'Activity operation failed',
        stack: error.stack,
      });
    });
  });

  describe('Post Management', () => {
    it('should delete a post', async () => {
      const mockResponse = {
        success: true,
        message: 'Post deleted successfully',
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await communityAPI.deletePost('post123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/community/posts/post123');
      expect(result).toEqual(mockResponse);
    });

    it('should update a post', async () => {
      const updateData = {
        content: 'Updated post content',
        images: ['new-image.jpg'],
      };

      const mockResponse = {
        success: true,
        post: {
          _id: 'post123',
          content: updateData.content,
          images: updateData.images,
        },
        message: 'Post updated successfully',
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await communityAPI.updatePost('post123', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/community/posts/post123', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors for post operations', async () => {
      const error = new Error('Post operation failed');
      mockApiClient.delete.mockRejectedValue(error);

      await expect(communityAPI.deletePost('post123')).rejects.toThrow(
        'Post operation failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to delete post:', {
        error: 'Post operation failed',
        stack: error.stack,
      });
    });
  });

  describe('Content Moderation', () => {
    it('should report content', async () => {
      const reportData = {
        type: 'post' as const,
        targetId: 'post123',
        reason: 'inappropriate_content',
        description: 'Contains offensive language',
      };

      const mockResponse = {
        success: true,
        message: 'Content reported successfully',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.reportContent(reportData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/report', reportData);
      expect(result).toEqual(mockResponse);
    });

    it('should report comments', async () => {
      const reportData = {
        type: 'comment' as const,
        targetId: 'comment123',
        reason: 'spam',
      };

      const mockResponse = {
        success: true,
        message: 'Comment reported successfully',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.reportContent(reportData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/report', reportData);
      expect(result.message).toContain('Comment reported');
    });

    it('should block a user', async () => {
      const mockResponse = {
        success: true,
        message: 'User blocked successfully',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.blockUser('user123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/community/block', {
        userId: 'user123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors for moderation operations', async () => {
      const error = new Error('Moderation failed');
      mockApiClient.post.mockRejectedValue(error);

      await expect(communityAPI.reportContent({
        type: 'post',
        targetId: 'post123',
        reason: 'spam',
      })).rejects.toThrow('Moderation failed');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to report content:', {
        error: 'Moderation failed',
        stack: error.stack,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown errors', async () => {
      mockApiClient.get.mockRejectedValue('String error');

      await expect(communityAPI.getFeed()).rejects.toThrow('Unknown error');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch community feed: Unknown error', {
        error: 'String error',
      });
    });

    it('should handle null/undefined errors', async () => {
      mockApiClient.get.mockRejectedValue(null);

      await expect(communityAPI.getFeed()).rejects.toThrow('Unknown error');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch community feed: Unknown error', {
        error: null,
      });
    });

    it('should preserve original error when it is an Error instance', async () => {
      const originalError = new Error('Original API error');
      mockApiClient.get.mockRejectedValue(originalError);

      await expect(communityAPI.getFeed()).rejects.toThrow('Original API error');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch community feed:', {
        error: 'Original API error',
        stack: originalError.stack,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(10000);
      const mockResponse = {
        success: true,
        post: { _id: 'post123', content: longContent },
        message: 'Post created',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.createPost({ content: longContent });

      expect(result.post.content).toBe(longContent);
    });

    it('should handle posts with many images', async () => {
      const manyImages = Array.from({ length: 20 }, (_, i) => `image${i}.jpg`);
      const mockResponse = {
        success: true,
        post: { _id: 'post123', images: manyImages },
        message: 'Post created',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.createPost({
        content: 'Post with many images',
        images: manyImages,
      });

      expect(result.post.images).toHaveLength(20);
    });

    it('should handle empty arrays and objects', async () => {
      const mockResponse = {
        success: true,
        posts: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        appliedFilters: { packId: null, userId: null, type: null, matchedCount: 0 },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await communityAPI.getFeed();

      expect(result.posts).toEqual([]);
      expect(result.appliedFilters.packId).toBeNull();
    });

    it('should handle special characters in content', async () => {
      const specialContent = 'Hello world! 🌍🚀 #community @user émojis & spëcial chärs';
      const mockResponse = {
        success: true,
        post: { _id: 'post123', content: specialContent },
        message: 'Post created',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await communityAPI.createPost({ content: specialContent });

      expect(result.post.content).toBe(specialContent);
    });

    it('should handle concurrent operations', async () => {
      const mockResponse = { success: true, message: 'Operation successful' };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const operations = [
        communityAPI.likePost('post1'),
        communityAPI.likePost('post2'),
        communityAPI.reportContent({
          type: 'post',
          targetId: 'post3',
          reason: 'spam',
        }),
        communityAPI.blockUser('user1'),
      ];

      const results = await Promise.all(operations);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(mockApiClient.post).toHaveBeenCalledTimes(4);
    });

    it('should handle malformed API responses', async () => {
      // Test with missing required fields
      const malformedResponse = { success: true }; // Missing posts, pagination, etc.
      mockApiClient.get.mockResolvedValue(malformedResponse);

      const result = await communityAPI.getFeed();

      expect(result).toEqual(malformedResponse);
    });

    it('should handle very large pagination values', async () => {
      const mockResponse = {
        success: true,
        posts: [],
        pagination: { page: 999999, limit: 1000, total: 1000000, pages: 1000 },
        appliedFilters: { packId: null, userId: null, type: null, matchedCount: 0 },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await communityAPI.getFeed({
        page: 999999,
        limit: 1000,
      });

      expect(result.pagination.page).toBe(999999);
      expect(result.pagination.total).toBe(1000000);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete post lifecycle', async () => {
      // Create post
      const createResponse = {
        success: true,
        post: { _id: 'post123', content: 'Test post' },
        message: 'Post created',
      };
      mockApiClient.post.mockResolvedValueOnce(createResponse);

      const createdPost = await communityAPI.createPost({ content: 'Test post' });
      expect(createdPost.post._id).toBe('post123');

      // Like post
      const likeResponse = {
        success: true,
        post: { _id: 'post123', likes: 1, liked: true },
        message: 'Post liked',
      };
      mockApiClient.post.mockResolvedValueOnce(likeResponse);

      const likedPost = await communityAPI.likePost('post123');
      expect(likedPost.post.liked).toBe(true);

      // Add comment
      const commentResponse = {
        success: true,
        comment: { _id: 'comment123', content: 'Great post!' },
        message: 'Comment added',
      };
      mockApiClient.post.mockResolvedValueOnce(commentResponse);

      const comment = await communityAPI.addComment('post123', { content: 'Great post!' });
      expect(comment.comment._id).toBe('comment123');

      // Get comments
      const commentsResponse = {
        success: true,
        comments: [{ _id: 'comment123', content: 'Great post!' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        postId: 'post123',
      };
      mockApiClient.get.mockResolvedValueOnce(commentsResponse);

      const comments = await communityAPI.getComments('post123');
      expect(comments.comments).toHaveLength(1);

      // Update post
      const updateResponse = {
        success: true,
        post: { _id: 'post123', content: 'Updated content' },
        message: 'Post updated',
      };
      mockApiClient.put.mockResolvedValueOnce(updateResponse);

      const updatedPost = await communityAPI.updatePost('post123', {
        content: 'Updated content',
      });
      expect(updatedPost.post.content).toBe('Updated content');

      // Delete post
      const deleteResponse = { success: true, message: 'Post deleted' };
      mockApiClient.delete.mockResolvedValueOnce(deleteResponse);

      const deleteResult = await communityAPI.deletePost('post123');
      expect(deleteResult.message).toBe('Post deleted');
    });

    it('should handle activity participation flow', async () => {
      // Join activity
      const joinResponse = {
        success: true,
        post: {
          _id: 'activity123',
          activityDetails: { attending: true, currentAttendees: 6 },
        },
        message: 'Joined activity',
      };
      mockApiClient.post.mockResolvedValueOnce(joinResponse);

      const joinResult = await communityAPI.joinActivity('activity123');
      expect(joinResult.post.activityDetails?.attending).toBe(true);

      // Leave activity
      const leaveResponse = {
        success: true,
        post: {
          _id: 'activity123',
          activityDetails: { attending: false, currentAttendees: 5 },
        },
        message: 'Left activity',
      };
      mockApiClient.post.mockResolvedValueOnce(leaveResponse);

      const leaveResult = await communityAPI.leaveActivity('activity123');
      expect(leaveResult.post.activityDetails?.attending).toBe(false);
    });

    it('should handle moderation workflow', async () => {
      // Report content
      const reportResponse = { success: true, message: 'Content reported' };
      mockApiClient.post.mockResolvedValueOnce(reportResponse);

      const reportResult = await communityAPI.reportContent({
        type: 'post',
        targetId: 'post123',
        reason: 'inappropriate',
        description: 'Contains harmful content',
      });
      expect(reportResult.message).toBe('Content reported');

      // Block user
      const blockResponse = { success: true, message: 'User blocked' };
      mockApiClient.post.mockResolvedValueOnce(blockResponse);

      const blockResult = await communityAPI.blockUser('user123');
      expect(blockResult.message).toBe('User blocked');
    });
  });
});
