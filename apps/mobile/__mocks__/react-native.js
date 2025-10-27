/**
 * React Native Mock
 * Basic mock for React Native components and APIs
 */

const React = require('react');

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
  TextInput: mockComponent('TextInput'),
  ScrollView: mockComponent('ScrollView'),
  FlatList: mockComponent('FlatList'),
  SectionList: mockComponent('SectionList'),
  Image: mockComponent('Image'),
  Modal: mockComponent('Modal'),
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        __getValue: jest.fn(() => 0),
      })),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
    })),
    spring: jest.fn(() => ({
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
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
  UIManager: {
    setLayoutAnimationEnabledExperimental: jest.fn(),
  },
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  },
  Linking: {
    openURL: jest.fn().mockResolvedValue(true),
    canOpenURL: jest.fn().mockResolvedValue(true),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  AsyncStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(null),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(null),
    multiRemove: jest.fn().mockResolvedValue(null),
    clear: jest.fn().mockResolvedValue(null),
  },
};

module.exports = RN;
