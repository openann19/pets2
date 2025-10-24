/**
 * Image Compression Service for PawfectMatch Mobile App
 * Provides client-side image resizing and compression before upload
 */
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { logger } from '@pawfectmatch/core';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png';
  maintainAspectRatio?: boolean;
}

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
}

class ImageCompressionService {
  private static readonly DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    format: 'jpeg',
    maintainAspectRatio: true,
  };

  /**
   * Compress and resize an image
   */
  async compressImage(
    imageUri: string,
    options: ImageCompressionOptions = {}
  ): Promise<CompressedImageResult> {
    try {
      const opts = { ...ImageCompressionService.DEFAULT_OPTIONS, ...options };

      logger.info('Starting image compression', {
        uri: imageUri.substring(0, 50) + '...',
        options: opts
      });

      // Get original file info
      const originalInfo = await FileSystem.getInfoAsync(imageUri);
      const originalSize = originalInfo.exists ? originalInfo.size : 0;

      // Perform image manipulation
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: opts.maxWidth,
              height: opts.maxHeight,
            },
          },
        ],
        {
          compress: opts.quality,
          format: opts.format === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Get compressed file info
      const compressedInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
      const compressedSize = compressedInfo.exists ? compressedInfo.size : 0;

      const compressionRatio = originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0;

      const result: CompressedImageResult = {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        size: compressedSize,
        originalSize,
        compressionRatio,
      };

      logger.info('Image compression completed', {
        originalSize: this.formatFileSize(originalSize),
        compressedSize: this.formatFileSize(compressedSize),
        compressionRatio: `${(compressionRatio * 100).toFixed(1)}%`,
        dimensions: `${String(manipulatedImage.width)}x${String(manipulatedImage.height)}`,
      });

      return result;
    } catch (error) {
      logger.error('Image compression failed', { error, imageUri });
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Compress multiple images in batch
   */
  async compressImages(
    imageUris: string[],
    options: ImageCompressionOptions = {}
  ): Promise<CompressedImageResult[]> {
    const results: CompressedImageResult[] = [];

    for (const uri of imageUris) {
      try {
        const result = await this.compressImage(uri, options);
        results.push(result);
      } catch (error) {
        logger.error('Failed to compress image in batch', { error, uri });
        // Continue with other images even if one fails
      }
    }

    return results;
  }

  /**
   * Get optimal compression settings based on image type
   */
  getOptimalCompressionSettings(imageUri: string): ImageCompressionOptions {
    // Check file extension or MIME type for optimization
    const isJpeg = imageUri.toLowerCase().includes('.jpg') || imageUri.toLowerCase().includes('.jpeg');
    const isPng = imageUri.toLowerCase().includes('.png');

    if (isJpeg) {
      // JPEGs can handle higher compression
      return {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.75,
        format: 'jpeg',
      };
    } else if (isPng) {
      // PNGs are lossless, but we can still resize
      return {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.9,
        format: 'png',
      };
    }

    // Default settings
    return ImageCompressionService.DEFAULT_OPTIONS;
  }

  /**
   * Compress image for avatar (smaller dimensions)
   */
  async compressAvatarImage(imageUri: string): Promise<CompressedImageResult> {
    return this.compressImage(imageUri, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.8,
      format: 'jpeg',
    });
  }

  /**
   * Compress image for pet photos (standard dimensions)
   */
  async compressPetImage(imageUri: string): Promise<CompressedImageResult> {
    return this.compressImage(imageUri, this.getOptimalCompressionSettings(imageUri));
  }

  /**
   * Compress image for chat messages (smaller for faster upload)
   */
  async compressChatImage(imageUri: string): Promise<CompressedImageResult> {
    return this.compressImage(imageUri, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.7,
      format: 'jpeg',
    });
  }

  /**
   * Validate image before compression
   */
  async validateImage(imageUri: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const info = await FileSystem.getInfoAsync(imageUri);

      if (!info.exists) {
        return { isValid: false, error: 'Image file does not exist' };
      }

      // Check file size (max 20MB)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (info.size > maxSize) {
        return { isValid: false, error: 'Image file is too large (max 20MB)' };
      }

      // Check if it's actually an image
      const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = supportedExtensions.some(ext =>
        imageUri.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        return { isValid: false, error: 'Unsupported image format' };
      }

      return { isValid: true };
    } catch (error) {
      logger.error('Image validation failed', { error, imageUri });
      return { isValid: false, error: 'Failed to validate image' };
    }
  }

  /**
   * Clean up temporary compressed images
   */
  async cleanupTempImages(imageUris: string[]): Promise<void> {
    for (const uri of imageUris) {
      try {
        // Only delete files that are in the cache/temp directory
        if (uri.includes('ImageManipulator') || uri.includes('temp') || uri.includes('cache')) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch (error) {
        logger.warn('Failed to cleanup temp image', { error, uri });
      }
    }
  }

  /**
   * Format file size in human readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizeUnit = sizes[Math.min(i, sizes.length - 1)] ?? 'B';

    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizeUnit}`;
  }

  /**
   * Get image dimensions without loading full image
   */
  async getImageDimensions(imageUri: string): Promise<{ width: number; height: number } | null> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [], // No manipulations
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      return {
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      logger.error('Failed to get image dimensions', { error, imageUri });
      return null;
    }
  }
}

// Create singleton instance
export const imageCompression = new ImageCompressionService();

// Export types and utilities
export default imageCompression;
