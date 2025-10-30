/**
 * React Native Mock
 * Basic mock for React Native components and APIs
 */

const React = require('react');
// jest is available globally in Jest mocks, but provide fallback for safety
const jestFn = (typeof jest !== 'undefined' && jest.fn) ? jest.fn : function mockFn(impl) {
  const fn = impl || function() {};
  fn.mockReturnValue = () => fn;
  fn.mockResolvedValue = () => fn;
  fn.mockRejectedValue = () => fn;
  fn.mockImplementation = () => fn;
  return fn;
};

// Mock React Native components
const mockComponent = (name) => {
  return React.forwardRef((props, ref) => {
    return React.createElement('div', {
      ...props,
      ref,
      'data-testid': name,
      style: { display: 'flex', ...props.style }
    }, props.children);
  });
};

const RN = {
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
  TouchableHighlight: mockComponent('TouchableHighlight'),
  Pressable: mockComponent('Pressable'),
  TextInput: mockComponent('TextInput'),
  ScrollView: mockComponent('ScrollView'),
  FlatList: mockComponent('FlatList'),
  SectionList: mockComponent('SectionList'),
  Image: mockComponent('Image'),
  Modal: mockComponent('Modal'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  Switch: mockComponent('Switch'),
  Alert: {
    alert: jestFn(),
  },
  Platform: {
    OS: 'ios',
    Version: 15,
    select: jestFn((obj) => obj?.ios || obj?.default),
  },
  Dimensions: {
    get: jestFn(() => ({ width: 375, height: 812 })),
    addEventListener: jestFn(() => ({ remove: jestFn() })),
    removeEventListener: jestFn(),
  },
  StyleSheet: {
    create: (typeof jest !== 'undefined' && jest.fn) 
      ? jest.fn((styles) => styles)
      : ((styles) => styles),
    flatten: (typeof jest !== 'undefined' && jest.fn)
      ? jest.fn((style) => style)
      : ((style) => style),
    compose: (typeof jest !== 'undefined' && jest.fn)
      ? jest.fn((style1, style2) => [style1, style2])
      : ((style1, style2) => [style1, style2]),
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    Image: mockComponent('Animated.Image'),
    ScrollView: mockComponent('Animated.ScrollView'),
    Value: jestFn(() => ({
      setValue: jestFn(),
      interpolate: jestFn(() => ({
        __getValue: jestFn(() => 0),
      })),
      addListener: jestFn(() => ({ remove: jestFn() })),
      removeListener: jestFn(),
      removeAllListeners: jestFn(),
    })),
    timing: jestFn(() => ({
      start: jestFn((callback) => callback && callback()),
    })),
    spring: jestFn(() => ({
      start: jestFn((callback) => callback && callback()),
    })),
    sequence: jestFn(() => ({
      start: jestFn((callback) => callback && callback()),
    })),
    parallel: jestFn(() => ({
      start: jestFn((callback) => callback && callback()),
    })),
    delay: jestFn(() => ({
      start: jestFn((callback) => callback && callback()),
    })),
  },
  PanResponder: {
    create: jestFn(() => ({
      panHandlers: {},
    })),
  },
  UIManager: {
    setLayoutAnimationEnabledExperimental: jestFn(),
  },
  Keyboard: {
    addListener: jestFn(() => ({ remove: jestFn() })),
    removeListener: jestFn(),
    dismiss: jestFn(),
    isVisible: jestFn(() => false),
  },
  Linking: {
    openURL: jestFn(() => Promise.resolve(true)),
    canOpenURL: jestFn(() => Promise.resolve(true)),
    addEventListener: jestFn(() => ({ remove: jestFn() })),
    removeEventListener: jestFn(),
    getInitialURL: jestFn(() => Promise.resolve(null)),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jestFn(() => ({ remove: jestFn() })),
    removeEventListener: jestFn(),
  },
  Clipboard: {
    getString: jestFn(() => Promise.resolve('')),
    setString: jestFn(() => Promise.resolve()),
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: jestFn(async () => false),
    isBoldTextEnabled: jestFn(async () => false),
    isGrayscaleEnabled: jestFn(async () => false),
    isInvertColorsEnabled: jestFn(async () => false),
    isReduceMotionEnabled: jestFn(async () => false),
    isReduceTransparencyEnabled: jestFn(async () => false),
    addEventListener: jestFn(() => ({ remove: jestFn() })),
    removeEventListener: jestFn(),
    setAccessibilityFocus: jestFn(),
    announceForAccessibility: jestFn(),
    sendAccessibilityEvent: jestFn(),
  },
  Easing: {
    bezier: () => (t) => t,
    linear: jestFn(),
    ease: jestFn(),
    quad: jestFn(),
    cubic: jestFn(),
    poly: jestFn(),
    sin: jestFn(),
    circle: jestFn(),
    exp: jestFn(),
    elastic: jestFn(),
    back: jestFn(),
    bounce: jestFn(),
    in: jestFn(),
    out: jestFn(),
    inOut: jestFn(),
  },
  NativeModules: {
    RNKeychainManager: {},
  },
  AsyncStorage: {
    getItem: jestFn(() => Promise.resolve(null)),
    setItem: jestFn(() => Promise.resolve(null)),
    removeItem: jestFn(() => Promise.resolve(null)),
    getAllKeys: jestFn(() => Promise.resolve([])),
    multiGet: jestFn(() => Promise.resolve([])),
    multiSet: jestFn(() => Promise.resolve(null)),
    multiRemove: jestFn(() => Promise.resolve(null)),
    clear: jestFn(() => Promise.resolve(null)),
  },
};

module.exports = RN;
