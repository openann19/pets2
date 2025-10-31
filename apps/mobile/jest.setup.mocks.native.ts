/**
 * React Native component mocks
 * Essential React Native component mocks for all tests
 */

// Mock StyleSheet to return styles as-is (no transformation)
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: jest.fn((styles) => styles),
  flatten: jest.fn((styles) => styles),
  compose: jest.fn((style1, style2) => [style1, style2]),
}));

// Mock Dimensions to return fixed window dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn((dimension) => {
    if (dimension === 'window') {
      return { width: 375, height: 812 };
    }
    if (dimension === 'screen') {
      return { width: 375, height: 812 };
    }
    return { width: 375, height: 812 };
  }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
}));

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
// NOTE: Reanimated mock is centralized in jest.setup.ts using the official mock
// This file is kept for other native mocks only

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

// Mock StyleSheet explicitly to ensure it's available in tests
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => {
  const create = jest.fn((styles) => {
    if (typeof styles === 'object' && styles !== null) {
      return styles;
    }
    return {};
  });
  const flatten = jest.fn((style) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style);
    }
    return style || {};
  });
  return {
    __esModule: true,
    default: {
      create,
      flatten,
      compose: jest.fn((style1, style2) => [style1, style2]),
      hairlineWidth: 1,
      absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
      absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    },
    create,
    flatten,
  };
});

// Mock Dimensions explicitly
jest.mock('react-native/Libraries/Utilities/Dimensions', () => {
  const getDimensions = jest.fn((dimension?: 'window' | 'screen') => {
    const defaultDimensions = { width: 375, height: 812, scale: 2, fontScale: 1 };
    return defaultDimensions;
  });
  return {
    __esModule: true,
    default: {
      get: getDimensions,
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
    get: getDimensions,
  };
});

// Mock Animated API
jest.mock('react-native/Libraries/Animated/Animated', () => {
  // Use require instead of import to avoid timing issues
  const AnimatedMock = require('../../__mocks__/Animated.js');
  return AnimatedMock;
});

// Mock InteractionManager
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => {
  const actualInteractionManager = (jest as any).requireActual('react-native/Libraries/Interaction/InteractionManager');
  
  return {
    ...actualInteractionManager,
    InteractionManager: {
      ...actualInteractionManager.InteractionManager,
      runAfterInteractions: jest.fn((callback) => {
        // Execute callback immediately in tests
        if (typeof callback === 'function') {
          setTimeout(callback, 0);
        }
        return {
          cancel: jest.fn(),
        };
      }),
      createInteractionHandle: jest.fn(() => 1),
      clearInteractionHandle: jest.fn(),
    },
  };
});

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

