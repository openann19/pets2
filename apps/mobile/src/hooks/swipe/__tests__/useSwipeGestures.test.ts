/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { useSwipeGestures } from '../../swipe/useSwipeGestures';

// Mock PanResponder
jest.mock('react-native', () => ({
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((initial) => ({ value: initial })),
  useAnimatedReaction: jest.fn(),
  runOnJS: jest.fn((fn) => fn),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
}));

import { PanResponder } from 'react-native';

const mockPanResponder = PanResponder as jest.Mocked<typeof PanResponder>;

describe('useSwipeGestures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPanResponder.create.mockReturnValue({
      panHandlers: {
        onStartShouldSetPanResponder: jest.fn(),
        onMoveShouldSetPanResponder: jest.fn(),
        onPanResponderGrant: jest.fn(),
        onPanResponderMove: jest.fn(),
        onPanResponderRelease: jest.fn(),
        onPanResponderTerminate: jest.fn(),
      },
    });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useSwipeGestures({
        onSwipeLeft: jest.fn(),
        onSwipeRight: jest.fn(),
        onSwipeUp: jest.fn(),
        onSwipeDown: jest.fn(),
      }),
    );

    expect(result.current.panHandlers).toBeDefined();
    expect(typeof result.current.panHandlers.onStartShouldSetPanResponder).toBe('function');
    expect(typeof result.current.panHandlers.onPanResponderMove).toBe('function');
    expect(typeof result.current.panHandlers.onPanResponderRelease).toBe('function');
  });

  it('should create PanResponder with correct configuration', () => {
    renderHook(() =>
      useSwipeGestures({
        onSwipeLeft: jest.fn(),
        onSwipeRight: jest.fn(),
      }),
    );

    expect(mockPanResponder.create).toHaveBeenCalledTimes(1);
    const config = mockPanResponder.create.mock.calls[0][0];

    expect(config).toHaveProperty('onStartShouldSetPanResponder');
    expect(config).toHaveProperty('onMoveShouldSetPanResponder');
    expect(config).toHaveProperty('onPanResponderGrant');
    expect(config).toHaveProperty('onPanResponderMove');
    expect(config).toHaveProperty('onPanResponderRelease');
    expect(config).toHaveProperty('onPanResponderTerminate');
  });

  it('should handle swipe left gesture', () => {
    const onSwipeLeft = jest.fn();
    const onSwipeRight = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50,
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Simulate swipe left (negative x movement beyond threshold)
    act(() => {
      config.onPanResponderRelease?.(
        {},
        { dx: -100, dy: 10, vx: -0.5, vy: 0 }, // Left swipe
      );
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should handle swipe right gesture', () => {
    const onSwipeLeft = jest.fn();
    const onSwipeRight = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50,
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Simulate swipe right (positive x movement beyond threshold)
    act(() => {
      config.onPanResponderRelease?.(
        {},
        { dx: 100, dy: 10, vx: 0.5, vy: 0 }, // Right swipe
      );
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should handle swipe up gesture', () => {
    const onSwipeUp = jest.fn();
    const onSwipeDown = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeUp,
        onSwipeDown,
        swipeThreshold: 50,
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Simulate swipe up (negative y movement beyond threshold)
    act(() => {
      config.onPanResponderRelease?.(
        {},
        { dx: 10, dy: -100, vx: 0, vy: -0.5 }, // Up swipe
      );
    });

    expect(onSwipeUp).toHaveBeenCalledTimes(1);
    expect(onSwipeDown).not.toHaveBeenCalled();
  });

  it('should handle swipe down gesture', () => {
    const onSwipeUp = jest.fn();
    const onSwipeDown = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeUp,
        onSwipeDown,
        swipeThreshold: 50,
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Simulate swipe down (positive y movement beyond threshold)
    act(() => {
      config.onPanResponderRelease?.(
        {},
        { dx: 10, dy: 100, vx: 0, vy: 0.5 }, // Down swipe
      );
    });

    expect(onSwipeDown).toHaveBeenCalledTimes(1);
    expect(onSwipeUp).not.toHaveBeenCalled();
  });

  it('should not trigger swipe for movements below threshold', () => {
    const onSwipeLeft = jest.fn();
    const onSwipeRight = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50,
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Simulate small movement (below threshold)
    act(() => {
      config.onPanResponderRelease?.(
        {},
        { dx: 20, dy: 5, vx: 0.1, vy: 0 }, // Too small to be a swipe
      );
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should respect custom swipe threshold', () => {
    const onSwipeLeft = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeLeft,
        swipeThreshold: 100, // Higher threshold
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Movement below custom threshold
    act(() => {
      config.onPanResponderRelease?.({}, { dx: -80, dy: 5, vx: -0.3, vy: 0 });
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();

    // Movement above custom threshold
    act(() => {
      config.onPanResponderRelease?.({}, { dx: -120, dy: 5, vx: -0.6, vy: 0 });
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it('should prioritize horizontal over vertical swipes', () => {
    const onSwipeLeft = jest.fn();
    const onSwipeUp = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeLeft,
        onSwipeUp,
        swipeThreshold: 50,
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Diagonal movement (both horizontal and vertical beyond threshold)
    act(() => {
      config.onPanResponderRelease?.({}, { dx: -80, dy: -80, vx: -0.5, vy: -0.5 });
    });

    // Should trigger horizontal swipe (left) over vertical (up)
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeUp).not.toHaveBeenCalled();
  });

  it('should handle pan responder termination', () => {
    const onSwipeLeft = jest.fn();

    renderHook(() =>
      useSwipeGestures({
        onSwipeLeft,
      }),
    );

    const config = mockPanResponder.create.mock.calls[0][0];

    // Simulate pan responder termination (e.g., another responder takes over)
    act(() => {
      config.onPanResponderTerminate?.({}, {});
    });

    // Should not crash and should handle cleanup gracefully
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should return stable panHandlers reference', () => {
    const { result, rerender } = renderHook(() =>
      useSwipeGestures({
        onSwipeLeft: jest.fn(),
      }),
    );

    const firstPanHandlers = result.current.panHandlers;

    rerender();

    expect(result.current.panHandlers).toBe(firstPanHandlers);
  });
});
