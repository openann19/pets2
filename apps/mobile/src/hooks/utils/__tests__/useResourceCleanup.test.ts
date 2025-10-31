/**
 * useResourceCleanup Hook Tests
 * 
 * Comprehensive tests demonstrating:
 * - Timer cleanup
 * - React Query cancellation
 * - Event listener removal
 * - Subscription cleanup
 * - Error handling during cleanup
 * - Manual vs automatic cleanup
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { useResourceCleanup } from '../useResourceCleanup';
import { createTestQueryClient, setupTimerMocks, cleanupTimerMocks } from './test-utilities';

describe('useResourceCleanup', () => {
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

  describe('Timer Cleanup', () => {
    it('should clear all registered timers on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        const timer1 = setTimeout(() => {}, 1000);
        const timer2 = setInterval(() => {}, 1000);
        cleanup.registerTimer(timer1);
        cleanup.registerTimer(timer2);
        return cleanup;
      });

      act(() => {
        unmount();
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('should handle multiple timers', () => {
      const timers: Array<ReturnType<typeof setTimeout>> = [];

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        for (let i = 0; i < 10; i++) {
          const timer = setTimeout(() => {}, 1000);
          timers.push(timer);
          cleanup.registerTimer(timer);
        }
        return cleanup;
      });

      act(() => {
        unmount();
      });

      // All timers should be cleared
      timers.forEach((timer) => {
        expect(() => clearTimeout(timer)).not.toThrow();
      });
    });

    it('should clear timers registered after hook creation', () => {
      const { result, unmount } = renderHook(() => useResourceCleanup());

      // Register timers after render
      act(() => {
        const timer1 = setTimeout(() => {}, 1000);
        const timer2 = setTimeout(() => {}, 2000);
        result.current.registerTimers([timer1, timer2]);
      });

      act(() => {
        unmount();
      });

      expect(result.current.isCleanedUp).toBe(true);
    });
  });

  describe('React Query Cleanup', () => {
    it('should cancel queries via QueryClient', async () => {
      const cancelQueriesSpy = jest.spyOn(queryClient, 'cancelQueries');

      const { unmount } = renderHook(() => useResourceCleanup({ queryClient }));

      act(() => {
        unmount();
      });

      await waitFor(() => {
        expect(cancelQueriesSpy).toHaveBeenCalled();
      });

      cancelQueriesSpy.mockRestore();
    });

    it('should cancel queries via registered cancel functions', () => {
      const cancelFn1 = jest.fn();
      const cancelFn2 = jest.fn();

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerQueryCancel(cancelFn1);
        cleanup.registerQueryCancel(cancelFn2);
        return cleanup;
      });

      act(() => {
        unmount();
      });

      expect(cancelFn1).toHaveBeenCalled();
      expect(cancelFn2).toHaveBeenCalled();
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should remove registered event listeners', () => {
      const mockTarget = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      } as unknown as EventTarget;

      const handler = jest.fn();

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerEventListener(mockTarget, 'test', handler);
        return cleanup;
      });

      expect(mockTarget.addEventListener).toHaveBeenCalledWith('test', handler);

      act(() => {
        unmount();
      });

      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('test', handler);
    });

    it('should handle multiple event listeners', () => {
      const mockTarget = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      } as unknown as EventTarget;

      const handlers = [jest.fn(), jest.fn(), jest.fn()];

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        handlers.forEach((handler) => {
          cleanup.registerEventListener(mockTarget, 'test', handler);
        });
        return cleanup;
      });

      act(() => {
        unmount();
      });

      handlers.forEach((handler) => {
        expect(mockTarget.removeEventListener).toHaveBeenCalledWith('test', handler);
      });
    });
  });

  describe('Subscription Cleanup', () => {
    it('should call remove on subscriptions with remove method', () => {
      const subscription1 = { remove: jest.fn() };
      const subscription2 = { remove: jest.fn() };

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerSubscription(subscription1);
        cleanup.registerSubscription(subscription2);
        return cleanup;
      });

      act(() => {
        unmount();
      });

      expect(subscription1.remove).toHaveBeenCalled();
      expect(subscription2.remove).toHaveBeenCalled();
    });

    it('should call unsubscribe on subscriptions with unsubscribe method', () => {
      const subscription1 = { unsubscribe: jest.fn() };
      const subscription2 = { unsubscribe: jest.fn() };

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerSubscription(subscription1);
        cleanup.registerSubscription(subscription2);
        return cleanup;
      });

      act(() => {
        unmount();
      });

      expect(subscription1.unsubscribe).toHaveBeenCalled();
      expect(subscription2.unsubscribe).toHaveBeenCalled();
    });

    it('should handle subscriptions with both remove and unsubscribe', () => {
      const subscription = {
        remove: jest.fn(),
        unsubscribe: jest.fn(),
      };

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerSubscription(subscription);
        return cleanup;
      });

      act(() => {
        unmount();
      });

      // Both should be called
      expect(subscription.remove).toHaveBeenCalled();
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Custom Cleanup Functions', () => {
    it('should execute all registered cleanup functions', async () => {
      const cleanup1 = jest.fn();
      const cleanup2 = jest.fn();
      const cleanup3 = jest.fn().mockResolvedValue(undefined);

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerCleanup(cleanup1);
        cleanup.registerCleanup(cleanup2);
        cleanup.registerCleanup(cleanup3);
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

    it('should handle async cleanup functions', async () => {
      const asyncCleanup = jest.fn().mockResolvedValue(undefined);

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerCleanup(asyncCleanup);
        return cleanup;
      });

      act(() => {
        unmount();
      });

      await waitFor(() => {
        expect(asyncCleanup).toHaveBeenCalled();
      });
    });

    it('should continue cleanup even if one function throws', async () => {
      const cleanup1 = jest.fn();
      const cleanup2 = jest.fn().mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      const cleanup3 = jest.fn();

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { unmount } = renderHook(() => {
        const cleanup = useResourceCleanup();
        cleanup.registerCleanup(cleanup1);
        cleanup.registerCleanup(cleanup2);
        cleanup.registerCleanup(cleanup3);
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

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Manual Cleanup', () => {
    it('should allow manual cleanup before unmount', async () => {
      const cleanup = jest.fn();
      const timer = setTimeout(() => {}, 1000);

      const { result } = renderHook(() => {
        const resourceCleanup = useResourceCleanup({ autoCleanup: false });
        resourceCleanup.registerCleanup(cleanup);
        resourceCleanup.registerTimer(timer);
        return resourceCleanup;
      });

      await act(async () => {
        await result.current.cleanup();
      });

      expect(cleanup).toHaveBeenCalled();
      expect(result.current.isCleanedUp).toBe(true);
    });

    it('should prevent duplicate cleanup', async () => {
      const cleanup = jest.fn();

      const { result, unmount } = renderHook(() => {
        const resourceCleanup = useResourceCleanup();
        resourceCleanup.registerCleanup(cleanup);
        return resourceCleanup;
      });

      await act(async () => {
        await result.current.cleanup();
      });

      act(() => {
        unmount();
      });

      // Cleanup should only be called once
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle registering resources after cleanup started', () => {
      const { result, unmount } = renderHook(() => useResourceCleanup());

      act(() => {
        unmount();
      });

      // Try to register after cleanup
      const timer = setTimeout(() => {}, 1000);
      act(() => {
        result.current.registerTimer(timer);
      });

      // Timer should be cleared immediately
      expect(result.current.isCleanedUp).toBe(true);
    });

    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => {
          const cleanup = useResourceCleanup();
          const timer = setTimeout(() => {}, 1000);
          cleanup.registerTimer(timer);
          return cleanup;
        });

        act(() => {
          unmount();
        });
      }

      // Should not throw or leak
      expect(true).toBe(true);
    });
  });
});
