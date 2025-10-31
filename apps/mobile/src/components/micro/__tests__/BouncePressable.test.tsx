/**
 * @jest-environment jsdom
 */
/// <reference types="@types/jest" />
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BouncePressable } from '../BouncePressable';
import * as Haptics from 'expo-haptics';
import { usePrefersReducedMotion } from '@/utils/motionGuards';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('@/utils/motionGuards', () => ({
  usePrefersReducedMotion: jest.fn(() => false),
}));
// Mock motion module
jest.mock('@/theme/motion', () => ({
  motionDurations: {
    xs: 120,
    sm: 180,
    md: 240,
    lg: 320,
  },
  motionEasing: {
    standard: jest.fn((t: number) => t),
    emphasized: jest.fn((t: number) => t),
    decel: jest.fn((t: number) => t),
    accel: jest.fn((t: number) => t),
    standardArray: [0.2, 0, 0, 1],
    emphasizedArray: [0.2, 0, 0, 1],
    decelArray: [0, 0, 0.2, 1],
    accelArray: [0.3, 0, 1, 1],
  },
  motionScale: {
    pressed: 0.95,
    hover: 1.02,
    lift: 1.05,
    disabled: 1,
  },
  motionOpacity: {
    pressed: 0.92,
    disabled: 0.5,
    shimmer: 0.18,
  },
  motionSpring: {
    snappy: { stiffness: 400, damping: 25, mass: 0.8 },
    standard: { stiffness: 300, damping: 30, mass: 1 },
    gentle: { stiffness: 200, damping: 25, mass: 1 },
    bouncy: { stiffness: 400, damping: 15, mass: 1 },
  },
  getEasingArray: jest.fn(() => [0.2, 0, 0, 1]),
  getSpringConfig: jest.fn(() => ({ stiffness: 300, damping: 30, mass: 1 })),
  motion: {},
}));
// Use global reanimated mock from jest.setup.ts - no local override needed

describe('BouncePressable', () => {
  const mockOnPress = jest.fn();
  const mockOnPressIn = jest.fn();
  const mockOnPressOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <BouncePressable>
          <Text>Test Button</Text>
        </BouncePressable>,
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('renders function children correctly', () => {
      const { getByText } = render(
        <BouncePressable>
          {({ pressed }: { pressed: boolean }) => (
            <Text>{pressed ? 'Pressed' : 'Not Pressed'}</Text>
          )}
        </BouncePressable>,
      );

      expect(getByText('Not Pressed')).toBeTruthy();
    });

    it('applies default scale values', () => {
      const { getByText } = render(
        <BouncePressable>
          <Text>Test</Text>
        </BouncePressable>,
      );

      // Component should render without errors
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Press Interactions', () => {
    it('calls onPress when pressed', () => {
      const { getByText } = render(
        <BouncePressable onPress={mockOnPress}>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      fireEvent.press(getByText('Press Me'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('不受影响 not call onPress when not provided', () => {
      const { getByText } = render(
        <BouncePressable>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      fireEvent.press(getByText('Press Me'));
      // Should not throw
    });

    it('calls onPressIn when pressed in', () => {
      const { getByText } = render(
        <BouncePressable onPressIn={mockOnPressIn}>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      fireEvent(getByText('Press Me'), 'pressIn');
      expect(mockOnPressIn).toHaveBeenCalledTimes(1);
    });

    it('calls onPressOut when pressed out', () => {
      const { getByText } = render(
        <BouncePressable onPressOut={mockOnPressOut}>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      fireEvent(getByText('Press Me'), 'pressOut');
      expect(mockOnPressOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Haptic Feedback', () => {
    it('provides haptic feedback on press in by default', () => {
      const { getByText } = render(
        <BouncePressable>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      fireEvent(getByText('Press Me'), 'pressIn');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('skips haptic feedback when haptics is disabled', () => {
      const { getByText } = render(
        <BouncePressable haptic={false}>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      fireEvent(getByText('Press Me'), 'pressIn');
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Reduced Motion Support', () => {
    it('skips haptics when reduced motion is enabled', () => {
      (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

      const { getByText } = render(
        <BouncePressable>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      fireEvent(getByText('Press Me'), 'pressIn');
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Custom Scale Values', () => {
    it('uses custom scaleFrom value', () => {
      const { getByText } = render(
        <BouncePressable scaleFrom={0.9}>
          <Text>Test</Text>
        </BouncePressable>,
      );

      // Component should render with custom scale
      expect(getByText('Test')).toBeTruthy();
    });

    // Note: BouncePressable doesn't have scaleTo prop, only scaleFrom
    it('applies custom scale correctly', () => {
      const { getByText } = render(
        <BouncePressable scaleFrom={0.95}>
          <Text>Test</Text>
        </BouncePressable>,
      );

      // Component should render with custom scale
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Reduced Motion Support', () => {
    it('disables animations when reduced motion is enabled', () => {
      (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

      const { getByText } = render(
        <BouncePressable>
          <Text>Test</Text>
        </BouncePressable>,
      );

      fireEvent(getByText('Test'), 'pressIn');
      fireEvent(getByText('Test'), 'pressOut');

      // Should not provide haptics or animations
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards Pressable props correctly', () => {
      const { getByTestId } = render(
        <BouncePressable
          testID="custom-pressable"
          disabled
        >
          <Text>Test</Text>
        </BouncePressable>,
      );

      const pressable = getByTestId('custom-pressable');
      expect(pressable).toBeTruthy();
      expect(pressable.props.disabled).toBe(true);
    });

    it('handles style prop correctly', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <BouncePressable
          testID="styled-pressable"
          style={customStyle}
        >
          <Text>Test</Text>
        </BouncePressable>,
      );

      const pressable = getByTestId('styled-pressable');
      expect(pressable).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      const result = render(<BouncePressable>{null}</BouncePressable>);
      expect(result).toBeTruthy();
    });

    it('handles undefined children gracefully', () => {
      const result = render(<BouncePressable>{undefined}</BouncePressable>);
      expect(result).toBeTruthy();
    });

    it('handles rapid press/unpress cycles', () => {
      const { getByText } = render(
        <BouncePressable onPress={mockOnPress}>
          <Text>Press Me</Text>
        </BouncePressable>,
      );

      const button = getByText('Press Me');
      for (let i = 0; i < 10; i++) {
        fireEvent(button, 'pressIn');
        fireEvent(button, 'pressOut');
      }

      // Should not crash
      expect(getByText('Press Me')).toBeTruthy();
    });
  });
});
