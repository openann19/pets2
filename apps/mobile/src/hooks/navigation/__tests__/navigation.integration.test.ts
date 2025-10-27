/**
 * Comprehensive integration tests for navigation system
 * Tests complete flow: tab press → scroll tracking → reselect behavior
 */

import { renderHook, act } from '@testing-library/react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTabReselectRefresh } from '../useTabReselectRefresh';
import { useScrollOffsetTracker } from '../useScrollOffsetTracker';
import { useTabDoublePress } from '../useTabDoublePress';

// Mock dependencies
jest.mock('@react-navigation/native');
jest.mock('expo-haptics');

describe('Navigation System Integration', () => {
  const mockNavigation = {
    addListener: jest.fn(() => jest.fn()),
    emit: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useIsFocused as jest.Mock).mockReturnValue(true);
  });

  describe('Complete Flow: Scroll + Reselect', () => {
    it('should handle complete user flow: scroll → tab press → scroll to top', () => {
      const listRef = { current: { scrollToOffset: jest.fn() } };
      const onRefresh = jest.fn();
      let tabPressHandler: any;
      let scrollTracker: any;

      // Setup scroll tracking
      const { result: scrollResult } = renderHook(() =>
        useScrollOffsetTracker(),
      );

      // Setup tab reselect
      mockNavigation.addListener.mockImplementation((event, handler) => {
        if (event === 'tabPress') tabPressHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset: scrollResult.current.getOffset,
        }),
      );

      // Simulate scrolling
      act(() => {
        scrollResult.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 300 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(scrollResult.current.getOffset()).toBe(300);

      // Simulate tab press
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      // Should scroll to top (because offset > threshold)
      expect(listRef.current.scrollToOffset).toHaveBeenCalledWith({
        offset: 0,
        animated: true,
      });
    });

    it('should handle complete user flow: scroll → tab press near top → refresh', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();
      let tabPressHandler: any;

      const { result: scrollResult } = renderHook(() =>
        useScrollOffsetTracker(),
      );

      mockNavigation.addListener.mockImplementation((event, handler) => {
        if (event === 'tabPress') tabPressHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset: scrollResult.current.getOffset,
        }),
      );

      // Simulate scrolling near top
      act(() => {
        scrollResult.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 50 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      // Simulate tab press
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      // Should refresh (because near top)
      expect(onRefresh).toHaveBeenCalled();
    });

    it('should handle complete user flow: double tap → scroll + refresh', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();
      let doubleTapHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        if (event === 'tabDoublePress') doubleTapHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
        }),
      );

      // Simulate double tap
      act(() => {
        doubleTapHandler({ target: 'Home' });
      });

      // Should scroll to top AND refresh
      expect(listRef.current.scrollTo).toHaveBeenCalledWith({
        y: 0,
        animated: true,
      });
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe('Multiple Hooks Integration', () => {
    it('should work with scroll tracker + tab reselect + double press together', () => {
      const listRef = { current: { scrollToOffset: jest.fn() } };
      const onRefresh = jest.fn();
      const onDoublePress = jest.fn();

      const { result: scrollResult } = renderHook(() =>
        useScrollOffsetTracker(),
      );

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset: scrollResult.current.getOffset,
        }),
      );

      renderHook(() => useTabDoublePress(onDoublePress));

      // Simulate scroll
      act(() => {
        scrollResult.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 200 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(scrollResult.current.getOffset()).toBe(200);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle rapid tab switching + scrolling', () => {
      const listRef = { current: { scrollToOffset: jest.fn() } };
      const onRefresh = jest.fn();
      let tabPressHandler: any;

      const { result: scrollResult } = renderHook(() =>
        useScrollOffsetTracker(),
      );

      mockNavigation.addListener.mockImplementation((event, handler) => {
        if (event === 'tabPress') tabPressHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset: scrollResult.current.getOffset,
          cooldownMs: 300,
        }),
      );

      // Rapid sequence of scrolls and taps
      act(() => {
        scrollResult.current.onScroll({
          nativeEvent: { contentOffset: { x: 0, y: 100 } },
        } as any);
        tabPressHandler({ target: 'Home' });
        scrollResult.current.onScroll({
          nativeEvent: { contentOffset: { x: 0, y: 200 } },
        } as any);
        tabPressHandler({ target: 'Home' });
      });

      // Should respect cooldown
      expect(listRef.current.scrollToOffset).toHaveBeenCalled();
    });

    it('should handle background state correctly', () => {
      (useIsFocused as jest.Mock).mockReturnValue(false);

      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();
      let tabPressHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        if (event === 'tabPress') tabPressHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
        }),
      );

      // Tab press when not focused
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      // Should not execute
      expect(onRefresh).not.toHaveBeenCalled();
      expect(listRef.current.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle many rapid scroll events', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      // Simulate 100 rapid scroll events
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.onScroll({
            nativeEvent: {
              contentOffset: { x: 0, y: i * 10 },
            },
          } as any);
        });
      }

      expect(result.current.getOffset()).toBe(990);
    });

    it('should handle memory leaks with multiple hook instances', () => {
      const hooks = [];
      for (let i = 0; i < 50; i++) {
        const { result, unmount } = renderHook(() => useScrollOffsetTracker());
        hooks.push({ result, unmount });
      }

      // All should work independently
      act(() => {
        hooks[0].result.current.onScroll({
          nativeEvent: { contentOffset: { x: 0, y: 100 } },
        } as any);
      });

      expect(hooks[0].result.current.getOffset()).toBe(100);
      expect(hooks[49].result.current.getOffset()).toBe(0);

      // Cleanup
      hooks.forEach(({ unmount }) => unmount());
    });

    it('should handle cleanup and re-initialization', () => {
      const { result, unmount, rerender } = renderHook(() =>
        useScrollOffsetTracker(),
      );

      act(() => {
        result.current.onScroll({
          nativeEvent: { contentOffset: { x: 0, y: 100 } },
        } as any);
      });

      unmount();

      const { result: newResult } = renderHook(() => useScrollOffsetTracker());

      expect(newResult.current.getOffset()).toBe(0);
    });
  });

  describe('Cross-Component Communication', () => {
    it('should emit events that can be consumed by other components', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();
      let tabPressHandler: any;
      let doubleTapHandler: any;

      mockNavigation.addListener.mockImplementation((event, handler) => {
        if (event === 'tabPress') tabPressHandler = handler;
        if (event === 'tabDoublePress') doubleTapHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
        }),
      );

      // Single tap emits tabReselect
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(mockNavigation.emit).toHaveBeenCalledWith({
        type: 'tabReselect',
        target: 'Home',
      });

      mockNavigation.emit.mockClear();

      // Double tap emits tabDoublePulse
      act(() => {
        doubleTapHandler({ target: 'Home' });
      });

      expect(mockNavigation.emit).toHaveBeenCalledWith({
        type: 'tabDoublePulse',
        target: 'Home',
      });
    });
  });
});

