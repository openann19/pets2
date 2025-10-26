/**
 * Minimal Jest setup for testing
 */

// Polyfill for TextEncoder/TextDecoder (Node.js 18+ has it built-in, but Jest may not)
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

import { Alert as RNAlert } from 'react-native';

const alertMock = jest.fn();
jest.spyOn(RNAlert, 'alert').mockImplementation(alertMock);

// Mock @react-native-masked-view/masked-view
jest.mock('@react-native-masked-view/masked-view', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
  MaskedViewIOS: ({ children }: any) => children,
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const RN = require('react-native');
  
  const createIconComponent = () => 
    React.forwardRef((props: any, ref: any) => {
      const { name: iconName, size, color, testID, ...restProps } = props;
      return React.createElement(
        RN.View,
        {
          testID: testID || `icon-${iconName}`,
          accessibilityLabel: iconName,
          'data-name': iconName,
          'data-size': size,
          'data-color': color,
          ref: ref,
          ...restProps,
        }
      );
    });
  
  return {
    Ionicons: createIconComponent(),
    MaterialIcons: createIconComponent(),
    MaterialCommunityIcons: createIconComponent(),
    FontAwesome: createIconComponent(),
    FontAwesome5: createIconComponent(),
    Feather: createIconComponent(),
    AntDesign: createIconComponent(),
    Entypo: createIconComponent(),
  };
});

// Mock react-native NativeModules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  RNKeychainManager: {},
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  setExtra: jest.fn(),
  setExtras: jest.fn(),
  Integrations: {},
  Severity: {
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
    Debug: 'debug',
  },
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2])),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  LocalAuthenticationResult: {
    Success: 'success',
    Cancel: 'cancel',
    NotEnrolled: 'notEnrolled',
    NotAvailable: 'notAvailable',
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  whenAvailable: jest.fn(),
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

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  SECURITY_LEVEL: {
    ANY: 'ANY',
    SECURE_HARDWARE: 'SECURE_HARDWARE',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
    ALWAYS: 'ALWAYS',
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  },
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-aes-crypto
jest.mock('react-native-aes-crypto', () => ({
  pbkdf2: jest.fn(() => Promise.resolve('hash')),
  encrypt: jest.fn(() => Promise.resolve('encrypted')),
  decrypt: jest.fn(() => Promise.resolve('decrypted')),
}));

// Mock react-native-encrypted-storage
jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockGetItem = jest.fn(() => Promise.resolve(null));
  const mockSetItem = jest.fn(() => Promise.resolve());
  const mockRemoveItem = jest.fn(() => Promise.resolve());
  const mockClear = jest.fn(() => Promise.resolve());
  const mockGetAllKeys = jest.fn(() => Promise.resolve([]));
  const mockMultiGet = jest.fn(() => Promise.resolve([]));
  const mockMultiSet = jest.fn(() => Promise.resolve());
  const mockMultiRemove = jest.fn(() => Promise.resolve());
  
  return {
    __esModule: true,
    default: {
      getItem: mockGetItem,
      setItem: mockSetItem,
      removeItem: mockRemoveItem,
      clear: mockClear,
      getAllKeys: mockGetAllKeys,
      multiGet: mockMultiGet,
      multiSet: mockMultiSet,
      multiRemove: mockMultiRemove,
      // Expose as named exports as well for compatibility
      getItemAsync: mockGetItem,
      setItemAsync: mockSetItem,
      removeItemAsync: mockRemoveItem,
      clearAsync: mockClear,
    },
  };
});

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ cancelled: true })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ cancelled: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: { Constants: { Type: { back: 'back', front: 'front' } } },
  CameraView: ({ children }: any) => children,
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0, altitudeAccuracy: 0, heading: 0, speed: 0 },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test]' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  deviceName: 'Test Device',
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({
    params: {},
    key: 'test-route',
    name: 'TestScreen',
  }),
  useFocusEffect: jest.fn((callback) => callback()),
  useIsFocused: jest.fn(() => true),
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      border: '#E5E5E5',
      notification: '#FF3B30',
    },
    dark: false,
  }),
}));

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isError: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
}));

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

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-blur
jest.mock('expo-blur', () => {
  const RN = require('react-native');
  return {
    BlurView: RN.View,
  };
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

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn((uri) => Promise.resolve({
    uri,
    width: 1920,
    height: 1920,
  })),
  FlipType: {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
  },
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

// Mock expo-av (audio/video)
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(() => Promise.resolve()),
      playAsync: jest.fn(() => Promise.resolve()),
      pauseAsync: jest.fn(() => Promise.resolve()),
      stopAsync: jest.fn(() => Promise.resolve()),
      unloadAsync: jest.fn(() => Promise.resolve()),
      setVolumeAsync: jest.fn(() => Promise.resolve()),
      getStatusAsync: jest.fn(() => Promise.resolve({
        isLoaded: true,
        isPlaying: false,
        durationMillis: 10000,
      })),
    })),
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(() => Promise.resolve()),
      startAsync: jest.fn(() => Promise.resolve()),
      stopAndUnloadAsync: jest.fn(() => Promise.resolve()),
      getURI: jest.fn(() => 'file:///test-recording.m4a'),
    })),
  },
  Video: jest.fn(() => 'View'),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///documents/',
  cacheDirectory: 'file:///cache/',
  readAsStringAsync: jest.fn(() => Promise.resolve('file content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve(['file1.txt', 'file2.jpg'])),
  getInfoAsync: jest.fn(() => Promise.resolve({
    exists: true,
    isDirectory: false,
    size: 1024,
    modificationTime: Date.now(),
    uri: 'file:///test-file.txt',
  })),
  downloadAsync: jest.fn(() => Promise.resolve({
    uri: 'file:///downloaded-file.jpg',
    status: 200,
  })),
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200 })),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(() => Promise.resolve({
      uri: 'file:///resumed-download.jpg',
      status: 200,
    })),
    pauseAsync: jest.fn(() => Promise.resolve()),
    resumeAsync: jest.fn(() => Promise.resolve()),
    savable: jest.fn(() => Promise.resolve()),
  })),
}));

// Global React Native mocks (to prevent tests from mocking react-native directly)
global.Alert = {
  alert: jest.fn(),
};

global.Platform = {
  OS: 'ios',
  Version: '14.0',
  select: jest.fn((obj) => obj.ios || obj.default),
  isTV: false,
  isTesting: true,
};

global.Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

global.Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

global.Keyboard = {
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
  scheduleLayoutAnimation: jest.fn(),
};

// Mock common third-party libraries
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

// Mock react-native-reanimated (no requireActual to avoid ESM issues)
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
  
  return {
    __esModule: true,
    default: {},
    View: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
    Text: React.forwardRef((props: any, ref: any) => React.createElement('span', { ...props, ref })),
    ScrollView: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
    Image: React.forwardRef((props: any, ref: any) => React.createElement('img', { ...props, ref })),
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

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test cleanup with proper timer handling
afterEach(() => {
  // Clean up any pending timers
  if (jest.isMockFunction(setTimeout)) {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  }
  jest.clearAllTimers();
});

// Suppress console errors in tests (optional - can be removed for debugging)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
