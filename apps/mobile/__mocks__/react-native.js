/**
 * React Native Mock
 * Basic mock for React Native components and APIs
 */

const React = require('react');
// Import actual React Native for Text component to work properly with React Testing Library
// This is safe to do in Jest mocks as requireActual is hoisted
const actualRN = typeof jest !== 'undefined' && typeof jest.requireActual === 'function'
  ? jest.requireActual('react-native')
  : {};

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
// Return proper React components that React Testing Library can render
const mockComponent = (name) => {
  const Component = (props, ref) => {
    // Return a React Native-like host element for react-test-renderer
    return React.createElement(
      name,
      {
        ...props,
        ref,
        testID: props.testID || name,
        'data-testid': props.testID || name,
        'data-component': name,
        // Accessibility props (no-op for tests)
        accessibilityLabel: props.accessibilityLabel,
        accessibilityRole: props.accessibilityRole,
        role: props.accessibilityRole,
      },
      props.children
    );
  };
  Component.displayName = name;
  Component.propTypes = undefined;
  // Return a forwardRef component that React can use
  if (React.forwardRef) {
    return React.forwardRef(Component);
  }
  // Fallback if forwardRef not available
  Component.ref = null;
  return Component;
};

// Special mock for Text component - needs to render children as text
// React Testing Library for React Native uses react-test-renderer which needs proper Text nodes
const mockTextComponent = (name) => {
  const Component = (props, ref) => {
    // Extract text content from children for React Testing Library to find
    const getTextContent = (children) => {
      if (typeof children === 'string') {
        return children;
      }
      if (typeof children === 'number') {
        return String(children);
      }
      if (typeof children === 'boolean') {
        return children ? 'true' : 'false';
      }
      if (children === null || children === undefined) {
        return '';
      }
      if (Array.isArray(children)) {
        return children
          .map((child) => {
            if (typeof child === 'string') return child;
            if (typeof child === 'number') return String(child);
            if (typeof child === 'boolean') return child ? 'true' : 'false';
            if (child === null || child === undefined) return '';
            if (child && typeof child === 'object' && 'props' in child && child.props?.children) {
              return getTextContent(child.props.children);
            }
            // Handle React elements
            if (React.isValidElement && React.isValidElement(child)) {
              return getTextContent(child.props?.children);
            }
            return '';
          })
          .filter(Boolean)
          .join('');
      }
      if (children && typeof children === 'object') {
        // Handle React elements
        if ('props' in children && children.props?.children) {
          return getTextContent(children.props.children);
        }
        // Handle React elements with isValidElement
        if (React.isValidElement && React.isValidElement(children)) {
          return getTextContent(children.props?.children);
        }
      }
      return '';
    };
    
    const textContent = getTextContent(props.children);
    
    // Create a React Native-like Text component structure
    // Use Text component name to match React Native's structure for react-test-renderer
    // React Testing Library for React Native looks for text content in children
    const textProps = {
      ...props,
      ref,
      testID: props.testID || name,
      accessibilityLabel: props.accessibilityLabel || textContent,
      accessibilityRole: props.accessibilityRole || 'text',
      // Ensure children contains the text content for React Testing Library to find
      children: textContent || props.children,
    };
    
    // Return a structure that react-test-renderer can serialize
    // Use React.createElement with 'Text' type to match React Native structure
    return React.createElement('Text', textProps, textContent || props.children);
  };
  Component.displayName = name;
  Component.propTypes = undefined;
  // Make the component identifiable as Text for React Testing Library
  Component._isTextComponent = true;
  if (React.forwardRef) {
    return React.forwardRef(Component);
  }
  Component.ref = null;
  return Component;
};

// Try to use actual React Native Text component for better React Testing Library support
// This works when jest.requireActual is available
let TextComponent = mockTextComponent('Text');
if (actualRN && actualRN.Text) {
  try {
    // Check if we're in a test environment that supports actual React Native components
    // In most Jest environments, we'll use the mock, but if actualRN.Text exists and works,
    // use it for better React Testing Library compatibility
    const testText = actualRN.Text;
    // Verify it's a valid component before using it
    if (typeof testText === 'function' || (testText && typeof testText.render === 'function')) {
      TextComponent = actualRN.Text;
    } else {
      TextComponent = mockTextComponent('Text');
    }
  } catch (e) {
    // Fall back to mock if actual component fails
    TextComponent = mockTextComponent('Text');
  }
}

const RN = {
  View: mockComponent('View'),
  Text: TextComponent,
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
    alert: jestFn((title, message, buttons, options) => {
      // React Native Alert.alert signature: (title, message?, buttons?, options?)
      // Auto-click the last button (usually "OK" or confirm action) for test convenience
      if (buttons && Array.isArray(buttons) && buttons.length > 0) {
        const lastButton = buttons[buttons.length - 1];
        // Execute onPress callback if available
        if (lastButton && typeof lastButton.onPress === 'function') {
          try {
            lastButton.onPress();
          } catch (e) {
            // Ignore errors in test mocks
          }
        }
      }
      // Return undefined to match React Native Alert.alert behavior
      return undefined;
    }),
  },
  Platform: {
    OS: 'ios',
    Version: 15,
    select: jestFn((obj) => {
      if (!obj) return undefined;
      return obj.ios || obj.default || obj.android;
    }),
    isPad: false,
    isTV: false,
    isTesting: true,
  },
  Dimensions: {
    get: function get(dimension) {
      // Support both 'window' and 'screen' dimensions
      const defaultDimensions = { width: 375, height: 812, scale: 2, fontScale: 1 };
      if (dimension === 'window' || dimension === 'screen') {
        return defaultDimensions;
      }
      return defaultDimensions;
    },
    addEventListener: jestFn(() => ({ remove: jestFn() })),
    removeEventListener: jestFn(),
  },
  StyleSheet: {
    create: (styles) => {
      // Ensure StyleSheet.create returns a proper object
      if (typeof styles === 'object' && styles !== null) {
        return styles;
      }
      return {};
    },
    flatten: (style) => {
      if (Array.isArray(style)) {
        return Object.assign({}, ...style);
      }
      return style || {};
    },
    compose: (style1, style2) => [style1, style2],
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockTextComponent('Animated.Text'),
    Image: mockComponent('Animated.Image'),
    ScrollView: mockComponent('Animated.ScrollView'),
    Value: class AnimatedValue {
      constructor(value) {
        this._value = value;
        this.setValue = jestFn((newValue) => {
          this._value = newValue;
        });
        this.interpolate = jestFn(() => this);
        this.addListener = jestFn(() => ({ remove: jestFn() }));
        this.removeListener = jestFn();
        this.removeAllListeners = jestFn();
        this.__getValue = jestFn(() => this._value);
      }
    },
    ValueXY: class AnimatedValueXY {
      constructor(value) {
        const defaultValue = value || { x: 0, y: 0 };
        this.x = new module.exports.Animated.Value(typeof defaultValue.x === 'number' ? defaultValue.x : 0);
        this.y = new module.exports.Animated.Value(typeof defaultValue.y === 'number' ? defaultValue.y : 0);
        this.setValue = jestFn();
        this.setOffset = jestFn();
        this.flattenOffset = jestFn();
        this.extractOffset = jestFn();
        this.getLayout = jestFn(() => ({ left: this.x, top: this.y }));
        this.getTranslateTransform = jestFn(() => [
          { translateX: this.x },
          { translateY: this.y },
        ]);
      }
    },
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
    loop: jestFn(() => ({
      start: jestFn((callback) => callback && callback()),
    })),
    event: jestFn(() => jestFn()),
    createAnimatedComponent: (Component) => Component,
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
  StatusBar: {
    setBarStyle: jestFn(),
    setHidden: jestFn(),
    setBackgroundColor: jestFn(),
    setTranslucent: jestFn(),
    setNetworkActivityIndicatorVisible: jestFn(),
  },
  InteractionManager: {
    runAfterInteractions: jestFn((callback) => {
      if (typeof callback === 'function') {
        callback();
      }
      return { then: jestFn() };
    }),
    createInteractionHandle: jestFn(() => 1),
    clearInteractionHandle: jestFn(),
    setDeadline: jestFn(),
  },
  FileSystem: {
    FileSystemUploadType: {
      BINARY_CONTENT: 'BINARY_CONTENT',
      MULTIPART: 'MULTIPART',
    },
    createUploadTask: jestFn(() => ({
      uploadAsync: jestFn(() => Promise.resolve({ status: 200, body: '{"key": "test-key"}' })),
      cancelAsync: jestFn(),
      pauseAsync: jestFn(),
      resumeAsync: jestFn(),
    })),
    uploadAsync: jestFn(() => Promise.resolve({ status: 200, body: '{"key": "test-key"}' })),
    downloadAsync: jestFn(() => Promise.resolve({ status: 200, uri: 'file://test' })),
    getInfoAsync: jestFn(() => Promise.resolve({ exists: true, size: 1000, uri: 'file://test' })),
    readAsStringAsync: jestFn(() => Promise.resolve('test content')),
    writeAsStringAsync: jestFn(() => Promise.resolve()),
    deleteAsync: jestFn(() => Promise.resolve()),
    moveAsync: jestFn(() => Promise.resolve()),
    copyAsync: jestFn(() => Promise.resolve()),
    makeDirectoryAsync: jestFn(() => Promise.resolve()),
    readDirectoryAsync: jestFn(() => Promise.resolve(['file1.jpg', 'file2.png'])),
    getContentUriAsync: jestFn(() => Promise.resolve('content://test')),
    getFreeDiskStorageAsync: jestFn(() => Promise.resolve(1000000)),
    getTotalDiskCapacityAsync: jestFn(() => Promise.resolve(10000000)),
  },
};

module.exports = RN;
// Also export as default for ES modules
module.exports.default = RN;
