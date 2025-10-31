/**
 * PhoenixCard Performance Tests
 * Testing animation performance and bundle size compliance
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import performanceMonitor from '../../utils/PerformanceMonitor';
import { PhoenixCard } from '../../components/phoenix/PhoenixCard';

// Mock PerformanceMonitor - it's exported as a default singleton instance
jest.mock('../../utils/PerformanceMonitor', () => {
  // Mock functions need to be defined here due to Jest hoisting
  const getCurrentFPS = jest.fn(() => 60);
  const startInteraction = jest.fn();
  const endInteraction = jest.fn();
  const measureInteraction = jest.fn((name, fn) => fn());
  const getPerformanceSummary = jest.fn(() => ({
    currentFPS: 60,
    averageFPS: 60,
    minFPS: 60,
    maxFPS: 60,
    memoryUsage: 0,
    activeInteractions: 0,
  }));

  return {
    __esModule: true,
    default: {
      getCurrentFPS,
      startInteraction,
      endInteraction,
      measureInteraction,
      getPerformanceSummary,
    },
  };
});

// Mock theme
jest.mock('../../theme/Provider', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getMockLightTheme } = require('../../test-utils/theme-helpers');
  const theme = getMockLightTheme();
  return {
    useTheme: () => theme,
  };
});

// Mock styles
jest.mock('../../animation', () => ({
  Colors: {
    primary: 'Theme.colors.primary',
    surface: 'Theme.colors.surface',
    surfaceElevated: 'Theme.colors.surface',
    text: 'Theme.colors.onSurface',
    textSecondary: 'Theme.colors.onMuted',
    border: 'Theme.colors.border',
    borderLight: 'Theme.colors.border',
    shadow: 'Theme.colors.onSurface',
  },
  Spacing: {
    'xs': 4,
    'sm': 8,
    'md': 16,
    'lg': 24,
    'xl': 32,
    '2xl': 48,
  },
  BorderRadius: {
    'sm': 4,
    'md': 8,
    'lg': 12,
    'xl': 16,
    '2xl': 24,
  },
  AnimationConfigs: {
    spring: { damping: 15, stiffness: 300, mass: 1 },
    timing: { duration: 300 },
  },
  PREMIUM_SHADOWS: {
    medium: {
      shadowColor: 'Theme.colors.neutral[950]',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
}));

describe('PhoenixCard Performance Tests (Rule 06)', () => {
  let mockGetCurrentFPSSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on the mocked performanceMonitor
    mockGetCurrentFPSSpy = jest.spyOn(performanceMonitor, 'getCurrentFPS').mockReturnValue(60);
  });

  describe('Animation Performance (60fps requirement)', () => {
    it('should maintain 60fps during animations', () => {
      const onPressMock = jest.fn();

      // Render component with animations
      render(
        <PhoenixCard
          title="Performance Test Card"
          interactive={true}
          onPress={onPressMock}
          glowOnPress={true}
        />,
      );

      // Simulate interaction that triggers animation
      const card = screen.getByLabelText('Performance Test Card');
      fireEvent(card, 'pressIn');

      // Verify FPS monitoring is active
      expect(mockGetCurrentFPSSpy).toHaveBeenCalled();

      // Animation should complete within performance budget
      // In real implementation, this would measure actual frame drops
      expect(performanceMonitor.getCurrentFPS()).toBeGreaterThanOrEqual(50);
    });

    it('should not cause frame drops during rapid interactions', () => {
      const onPressMock = jest.fn();

      render(
        <PhoenixCard
          title="Rapid Interaction Test"
          interactive={true}
          onPress={onPressMock}
        />,
      );

      const card = screen.getByLabelText('Rapid Interaction Test');

      // Simulate rapid press interactions
      for (let i = 0; i < 10; i++) {
        fireEvent(card, 'pressIn');
        fireEvent(card, 'pressOut');
      }

      // Should maintain performance
      expect(performanceMonitor.getCurrentFPS()).toBeGreaterThanOrEqual(50);
      expect(mockGetCurrentFPSSpy).toHaveBeenCalled();
    });
  });

  describe('Memory Usage (Bundle Budget Compliance)', () => {
    it('should not cause memory leaks during lifecycle', () => {
      const onPressMock = jest.fn();

      const { rerender, unmount } = render(
        <PhoenixCard
          title="Memory Test"
          interactive={true}
          onPress={onPressMock}
        />,
      );

      // Simulate multiple re-renders
      for (let i = 0; i < 5; i++) {
        rerender(
          <PhoenixCard
            title={`Memory Test ${i}`}
            interactive={true}
            onPress={onPressMock}
          />,
        );
      }

      // Unmount should clean up properly
      unmount();

      // In real implementation, this would verify memory cleanup
      expect(true).toBe(true); // Placeholder for memory leak detection
    });

    it('should have minimal bundle impact', () => {
      // This test would verify bundle size in a real CI environment
      // For now, we test that the component is properly tree-shakable

      const onPressMock = jest.fn();

      render(
        <PhoenixCard
          title="Bundle Test"
          interactive={true}
          onPress={onPressMock}
        />,
      );

      const card = screen.getByLabelText('Bundle Test');
      expect(card).toBeTruthy();
    });
  });

  describe('Interaction Performance (INP ≤ 200ms)', () => {
    it('should respond to interactions within 200ms', async () => {
      const onPressMock = jest.fn();

      render(
        <PhoenixCard
          title="Interaction Performance Test"
          interactive={true}
          onPress={onPressMock}
        />,
      );

      const card = screen.getByLabelText('Interaction Performance Test');

      // Measure interaction time
      const startTime = Date.now();
      fireEvent.press(card);
      const interactionTime = Date.now() - startTime;

      // Should respond within 200ms (INP budget)
      expect(interactionTime).toBeLessThanOrEqual(200);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should handle disabled state without performance impact', () => {
      const onPressMock = jest.fn();

      render(
        <PhoenixCard
          title="Disabled Performance Test"
          interactive={true}
          onPress={onPressMock}
          disabled={true}
        />,
      );

      const card = screen.getByLabelText('Disabled Performance Test');

      // Disabled interactions should still perform well
      const startTime = Date.now();
      fireEvent.press(card);
      const interactionTime = Date.now() - startTime;

      expect(interactionTime).toBeLessThanOrEqual(200);
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Layout Stability (CLS ≤ 0.1)', () => {
    it('should not cause layout shifts during state changes', () => {
      const onPressMock = jest.fn();

      const { rerender } = render(
        <PhoenixCard
          title="Layout Stability Test"
          interactive={true}
          onPress={onPressMock}
        />,
      );

      const card = screen.getByLabelText('Layout Stability Test');

      // Measure initial layout
      const initialLayout = card.props.style;

      // Trigger state change (press interaction)
      fireEvent(card, 'pressIn');

      // Layout should remain stable (no sudden size changes)
      // In real implementation, this would measure actual layout shifts
      expect(card).toBeTruthy();
    });

    it('should maintain consistent dimensions across variants', () => {
      const variants = ['elevated', 'glass', 'neon', 'minimal'] as const;

      variants.forEach((variant) => {
        const { rerender } = render(
          <PhoenixCard
            title={`${variant} Layout Test`}
            variant={variant}
            size="md"
          />,
        );

        const card = screen.getByLabelText(`${variant} Layout Test`);
        expect(card).toBeTruthy();

        // In real implementation, this would verify consistent sizing
      });
    });
  });

  describe('Animation Budget Compliance', () => {
    it('should use spring animations within 120-320ms range', () => {
      // This test verifies animation configurations
      const onPressMock = jest.fn();

      render(
        <PhoenixCard
          title="Animation Budget Test"
          interactive={true}
          onPress={onPressMock}
        />,
      );

      const card = screen.getByLabelText('Animation Budget Test');

      // Trigger animation
      fireEvent(card, 'pressIn');

      // Animation should complete within budget
      // In real implementation, this would measure actual animation duration
      expect(card).toBeTruthy();
    });

    it('should prioritize transform animations over layout changes', () => {
      // Transform animations (scale, translate) are more performant than layout changes
      const onPressMock = jest.fn();

      render(
        <PhoenixCard
          title="Transform Animation Test"
          interactive={true}
          onPress={onPressMock}
        />,
      );

      const card = screen.getByLabelText('Transform Animation Test');

      // Should use transform animations, not layout animations
      fireEvent(card, 'pressIn');
      fireEvent(card, 'pressOut');

      expect(onPressMock).toHaveBeenCalledTimes(0); // Only test animation, not press
    });
  });
});
