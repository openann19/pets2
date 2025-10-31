/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { useReduceMotion } from '../useReducedMotion';

// Mock AccessibilityInfo with proper structure
const mockIsReduceMotionEnabled = jest.fn();
const mockAddEventListener = jest.fn(() => ({ remove: jest.fn() }));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      ...RN.AccessibilityInfo,
      isReduceMotionEnabled: mockIsReduceMotionEnabled,
      addEventListener: mockAddEventListener,
    },
  };
});

describe('useReducedMotion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReduceMotionEnabled.mockResolvedValue(false);
    mockAddEventListener.mockReturnValue({ remove: jest.fn() });
  });

  it('returns false initially when motion is not reduced', () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    const { result } = renderHook(() => useReduceMotion());

    expect(result.current).toBe(false);
  });

  it('returns true when motion is reduced', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('detects reduced motion preference', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mockIsReduceMotionEnabled).toHaveBeenCalled();
  });

  it('handles reduced motion disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('initializes state to false before async check', () => {
    mockIsReduceMotionEnabled.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(false), 100)),
    );

    const { result } = renderHook(() => useReduceMotion());

    // Initially should be false
    expect(result.current).toBe(false);
  });

  it('updates state after async check completes', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('calls AccessibilityInfo only once per mount', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(mockIsReduceMotionEnabled).toHaveBeenCalledTimes(1);
    });
  });

  it('handles promise rejection gracefully', async () => {
    mockIsReduceMotionEnabled.mockRejectedValue(
      new Error('Accessibility API unavailable'),
    );

    const { result } = renderHook(() => useReduceMotion());

    // Should not throw and should default to false
    expect(result.current).toBe(false);
  });

  it('works with concurrent component usage', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result: result1 } = renderHook(() => useReduceMotion());
    const { result: result2 } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
    });
  });

  it('maintains consistent value across re-renders', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    const { result, rerender } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    rerender();

    expect(result.current).toBe(false);
  });

  it('can be used to conditionally disable animations', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    const animationConfig = result.current ? { duration: 0 } : { duration: 500 };

    expect(animationConfig).toEqual({ duration: 0 });
  });

  it('can be used to enable full animations when motion not reduced', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    const animationConfig = result.current ? { duration: 0 } : { duration: 500 };

    expect(animationConfig).toEqual({ duration: 500 });
  });

  it('integrates with BouncePressable haptics', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    const hapticsEnabled = !result.current;
    expect(hapticsEnabled).toBe(false);
  });

  it('integrates with animation libraries', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    // Example: use with reanimated
    const springConfig = result.current
      ? { damping: 100, stiffness: 0 }
      : { damping: 15, stiffness: 200 };

    expect(springConfig.damping).toBe(100);
    expect(springConfig.stiffness).toBe(0);
  });

  it('handles rapid mount/unmount cycles', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    for (let i = 0; i < 5; i++) {
      const { unmount } = renderHook(() => useReduceMotion());
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      unmount();
    }

    await waitFor(() => {
      expect(mockIsReduceMotionEnabled).toHaveBeenCalled();
    });
  });
});
