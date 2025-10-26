/**
 * Upload Service Tests
 * Tests file upload functionality and photo management
 */

import { uploadService } from '../uploadService';

// Mock the API
jest.mock('../api', () => ({
  api: {
    post: jest.fn(),
  },
}));

import { api } from '../api';

const mockApi = api as jest.Mocked<typeof api>;

// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock FileSystem for native uploads
jest.mock('expo-file-system', () => ({
  uploadAsync: jest.fn(),
  FileSystemUploadType: {
    BINARY_CONTENT: 'BINARY_CONTENT',
  },
}));

describe('UploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPhoto', () => {
    it('should upload photo successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/photo.jpg',
        publicId: 'photo123',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadService.uploadPhoto(mockFile);

      expect(mockApi.post).toHaveBeenCalledWith('/upload/photo', expect.any(FormData));
      expect(result).toEqual(mockResponse);
    });

    it('should handle upload failure', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Upload failed');
      mockApi.post.mockRejectedValue(mockError);

      await expect(uploadService.uploadPhoto(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadVideo', () => {
    it('should upload video successfully', async () => {
      const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/video.mp4',
        publicId: 'video123',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadService.uploadVideo(mockFile);

      expect(mockApi.post).toHaveBeenCalledWith('/upload/video', expect.any(FormData));
      expect(result).toEqual(mockResponse);
    });

    it('should handle video upload failure', async () => {
      const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      const mockError = new Error('Video upload failed');
      mockApi.post.mockRejectedValue(mockError);

      await expect(uploadService.uploadVideo(mockFile)).rejects.toThrow('Video upload failed');
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Photo deleted successfully',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadService.deletePhoto('photo123');

      expect(mockApi.post).toHaveBeenCalledWith('/upload/delete', {
        publicId: 'photo123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete failure', async () => {
      const mockError = new Error('Delete failed');
      mockApi.post.mockRejectedValue(mockError);

      await expect(uploadService.deletePhoto('invalid123')).rejects.toThrow('Delete failed');
    });
  });

  describe('getUploadUrl', () => {
    it('should get signed upload URL', async () => {
      const mockResponse = {
        success: true,
        uploadUrl: 'https://example.com/upload',
        publicId: 'upload123',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadService.getUploadUrl('image', 'test.jpg');

      expect(mockApi.post).toHaveBeenCalledWith('/upload/presign', {
        type: 'image',
        filename: 'test.jpg',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle presign failure', async () => {
      const mockError = new Error('Presign failed');
      mockApi.post.mockRejectedValue(mockError);

      await expect(
        uploadService.getUploadUrl('image', 'test.jpg')
      ).rejects.toThrow('Presign failed');
    });
  });

  describe('ImagePicker integration', () => {
    beforeEach(() => {
      // Mock permissions
      const { requestMediaLibraryPermissionsAsync } = require('expo-image-picker');
      requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    });

    it('should pick image from library', async () => {
      const { launchImageLibraryAsync } = require('expo-image-picker');

      const mockAsset = {
        uri: 'file://test.jpg',
        width: 800,
        height: 600,
        type: 'image',
      };

      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [mockAsset],
      });

      const mockResponse = {
        success: true,
        url: 'https://example.com/uploaded.jpg',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadService.pickAndUploadPhoto();

      expect(launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle image picker cancellation', async () => {
      const { launchImageLibraryAsync } = require('expo-image-picker');

      launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await uploadService.pickAndUploadPhoto();

      expect(result).toBeNull();
    });

    it('should handle permission denial', async () => {
      const { requestMediaLibraryPermissionsAsync, launchImageLibraryAsync } = require('expo-image-picker');

      requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });

      await expect(uploadService.pickAndUploadPhoto()).rejects.toThrow(
        'Photo library access denied'
      );

      expect(launchImageLibraryAsync).not.toHaveBeenCalled();
    });
  });

  describe('Native upload helpers', () => {
    it('should upload directly to S3 for native', async () => {
      const { uploadAsync } = require('expo-file-system');

      uploadAsync.mockResolvedValue({
        status: 200,
        body: 'OK',
      });

      mockApi.post.mockResolvedValueOnce({ data: { url: 'presign-url', key: 'file-key' } });
      mockApi.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await uploadService.uploadPhotoNative('file://test.jpg', 'photo123');

      expect(uploadAsync).toHaveBeenCalledWith('presign-url', 'file://test.jpg', {
        httpMethod: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        uploadType: 'BINARY_CONTENT',
      });
      expect(result).toBeUndefined();
    });

    it('should handle native upload failure', async () => {
      const { uploadAsync } = require('expo-file-system');

      uploadAsync.mockRejectedValue(new Error('Upload failed'));

      mockApi.post.mockResolvedValue({ data: { url: 'presign-url', key: 'file-key' } });

      await expect(
        uploadService.uploadPhotoNative('file://test.jpg', 'photo123')
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('File validation', () => {
    it('should validate image file types', () => {
      const validFiles = [
        new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        new File(['test'], 'test.png', { type: 'image/png' }),
        new File(['test'], 'test.webp', { type: 'image/webp' }),
      ];

      validFiles.forEach(file => {
        expect(() => uploadService.validateImageFile(file)).not.toThrow();
      });
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      expect(() => uploadService.validateImageFile(invalidFile)).toThrow(
        'Invalid file type. Only images are allowed.'
      );
    });

    it('should validate file size', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      expect(() => uploadService.validateFileSize(largeFile)).toThrow(
        'File size too large. Maximum size is 10MB.'
      );
    });

    it('should accept valid file sizes', () => {
      const validFile = new File(['test'], 'small.jpg', { type: 'image/jpeg' });

      expect(() => uploadService.validateFileSize(validFile)).not.toThrow();
    });
  });
});
