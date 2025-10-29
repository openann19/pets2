import { renderHook, cleanup } from '@testing-library/react-native';
import { useAdminDashboardScreen } from '../useAdminDashboardScreen';

// Mock native modules
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
}));

jest.mock('react-native-aes-crypto', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

describe('useAdminDashboardScreen - Minimal Test', () => {
  afterEach(async () => {
    await cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should render without crashing', () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    expect(result.current).toBeDefined();
    expect(result.current.isLoading).toBe(true);
  });
});
