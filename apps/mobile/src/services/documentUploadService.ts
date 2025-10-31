/**
 * Document Upload Service with Progress Tracking
 * Handles file uploads with progress callbacks and error handling
 */

import { logger } from '@pawfectmatch/core';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { api } from './api';
import { uploadAdapter } from './upload/index';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DocumentUploadResult {
  success: boolean;
  url: string;
  publicId?: string;
  documentId?: string;
  error?: string;
}

export interface DocumentUploadOptions {
  documentType: string;
  verificationType?: string;
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
}

class DocumentUploadService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  /**
   * Pick and upload a document with progress tracking
   */
  async uploadDocument(
    options: DocumentUploadOptions,
  ): Promise<DocumentUploadResult> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission denied');
      }

      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === 'ios' ? ['public.item'] : ['*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {
          success: false,
          url: '',
          error: 'Document picker was canceled',
        };
      }

      const file = result.assets[0];
      const fileUri = file.uri;

      // Validate file size
      if (file.size && file.size > this.MAX_FILE_SIZE) {
        const error = new Error(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
        options.onError?.(error);
        return {
          success: false,
          url: '',
          error: error.message,
        };
      }

      // Read file
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Get file content
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create progress tracker
      let uploadedBytes = 0;
      const totalBytes = file.size || 0;

      // Simulate progress (since we're using base64, actual progress tracking would require chunked upload)
      const progressInterval = setInterval(() => {
        if (uploadedBytes < totalBytes) {
          uploadedBytes += Math.min(totalBytes / 10, totalBytes - uploadedBytes);
          options.onProgress?.({
            loaded: uploadedBytes,
            total: totalBytes,
            percentage: Math.min(100, (uploadedBytes / totalBytes) * 100),
          });
        }
      }, 100);

      try {
        // Convert to blob for upload
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Upload using upload adapter
        let uploadResult;
        if (this.ALLOWED_IMAGE_TYPES.includes(file.mimeType || '')) {
          uploadResult = await uploadAdapter.uploadPhoto({
            uri: fileUri,
            name: file.name,
            contentType: file.mimeType,
          });
        } else {
          // For documents, we'll use the verification upload endpoint
          const formData = new FormData();
          formData.append('file', blob as any);
          formData.append('documentType', options.documentType);
          if (options.verificationType) {
            formData.append('verificationType', options.verificationType);
          }

          const apiResponse = await api.request('/verification/upload', {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (apiResponse.success && apiResponse.data) {
            uploadResult = {
              url: apiResponse.data.url,
              publicId: apiResponse.data.publicId,
            };
          } else {
            throw new Error(apiResponse.error || 'Upload failed');
          }
        }

        clearInterval(progressInterval);
        options.onProgress?.({
          loaded: totalBytes,
          total: totalBytes,
          percentage: 100,
        });

        logger.info('Document uploaded successfully', {
          documentType: options.documentType,
          url: uploadResult.url,
        });

        return {
          success: true,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        };
      } catch (uploadError) {
        clearInterval(progressInterval);
        const error = uploadError instanceof Error ? uploadError : new Error('Upload failed');
        options.onError?.(error);
        return {
          success: false,
          url: '',
          error: error.message,
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      options.onError?.(err);
      logger.error('Document upload error', { error: err });

      return {
        success: false,
        url: '',
        error: err.message,
      };
    }
  }

  /**
   * Upload multiple documents with progress tracking
   */
  async uploadMultipleDocuments(
    options: DocumentUploadOptions & { count: number },
  ): Promise<DocumentUploadResult[]> {
    const results: DocumentUploadResult[] = [];

    for (let i = 0; i < options.count; i++) {
      const result = await this.uploadDocument({
        ...options,
        onProgress: (progress) => {
          // Calculate overall progress
          const overallProgress = {
            loaded: progress.loaded + results.reduce((sum, r) => sum + (r as any).loaded || 0, 0),
            total: progress.total * options.count,
            percentage: ((i * 100 + progress.percentage) / options.count),
          };
          options.onProgress?.(overallProgress);
        },
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: { size?: number; mimeType?: string; name?: string }): {
    valid: boolean;
    error?: string;
  } {
    if (!file.size) {
      return { valid: false, error: 'File size unknown' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      };
    }

    if (file.mimeType && !this.ALLOWED_DOCUMENT_TYPES.includes(file.mimeType)) {
      return {
        valid: false,
        error: 'File type not allowed. Please upload PDF, JPG, PNG, or DOC files.',
      };
    }

    return { valid: true };
  }
}

export const documentUploadService = new DocumentUploadService();

