/**
 * Comprehensive tests for useTabReselectRefresh hook
 * Tests all scenarios: single tap, double tap, cooldown, haptics, scroll behavior
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTabReselectRefresh } from '../useTabReselectRefresh';

// Mock dependencies
jest.mock('@react-navigation/native');
jest.mock('expo-haptics');

const mockNavigation = {
  addListener: jest.fn(() => jest.fn()),
  emit: jest.fn(),
};

const mockIsFocused = true;
const mockIsUnfocused = false;

describe('useTabReselectRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useIsFocused as jest.Mock).mockReturnValue(mockIsFocused);
  });

  describe('Basic Setup', () => {
    it('should subscribe to tabPress and tabDoublePress events', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
        }),
      );

      expect(mockNavigation.addListener).toHaveBeenCalledWith('tabPress', expect.any(Function));
      expect(mockNavigation.addListener).toHaveBeenCalledWith('tabDoublePress', expect.any(Function));
    });

    it('should cleanup subscriptions on unmount', () => {
      const unsubscribe1 = jest.fn();
      const unsubscribe2 = jest.fn();
      mockNavigation.addListener
        .mockReturnValueOnce(unsubscribe1)
        .mockReturnValueOnce(unsubscribe2);

      const { unmount } = renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollTo: jest.fn() } } as any,
          onRefresh: jest.fn(),
        }),
      );

      unmount();

      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
    });
  });

  describe('Single Tap Behavior (far from top)', () => {
    it('should scroll to top when scrolled far from top', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();
      const getOffset = jest.fn(() => 300); // Far from top

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset,
          topThreshold: 120,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(listRef.current.scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
      expect(onRefresh).not.toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should scroll FlatList when using scrollToOffset', () => {
      const listRef = { current: { scrollToOffset: jest.fn() } };
      const getOffset = jest.fn(() => 300);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh: jest.fn(),
          getOffset,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(listRef.current.scrollToOffset).toHaveBeenCalledWith({
        offset: 0,
        animated: true,
      });
    });

    it('should scroll SectionList when using scrollToIndex', () => {
      const listRef = { current: { scrollToIndex: jest.fn() } };
      const getOffset = jest.fn(() => 300);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh: jest.fn(),
          getOffset,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(listRef.current.scrollToIndex).toHaveBeenCalledWith({
        index: 0,
        animated: true,
      });
    });
  });

  describe('Single Tap Behavior (near top)', () => {
    it('should refresh when scrolled near top', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();
      const getOffset = jest.fn(() => 50); // Near top

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset,
          topThreshold: 120,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(onRefresh).toHaveBeenCalled();
      expect(mockNavigation.emit).toHaveBeenCalledWith({
        type: 'tabReselect',
        target: 'Home',
      });
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should not refresh when nearTopAction is "none"', () => {
      const onRefresh = jest.fn();
      const getOffset = jest.fn(() => 50);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollTo: jest.fn() } } as any,
          onRefresh,
          getOffset,
          nearTopAction: 'none',
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(onRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Double Tap Behavior', () => {
    it('should scroll to top and refresh on double tap', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
        }),
      );

      const [,, doubleTapHandler] = mockNavigation.addListener.mock.calls[1];
      act(() => {
        doubleTapHandler({ target: 'Home' });
      });

      expect(listRef.current.scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
      expect(onRefresh).toHaveBeenCalled();
      expect(mockNavigation.emit).toHaveBeenCalledWith({
        type: 'tabDoublePulse',
        target: 'Home',
      });
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });
  });

  describe('Cooldown Protection', () => {
    it('should prevent rapid triggering within cooldown period', () => {
      const onRefresh = jest.fn();
      jest.useFakeTimers();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollTo: jest.fn() } } as any,
          onRefresh,
          cooldownMs: 700,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      
      // First trigger
      act(() => {
        tabPressHandler({ target: 'Home' });
      });
      expect(onRefresh).toHaveBeenCalledTimes(1);

      // Second trigger within cooldown
      act(() => {
        tabPressHandler({ target: 'Home' });
      });
      expect(onRefresh).toHaveBeenCalledTimes(1);

      // After cooldown
      act(() => {
        jest.advanceTimersByTime(701);
        tabPressHandler({ target: 'Home' });
      });
      expect(onRefresh).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('Focus State', () => {
    it('should ignore tabPress when screen is not focused', () => {
      (useIsFocused as jest.Mock).mockReturnValueOnce(mockIsUnfocused);

      const onRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollTo: jest.fn() } } as any,
          onRefresh,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(onRefresh).not.toHaveBeenCalled();
    });

    it('should ignore tabDoublePress when screen is not focused', () => {
      (useIsFocused as jest.Mock).mockReturnValueOnce(mockIsUnfocused);

      const onRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollTo: jest.fn() } } as any,
          onRefresh,
        }),
      );

      const [,, doubleTapHandler] = mockNavigation.addListener.mock.calls[1];
      act(() => {
        doubleTapHandler({ target: 'Home' });
      });

      expect(onRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Haptics Control', () => {
    it('should trigger haptics when enabled', () => {
      const onRefresh = jest.fn();
      const getOffset = jest.fn(() => 300);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollTo: jest.fn() } } as any,
          onRefresh,
          getOffset,
          haptics: true,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should not trigger haptics when disabled', () => {
      const onRefresh = jest.fn();
      const getOffset = jest.fn(() => 300);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: { current: { scrollTo: jest.fn() } } as any,
          onRefresh,
          getOffset,
          haptics: false,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      Haptics.impactAsync.mockClear();
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing scroll methods gracefully', () => {
      const listRef = { current: {} };
      const onRefresh = jest.fn();
      const getOffset = jest.fn(() => 300);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      expect(() => {
        act(() => {
          tabPressHandler({ target: 'Home' });
        });
      }).not.toThrow();
    });

    it('should handle null listRef gracefully', () => {
      const listRef = { current: null };
      const onRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      expect(() => {
        act(() => {
          tabPressHandler({ target: 'Home' });
        });
      }).not.toThrow();
    });

    it('should handle undefined getOffset', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          // getOffset not provided
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      // Should still work with offset = 0
      expect(onRefresh).toHaveBeenCalled();
    });

    it('should handle async onRefresh', async () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn(() => Promise.resolve());

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          topThreshold: 120,
        }),
      );

      const [,, doubleTapHandler] = mockNavigation.addListener.mock.calls[1];
      await act(async () => {
        await doubleTapHandler({ target: 'Home' });
      });

      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe('Custom Thresholds', () => {
    it('should use custom topThreshold', () => {
      const listRef = { current: { scrollTo: jest.fn() } };
      const onRefresh = jest.fn();
      const getOffset = jest.fn(() => 200);

      renderHook(() =>
        useTabReselectRefresh({
          listRef: listRef as any,
          onRefresh,
          getOffset,
          topThreshold: 250, // Custom threshold
        }),
      );

      const [, tabPressHandler] = mockNavigation.addListener.mock.calls[0];
      act(() => {
        tabPressHandler({ target: 'Home' });
      });

      // Since offset (200) < threshold (250), should refresh
      expect(onRefresh).toHaveBeenCalled();
      expect(listRef.current.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('Dependency Updates', () => {
    it('should re-subscribe when dependencies change', () => {
      let currentRefresh = jest.fn();
      const listRef = { current: { scrollTo: jest.fn() } };

      const { rerender } = renderHook(
        (props) =>
          useTabReselectRefresh({
            listRef: props.listRef,
            onRefresh: props.onRefresh,
          }),
        {
          initialProps: { listRef: listRef as any, onRefresh: jest.fn() },
        },
      );

      const initialCallCount = mockNavigation.addListener.mock.calls.length;

      // Change dependencies
      currentRefresh = jest.fn();
      rerender({ listRef: listRef as any, onRefresh: currentRefresh });

      // Should have re-subscribed
      expect(mockNavigation.addListener.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});

