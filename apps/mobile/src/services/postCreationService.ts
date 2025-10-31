/**
 * Post Creation Service
 * Handles post creation, image upload, and activity management
 */

import type { UploadProgress as BaseUploadProgress } from './enhancedUploadService';
import type { CreatePostRequest, ActivityDetails } from './communityAPI';

export type { CreatePostRequest, ActivityDetails };

export interface UploadProgress extends BaseUploadProgress {
  progress?: number;
  currentFile?: string;
}

/**
 * Post creation service
 * Provides utilities for creating posts with images and activities
 */
export const postCreationService = {
  /**
   * Validate post content before submission
   */
  validateContent(content: string): { valid: boolean; error?: string } {
    if (!content.trim()) {
      return { valid: false, error: 'Content is required' };
    }
    if (content.length > 5000) {
      return { valid: false, error: 'Content exceeds maximum length of 5000 characters' };
    }
    return { valid: true };
  },

  /**
   * Validate images before upload
   */
  validateImages(images: string[]): { valid: boolean; error?: string } {
    if (images.length > 5) {
      return { valid: false, error: 'Maximum 5 images allowed' };
    }
    return { valid: true };
  },

  /**
   * Create post request payload
   */
  createPostRequest(
    content: string,
    images: string[] = [],
    activityDetails?: ActivityDetails
  ): CreatePostRequest {
    return {
      content: content.trim(),
      images,
      ...(activityDetails && { activityDetails }),
    };
  },
};
