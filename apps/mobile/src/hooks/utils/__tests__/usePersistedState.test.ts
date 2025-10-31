/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePersistedState } from '../usePersistedState';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('usePersistedState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  it('should initialize with provided initial value when no stored value', async () => {
    const initialValue = { theme: 'light', language: 'en' };
    const { result } = renderHook(() => usePersistedState({ key: 'test-key', initialValue }));

    // Wait for async initialization to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.value).toEqual(initialValue);
  });

  it('should load stored value from AsyncStorage', async () => {
    const storedValue = { theme: 'dark', language: 'es' };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedValue));

    const { result } = renderHook(() =>
      usePersistedState({
        key: 'test-key',
        initialValue: { theme: 'light', language: 'en' },
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    expect(result.current.value).toEqual(storedValue);
  });

  it('should update stored value when setValue is called', async () => {
    const initialValue = { count: 0 };
    const { result } = renderHook(() => usePersistedState({ key: 'counter', initialValue }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newValue = { count: 5 };
    act(() => {
      result.current.setValue(newValue);
    });

    await waitFor(() => {
      expect(result.current.value).toEqual(newValue);
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('counter', JSON.stringify(newValue));
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const initialValue = { data: 'fallback' };
    const { result } = renderHook(() => usePersistedState({ key: 'error-key', initialValue }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.value).toEqual(initialValue);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should return stable function references', async () => {
    const { result } = renderHook(() =>
      usePersistedState({ key: 'stable-test', initialValue: {} }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstSetValue = result.current.setValue;

    // Create new hook instance
    const { result: result2 } = renderHook(() =>
      usePersistedState({ key: 'stable-test-2', initialValue: {} }),
    );

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });

    expect(result.current.setValue).toBe(firstSetValue);
  });
});
