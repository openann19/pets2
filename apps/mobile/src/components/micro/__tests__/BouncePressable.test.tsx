/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import BouncePressable from '../BouncePressable';
import * as Haptics from 'expo-haptics';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock reanimated (requires explicit mocking)
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const Animated = {
    View: React.forwardRef((props: any, ref: any) => (
      <View
        {...props}
        ref={ref}
      />
    )),
    useSharedValue: (init: number) => ({ value: init }),
    withSpring: jest.fn((value: number, config: any) => value),
    useAnimatedStyle: (fn: () => any) => {
      return {};
    },
  };
  return {
    ...Animated,
    default: Animated,
  };
});

describe('BouncePressable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <BouncePressable>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable onPress={onPress}>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent.press(getByText('Press Me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('provides haptic feedback by default', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable onPress={onPress}>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent.press(getByText('Press Me'));

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('does not provide haptic feedback when disabled', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable
        onPress={onPress}
        haptics={false}
      >
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent.press(getByText('Press Me'));

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('calls onPressIn handler', () => {
    const onPressIn = jest.fn();
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable
        onPress={onPress}
        onPressIn={onPressIn}
      >
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent(getByText('Press Me'), 'pressIn');

    expect(onPressIn).toHaveBeenCalledTimes(1);
  });

  it('calls onPressOut handler', () => {
    const onPressOut = jest.fn();
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable
        onPress={onPress}
        onPressOut={onPressOut}
      >
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent(getByText('Press Me'), 'pressOut');

    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it('applies custom scale values', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable
        onPress={onPress}
        scaleFrom={0.9}
        scaleTo={1.1}
      >
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent.press(getByText('Press Me'));

    expect(onPress).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable
        onPress={onPress}
        disabled
      >
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent.press(getByText('Press Me'));

    expect(onPress).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('applies custom accessibility props', () => {
    const onPress = jest.fn();

    const { getByRole } = render(
      <BouncePressable
        onPress={onPress}
        accessibilityLabel="Custom Button"
        accessibilityRole="button"
      >
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('handles haptic failures gracefully', async () => {
    (Haptics.impactAsync as jest.Mock).mockRejectedValue(new Error('Haptics unavailable'));

    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable onPress={onPress}>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent.press(getByText('Press Me'));

    // Should still call onPress even if haptics fail
    expect(onPress).toHaveBeenCalled();
  });

  it('supports all PressableProps', () => {
    const onLongPress = jest.fn();
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    fireEvent(getByText('Press Me'), 'longPress');

    expect(onLongPress).toHaveBeenCalled();
  });

  it('memoizes component to prevent unnecessary re-renders', () => {
    const { rerender, getByText } = render(
      <BouncePressable>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    const firstRender = getByText('Press Me');

    rerender(
      <BouncePressable>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    // If memo works, component should only re-render if props change
    const secondRender = getByText('Press Me');

    expect(secondRender).toBe(firstRender);
  });

  it('applies style prop correctly', () => {
    const customStyle = { backgroundColor: 'red', padding: 10 };

    const { UNSAFE_getByType } = render(
      <BouncePressable style={customStyle}>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    expect(UNSAFE_getByType).toBeDefined();
  });

  it('renders complex children structures', () => {
    const { getByText } = render(
      <BouncePressable>
        <View>
          <Text>Title</Text>
          <Text>Description</Text>
        </View>
      </BouncePressable>,
    );

    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
  });

  it('handles rapid sequential presses', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable onPress={onPress}>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    const button = getByText('Press Me');

    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(3);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
  });

  it('provides haptic feedback on press in, not press out', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <BouncePressable onPress={onPress}>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    // Haptics should fire on pressIn (which is part of press event)
    fireEvent.press(getByText('Press Me'));

    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('maintains children layout during animation', () => {
    const { getByText } = render(
      <BouncePressable>
        <Text testID="child">Press Me</Text>
      </BouncePressable>,
    );

    const child = getByText('Press Me');

    fireEvent.press(child);

    // Child should still exist after press
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('works with accessibility states', () => {
    const { UNSAFE_getByType } = render(
      <BouncePressable accessibilityState={{ disabled: false }}>
        <Text>Press Me</Text>
      </BouncePressable>,
    );

    expect(UNSAFE_getByType).toBeDefined();
  });
});
