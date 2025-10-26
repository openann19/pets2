/**
 * Comprehensive tests for useTabDoublePress hook
 * Tests listener registration, cleanup, and callback execution
 */

import { renderHook, act } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useTabDoublePress } from '../useTabDoublePress';

// Mock dependencies
jest.mock('@react-navigation/native');

const mockNavigation = {
  addListener: jest.fn(() => jest.fn()),
};

describe('useTabDoublePress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
  });

  describe('Basic Functionality', () => {
    it('should subscribe to tabDoublePress event', () => {
      const callback = jest.fn();

      renderHook(() => useTabDoublePress(callback));

      expect(mockNavigation.addListener).toHaveBeenCalledWith(
        'tabDoublePress',
        expect.any(Function),
      );
    });

    it('should call callback when tabDoublePress event is triggered', () => {
      const callback = jest.fn();
      let eventHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        eventHandler = handler;
        return jest.fn();
      });

      renderHook(() => useTabDoublePress(callback));

      act(() => {
        eventHandler();
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should cleanup listener on unmount', () => {
      const unsubscribe = jest.fn();
      const callback = jest.fn();

      mockNavigation.addListener.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useTabDoublePress(callback));

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Callback Execution', () => {
    it('should execute callback on multiple triggers', () => {
      const callback = jest.fn();
      let eventHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        eventHandler = handler;
        return jest.fn();
      });

      renderHook(() => useTabDoublePress(callback));

      act(() => {
        eventHandler();
        eventHandler();
        eventHandler();
      });

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should handle async callbacks', async () => {
      const callback = jest.fn(async () => {
        await Promise.resolve();
      });
      let eventHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        eventHandler = handler;
        return jest.fn();
      });

      renderHook(() => useTabDoublePress(callback));

      await act(async () => {
        await eventHandler();
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle callbacks that throw errors', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const callback = jest.fn(() => {
        throw new Error('Test error');
      });
      let eventHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        eventHandler = handler;
        return jest.fn();
      });

      renderHook(() => useTabDoublePress(callback));

      expect(() => {
        act(() => {
          eventHandler();
        });
      }).not.toThrow();

      consoleError.mockRestore();
    });
  });

  describe('Callback Updates', () => {
    it('should re-subscribe when callback changes', () => {
      const { rerender } = renderHook(
        (props) => useTabDoublePress(props.callback),
        {
          initialProps: { callback: jest.fn() },
        },
      );

      const initialCallCount = mockNavigation.addListener.mock.calls.length;

      rerender({ callback: jest.fn() });

      // Should have re-subscribed
      expect(mockNavigation.addListener.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should use latest callback reference', () => {
      let firstCallback: any;
      let secondCallback: any;
      let eventHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        eventHandler = handler;
        return jest.fn();
      });

      const { rerender } = renderHook(
        (props) => useTabDoublePress(props.callback),
        {
          initialProps: { callback: (firstCallback = jest.fn()) },
        },
      );

      rerender({ callback: (secondCallback = jest.fn()) });

      act(() => {
        eventHandler();
      });

      expect(secondCallback).toHaveBeenCalled();
      expect(firstCallback).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Changes', () => {
    it('should handle navigation object changes', () => {
      const callback = jest.fn();
      const newNavigation = {
        addListener: jest.fn(() => jest.fn()),
      };

      const { rerender } = renderHook(() => useTabDoublePress(callback));

      (useNavigation as jest.Mock).mockReturnValue(newNavigation);

      rerender();

      expect(newNavigation.addListener).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should work with an undefined callback', () => {
      mockNavigation.addListener.mockImplementation(() => jest.fn());

      expect(() => {
        renderHook(() => useTabDoublePress(undefined as any));
      }).not.toThrow();
    });

    it('should handle multiple unmounts gracefully', () => {
      const callback = jest.fn();
      const unsubscribe = jest.fn();
      mockNavigation.addListener.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useTabDoublePress(callback));

      unmount();
      unmount();
      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should cleanup properly even if unsubscribe throws', () => {
      const callback = jest.fn();
      const unsubscribe = jest.fn(() => {
        throw new Error('Cleanup error');
      });
      mockNavigation.addListener.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useTabDoublePress(callback));

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Hook Invocation', () => {
    it('should support conditional callback execution', () => {
      const callback = jest.fn();
      let eventHandler: any;
      let shouldExecute = true;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        eventHandler = () => {
          if (shouldExecute) {
            handler();
          }
        };
        return jest.fn();
      });

      renderHook(() => useTabDoublePress(callback));

      act(() => {
        eventHandler();
      });
      expect(callback).toHaveBeenCalledTimes(1);

      shouldExecute = false;

      act(() => {
        eventHandler();
      });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid multiple registrations', () => {
      const callback = jest.fn();

      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useTabDoublePress(callback));
        unmount();
      }

      expect(mockNavigation.addListener).toHaveBeenCalledTimes(10);
    });
  });
});
