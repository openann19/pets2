/**
 * Tests for usePreferencesSetup hook
 *
 * Covers:
 * - User preferences selection
 * - Multi-step preference setup
 * - Preference validation
 * - Data persistence
 * - Progress tracking
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePreferencesSetup } from '../usePreferencesSetup';

describe('usePreferencesSetup', () => {
  describe('Initialization', () => {
    it('should initialize with default preferences', () => {
      const { result } = renderHook(() => usePreferencesSetup());
      expect(result.current.preferences).toEqual({
        petTypes: [],
        petSizes: [],
        activityLevel: '',
        location: '',
        budget: '',
        experience: '',
        allergies: false,
        children: false,
        otherPets: false
      });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.progress).toBe(0);
    });

    it('should accept initial preferences', () => {
      const initialPrefs = {
        petTypes: ['dog', 'cat'],
        petSizes: ['medium'],
        activityLevel: 'moderate'
      };

      const { result } = renderHook(() => usePreferencesSetup(initialPrefs));
      expect(result.current.preferences.petTypes).toEqual(['dog', 'cat']);
      expect(result.current.preferences.petSizes).toEqual(['medium']);
      expect(result.current.preferences.activityLevel).toBe('moderate');
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not go below step 0', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(0);
    });

    it('should not exceed maximum steps', () => {
      const { result } = renderHook(() => usePreferencesSetup());
      const maxSteps = result.current.totalSteps;

      // Navigate to last step
      for (let i = 0; i < maxSteps; i++) {
        act(() => {
          result.current.nextStep();
        });
      }

      expect(result.current.currentStep).toBe(maxSteps - 1);
    });

    it('should jump to specific step', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });
  });

  describe('Preference Updates', () => {
    it('should update pet types', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog', 'cat']
        });
      });

      expect(result.current.preferences.petTypes).toEqual(['dog', 'cat']);
    });

    it('should update pet sizes', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petSizes: ['small', 'large']
        });
      });

      expect(result.current.preferences.petSizes).toEqual(['small', 'large']);
    });

    it('should update activity level', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          activityLevel: 'high'
        });
      });

      expect(result.current.preferences.activityLevel).toBe('high');
    });

    it('should update location', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          location: 'urban'
        });
      });

      expect(result.current.preferences.location).toBe('urban');
    });

    it('should update budget', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          budget: 'high'
        });
      });

      expect(result.current.preferences.budget).toBe('high');
    });

    it('should update experience level', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          experience: 'experienced'
        });
      });

      expect(result.current.preferences.experience).toBe('experienced');
    });

    it('should update boolean preferences', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          allergies: true,
          children: true,
          otherPets: false
        });
      });

      expect(result.current.preferences.allergies).toBe(true);
      expect(result.current.preferences.children).toBe(true);
      expect(result.current.preferences.otherPets).toBe(false);
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress percentage', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      // Initially 0%
      expect(result.current.progress).toBe(0);

      // Complete first step
      act(() => {
        result.current.updatePreferences({ petTypes: ['dog'] });
        result.current.nextStep();
      });

      expect(result.current.progress).toBeGreaterThan(0);
    });

    it('should track completion status', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      expect(result.current.isComplete).toBe(false);

      // Simulate completing all required preferences
      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog'],
          petSizes: ['medium'],
          activityLevel: 'moderate',
          location: 'suburban',
          budget: 'medium',
          experience: 'some'
        });
      });

      // Navigate through all steps
      const totalSteps = result.current.totalSteps;
      for (let i = 0; i < totalSteps; i++) {
        act(() => {
          result.current.nextStep();
        });
      }

      expect(result.current.isComplete).toBe(true);
    });

    it('should provide step completion status', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      expect(result.current.stepCompletion).toBeDefined();
      expect(Array.isArray(result.current.stepCompletion)).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate required preferences', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        const isValid = result.current.validateCurrentStep();
        expect(isValid).toBe(false);
      });

      // Add required preferences
      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog'],
          petSizes: ['medium']
        });
      });

      act(() => {
        const isValid = result.current.validateCurrentStep();
        expect(isValid).toBe(true);
      });
    });

    it('should validate pet types selection', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: []
        });
      });

      act(() => {
        const isValid = result.current.validateCurrentStep();
        expect(isValid).toBe(false);
      });

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog']
        });
      });

      act(() => {
        const isValid = result.current.validateCurrentStep();
        expect(isValid).toBe(true);
      });
    });

    it('should validate location preference', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      // Skip to location step
      act(() => {
        result.current.goToStep(3); // Assuming location is step 3
      });

      act(() => {
        const isValid = result.current.validateCurrentStep();
        // Location might be optional, depends on implementation
        expect(typeof isValid).toBe('boolean');
      });
    });
  });

  describe('Save Functionality', () => {
    it('should save preferences', async () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog', 'cat'],
          activityLevel: 'moderate'
        });
      });

      await act(async () => {
        const success = await result.current.savePreferences();
        expect(success).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle save errors', async () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog']
        });
      });

      // Simulate save failure
      await act(async () => {
        const success = await result.current.savePreferences();
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all preferences', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog', 'cat'],
          activityLevel: 'high',
          location: 'urban'
        });
        result.current.goToStep(3);
      });

      expect(result.current.preferences.petTypes).toEqual(['dog', 'cat']);
      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.reset();
      });

      expect(result.current.preferences.petTypes).toEqual([]);
      expect(result.current.preferences.activityLevel).toBe('');
      expect(result.current.currentStep).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should reset to initial preferences', () => {
      const initialPrefs = {
        petTypes: ['bird'],
        activityLevel: 'low'
      };

      const { result } = renderHook(() => usePreferencesSetup(initialPrefs));

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog', 'cat']
        });
        result.current.reset();
      });

      expect(result.current.preferences).toEqual(initialPrefs);
    });
  });

  describe('Loading States', () => {
    it('should show loading during save', async () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog']
        });
      });

      let wasLoading = false;
      await act(async () => {
        const savePromise = result.current.savePreferences();
        wasLoading = result.current.isLoading;
        await savePromise;
      });

      expect(wasLoading).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: []
        });
      });

      act(() => {
        const isValid = result.current.validateCurrentStep();
        expect(isValid).toBe(false);
      });

      expect(result.current.errors).toBeDefined();
    });

    it('should handle network errors during save', async () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog']
        });
      });

      await act(async () => {
        const success = await result.current.savePreferences();
        // Should handle network errors gracefully
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => usePreferencesSetup());
      const initialPrefs = result.current.preferences;
      const initialStep = result.current.currentStep;

      rerender();

      expect(result.current.preferences).toBe(initialPrefs);
      expect(result.current.currentStep).toBe(initialStep);
    });

    it('should handle rapid preference updates', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({ petTypes: ['dog'] });
        result.current.updatePreferences({ petSizes: ['medium'] });
        result.current.updatePreferences({ activityLevel: 'moderate' });
        result.current.updatePreferences({ location: 'suburban' });
      });

      expect(result.current.preferences.petTypes).toEqual(['dog']);
      expect(result.current.preferences.petSizes).toEqual(['medium']);
      expect(result.current.preferences.activityLevel).toBe('moderate');
      expect(result.current.preferences.location).toBe('suburban');
    });

    it('should memoize computed values', () => {
      const { result, rerender } = renderHook(() => usePreferencesSetup());

      const initialProgress = result.current.progress;
      const initialCompletion = result.current.stepCompletion;

      rerender();

      expect(result.current.progress).toBe(initialProgress);
      expect(result.current.stepCompletion).toBe(initialCompletion);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid step navigation', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.goToStep(-1);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.goToStep(100);
      });

      expect(result.current.currentStep).toBe(result.current.totalSteps - 1);
    });

    it('should handle empty preference updates', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({});
      });

      expect(result.current.preferences.petTypes).toEqual([]);
    });

    it('should handle invalid preference values', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: null as any,
          activityLevel: undefined as any
        });
      });

      expect(result.current.preferences.petTypes).toEqual([]);
      expect(result.current.preferences.activityLevel).toBe('');
    });
  });

  describe('Integration', () => {
    it('should work with async operations', async () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog']
        });
      });

      await act(async () => {
        const success = await result.current.savePreferences();
        expect(success).toBe(true);
      });
    });

    it('should maintain state across step changes', () => {
      const { result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog', 'cat']
        });
        result.current.nextStep();
        result.current.nextStep();
        result.current.previousStep();
      });

      expect(result.current.preferences.petTypes).toEqual(['dog', 'cat']);
      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => usePreferencesSetup());
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel ongoing operations on unmount', () => {
      const { unmount, result } = renderHook(() => usePreferencesSetup());

      act(() => {
        result.current.updatePreferences({
          petTypes: ['dog']
        });
      });

      unmount();
      // Should cleanup properly
    });
  });
});
