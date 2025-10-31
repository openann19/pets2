/**
 * Post Creation Service
 * Handles post creation and upload progress
 */

export interface UploadProgress {
  progress: number;
  uploaded: number;
  total: number;
  currentFile?: number;
  totalFiles?: number;
}

export interface PostCreationData {
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  [key: string]: unknown;
}

export class PostCreationService {
  /**
   * Create a post with progress tracking
   */
  async createPost(
    data: unknown,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<unknown> {
    // Stub implementation
    return Promise.resolve({});
  }

  /**
   * Upload media for a post
   */
  async uploadMedia(
    uri: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    // Stub implementation
    return Promise.resolve(uri);
  }
}

export const postCreationService = new PostCreationService();
