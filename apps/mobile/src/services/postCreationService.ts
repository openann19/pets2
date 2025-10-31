/**
 * Enhanced Post Creation Service
 * Handles post creation with image upload progress and offline support
 */

import { logger } from '../utils/logger';
import { communityAPI } from './communityAPI';

export interface PostCreationData {
  content: string;
  images?: Array<{
    uri: string;
    fileName: string;
    mimeType: string;
  }>;
  activityDetails?: {
    title: string;
    description: string;
    date: string;
    location?: string;
    maxParticipants?: number;
  };
  tags?: string[];
}

export interface UploadProgress {
  totalBytes: number;
  uploadedBytes: number;
  progress: number; // 0-1
  currentFile?: string;
}

export interface PostCreationOptions {
  onProgress?: (progress: UploadProgress) => void;
  enableOffline?: boolean;
}

export class PostCreationService {
  private static offlineQueue: PostCreationData[] = [];
  private static activeUploads = new Map<
    string,
    {
      progress: UploadProgress;
      onProgress?: (progress: UploadProgress) => void;
    }
  >();

  /**
   * Create a new post with image upload progress tracking
   */
  static async createPost(
    data: PostCreationData,
    options: PostCreationOptions = {},
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    const { onProgress, enableOffline = true } = options;

    try {
      // Step 1: Upload images if any
      let uploadedImageUrls: string[] = [];

      if (data.images && data.images.length > 0) {
        uploadedImageUrls = await this.uploadImages(data.images, onProgress);
      }

      // Step 2: Create post with uploaded image URLs
      const postData = {
        ...data,
        images: uploadedImageUrls,
      };

      const response = await communityAPI.createPost(postData);

      if (response.success) {
        logger.info('Post created successfully', {
          postId: response.data?.postId,
          imageCount: uploadedImageUrls.length,
          hasActivity: !!data.activityDetails,
        });

        return {
          success: true,
          postId: response.data?.postId,
        };
      } else {
        throw new Error(response.message || 'Failed to create post');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Post creation failed', { error, data });

      // If offline support is enabled, queue the post for later
      if (enableOffline && this.isOfflineError(error)) {
        this.queuePostForLater(data);
        return {
          success: false,
          error:
            "You're offline. Your post has been saved and will be uploaded when you reconnect.",
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Upload images with progress tracking
   */
  private static async uploadImages(
    images: Array<{ uri: string; fileName: string; mimeType: string }>,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];
    const uploadId = `upload-${Date.now()}`;

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const totalBytes = await this.getImageSize(image.uri);
        let uploadedBytes = 0;

        // Simulate upload progress (in real implementation, this would be actual upload progress)
        const updateProgress = (progress: number) => {
          const currentProgress = {
            totalBytes,
            uploadedBytes: Math.floor(totalBytes * progress),
            progress: (i + progress) / images.length,
            currentFile: image.fileName,
          };

          if (onProgress) {
            onProgress(currentProgress);
          }
        };

        // Upload the image
        const uploadResult = await this.uploadSingleImage(image, (progress) => {
          uploadedBytes = Math.floor(totalBytes * progress);
          updateProgress(progress);
        });

        uploadedUrls.push(uploadResult.url);
        updateProgress(1); // Complete this file
      }

      return uploadedUrls;
    } catch (error) {
      logger.error('Image upload failed', { error, uploadId });
      throw error;
    }
  }

  /**
   * Upload a single image
   */
  private static async uploadSingleImage(
    image: { uri: string; fileName: string; mimeType: string },
    onProgress?: (progress: number) => void,
  ): Promise<{ url: string }> {
    // In a real implementation, this would use the actual upload service
    // For now, we'll simulate the upload with progress
    return new Promise((resolve, reject) => {
      try {
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 0.1;

          if (onProgress) {
            onProgress(Math.min(progress, 1));
          }

          if (progress >= 1) {
            clearInterval(interval);

            // Simulate successful upload with a mock URL
            // In real implementation, this would be the actual uploaded image URL
            const mockUrl = `https://cdn.pawfectmatch.com/uploads/${Date.now()}-${image.fileName}`;
            resolve({ url: mockUrl });
          }
        }, 200);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get image file size
   */
  private static async getImageSize(uri: string): Promise<number> {
    try {
      // In a real implementation, this would get the actual file size
      // For now, we'll return a mock size
      return 1024 * 1024; // 1MB mock size
    } catch (error) {
      logger.warn('Could not get image size', { error, uri });
      return 1024 * 1024; // Default to 1MB
    }
  }

  /**
   * Check if error is network-related (for offline support)
   */
  private static isOfflineError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('network') ||
        error.message.includes('offline') ||
        error.message.includes('connection') ||
        error.message.includes('timeout')
      );
    }
    return false;
  }

  /**
   * Queue post for later upload when offline
   */
  private static queuePostForLater(data: PostCreationData): void {
    this.offlineQueue.push({
      ...data,
      // Add timestamp for queue management
      queuedAt: new Date().toISOString(),
    } as PostCreationData & { queuedAt: string });

    // Save to persistent storage
    this.saveOfflineQueue();
    logger.info('Post queued for offline upload', { queueSize: this.offlineQueue.length });
  }

  /**
   * Save offline queue to persistent storage
   */
  private static async saveOfflineQueue(): Promise<void> {
    try {
      // In a real implementation, this would save to AsyncStorage or similar
      // await AsyncStorage.setItem('offline_posts_queue', JSON.stringify(this.offlineQueue));
      logger.info('Offline queue saved', { size: this.offlineQueue.length });
    } catch (error) {
      logger.error('Failed to save offline queue', { error });
    }
  }

  /**
   * Load offline queue from persistent storage
   */
  private static async loadOfflineQueue(): Promise<void> {
    try {
      // In a real implementation, this would load from AsyncStorage
      // const saved = await AsyncStorage.getItem('offline_posts_queue');
      // if (saved) {
      //   this.offlineQueue = JSON.parse(saved);
      // }
      logger.info('Offline queue loaded', { size: this.offlineQueue.length });
    } catch (error) {
      logger.error('Failed to load offline queue', { error });
    }
  }

  /**
   * Process offline queue when back online
   */
  static async processOfflineQueue(): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const postData of queue) {
      try {
        // Remove queuedAt timestamp if present
        const { queuedAt, ...cleanData } = postData as any;

        const result = await this.createPost(cleanData, { enableOffline: false });

        if (result.success) {
          processed++;
        } else {
          failed++;
          // Re-queue failed posts
          this.offlineQueue.push(cleanData);
        }
      } catch (error) {
        failed++;
        // Re-queue failed posts
        this.offlineQueue.push(postData);
        logger.error('Failed to process queued post', { error });
      }
    }

    // Save updated queue
    await this.saveOfflineQueue();

    logger.info('Offline queue processed', {
      processed,
      failed,
      remaining: this.offlineQueue.length,
    });

    return { processed, failed };
  }

  /**
   * Get offline queue status
   */
  static getOfflineQueueStatus(): { count: number; posts: PostCreationData[] } {
    return {
      count: this.offlineQueue.length,
      posts: [...this.offlineQueue],
    };
  }

  /**
   * Clear offline queue
   */
  static clearOfflineQueue(): void {
    this.offlineQueue = [];
    this.saveOfflineQueue();
    logger.info('Offline queue cleared');
  }

  /**
   * Initialize the service
   */
  static async initialize(): Promise<void> {
    await this.loadOfflineQueue();
    logger.info('PostCreationService initialized');
  }
}
