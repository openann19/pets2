/**
 * React Native Mock for Jest
 * Provides basic React Native component mocks for testing
 */

// Mock React Native components
const mockComponent = (name) => {
  const Component = ({ children, ...props }) => {
    // Return a simple object that represents the component
    return {
      type: name,
      props: { ...props, children },
      key: props.key || null,
    };
  };
  Component.displayName = name;
  return Component;
};

// Basic components
const View = mockComponent('View');
const Text = mockComponent('Text');
const TouchableOpacity = mockComponent('TouchableOpacity');
const ScrollView = mockComponent('ScrollView');
const TextInput = mockComponent('TextInput');
const Image = mockComponent('Image');

// Mock StyleSheet
const StyleSheet = {
  create: (styles) => styles,
  flatten: (styles) => styles,
  compose: (style1, style2) => ({ ...style1, ...style2 }),
};

// Mock Dimensions
const Dimensions = {
  get: (dimension) => ({
    width: 375,
    height: 667,
    scale: 2,
    fontScale: 1,
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock Platform
const Platform = {
  OS: 'ios',
  Version: '15.0',
  isPad: false,
  isTVOS: false,
  isTesting: true,
  select: (obj) => obj.ios || obj.default,
};

// Mock AccessibilityInfo
const AccessibilityInfo = {
  fetch: jest.fn(() => Promise.resolve(true)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
  isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
  isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
  isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
  isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  setAccessibilityFocus: jest.fn(),
  announceForAccessibility: jest.fn(),
};

// Mock UIManager
const UIManager = {
  getViewManagerConfig: jest.fn(() => ({})),
  dispatchViewManagerCommand: jest.fn(),
  measure: jest.fn(),
  measureInWindow: jest.fn(),
  measureLayout: jest.fn(),
  setLayoutAnimationEnabledExperimental: jest.fn(),
};

// Mock Easing
const Easing = {
  bezier: (x1, y1, x2, y2) => (t) => t, // Simple linear fallback
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t,
  cubic: (t) => t,
  poly: (n) => (t) => t,
  sin: (t) => t,
  circle: (t) => t,
  exp: (t) => t,
  elastic: (bounciness) => (t) => t,
  back: (s) => (t) => t,
  bounce: (t) => t,
  in: (easing) => easing,
  out: (easing) => easing,
  inOut: (easing) => easing,
};

// Export all mocks
module.exports = {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  AccessibilityInfo,
  UIManager,
  Easing,
  // Add more components as needed
};
