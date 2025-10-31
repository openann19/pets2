/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { useStoriesScreen } from '../useStoriesScreen';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: jest.fn(),
  goBack: mockGoBack,
} as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock domain hook
const mockGoToNextStory = jest.fn();
const mockGoToPreviousStory = jest.fn();
const mockSetPaused = jest.fn();
const mockSetMuted = jest.fn();

const mockUseStories = {
  storyGroups: [],
  isLoading: false,
  error: null,
  currentGroupIndex: 0,
  currentStoryIndex: 0,
  currentGroup: {
    userId: 'user1',
    user: { _id: 'user1', username: 'test' },
    stories: [
      {
        _id: 'story1',
        userId: 'user1',
        mediaType: 'photo' as const,
        mediaUrl: 'test.jpg',
        duration: 5000,
        viewCount: 10,
        createdAt: new Date().toISOString(),
      },
    ],
    storyCount: 1,
  },
  currentStory: {
    _id: 'story1',
    userId: 'user1',
    mediaType: 'photo' as const,
    mediaUrl: 'test.jpg',
    duration: 5000,
    viewCount: 10,
    createdAt: new Date().toISOString(),
  },
  progress: 0,
  viewCount: 10,
  isPaused: false,
  isMuted: false,
  goToNextStory: mockGoToNextStory,
  goToPreviousStory: mockGoToPreviousStory,
  goToGroup: jest.fn(),
  goToStory: jest.fn(),
  markAsViewed: jest.fn(),
  refreshStories: jest.fn(),
  setPaused: mockSetPaused,
  setMuted: mockSetMuted,
  timerRef: { current: null },
  progressIntervalRef: { current: null },
  longPressTimer: { current: null },
};

jest.mock('../../domains/social/useStories', () => ({
  useStories: jest.fn(() => mockUseStories),
}));

// Mock telemetry
const mockTelemetry = {
  trackStoriesOpen: jest.fn(),
  trackStoriesNext: jest.fn(),
  trackStoriesPrev: jest.fn(),
  trackStoriesPause: jest.fn(),
  trackStoriesResume: jest.fn(),
  trackStoriesMuteToggle: jest.fn(),
  trackStoriesClose: jest.fn(),
  trackStoriesSwipeUp: jest.fn(),
};

jest.mock('../../../lib/telemetry', () => ({
  telemetry: mockTelemetry,
}));

// Mock reduce motion
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReduceMotion: jest.fn(() => false),
}));

// Mock haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Medium: 'medium',
  },
}));

describe('useStoriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with domain hook data', () => {
    const { result } = renderHook(() => useStoriesScreen());

    expect(result.current.currentGroup).toEqual(mockUseStories.currentGroup);
    expect(result.current.currentStory).toEqual(mockUseStories.currentStory);
    expect(result.current.progress).toBe(0);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isMuted).toBe(false);
  });

  it('should provide pan responder', () => {
    const { result } = renderHook(() => useStoriesScreen());

    expect(result.current.panResponder).toBeDefined();
    expect(result.current.panResponder.current).toBeDefined();
  });

  it('should handle go back with telemetry', () => {
    const { result } = renderHook(() => useStoriesScreen());

    act(() => {
      result.current.handleGoBack();
    });

    expect(mockTelemetry.trackStoriesClose).toHaveBeenCalledTimes(1);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('should handle set paused with telemetry', () => {
    const { result } = renderHook(() => useStoriesScreen());

    act(() => {
      result.current.setPaused(true);
    });

    expect(mockSetPaused).toHaveBeenCalledWith(true);
    expect(mockTelemetry.trackStoriesPause).toHaveBeenCalled();

    act(() => {
      result.current.setPaused(false);
    });

    expect(mockSetPaused).toHaveBeenCalledWith(false);
    expect(mockTelemetry.trackStoriesResume).toHaveBeenCalled();
  });

  it('should handle set muted with telemetry', () => {
    const { result } = renderHook(() => useStoriesScreen());

    act(() => {
      result.current.setMuted(true);
    });

    expect(mockSetMuted).toHaveBeenCalledWith(true);
    expect(mockTelemetry.trackStoriesMuteToggle).toHaveBeenCalled();
  });

  it('should handle pause on long press', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useStoriesScreen());

    const panHandlers = result.current.panResponder.current.panHandlers;

    act(() => {
      panHandlers.onResponderGrant?.({} as any);
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(mockSetPaused).toHaveBeenCalledWith(true);

    jest.useRealTimers();
  });

  it('should handle swipe down to close', () => {
    const { result } = renderHook(() => useStoriesScreen());

    const panHandlers = result.current.panResponder.current.panHandlers;

    act(() => {
      panHandlers.onResponderRelease?.(
        { nativeEvent: { locationX: 100 } } as any,
        { dx: 0, dy: 150 } as any,
      );
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should handle swipe up for reply', () => {
    const { result } = renderHook(() => useStoriesScreen());

    const panHandlers = result.current.panResponder.current.panHandlers;

    act(() => {
      panHandlers.onResponderRelease?.(
        { nativeEvent: { locationX: 100 } } as any,
        { dx: 0, dy: -150 } as any,
      );
    });

    expect(mockTelemetry.trackStoriesSwipeUp).toHaveBeenCalled();
  });

  it('should handle tap left for previous story', () => {
    const { result } = renderHook(() => useStoriesScreen());

    const panHandlers = result.current.panResponder.current.panHandlers;

    act(() => {
      panHandlers.onResponderRelease?.(
        { nativeEvent: { locationX: 50 } } as any, // Left third of screen
        { dx: 0, dy: 0 } as any,
      );
    });

    expect(mockGoToPreviousStory).toHaveBeenCalled();
    expect(mockTelemetry.trackStoriesPrev).toHaveBeenCalled();
  });

  it('should handle tap right for next story', () => {
    const { result } = renderHook(() => useStoriesScreen());

    const panHandlers = result.current.panResponder.current.panHandlers;

    act(() => {
      panHandlers.onResponderRelease?.(
        { nativeEvent: { locationX: 250 } } as any, // Right two-thirds of screen
        { dx: 0, dy: 0 } as any,
      );
    });

    expect(mockGoToNextStory).toHaveBeenCalled();
    expect(mockTelemetry.trackStoriesNext).toHaveBeenCalled();
  });

  it('should handle horizontal swipe for navigation', () => {
    const { result } = renderHook(() => useStoriesScreen());

    const panHandlers = result.current.panResponder.current.panHandlers;

    // Swipe left (next)
    act(() => {
      panHandlers.onResponderRelease?.(
        { nativeEvent: { locationX: 200 } } as any,
        { dx: -100, dy: 0 } as any,
      );
    });

    expect(mockGoToNextStory).toHaveBeenCalled();

    // Swipe right (previous)
    act(() => {
      panHandlers.onResponderRelease?.(
        { nativeEvent: { locationX: 200 } } as any,
        { dx: 100, dy: 0 } as any,
      );
    });

    expect(mockGoToPreviousStory).toHaveBeenCalled();
  });

  it('should cleanup timers on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useStoriesScreen());

    unmount();

    // Should not throw errors
    expect(clearTimeoutSpy).not.toThrow();
    expect(clearIntervalSpy).not.toThrow();

    clearTimeoutSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useStoriesScreen());

    const firstHandleGoBack = result.current.handleGoBack;
    const firstSetPaused = result.current.setPaused;
    const firstSetMuted = result.current.setMuted;

    rerender();

    expect(result.current.handleGoBack).toBe(firstHandleGoBack);
    expect(result.current.setPaused).toBe(firstSetPaused);
    expect(result.current.setMuted).toBe(firstSetMuted);
  });
});

