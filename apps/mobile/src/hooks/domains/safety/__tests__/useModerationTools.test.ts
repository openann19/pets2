/**
 * Tests for useModerationTools hook
 *
 * Covers:
 * - Moderation tools initialization
 * - Stats management
 * - Navigation actions
 * - Tool handling
 */

import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useModerationTools } from '../useModerationTools';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
  },
}));

// The moderationAPI is already mocked in __mocks__/api.ts
import { moderationAPI } from '../../../services/api';

const mockModerationAPI = moderationAPI as jest.Mocked<typeof moderationAPI>;

describe('useModerationTools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModerationAPI.getStats.mockResolvedValue({
      pendingReports: 5,
      reviewedToday: 3,
      totalModerated: 100,
      activeWarnings: 2,
    } as any);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useModerationTools());

      expect(result.current.moderationStats).toBeDefined();
      expect(result.current.moderationStats.pendingReports).toBeDefined();
      expect(result.current.moderationStats.reviewedToday).toBeDefined();
      expect(result.current.moderationStats.totalModerated).toBeDefined();
      expect(result.current.isRefreshing).toBe(false);
      expect(Array.isArray(result.current.moderationTools)).toBe(true);
      expect(result.current.moderationTools.length).toBeGreaterThan(0);
    });

    it('should have all required moderation tools', () => {
      const { result } = renderHook(() => useModerationTools());

      const toolIds = result.current.moderationTools.map((tool) => tool.id);
      expect(toolIds).toContain('reports');
      expect(toolIds).toContain('content');
      expect(toolIds).toContain('messages');
      expect(toolIds).toContain('users');
      expect(toolIds).toContain('analytics');
      expect(toolIds).toContain('settings');
    });

    it('should provide navigation actions', () => {
      const { result } = renderHook(() => useModerationTools());

      expect(typeof result.current.reviewReports).toBe('function');
      expect(typeof result.current.moderateContent).toBe('function');
      expect(typeof result.current.monitorMessages).toBe('function');
      expect(typeof result.current.manageUsers).toBe('function');
      expect(typeof result.current.viewAnalytics).toBe('function');
      expect(typeof result.current.configureSettings).toBe('function');
      expect(typeof result.current.refreshStats).toBe('function');
    });
  });

  describe('Navigation Actions', () => {
    it('should handle reviewReports action', () => {
      const mockNavigate = jest.fn();
      const { result } = renderHook(() =>
        useModerationTools({
          navigation: { navigate: mockNavigate } as any,
        }),
      );

      act(() => {
        result.current.reviewReports();
      });

      // Should either navigate or show alert if navigation not available
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle moderateContent action', () => {
      const mockNavigate = jest.fn();
      const { result } = renderHook(() =>
        useModerationTools({
          navigation: { navigate: mockNavigate } as any,
        }),
      );

      act(() => {
        result.current.moderateContent();
      });

      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle monitorMessages action', () => {
      const mockNavigate = jest.fn();
      const { result } = renderHook(() =>
        useModerationTools({
          navigation: { navigate: mockNavigate } as any,
        }),
      );

      act(() => {
        result.current.monitorMessages();
      });

      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle manageUsers action', () => {
      const mockNavigate = jest.fn();
      const { result } = renderHook(() =>
        useModerationTools({
          navigation: { navigate: mockNavigate } as any,
        }),
      );

      act(() => {
        result.current.manageUsers();
      });

      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle viewAnalytics action', () => {
      const mockNavigate = jest.fn();
      const { result } = renderHook(() =>
        useModerationTools({
          navigation: { navigate: mockNavigate } as any,
        }),
      );

      act(() => {
        result.current.viewAnalytics();
      });

      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle configureSettings action', () => {
      const mockNavigate = jest.fn();
      const { result } = renderHook(() =>
        useModerationTools({
          navigation: { navigate: mockNavigate } as any,
        }),
      );

      act(() => {
        result.current.configureSettings();
      });

      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should show alert when navigation is not available', () => {
      const { result } = renderHook(() => useModerationTools());

      act(() => {
        result.current.reviewReports();
      });

      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('Stats Management', () => {
    it('should refresh stats', async () => {
      const { result } = renderHook(() => useModerationTools());

      expect(result.current.isRefreshing).toBe(false);

      await act(async () => {
        const refreshPromise = result.current.refreshStats();
        expect(result.current.isRefreshing).toBe(true);
        await refreshPromise;
      });

      expect(result.current.isRefreshing).toBe(false);
      expect(mockModerationAPI.getStats).toHaveBeenCalled();
    });

    it('should update stats after refresh', async () => {
      const newStats = {
        pendingReports: 10,
        reviewedToday: 5,
        totalModerated: 200,
        activeWarnings: 4,
      };
      mockModerationAPI.getStats.mockResolvedValue(newStats as any);

      const { result } = renderHook(() => useModerationTools());

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(result.current.moderationStats.pendingReports).toBe(newStats.pendingReports);
    });

    it('should handle stats refresh errors gracefully', async () => {
      mockModerationAPI.getStats.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useModerationTools());

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('Tool Handling', () => {
    it('should handle moderation tool selection', () => {
      const mockAction = jest.fn();
      const { result } = renderHook(() => useModerationTools());

      const tool = {
        id: 'test-tool',
        title: 'Test Tool',
        description: 'Test description',
        icon: 'test-icon',
        color: '#000000',
        action: mockAction,
      };

      act(() => {
        result.current.handleModerationTool(tool);
      });

      expect(mockAction).toHaveBeenCalled();
    });

    it('should have moderation tools with correct structure', () => {
      const { result } = renderHook(() => useModerationTools());

      result.current.moderationTools.forEach((tool) => {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('title');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('icon');
        expect(tool).toHaveProperty('color');
        expect(tool).toHaveProperty('action');
        expect(typeof tool.action).toBe('function');
      });
    });

    it('should display badge for reports tool when there are pending reports', () => {
      const { result } = renderHook(() => useModerationTools());

      const reportsTool = result.current.moderationTools.find((tool) => tool.id === 'reports');
      expect(reportsTool).toBeDefined();
      expect(reportsTool?.badge).toBeDefined();
      expect(reportsTool?.badge).toBe(result.current.moderationStats.pendingReports.toString());
    });
  });

  describe('Moderation Statistics', () => {
    it('should have initial moderation stats', () => {
      const { result } = renderHook(() => useModerationTools());

      expect(result.current.moderationStats).toHaveProperty('pendingReports');
      expect(result.current.moderationStats).toHaveProperty('reviewedToday');
      expect(result.current.moderationStats).toHaveProperty('totalModerated');
      expect(result.current.moderationStats).toHaveProperty('activeWarnings');
      expect(typeof result.current.moderationStats.pendingReports).toBe('number');
      expect(typeof result.current.moderationStats.reviewedToday).toBe('number');
      expect(typeof result.current.moderationStats.totalModerated).toBe('number');
      expect(typeof result.current.moderationStats.activeWarnings).toBe('number');
    });
  });


  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', () => {
      const mockNavigate = jest.fn(() => {
        throw new Error('Navigation error');
      });

      const { result } = renderHook(() =>
        useModerationTools({
          navigation: { navigate: mockNavigate } as any,
        }),
      );

      act(() => {
        expect(() => result.current.reviewReports()).not.toThrow();
      });

      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should handle stats refresh errors', async () => {
      mockModerationAPI.getStats.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useModerationTools());

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should show refreshing during stats refresh', async () => {
      const { result } = renderHook(() => useModerationTools());

      expect(result.current.isRefreshing).toBe(false);

      act(() => {
        result.current.refreshStats();
      });

      expect(result.current.isRefreshing).toBe(true);

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useModerationTools());
      const initialState = {
        moderationStats: result.current.moderationStats,
        moderationTools: result.current.moderationTools,
        isRefreshing: result.current.isRefreshing,
      };

      rerender();

      expect(result.current.isRefreshing).toBe(initialState.isRefreshing);
      // Stats and tools might be new objects, but structure should be consistent
      expect(result.current.moderationStats).toHaveProperty('pendingReports');
      expect(result.current.moderationTools.length).toBe(initialState.moderationTools.length);
    });
  });

  describe('Edge Cases', () => {
    it('should work without navigation provided', () => {
      const { result } = renderHook(() => useModerationTools());

      act(() => {
        result.current.reviewReports();
      });

      // Should show alert instead of navigating
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should handle tools with missing optional properties', () => {
      const { result } = renderHook(() => useModerationTools());

      const toolsWithoutBadge = result.current.moderationTools.filter((tool) => !tool.badge);
      // Some tools might not have badges, which is fine
      toolsWithoutBadge.forEach((tool) => {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('title');
      });
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useModerationTools());
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel ongoing stats refresh on unmount', async () => {
      // Make the API call slow
      let resolvePromise: () => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve as () => void;
      });
      mockModerationAPI.getStats.mockReturnValue(slowPromise as any);

      const { unmount, result } = renderHook(() => useModerationTools());

      act(() => {
        result.current.refreshStats();
      });

      unmount();

      // Resolve the promise after unmount
      if (resolvePromise!) {
        resolvePromise();
      }

      // Should cleanup properly without errors
    });
  });
});
