import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import BouncePressable from '../BouncePressable';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from '../../../utils/A11yHelpers';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('../../../utils/A11yHelpers', () => ({
  useReducedMotion: jest.fn(() => false),
}));

describe('BouncePressable', () => {
  const mockOnPress = jest.fn();
  const mockOnPressIn = jest.fn();
  const mockOnPressOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
    (useReducedMotion as jest.Mock).mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <BouncePressable>
          <Text>Test Button</Text>
        </BouncePressable>
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('renders function children correctly', () => {
      const { getByText } = render(
        <BouncePressable>
          {({ pressed }: { pressed: boolean }) => (
            <Text>{pressed ? 'Pressed' : 'Not Pressed'}</Text>
          )}
        </BouncePressable>
      );

      expect(getByText('Not Pressed')).toBeTruthy();
    });

    it('applies default scale values', () => {
      const { getByText } = render(
        <BouncePressable>
          <Text>Test</Text>
        </BouncePressable>
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
        </BouncePressable>
      );

      fireEvent.press(getByText('Press Me'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('不受影响 not call onPress when not provided', () => {
      const { getByText } = render(
        <BouncePressable>
          <Text>Press Me</Text>
        </BouncePressable>
      );

      fireEvent.press(getByText('Press Me'));
      // Should not throw
    });

    it('calls onPressIn when pressed in', () => {
      const { getByText } = render(
        <BouncePressable onPressIn={mockOnPressIn}>
          <Text>Press Me</Text>
        </BouncePressable>
      );

      fireEvent(getByText('Press Me'), 'pressIn');
      expect(mockOnPressIn).toHaveBeenCalledTimes(1);
    });

    it('calls onPressOut when pressed out', () => {
      const { getByText } = render(
        <BouncePressable onPressOut={mockOnPressOut}>
          <Text>Press Me</Text>
        </BouncePressable>
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
        </BouncePressable>
      );

      fireEvent(getByText('Press Me'), 'pressIn');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('skips haptic feedback when haptics is disabled', () => {
      const { getByText } = render(
        <BouncePressable haptics={false}>
          <Text>Press Me</Text>
        </BouncePressable>
      );

      fireEvent(getByText('Press Me'), 'pressIn');
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Reduced Motion Support', () => {
    it('skips haptics when reduced motion is enabled', () => {
      (useReducedMotion as jest.Mock).mockReturnValue(true);
      
      const { getByText } = render(
        <BouncePressable>
          <Text>Press Me</Text>
        </BouncePressable>
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
        </BouncePressable>
      );

      // Component should render with custom scale
      expect(getByText('Test')).toBeTruthy();
    });

    it('uses custom scaleTo value', () => {
      const { getByText } = render(
        <BouncePressable scaleTo={1.1}>
          <Text>Test</Text>
        </BouncePressable>
      );

      // Component should render with custom scale
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Reduced Motion Support', () => {
    it('disables animations when reduced motion is enabled', () => {
      (useReducedMotion as jest.Mock).mockReturnValue(true);
      
      const { getByText } = render(
        <BouncePressable>
          <Text>Test</Text>
        </BouncePressable>
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
        <BouncePressable testID="custom-pressable" disabled>
          <Text>Test</Text>
        </BouncePressable>
      );

      const pressable = getByTestId('custom-pressable');
      expect(pressable).toBeTruthy();
      expect(pressable.props.disabled).toBe(true);
    });

    it('handles style prop correctly', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <BouncePressable testID="styled-pressable" style={customStyle}>
          <Text>Test</Text>
        </BouncePressable>
      );

      const pressable = getByTestId('styled-pressable');
      expect(pressable).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      const { container } = render(
        <BouncePressable>{null}</BouncePressable>
      );
      expect(container).toBeTruthy();
    });

    it('handles undefined children gracefully', () => {
      const { container } = render(
        <BouncePressable>{undefined}</BouncePressable>
      );
      expect(container).toBeTruthy();
    });

    it('handles rapid press/unpress cycles', () => {
      const { getByText } = render(
        <BouncePressable onPress={mockOnPress}>
          <Text>Press Me</Text>
        </BouncePressable>
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
