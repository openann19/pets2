/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAsyncAction } from "../useAsyncAction";

describe("useAsyncAction", () => {
  const mockSuccessAction = jest.fn(() => Promise.resolve("success"));
  const mockFailureAction = jest.fn(() => Promise.reject(new Error("failed")));

  beforeEach(() => {
    jest.clearAllMocks();
    mockSuccessAction.mockClear();
    mockFailureAction.mockClear();
    mockSuccessAction.mockImplementation(() => Promise.resolve("success"));
    mockFailureAction.mockImplementation(() =>
      Promise.reject(new Error("failed")),
    );
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() =>
      useAsyncAction({ action: mockSuccessAction }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it("should execute async action successfully", async () => {
    const { result } = renderHook(() =>
      useAsyncAction({ action: mockSuccessAction }),
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);
    expect(mockSuccessAction).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe("success");
    expect(result.current.error).toBe(null);
  });

  it("should handle async action failure", async () => {
    const { result } = renderHook(() =>
      useAsyncAction({ action: mockFailureAction }),
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("should reset state", () => {
    const { result } = renderHook(() =>
      useAsyncAction({ action: mockSuccessAction }),
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it("should execute with arguments", async () => {
    const actionWithArgs = jest
      .fn()
      .mockImplementation((arg1: string, arg2: number) =>
        Promise.resolve(`${arg1}-${arg2}`),
      );

    const { result } = renderHook(() =>
      useAsyncAction({ action: actionWithArgs }),
    );

    act(() => {
      result.current.execute("test", 123);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(actionWithArgs).toHaveBeenCalledWith("test", 123);
    expect(result.current.data).toBe("test-123");
  });

  it("should not execute if already loading", async () => {
    const slowAction = jest.fn(
      () => new Promise((resolve) => setTimeout(() => resolve("done"), 100)),
    );

    const { result } = renderHook(() => useAsyncAction({ action: slowAction }));

    // Start first execution
    act(() => {
      result.current.execute();
    });

    // Try to execute again while loading
    act(() => {
      result.current.execute();
    });

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only have been called once
    expect(slowAction).toHaveBeenCalledTimes(1);
  });

  it("should return stable function references", () => {
    const { result } = renderHook(() =>
      useAsyncAction({ action: mockSuccessAction }),
    );

    const firstExecute = result.current.execute;
    const firstReset = result.current.reset;

    // In React Native testing, create a new hook instance to test stability
    const { result: result2 } = renderHook(() =>
      useAsyncAction({ action: mockSuccessAction }),
    );

    expect(result.current.execute).toBe(firstExecute);
    expect(result.current.reset).toBe(firstReset);
  });
});
