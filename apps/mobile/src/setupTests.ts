import "@testing-library/jest-native/extend-expect";
import { ReactNode } from "react";

// Declare global variables and types for tests
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAnimatedStyle: (style: object) => R;
      toBeReanimated: (value: number) => R;
    }
  }
}

// Configure Jest environment
jest.mock("react-native-reanimated", () => ({
  useSharedValue: jest.fn((initial: number) => ({ value: initial })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((toValue: number) => toValue),
  withSpring: jest.fn((toValue: number) => toValue),
  withDelay: jest.fn((_: number, animation: any) => animation),
  runOnJS: jest.fn((fn: Function) => fn),
  withSequence: jest.fn(
    (...animations: number[]) => animations[animations.length - 1],
  ),
  interpolate: jest.fn(),
  useDerivedValue: jest.fn(() => ({ value: 0 })),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    elastic: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

jest.mock("react-native-keychain", () => ({
  SECURITY_LEVEL_ANY: "MOCK_SECURITY_LEVEL_ANY",
  SECURITY_LEVEL_SECURE_SOFTWARE: "MOCK_SECURITY_LEVEL_SECURE_SOFTWARE",
  SECURITY_LEVEL_SECURE_HARDWARE: "MOCK_SECURITY_LEVEL_SECURE_HARDWARE",
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  PanGestureHandler: "PanGestureHandler",
  State: {
    ACTIVE: "ACTIVE",
    END: "END",
    FAILED: "FAILED",
    BEGAN: "BEGAN",
    CANCELLED: "CANCELLED",
    UNDETERMINED: "UNDETERMINED",
  },
  PanGestureHandlerGestureEvent: jest.fn(),
  PanGestureHandlerStateChangeEvent: jest.fn(),
}));

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
    data: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    dispatch: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {},
    name: "TestScreen",
  })),
  useFocusEffect: jest.fn((callback: () => void) => callback()),
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  createNavigationContainerRef: jest.fn(() => ({
    current: null,
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
}));

// Mock Socket.IO
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn(),
    connected: true,
  })),
}));

// Mock Expo Haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
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
}));

// Mock Expo ImagePicker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true }),
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true }),
  ),
  MediaTypeOptions: {
    All: "All",
    Videos: "Videos",
    Images: "Images",
  },
  Quality: {
    Low: 0.1,
    Medium: 0.5,
    High: 1,
  },
}));

// Mock Expo Notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: "mock-token" })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(),
  AndroidImportance: {
    DEFAULT: "default",
    HIGH: "high",
    LOW: "low",
    MIN: "min",
    NONE: "none",
  },
  AndroidNotificationPriority: {
    DEFAULT: "default",
    HIGH: "high",
    LOW: "low",
    MIN: "min",
    NONE: "none",
  },
}));

// Mock React Native
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: "ios",
    select: jest.fn((obj: any) => obj.ios || obj.default),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    currentState: "active",
  },
  NetInfo: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  },
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
}));

beforeAll(() => {
  // Global setup if needed
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Mock timers globally
jest.useFakeTimers();
