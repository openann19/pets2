/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { useScrollPersistence } from '../useScrollPersistence';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useScrollPersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  it('should initialize with default scroll position', () => {
    const { result } = renderHook(() => useScrollPersistence({ key: 'test-scroll' }));

    expect(result.current.scrollPosition).toBe(0);
  });

  it('should load stored scroll position', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ y: 150 }));

    const { result } = renderHook(() => useScrollPersistence({ key: 'test-scroll' }));

    // Wait for async load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.scrollPosition).toBe(150);
  });

  it('should save scroll position when updated', async () => {
    const { result } = renderHook(() => useScrollPersistence({ key: 'test-scroll' }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.saveScrollPosition(250);
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'test-scroll',
      JSON.stringify({ y: 250, timestamp: expect.any(Number) }),
    );
    expect(result.current.scrollPosition).toBe(250);
  });

  it('should restore scroll position', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ y: 100 }));

    const { result } = renderHook(() => useScrollPersistence({ key: 'test-scroll' }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.scrollPosition).toBe(100);

    act(() => {
      result.current.saveScrollPosition(200);
    });

    expect(result.current.scrollPosition).toBe(200);
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useScrollPersistence({ key: 'error-scroll' }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.scrollPosition).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should clear stored scroll position', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ y: 75 }));

    const { result } = renderHook(() => useScrollPersistence({ key: 'clear-test' }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.scrollPosition).toBe(75);

    act(() => {
      result.current.clearScrollPosition();
    });

    expect(result.current.scrollPosition).toBe(0);
  });

  it('should work with custom default position', () => {
    const { result } = renderHook(() =>
      useScrollPersistence({ key: 'custom-default', defaultPosition: 50 }),
    );

    expect(result.current.scrollPosition).toBe(50);
  });

  it('should return stable function references', async () => {
    const { result } = renderHook(() => useScrollPersistence({ key: 'stable-test' }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const firstSave = result.current.saveScrollPosition;
    const firstClear = result.current.clearScrollPosition;

    // Create new hook instance
    const { result: result2 } = renderHook(() => useScrollPersistence({ key: 'stable-test-2' }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.saveScrollPosition).toBe(firstSave);
    expect(result.current.clearScrollPosition).toBe(firstClear);
  });
});
