/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAdminDashboardScreen } from '../useAdminDashboardScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as any;

// Mock error handler
jest.mock('../../useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleNetworkError: jest.fn(),
    handleOfflineError: jest.fn(),
  }),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('useAdminDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.metrics).toBeDefined();
    expect(result.current.recentActivity).toEqual([]);
  });

  it('should load dashboard data on mount', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics.totalUsers).toBeGreaterThan(0);
    expect(result.current.recentActivity).toHaveLength(4);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('should provide metrics data', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const { metrics } = result.current;
    expect(metrics.totalUsers).toBe(15420);
    expect(metrics.activeUsers).toBe(12890);
    expect(metrics.totalPets).toBe(8760);
    expect(metrics.totalMatches).toBe(45230);
    expect(metrics.systemHealth).toBe('healthy');
  });

  it('should handle refresh', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      void result.current.onRefresh();
    });

    expect(result.current.isRefreshing).toBe(true);

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  it('should navigate to users screen', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onNavigateToUsers();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminUsers');
  });

  it('should navigate to chats screen', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onNavigateToChats();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminChats');
  });

  it('should navigate to verifications screen', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onNavigateToVerifications();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminVerifications');
  });

  it('should navigate to uploads screen', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onNavigateToUploads();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminUploads');
  });

  it('should navigate to analytics screen', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onNavigateToAnalytics();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminAnalytics');
  });

  it('should navigate to security screen', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onNavigateToSecurity();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminSecurity');
  });

  it('should navigate to billing screen', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onNavigateToBilling();
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminBilling');
  });

  it('should provide quick actions', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.quickActions).toHaveLength(4);
    expect(result.current.quickActions[0].id).toBe('moderate_reports');
    expect(result.current.quickActions[1].id).toBe('verify_pets');
  });

  it('should handle quick action execution', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Execute quick action
    act(() => {
      result.current.onQuickAction('verify_pets');
    });

    expect(mockNavigate).toHaveBeenCalledWith('AdminVerifications');
  });

  it('should update last updated timestamp', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstUpdate = result.current.lastUpdated;
    expect(firstUpdate).toBeInstanceOf(Date);

    // Trigger refresh
    await act(async () => {
      await result.current.onRefresh();
    });

    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(result.current.lastUpdated?.getTime()).toBeGreaterThanOrEqual(
      firstUpdate?.getTime() ?? 0,
    );
  });

  it('should provide recent activity data', async () => {
    const { result } = renderHook(() => useAdminDashboardScreen({ navigation: mockNavigation }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recentActivity).toHaveLength(4);
    expect(result.current.recentActivity[0].type).toBe('verification_submitted');
    expect(result.current.recentActivity[0].priority).toBe('medium');
    expect(result.current.recentActivity[1].type).toBe('report_filed');
    expect(result.current.recentActivity[1].priority).toBe('high');
  });

  it('should return stable function references', async () => {
    const { result, rerender } = renderHook(() =>
      useAdminDashboardScreen({ navigation: mockNavigation }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstOnRefresh = result.current.onRefresh;
    const firstOnNavigateToUsers = result.current.onNavigateToUsers;

    rerender();

    expect(result.current.onRefresh).toBe(firstOnRefresh);
    expect(result.current.onNavigateToUsers).toBe(firstOnNavigateToUsers);
  });
});
