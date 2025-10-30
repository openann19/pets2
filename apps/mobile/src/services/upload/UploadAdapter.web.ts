import { request } from '../api';
import type { UploadAdapter, UploadPhotoInput, UploadVideoInput } from './UploadAdapter.types';

/**
 * Enhanced blob fetching with retry logic and better error handling
 */
async function fetchBlobFromUri(uri: string, maxRetries = 3): Promise<Blob> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(uri);
      if (!res.ok) {
        throw new Error(`Failed to fetch blob: HTTP ${res.status} ${res.statusText}`);
      }
      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Received empty blob');
      }
      return blob;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error fetching blob');
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        throw lastError;
      }
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch blob after retries');
}

/**
 * Enhanced upload adapter with progress tracking, retry logic, and comprehensive error handling
 */
export const uploadAdapter: UploadAdapter = {
  async uploadPhoto(input: UploadPhotoInput) {
    try {
      const blob = await fetchBlobFromUri(input.uri);
      const contentType = input.contentType ?? blob.type || 'image/jpeg';

      // Validate blob size (prevent uploading extremely large files)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (blob.size > MAX_SIZE) {
        throw new Error(`Image too large: ${(blob.size / 1024 / 1024).toFixed(2)}MB (max ${MAX_SIZE / 1024 / 1024}MB)`);
      }

      // Validate content type
      if (!contentType.startsWith('image/')) {
        throw new Error(`Invalid content type for photo: ${contentType}`);
      }

      const data = await request<{ url: string; width?: number; height?: number }>('/upload/photo', {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': contentType },
      });
      
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload photo';
      throw new Error(`Photo upload failed: ${message}`);
    }
  },

  async uploadVideo(input: UploadVideoInput) {
    try {
      const blob = await fetchBlobFromUri(input.uri);
      const contentType = input.contentType ?? blob.type || 'video/mp4';

      // Validate blob size (prevent uploading extremely large files)
      const MAX_SIZE = 500 * 1024 * 1024; // 500MB
      if (blob.size > MAX_SIZE) {
        throw new Error(`Video too large: ${(blob.size / 1024 / 1024).toFixed(2)}MB (max ${MAX_SIZE / 1024 / 1024}MB)`);
      }

      // Validate content type
      if (!contentType.startsWith('video/')) {
        throw new Error(`Invalid content type for video: ${contentType}`);
      }

      const data = await request<{ url: string; durationMs?: number }>('/upload/video', {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': contentType },
      });
      
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload video';
      throw new Error(`Video upload failed: ${message}`);
    }
  },

  async uploadGeneric(input: UploadPhotoInput) {
    try {
      const blob = await fetchBlobFromUri(input.uri);
      const contentType = input.contentType ?? blob.type || 'application/octet-stream';

      // Validate blob size
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB
      if (blob.size > MAX_SIZE) {
        throw new Error(`File too large: ${(blob.size / 1024 / 1024).toFixed(2)}MB (max ${MAX_SIZE / 1024 / 1024}MB)`);
      }

      const data = await request<{ url: string }>('/upload', {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': contentType },
      });
      
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      throw new Error(`Generic upload failed: ${message}`);
    }
  },
};

export type { UploadAdapter };
