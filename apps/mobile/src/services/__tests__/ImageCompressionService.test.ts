/**
 * Comprehensive tests for ImageCompressionService
 *
 * Coverage:
 * - Image compression and resizing
 * - Batch compression operations
 * - Optimal compression settings by image type
 * - Specialized compression (avatar, pet, chat images)
 * - Image validation and file size checks
 * - Temp file cleanup
 * - Image dimensions retrieval
 * - Error handling and edge cases
 * - File size formatting utilities
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { imageCompression, ImageCompressionService } from '../ImageCompressionService';

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockImageManipulator = ImageManipulator as jest.Mocked<typeof ImageManipulator>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('ImageCompressionService', () => {
  let service: ImageCompressionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImageCompressionService();

    // Setup default mocks
    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      size: 2048000, // 2MB
      uri: 'file://test.jpg',
      isDirectory: false,
    });

    mockImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'file://compressed.jpg',
      width: 1920,
      height: 1080,
    });
  });

  describe('Single Image Compression', () => {
    it('should compress image with default options', async () => {
      const result = await service.compressImage('file://input.jpg');

      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('file://input.jpg');
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file://input.jpg',
        [{ resize: { width: 1920, height: 1920 } }],
        { compress: 0.8, format: 'jpeg' },
      );
      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('file://compressed.jpg');

      expect(result).toEqual({
        uri: 'file://compressed.jpg',
        width: 1920,
        height: 1080,
        size: 2048000,
        originalSize: 2048000,
        compressionRatio: 0,
      });
    });

    it('should compress image with custom options', async () => {
      const customOptions = {
        maxWidth: 1024,
        maxHeight: 768,
        quality: 0.6,
        format: 'png' as const,
        maintainAspectRatio: false,
      };

      await service.compressImage('file://input.png', customOptions);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file://input.png',
        [{ resize: { width: 1024, height: 768 } }],
        { compress: 0.6, format: 'png' },
      );
    });

    it('should calculate compression ratio correctly', async () => {
      // Original: 2MB, Compressed: 500KB
      mockFileSystem.getInfoAsync
        .mockResolvedValueOnce({ exists: true, size: 2097152, uri: '', isDirectory: false }) // 2MB
        .mockResolvedValueOnce({ exists: true, size: 524288, uri: '', isDirectory: false }); // 500KB

      const result = await service.compressImage('file://input.jpg');

      expect(result.compressionRatio).toBe(0.75); // (2MB - 500KB) / 2MB = 1.5MB / 2MB = 0.75
    });

    it('should handle compression errors', async () => {
      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Compression failed'));

      await expect(service.compressImage('file://input.jpg')).rejects.toThrow(
        'Failed to compress image',
      );
    });

    it('should handle file info errors', async () => {
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File not found'));

      await expect(service.compressImage('file://input.jpg')).rejects.toThrow(
        'Failed to compress image',
      );
    });
  });

  describe('Batch Image Compression', () => {
    it('should compress multiple images successfully', async () => {
      const uris = ['file://img1.jpg', 'file://img2.jpg', 'file://img3.jpg'];

      const results = await service.compressImages(uris);

      expect(results).toHaveLength(3);
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledTimes(3);
    });

    it('should continue processing when one image fails', async () => {
      mockImageManipulator.manipulateAsync
        .mockResolvedValueOnce({
          uri: 'file://compressed1.jpg',
          width: 1920,
          height: 1080,
        })
        .mockRejectedValueOnce(new Error('Failed to compress'))
        .mockResolvedValueOnce({
          uri: 'file://compressed3.jpg',
          width: 1920,
          height: 1080,
        });

      const uris = ['file://img1.jpg', 'file://img2.jpg', 'file://img3.jpg'];
      const results = await service.compressImages(uris);

      expect(results).toHaveLength(2); // Only successful compressions
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledTimes(3);
    });

    it('should handle empty batch', async () => {
      const results = await service.compressImages([]);

      expect(results).toEqual([]);
    });
  });

  describe('Optimal Compression Settings', () => {
    it('should return JPEG optimization settings', () => {
      const settings = service.getOptimalCompressionSettings('file://photo.jpg');

      expect(settings).toEqual({
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.75,
        format: 'jpeg',
      });
    });

    it('should return PNG optimization settings', () => {
      const settings = service.getOptimalCompressionSettings('file://image.png');

      expect(settings).toEqual({
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.9,
        format: 'png',
      });
    });

    it('should return default settings for unknown formats', () => {
      const settings = service.getOptimalCompressionSettings('file://image.webp');

      expect(settings).toEqual({
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        format: 'jpeg',
        maintainAspectRatio: true,
      });
    });

    it('should handle uppercase extensions', () => {
      const settings = service.getOptimalCompressionSettings('file://PHOTO.JPG');

      expect(settings.quality).toBe(0.75);
    });
  });

  describe('Specialized Compression Methods', () => {
    it('should compress avatar images with correct settings', async () => {
      await service.compressAvatarImage('file://avatar.jpg');

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file://avatar.jpg',
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.8, format: 'jpeg' },
      );
    });

    it('should compress pet images with optimal settings', async () => {
      await service.compressPetImage('file://pet.jpg');

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file://pet.jpg',
        [{ resize: { width: 1920, height: 1920 } }],
        { compress: 0.75, format: 'jpeg' },
      );
    });

    it('should compress chat images with smaller dimensions', async () => {
      await service.compressChatImage('file://chat.jpg');

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file://chat.jpg',
        [{ resize: { width: 1024, height: 1024 } }],
        { compress: 0.7, format: 'jpeg' },
      );
    });
  });

  describe('Image Validation', () => {
    it('should validate existing image file', async () => {
      const result = await service.validateImage('file://valid.jpg');

      expect(result).toEqual({ isValid: true });
    });

    it('should reject non-existent files', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: false,
        size: 0,
        uri: '',
        isDirectory: false,
      });

      const result = await service.validateImage('file://missing.jpg');

      expect(result).toEqual({
        isValid: false,
        error: 'Image file does not exist',
      });
    });

    it('should reject files that are too large', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        size: 25 * 1024 * 1024, // 25MB
        uri: '',
        isDirectory: false,
      });

      const result = await service.validateImage('file://toolarge.jpg');

      expect(result).toEqual({
        isValid: false,
        error: 'Image file is too large (max 20MB)',
      });
    });

    it('should reject unsupported file formats', async () => {
      const result = await service.validateImage('file://image.bmp');

      expect(result).toEqual({
        isValid: false,
        error: 'Unsupported image format',
      });
    });

    it('should accept all supported formats', async () => {
      const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      for (const format of supportedFormats) {
        const result = await service.validateImage(`file://image${format}`);
        expect(result.isValid).toBe(true);
      }
    });

    it('should handle validation errors gracefully', async () => {
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('Permission denied'));

      const result = await service.validateImage('file://invalid.jpg');

      expect(result).toEqual({
        isValid: false,
        error: 'Failed to validate image',
      });
    });
  });

  describe('Temp File Cleanup', () => {
    it('should cleanup temp images in cache/temp directories', async () => {
      const tempUris = [
        'file://cache/compressed1.jpg',
        'file://temp/image2.png',
        'file://ImageManipulator/result3.jpeg',
      ];

      await service.cleanupTempImages(tempUris);

      expect(mockFileSystem.deleteAsync).toHaveBeenCalledTimes(3);
      expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith('file://cache/compressed1.jpg', {
        idempotent: true,
      });
    });

    it('should not delete files outside temp/cache directories', async () => {
      const safeUris = ['file://documents/photo.jpg', 'file://downloads/image.png'];

      await service.cleanupTempImages(safeUris);

      expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      mockFileSystem.deleteAsync.mockRejectedValue(new Error('Delete failed'));

      const tempUri = ['file://cache/temp.jpg'];

      // Should not throw
      await expect(service.cleanupTempImages(tempUri)).resolves.not.toThrow();
    });
  });

  describe('Image Dimensions', () => {
    it('should get image dimensions successfully', async () => {
      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'file://original.jpg',
        width: 4000,
        height: 3000,
      });

      const dimensions = await service.getImageDimensions('file://input.jpg');

      expect(dimensions).toEqual({ width: 4000, height: 3000 });
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith('file://input.jpg', [], {
        format: 'jpeg',
      });
    });

    it('should return null when dimensions cannot be retrieved', async () => {
      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Invalid image'));

      const dimensions = await service.getImageDimensions('file://invalid.jpg');

      expect(dimensions).toBeNull();
    });
  });

  describe('File Size Formatting', () => {
    // Testing private method via instance
    it('should format file sizes correctly', () => {
      const formatMethod = (service as any).formatFileSize.bind(service);

      expect(formatMethod(0)).toBe('0 B');
      expect(formatMethod(512)).toBe('512 B');
      expect(formatMethod(1024)).toBe('1 KB');
      expect(formatMethod(1536)).toBe('1.5 KB');
      expect(formatMethod(1048576)).toBe('1 MB');
      expect(formatMethod(2147483648)).toBe('2 GB');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle compression with zero original size', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        size: 0,
        uri: '',
        isDirectory: false,
      });

      const result = await service.compressImage('file://empty.jpg');

      expect(result.compressionRatio).toBe(0);
    });

    it('should handle compression with non-existent compressed file', async () => {
      mockFileSystem.getInfoAsync
        .mockResolvedValueOnce({ exists: true, size: 1000000, uri: '', isDirectory: false })
        .mockResolvedValueOnce({ exists: false, size: 0, uri: '', isDirectory: false });

      const result = await service.compressImage('file://input.jpg');

      expect(result.size).toBe(0);
      expect(result.compressionRatio).toBe(0);
    });

    it('should handle batch compression with mixed results', async () => {
      mockImageManipulator.manipulateAsync
        .mockResolvedValueOnce({ uri: 'file://comp1.jpg', width: 100, height: 100 })
        .mockRejectedValueOnce(new Error('Compression failed'))
        .mockResolvedValueOnce({ uri: 'file://comp3.jpg', width: 100, height: 100 })
        .mockRejectedValueOnce(new Error('Compression failed'));

      const uris = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'];
      const results = await service.compressImages(uris);

      expect(results).toHaveLength(2);
    });

    it('should validate image with edge case file sizes', async () => {
      // Exactly 20MB should be valid
      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        size: 20 * 1024 * 1024,
        uri: '',
        isDirectory: false,
      });

      const result = await service.validateImage('file://exactly20mb.jpg');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Logging', () => {
    it('should log compression start and completion', async () => {
      const { logger } = require('@pawfectmatch/core');

      await service.compressImage('file://input.jpg');

      expect(logger.info).toHaveBeenCalledWith(
        'Starting image compression',
        expect.objectContaining({
          uri: expect.any(String),
          options: expect.any(Object),
        }),
      );

      expect(logger.info).toHaveBeenCalledWith(
        'Image compression completed',
        expect.objectContaining({
          originalSize: expect.any(String),
          compressedSize: expect.any(String),
          compressionRatio: expect.any(String),
          dimensions: expect.any(String),
        }),
      );
    });

    it('should log compression errors', async () => {
      const { logger } = require('@pawfectmatch/core');
      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Test error'));

      await expect(service.compressImage('file://input.jpg')).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        'Image compression failed',
        expect.objectContaining({
          error: expect.any(Error),
          imageUri: 'file://input.jpg',
        }),
      );
    });
  });
});
