/**
 * Enhanced Upload Service - Mobile
 * 
 * Integrates uploadHygiene with API uploads, providing a complete
 * upload-to-moderation pipeline with progress tracking and error handling.
 */

import { 
  processImageForUpload, 
  ProcessedImage,
  checkUploadQuota,
  uploadWithRetry 
} from './uploadHygiene';
import { api } from './api';
import logger from '../utils/logger';

export interface UploadProgress {
  phase: 'presign' | 'upload' | 'register' | 'analyze' | 'pending' | 'approved' | 'rejected';
  percent: number;
  message?: string;
}

export interface UploadResult {
  uploadId: string;
  s3Key: string;
  url: string;
  status: string;
  analysis?: any;
}

/**
 * Complete upload flow from image processing to API registration
 */
export class EnhancedUploadService {
  private static instance: EnhancedUploadService;

  private constructor() {}

  static getInstance(): EnhancedUploadService {
    if (!EnhancedUploadService.instance) {
      EnhancedUploadService.instance = new EnhancedUploadService();
    }
    return EnhancedUploadService.instance;
  }

  /**
   * Upload a processed image through the complete pipeline
   */
  async uploadProcessedImage(
    processedImage: ProcessedImage,
    type: 'profile' | 'pet' | 'verification' = 'pet',
    petId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // 1. Presign
      if (onProgress) {
        onProgress({ phase: 'presign', percent: 10, message: 'Requesting upload URL...' });
      }

      const presignResponse = await api.post('/uploads/photos/presign', {
        contentType: processedImage.mimeType,
        filename: `photo-${Date.now()}.jpg`,
      });

      const { key, url, headers } = presignResponse.data.data;

      // 2. Upload to S3
      if (onProgress) {
        onProgress({ phase: 'upload', percent: 30, message: 'Uploading to secure storage...' });
      }

      // Upload file to presigned URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: headers || {
          'Content-Type': processedImage.mimeType,
        },
        body: await this.fileUriToBlob(processedImage.uri),
      });

      if (!uploadResponse.ok) {
        throw new Error('S3 upload failed');
      }

      // 3. Register upload
      if (onProgress) {
        onProgress({ phase: 'register', percent: 60, message: 'Registering upload...' });
      }

      const idempotencyKey = `upload-${Date.now()}-${Math.random()}`;

      const registerResponse = await api.post('/uploads', {
        key,
        type,
        petId,
        contentType: processedImage.mimeType,
        bytes: processedImage.fileSize,
        idempotencyKey,
      });

      const upload = registerResponse.data.data.upload;

      if (onProgress) {
        onProgress({ phase: 'analyze', percent: 80, message: 'Analyzing photo...' });
      }

      // 4. Trigger analysis (optional, async by default)
      if (onProgress) {
        onProgress({ phase: 'pending', percent: 90, message: 'Awaiting moderation...' });
      }

      return {
        uploadId: upload._id || upload.id,
        s3Key: upload.s3Key || key,
        url: upload.url || `https://s3.amazonaws.com/${process.env.AWS_BUCKET}/${key}`,
        status: upload.status || 'pending',
        analysis: undefined,
      };
    } catch (error) {
      logger.error('Upload failed:', error);
      throw error;
    }
  }

  /**
   * Complete upload flow from image picker
   */
  async uploadFromPicker(
    options?: {
      maxDimension?: number;
      quality?: number;
      type?: 'profile' | 'pet' | 'verification';
      petId?: string;
      allowEditing?: boolean;
      useCamera?: boolean;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const opts = {
      maxDimension: options?.maxDimension || 2048,
      quality: options?.quality || 0.9,
      type: options?.type || 'pet',
      allowEditing: options?.allowEditing ?? true,
      useCamera: options?.useCamera ?? false,
    };

    try {
      // Check quota
      const quota = await checkUploadQuota('current-user-id'); // TODO: Get from auth
      if (!quota.allowed) {
        throw new Error('Upload quota exceeded');
      }

      // Process image
      const { pickAndProcessImage, captureAndProcessImage } = await import('./uploadHygiene');
      
      const processed = opts.useCamera
        ? await captureAndProcessImage({ 
            maxDimension: opts.maxDimension,
            quality: opts.quality,
          })
        : await pickAndProcessImage(opts.allowEditing, {
            maxDimension: opts.maxDimension,
            quality: opts.quality,
          });

      if (!processed) {
        throw new Error('No image selected');
      }

      // Upload
      return await this.uploadProcessedImage(
        processed,
        opts.type,
        options?.petId,
        onProgress
      );
    } catch (error) {
      logger.error('Upload from picker failed:', error);
      throw error;
    }
  }

  /**
   * Poll upload status until completion
   */
  async pollUploadStatus(
    uploadId: string,
    maxAttempts = 10,
    intervalMs = 1000
  ): Promise<UploadResult> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await api.get(`/uploads/${uploadId}`);
      const { upload, analysis } = response.data.data;

      if (upload.status === 'approved') {
        return {
          uploadId,
          s3Key: upload.s3Key,
          url: upload.url,
          status: 'approved',
          analysis,
        };
      }

      if (upload.status === 'rejected') {
        throw new Error(`Upload rejected: ${upload.flagReason || 'Unknown reason'}`);
      }

      // Still processing
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Upload status polling timeout');
  }

  /**
   * Batch upload multiple photos
   */
  async uploadBatch(
    photos: ProcessedImage[],
    type: 'profile' | 'pet' | 'verification' = 'pet',
    petId?: string,
    onProgress?: (index: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      if (onProgress) {
        onProgress(i, { phase: 'presign', percent: 0, message: `Processing photo ${i + 1}/${photos.length}` });
      }

      try {
        const result = await this.uploadProcessedImage(
          photo,
          type,
          petId,
          (progress) => {
            if (onProgress) {
              onProgress(i, progress);
            }
          }
        );
        results.push(result);
      } catch (error) {
        logger.error(`Batch upload failed for photo ${i + 1}:`, error);
        // Continue with other photos
      }
    }

    return results;
  }

  /**
   * Check if upload is duplicate
   */
  async checkDuplicate(uploadId: string): Promise<{ isDuplicate: boolean; similarImages?: string[] }> {
    try {
      const response = await api.get(`/uploads/${uploadId}/duplicate-check`);
      return response.data.data;
    } catch (error) {
      logger.error('Duplicate check failed:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Helper: Convert file URI to blob for fetch upload
   */
  private async fileUriToBlob(uri: string): Promise<Blob> {
    const FileSystem = await import('expo-file-system');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }

  /**
   * Retry failed upload with exponential backoff
   */
  async retryUpload(
    processedImage: ProcessedImage,
    type: 'profile' | 'pet' | 'verification' = 'pet',
    petId?: string,
    maxRetries = 3
  ): Promise<UploadResult> {
    return uploadWithRetry(
      () => this.uploadProcessedImage(processedImage, type, petId),
      maxRetries,
      1000
    );
  }
}

export default EnhancedUploadService.getInstance();

