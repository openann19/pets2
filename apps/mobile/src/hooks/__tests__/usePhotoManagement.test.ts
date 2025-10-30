/**
 * Unit tests for usePhotoManagement hook
 *
 * Tests photo limit enforcement, primary selection logic, queue state machine,
 * error states, and edge cases as defined in Test Plan v1.0
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePhotoManagement } from '../hooks/usePhotoManagement';
import * as ImagePicker from 'expo-image-picker';
import { uploadHygieneService } from '../services/uploadHygiene';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('../services/uploadHygiene');
jest.mock('../services/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockUploadHygieneService = uploadHygieneService as jest.Mocked<typeof uploadHygieneService>;

describe('usePhotoManagement', () => {
  const mockPetId = 'pet-123';

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      cancelled: false,
      assets: [
        {
          uri: 'file://test-image.jpg',
          width: 1024,
          height: 768,
          fileSize: 204800,
          mimeType: 'image/jpeg',
          fileName: 'test-image.jpg',
        },
      ],
    });

    mockUploadHygieneService.processImageForUpload.mockResolvedValue({
      uri: 'processed://test-image.jpg',
      width: 1024,
      height: 768,
      fileSize: 204800,
      mimeType: 'image/jpeg',
      metadata: {},
    });

    mockUploadHygieneService.uploadWithRetry.mockResolvedValue({
      uploadId: 'upload-123',
      status: 'approved',
      s3Key: 'uploads/test-key',
    });
  });

  it('should enforce 6 photo limit', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add 6 photos
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        await result.current.addPhoto();
      });
    }

    expect(result.current.photos).toHaveLength(6);
    expect(result.current.canAddMorePhotos).toBe(false);

    // Try to add 7th photo
    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos).toHaveLength(6); // Should not exceed limit
    expect(result.current.errors).toContain('Maximum 6 photos allowed');
  });

  it('should auto-select first photo as primary', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].isPrimary).toBe(true);
    expect(result.current.primaryPhoto).toBe(result.current.photos[0]);
  });

  it('should allow demoting current primary when new primary is selected', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add first photo (becomes primary)
    await act(async () => {
      await result.current.addPhoto();
    });

    // Add second photo
    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos[0].isPrimary).toBe(true);
    expect(result.current.photos[1].isPrimary).toBe(false);

    // Set second photo as primary
    act(() => {
      result.current.setPrimaryPhoto(result.current.photos[1].id);
    });

    expect(result.current.photos[0].isPrimary).toBe(false);
    expect(result.current.photos[1].isPrimary).toBe(true);
    expect(result.current.primaryPhoto).toBe(result.current.photos[1]);
  });

  it('should maintain queue state machine correctly', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add photo
    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos[0].status).toBe('uploading');

    // Wait for processing to complete
    await waitFor(() => {
      expect(result.current.photos[0].status).toBe('approved');
    });

    expect(result.current.photos[0].uploadId).toBe('upload-123');
    expect(result.current.photos[0].s3Key).toBe('uploads/test-key');
  });

  it('should handle photo processing errors', async () => {
    mockUploadHygieneService.processImageForUpload.mockRejectedValue(
      new Error('Image processing failed'),
    );

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    await waitFor(() => {
      expect(result.current.photos[0].status).toBe('error');
    });

    expect(result.current.errors).toContain('Failed to process image');
  });

  it('should handle upload failures with retry logic', async () => {
    let callCount = 0;
    mockUploadHygieneService.uploadWithRetry.mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Upload failed'));
      }
      return Promise.resolve({
        uploadId: 'upload-123',
        status: 'approved',
        s3Key: 'uploads/test-key',
      });
    });

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    await waitFor(() => {
      expect(callCount).toBe(3); // Should retry 3 times
      expect(result.current.photos[0].status).toBe('approved');
    });
  });

  it('should remove photos correctly', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add two photos
    await act(async () => {
      await result.current.addPhoto();
    });

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos).toHaveLength(2);

    // Remove first photo
    act(() => {
      result.current.removePhoto(result.current.photos[0].id);
    });

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].isPrimary).toBe(true); // Remaining photo becomes primary
  });

  it('should prevent removing primary photo when others exist', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add two photos
    await act(async () => {
      await result.current.addPhoto();
    });

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos).toHaveLength(2);

    // Try to remove primary photo
    act(() => {
      result.current.removePhoto(result.current.primaryPhoto!.id);
    });

    expect(result.current.photos).toHaveLength(2); // Should not remove
    expect(result.current.errors).toContain('Cannot remove primary photo');
  });

  it('should handle permission denied for photo library', async () => {
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    });

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.errors).toContain('Photo library access required');
    expect(result.current.photos).toHaveLength(0);
  });

  it('should handle user cancelling image picker', async () => {
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      cancelled: true,
      assets: [],
    });

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos).toHaveLength(0);
    expect(result.current.errors).toHaveLength(0); // No error for cancellation
  });

  it('should reorder photos correctly', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add three photos
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await result.current.addPhoto();
      });
    }

    expect(result.current.photos).toHaveLength(3);

    const originalOrder = result.current.photos.map((p) => p.id);

    // Move second photo to first position
    act(() => {
      result.current.reorderPhotos(result.current.photos[1].id, 0);
    });

    expect(result.current.photos[0].id).toBe(originalOrder[1]);
    expect(result.current.photos[1].id).toBe(originalOrder[0]);
    expect(result.current.photos[2].id).toBe(originalOrder[2]);
  });

  it('should validate photo file size limits', async () => {
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      cancelled: false,
      assets: [
        {
          uri: 'file://large-image.jpg',
          width: 2048,
          height: 1536,
          fileSize: 15000000, // 15MB - too large
          mimeType: 'image/jpeg',
          fileName: 'large-image.jpg',
        },
      ],
    });

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.errors).toContain('File size too large');
    expect(result.current.photos).toHaveLength(0);
  });

  it('should handle duplicate photo detection', async () => {
    mockUploadHygieneService.uploadWithRetry.mockRejectedValue({
      status: 409,
      data: {
        reason: 'duplicate',
        confidence: 0.99,
        duplicateOf: 'upload-456',
      },
    });

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    await waitFor(() => {
      expect(result.current.photos[0].status).toBe('duplicate');
    });

    expect(result.current.errors).toContain('Duplicate photo detected');
  });

  it('should provide progress updates during upload', async () => {
    let progressCallback: (progress: number) => void;

    mockUploadHygieneService.uploadWithRetry.mockImplementation(({ onProgress }: any) => {
      progressCallback = onProgress;
      return new Promise((resolve) => {
        setTimeout(() => {
          if (progressCallback) {
            progressCallback(100);
          }
          resolve({
            uploadId: 'upload-123',
            status: 'approved',
            s3Key: 'uploads/test-key',
          });
        }, 100);
      });
    });

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos[0].progress).toBe(0); // Initial

    // Simulate progress updates
    act(() => {
      if (progressCallback) {
        progressCallback(50);
      }
    });

    expect(result.current.photos[0].progress).toBe(50);

    await waitFor(() => {
      expect(result.current.photos[0].progress).toBe(100);
      expect(result.current.photos[0].status).toBe('approved');
    });
  });

  it('should handle concurrent photo additions', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add multiple photos concurrently
    const addPromises = Array.from({ length: 3 }, () =>
      act(async () => {
        await result.current.addPhoto();
      }),
    );

    await Promise.all(addPromises);

    await waitFor(() => {
      expect(result.current.photos).toHaveLength(3);
      expect(result.current.photos.filter((p) => p.status === 'approved')).toHaveLength(3);
    });
  });

  it('should persist photo state across re-renders', async () => {
    const { result, rerender } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    expect(result.current.photos).toHaveLength(1);

    // Re-render hook
    rerender();

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].status).toBe('approved');
  });

  it('should handle network timeouts during upload', async () => {
    mockUploadHygieneService.uploadWithRetry.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), 30000);
        }),
    );

    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    // Advance timers to trigger timeout
    jest.advanceTimersByTime(35000);

    await waitFor(() => {
      expect(result.current.photos[0].status).toBe('error');
    });

    expect(result.current.errors).toContain('Upload timed out');
  });

  it('should provide accessibility labels for screen readers', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    await act(async () => {
      await result.current.addPhoto();
    });

    await waitFor(() => {
      expect(result.current.photos[0].status).toBe('approved');
    });

    // Check accessibility properties
    expect(result.current.accessibilityLabels.addPhotoButton).toBe('Add photo to pet profile');
    expect(result.current.accessibilityLabels.photoCount).toBe('1 of 6 photos added');
    expect(result.current.accessibilityLabels.primaryPhotoIndicator).toBe('Primary photo');
  });

  it('should handle memory pressure by clearing processed images', async () => {
    const { result } = renderHook(() => usePhotoManagement(mockPetId));

    // Add several photos
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.addPhoto();
      });
    }

    await waitFor(() => {
      expect(result.current.photos.filter((p) => p.status === 'approved')).toHaveLength(5);
    });

    // Simulate memory warning
    act(() => {
      result.current.handleMemoryWarning();
    });

    // Should still have all photos but may have cleared some cached data
    expect(result.current.photos).toHaveLength(5);
    expect(result.current.memoryOptimized).toBe(true);
  });
});
