/**
 * Tests for useChatScroll hook
 * Tests scroll position persistence and restoration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatScroll } from '../useChatScroll';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useChatScroll', () => {
  const matchId = 'test-match-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    jest.useFakeTimers();
  });

  describe('Initialization', () => {
    it('should initialize with zero offset', async () => {
      const { result } = renderHook(() => useChatScroll({ matchId }));

      await waitFor(() => {
        expect(result.current.initialOffset).toBe(0);
      });

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        `mobile_chat_scroll_${matchId}`,
      );
    });

    it('should restore saved scroll position', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('500');

      const { result } = renderHook(() => useChatScroll({ matchId }));

      await waitFor(() => {
        expect(result.current.initialOffset).toBe(500);
      });
    });

    it('should not restore when disabled', async () => {
      const { result } = renderHook(() =>
        useChatScroll({ matchId, enabled: false }),
      );

      await waitFor(() => {
        expect(result.current.initialOffset).toBe(0);
      });

      expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('Scroll Handling', () => {
    it('should provide flatListRef', () => {
      const { result } = renderHook(() => useChatScroll({ matchId }));

      expect(result.current.flatListRef).toBeDefined();
      expect(result.current.flatListRef.current).toBeNull();
    });

    it('should handle scroll events with debouncing', async () => {
      const { result } = renderHook(() => useChatScroll({ matchId }));

      act(() => {
        result.current.handleScroll(100);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          `mobile_chat_scroll_${matchId}`,
          '100',
        );
      });
    });

    it('should debounce multiple scroll events', async () => {
      const { result } = renderHook(() => useChatScroll({ matchId }));

      act(() => {
        result.current.handleScroll(100);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        result.current.handleScroll(200);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        result.current.handleScroll(300);
      });

      act(() => {
        jest.advanceTimersByTime(250);
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          `mobile_chat_scroll_${matchId}`,
          '300',
        );
      });
    });

    it('should not persist scroll when disabled', async () => {
      const { result } = renderHook(() =>
        useChatScroll({ matchId, enabled: false }),
      );

      act(() => {
        result.current.handleScroll(100);
      });

      act(() => {
        jest.advanceTimersByTime(250);
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid saved offset', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid');

      const { result } = renderHook(() => useChatScroll({ matchId }));

      await waitFor(() => {
        expect(result.current.initialOffset).toBe(0);
      });
    });

    it('should handle negative offsets', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('-100');

      const { result } = renderHook(() => useChatScroll({ matchId }));

      await waitFor(() => {
        expect(result.current.initialOffset).toBe(0);
      });
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useChatScroll({ matchId }));

      await waitFor(() => {
        expect(result.current.initialOffset).toBe(0);
      });
    });

    it('should work with different matchIds', async () => {
      const { result: result1 } = renderHook(() =>
        useChatScroll({ matchId: 'match-1' }),
      );
      const { result: result2 } = renderHook(() =>
        useChatScroll({ matchId: 'match-2' }),
      );

      act(() => {
        result1.current.handleScroll(100);
      });

      act(() => {
        result2.current.handleScroll(200);
      });

      act(() => {
        jest.advanceTimersByTime(250);
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should simulate complete scroll flow', async () => {
      // Initial load
      const { result } = renderHook(() => useChatScroll({ matchId }));

      await waitFor(() => {
        expect(result.current.initialOffset).toBe(0);
      });

      // User scrolls down
      act(() => {
        result.current.handleScroll(250);
      });

      act(() => {
        jest.advanceTimersByTime(250);
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          `mobile_chat_scroll_${matchId}`,
          '250',
        );
      });

      // Re-mount should restore
      mockAsyncStorage.setItem.mockClear();
      mockAsyncStorage.getItem.mockResolvedValue('250');

      const { result: result2 } = renderHook(() =>
        useChatScroll({ matchId }),
      );

      await waitFor(() => {
        expect(result2.current.initialOffset).toBe(250);
      });
    });
  });
});

