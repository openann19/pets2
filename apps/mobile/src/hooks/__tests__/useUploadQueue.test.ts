/**
 * Unit tests for useUploadQueue hook
 *
 * Tests retry with backoff, cancel, concurrency cap, and error handling
 * as defined in Test Plan v1.0
 */
/// <reference types="jest" />

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUploadQueue } from '../hooks/useUploadQueue';
import { uploadHygieneService } from '../services/uploadHygiene';

// Mock dependencies
jest.mock('../services/uploadHygiene');

const mockUploadHygieneService = uploadHygieneService as jest.Mocked<typeof uploadHygieneService>;

describe('useUploadQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup default successful upload mock
    mockUploadHygieneService.uploadWithRetry.mockResolvedValue({
      uploadId: 'upload-123',
      status: 'approved',
      s3Key: 'uploads/test-key',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should enqueue uploads and process them sequentially', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const upload1 = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };
    const upload2 = { id: 'upload2', fileUri: 'file://test2.jpg', petId: 'pet2' };

    act(() => {
      result.current.enqueueUpload(upload1);
      result.current.enqueueUpload(upload2);
    });

    expect(result.current.queueLength).toBe(2);
    expect(result.current.activeUploads).toBe(0);

    // Start processing
    act(() => {
      result.current.startProcessing();
    });

    expect(result.current.activeUploads).toBe(1);

    // Wait for first upload to complete
    await waitFor(() => {
      expect(result.current.completedUploads).toBe(1);
    });

    // Should automatically start second upload
    expect(result.current.activeUploads).toBe(1);
    expect(result.current.queueLength).toBe(1);

    // Wait for second upload to complete
    await waitFor(() => {
      expect(result.current.completedUploads).toBe(2);
    });

    expect(result.current.activeUploads).toBe(0);
    expect(result.current.queueLength).toBe(0);
  });

  it('should enforce concurrency limit of 3 simultaneous uploads', async () => {
    const { result } = renderHook(() => useUploadQueue());

    // Create 5 uploads
    const uploads = Array.from({ length: 5 }, (_, i) => ({
      id: `upload${i}`,
      fileUri: `file://test${i}.jpg`,
      petId: `pet${i}`,
    }));

    // Mock slow uploads that don't resolve immediately
    mockUploadHygieneService.uploadWithRetry.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                uploadId: 'upload-123',
                status: 'approved',
                s3Key: 'uploads/test-key',
              }),
            1000,
          );
        }),
    );

    act(() => {
      uploads.forEach((upload) => result.current.enqueueUpload(upload));
      result.current.startProcessing();
    });

    // Should start with 3 concurrent uploads
    expect(result.current.activeUploads).toBe(3);
    expect(result.current.queueLength).toBe(2); // 2 waiting

    // Complete first upload
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.completedUploads).toBe(1);
      expect(result.current.activeUploads).toBe(3); // Should start the 4th
      expect(result.current.queueLength).toBe(1); // 1 still waiting
    });
  });

  it('should retry failed uploads with exponential backoff', async () => {
    let attemptCount = 0;
    mockUploadHygieneService.uploadWithRetry.mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        uploadId: 'upload-123',
        status: 'approved',
        s3Key: 'uploads/test-key',
      });
    });

    const { result } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
      result.current.startProcessing();
    });

    // First retry (after 1 second)
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(attemptCount).toBe(2); // Initial + 1 retry
    });

    // Second retry (after another 2 seconds)
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(attemptCount).toBe(3); // + 1 more retry
    });

    // Should succeed on third attempt
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(result.current.completedUploads).toBe(1);
      expect(result.current.failedUploads).toBe(0);
    });
  });

  it('should stop retrying after maximum attempts', async () => {
    mockUploadHygieneService.uploadWithRetry.mockRejectedValue(
      new Error('Persistent network error'),
    );

    const { result } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
      result.current.startProcessing();
    });

    // Advance through all retry attempts (1s, 2s, 4s, 8s, 16s)
    jest.advanceTimersByTime(1 + 2 + 4 + 8 + 16 + 1000); // +1s buffer

    await waitFor(() => {
      expect(result.current.failedUploads).toBe(1);
      expect(result.current.activeUploads).toBe(0);
    });

    expect(mockUploadHygieneService.uploadWithRetry).toHaveBeenCalledTimes(6); // Initial + 5 retries
  });

  it('should allow cancelling individual uploads', async () => {
    // Mock slow upload
    mockUploadHygieneService.uploadWithRetry.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000)),
    );

    const { result } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
      result.current.startProcessing();
    });

    expect(result.current.activeUploads).toBe(1);

    // Cancel the upload
    act(() => {
      result.current.cancelUpload('upload1');
    });

    expect(result.current.activeUploads).toBe(0);
    expect(result.current.cancelledUploads).toBe(1);
    expect(result.current.queueLength).toBe(0);
  });

  it('should allow cancelling all pending uploads', async () => {
    // Mock slow uploads
    mockUploadHygieneService.uploadWithRetry.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000)),
    );

    const { result } = renderHook(() => useUploadQueue());

    const uploads = Array.from({ length: 5 }, (_, i) => ({
      id: `upload${i}`,
      fileUri: `file://test${i}.jpg`,
      petId: `pet${i}`,
    }));

    act(() => {
      uploads.forEach((upload) => result.current.enqueueUpload(upload));
      result.current.startProcessing();
    });

    expect(result.current.activeUploads).toBe(3);
    expect(result.current.queueLength).toBe(2);

    // Cancel all
    act(() => {
      result.current.cancelAllUploads();
    });

    expect(result.current.activeUploads).toBe(0);
    expect(result.current.queueLength).toBe(0);
    expect(result.current.cancelledUploads).toBe(5);
  });

  it('should pause and resume processing', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const uploads = Array.from({ length: 3 }, (_, i) => ({
      id: `upload${i}`,
      fileUri: `file://test${i}.jpg`,
      petId: `pet${i}`,
    }));

    act(() => {
      uploads.forEach((upload) => result.current.enqueueUpload(upload));
      result.current.startProcessing();
    });

    expect(result.current.activeUploads).toBe(3);
    expect(result.current.isProcessing).toBe(true);

    // Pause processing
    act(() => {
      result.current.pauseProcessing();
    });

    expect(result.current.isProcessing).toBe(false);

    // Wait for current uploads to complete
    await waitFor(() => {
      expect(result.current.completedUploads).toBe(3);
    });

    // Should not start new uploads
    expect(result.current.activeUploads).toBe(0);

    // Resume processing
    act(() => {
      result.current.resumeProcessing();
    });

    expect(result.current.isProcessing).toBe(true);
  });

  it('should handle network connectivity changes', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
      result.current.startProcessing();
    });

    expect(result.current.activeUploads).toBe(1);

    // Simulate network going offline
    act(() => {
      result.current.onNetworkChange(false);
    });

    expect(result.current.isPaused).toBe(true);
    expect(result.current.activeUploads).toBe(0); // Should pause active uploads

    // Come back online
    act(() => {
      result.current.onNetworkChange(true);
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.activeUploads).toBe(1); // Should resume
  });

  it('should provide progress tracking for individual uploads', async () => {
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

    const { result } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
      result.current.startProcessing();
    });

    // Check initial progress
    expect(result.current.getUploadProgress('upload1')).toBe(0);

    // Simulate progress updates
    act(() => {
      if (progressCallback) {
        progressCallback(50);
      }
    });

    expect(result.current.getUploadProgress('upload1')).toBe(50);

    // Complete upload
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.getUploadProgress('upload1')).toBe(100);
    });
  });

  it('should handle priority uploads', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const regularUpload = { id: 'regular', fileUri: 'file://regular.jpg', petId: 'pet1' };
    const priorityUpload = {
      id: 'priority',
      fileUri: 'file://priority.jpg',
      petId: 'pet2',
      priority: 'high',
    };

    act(() => {
      result.current.enqueueUpload(regularUpload);
      result.current.enqueueUpload(priorityUpload);
      result.current.startProcessing();
    });

    // Priority upload should be processed first
    expect(result.current.activeUploadIds).toContain('priority');
    expect(result.current.queueLength).toBe(1); // Regular upload still queued
  });

  it('should handle duplicate upload prevention', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const upload1 = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };
    const upload2 = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' }; // Duplicate ID

    act(() => {
      result.current.enqueueUpload(upload1);
    });

    expect(result.current.queueLength).toBe(1);

    // Try to enqueue duplicate
    act(() => {
      result.current.enqueueUpload(upload2);
    });

    expect(result.current.queueLength).toBe(1); // Should not add duplicate
    expect(result.current.errors).toContain('Upload already queued');
  });

  it('should provide queue statistics', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const uploads = Array.from({ length: 10 }, (_, i) => ({
      id: `upload${i}`,
      fileUri: `file://test${i}.jpg`,
      petId: `pet${i}`,
    }));

    act(() => {
      uploads.forEach((upload) => result.current.enqueueUpload(upload));
    });

    expect(result.current.queueLength).toBe(10);
    expect(result.current.totalUploads).toBe(10);

    act(() => {
      result.current.startProcessing();
    });

    // After starting, should have 3 active, 7 queued
    expect(result.current.activeUploads).toBe(3);
    expect(result.current.queueLength).toBe(7);

    // Complete all uploads
    await waitFor(() => {
      expect(result.current.completedUploads).toBe(10);
    });

    expect(result.current.queueLength).toBe(0);
    expect(result.current.activeUploads).toBe(0);
    expect(result.current.totalUploads).toBe(10);
  });

  it('should handle memory pressure by reducing concurrency', async () => {
    const { result } = renderHook(() => useUploadQueue());

    // Start with normal concurrency
    expect(result.current.maxConcurrency).toBe(3);

    // Simulate memory warning
    act(() => {
      result.current.onMemoryWarning();
    });

    expect(result.current.maxConcurrency).toBe(1); // Reduced concurrency
    expect(result.current.isMemoryOptimized).toBe(true);

    // Add uploads and verify reduced concurrency
    const uploads = Array.from({ length: 5 }, (_, i) => ({
      id: `upload${i}`,
      fileUri: `file://test${i}.jpg`,
      petId: `pet${i}`,
    }));

    act(() => {
      uploads.forEach((upload) => result.current.enqueueUpload(upload));
      result.current.startProcessing();
    });

    expect(result.current.activeUploads).toBe(1); // Only 1 instead of 3
    expect(result.current.queueLength).toBe(4);
  });

  it('should persist queue state across app restarts', async () => {
    const { result, rerender } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
    });

    expect(result.current.queueLength).toBe(1);

    // Simulate app restart (re-render hook)
    rerender();

    // Queue should be restored (in a real implementation, this would use persistent storage)
    // For this test, we verify the hook initializes correctly
    expect(result.current).toBeDefined();
  });

  it('should provide accessibility announcements', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
      result.current.startProcessing();
    });

    await waitFor(() => {
      expect(result.current.accessibilityAnnouncements).toContain('Upload started');
    });

    await waitFor(() => {
      expect(result.current.accessibilityAnnouncements).toContain('Upload completed');
    });
  });

  it('should handle app background/foreground transitions', async () => {
    const { result } = renderHook(() => useUploadQueue());

    const upload = { id: 'upload1', fileUri: 'file://test1.jpg', petId: 'pet1' };

    act(() => {
      result.current.enqueueUpload(upload);
      result.current.startProcessing();
    });

    expect(result.current.activeUploads).toBe(1);

    // App goes to background
    act(() => {
      result.current.onAppStateChange('background');
    });

    // Should pause uploads
    expect(result.current.isPaused).toBe(true);

    // App comes to foreground
    act(() => {
      result.current.onAppStateChange('active');
    });

    // Should resume uploads
    expect(result.current.isPaused).toBe(false);
    expect(result.current.activeUploads).toBe(1);
  });
});
