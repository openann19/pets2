/**
 * React Native Reanimated Mock
 * Mock for react-native-reanimated library
 */

const React = require('react');

// Mock components
const mockAnimatedComponent = (name) => {
  return React.forwardRef((props, ref) => {
    return React.createElement('div', {
      ...props,
      ref,
      'data-testid': `Animated.${name}`,
      style: { display: 'flex', ...props.style }
    }, props.children);
  });
};

// Mock animated values and functions
const mockAnimatedValue = jest.fn(() => ({
  setValue: jest.fn(),
  interpolate: jest.fn(() => ({
    __getValue: jest.fn(() => 0),
  })),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
}));

const Reanimated = {
  // Components
  View: mockAnimatedComponent('View'),
  Text: mockAnimatedComponent('Text'),
  Image: mockAnimatedComponent('Image'),
  ScrollView: mockAnimatedComponent('ScrollView'),

  // Values
  Value: mockAnimatedValue,
  Clock: jest.fn(() => ({})), // Simple object mock

  // Animation functions
  timing: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),
  spring: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),
  decay: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),
  sequence: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),
  parallel: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),
  delay: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),
  repeat: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),
  loop: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
  })),

  // Hooks
  useSharedValue: jest.fn((initialValue) => ({
    value: initialValue,
    set: jest.fn((value) => { this.value = value; }),
  })),
  useAnimatedStyle: jest.fn((updater) => ({})),
  useDerivedValue: jest.fn((updater) => ({
    value: updater(),
  })),
  useAnimatedScrollHandler: jest.fn(() => ({})),
  useAnimatedGestureHandler: jest.fn(() => ({})),

  // Worklets
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),

  // Utilities
  interpolate: jest.fn((value, inputRange, outputRange) => {
    // Simple linear interpolation mock
    if (typeof value === 'number' && inputRange && outputRange) {
      const index = inputRange.findIndex(range => value <= range);
      if (index === 0) return outputRange[0];
      if (index === -1) return outputRange[outputRange.length - 1];
      return outputRange[index] || outputRange[outputRange.length - 1];
    }
    return 0;
  }),
  Extrapolate: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },

  // Easing
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    bezier: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
};

// Default export
module.exports = Reanimated;
