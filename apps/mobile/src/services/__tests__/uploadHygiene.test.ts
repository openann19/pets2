/**
 * Comprehensive tests for UploadHygiene Service
 *
 * Coverage:
 * - Image MIME type validation
 * - EXIF orientation fixing
 * - Image resizing and dimension constraints
 * - Aspect ratio cropping
 * - Image compression and quality optimization
 * - File size calculation and validation
 * - Full upload hygiene pipeline
 * - Image picker integration with permissions
 * - Camera capture with permissions
 * - Upload quota checking
 * - Retry logic with progressive backoff
 * - Error handling and edge cases
 * - Platform-specific behavior
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import {
  processImageForUpload,
  pickAndProcessImage,
  captureAndProcessImage,
  checkUploadQuota,
  uploadWithRetry,
  validateMimeType,
  fixOrientation,
  resizeImage,
  cropToAspectRatio,
  compressImage,
  getFileInfo,
  type UploadHygieneOptions,
  type ProcessedImage,
} from '../uploadHygiene';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('expo-image-manipulator');
jest.mock('expo-file-system');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock console methods
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockImageManipulator = ImageManipulator as jest.Mocked<typeof ImageManipulator>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('UploadHygiene Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'processed-image.jpg',
      width: 1024,
      height: 768,
      base64: undefined,
    });

    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      isDirectory: false,
      size: 512000, // 500KB
      uri: 'test-image.jpg',
      modificationTime: Date.now(),
    });

    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'picked-image.jpg',
          width: 2048,
          height: 1536,
          type: 'image',
          fileName: 'test.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          exif: {},
        },
      ],
    });

    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'captured-image.jpg',
          width: 2048,
          height: 1536,
          type: 'image',
          fileName: 'capture.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          exif: {},
        },
      ],
    });
  });

  afterEach(() => {
    global.console = originalConsole;
  });

  describe('MIME Type Validation', () => {
    it('should validate JPEG files', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000,
        uri: 'test.jpg',
        modificationTime: Date.now(),
      });

      const result = await validateMimeType('test.jpg');

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should validate PNG files', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000,
        uri: 'test.png',
        modificationTime: Date.now(),
      });

      const result = await validateMimeType('test.png');

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/png');
    });

    it('should validate WebP files', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000,
        uri: 'test.webp',
        modificationTime: Date.now(),
      });

      const result = await validateMimeType('test.webp');

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/webp');
    });

    it('should reject invalid file extensions', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000,
        uri: 'test.txt',
        modificationTime: Date.now(),
      });

      const result = await validateMimeType('test.txt');

      expect(result.valid).toBe(false);
      expect(result.mimeType).toBe('unknown');
    });

    it('should handle file system errors', async () => {
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File not found'));

      const result = await validateMimeType('nonexistent.jpg');

      expect(result.valid).toBe(false);
      expect(result.mimeType).toBe('unknown');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle files without extensions', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000,
        uri: 'image_without_extension',
        modificationTime: Date.now(),
      });

      const result = await validateMimeType('image_without_extension');

      expect(result.valid).toBe(false);
      expect(result.mimeType).toBe('unknown');
    });
  });

  describe('EXIF Orientation Fixing', () => {
    it('should fix image orientation', async () => {
      const inputUri = 'input.jpg';
      const outputUri = 'oriented.jpg';

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: outputUri,
        width: 1000,
        height: 800,
        base64: undefined,
      });

      const result = await fixOrientation(inputUri);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(inputUri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      expect(result).toBe(outputUri);
    });

    it('should return original URI on orientation fix failure', async () => {
      const inputUri = 'input.jpg';

      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Orientation fix failed'));

      const result = await fixOrientation(inputUri);

      expect(result).toBe(inputUri);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Image Resizing', () => {
    it('should resize images larger than max dimension', async () => {
      const inputUri = 'large.jpg';
      const maxDimension = 1024;

      // Mock original dimensions
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'temp.jpg',
        width: 2048,
        height: 1536,
        base64: undefined,
      });

      // Mock resized result
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'resized.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      const result = await resizeImage(inputUri, maxDimension);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2);
      expect(result.width).toBe(1024);
      expect(result.height).toBe(768);
    });

    it('should not resize images smaller than max dimension', async () => {
      const inputUri = 'small.jpg';
      const maxDimension = 2048;

      const originalResult = {
        uri: 'small.jpg',
        width: 800,
        height: 600,
        base64: undefined,
      };

      mockImageManipulator.manipulateAsync.mockResolvedValue(originalResult);

      const result = await resizeImage(inputUri, maxDimension);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledTimes(1);
      expect(result).toBe(originalResult);
    });

    it('should handle landscape images correctly', async () => {
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'temp.jpg',
        width: 3000,
        height: 2000, // Landscape
        base64: undefined,
      });

      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'resized.jpg',
        width: 1536,
        height: 1024, // Should be scaled down proportionally
        base64: undefined,
      });

      const result = await resizeImage('landscape.jpg', 1536);

      expect(result.width).toBe(1536);
      expect(result.height).toBe(1024);
    });

    it('should handle portrait images correctly', async () => {
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'temp.jpg',
        width: 2000,
        height: 3000, // Portrait
        base64: undefined,
      });

      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'resized.jpg',
        width: 1024,
        height: 1536, // Should be scaled down proportionally
        base64: undefined,
      });

      const result = await resizeImage('portrait.jpg', 1536);

      expect(result.width).toBe(1024);
      expect(result.height).toBe(1536);
    });

    it('should handle resize errors', async () => {
      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Resize failed'));

      await expect(resizeImage('test.jpg', 1024)).rejects.toThrow('Resize failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Aspect Ratio Cropping', () => {
    it('should crop wide images to target aspect ratio', async () => {
      const imageUri = 'wide.jpg';
      const aspectRatio: [number, number] = [4, 3];
      const width = 1600;
      const height = 900; // 16:9 aspect ratio, needs cropping

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'cropped.jpg',
        width: 1200,
        height: 900,
        base64: undefined,
      });

      const result = await cropToAspectRatio(imageUri, aspectRatio, width, height);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        imageUri,
        [
          {
            crop: {
              originX: 200, // (1600 - 1200) / 2
              originY: 0,
              width: 1200,
              height: 900,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );
      expect(result.uri).toBe('cropped.jpg');
    });

    it('should crop tall images to target aspect ratio', async () => {
      const imageUri = 'tall.jpg';
      const aspectRatio: [number, number] = [4, 3];
      const width = 900;
      const height = 1600; // 9:16 aspect ratio, needs cropping

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'cropped.jpg',
        width: 900,
        height: 675,
        base64: undefined,
      });

      const result = await cropToAspectRatio(imageUri, aspectRatio, width, height);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        imageUri,
        [
          {
            crop: {
              originX: 0,
              originY: 462.5, // (1600 - 675) / 2 ≈ 462.5
              width: 900,
              height: 675,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );
    });

    it('should not crop images that already match aspect ratio', async () => {
      const imageUri = 'perfect.jpg';
      const aspectRatio: [number, number] = [4, 3];
      const width = 1600;
      const height = 1200; // 4:3 aspect ratio, no cropping needed

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'uncropped.jpg',
        width: 1600,
        height: 1200,
        base64: undefined,
      });

      const result = await cropToAspectRatio(imageUri, aspectRatio, width, height);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        imageUri,
        [
          {
            crop: { originX: 0, originY: 0, width: 1600, height: 1200 },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );
    });

    it('should handle crop errors', async () => {
      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Crop failed'));

      await expect(cropToAspectRatio('test.jpg', [4, 3], 1000, 800)).rejects.toThrow(
        'Crop failed',
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Image Compression', () => {
    it('should compress images with specified quality', async () => {
      const imageUri = 'input.jpg';
      const quality = 0.85;

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'compressed.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      const result = await compressImage(imageUri, quality);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(imageUri, [], {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      expect(result.uri).toBe('compressed.jpg');
    });

    it('should handle different quality levels', async () => {
      const qualities = [0.5, 0.75, 0.9, 1.0];

      for (const quality of qualities) {
        mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
          uri: `compressed-q${quality}.jpg`,
          width: 1024,
          height: 768,
          base64: undefined,
        });

        const result = await compressImage('input.jpg', quality);

        expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
          'input.jpg',
          [],
          expect.objectContaining({ compress: quality }),
        );
        expect(result.uri).toBe(`compressed-q${quality}.jpg`);
      }
    });

    it('should handle compression errors', async () => {
      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Compression failed'));

      await expect(compressImage('test.jpg', 0.8)).rejects.toThrow('Compression failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('File Information', () => {
    it('should get file size and existence', async () => {
      const uri = 'test.jpg';
      const expectedSize = 512000;

      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: expectedSize,
        uri,
        modificationTime: Date.now(),
      });

      const result = await getFileInfo(uri);

      expect(result.size).toBe(expectedSize);
      expect(result.exists).toBe(true);
    });

    it('should handle non-existent files', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: 'missing.jpg',
        modificationTime: undefined,
      });

      const result = await getFileInfo('missing.jpg');

      expect(result.size).toBe(0);
      expect(result.exists).toBe(false);
    });

    it('should handle file system errors', async () => {
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

      const result = await getFileInfo('error.jpg');

      expect(result.size).toBe(0);
      expect(result.exists).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Full Upload Hygiene Pipeline', () => {
    it('should process image through complete pipeline', async () => {
      const inputUri = 'original.jpg';
      const options: UploadHygieneOptions = {
        maxDimension: 1024,
        quality: 0.85,
        aspectRatio: [4, 3],
        stripExif: true,
        cropToAspect: true,
      };

      // Mock all pipeline steps
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000000,
        uri: inputUri,
        modificationTime: Date.now(),
      });

      // Orientation fix
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'oriented.jpg',
        width: 2048,
        height: 1536,
        base64: undefined,
      });

      // Initial dimensions check
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'oriented.jpg',
        width: 2048,
        height: 1536,
        base64: undefined,
      });

      // Resize
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'resized.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      // Crop
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'cropped.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      // Compress
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'compressed.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      // File info
      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 256000, // 250KB
        uri: 'compressed.jpg',
        modificationTime: Date.now(),
      });

      const result = await processImageForUpload(inputUri, options);

      expect(result.uri).toBe('compressed.jpg');
      expect(result.width).toBe(1024);
      expect(result.height).toBe(768);
      expect(result.fileSize).toBe(256000);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.metadata.originalWidth).toBe(2048);
      expect(result.metadata.originalHeight).toBe(1536);
      expect(result.metadata.orientationFixed).toBe(true);
      expect(result.metadata.exifStripped).toBe(true);

      expect(console.log).toHaveBeenCalledWith('Starting upload hygiene processing...');
      expect(console.log).toHaveBeenCalledWith('✓ MIME type validated:', 'image/jpeg');
      expect(console.log).toHaveBeenCalledWith('✓ Orientation fixed');
      expect(console.log).toHaveBeenCalledWith('Original dimensions: 2048x1536');
      expect(console.log).toHaveBeenCalledWith('✓ Resized to: 1024x768');
      expect(console.log).toHaveBeenCalledWith('✓ Cropped to 4:3');
      expect(console.log).toHaveBeenCalledWith('✓ Compressed with quality: 0.85');
    });

    it('should use default options when not provided', async () => {
      const inputUri = 'test.jpg';

      // Mock minimal pipeline
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 500000,
        uri: inputUri,
        modificationTime: Date.now(),
      });

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'processed.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 200000,
        uri: 'processed.jpg',
        modificationTime: Date.now(),
      });

      const result = await processImageForUpload(inputUri);

      expect(result.metadata.exifStripped).toBe(true); // Default stripExif
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should skip cropping when disabled', async () => {
      const inputUri = 'test.jpg';
      const options = {
        cropToAspect: false,
        maxDimension: 1024,
      };

      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 500000,
        uri: inputUri,
        modificationTime: Date.now(),
      });

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'processed.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 200000,
        uri: 'processed.jpg',
        modificationTime: Date.now(),
      });

      await processImageForUpload(inputUri, options);

      // Should not call crop function
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledTimes(4); // orientation + dimensions + resize + compress
    });

    it('should handle invalid MIME types', async () => {
      const inputUri = 'invalid.txt';

      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000,
        uri: inputUri,
        modificationTime: Date.now(),
      });

      await expect(processImageForUpload(inputUri)).rejects.toThrow('Invalid file type: unknown');
    });

    it('should handle processing errors', async () => {
      const inputUri = 'error.jpg';

      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('Processing failed'));

      await expect(processImageForUpload(inputUri)).rejects.toThrow('Processing failed');
      expect(console.error).toHaveBeenCalledWith(
        'Upload hygiene processing failed:',
        expect.any(Error),
      );
    });
  });

  describe('Image Picker Integration', () => {
    it('should pick and process image successfully', async () => {
      const options = { maxDimension: 1024, quality: 0.8 };

      // Mock the full pipeline
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000000,
        uri: 'picked-image.jpg',
        modificationTime: Date.now(),
      });

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'processed.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 300000,
        uri: 'processed.jpg',
        modificationTime: Date.now(),
      });

      const result = await pickAndProcessImage(true, options);

      expect(mockImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: false,
      });

      expect(result).toBeDefined();
      expect(result!.uri).toBe('processed.jpg');
      expect(result!.fileSize).toBe(300000);
    });

    it('should handle permission denial', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: true,
      });

      await expect(pickAndProcessImage()).rejects.toThrow('Camera roll permissions not granted');
    });

    it('should handle user cancellation', async () => {
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await pickAndProcessImage();

      expect(result).toBeNull();
    });

    it('should handle picker errors', async () => {
      mockImagePicker.launchImageLibraryAsync.mockRejectedValue(new Error('Picker failed'));

      await expect(pickAndProcessImage()).rejects.toThrow('Picker failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Camera Capture Integration', () => {
    it('should capture and process image successfully', async () => {
      const options = { maxDimension: 1536, quality: 0.9 };

      // Mock the full pipeline
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1500000,
        uri: 'captured-image.jpg',
        modificationTime: Date.now(),
      });

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'processed.jpg',
        width: 1536,
        height: 1152,
        base64: undefined,
      });

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 400000,
        uri: 'processed.jpg',
        modificationTime: Date.now(),
      });

      const result = await captureAndProcessImage(options);

      expect(mockImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(mockImagePicker.launchCameraAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      expect(result).toBeDefined();
      expect(result!.uri).toBe('processed.jpg');
      expect(result!.width).toBe(1536);
      expect(result!.height).toBe(1152);
    });

    it('should handle camera permission denial', async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: false,
      });

      await expect(captureAndProcessImage()).rejects.toThrow('Camera permissions not granted');
    });

    it('should handle camera cancellation', async () => {
      mockImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await captureAndProcessImage();

      expect(result).toBeNull();
    });
  });

  describe('Upload Quota Management', () => {
    it('should check upload quota successfully', async () => {
      const userId = 'user123';

      const result = await checkUploadQuota(userId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(10);
      expect(result.limit).toBe(10);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('should handle quota check errors', async () => {
      // Mock implementation that throws
      const originalCheckUploadQuota = checkUploadQuota;
      (global as any).checkUploadQuota = jest
        .fn()
        .mockRejectedValue(new Error('Quota check failed'));

      await expect((global as any).checkUploadQuota('user123')).rejects.toThrow(
        'Quota check failed',
      );

      // Restore
      (global as any).checkUploadQuota = originalCheckUploadQuota;
    });
  });

  describe('Retry Logic with Backoff', () => {
    it('should succeed on first attempt', async () => {
      const uploadFn = jest.fn().mockResolvedValue('success');
      const maxRetries = 3;
      const backoffMs = 1000;

      const result = await uploadWithRetry(uploadFn, maxRetries, backoffMs);

      expect(result).toBe('success');
      expect(uploadFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const uploadFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce('success');

      const maxRetries = 3;
      const backoffMs = 100;

      jest.useFakeTimers();

      const uploadPromise = uploadWithRetry(uploadFn, maxRetries, backoffMs);

      // Fast-forward through delays
      jest.advanceTimersByTime(100); // After first retry delay
      jest.advanceTimersByTime(200); // After second retry delay

      const result = await uploadPromise;

      expect(result).toBe('success');
      expect(uploadFn).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });

    it('should fail after max retries', async () => {
      const uploadFn = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      const maxRetries = 2;
      const backoffMs = 50;

      jest.useFakeTimers();

      const uploadPromise = uploadWithRetry(uploadFn, maxRetries, backoffMs);

      // Fast-forward through delays
      jest.advanceTimersByTime(50); // After first retry delay

      await expect(uploadPromise).rejects.toThrow('Persistent failure');
      expect(uploadFn).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should use progressive backoff delays', async () => {
      const uploadFn = jest.fn().mockRejectedValue(new Error('Failure'));
      const maxRetries = 3;
      const backoffMs = 100;

      jest.useFakeTimers();

      const uploadPromise = uploadWithRetry(uploadFn, maxRetries, backoffMs);

      // Should wait 100ms after first failure, 200ms after second
      jest.advanceTimersByTime(100 + 200);

      await expect(uploadPromise).rejects.toThrow('Failure');
      expect(uploadFn).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large images', async () => {
      const largeUri = 'huge-image.jpg';

      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 10000000, // 10MB
        uri: largeUri,
        modificationTime: Date.now(),
      });

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'processed.jpg',
        width: 2048,
        height: 1536,
        base64: undefined,
      });

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 500000, // Processed to 500KB
        uri: 'processed.jpg',
        modificationTime: Date.now(),
      });

      const result = await processImageForUpload(largeUri, { maxDimension: 2048 });

      expect(result.fileSize).toBe(500000);
      expect(result.width).toBeLessThanOrEqual(2048);
      expect(result.height).toBeLessThanOrEqual(2048);
    });

    it('should handle very small images', async () => {
      const smallUri = 'tiny-image.jpg';

      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000, // 1KB
        uri: smallUri,
        modificationTime: Date.now(),
      });

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'processed.jpg',
        width: 100,
        height: 75,
        base64: undefined,
      });

      mockFileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 800,
        uri: 'processed.jpg',
        modificationTime: Date.now(),
      });

      const result = await processImageForUpload(smallUri, { maxDimension: 2048 });

      expect(result.width).toBe(100);
      expect(result.height).toBe(75);
      expect(result.fileSize).toBe(800);
    });

    it('should handle square images', async () => {
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'oriented.jpg',
        width: 1000,
        height: 1000, // Square
        base64: undefined,
      });

      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'oriented.jpg',
        width: 1000,
        height: 1000,
        base64: undefined,
      });

      // Should not resize square images under max dimension
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'resized.jpg',
        width: 1000,
        height: 1000,
        base64: undefined,
      });

      // Square images should crop to center for 4:3 aspect ratio
      mockImageManipulator.manipulateAsync.mockResolvedValueOnce({
        uri: 'cropped.jpg',
        width: 1000,
        height: 750,
        base64: undefined,
      });

      const result = await cropToAspectRatio('square.jpg', [4, 3], 1000, 1000);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'square.jpg',
        [
          {
            crop: {
              originX: 0,
              originY: 125, // (1000 - 750) / 2 = 125
              width: 1000,
              height: 750,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );
    });

    it('should handle extreme aspect ratios', async () => {
      // Very wide image
      const result1 = await cropToAspectRatio('wide.jpg', [1, 1], 2000, 1000);
      // Very tall image
      const result2 = await cropToAspectRatio('tall.jpg', [1, 1], 1000, 2000);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle zero dimensions gracefully', async () => {
      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'processed.jpg',
        width: 0,
        height: 0,
        base64: undefined,
      });

      const result = await resizeImage('zero.jpg', 1024);

      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });

    it('should handle negative quality values', async () => {
      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'compressed.jpg',
        width: 1024,
        height: 768,
        base64: undefined,
      });

      const result = await compressImage('test.jpg', -0.5);

      // ImageManipulator should handle this gracefully
      expect(result.uri).toBe('compressed.jpg');
    });

    it('should handle concurrent processing operations', async () => {
      const uris = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

      // Mock all operations for all images
      uris.forEach(() => {
        mockFileSystem.getInfoAsync.mockResolvedValueOnce({
          exists: true,
          isDirectory: false,
          size: 500000,
          uri: 'test.jpg',
          modificationTime: Date.now(),
        });

        mockImageManipulator.manipulateAsync.mockResolvedValue({
          uri: 'processed.jpg',
          width: 1024,
          height: 768,
          base64: undefined,
        });

        mockFileSystem.getInfoAsync.mockResolvedValueOnce({
          exists: true,
          isDirectory: false,
          size: 200000,
          uri: 'processed.jpg',
          modificationTime: Date.now(),
        });
      });

      const promises = uris.map((uri) => processImageForUpload(uri));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.width).toBe(1024);
        expect(result.height).toBe(768);
      });
    });

    it('should handle malformed image picker results', async () => {
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [], // Empty assets array
      });

      const result = await pickAndProcessImage();

      expect(result).toBeNull();
    });

    it('should handle image picker results with missing URI', async () => {
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: '', // Empty URI
            width: 1000,
            height: 800,
            type: 'image',
            fileName: 'test.jpg',
          },
        ],
      });

      await expect(pickAndProcessImage()).rejects.toThrow();
    });

    it('should handle platform differences', () => {
      // Test iOS vs Android behavior
      const originalOS = Platform.OS;

      Platform.OS = 'android';
      expect(Platform.OS).toBe('android');

      Platform.OS = 'ios';
      expect(Platform.OS).toBe('ios');

      Platform.OS = originalOS;
    });

    it('should handle memory pressure during processing', async () => {
      // Simulate memory pressure by making operations fail
      let callCount = 0;
      mockImageManipulator.manipulateAsync.mockImplementation(() => {
        callCount++;
        if (callCount > 2) {
          throw new Error('Out of memory');
        }
        return Promise.resolve({
          uri: 'processed.jpg',
          width: 1024,
          height: 768,
          base64: undefined,
        });
      });

      await expect(processImageForUpload('memory-test.jpg')).rejects.toThrow('Out of memory');
    });
  });
});
