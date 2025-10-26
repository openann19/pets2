/**
 * React Native component mocks
 * Essential React Native component mocks for all tests
 */

// Mock React Native list components to render items synchronously
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  const RN = require('react-native');
  return React.forwardRef((props: any, ref: any) => {
    const { data, renderItem, ListHeaderComponent, ListFooterComponent, ...rest } = props;
    return React.createElement(
      RN.ScrollView,
      { ref, ...rest },
      ListHeaderComponent ? React.createElement(ListHeaderComponent, null) : null,
      Array.isArray(data) ? data.map((item: any, index: number) => renderItem({ item, index })) : null,
      ListFooterComponent ? React.createElement(ListFooterComponent, null) : null
    );
  });
});

jest.mock('react-native/Libraries/Lists/VirtualizedList', () => {
  const React = require('react');
  const RN = require('react-native');
  return React.forwardRef((props: any, ref: any) => {
    const { data, renderItem, getItem, getItemCount, ...rest } = props;
    const items = Array.isArray(data) ? data : [];
    const count = typeof getItemCount === 'function' ? getItemCount(items) : items.length;
    const children = [] as any[];
    for (let i = 0; i < count; i++) {
      const itm = typeof getItem === 'function' ? getItem(items, i) : items[i];
      children.push(renderItem({ item: itm, index: i }));
    }
    return React.createElement(RN.ScrollView, { ref, ...rest }, ...children);
  });
});

jest.mock('react-native/Libraries/Lists/SectionList', () => {
  const React = require('react');
  const RN = require('react-native');
  return React.forwardRef((props: any, ref: any) => {
    const { sections, renderItem, renderSectionHeader, ...rest } = props;
    const children = Array.isArray(sections)
      ? sections.flatMap((section: any) => [
          renderSectionHeader ? renderSectionHeader({ section }) : null,
          ...section.data.map((item: any, index: number) => renderItem({ item, index, section })),
        ])
      : [];
    return React.createElement(RN.ScrollView, { ref, ...rest }, ...children);
  });
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    __esModule: true,
    default: RN.View,
    Marker: RN.View,
    Circle: RN.View,
    Polyline: RN.View,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native');
  return {
    GestureHandlerRootView: RN.View,
    PanGestureHandler: RN.View,
    TapGestureHandler: RN.View,
    State: {},
    Directions: {},
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: require('react-native').View,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'View',
  Circle: 'View',
  Rect: 'View',
  Path: 'View',
  G: 'View',
  Text: 'Text',
  Defs: 'View',
  LinearGradient: 'View',
  Stop: 'View',
  ClipPath: 'View',
  Polygon: 'View',
  Polyline: 'View',
  Ellipse: 'View',
  Line: 'View',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  
  // Create animation helpers
  const createAnimation = (name: string) => ({
    duration: jest.fn((ms: number) => ({ duration: ms, name })),
    delay: jest.fn((ms: number) => ({ delay: ms, name })),
    springify: jest.fn(() => ({ name, type: 'spring' })),
    stiffness: jest.fn((value: number) => ({ stiffness: value, name })),
    damping: jest.fn((value: number) => ({ damping: value, name })),
    entering: { duration: jest.fn((ms: number) => ({ duration: ms, name })) },
    exiting: { duration: jest.fn((ms: number) => ({ duration: ms, name })) },
  });
  
  // Simple component creation without caching (to avoid scope issues)
  const View = React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref }));
  const Text = React.forwardRef((props: any, ref: any) => React.createElement('span', { ...props, ref }));
  const ScrollView = React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref }));
  const Image = React.forwardRef((props: any, ref: any) => React.createElement('img', { ...props, ref }));
  
  return {
    __esModule: true,
    default: {},
    View,
    Text,
    ScrollView,
    Image,
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((updater) => updater()),
    withTiming: jest.fn((toValue) => toValue),
    withSpring: jest.fn((toValue) => toValue),
    withDelay: jest.fn(() => jest.fn()),
    withSequence: jest.fn(() => jest.fn()),
    withRepeat: jest.fn(() => jest.fn()),
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
    Extrapolate: {
      CLAMP: 'clamp',
      EXTEND: 'extend',
      IDENTITY: 'identity',
    },
    // Entering animations
    FadeIn: createAnimation('FadeIn'),
    FadeInDown: createAnimation('FadeInDown'),
    FadeInUp: createAnimation('FadeInUp'),
    FadeInLeft: createAnimation('FadeInLeft'),
    FadeInRight: createAnimation('FadeInRight'),
    FlipInEasyX: createAnimation('FlipInEasyX'),
    FlipInEasyY: createAnimation('FlipInEasyY'),
    FlipInXDown: createAnimation('FlipInXDown'),
    FlipInXUp: createAnimation('FlipInXUp'),
    SlideInDown: createAnimation('SlideInDown'),
    SlideInUp: createAnimation('SlideInUp'),
    ZoomIn: createAnimation('ZoomIn'),
    // Exiting animations
    FadeOut: createAnimation('FadeOut'),
    FadeOutDown: createAnimation('FadeOutDown'),
    FadeOutUp: createAnimation('FadeOutUp'),
    SlideOutDown: createAnimation('SlideOutDown'),
    ZoomOut: createAnimation('ZoomOut'),
  };
});

// Mock react-native NativeModules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  RNKeychainManager: {},
}));

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => ({
  __esModule: true,
  default: require('react-native').View,
}));

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: require('react-native').View,
  PickerItem: require('react-native').View,
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    configure: jest.fn(),
  },
  NetInfoState: {
    unknown: 'unknown',
    none: 'none',
    cellular: 'cellular',
    wifi: 'wifi',
    bluetooth: 'bluetooth',
    ethernet: 'ethernet',
    wimax: 'wimax',
    vpn: 'vpn',
    other: 'other',
  },
}));

