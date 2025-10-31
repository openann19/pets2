/**
 * useBubbleRetryShake Hook Tests
 * Tests bubble shake animation for retry feedback
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '../__tests__/test-utils';
import { useBubbleRetryShake } from '../useBubbleRetryShake';

// Mock React Native Reanimated
const mockUseSharedValue = jest.fn();
const mockUseAnimatedStyle = jest.fn();
const mockWithSequence = jest.fn();
const mockWithTiming = jest.fn();

jest.mock('react-native-reanimated', () => ({
  useSharedValue: mockUseSharedValue,
  useAnimatedStyle: mockUseAnimatedStyle,
  withSequence: mockWithSequence,
  withTiming: mockWithTiming,
}));

describe('useBubbleRetryShake', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useSharedValue to return an object with a value property
    mockUseSharedValue.mockReturnValue({ value: 0 });

    // Mock useAnimatedStyle to return a style object
    mockUseAnimatedStyle.mockReturnValue({
      transform: [{ translateX: 0 }],
    });

    // Mock animation functions
    mockWithSequence.mockImplementation((...args) => ({ type: 'sequence', args }));
    mockWithTiming.mockImplementation((value, config) => ({
      type: 'timing',
      value,
      config,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with default parameters', () => {
    const { result } = renderHook(() => useBubbleRetryShake());

    expect(mockUseSharedValue).toHaveBeenCalledWith(0);
    expect(mockUseAnimatedStyle).toHaveBeenCalledWith(expect.any(Function));

    expect(result.current).toHaveProperty('style');
    expect(result.current).toHaveProperty('shake');
    expect(typeof result.current.shake).toBe('function');
  });

  it('should initialize with custom amplitude', () => {
    const customAmplitude = 20;
    renderHook(() => useBubbleRetryShake(customAmplitude));

    expect(mockUseSharedValue).toHaveBeenCalledWith(0);
  });

  it('should initialize with custom totalMs', () => {
    const customTotalMs = 500;
    renderHook(() => useBubbleRetryShake(10, customTotalMs));

    expect(mockUseSharedValue).toHaveBeenCalledWith(0);
  });

  it('should return animated style object', () => {
    const expectedStyle = { transform: [{ translateX: 0 }] };
    mockUseAnimatedStyle.mockReturnValue(expectedStyle);

    const { result } = renderHook(() => useBubbleRetryShake());

    expect(result.current.style).toEqual(expectedStyle);
  });

  it('should trigger shake animation with default parameters', () => {
    const mockSharedValue = { value: 0 };
    mockUseSharedValue.mockReturnValue(mockSharedValue);

    const { result } = renderHook(() => useBubbleRetryShake());

    act(() => {
      result.current.shake();
    });

    expect(mockWithSequence).toHaveBeenCalledWith(
      mockWithTiming(-10, { duration: 260 * 0.2 }), // -amplitude
      mockWithTiming(10, { duration: 260 * 0.35 }), // +amplitude
      mockWithTiming(-6, { duration: 260 * 0.2 }), // -amplitude * 0.6
      mockWithTiming(0, { duration: 260 * 0.25 }) // back to 0
    );

    expect(mockSharedValue.value).toEqual({
      type: 'sequence',
      args: [
        { type: 'timing', value: -10, config: { duration: 52 } },
        { type: 'timing', value: 10, config: { duration: 91 } },
        { type: 'timing', value: -6, config: { duration: 52 } },
        { type: 'timing', value: 0, config: { duration: 65 } },
      ],
    });
  });

  it('should trigger shake animation with custom amplitude', () => {
    const customAmplitude = 15;
    const mockSharedValue = { value: 0 };
    mockUseSharedValue.mockReturnValue(mockSharedValue);

    const { result } = renderHook(() => useBubbleRetryShake(customAmplitude));

    act(() => {
      result.current.shake();
    });

    expect(mockWithSequence).toHaveBeenCalledWith(
      mockWithTiming(-15, expect.any(Object)),
      mockWithTiming(15, expect.any(Object)),
      mockWithTiming(-9, expect.any(Object)), // -15 * 0.6
      mockWithTiming(0, expect.any(Object))
    );
  });

  it('should trigger shake animation with custom totalMs', () => {
    const customTotalMs = 400;
    const mockSharedValue = { value: 0 };
    mockUseSharedValue.mockReturnValue(mockSharedValue);

    const { result } = renderHook(() => useBubbleRetryShake(10, customTotalMs));

    act(() => {
      result.current.shake();
    });

    expect(mockWithSequence).toHaveBeenCalledWith(
      mockWithTiming(-10, { duration: 400 * 0.2 }), // 80ms
      mockWithTiming(10, { duration: 400 * 0.35 }), // 140ms
      mockWithTiming(-6, { duration: 400 * 0.2 }), // 80ms
      mockWithTiming(0, { duration: 400 * 0.25 }) // 100ms
    );
  });

  it('should memoize shake function', () => {
    const { result, rerender } = renderHook(() => useBubbleRetryShake());

    const firstShake = result.current.shake;

    rerender();

    const secondShake = result.current.shake;

    expect(firstShake).toBe(secondShake); // Same reference due to useCallback
  });

  it('should recreate shake function when amplitude changes', () => {
    const { result, rerender } = renderHook(
      ({ amplitude }) => useBubbleRetryShake(amplitude),
      { initialProps: { amplitude: 10 } }
    );

    const firstShake = result.current.shake;

    rerender({ amplitude: 20 });

    const secondShake = result.current.shake;

    expect(firstShake).not.toBe(secondShake); // Different reference due to dependency change
  });

  it('should recreate shake function when totalMs changes', () => {
    const { result, rerender } = renderHook(
      ({ totalMs }) => useBubbleRetryShake(10, totalMs),
      { initialProps: { totalMs: 260 } }
    );

    const firstShake = result.current.shake;

    rerender({ totalMs: 400 });

    const secondShake = result.current.shake;

    expect(firstShake).not.toBe(secondShake); // Different reference due to dependency change
  });

  it('should use worklet directive in shake function', () => {
    const { result } = renderHook(() => useBubbleRetryShake());

    // The shake function should contain the worklet directive
    const shakeString = result.current.shake.toString();
    expect(shakeString).toContain("'worklet'");
  });
});
