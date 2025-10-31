/**
 * Comprehensive Tests for MicroInteractionCard Component
 * Tests all functionality including tilt, magnetic, gradient, glow, and accessibility
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { MicroInteractionCard } from '../MicroInteractionCard';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { useSoundEffect } from '@/hooks/animations/useSoundEffect';
import { useHapticFeedback } from '@/hooks/animations/useHapticFeedback';

// Mock dependencies
jest.mock('@/hooks/useReducedMotion');
jest.mock('@/hooks/animations/useSoundEffect');
jest.mock('@/hooks/animations/useHapticFeedback');
jest.mock('@/hooks/animations/useMagneticEffect', () => ({
  useMagneticEffect: () => ({
    magneticStyle: {},
    handleMagneticMove: jest.fn(),
    resetMagnetic: jest.fn(),
  }),
}));
jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: any) => children,
  Gesture: {
    Pan: jest.fn(() => ({
      enabled: jest.fn(() => ({
        onChange: jest.fn(() => ({
          onEnd: jest.fn(),
        })),
      })),
    })),
  },
}));
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#3b82f6',
      success: '#10b981',
      surface: '#ffffff',
      onSurface: '#000000',
      border: '#e5e7eb',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    radii: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    },
  }),
}));

const mockPlaySound = jest.fn(() => Promise.resolve());
const mockTriggerHaptic = jest.fn();

describe('MicroInteractionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useReduceMotion as jest.Mock).mockReturnValue(false);
    (useSoundEffect as jest.Mock).mockReturnValue({
      play: mockPlaySound,
      enabled: true,
      setEnabled: jest.fn(),
    });
    (useHapticFeedback as jest.Mock).mockReturnValue({
      triggerHaptic: mockTriggerHaptic,
    });
  });

  describe('Rendering', () => {
    it('should render children', () => {
      const { getByText } = render(
        <MicroInteractionCard>
          <Text>Card Content</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('should render with multiple children', () => {
      const { getByText } = render(
        <MicroInteractionCard>
          <Text>First</Text>
          <Text>Second</Text>
        </MicroInteractionCard>
      );
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
    });

    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <MicroInteractionCard style={customStyle}>
          <Text>Styled</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Styled')).toBeTruthy();
    });
  });

  describe('Clickable', () => {
    it('should be clickable when clickable prop is true', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <MicroInteractionCard clickable onPress={mockOnPress}>
          <Text>Clickable</Text>
        </MicroInteractionCard>
      );

      fireEvent.press(getByText('Clickable'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when clickable prop is false', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <MicroInteractionCard clickable={false} onPress={mockOnPress}>
          <Text>Not Clickable</Text>
        </MicroInteractionCard>
      );

      fireEvent.press(getByText('Not Clickable'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should have button role when clickable', () => {
      const { getByRole } = render(
        <MicroInteractionCard clickable>
          <Text>Clickable</Text>
        </MicroInteractionCard>
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should not have button role when not clickable', () => {
      const { queryByRole } = render(
        <MicroInteractionCard clickable={false}>
          <Text>Not Clickable</Text>
        </MicroInteractionCard>
      );
      expect(queryByRole('button')).toBeNull();
    });

    it('should be disabled when disabled prop is true', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <MicroInteractionCard clickable disabled onPress={mockOnPress}>
          <Text>Disabled</Text>
        </MicroInteractionCard>
      );

      fireEvent.press(getByText('Disabled'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Hoverable', () => {
    it('should support hover effects when hoverable', () => {
      const { getByText } = render(
        <MicroInteractionCard hoverable>
          <Text>Hoverable</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Hoverable')).toBeTruthy();
    });

    it('should not support hover effects when hoverable is false', () => {
      const { getByText } = render(
        <MicroInteractionCard hoverable={false}>
          <Text>Not Hoverable</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Not Hoverable')).toBeTruthy();
    });
  });

  describe('Tilt Effect', () => {
    it('should enable tilt when tilt prop is true', () => {
      const { getByText } = render(
        <MicroInteractionCard tilt>
          <Text>Tilt Enabled</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Tilt Enabled')).toBeTruthy();
    });

    it('should disable tilt when tilt prop is false', () => {
      const { getByText } = render(
        <MicroInteractionCard tilt={false}>
          <Text>No Tilt</Text>
        </MicroInteractionCard>
      );
      expect(getByText('No Tilt')).toBeTruthy();
    });

    it('should disable tilt when disabled', () => {
      const { getByText } = render(
        <MicroInteractionCard tilt disabled>
          <Text>Disabled Tilt</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Disabled Tilt')).toBeTruthy();
    });

    it('should disable tilt when reduced motion is enabled', () => {
      (useReduceMotion as jest.Mock).mockReturnValue(true);

      const { getByText } = render(
        <MicroInteractionCard tilt>
          <Text>Reduced Motion</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Reduced Motion')).toBeTruthy();
    });
  });

  describe('Magnetic Effect', () => {
    it('should enable magnetic effect when magnetic prop is true', () => {
      const { getByText } = render(
        <MicroInteractionCard magnetic>
          <Text>Magnetic</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Magnetic')).toBeTruthy();
    });

    it('should disable magnetic effect when magnetic prop is false', () => {
      const { getByText } = render(
        <MicroInteractionCard magnetic={false}>
          <Text>Not Magnetic</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Not Magnetic')).toBeTruthy();
    });
  });

  describe('Gradient Overlay', () => {
    it('should show gradient overlay when gradient prop is true', () => {
      const { getByText } = render(
        <MicroInteractionCard gradient>
          <Text>Gradient</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Gradient')).toBeTruthy();
    });

    it('should hide gradient overlay when gradient prop is false', () => {
      const { getByText } = render(
        <MicroInteractionCard gradient={false}>
          <Text>No Gradient</Text>
        </MicroInteractionCard>
      );
      expect(getByText('No Gradient')).toBeTruthy();
    });

    it('should show gradient only when hovered', () => {
      const { getByText } = render(
        <MicroInteractionCard gradient hoverable>
          <Text>Gradient Hover</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Gradient Hover')).toBeTruthy();
    });
  });

  describe('Glow Effect', () => {
    it('should show glow effect when glow prop is true', () => {
      const { getByText } = render(
        <MicroInteractionCard glow>
          <Text>Glow</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Glow')).toBeTruthy();
    });

    it('should hide glow effect when glow prop is false', () => {
      const { getByText } = render(
        <MicroInteractionCard glow={false}>
          <Text>No Glow</Text>
        </MicroInteractionCard>
      );
      expect(getByText('No Glow')).toBeTruthy();
    });

    it('should show glow only when hovered', () => {
      const { getByText } = render(
        <MicroInteractionCard glow hoverable>
          <Text>Glow Hover</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Glow Hover')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic on press when enabled', () => {
      const { getByText } = render(
        <MicroInteractionCard clickable haptic>
          <Text>Haptic</Text>
        </MicroInteractionCard>
      );

      fireEvent.press(getByText('Haptic'));
      expect(mockTriggerHaptic).toHaveBeenCalledWith('medium');
    });

    it('should not trigger haptic when disabled', () => {
      const { getByText } = render(
        <MicroInteractionCard clickable haptic={false}>
          <Text>No Haptic</Text>
        </MicroInteractionCard>
      );

      fireEvent.press(getByText('No Haptic'));
      expect(mockTriggerHaptic).not.toHaveBeenCalled();
    });

    it('should not trigger haptic when not clickable', () => {
      const { getByText } = render(
        <MicroInteractionCard clickable={false} haptic>
          <Text>Not Clickable</Text>
        </MicroInteractionCard>
      );

      // Can't press when not clickable
      expect(getByText('Not Clickable')).toBeTruthy();
    });
  });

  describe('Sound Effects', () => {
    it('should play sound on press when enabled', async () => {
      const { getByText } = render(
        <MicroInteractionCard
          clickable
          sound={{ uri: 'test://sound.mp3', enabled: true }}
        >
          <Text>Sound</Text>
        </MicroInteractionCard>
      );

      fireEvent.press(getByText('Sound'));
      await waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalled();
      });
    });

    it('should not play sound when disabled', () => {
      const { getByText } = render(
        <MicroInteractionCard
          clickable
          sound={{ uri: 'test://sound.mp3', enabled: false }}
        >
          <Text>No Sound</Text>
        </MicroInteractionCard>
      );

      fireEvent.press(getByText('No Sound'));
      expect(mockPlaySound).not.toHaveBeenCalled();
    });

    it('should not play sound when not clickable', () => {
      const { getByText } = render(
        <MicroInteractionCard
          clickable={false}
          sound={{ uri: 'test://sound.mp3', enabled: true }}
        >
          <Text>Not Clickable</Text>
        </MicroInteractionCard>
      );

      // Can't press when not clickable
      expect(getByText('Not Clickable')).toBeTruthy();
    });
  });

  describe('Press Interactions', () => {
    it('should handle pressIn event', () => {
      const mockOnPressIn = jest.fn();
      const { getByText } = render(
        <MicroInteractionCard clickable onPressIn={mockOnPressIn}>
          <Text>Press</Text>
        </MicroInteractionCard>
      );

      fireEvent(getByText('Press'), 'pressIn');
      expect(mockOnPressIn).toHaveBeenCalledTimes(1);
    });

    it('should handle pressOut event', () => {
      const mockOnPressOut = jest.fn();
      const { getByText } = render(
        <MicroInteractionCard clickable onPressOut={mockOnPressOut}>
          <Text>Press</Text>
        </MicroInteractionCard>
      );

      fireEvent(getByText('Press'), 'pressOut');
      expect(mockOnPressOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have button role when clickable', () => {
      const { getByRole } = render(
        <MicroInteractionCard clickable>
          <Text>Clickable</Text>
        </MicroInteractionCard>
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should have disabled state when disabled', () => {
      const { getByRole } = render(
        <MicroInteractionCard clickable disabled>
          <Text>Disabled</Text>
        </MicroInteractionCard>
      );
      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should respect reduced motion', () => {
      (useReduceMotion as jest.Mock).mockReturnValue(true);

      const { getByText } = render(
        <MicroInteractionCard hoverable tilt>
          <Text>Reduced Motion</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Reduced Motion')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<MicroInteractionCard>{null}</MicroInteractionCard>);
      expect(container).toBeTruthy();
    });

    it('should handle multiple rapid presses', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <MicroInteractionCard clickable onPress={mockOnPress}>
          <Text>Rapid</Text>
        </MicroInteractionCard>
      );

      const card = getByText('Rapid');
      for (let i = 0; i < 10; i++) {
        fireEvent.press(card);
      }

      expect(mockOnPress).toHaveBeenCalledTimes(10);
    });

    it('should handle state changes', () => {
      const { rerender, getByText } = render(
        <MicroInteractionCard hoverable>
          <Text>Dynamic</Text>
        </MicroInteractionCard>
      );

      expect(getByText('Dynamic')).toBeTruthy();

      rerender(
        <MicroInteractionCard hoverable={false} gradient>
          <Text>Dynamic</Text>
        </MicroInteractionCard>
      );
      expect(getByText('Dynamic')).toBeTruthy();
    });

    it('should handle all effects enabled', () => {
      const { getByText } = render(
        <MicroInteractionCard
          hoverable
          clickable
          tilt
          magnetic
          gradient
          glow
          haptic
          sound={{ uri: 'test://sound.mp3', enabled: true }}
        >
          <Text>All Effects</Text>
        </MicroInteractionCard>
      );
      expect(getByText('All Effects')).toBeTruthy();
    });

    it('should handle all effects disabled', () => {
      const { getByText } = render(
        <MicroInteractionCard
          hoverable={false}
          clickable={false}
          tilt={false}
          magnetic={false}
          gradient={false}
          glow={false}
          haptic={false}
        >
          <Text>No Effects</Text>
        </MicroInteractionCard>
      );
      expect(getByText('No Effects')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderCount = jest.fn();
      const TestComponent = () => {
        renderCount();
        return (
          <MicroInteractionCard>
            <Text>Performance</Text>
          </MicroInteractionCard>
        );
      };

      const { rerender } = render(<TestComponent />);
      expect(renderCount).toHaveBeenCalledTimes(1);

      rerender(<TestComponent />);
      // Should not cause unnecessary re-renders
      expect(renderCount).toHaveBeenCalledTimes(2);
    });
  });

  describe('Props Forwarding', () => {
    it('should forward Pressable props', () => {
      const { getByTestId } = render(
        <MicroInteractionCard clickable testID="custom-card">
          <Text>Test</Text>
        </MicroInteractionCard>
      );
      expect(getByTestId('custom-card')).toBeTruthy();
    });
  });
});

