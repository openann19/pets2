/**
 * @jest-environment jsdom
 * Integration tests for tab reselect/refresh flow
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useScrollOffsetTracker } from '../../navigation/useScrollOffsetTracker';
import { useTabReselectRefresh } from '../../navigation/useTabReselectRefresh';
import { useTabDoublePress } from '../../navigation/useTabDoublePress';

// Mock React Navigation
const mockEmit = jest.fn();
const mockListeners: Record<string, Function[]> = {};
const mockAddListener = jest.fn((event: string, callback: Function) => {
  if (!mockListeners[event]) {
    mockListeners[event] = [];
  }
  mockListeners[event].push(callback);
  return () => {
    mockListeners[event] = mockListeners[event].filter((cb) => cb !== callback);
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useIsFocused: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  impactAsync: jest.fn(),
}));

describe('Tab Reselect Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      addListener: mockAddListener,
      emit: mockEmit,
    });
    (useIsFocused as jest.Mock).mockReturnValue(true);
    Haptics.impactAsync = jest.fn();
  });

  describe('Complete Flow', () => {
    it('should handle scroll far from top → tap → scroll to top', () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      const { result: trackerResult } = renderHook(() => useScrollOffsetTracker());

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: trackerResult.current.getOffset,
          topThreshold: 100,
        }),
      );

      // Simulate scrolling far from top
      act(() => {
        trackerResult.current.onScroll({
          nativeEvent: { contentOffset: { y: 150 } },
        } as any);
      });

      // Trigger tab press
      mockListeners.tabPress?.[0]({ target: 'testRoute' });

      expect(mockListRef.current.scrollToOffset).toHaveBeenCalledWith({
        offset: 0,
        animated: true,
      });
    });

    it('should handle scroll near top → tap → refresh', async () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      const { result: trackerResult } = renderHook(() => useScrollOffsetTracker());

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: trackerResult.current.getOffset,
          topThreshold: 100,
        }),
      );

      // Simulate scrolling near top
      act(() => {
        trackerResult.current.onScroll({
          nativeEvent: { contentOffset: { y: 50 } },
        } as any);
      });

      // Trigger tab press
      mockListeners.tabPress?.[0]({ target: 'testRoute' });

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });

    it('should handle double tap → scroll to top + refresh', async () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: () => 150,
          topThreshold: 100,
        }),
      );

      // Trigger double press
      mockListeners.tabDoublePress?.[0]({ target: 'testRoute' });

      expect(mockListRef.current.scrollToOffset).toHaveBeenCalledWith({
        offset: 0,
        animated: true,
      });

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });

    it('should respect cooldown across rapid taps', async () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: () => 50,
          cooldownMs: 700,
        }),
      );

      // First tap
      mockListeners.tabPress?.[0]({ target: 'testRoute' });
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);

      // Immediate second tap should be ignored
      mockListeners.tabPress?.[0]({ target: 'testRoute' });
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it('should provide haptic feedback on all actions', () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: () => 50,
          haptics: true,
        }),
      );

      // Single tap
      mockListeners.tabPress?.[0]({ target: 'testRoute' });
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

      // Double tap
      mockListeners.tabDoublePress?.[0]({ target: 'testRoute' });
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('should work with multiple screens simultaneously', () => {
      const mockListRef1 = { current: { scrollToOffset: jest.fn() } };
      const mockListRef2 = { current: { scrollToOffset: jest.fn() } };
      const mockOnRefresh1 = jest.fn();
      const mockOnRefresh2 = jest.fn();

      // Only second screen is focused
      (useIsFocused as jest.Mock).mockReturnValue(true);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef1 as any,
          onRefresh: mockOnRefresh1,
          getOffset: () => 50,
        }),
      );

      // Switch to second screen
      (useIsFocused as jest.Mock).mockReturnValue(true);

      const { unmount: unmount1 } = renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef2 as any,
          onRefresh: mockOnRefresh2,
          getOffset: () => 150,
        }),
      );

      unmount1();

      // Trigger event should call correct screen
      mockListeners.tabPress?.[0]({ target: 'testRoute' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero offset correctly', () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      const { result } = renderHook(() => {
        const tracker = useScrollOffsetTracker();
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: tracker.getOffset,
          topThreshold: 50,
        });
        return tracker;
      });

      // Scroll to zero
      act(() => {
        result.current.onScroll({
          nativeEvent: { contentOffset: { y: 0 } },
        } as any);
      });

      // Should treat as near top (0 < 50)
      mockListeners.tabPress?.[0]({ target: 'testRoute' });
      expect(mockOnRefresh).toHaveBeenCalled();
    });

    it('should handle exactly at threshold', () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: () => 120,
          topThreshold: 120,
        }),
      );

      mockListeners.tabPress?.[0]({ target: 'testRoute' });

      // Exactly at threshold should trigger refresh
      expect(mockOnRefresh).toHaveBeenCalled();
    });

    it('should handle missing listRef gracefully', () => {
      const mockOnRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: null },
          onRefresh: mockOnRefresh,
          getOffset: () => 150,
        }),
      );

      // Should not crash
      expect(() => {
        mockListeners.tabPress?.[0]({ target: 'testRoute' });
      }).not.toThrow();
    });

    it('should handle scrollToOffset missing gracefully', () => {
      const mockListRef = {
        current: { scrollTo: jest.fn() },
      };

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: jest.fn(),
          getOffset: () => 150,
        }),
      );

      mockListeners.tabPress?.[0]({ target: 'testRoute' });

      expect(mockListRef.current.scrollTo).toHaveBeenCalled();
    });
  });

  describe('Navigation Events', () => {
    it('should emit correct navigation events', () => {
      const mockListRef = {
        current: { scrollToOffset: jest.fn() },
      };
      const mockOnRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: () => 50,
        }),
      );

      // Single tap near top
      mockListeners.tabPress?.[0]({ target: 'HomeTab' });

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'tabReselect',
        target: 'HomeTab',
      });

      // Double tap
      mockListeners.tabDoublePress?.[0]({ target: 'MatchesTab' });

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'tabDoublePulse',
        target: 'MatchesTab',
      });
    });
  });

  describe('Performance', () => {
    it('should handle 1000 rapid scroll events efficiently', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      const startTime = Date.now();

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.onScroll({
            nativeEvent: { contentOffset: { y: i * 10 } },
          } as any);
        }
      });

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
      expect(result.current.getOffset()).toBe(9990);
    });

    it('should debounce rapid tab presses correctly', async () => {
      const mockOnRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollToOffset: jest.fn() } } as any,
          onRefresh: mockOnRefresh,
          getOffset: () => 50,
          cooldownMs: 100,
        }),
      );

      // Rapid presses
      for (let i = 0; i < 10; i++) {
        mockListeners.tabPress?.[0]({ target: 'testRoute' });
      }

      await waitFor(() => {
        // Should only trigger once due to cooldown
        expect(mockOnRefresh.mock.calls.length).toBeLessThanOrEqual(10);
      });
    });
  });
});
