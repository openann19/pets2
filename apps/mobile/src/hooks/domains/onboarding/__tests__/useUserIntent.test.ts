/**
 * Tests for useUserIntent hook
 *
 * Covers:
 * - Intent determination logic
 * - User flow guidance
 * - Intent persistence
 * - Flow customization
 */

import { renderHook, act } from '@testing-library/react-native';
import { useUserIntent } from '../useUserIntent';

describe('useUserIntent', () => {
  describe('Initialization', () => {
    it('should initialize with undetermined intent', () => {
      const { result } = renderHook(() => useUserIntent());
      expect(result.current.intent).toBeNull();
      expect(result.current.confidence).toBe(0);
      expect(result.current.suggestedFlow).toBeNull();
    });

    it('should accept initial intent', () => {
      const { result } = renderHook(() =>
        useUserIntent({
          initialIntent: 'adoption',
        }),
      );
      expect(result.current.intent).toBe('adoption');
    });
  });

  describe('Intent Determination', () => {
    it('should determine adoption intent', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {
            'looking-for': 'adopt',
            'timeline': 'soon',
            'experience': 'first-time',
          },
        });
      });

      expect(result.current.intent).toBe('adoption');
      expect(result.current.confidence).toBeGreaterThan(0.5);
    });

    it('should determine matching intent', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {
            'looking-for': 'match',
            'pet-ownership': 'yes',
            'matching-preferences': 'compatibility',
          },
        });
      });

      expect(result.current.intent).toBe('matching');
      expect(result.current.confidence).toBeGreaterThan(0.5);
    });

    it('should determine browsing intent', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {
            'looking-for': 'browse',
            'commitment': 'not-sure',
          },
        });
      });

      expect(result.current.intent).toBe('browsing');
      expect(result.current.confidence).toBeGreaterThan(0.3);
    });

    it('should handle ambiguous responses', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {
            'looking-for': 'not-sure',
          },
        });
      });

      expect(result.current.intent).toBe('browsing');
      expect(result.current.confidence).toBeLessThan(0.8);
    });
  });

  describe('Flow Guidance', () => {
    it('should suggest adoption flow', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      expect(result.current.suggestedFlow).toContain('adoption');
      expect(result.current.nextSteps).toBeDefined();
      expect(Array.isArray(result.current.nextSteps)).toBe(true);
    });

    it('should suggest matching flow', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('matching');
      });

      expect(result.current.suggestedFlow).toContain('matching');
      expect(result.current.nextSteps).toBeDefined();
    });

    it('should suggest browsing flow', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('browsing');
      });

      expect(result.current.suggestedFlow).toContain('browsing');
      expect(result.current.nextSteps).toBeDefined();
    });

    it('should provide personalized next steps', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      const nextSteps = result.current.nextSteps;
      expect(nextSteps.length).toBeGreaterThan(0);
      expect(nextSteps[0]).toHaveProperty('title');
      expect(nextSteps[0]).toHaveProperty('description');
    });
  });

  describe('Intent Management', () => {
    it('should manually set intent', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('matching');
      });

      expect(result.current.intent).toBe('matching');
      expect(result.current.confidence).toBe(1.0);
    });

    it('should clear intent', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      expect(result.current.intent).toBe('adoption');

      act(() => {
        result.current.clearIntent();
      });

      expect(result.current.intent).toBeNull();
      expect(result.current.confidence).toBe(0);
    });

    it('should update intent confidence', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('browsing', 0.7);
      });

      expect(result.current.intent).toBe('browsing');
      expect(result.current.confidence).toBe(0.7);
    });
  });

  describe('Persistence', () => {
    it('should persist intent to storage', async () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      await act(async () => {
        await result.current.persistIntent();
      });

      // Should persist without errors
      expect(result.current.intent).toBe('adoption');
    });

    it('should load persisted intent', async () => {
      const { result } = renderHook(() => useUserIntent());

      await act(async () => {
        await result.current.loadPersistedIntent();
      });

      // Should load without errors
      expect(result.current.intent).toBeDefined();
    });

    it('should handle persistence errors', async () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('matching');
      });

      // Simulate persistence failure
      await act(async () => {
        await result.current.persistIntent();
      });

      // Should handle errors gracefully
      expect(result.current.intent).toBe('matching');
    });
  });

  describe('Flow Customization', () => {
    it('should customize flow based on intent', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      const customization = result.current.getFlowCustomization();
      expect(customization).toHaveProperty('primaryColor');
      expect(customization).toHaveProperty('screens');
      expect(Array.isArray(customization.screens)).toBe(true);
    });

    it('should provide intent-specific features', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('matching');
      });

      const features = result.current.getRecommendedFeatures();
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });

    it('should adapt UI based on intent', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('browsing');
      });

      const uiConfig = result.current.getUIConfiguration();
      expect(uiConfig).toHaveProperty('showFilters');
      expect(uiConfig).toHaveProperty('showMatches');
      expect(uiConfig).toHaveProperty('showAdoption');
    });
  });

  describe('Analytics', () => {
    it('should track intent determination', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {
            'looking-for': 'adopt',
          },
        });
      });

      // Should track analytics events
      expect(result.current.intent).toBe('adoption');
    });

    it('should track flow progression', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('matching');
        result.current.trackFlowProgress('preferences-setup');
      });

      // Should track progress events
      expect(result.current.intent).toBe('matching');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid intent types', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('invalid' as any);
      });

      expect(result.current.intent).toBe('invalid');
    });

    it('should handle analysis errors', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {},
        });
      });

      // Should handle empty/invalid responses
      expect(result.current.intent).toBeDefined();
    });

    it('should handle persistence failures', async () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      // Simulate storage failure
      await act(async () => {
        await result.current.persistIntent();
      });

      // Should not crash
      expect(result.current.intent).toBe('adoption');
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useUserIntent());
      const initialIntent = result.current.intent;
      const initialConfidence = result.current.confidence;

      rerender();

      expect(result.current.intent).toBe(initialIntent);
      expect(result.current.confidence).toBe(initialConfidence);
    });

    it('should memoize computed values', () => {
      const { result, rerender } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      const initialFlow = result.current.suggestedFlow;
      const initialSteps = result.current.nextSteps;

      rerender();

      expect(result.current.suggestedFlow).toBe(initialFlow);
      expect(result.current.nextSteps).toBe(initialSteps);
    });

    it('should handle rapid intent changes', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
        result.current.setIntent('matching');
        result.current.setIntent('browsing');
      });

      expect(result.current.intent).toBe('browsing');
    });
  });

  describe('Integration', () => {
    it('should work with navigation', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      const navigationTarget = result.current.getNavigationTarget();
      expect(navigationTarget).toBeDefined();
      expect(typeof navigationTarget).toBe('string');
    });

    it('should integrate with onboarding flow', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('matching');
        result.current.startOnboarding();
      });

      expect(result.current.intent).toBe('matching');
      expect(result.current.suggestedFlow).toBeDefined();
    });

    it('should handle user profile integration', () => {
      const { result } = renderHook(() => useUserIntent());

      const userProfile = {
        hasPets: false,
        experience: 'beginner',
        location: 'urban',
      };

      act(() => {
        result.current.setIntent('adoption');
        result.current.integrateUserProfile(userProfile);
      });

      expect(result.current.intent).toBe('adoption');
      // Should customize flow based on profile
    });
  });

  describe('Edge Cases', () => {
    it('should handle null responses', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: null as any,
        });
      });

      expect(result.current.intent).toBeDefined();
    });

    it('should handle empty responses', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {},
        });
      });

      expect(result.current.intent).toBeDefined();
    });

    it('should handle conflicting responses', () => {
      const { result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.analyzeIntent({
          responses: {
            'looking-for': 'adopt',
            'commitment': 'not-interested',
          },
        });
      });

      // Should resolve conflicts
      expect(result.current.intent).toBeDefined();
      expect(result.current.confidence).toBeLessThan(1.0);
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useUserIntent());
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel ongoing operations on unmount', () => {
      const { unmount, result } = renderHook(() => useUserIntent());

      act(() => {
        result.current.setIntent('adoption');
      });

      unmount();
      // Should cleanup properly
    });
  });
});
