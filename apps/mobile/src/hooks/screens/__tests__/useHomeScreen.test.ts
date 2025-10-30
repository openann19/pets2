/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useHomeScreen } from '../useHomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
} as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock auth service
const mockGetAccessToken = jest.fn().mockResolvedValue('mock-token');
jest.mock('../../../services/AuthService', () => ({
  authService: {
    getAccessToken: mockGetAccessToken,
  },
}));

// Mock telemetry
const mockTelemetry = {
  trackHomeOpen: jest.fn(),
  trackHomeRefresh: jest.fn(),
  trackHomeQuickAction: jest.fn(),
  trackPremiumCTAClick: jest.fn(),
};

jest.mock('../../../lib/telemetry', () => ({
  telemetry: mockTelemetry,
}));

// Mock demo mode
const mockDemoMode = { enabled: false };
jest.mock('../../../demo/DemoModeProvider', () => ({
  useDemoMode: () => mockDemoMode,
}));

// Mock haptics
jest.mock('../../../ui/haptics', () => ({
  haptic: {
    tap: jest.fn(),
    confirm: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('useHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDemoMode.enabled = false;
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.stats).toEqual({
      matches: 0,
      messages: 0,
      pets: 0,
    });
    expect(result.current.recentActivity).toEqual([]);
    expect(result.current.refreshing).toBe(false);
  });

  it('should track home open on mount', () => {
    renderHook(() => useHomeScreen());

    expect(mockTelemetry.trackHomeOpen).toHaveBeenCalledTimes(1);
  });

  it('should load demo fixtures when in demo mode', async () => {
    mockDemoMode.enabled = true;

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => {
      expect(result.current.stats.matches).toBeGreaterThan(0);
    });

    expect(result.current.recentActivity.length).toBeGreaterThan(0);
  });

  it('should load data from API when not in demo mode', async () => {
    mockDemoMode.enabled = false;
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        matches: 5,
        messages: 3,
      }),
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        activities: [
          {
            id: 'activity-1',
            type: 'match',
            title: 'New Match',
            description: 'You matched!',
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => {
      expect(result.current.stats.matches).toBe(5);
    });

    expect(result.current.recentActivity.length).toBeGreaterThan(0);
  });

  it('should handle refresh action', async () => {
    mockDemoMode.enabled = false;
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        matches: 2,
        messages: 1,
      }),
    });

    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(mockTelemetry.trackHomeRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(false);
  });

  it('should handle quick action navigation', () => {
    const { result } = renderHook(() => useHomeScreen());

    act(() => {
      result.current.handleSwipePress();
    });

    expect(mockTelemetry.trackHomeQuickAction).toHaveBeenCalledWith({
      action: 'swipe',
    });
    expect(mockNavigate).toHaveBeenCalledWith('Swipe');
  });

  it('should handle matches action', () => {
    const { result } = renderHook(() => useHomeScreen());

    act(() => {
      result.current.handleMatchesPress();
    });

    expect(mockTelemetry.trackHomeQuickAction).toHaveBeenCalledWith({
      action: 'matches',
    });
    expect(mockNavigate).toHaveBeenCalledWith('Matches');
  });

  it('should handle messages action', () => {
    const { result } = renderHook(() => useHomeScreen());

    act(() => {
      result.current.handleMessagesPress();
    });

    expect(mockTelemetry.trackHomeQuickAction).toHaveBeenCalledWith({
      action: 'messages',
    });
    expect(mockNavigate).toHaveBeenCalledWith('Matches');
  });

  it('should handle premium action with telemetry', () => {
    const { result } = renderHook(() => useHomeScreen());

    act(() => {
      result.current.handlePremiumPress();
    });

    expect(mockTelemetry.trackHomeQuickAction).toHaveBeenCalledWith({
      action: 'premium',
    });
    expect(mockTelemetry.trackPremiumCTAClick).toHaveBeenCalledWith({
      source: 'home_quick_action',
    });
    expect(mockNavigate).toHaveBeenCalledWith('Premium');
  });

  it('should handle profile action', () => {
    const { result } = renderHook(() => useHomeScreen());

    act(() => {
      result.current.handleProfilePress();
    });

    expect(mockTelemetry.trackHomeQuickAction).toHaveBeenCalledWith({
      action: 'profile',
    });
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });

  it('should handle community action', () => {
    const { result } = renderHook(() => useHomeScreen());

    act(() => {
      result.current.handleCommunityPress();
    });

    expect(mockTelemetry.trackHomeQuickAction).toHaveBeenCalledWith({
      action: 'community',
    });
    expect(mockNavigate).toHaveBeenCalledWith('Community');
  });

  it('should format time ago correctly', async () => {
    mockDemoMode.enabled = true;

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => {
      expect(result.current.recentActivity.length).toBeGreaterThan(0);
    });

    const activity = result.current.recentActivity[0];
    expect(activity.timeAgo).toMatch(/ago|Just now/);
  });

  it('should handle API errors gracefully', async () => {
    mockDemoMode.enabled = false;
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => {
      // Should not crash, stats should remain at defaults
      expect(result.current.stats.matches).toBe(0);
    });
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useHomeScreen());

    const firstHandleSwipePress = result.current.handleSwipePress;
    const firstHandleMatchesPress = result.current.handleMatchesPress;
    const firstOnRefresh = result.current.onRefresh;

    rerender();

    expect(result.current.handleSwipePress).toBe(firstHandleSwipePress);
    expect(result.current.handleMatchesPress).toBe(firstHandleMatchesPress);
    expect(result.current.onRefresh).toBe(firstOnRefresh);
  });
});
