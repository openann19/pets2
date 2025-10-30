/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAsyncAction } from '../useAsyncAction';

describe('useAsyncAction', () => {
  const mockSuccessAction = jest.fn(() => Promise.resolve('success'));
  const mockFailureAction = jest.fn(() => Promise.reject(new Error('failed')));

  beforeEach(() => {
    jest.clearAllMocks();
    mockSuccessAction.mockClear();
    mockFailureAction.mockClear();
    mockSuccessAction.mockImplementation(() => Promise.resolve('success'));
    mockFailureAction.mockImplementation(() => Promise.reject(new Error('failed')));
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAsyncAction({ action: mockSuccessAction }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it('should execute async action successfully', async () => {
    const { result } = renderHook(() => useAsyncAction({ action: mockSuccessAction }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockSuccessAction).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe('success');
    expect(result.current.error).toBe(null);
  });

  it('should handle async action failure', async () => {
    const { result } = renderHook(() => useAsyncAction({ action: mockFailureAction }));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // Expected to throw
      }
    });

      expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useAsyncAction({ action: mockSuccessAction }));

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it('should execute with arguments', async () => {
    const actionWithArgs = jest
      .fn()
      .mockImplementation((arg1: string, arg2: number) => Promise.resolve(`${arg1}-${arg2}`));

    const { result } = renderHook(() => useAsyncAction({ action: actionWithArgs }));

    await act(async () => {
      await result.current.execute('test', 123);
    });

    expect(actionWithArgs).toHaveBeenCalledWith('test', 123);
    expect(result.current.data).toBe('test-123');
    expect(result.current.isLoading).toBe(false);
  });

  it('should not execute if already loading', async () => {
    const slowAction = jest.fn(
      () => new Promise((resolve) => setTimeout(() => resolve('done'), 50)),
    );

    const { result } = renderHook(() => useAsyncAction({ action: slowAction }));

    // Start first execution
    const firstPromise = act(async () => {
      return result.current.execute();
    });

    // Give it a moment to start
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });

    // Try to execute again while loading
    let secondResult: unknown;
    await act(async () => {
      secondResult = await result.current.execute();
    });

    // Second call should return undefined because already loading
    expect(secondResult).toBeUndefined();

    // Wait for first execution to complete
    await firstPromise;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only have been called once
    expect(slowAction).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe('done');
  }, 10000);

  it('should return stable function references', () => {
    const { result } = renderHook(() => useAsyncAction({ action: mockSuccessAction }));

    const firstExecute = result.current.execute;
    const firstReset = result.current.reset;

    // Function references should exist and be functions
    expect(firstExecute).toBeDefined();
    expect(firstReset).toBeDefined();
    expect(typeof firstExecute).toBe('function');
    expect(typeof firstReset).toBe('function');

    // References should be stable (same function instance)
    expect(result.current.execute).toBe(firstExecute);
    expect(result.current.reset).toBe(firstReset);
  });
});
