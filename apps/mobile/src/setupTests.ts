/**
 * Jest Setup for PawfectMatch Mobile App
 * Comprehensive test configuration with mocks and utilities
 */

// Global test environment setup
global.__DEV__ = true;

// Suppress console logs during tests
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

// Mock Expo SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock Expo Local Authentication
jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2, 3])),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  authenticateWithBiometricsAsync: jest.fn(() =>
    Promise.resolve({ success: true }),
  ),
}));

// Mock Expo Notifications
jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  scheduleNotificationAsync: jest.fn(() =>
    Promise.resolve("test-notification-id"),
  ),
  cancelNotificationAsync: jest.fn(),
  cancelAllNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
}));

// Mock Expo Haptics
jest.mock("expo-haptics", () => ({
  __esModule: true,
  ...jest.requireActual("expo-haptics"),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock Expo Camera
jest.mock("expo-camera", () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
}));

// Mock Expo Image Picker
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    All: "all",
    Images: "images",
    Videos: "videos",
  },
}));

// Mock Expo File System
jest.mock("expo-file-system", () => ({
  documentDirectory: "file://test-document-directory/",
  cacheDirectory: "file://test-cache-directory/",
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

// Mock React Native Gesture Handler
jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      ScrollView: View,
    },
    Gesture: {
      Tap: jest.fn(() => ({
        onStart: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
      })),
      Pan: jest.fn(() => ({
        onStart: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
      })),
    },
    GestureDetector: View,
    State: {
      BEGAN: "begin",
      ACTIVE: "active",
      END: "end",
      CANCELLED: "cancelled",
    },
  };
});

// Mock React Native Reanimated
jest.mock("react-native-reanimated", () => {
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View: View,
      Value: jest.fn((value) => ({ value })),
      event: jest.fn(),
      call: jest.fn(),
      eq: jest.fn(),
      and: jest.fn(),
      or: jest.fn(),
      neq: jest.fn(),
      defined: jest.fn(),
      not: jest.fn(),
      set: jest.fn(),
      add: jest.fn(),
      sub: jest.fn(),
      multiply: jest.fn(),
      divide: jest.fn(),
      pow: jest.fn(),
      modulo: jest.fn(),
      sqrt: jest.fn(),
      sin: jest.fn(),
      cos: jest.fn(),
      min: jest.fn(),
      max: jest.fn(),
      abs: jest.fn(),
      floor: jest.fn(),
      ceil: jest.fn(),
      round: jest.fn(),
      concat: jest.fn(),
      cond: jest.fn(),
      block: jest.fn(),
      createAnimatedComponent: jest.fn((component) => component),
      Extrapolate: {
        EXTEND: "extend",
        CLAMP: "clamp",
        IDENTITY: "identity",
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
      },
      clockRunning: jest.fn(),
      stopClock: jest.fn(),
      startClock: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
    },
    useAnimatedValue: jest.fn((init) => ({ value: init })),
    useAnimatedProps: jest.fn(),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    withRepeat: jest.fn((val) => val),
    withSequence: jest.fn((val) => val),
    withDelay: jest.fn((val) => val),
    cancelAnimation: jest.fn(),
    createAnimatedGestureHandler: jest.fn(),
    useSharedValue: jest.fn((value) => ({ value })),
    useAnimatedStyle: jest.fn((style) => style),
    useDerivedValue: jest.fn((value) => value),
    useAnimatedReaction: jest.fn(),
    useAnimatedGestureHandler: jest.fn(),
    useAnimatedScrollHandler: jest.fn(),
    useAnimatedRef: jest.fn(),
    interpolate: jest.fn((value) => value),
    Extrapolate: {
      EXTEND: "extend",
      CLAMP: "clamp",
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      inOut: jest.fn(),
      out: jest.fn(),
    },
  };
});

// Mock React Native Screens
jest.mock("react-native-screens", () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(() => true),
}));

// Mock React Native Safe Area Context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: any }) => children,
  SafeAreaView: ({ children }: { children: any }) => children,
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}));

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
  __esModule: true,
  createNavigationContainerRef: jest.fn(),
  NavigationContainer: ({ children }: { children: any }) => children,
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  useNavigationContainerRef: jest.fn(),
}));

jest.mock("@react-navigation/native-stack", () => ({
  __esModule: true,
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: { children: any }) => children,
    Screen: ({ children }: { children: any }) => children,
  })),
}));

jest.mock("@react-navigation/bottom-tabs", () => ({
  __esModule: true,
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }: { children: any }) => children,
    Screen: ({ children }: { children: any }) => children,
  })),
}));

// Mock Socket.io Client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
    id: "test-socket-id",
  })),
}));

// Mock WebRTC
jest.mock("react-native-webrtc", () => ({
  RTCPeerConnection: jest.fn(),
  RTCIceCandidate: jest.fn(),
  RTCSessionDescription: jest.fn(),
  mediaDevices: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: jest.fn(() => []),
        getAudioTracks: jest.fn(() => []),
        getVideoTracks: jest.fn(() => []),
      }),
    ),
  },
  getDisplayMedia: jest.fn(),
}));

// Mock InCallManager
jest.mock("react-native-incall-manager", () => ({
  __esModule: true,
  default: {
    start: jest.fn(),
    stop: jest.fn(),
    setSpeakerphoneOn: jest.fn(),
    getSpeakerphoneOn: jest.fn(() => Promise.resolve(false)),
    setKeepScreenOn: jest.fn(),
    setForceSpeakerphoneOn: jest.fn(),
    setMicrophoneMute: jest.fn(),
    setBluetoothScoOn: jest.fn(),
    setBluetoothScoOff: jest.fn(),
  },
}));

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() =>
      Promise.resolve({
        isConnected: true,
        type: "wifi",
        isInternetReachable: true,
      }),
    ),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

// Mock Geolocation
jest.mock("@react-native-community/geolocation", () => ({
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

// Mock React Native Maps
jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polygon: View,
    Polyline: View,
    Circle: View,
    Callout: View,
    PROVIDER_GOOGLE: "google",
  };
});

// Mock React Native Permissions
jest.mock("react-native-permissions", () => ({
  check: jest.fn(() => Promise.resolve("granted")),
  request: jest.fn(() => Promise.resolve("granted")),
  PERMISSIONS: {
    IOS: {},
    ANDROID: {},
  },
  RESULTS: {
    UNAVAILABLE: "unavailable",
    DENIED: "denied",
    LIMITED: "limited",
    GRANTED: "granted",
    BLOCKED: "blocked",
  },
}));

// Mock @pawfectmatch/core
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  useAuthStore: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    setUser: jest.fn(),
    setTokens: jest.fn(),
    setError: jest.fn(),
    setIsLoading: jest.fn(),
    clearError: jest.fn(),
    refreshToken: jest.fn(),
  })),
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
  getApiClient: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
}));

// Test utilities
global.flushPromises = () => new Promise((resolve) => setImmediate(resolve));

// Extend timeout for async tests
jest.setTimeout(15000);
