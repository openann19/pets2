/**
 * Expo-specific mocks
 * Loaded conditionally for tests that need Expo functionality
 */

// Mock expo-linking FIRST (before any other mocks that might import it)
// Must be virtual since package may not be installed
jest.mock('expo-linking', () => {
  return {
    __esModule: true,
    default: {
      createURL: (p: string) => `app:///${p}`,
      parse: jest.fn((url: string) => ({
        scheme: 'app',
        hostname: '',
        path: url.replace(/^app:\/\//, ''),
        queryParams: {},
      })),
      makeURL: jest.fn((path: string) => `app://${path}`),
      resolve: jest.fn((url: string, path: string) => `app://${path}`),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      openURL: jest.fn(() => Promise.resolve(true)),
      sendIntent: jest.fn(() => Promise.resolve()),
    },
    createURL: (p: string) => `app:///${p}`,
    parse: jest.fn((url: string) => ({
      scheme: 'app',
      hostname: '',
      path: url.replace(/^app:\/\//, ''),
      queryParams: {},
    })),
    makeURL: jest.fn((path: string) => `app://${path}`),
    resolve: jest.fn((url: string, path: string) => `app://${path}`),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openURL: jest.fn(() => Promise.resolve(true)),
    sendIntent: jest.fn(() => Promise.resolve()),
  };
}, { virtual: true });

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { manifest: {}, expoConfig: {}, deviceName: 'jest' },
}), { virtual: true });

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

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

// Mock expo-blur with proper component for test detection
jest.mock('expo-blur', () => {
  const React = require('react');
  const RN = require('react-native');
  const BlurViewComponent = React.forwardRef((props: any, ref: any) => {
    const { children, ...restProps } = props;
    return React.createElement(RN.View, { ...restProps, ref }, children);
  });
  BlurViewComponent.displayName = 'BlurView';
  return {
    BlurView: BlurViewComponent,
  };
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

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const RN = require('react-native');
  
  // Simple icon component without caching to avoid scope issues
  const createIconComponent = () => React.forwardRef((props: any, ref: any) => {
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

