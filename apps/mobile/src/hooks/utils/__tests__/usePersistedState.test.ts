/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { usePersistedState } from "../usePersistedState";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("usePersistedState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  it("should initialize with provided initial value when no stored value", async () => {
    const initialValue = { theme: "light", language: "en" };
    const { result } = renderHook(() =>
      usePersistedState({ key: "test-key", initialValue }),
    );

    // Wait for async initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.value).toEqual(initialValue);
  });

  it("should load stored value from AsyncStorage", async () => {
    const storedValue = { theme: "dark", language: "es" };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedValue));

    const { result } = renderHook(() =>
      usePersistedState({
        key: "test-key",
        initialValue: { theme: "light", language: "en" },
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("test-key");
    expect(result.current.value).toEqual(storedValue);
  });

  it("should update stored value when setValue is called", async () => {
    const initialValue = { count: 0 };
    const { result } = renderHook(() =>
      usePersistedState({ key: "counter", initialValue }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const newValue = { count: 5 };
    act(() => {
      result.current.setValue(newValue);
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "counter",
      JSON.stringify(newValue),
    );
    expect(result.current.value).toEqual(newValue);
  });

  it("should handle AsyncStorage errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

    const initialValue = { data: "fallback" };
    const { result } = renderHook(() =>
      usePersistedState({ key: "error-key", initialValue }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.value).toEqual(initialValue);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should return stable function references", async () => {
    const { result } = renderHook(() =>
      usePersistedState({ key: "stable-test", initialValue: {} }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const firstSetValue = result.current.setValue;

    // Create new hook instance
    const { result: result2 } = renderHook(() =>
      usePersistedState({ key: "stable-test-2", initialValue: {} }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.setValue).toBe(firstSetValue);
  });
});
