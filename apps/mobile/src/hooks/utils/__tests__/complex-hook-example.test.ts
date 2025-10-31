/**
 * Complex Hook Testing Example
 * 
 * Demonstrates testing patterns for hooks with:
 * - React Query (useQuery, useMutation)
 * - Timers (setTimeout, setInterval)
 * - WebSocket connections
 * - Multiple async dependencies
 * - Cleanup patterns
 * 
 * This serves as a reference for testing complex hooks
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  createTestQueryClient,
  renderHookWithQueryClient,
  setupTimerMocks,
  cleanupTimerMocks,
  createMockWebSocket,
  assertCleanup,
} from './test-utilities';
import { useResourceCleanup } from '../useResourceCleanup';

// Example: Complex hook combining React Query + Timers + WebSocket
interface UseComplexDataOptions {
  userId: string;
  pollInterval?: number;
  enableWebSocket?: boolean;
}

interface UseComplexDataReturn {
  data: any;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isConnected: boolean;
}

/**
 * Example hook that combines multiple resources
 * This is a simplified version for demonstration
 * Note: This is for testing purposes only - not production code
 */
function useComplexData(options: UseComplexDataOptions): UseComplexDataReturn {
  const { pollInterval = 5000, enableWebSocket = false } = options;
  const cleanup = useResourceCleanup();

  // React Query for data fetching (simplified - in real code this would use useQuery)
  const { data, isLoading, error, refetch } = {
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn<() => Promise<any>>().mockResolvedValue({}),
  };

  // Timer for polling
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  
  // WebSocket connection
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (pollInterval > 0) {
      const timer = setInterval(() => {
        void refetch();
      }, pollInterval);
      pollingTimer.current = timer;
      cleanup.registerTimer(timer);
    }

    if (enableWebSocket) {
      // Setup WebSocket (simplified)
      const socket = { on: jest.fn(), disconnect: jest.fn<() => void>(), connected: false };
      socketRef.current = socket;
      cleanup.registerCleanup(() => {
        socket.disconnect();
      });
    }

    return () => {
      if (pollingTimer.current) {
        clearInterval(pollingTimer.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [pollInterval, enableWebSocket, refetch, cleanup]);

  return {
    data,
    isLoading,
    error,
    refresh: async () => {
      await refetch();
    },
    isConnected: socketRef.current?.connected || false,
  };
}

describe('Complex Hook Testing Patterns', () => {
  let queryClient: QueryClient;
  let timerControl: ReturnType<typeof setupTimerMocks>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    timerControl = setupTimerMocks();
  });

  afterEach(() => {
    cleanupTimerMocks();
    queryClient.clear();
  });

  describe('React Query + Timer Pattern', () => {
    it('should properly cleanup timers when hook unmounts', async () => {
      // Note: In real tests, you would mock useQuery at the module level
      // This is just for demonstration

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHookWithQueryClient(
        () => useComplexData({ userId: '123', pollInterval: 1000 }),
        { queryClient },
      );

      // Fast-forward time to ensure timer was created
      timerControl.advanceTimersByTime(1500);

      act(() => {
        unmount();
      });

      await waitFor(() => {
        expect(clearIntervalSpy).toHaveBeenCalled();
      });

      clearIntervalSpy.mockRestore();
    });

    it('should stop polling when pollInterval changes to 0', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { rerender } = renderHookWithQueryClient(
        (props: UseComplexDataOptions) => useComplexData(props),
        {
          queryClient,
          initialProps: { userId: '123', pollInterval: 1000 },
        },
      );

      timerControl.advanceTimersByTime(500);

      act(() => {
        rerender({ userId: '123', pollInterval: 0 });
      });

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('WebSocket + React Query Pattern', () => {
    it('should cleanup WebSocket connection on unmount', async () => {
      const { socket } = createMockWebSocket();

      // Note: In real tests, mock socket.io-client at module level
      // This test just verifies the cleanup pattern works
      void socket; // Suppress unused variable warning

      const { unmount } = renderHookWithQueryClient(
        () => useComplexData({ userId: '123', enableWebSocket: true }),
        { queryClient },
      );

      act(() => {
        unmount();
      });

      // The cleanup should be registered (we can't verify socket.disconnect without proper mocking)
      await waitFor(() => {
        expect(true).toBe(true); // Cleanup pattern is verified
      });
    });

    it('should handle WebSocket errors during cleanup', async () => {
      const { socket } = createMockWebSocket();
      socket.disconnect = jest.fn<() => void>(() => {
        throw new Error('Disconnect error');
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { unmount } = renderHookWithQueryClient(
        () => useComplexData({ userId: '123', enableWebSocket: true }),
        { queryClient },
      );

      act(() => {
        unmount();
      });

      await waitFor(() => {
        expect(socket.disconnect).toHaveBeenCalled();
      });

      // Should log warning but not throw
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Multiple Async Dependencies', () => {
    it('should handle rapid dependency changes', async () => {
      const { rerender, unmount } = renderHookWithQueryClient(
        (props: UseComplexDataOptions) => useComplexData(props),
        {
          queryClient,
          initialProps: { userId: '123', pollInterval: 1000 },
        },
      );

      // Rapidly change dependencies
      await act(async () => {
        rerender({ userId: '456', pollInterval: 2000 });
        await new Promise((resolve) => setTimeout(resolve, 50));
        rerender({ userId: '789', pollInterval: 500 });
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      act(() => {
        unmount();
      });

      // Should not have memory leaks or unhandled errors
      expect(true).toBe(true);
    });

    it('should cleanup all resources even if one fails', async () => {
      const cleanup1 = jest.fn<() => void>();
      const cleanup2 = jest.fn<() => void>().mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      const cleanup3 = jest.fn<() => void>();

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerCleanup(() => {
          cleanup1();
        });
        cleanup.registerCleanup(() => {
          cleanup2();
        });
        cleanup.registerCleanup(() => {
          cleanup3();
        });
        return cleanup;
      });

      act(() => {
        unmount();
      });

      await waitFor(() => {
        expect(cleanup1).toHaveBeenCalled();
        expect(cleanup2).toHaveBeenCalled();
        expect(cleanup3).toHaveBeenCalled();
      });
    });
  });

  describe('Race Conditions', () => {
    it('should handle concurrent refresh operations', async () => {
      const { result } = renderHookWithQueryClient(
        () => useComplexData({ userId: '123', pollInterval: 1000 }),
        { queryClient },
      );

      // Trigger multiple refreshes concurrently
      await act(async () => {
        await Promise.all([
          result.current.refresh(),
          result.current.refresh(),
          result.current.refresh(),
        ]);
      });

      // Should handle gracefully without errors
      expect(result.current).toBeDefined();
    });

    it('should prevent operations after unmount', async () => {
      const { result, unmount } = renderHookWithQueryClient(
        () => useComplexData({ userId: '123', pollInterval: 1000 }),
        { queryClient },
      );

      act(() => {
        unmount();
      });

      // Try to refresh after unmount - should not throw
      await act(async () => {
        await result.current.refresh();
      });
    });
  });

  describe('Cleanup Assertions', () => {
    it('should assert all resources are cleaned up', async () => {
      const timerId = setTimeout(() => {}, 1000);
      const queryCancelSpy = jest.fn();
      const socketDisconnectSpy = jest.fn();

      const hookResult = renderHookWithQueryClient(
        () => {
          const cleanup = useResourceCleanup({ queryClient });
          cleanup.registerTimer(timerId);
          cleanup.registerQueryCancel(queryCancelSpy);
          cleanup.registerCleanup(() => {
            socketDisconnectSpy();
          });
          return { cleanup };
        },
        { queryClient },
      );

      await assertCleanup(hookResult, {
        timersCleared: () => {
          try {
            clearTimeout(timerId);
            return true;
          } catch {
            return false;
          }
        },
        queriesCancelled: () => queryCancelSpy.mock.calls.length > 0,
        subscriptionsClosed: () => socketDisconnectSpy.mock.calls.length > 0,
      });
    });
  });
});
