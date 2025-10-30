/**
 * Comprehensive tests for EnhancedUploadService
 *
 * Coverage:
 * - Complete upload pipeline from processing to registration
 * - Progress tracking and callbacks
 * - Batch upload operations
 * - Upload status polling
 * - Duplicate checking
 * - Retry logic with backoff
 * - Error handling and recovery
 * - File URI to blob conversion
 * - Quota checking integration
 * - Singleton pattern
 * - Concurrent operations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as FileSystem from 'expo-file-system';
import {
  EnhancedUploadService,
  type ProcessedImage,
  type UploadProgress,
} from '../enhancedUploadService';

// Mock dependencies
jest.mock('../uploadHygiene', () => ({
  processImageForUpload: jest.fn(),
  checkUploadQuota: jest.fn(),
  uploadWithRetry: jest.fn(),
  pickAndProcessImage: jest.fn(),
  captureAndProcessImage: jest.fn(),
}));

jest.mock('../api', () => ({
  api: {
    presignPhoto: jest.fn(),
  },
  request: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  EncodingType: {
    Base64: 'base64',
    UTF8: 'utf8',
  },
  readAsStringAsync: jest.fn(),
}));

import {
  processImageForUpload,
  checkUploadQuota,
  uploadWithRetry,
  pickAndProcessImage,
  captureAndProcessImage,
} from '../uploadHygiene';
import { api, request } from '../api';

const mockApi = api as jest.Mocked<typeof api>;
const mockRequest = request as jest.MockedFunction<typeof request>;
const mockProcessImageForUpload = processImageForUpload as jest.MockedFunction<
  typeof processImageForUpload
>;
const mockCheckUploadQuota = checkUploadQuota as jest.MockedFunction<typeof checkUploadQuota>;
const mockUploadWithRetry = uploadWithRetry as jest.MockedFunction<typeof uploadWithRetry>;
const mockPickAndProcessImage = pickAndProcessImage as jest.MockedFunction<
  typeof pickAndProcessImage
>;
const mockCaptureAndProcessImage = captureAndProcessImage as jest.MockedFunction<
  typeof captureAndProcessImage
>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('EnhancedUploadService', () => {
  let service: EnhancedUploadService;
  let mockProcessedImage: ProcessedImage;
  let mockProgressCallback: jest.MockedFunction<(progress: UploadProgress) => void>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton
    (EnhancedUploadService as any).instance = undefined;

    service = EnhancedUploadService.getInstance();

    mockProcessedImage = {
      uri: 'file://test-image.jpg',
      width: 1024,
      height: 768,
      fileSize: 256000,
      mimeType: 'image/jpeg',
      metadata: {
        originalWidth: 2048,
        originalHeight: 1536,
        orientationFixed: true,
        exifStripped: true,
      },
    };

    mockProgressCallback = jest.fn();

    // Setup default mocks
    mockApi.presignPhoto.mockResolvedValue({
      key: 'test-key-123',
      url: 'https://s3.amazonaws.com/test-bucket/test-key-123',
    });

    mockFetch.mockResolvedValue({
      ok: true,
    } as any);

    mockRequest.mockResolvedValue({
      data: {
        upload: {
          _id: 'upload-123',
          s3Key: 'test-key-123',
          url: 'https://cdn.example.com/test-key-123',
          status: 'pending',
        },
      },
    });

    mockFileSystem.readAsStringAsync.mockResolvedValue('base64data');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EnhancedUploadService.getInstance();
      const instance2 = EnhancedUploadService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(service);
    });

    it('should maintain state across calls', () => {
      // This is implicit in the singleton pattern
      expect(service).toBeDefined();
    });
  });

  describe('uploadProcessedImage', () => {
    it('should complete full upload pipeline successfully', async () => {
      const result = await service.uploadProcessedImage(
        mockProcessedImage,
        'pet',
        'pet-123',
        mockProgressCallback,
      );

      expect(result).toEqual({
        uploadId: 'upload-123',
        s3Key: 'test-key-123',
        url: 'https://cdn.example.com/test-key-123',
        status: 'pending',
        analysis: undefined,
      });

      // Check progress callbacks
      expect(mockProgressCallback).toHaveBeenCalledWith({
        phase: 'presign',
        percent: 10,
        message: 'Requesting upload URL...',
      });

      expect(mockProgressCallback).toHaveBeenCalledWith({
        phase: 'upload',
        percent: 30,
        message: 'Uploading to secure storage...',
      });

      expect(mockProgressCallback).toHaveBeenCalledWith({
        phase: 'register',
        percent: 60,
        message: 'Registering upload...',
      });

      expect(mockProgressCallback).toHaveBeenCalledWith({
        phase: 'analyze',
        percent: 80,
        message: 'Analyzing photo...',
      });

      expect(mockProgressCallback).toHaveBeenCalledWith({
        phase: 'pending',
        percent: 90,
        message: 'Awaiting moderation...',
      });
    });

    it('should handle different upload types', async () => {
      const types: Array<'profile' | 'pet' | 'verification'> = ['profile', 'pet', 'verification'];

      for (const type of types) {
        mockRequest.mockResolvedValueOnce({
          data: {
            upload: {
              _id: `upload-${type}`,
              s3Key: `key-${type}`,
              url: `url-${type}`,
              status: 'pending',
            },
          },
        });

        const result = await service.uploadProcessedImage(mockProcessedImage, type);

        expect(mockRequest).toHaveBeenCalledWith('/uploads', {
          method: 'POST',
          body: expect.objectContaining({ type }),
        });

        expect(result.uploadId).toBe(`upload-${type}`);
      }
    });

    it('should work without progress callback', async () => {
      const result = await service.uploadProcessedImage(mockProcessedImage);

      expect(result).toBeDefined();
      expect(mockProgressCallback).not.toHaveBeenCalled();
    });

    it('should handle presign failure', async () => {
      mockApi.presignPhoto.mockRejectedValue(new Error('Presign failed'));

      await expect(service.uploadProcessedImage(mockProcessedImage)).rejects.toThrow(
        'Presign failed',
      );
    });

    it('should handle S3 upload failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as any);

      await expect(service.uploadProcessedImage(mockProcessedImage)).rejects.toThrow(
        'S3 upload failed',
      );
    });

    it('should handle registration failure', async () => {
      mockRequest.mockRejectedValue(new Error('Registration failed'));

      await expect(service.uploadProcessedImage(mockProcessedImage)).rejects.toThrow(
        'Registration failed',
      );
    });

    it('should handle file URI to blob conversion', async () => {
      // This is tested implicitly through the upload process
      // The fileUriToBlob method should be called during upload
      await service.uploadProcessedImage(mockProcessedImage);

      expect(mockFileSystem.readAsStringAsync).toHaveBeenCalledWith(mockProcessedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: expect.any(Blob),
        }),
      );
    });

    it('should handle missing optional fields in response', async () => {
      mockRequest.mockResolvedValue({
        data: {
          upload: {
            // Missing id, s3Key, url
            status: 'approved',
          },
        },
      });

      const result = await service.uploadProcessedImage(mockProcessedImage);

      expect(result).toEqual({
        uploadId: '',
        s3Key: 'test-key-123', // Falls back to presigned key
        url: expect.stringContaining('s3.amazonaws.com'), // Falls back to constructed URL
        status: 'approved',
        analysis: undefined,
      });
    });

    it('should handle large file uploads', async () => {
      const largeImage = {
        ...mockProcessedImage,
        fileSize: 10 * 1024 * 1024, // 10MB
      };

      const result = await service.uploadProcessedImage(largeImage);

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('uploadFromPicker', () => {
    it('should complete full pipeline from picker', async () => {
      mockCheckUploadQuota.mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetAt: new Date(),
        limit: 10,
      });

      mockPickAndProcessImage.mockResolvedValue(mockProcessedImage);

      const result = await service.uploadFromPicker(
        {
          type: 'profile',
          petId: 'pet-456',
          allowEditing: false,
          useCamera: false,
        },
        mockProgressCallback,
      );

      expect(mockCheckUploadQuota).toHaveBeenCalledWith('current-user-id');
      expect(mockPickAndProcessImage).toHaveBeenCalledWith(false, {
        maxDimension: 2048,
        quality: 0.9,
      });

      expect(result).toBeDefined();
    });

    it('should use camera when specified', async () => {
      mockCheckUploadQuota.mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetAt: new Date(),
        limit: 10,
      });

      mockCaptureAndProcessImage.mockResolvedValue(mockProcessedImage);

      await service.uploadFromPicker({
        useCamera: true,
      });

      expect(mockCaptureAndProcessImage).toHaveBeenCalledWith({
        maxDimension: 2048,
        quality: 0.9,
      });

      expect(mockPickAndProcessImage).not.toHaveBeenCalled();
    });

    it('should handle quota exceeded', async () => {
      mockCheckUploadQuota.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
        limit: 10,
      });

      await expect(service.uploadFromPicker()).rejects.toThrow('Upload quota exceeded');
    });

    it('should handle image picker cancellation', async () => {
      mockCheckUploadQuota.mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetAt: new Date(),
        limit: 10,
      });

      mockPickAndProcessImage.mockResolvedValue(null);

      await expect(service.uploadFromPicker()).rejects.toThrow('No image selected');
    });

    it('should use default options when not provided', async () => {
      mockCheckUploadQuota.mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetAt: new Date(),
        limit: 10,
      });

      mockPickAndProcessImage.mockResolvedValue(mockProcessedImage);

      await service.uploadFromPicker();

      expect(mockPickAndProcessImage).toHaveBeenCalledWith(true, {
        maxDimension: 2048,
        quality: 0.9,
      });
    });

    it('should handle quota check failure', async () => {
      mockCheckUploadQuota.mockRejectedValue(new Error('Quota service unavailable'));

      await expect(service.uploadFromPicker()).rejects.toThrow('Quota service unavailable');
    });
  });

  describe('pollUploadStatus', () => {
    it('should poll until approved status', async () => {
      const approvedResponse = {
        data: {
          upload: {
            s3Key: 'approved-key',
            url: 'approved-url',
            status: 'approved',
          },
          analysis: { safety: 'safe', labels: ['dog'] },
        },
      };

      mockRequest.mockResolvedValue(approvedResponse);

      const result = await service.pollUploadStatus('upload-123', 5, 100);

      expect(result).toEqual({
        uploadId: 'upload-123',
        s3Key: 'approved-key',
        url: 'approved-url',
        status: 'approved',
        analysis: approvedResponse.data.analysis,
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle rejected status', async () => {
      mockRequest.mockResolvedValue({
        data: {
          upload: {
            status: 'rejected',
            flagReason: 'Inappropriate content',
          },
        },
      });

      await expect(service.pollUploadStatus('upload-123')).rejects.toThrow(
        'Upload rejected: Inappropriate content',
      );
    });

    it('should poll multiple times for pending status', async () => {
      // First 2 calls return pending
      mockRequest.mockResolvedValueOnce({
        data: { upload: { status: 'pending' } },
      });
      mockRequest.mockResolvedValueOnce({
        data: { upload: { status: 'analyzing' } },
      });
      // Third call returns approved
      mockRequest.mockResolvedValueOnce({
        data: {
          upload: {
            s3Key: 'final-key',
            url: 'final-url',
            status: 'approved',
          },
        },
      });

      // Use real timers with fast intervals for reliable async behavior
      const result = await service.pollUploadStatus('upload-123', 5, 10);

      expect(result.status).toBe('approved');
      expect(mockRequest).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should timeout after max attempts', async () => {
      mockRequest.mockResolvedValue({
        data: { upload: { status: 'pending' } },
      });

      // Use real timers with fast intervals
      await expect(service.pollUploadStatus('upload-123', 3, 10)).rejects.toThrow(
        'Upload status polling timeout',
      );

      expect(mockRequest).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should handle API errors during polling', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network error'));
      mockRequest.mockResolvedValueOnce({
        data: { upload: { status: 'approved' } },
      });

      const result = await service.pollUploadStatus('upload-123', 3, 10);

      expect(result.status).toBe('approved');
      // Should continue polling despite error
    });

    it('should use default polling parameters', async () => {
      mockRequest.mockResolvedValue({
        data: { upload: { status: 'approved' } },
      });

      await service.pollUploadStatus('upload-123');

      expect(mockRequest).toHaveBeenCalledWith('/uploads/upload-123', {
        method: 'GET',
      });
    });
  });

  describe('uploadBatch', () => {
    it('should upload multiple images successfully', async () => {
      const images = [
        { ...mockProcessedImage, uri: 'image1.jpg' },
        { ...mockProcessedImage, uri: 'image2.jpg' },
        { ...mockProcessedImage, uri: 'image3.jpg' },
      ];

      const mockProgressCallback = jest.fn();

      const results = await service.uploadBatch(images, 'pet', 'pet-123', mockProgressCallback);

      expect(results).toHaveLength(3);
      expect(mockProgressCallback).toHaveBeenCalledTimes(3);

      // Check progress callbacks for each image
      expect(mockProgressCallback).toHaveBeenCalledWith(0, {
        phase: 'presign',
        percent: 0,
        message: 'Processing photo 1/3',
      });

      expect(mockProgressCallback).toHaveBeenCalledWith(1, {
        phase: 'presign',
        percent: 0,
        message: 'Processing photo 2/3',
      });

      expect(mockProgressCallback).toHaveBeenCalledWith(2, {
        phase: 'presign',
        percent: 0,
        message: 'Processing photo 3/3',
      });
    });

    it('should handle partial failures in batch upload', async () => {
      const images = [
        mockProcessedImage,
        { ...mockProcessedImage, uri: 'fail-image.jpg' },
        mockProcessedImage,
      ];

      // Make second upload fail
      mockFetch.mockResolvedValueOnce({ ok: true } as any);
      mockRequest.mockResolvedValueOnce({ data: { upload: { _id: 'upload1' } } });

      mockFetch.mockResolvedValueOnce({ ok: false } as any); // Second upload fails

      mockFetch.mockResolvedValueOnce({ ok: true } as any);
      mockRequest.mockResolvedValueOnce({ data: { upload: { _id: 'upload3' } } });

      const results = await service.uploadBatch(images);

      expect(results).toHaveLength(2); // Only successful uploads
      expect(results[0].uploadId).toBe('upload1');
      expect(results[1].uploadId).toBe('upload3');
    });

    it('should work without progress callback', async () => {
      const images = [mockProcessedImage];

      const results = await service.uploadBatch(images);

      expect(results).toHaveLength(1);
    });

    it('should handle empty batch', async () => {
      const results = await service.uploadBatch([]);

      expect(results).toEqual([]);
    });
  });

  describe('checkDuplicate', () => {
    it('should check for duplicate uploads', async () => {
      const mockResponse = {
        data: {
          isDuplicate: true,
          similarImages: ['similar1.jpg', 'similar2.jpg'],
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await service.checkDuplicate('upload-123');

      expect(result).toEqual({
        isDuplicate: true,
        similarImages: ['similar1.jpg', 'similar2.jpg'],
      });

      expect(mockRequest).toHaveBeenCalledWith('/uploads/upload-123/duplicate-check', {
        method: 'GET',
      });
    });

    it('should handle no duplicates found', async () => {
      const mockResponse = {
        data: {
          isDuplicate: false,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await service.checkDuplicate('upload-456');

      expect(result).toEqual({
        isDuplicate: false,
        similarImages: undefined,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new Error('Duplicate check failed'));

      const result = await service.checkDuplicate('upload-789');

      expect(result).toEqual({
        isDuplicate: false,
      });
    });
  });

  describe('File URI to Blob Conversion', () => {
    it('should convert file URI to blob', async () => {
      const uri = 'file://test-image.jpg';
      const base64Data =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      mockFileSystem.readAsStringAsync.mockResolvedValue(base64Data);

      const blob = await (service as any).fileUriToBlob(uri);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle file read errors', async () => {
      mockFileSystem.readAsStringAsync.mockRejectedValue(new Error('File read failed'));

      await expect((service as any).fileUriToBlob('invalid-uri')).rejects.toThrow(
        'File read failed',
      );
    });

    it('should handle empty base64 data', async () => {
      mockFileSystem.readAsStringAsync.mockResolvedValue('');

      const blob = await (service as any).fileUriToBlob('empty-file');

      expect(blob.size).toBe(0);
    });
  });

  describe('Retry Upload', () => {
    it('should retry upload with backoff', async () => {
      const expectedResult = { uploadId: 'retry-success' };

      mockUploadWithRetry.mockResolvedValue(expectedResult);

      const result = await service.retryUpload(mockProcessedImage, 'pet', 'pet-123', 3);

      expect(mockUploadWithRetry).toHaveBeenCalledWith(expect.any(Function), 3, 1000);

      expect(result).toEqual(expectedResult);
    });

    it('should use default retry parameters', async () => {
      mockUploadWithRetry.mockResolvedValue({ uploadId: 'default-retry' });

      await service.retryUpload(mockProcessedImage);

      expect(mockUploadWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        3, // default maxRetries
        1000, // default backoffMs
      );
    });

    it('should handle retry failures', async () => {
      mockUploadWithRetry.mockRejectedValue(new Error('All retries failed'));

      await expect(service.retryUpload(mockProcessedImage)).rejects.toThrow('All retries failed');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle very long URIs', async () => {
      const longUri = 'file://' + 'a'.repeat(1000) + '.jpg';

      const longImage = { ...mockProcessedImage, uri: longUri };

      await service.uploadProcessedImage(longImage);

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle special characters in URIs', async () => {
      const specialUri = 'file://test image (copy).jpg';

      const specialImage = { ...mockProcessedImage, uri: specialUri };

      await service.uploadProcessedImage(specialImage);

      expect(mockFileSystem.readAsStringAsync).toHaveBeenCalledWith(specialUri, expect.any(Object));
    });

    it('should handle network timeouts during upload', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'));

      await expect(service.uploadProcessedImage(mockProcessedImage)).rejects.toThrow(
        'Network timeout',
      );
    });

    it('should handle malformed presign responses', async () => {
      mockApi.presignPhoto.mockResolvedValue({
        // Missing required fields
      });

      await expect(service.uploadProcessedImage(mockProcessedImage)).rejects.toThrow();
      // Should fail when trying to access undefined url/key
    });

    it('should handle concurrent uploads', async () => {
      const uploadPromises = [
        service.uploadProcessedImage({ ...mockProcessedImage, uri: 'img1.jpg' }),
        service.uploadProcessedImage({ ...mockProcessedImage, uri: 'img2.jpg' }),
        service.uploadProcessedImage({ ...mockProcessedImage, uri: 'img3.jpg' }),
      ];

      const results = await Promise.all(uploadPromises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.uploadId).toBe('upload-123');
      });
    });

    it('should handle extremely large files', async () => {
      const hugeImage = {
        ...mockProcessedImage,
        fileSize: 100 * 1024 * 1024, // 100MB
      };

      // Mock reading large base64 data
      const largeBase64 = 'A'.repeat(1024 * 1024); // 1MB of base64
      mockFileSystem.readAsStringAsync.mockResolvedValue(largeBase64);

      await service.uploadProcessedImage(hugeImage);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.any(Blob),
        }),
      );
    });

    it('should handle malformed processed images', async () => {
      const malformedImage = {
        uri: 'test.jpg',
        // Missing required fields
      } as ProcessedImage;

      await expect(service.uploadProcessedImage(malformedImage)).rejects.toThrow();
    });

    it('should handle upload registration with missing response fields', async () => {
      mockRequest.mockResolvedValue({
        data: {
          upload: {}, // Empty upload object
        },
      });

      const result = await service.uploadProcessedImage(mockProcessedImage);

      expect(result).toEqual({
        uploadId: '',
        s3Key: 'test-key-123',
        url: expect.stringContaining('s3.amazonaws.com'),
        status: 'pending',
        analysis: undefined,
      });
    });

    it('should handle progress callback errors gracefully', async () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Progress callback failed');
      });

      // Should not fail the upload due to progress callback error
      await expect(
        service.uploadProcessedImage(mockProcessedImage, 'pet', undefined, errorCallback),
      ).resolves.toBeDefined();
    });

    it('should handle file system read errors during blob conversion', async () => {
      mockFileSystem.readAsStringAsync.mockRejectedValue(new Error('File system error'));

      await expect(service.uploadProcessedImage(mockProcessedImage)).rejects.toThrow(
        'File system error',
      );
    });

    it('should handle invalid base64 data', async () => {
      mockFileSystem.readAsStringAsync.mockResolvedValue('invalid base64!@#$%');

      // atob will throw on invalid base64, but the method should handle it
      await expect(service.uploadProcessedImage(mockProcessedImage)).rejects.toThrow();
    });

    it('should handle polling with invalid upload IDs', async () => {
      mockRequest.mockRejectedValue(new Error('Upload not found'));

      await expect(service.pollUploadStatus('invalid-id')).rejects.toThrow('Upload not found');
    });

    it('should handle batch upload with all failures', async () => {
      mockFetch.mockResolvedValue({ ok: false } as any);

      const images = [mockProcessedImage, mockProcessedImage];
      const results = await service.uploadBatch(images);

      expect(results).toEqual([]);
    });

    it('should handle duplicate check with malformed responses', async () => {
      mockRequest.mockResolvedValue({
        data: 'invalid response format',
      });

      const result = await service.checkDuplicate('upload-123');

      expect(result).toEqual({
        isDuplicate: false,
      });
    });

    it('should handle retry with invalid parameters', async () => {
      mockUploadWithRetry.mockRejectedValue(new Error('Invalid retry params'));

      await expect(service.retryUpload(mockProcessedImage, 'invalid' as any)).rejects.toThrow(
        'Invalid retry params',
      );
    });
  });
});
