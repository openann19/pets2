/**
 * Third-party library mocks
 * Mocks for external dependencies
 */

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => {
  const mockNetInfoState = {
    isConnected: true,
    type: 'wifi',
    isInternetReachable: true,
    details: null,
  };

  return {
    __esModule: true,
    default: {
      fetch: jest.fn(() => Promise.resolve(mockNetInfoState)),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      configure: jest.fn(),
      getCurrentState: jest.fn(() => Promise.resolve(mockNetInfoState)),
    },
    NetInfoStateType: {
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
  };
});

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

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => {
  const actual = (jest as any).requireActual('@tanstack/react-query');
  return {
    ...actual,
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
  };
});

// Mock @expo/vector-icons (includes Ionicons)
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  // Create a mock icon component
  const createIcon = (name: string) => {
    return React.forwardRef((props: any, ref: any) => {
      return React.createElement(View, {
        ...props,
        ref,
        testID: props.testID || `icon-${name}`,
        'data-testid': props.testID || `icon-${name}`,
        'aria-label': props.accessibilityLabel || name,
      });
    });
  };
  
  return {
    Ionicons: createIcon('Ionicons'),
    MaterialIcons: createIcon('MaterialIcons'),
    MaterialCommunityIcons: createIcon('MaterialCommunityIcons'),
    FontAwesome: createIcon('FontAwesome'),
    FontAwesome5: createIcon('FontAwesome5'),
    AntDesign: createIcon('AntDesign'),
    Entypo: createIcon('Entypo'),
    Feather: createIcon('Feather'),
    Fontisto: createIcon('Fontisto'),
    Foundation: createIcon('Foundation'),
    Octicons: createIcon('Octicons'),
    SimpleLineIcons: createIcon('SimpleLineIcons'),
    Zocial: createIcon('Zocial'),
  };
});

// Mock react-native-vector-icons (alternative icon library)
jest.mock('react-native-vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const createIcon = (name: string) => {
    return React.forwardRef((props: any, ref: any) => {
      return React.createElement(View, {
        ...props,
        ref,
        testID: props.testID || `icon-${name}`,
      });
    });
  };
  
  return {
    Ionicons: createIcon('Ionicons'),
    MaterialIcons: createIcon('MaterialIcons'),
    MaterialCommunityIcons: createIcon('MaterialCommunityIcons'),
    FontAwesome: createIcon('FontAwesome'),
  };
});

