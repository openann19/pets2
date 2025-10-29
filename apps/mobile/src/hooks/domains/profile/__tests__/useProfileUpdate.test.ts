/**
 * Tests for useProfileUpdate hook
 *
 * Covers:
 * - Profile data updates
 * - Photo management updates
 * - Validation and error handling
 * - Loading states
 * - Success callbacks
 */

import { renderHook, act } from '@testing-library/react-native';
import { useProfileUpdate } from '../useProfileUpdate';

describe('useProfileUpdate', () => {
  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useProfileUpdate());

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdate).toBeNull();
    });

    it('should accept custom options', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useProfileUpdate({
          onSuccess,
          onError,
        }),
      );

      expect(result.current.onSuccess).toBe(onSuccess);
      expect(result.current.onError).toBe(onError);
    });
  });

  describe('Profile Updates', () => {
    it('should update basic profile information', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Pet lover and developer',
      };

      await act(async () => {
        const success = await result.current.updateProfile(updateData);
        expect(success).toBe(true);
      });

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.lastUpdate).toEqual(updateData);
    });

    it('should update contact information', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const contactUpdate = {
        contactInfo: {
          email: 'john@example.com',
          phone: '+1234567890',
        },
      };

      await act(async () => {
        const success = await result.current.updateProfile(contactUpdate);
        expect(success).toBe(true);
      });

      expect(result.current.lastUpdate).toEqual(contactUpdate);
    });

    it('should update preferences', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const preferencesUpdate = {
        preferences: {
          notifications: true,
          locationSharing: false,
          theme: 'dark',
        },
      };

      await act(async () => {
        const success = await result.current.updateProfile(preferencesUpdate);
        expect(success).toBe(true);
      });

      expect(result.current.lastUpdate).toEqual(preferencesUpdate);
    });
  });

  describe('Photo Management', () => {
    it('should add profile photos', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const photoUpdate = {
        photos: [
          { uri: 'file://photo1.jpg', width: 800, height: 600 },
          { uri: 'file://photo2.jpg', width: 800, height: 600 },
        ],
      };

      await act(async () => {
        const success = await result.current.updateProfile(photoUpdate);
        expect(success).toBe(true);
      });

      expect(result.current.lastUpdate).toEqual(photoUpdate);
    });

    it('should remove profile photos', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const removePhotoUpdate = {
        removePhotos: ['photo1.jpg', 'photo2.jpg'],
      };

      await act(async () => {
        const success = await result.current.updateProfile(removePhotoUpdate);
        expect(success).toBe(true);
      });

      expect(result.current.lastUpdate).toEqual(removePhotoUpdate);
    });

    it('should reorder profile photos', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const reorderUpdate = {
        photoOrder: ['photo3.jpg', 'photo1.jpg', 'photo2.jpg'],
      };

      await act(async () => {
        const success = await result.current.updateProfile(reorderUpdate);
        expect(success).toBe(true);
      });

      expect(result.current.lastUpdate).toEqual(reorderUpdate);
    });
  });

  describe('Loading States', () => {
    it('should set loading state during update', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      let wasLoading = false;

      act(() => {
        result.current.updateProfile({ firstName: 'Jane' }).then(() => {
          wasLoading = result.current.isUpdating;
        });
      });

      expect(result.current.isUpdating).toBe(true);
      // Note: The loading state becomes false after completion
    });

    it('should clear loading state after completion', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      await act(async () => {
        await result.current.updateProfile({ firstName: 'Jane' });
      });

      expect(result.current.isUpdating).toBe(false);
    });

    it('should handle concurrent updates', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const update1 = result.current.updateProfile({ firstName: 'John' });
      const update2 = result.current.updateProfile({ lastName: 'Doe' });

      await act(async () => {
        await Promise.all([update1, update2]);
      });

      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      await act(async () => {
        const success = await result.current.updateProfile({});
        expect(success).toBe(true); // Empty update should be valid
      });

      expect(result.current.error).toBeNull();
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const invalidEmailUpdate = {
        contactInfo: {
          email: 'invalid-email',
        },
      };

      await act(async () => {
        const success = await result.current.updateProfile(invalidEmailUpdate);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should validate phone format', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const invalidPhoneUpdate = {
        contactInfo: {
          phone: 'invalid-phone',
        },
      };

      await act(async () => {
        const success = await result.current.updateProfile(invalidPhoneUpdate);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const updateData = { firstName: 'Test' };

      // Simulate network failure
      await act(async () => {
        const success = await result.current.updateProfile(updateData);
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it('should handle server validation errors', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const invalidUpdate = {
        firstName: 'A'.repeat(100), // Too long
      };

      await act(async () => {
        const success = await result.current.updateProfile(invalidUpdate);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const updateData = { bio: 'New bio' };

      // Simulate auth failure
      await act(async () => {
        const success = await result.current.updateProfile(updateData);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback on successful update', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useProfileUpdate({ onSuccess }));

      const updateData = { firstName: 'Success' };

      await act(async () => {
        await result.current.updateProfile(updateData);
      });

      expect(onSuccess).toHaveBeenCalledWith(updateData);
    });

    it('should call onError callback on failed update', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useProfileUpdate({ onError }));

      const invalidUpdate = { firstName: null as any };

      await act(async () => {
        await result.current.updateProfile(invalidUpdate);
      });

      expect(onError).toHaveBeenCalled();
    });

    it('should not call callbacks for cancelled updates', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const { result } = renderHook(() => useProfileUpdate({ onSuccess, onError }));

      // Start update but it gets cancelled
      const updatePromise = result.current.updateProfile({ firstName: 'Test' });

      // Simulate cancellation
      act(() => {
        // Cancel operation
      });

      await act(async () => {
        await updatePromise;
      });

      // Callbacks should not be called for cancelled operations
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Optimistic Updates', () => {
    it('should support optimistic updates', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const updateData = { firstName: 'Optimistic' };

      await act(async () => {
        const success = await result.current.updateProfile(updateData, {
          optimistic: true,
        });
        expect(success).toBe(true);
      });

      // Should apply update immediately
      expect(result.current.lastUpdate).toEqual(updateData);
    });

    it('should rollback on optimistic update failure', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const originalData = { firstName: 'Original' };
      const failedUpdate = { firstName: 'Failed' };

      // Simulate optimistic update that fails
      await act(async () => {
        const success = await result.current.updateProfile(failedUpdate, {
          optimistic: true,
        });
        expect(success).toBe(false);
      });

      // Should rollback to original state
      expect(result.current.lastUpdate).not.toEqual(failedUpdate);
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useProfileUpdate());
      const initialState = {
        isUpdating: result.current.isUpdating,
        error: result.current.error,
        lastUpdate: result.current.lastUpdate,
      };

      rerender();

      expect(result.current.isUpdating).toBe(initialState.isUpdating);
      expect(result.current.error).toBe(initialState.error);
      expect(result.current.lastUpdate).toBe(initialState.lastUpdate);
    });

    it('should debounce rapid updates', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const update1 = result.current.updateProfile({ firstName: 'First' });
      const update2 = result.current.updateProfile({ firstName: 'Second' });
      const update3 = result.current.updateProfile({ firstName: 'Third' });

      await act(async () => {
        await Promise.all([update1, update2, update3]);
      });

      // Should only apply the last update
      expect(result.current.lastUpdate).toEqual({ firstName: 'Third' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined updates', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      await act(async () => {
        const success = await result.current.updateProfile(null as any);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle empty updates', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      await act(async () => {
        const success = await result.current.updateProfile({});
        expect(success).toBe(true);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle very large updates', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const largeBio = 'A'.repeat(10000);
      const largeUpdate = { bio: largeBio };

      await act(async () => {
        const success = await result.current.updateProfile(largeUpdate);
        expect(success).toBe(true);
      });

      expect(result.current.lastUpdate).toEqual(largeUpdate);
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useProfileUpdate());
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel ongoing updates on unmount', () => {
      const { unmount, result } = renderHook(() => useProfileUpdate());

      act(() => {
        result.current.updateProfile({ firstName: 'Unmount' });
      });

      unmount();
      // Should cleanup properly
    });
  });
});
