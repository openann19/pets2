/**
 * @jest-environment jsdom
 * Comprehensive tests for useTabReselectRefresh hook
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTabReselectRefresh } from '../../navigation/useTabReselectRefresh';

// Mock React Navigation
const mockEmit = jest.fn();
const mockAddListener = jest.fn((event, callback) => {
  return () => {}; // unsubscribe function
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

describe('useTabReselectRefresh', () => {
  const mockListRef = {
    current: {
      scrollToOffset: jest.fn(),
      scrollTo: jest.fn(),
      scrollToIndex: jest.fn(),
    },
  };

  const mockGetOffset = jest.fn(() => 0);
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      addListener: mockAddListener,
      emit: mockEmit,
    });
    (useIsFocused as jest.Mock).mockReturnValue(true);
    Haptics.impactAsync = jest.fn();
  });

  it('should setup listeners on mount', () => {
    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
      }),
    );

    expect(mockAddListener).toHaveBeenCalledWith('tabPress', expect.any(Function));
    expect(mockAddListener).toHaveBeenCalledWith('tabDoublePress', expect.any(Function));
  });

  it('should scroll to top when far from top on tab press', () => {
    mockGetOffset.mockReturnValue(150); // Far from top

    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
        topThreshold: 120,
      }),
    );

    // Get the tabPress callback
    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    expect(mockListRef.current.scrollToOffset).toHaveBeenCalledWith({
      offset: 0,
      animated: true,
    });
  });

  it('should call refresh when near top on tab press', async () => {
    mockGetOffset.mockReturnValue(50); // Near top

    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
        topThreshold: 120,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('should scroll to top and refresh on double press', async () => {
    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabDoublePressCallback = callArgs.find((args) => args[0] === 'tabDoublePress')[1];

    act(() => {
      tabDoublePressCallback({ target: 'test' });
    });

    expect(mockListRef.current.scrollToOffset).toHaveBeenCalledWith({
      offset: 0,
      animated: true,
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('should trigger haptic feedback on actions', () => {
    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
        haptics: true,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];
    const tabDoublePressCallback = callArgs.find((args) => args[0] === 'tabDoublePress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
      tabDoublePressCallback({ target: 'test' });
    });

    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('should respect cooldown period', async () => {
    jest.useFakeTimers();

    const { rerender } = renderHook(
      (props) =>
        useTabReselectRefresh({
          listRef: mockListRef as any,
          onRefresh: mockOnRefresh,
          getOffset: mockGetOffset,
          cooldownMs: 700,
        }),
      { initialProps: {} },
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    // First call
    act(() => {
      tabPressCallback({ target: 'test' });
    });

    // Second call within cooldown
    act(() => {
      tabPressCallback({ target: 'test' });
    });

    // Should only be called once due to cooldown
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(700);

    // Now should work again
    act(() => {
      tabPressCallback({ target: 'test' });
    });

    expect(mockOnRefresh).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should not trigger when not focused', () => {
    (useIsFocused as jest.Mock).mockReturnValue(false);

    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
    expect(mockListRef.current.scrollToOffset).not.toHaveBeenCalled();
  });

  it('should use default threshold when not provided', () => {
    mockGetOffset.mockReturnValue(150);

    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    // Should scroll (far from default threshold of 120)
    expect(mockListRef.current.scrollToOffset).toHaveBeenCalled();
  });

  it('should respect custom topThreshold', () => {
    mockGetOffset.mockReturnValue(50);

    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
        topThreshold: 200,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    // Should refresh (near top relative to 200 threshold)
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('should handle ScrollView with scrollTo method', () => {
    const scrollViewRef = {
      current: {
        scrollTo: jest.fn(),
      },
    };

    renderHook(() =>
      useTabReselectRefresh({
        listRef: scrollViewRef as any,
        onRefresh: mockOnRefresh,
        getOffset: () => 150,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    expect(scrollViewRef.current.scrollTo).toHaveBeenCalledWith({
      y: 0,
      animated: true,
    });
  });

  it('should handle SectionList with scrollToIndex method', () => {
    const sectionListRef = {
      current: {
        scrollToIndex: jest.fn(),
      },
    };

    renderHook(() =>
      useTabReselectRefresh({
        listRef: sectionListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: () => 150,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    expect(sectionListRef.current.scrollToIndex).toHaveBeenCalledWith({
      index: 0,
      animated: true,
    });
  });

  it('should handle missing getOffset callback', () => {
    const { result } = renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    // Should not crash, default to treating as far from top
    expect(mockListRef.current.scrollToOffset).toHaveBeenCalled();
  });

  it('should cleanup listeners on unmount', () => {
    const unsubscribe1 = jest.fn();
    const unsubscribe2 = jest.fn();

    mockAddListener.mockReturnValueOnce(unsubscribe1).mockReturnValueOnce(unsubscribe2);

    const { unmount } = renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
      }),
    );

    unmount();

    expect(unsubscribe1).toHaveBeenCalled();
    expect(unsubscribe2).toHaveBeenCalled();
  });

  it('should handle async refresh callback', async () => {
    const asyncRefresh = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: asyncRefresh,
        getOffset: () => 50,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    await waitFor(() => {
      expect(asyncRefresh).toHaveBeenCalled();
    });
  });

  it('should handle refresh errors gracefully', async () => {
    const errorRefresh = jest.fn(() => {
      throw new Error('Refresh failed');
    });

    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: errorRefresh,
        getOffset: () => 50,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    // Should not throw
    act(() => {
      tabPressCallback({ target: 'test' });
    });
  });

  it('should disable haptics when haptics is false', () => {
    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
        haptics: false,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'test' });
    });

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('should emit tabReselect event', () => {
    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: () => 50,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabPressCallback = callArgs.find((args) => args[0] === 'tabPress')[1];

    act(() => {
      tabPressCallback({ target: 'testRoute' });
    });

    expect(mockEmit).toHaveBeenCalledWith({
      type: 'tabReselect',
      target: 'testRoute',
    });
  });

  it('should emit tabDoublePulse event on double press', () => {
    renderHook(() =>
      useTabReselectRefresh({
        listRef: mockListRef as any,
        onRefresh: mockOnRefresh,
        getOffset: mockGetOffset,
      }),
    );

    const callArgs = mockAddListener.mock.calls;
    const tabDoublePressCallback = callArgs.find((args) => args[0] === 'tabDoublePress')[1];

    act(() => {
      tabDoublePressCallback({ target: 'testRoute' });
    });

    expect(mockEmit).toHaveBeenCalledWith({
      type: 'tabDoublePulse',
      target: 'testRoute',
    });
  });
});
