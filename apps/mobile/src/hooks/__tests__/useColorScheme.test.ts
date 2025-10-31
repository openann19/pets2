/**
 * useColorScheme Hook Tests
 * Tests the color scheme detection hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useColorScheme, type ColorScheme } from '../useColorScheme';

// Mock React Native Appearance - create mocks outside of jest.mock
const mockGetColorScheme = jest.fn();
const mockAddChangeListener = jest.fn();

jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    Appearance: {
      getColorScheme: mockGetColorScheme,
      addChangeListener: mockAddChangeListener,
    },
  };
});

describe('useColorScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return light scheme when system returns light', () => {
    mockGetColorScheme.mockReturnValue('light');
    mockAddChangeListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
  });

  it('should return dark scheme when system returns dark', () => {
    mockGetColorScheme.mockReturnValue('dark');
    mockAddChangeListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('dark');
  });

  it('should default to light when system returns null', () => {
    mockGetColorScheme.mockReturnValue(null);
    mockAddChangeListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
  });

  it('should update scheme when appearance changes', () => {
    mockGetColorScheme.mockReturnValue('light');
    const mockListener = jest.fn();
    const mockSubscription = { remove: jest.fn() };
    mockAddChangeListener.mockImplementation((callback) => {
      mockListener.mockImplementation(callback);
      return mockSubscription;
    });

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');

    // Simulate appearance change
    act(() => {
      mockListener({ colorScheme: 'dark' });
    });

    expect(result.current).toBe('dark');
  });

  it('should remove listener on unmount', () => {
    const mockSubscription = { remove: jest.fn() };
    mockAddChangeListener.mockReturnValue(mockSubscription);
    mockGetColorScheme.mockReturnValue('light');

    const { unmount } = renderHook(() => useColorScheme());

    unmount();

    expect(mockSubscription.remove).toHaveBeenCalled();
  });

  it('should return ColorScheme type', () => {
    mockGetColorScheme.mockReturnValue('light');
    mockAddChangeListener.mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useColorScheme());

    const scheme: ColorScheme = result.current;
    expect(['light', 'dark']).toContain(scheme);
  });
});
