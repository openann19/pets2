/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion } from '../useReducedMotion';

// Mock AccessibilityInfo
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      isReduceMotionEnabled: jest.fn(),
    },
  };
});

describe('useReducedMotion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns false initially when motion is not reduced', () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('returns true when motion is reduced', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    expect(result.current).toBe(true);
  });

  it('detects reduced motion preference', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled();
    expect(result.current).toBe(true);
  });

  it('handles reduced motion disabled', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    expect(result.current).toBe(false);
  });

  it('initializes state to false before async check', () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(false), 100)),
    );

    const { result } = renderHook(() => useReducedMotion());

    // Initially should be false
    expect(result.current).toBe(false);
  });

  it('updates state after async check completes', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    expect(result.current).toBe(true);
  });

  it('calls AccessibilityInfo only once per mount', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

    const { waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
  });

  it('handles promise rejection gracefully', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockRejectedValue(
      new Error('Accessibility API unavailable'),
    );

    const { result } = renderHook(() => useReducedMotion());

    // Should not throw and should default to false
    expect(result.current).toBe(false);
  });

  it('works with concurrent component usage', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result: result1 } = renderHook(() => useReducedMotion());
    const { result: result2 } = renderHook(() => useReducedMotion());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
  });

  it('maintains consistent value across re-renders', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

    const { result, rerender } = renderHook(() => useReducedMotion());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    rerender();

    expect(result.current).toBe(false);
  });

  it('can be used to conditionally disable animations', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    const animationConfig = result.current ? { duration: 0 } : { duration: 500 };

    expect(animationConfig).toEqual({ duration: 0 });
  });

  it('can be used to enable full animations when motion not reduced', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    const animationConfig = result.current ? { duration: 0 } : { duration: 500 };

    expect(animationConfig).toEqual({ duration: 500 });
  });

  it('integrates with BouncePressable haptics', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    const hapticsEnabled = !result.current;
    expect(hapticsEnabled).toBe(false);
  });

  it('integrates with animation libraries', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());

    await waitForNextUpdate();

    // Example: use with reanimated
    const springConfig = result.current
      ? { damping: 100, stiffness: 0 }
      : { damping: 15, stiffness: 200 };

    expect(springConfig.damping).toBe(100);
    expect(springConfig.stiffness).toBe(0);
  });

  it('handles rapid mount/unmount cycles', async () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    for (let i = 0; i < 5; i++) {
      const { unmount } = renderHook(() => useReducedMotion());
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      unmount();
    }

    expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled();
  });
});
