// Comprehensive React Native mock for Jest
// Standalone mock that doesn't require actual react-native

const React = require('react');

const View = 'View';
const Text = 'Text';
const TouchableOpacity = 'TouchableOpacity';
const TouchableHighlight = 'TouchableHighlight';
const TouchableWithoutFeedback = 'TouchableWithoutFeedback';
const ScrollView = 'ScrollView';
const FlatList = 'FlatList';
const SectionList = 'SectionList';
const Image = 'Image';
const TextInput = 'TextInput';

module.exports = {
  // Components
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
  SectionList,
  Image,
  TextInput,
  SafeAreaView: 'SafeAreaView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Modal: 'Modal',
  Pressable: 'Pressable',
  Button: 'Button',
  ActivityIndicator: 'ActivityIndicator',
  
  // APIs
  Platform: {
    OS: 'ios',
    Version: 123,
    isTesting: true,
    select: (objs) => objs.ios || objs.default,
  },
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve(true)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    compose: (style1, style2) => [style1, style2],
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {
        onStartShouldSetPanResponder: jest.fn(),
        onMoveShouldSetPanResponder: jest.fn(),
        onPanResponderGrant: jest.fn(),
        onPanResponderMove: jest.fn(),
        onPanResponderRelease: jest.fn(),
        onPanResponderTerminate: jest.fn(),
      },
    })),
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    ScrollView: 'Animated.ScrollView',
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    sequence: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    parallel: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    delay: jest.fn((time) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    loop: jest.fn((animation) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
    })),
    Value: jest.fn(function(initial) {
      this.setValue = jest.fn();
      this.interpolate = jest.fn(() => this);
      this.addListener = jest.fn();
      this.removeListener = jest.fn();
      this.removeAllListeners = jest.fn();
      this.stopAnimation = jest.fn();
      this.resetAnimation = jest.fn();
      this._value = initial;
      return this;
    }),
    ValueXY: jest.fn(function(initial) {
      this.setValue = jest.fn();
      this.setOffset = jest.fn();
      this.flattenOffset = jest.fn();
      this.extractOffset = jest.fn();
      this.addListener = jest.fn();
      this.removeListener = jest.fn();
      this.stopAnimation = jest.fn();
      this.resetAnimation = jest.fn();
      this.x = new module.exports.Animated.Value(initial ? initial.x : 0);
      this.y = new module.exports.Animated.Value(initial ? initial.y : 0);
      return this;
    }),
    createAnimatedComponent: (component) => component,
    event: jest.fn((argMapping, config) => jest.fn()),
  },
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
