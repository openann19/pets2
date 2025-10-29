/**
 * Tests for usePhotoManagement hook
 *
 * Covers:
 * - Photo selection with permissions
 * - Photo management (add, remove, primary)
 * - Photo upload to pet profiles
 * - Loading states and error handling
 * - User feedback and validation
 */

// Mock React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock Expo Image Picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

import { renderHook, act } from '@testing-library/react-native';
import { usePhotoManagement } from '../usePhotoManagement';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockAlert = Alert as jest.Mocked<typeof Alert>;

describe('usePhotoManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePhotoManagement());

      expect(result.current.photos).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.pickImage).toBe('function');
      expect(typeof result.current.removePhoto).toBe('function');
      expect(typeof result.current.setPrimaryPhoto).toBe('function');
      expect(typeof result.current.uploadPhotos).toBe('function');
      expect(typeof result.current.clearPhotos).toBe('function');
    });

    it('should accept custom options', () => {
      const onPhotoSelected = jest.fn();
      const { result } = renderHook(() =>
        usePhotoManagement({
          onPhotoSelected,
          maxPhotos: 5,
        })
      );

      expect(result.current.photos).toEqual([]);
    });
  });

  describe('Photo Selection', () => {
    it('should handle denied permissions', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePhotoManagement());

      await act(async () => {
        await result.current.pickImage();
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Permission needed',
        'Please grant permission to access your photos'
      );
    });

    it('should handle granted permissions and pick images', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });

      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo1.jpg',
            width: 800,
            height: 600,
          },
          {
            uri: 'file://photo2.jpg',
            width: 800,
            height: 600,
          },
        ],
      });

      const onPhotoSelected = jest.fn();
      const { result } = renderHook(() =>
        usePhotoManagement({ onPhotoSelected, maxPhotos: 5 })
      );

      await act(async () => {
        await result.current.pickImage();
      });

      expect(result.current.photos).toHaveLength(2);
      expect(result.current.photos[0].isPrimary).toBe(true);
      expect(result.current.photos[1].isPrimary).toBe(false);
      expect(onPhotoSelected).toHaveBeenCalledWith(result.current.photos);
    });

    it('should handle maximum photos limit', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() =>
        usePhotoManagement({ maxPhotos: 1 })
      );

      // Set existing photo
      act(() => {
        result.current.photos.push({
          uri: 'file://existing.jpg',
          type: 'image/jpeg',
          fileName: 'existing.jpg',
        });
      });

      await act(async () => {
        await result.current.pickImage();
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Maximum photos reached',
        'You can only add up to 1 photos'
      );
      expect(mockImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('should handle cancelled image picker', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });

      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const { result } = renderHook(() => usePhotoManagement());

      await act(async () => {
        await result.current.pickImage();
      });

      expect(result.current.photos).toHaveLength(0);
    });
  });

  describe('Photo Management', () => {
    it('should remove photo and update primary status', () => {
      const { result } = renderHook(() => usePhotoManagement());

      act(() => {
        // Add photos manually for testing
        result.current.photos.push(
          { uri: 'photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
          { uri: 'photo2.jpg', type: 'image/jpeg', fileName: 'photo2.jpg', isPrimary: false },
          { uri: 'photo3.jpg', type: 'image/jpeg', fileName: 'photo3.jpg', isPrimary: false }
        );
      });

      act(() => {
        result.current.removePhoto(0); // Remove primary photo
      });

      expect(result.current.photos).toHaveLength(2);
      expect(result.current.photos[0].isPrimary).toBe(true); // First remaining becomes primary
    });

    it('should set primary photo', () => {
      const { result } = renderHook(() => usePhotoManagement());

      act(() => {
        result.current.photos.push(
          { uri: 'photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
          { uri: 'photo2.jpg', type: 'image/jpeg', fileName: 'photo2.jpg', isPrimary: false }
        );
      });

      act(() => {
        result.current.setPrimaryPhoto(1);
      });

      expect(result.current.photos[0].isPrimary).toBe(false);
      expect(result.current.photos[1].isPrimary).toBe(true);
    });

    it('should clear all photos', () => {
      const { result } = renderHook(() => usePhotoManagement());

      act(() => {
        result.current.photos.push(
          { uri: 'photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg' },
          { uri: 'photo2.jpg', type: 'image/jpeg', fileName: 'photo2.jpg' }
        );
      });

      act(() => {
        result.current.clearPhotos();
      });

      expect(result.current.photos).toHaveLength(0);
    });
  });

  describe('Photo Upload', () => {
    it('should upload photos successfully', async () => {
      // Mock API
      const mockApi = require('../../../../services/api').matchesAPI;
      mockApi.uploadPetPhotos = jest.fn().mockResolvedValue({});

      const { result } = renderHook(() => usePhotoManagement());

      act(() => {
        result.current.photos.push(
          { uri: 'photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
          { uri: 'photo2.jpg', type: 'image/jpeg', fileName: 'photo2.jpg', isPrimary: false }
        );
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.uploadPhotos('pet123');
      });

      expect(success).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(mockApi.uploadPetPhotos).toHaveBeenCalledWith('pet123', expect.any(FormData));
    });

    it('should handle upload errors', async () => {
      const mockApi = require('../../../../services/api').matchesAPI;
      mockApi.uploadPetPhotos = jest.fn().mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() => usePhotoManagement());

      act(() => {
        result.current.photos.push(
          { uri: 'photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg' }
        );
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.uploadPhotos('pet123');
      });

      expect(success).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(mockAlert.alert).toHaveBeenCalledWith('Error', 'Failed to upload photos. Please try again.');
    });

    it('should reject upload when no photos', async () => {
      const { result } = renderHook(() => usePhotoManagement());

      let success: boolean;
      await act(async () => {
        success = await result.current.uploadPhotos('pet123');
      });

      expect(success).toBe(false);
      expect(mockAlert.alert).toHaveBeenCalledWith('No photos', 'Please add at least one photo');
    });
  });
});
