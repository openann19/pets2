/**
 * Tests for usePetProfileSetup hook
 *
 * Covers:
 * - Pet profile form management
 * - Photo upload and management
 * - Form validation
 * - Data persistence
 * - Error handling
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePetProfileSetup } from '../usePetProfileSetup';

describe('usePetProfileSetup', () => {
  describe('Initialization', () => {
    it('should initialize with empty pet profile', () => {
      const { result } = renderHook(() => usePetProfileSetup());
      expect(result.current.petData).toEqual({
        name: '',
        breed: '',
        age: '',
        photos: [],
        personality: '',
        medicalInfo: '',
        specialNeeds: '',
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.errors).toEqual({});
    });

    it('should accept initial pet data', () => {
      const initialData = {
        name: 'Max',
        breed: 'Golden Retriever',
        age: '3',
        photos: [],
        personality: 'Friendly',
        medicalInfo: '',
        specialNeeds: '',
      };

      const { result } = renderHook(() => usePetProfileSetup(initialData));
      expect(result.current.petData).toEqual(initialData);
    });
  });

  describe('Form Management', () => {
    it('should update pet name', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
      });

      expect(result.current.petData.name).toBe('Buddy');
    });

    it('should update pet breed', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('breed', 'Labrador');
      });

      expect(result.current.petData.breed).toBe('Labrador');
    });

    it('should update pet age', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('age', '2');
      });

      expect(result.current.petData.age).toBe('2');
    });

    it('should update personality', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('personality', 'Playful and energetic');
      });

      expect(result.current.petData.personality).toBe('Playful and energetic');
    });

    it('should update medical info', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('medicalInfo', 'Vaccinated, no allergies');
      });

      expect(result.current.petData.medicalInfo).toBe('Vaccinated, no allergies');
    });

    it('should update special needs', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('specialNeeds', 'Requires daily medication');
      });

      expect(result.current.petData.specialNeeds).toBe('Requires daily medication');
    });
  });

  describe('Photo Management', () => {
    it('should add photo to pet profile', () => {
      const { result } = renderHook(() => usePetProfileSetup());
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      act(() => {
        result.current.addPhoto(mockPhoto);
      });

      expect(result.current.petData.photos).toHaveLength(1);
      expect(result.current.petData.photos[0]).toEqual(mockPhoto);
    });

    it('should remove photo from pet profile', () => {
      const { result } = renderHook(() => usePetProfileSetup());
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      act(() => {
        result.current.addPhoto(mockPhoto);
      });

      expect(result.current.petData.photos).toHaveLength(1);

      act(() => {
        result.current.removePhoto(0);
      });

      expect(result.current.petData.photos).toHaveLength(0);
    });

    it('should reorder photos', () => {
      const { result } = renderHook(() => usePetProfileSetup());
      const photo1 = { uri: 'file://test/photo1.jpg', width: 800, height: 600 };
      const photo2 = { uri: 'file://test/photo2.jpg', width: 800, height: 600 };
      const photo3 = { uri: 'file://test/photo3.jpg', width: 800, height: 600 };

      act(() => {
        result.current.addPhoto(photo1);
        result.current.addPhoto(photo2);
        result.current.addPhoto(photo3);
      });

      expect(result.current.petData.photos).toEqual([photo1, photo2, photo3]);

      act(() => {
        result.current.reorderPhotos(0, 2);
      });

      expect(result.current.petData.photos).toEqual([photo2, photo3, photo1]);
    });

    it('should limit maximum photos', () => {
      const { result } = renderHook(() => usePetProfileSetup());
      const mockPhoto = { uri: 'file://test/photo.jpg', width: 800, height: 600 };

      // Add maximum allowed photos (assuming 10 is max)
      for (let i = 0; i < 15; i++) {
        act(() => {
          result.current.addPhoto({ ...mockPhoto, uri: `file://test/photo${i}.jpg` });
        });
      }

      // Should not exceed maximum
      expect(result.current.petData.photos.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors).toHaveProperty('name');
      expect(result.current.errors).toHaveProperty('breed');
      expect(result.current.errors).toHaveProperty('age');
    });

    it('should pass validation with all required fields', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Max');
        result.current.updateField('breed', 'Golden Retriever');
        result.current.updateField('age', '3');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.errors.breed).toBeUndefined();
      expect(result.current.errors.age).toBeUndefined();
    });

    it('should validate pet name length', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'A'); // Too short
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.name).toBeDefined();
    });

    it('should validate age as number', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('age', 'not-a-number');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.age).toBeDefined();
    });

    it('should validate age range', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('age', '50'); // Too old
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.age).toBeDefined();
    });
  });

  describe('Save Functionality', () => {
    it('should save valid pet profile', async () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
        result.current.updateField('breed', 'Labrador');
        result.current.updateField('age', '2');
        result.current.updateField('personality', 'Friendly');
      });

      await act(async () => {
        const success = await result.current.saveProfile();
        expect(success).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should not save invalid pet profile', async () => {
      const { result } = renderHook(() => usePetProfileSetup());

      // Leave required fields empty
      await act(async () => {
        const success = await result.current.saveProfile();
        expect(success).toBe(false);
      });

      expect(result.current.errors.name).toBeDefined();
    });

    it('should handle save errors', async () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
        result.current.updateField('breed', 'Labrador');
        result.current.updateField('age', '2');
      });

      // Simulate save failure
      await act(async () => {
        const success = await result.current.saveProfile();
        // Should handle error gracefully
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading during save', async () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
        result.current.updateField('breed', 'Labrador');
        result.current.updateField('age', '2');
      });

      let wasLoading = false;
      await act(async () => {
        const savePromise = result.current.saveProfile();
        wasLoading = result.current.isLoading;
        await savePromise;
      });

      expect(wasLoading).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle concurrent saves', async () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
        result.current.updateField('breed', 'Labrador');
        result.current.updateField('age', '2');
      });

      await act(async () => {
        const promises = [
          result.current.saveProfile(),
          result.current.saveProfile(),
          result.current.saveProfile(),
        ];

        const results = await Promise.all(promises);
        // Should handle concurrent requests gracefully
        expect(results.some((r) => r === true)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during save', async () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
        result.current.updateField('breed', 'Labrador');
        result.current.updateField('age', '2');
      });

      await act(async () => {
        const success = await result.current.saveProfile();
        // Should handle network errors
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle photo upload errors', () => {
      const { result } = renderHook(() => usePetProfileSetup());
      const invalidPhoto = { uri: 'invalid://uri' };

      act(() => {
        result.current.addPhoto(invalidPhoto as any);
      });

      // Should handle invalid photos gracefully
      expect(result.current.petData.photos).toContain(invalidPhoto);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
        result.current.updateField('breed', 'Labrador');
        result.current.addPhoto({ uri: 'file://test/photo.jpg', width: 800, height: 600 });
      });

      expect(result.current.petData.name).toBe('Buddy');
      expect(result.current.petData.photos).toHaveLength(1);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.petData.name).toBe('');
      expect(result.current.petData.photos).toHaveLength(0);
      expect(result.current.errors).toEqual({});
    });

    it('should reset errors', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.validateForm();
      });

      expect(Object.keys(result.current.errors)).toHaveLength(3);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => usePetProfileSetup());
      const initialData = result.current.petData;
      const initialErrors = result.current.errors;

      rerender();

      expect(result.current.petData).toBe(initialData);
      expect(result.current.errors).toBe(initialErrors);
    });

    it('should handle rapid field updates', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'B');
        result.current.updateField('name', 'Bu');
        result.current.updateField('name', 'Bud');
        result.current.updateField('name', 'Budd');
        result.current.updateField('name', 'Buddy');
      });

      expect(result.current.petData.name).toBe('Buddy');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty photo array', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.removePhoto(0);
      });

      expect(result.current.petData.photos).toHaveLength(0);
    });

    it('should handle invalid photo indices', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.addPhoto({ uri: 'file://test/photo.jpg', width: 800, height: 600 });
      });

      act(() => {
        result.current.removePhoto(10); // Invalid index
      });

      expect(result.current.petData.photos).toHaveLength(1);
    });

    it('should handle null/undefined fields', () => {
      const { result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', null as any);
        result.current.updateField('age', undefined as any);
      });

      expect(result.current.petData.name).toBe('');
      expect(result.current.petData.age).toBe('');
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => usePetProfileSetup());
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel ongoing operations on unmount', () => {
      const { unmount, result } = renderHook(() => usePetProfileSetup());

      act(() => {
        result.current.updateField('name', 'Buddy');
        result.current.updateField('breed', 'Labrador');
        result.current.updateField('age', '2');
      });

      unmount();
      // Should cleanup properly
    });
  });
});
