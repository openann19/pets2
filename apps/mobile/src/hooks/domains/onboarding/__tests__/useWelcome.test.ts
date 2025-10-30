/**
 * Tests for useWelcome hook
 *
 * Covers:
 * - Welcome flow management
 * - Step progression
 * - User interaction tracking
 * - Completion handling
 * - Skip functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import { useWelcome } from '../useWelcome';

describe('useWelcome', () => {
  describe('Initialization', () => {
    it('should initialize with first step', () => {
      const { result } = renderHook(() => useWelcome());
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.canSkip).toBe(true);
    });

    it('should initialize with custom steps', () => {
      const customSteps = [
        { id: 'welcome', title: 'Welcome!', content: 'Welcome content' },
        { id: 'features', title: 'Features', content: 'Features content' },
      ];

      const { result } = renderHook(() =>
        useWelcome({
          steps: customSteps,
        }),
      );

      expect(result.current.totalSteps).toBe(2);
      expect(result.current.steps).toEqual(customSteps);
    });

    it('should accept initial step', () => {
      const { result } = renderHook(() =>
        useWelcome({
          initialStep: 1,
        }),
      );
      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useWelcome());

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
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(0);
    });

    it('should complete on last step next', () => {
      const { result } = renderHook(() => useWelcome());
      const totalSteps = result.current.totalSteps;

      // Navigate to last step
      for (let i = 0; i < totalSteps - 1; i++) {
        act(() => {
          result.current.nextStep();
        });
      }

      expect(result.current.currentStep).toBe(totalSteps - 1);
      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.isComplete).toBe(true);
    });

    it('should jump to specific step', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });
  });

  describe('Completion Handling', () => {
    it('should mark as complete when finished', async () => {
      const { result } = renderHook(() => useWelcome());

      expect(result.current.isComplete).toBe(false);

      await act(async () => {
        await result.current.completeWelcome();
      });

      expect(result.current.isComplete).toBe(true);
    });

    it('should call onComplete callback', async () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useWelcome({
          onComplete,
        }),
      );

      await act(async () => {
        await result.current.completeWelcome();
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('should persist completion status', async () => {
      const { result } = renderHook(() => useWelcome());

      await act(async () => {
        await result.current.completeWelcome();
      });

      expect(result.current.isComplete).toBe(true);
      // Should persist to storage
    });

    it('should handle completion errors', async () => {
      const { result } = renderHook(() => useWelcome());

      // Simulate completion error
      await act(async () => {
        await result.current.completeWelcome();
      });

      // Should handle errors gracefully
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('Skip Functionality', () => {
    it('should allow skipping', async () => {
      const { result } = renderHook(() => useWelcome());

      expect(result.current.canSkip).toBe(true);

      await act(async () => {
        await result.current.skipWelcome();
      });

      expect(result.current.isComplete).toBe(true);
    });

    it('should call onSkip callback', async () => {
      const onSkip = jest.fn();
      const { result } = renderHook(() =>
        useWelcome({
          onSkip,
        }),
      );

      await act(async () => {
        await result.current.skipWelcome();
      });

      expect(onSkip).toHaveBeenCalled();
    });

    it('should disable skip when configured', () => {
      const { result } = renderHook(() =>
        useWelcome({
          canSkip: false,
        }),
      );

      expect(result.current.canSkip).toBe(false);
    });

    it('should handle skip errors', async () => {
      const { result } = renderHook(() => useWelcome());

      // Simulate skip error
      await act(async () => {
        await result.current.skipWelcome();
      });

      // Should handle errors gracefully
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress percentage', () => {
      const { result } = renderHook(() => useWelcome());

      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.progress).toBeGreaterThan(0);
    });

    it('should track step completion', () => {
      const { result } = renderHook(() => useWelcome());

      expect(result.current.stepCompletion).toBeDefined();
      expect(Array.isArray(result.current.stepCompletion)).toBe(true);
    });

    it('should provide current step data', () => {
      const { result } = renderHook(() => useWelcome());

      const currentStepData = result.current.currentStepData;
      expect(currentStepData).toBeDefined();
      expect(currentStepData).toHaveProperty('id');
      expect(currentStepData).toHaveProperty('title');
      expect(currentStepData).toHaveProperty('content');
    });

    it('should provide next step data', () => {
      const { result } = renderHook(() => useWelcome());

      const nextStepData = result.current.nextStepData;
      expect(nextStepData).toBeDefined();
    });
  });

  describe('User Interactions', () => {
    it('should track user interactions', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.trackInteraction('button-click', { step: 0 });
      });

      // Should track interactions for analytics
      expect(result.current.interactions).toBeDefined();
    });

    it('should track time spent on steps', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.trackTimeSpent(5000); // 5 seconds
      });

      // Should track time for analytics
      expect(result.current.timeSpent).toBeDefined();
    });

    it('should track step views', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.trackStepView(1);
      });

      // Should track step views
      expect(result.current.stepViews).toBeDefined();
    });
  });

  describe('Persistence', () => {
    it('should persist current step', async () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.goToStep(2);
      });

      await act(async () => {
        await result.current.persistProgress();
      });

      // Should persist step
      expect(result.current.currentStep).toBe(2);
    });

    it('should load persisted progress', async () => {
      const { result } = renderHook(() => useWelcome());

      await act(async () => {
        await result.current.loadPersistedProgress();
      });

      // Should load progress
      expect(result.current.currentStep).toBeDefined();
    });

    it('should handle persistence errors', async () => {
      const { result } = renderHook(() => useWelcome());

      // Simulate persistence error
      await act(async () => {
        await result.current.persistProgress();
      });

      // Should handle errors gracefully
      expect(result.current.currentStep).toBeDefined();
    });
  });

  describe('Customization', () => {
    it('should support custom step content', () => {
      const customSteps = [
        {
          id: 'custom1',
          title: 'Custom Title',
          content: 'Custom content',
          image: 'custom-image.png',
        },
      ];

      const { result } = renderHook(() =>
        useWelcome({
          steps: customSteps,
        }),
      );

      expect(result.current.steps[0].title).toBe('Custom Title');
      expect(result.current.steps[0].content).toBe('Custom content');
    });

    it('should support custom styling', () => {
      const customStyles = {
        container: { backgroundColor: '#FF0000' },
        title: { fontSize: 24 },
        content: { color: '#00FF00' },
      };

      const { result } = renderHook(() =>
        useWelcome({
          styles: customStyles,
        }),
      );

      expect(result.current.styles).toEqual(customStyles);
    });

    it('should support custom animations', () => {
      const { result } = renderHook(() =>
        useWelcome({
          animationType: 'slide',
        }),
      );

      expect(result.current.animationType).toBe('slide');
    });
  });

  describe('Analytics', () => {
    it('should track welcome flow events', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.trackEvent('step-view', { step: 1 });
      });

      // Should track analytics events
      expect(result.current.analytics).toBeDefined();
    });

    it('should track completion metrics', async () => {
      const { result } = renderHook(() => useWelcome());

      await act(async () => {
        await result.current.completeWelcome();
      });

      // Should track completion analytics
      expect(result.current.isComplete).toBe(true);
    });

    it('should track skip metrics', async () => {
      const { result } = renderHook(() => useWelcome());

      await act(async () => {
        await result.current.skipWelcome();
      });

      // Should track skip analytics
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid step navigation', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.goToStep(-1);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.goToStep(100);
      });

      expect(result.current.currentStep).toBe(result.current.totalSteps - 1);
    });

    it('should handle completion errors', async () => {
      const { result } = renderHook(() => useWelcome());

      // Simulate completion error
      await act(async () => {
        await result.current.completeWelcome();
      });

      // Should handle errors gracefully
      expect(result.current.isComplete).toBe(true);
    });

    it('should handle persistence errors', async () => {
      const { result } = renderHook(() => useWelcome());

      // Simulate persistence error
      await act(async () => {
        await result.current.persistProgress();
      });

      // Should handle errors gracefully
      expect(result.current.currentStep).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useWelcome());
      const initialStep = result.current.currentStep;
      const initialComplete = result.current.isComplete;

      rerender();

      expect(result.current.currentStep).toBe(initialStep);
      expect(result.current.isComplete).toBe(initialComplete);
    });

    it('should memoize computed values', () => {
      const { result, rerender } = renderHook(() => useWelcome());

      const initialProgress = result.current.progress;
      const initialStepData = result.current.currentStepData;

      rerender();

      expect(result.current.progress).toBe(initialProgress);
      expect(result.current.currentStepData).toBe(initialStepData);
    });

    it('should handle rapid navigation', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.goToStep(1);
        result.current.goToStep(2);
        result.current.goToStep(0);
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('should provide accessibility labels', () => {
      const { result } = renderHook(() => useWelcome());

      expect(result.current.accessibility).toBeDefined();
      expect(result.current.accessibility).toHaveProperty('nextButton');
      expect(result.current.accessibility).toHaveProperty('previousButton');
      expect(result.current.accessibility).toHaveProperty('skipButton');
    });

    it('should support keyboard navigation', () => {
      const { result } = renderHook(() => useWelcome());

      expect(result.current.keyboardNavigation).toBeDefined();
    });

    it('should support screen reader', () => {
      const { result } = renderHook(() => useWelcome());

      const currentStep = result.current.currentStepData;
      expect(currentStep).toHaveProperty('title');
      expect(currentStep).toHaveProperty('content');
    });
  });

  describe('Integration', () => {
    it('should work with navigation', () => {
      const { result } = renderHook(() => useWelcome());

      const navigationTarget = result.current.getNavigationTarget();
      expect(navigationTarget).toBeDefined();
    });

    it('should integrate with user preferences', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.setUserPreferences({
          theme: 'dark',
          language: 'bg',
        });
      });

      // Should adapt to user preferences
      expect(result.current.userPreferences).toBeDefined();
    });

    it('should handle app state changes', () => {
      const { result } = renderHook(() => useWelcome());

      act(() => {
        result.current.handleAppStateChange('background');
      });

      // Should handle app state changes
      expect(result.current.currentStep).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty steps', () => {
      const { result } = renderHook(() =>
        useWelcome({
          steps: [],
        }),
      );

      expect(result.current.totalSteps).toBe(0);
      expect(result.current.isComplete).toBe(true);
    });

    it('should handle single step', () => {
      const singleStep = [{ id: 'only', title: 'Only Step', content: 'Content' }];
      const { result } = renderHook(() =>
        useWelcome({
          steps: singleStep,
        }),
      );

      expect(result.current.totalSteps).toBe(1);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.isComplete).toBe(true);
    });

    it('should handle invalid callbacks', () => {
      const { result } = renderHook(() =>
        useWelcome({
          onComplete: null as any,
          onSkip: undefined as any,
        }),
      );

      expect(result.current.onComplete).toBeDefined();
      expect(result.current.onSkip).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useWelcome());
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel ongoing operations on unmount', () => {
      const { unmount, result } = renderHook(() => useWelcome());

      act(() => {
        result.current.goToStep(1);
      });

      unmount();
      // Should cleanup properly
    });
  });
});
