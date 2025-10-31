/**
 * Comprehensive tests for Photo Upload Service
 *
 * Coverage:
 * - Photo upload to S3 via presign
 * - FileSystem integration
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { uploadPhoto } from '../photoUpload';
import { request } from '../api';
import * as FileSystem from 'expo-file-system';

// Mock dependencies
jest.mock('../api', () => ({
  request: jest.fn(),
}));
jest.mock('expo-file-system', () => ({
  FileSystemUploadType: {
    BINARY_CONTENT: 'BINARY_CONTENT',
    MULTIPART: 'MULTIPART',
  },
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: '{"key": "test-key"}' })),
}));

const mockRequest = request as jest.MockedFunction<typeof request>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('Photo Upload Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should upload photo successfully', async () => {
      const presignData = {
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo456.jpg',
      };

      mockRequest.mockResolvedValueOnce(presignData);
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      const result = await uploadPhoto('file://photo.jpg', 'image/jpeg');

      expect(result).toBe(presignData.key);
      expect(mockRequest).toHaveBeenCalledWith('/uploads/photos/presign', {
        method: 'POST',
        body: { contentType: 'image/jpeg' },
      });
      expect(mockFileSystem.uploadAsync).toHaveBeenCalledWith(presignData.url, 'file://photo.jpg', {
        httpMethod: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });
    });

    it('should handle different content types', async () => {
      const presignData = {
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/video.mp4',
      };

      mockRequest.mockResolvedValueOnce(presignData);
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      const result = await uploadPhoto('file://video.mp4', 'video/mp4');

      expect(result).toBe(presignData.key);
      expect(mockRequest).toHaveBeenCalledWith('/uploads/photos/presign', {
        method: 'POST',
        body: { contentType: 'video/mp4' },
      });
      expect(mockFileSystem.uploadAsync.mock.calls[0]?.[2]?.headers?.['Content-Type']).toBe(
        'video/mp4',
      );
    });

    it('should handle PNG images', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.png',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      const result = await uploadPhoto('file://photo.png', 'image/png');

      expect(result).toBe('photos/user123/photo.png');
    });

    it('should handle JPEG images', async () => {
      mockRequest.mockResolvedValue({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      const result = await uploadPhoto('file://photo.jpg', 'image/jpeg');

      expect(result).toBe('photos/user123/photo.jpg');
    });
  });

  describe('Error Handling', () => {
    it('should handle presign API errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Presign failed'));

      await expect(uploadPhoto('file://photo.jpg', 'image/jpeg')).rejects.toThrow('Presign failed');
      expect(mockFileSystem.uploadAsync).not.toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(uploadPhoto('file://photo.jpg', 'image/jpeg')).rejects.toThrow('Upload failed');
    });

    it('should handle S3 upload failures', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 403,
        headers: {},
        body: '',
      } as any);

      await expect(uploadPhoto('file://photo.jpg', 'image/jpeg')).rejects.toThrow();
    });

    it('should handle network timeouts', async () => {
      mockRequest.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1)),
      );

      await expect(uploadPhoto('file://photo.jpg', 'image/jpeg')).rejects.toThrow('Timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file URI', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      await uploadPhoto('', 'image/jpeg');

      expect(mockFileSystem.uploadAsync).toHaveBeenCalled();
    });

    it('should handle very long file URIs', async () => {
      const longUri = `file://${'x'.repeat(10000)}.jpg`;

      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/long.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      const result = await uploadPhoto(longUri, 'image/jpeg');

      expect(result).toBe('photos/user123/long.jpg');
    });

    it('should handle special characters in content type', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      await uploadPhoto('file://photo.jpg', 'image/svg+xml');

      expect(mockRequest).toHaveBeenCalledWith('/uploads/photos/presign', {
        method: 'POST',
        body: { contentType: 'image/svg+xml' },
      });
    });

    it('should handle different file URIs', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      const uris = [
        'content://photo.jpg',
        'file:///data/user/0/photo.jpg',
        'assets-library://photo.jpg',
      ];

      for (const uri of uris) {
        await uploadPhoto(uri, 'image/jpeg');
      }

      expect(mockFileSystem.uploadAsync).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration', () => {
    it('should integrate with API service', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      await uploadPhoto('file://photo.jpg', 'image/jpeg');

      expect(mockRequest).toHaveBeenCalledWith('/uploads/photos/presign', expect.any(Object));
    });

    it('should integrate with FileSystem', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      await uploadPhoto('file://photo.jpg', 'image/jpeg');

      expect(mockFileSystem.uploadAsync).toHaveBeenCalledWith(
        'https://s3.amazonaws.com/bucket/key',
        'file://photo.jpg',
        expect.objectContaining({
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        }),
      );
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for return value', async () => {
      mockRequest.mockResolvedValueOnce({
        url: 'https://s3.amazonaws.com/bucket/key',
        key: 'photos/user123/photo.jpg',
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      const result = await uploadPhoto('file://photo.jpg', 'image/jpeg');

      expect(typeof result).toBe('string');
      expect(result).toContain('photos/');
    });

    it('should handle all required parameters', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          url: 'https://s3.amazonaws.com/bucket/key',
          key: 'photos/user123/photo.jpg',
        },
      });
      mockFileSystem.uploadAsync.mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: '',
      } as any);

      await uploadPhoto('file://photo.jpg', 'image/jpeg');

      expect(mockRequest).toHaveBeenCalledWith('/uploads/photos/presign', {
        method: 'POST',
        body: { contentType: expect.any(String) },
      });
    });
  });
});
