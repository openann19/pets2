/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { useSettingsPersistence } from "../useSettingsPersistence";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("useSettingsPersistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  it("should initialize with default options", () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "test-settings" }),
    );

    expect(typeof result.current.loadSettings).toBe("function");
    expect(typeof result.current.saveSettings).toBe("function");
    expect(typeof result.current.clearSettings).toBe("function");
  });

  it("should load settings from AsyncStorage", async () => {
    const storedSettings = { theme: "dark", notifications: true };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedSettings));

    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "user-settings" }),
    );

    const loadedSettings = await result.current.loadSettings();

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("user-settings");
    expect(loadedSettings).toEqual(storedSettings);
  });

  it("should return initial data when no stored settings", async () => {
    const initialData = { theme: "light", language: "en" };

    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "empty-settings", initialData }),
    );

    const loadedSettings = await result.current.loadSettings();

    expect(loadedSettings).toEqual(initialData);
  });

  it("should save settings to AsyncStorage", async () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "save-test" }),
    );

    const settingsToSave = { volume: 75, autoPlay: false };

    await act(async () => {
      await result.current.saveSettings(settingsToSave);
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "save-test",
      JSON.stringify(settingsToSave),
    );
  });

  it("should clear settings from AsyncStorage", async () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "clear-test" }),
    );

    await act(async () => {
      await result.current.clearSettings();
    });

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("clear-test");
  });

  it("should handle AsyncStorage errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
    const initialData = { fallback: true };

    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "error-test", initialData }),
    );

    const loadedSettings = await result.current.loadSettings();

    expect(loadedSettings).toEqual(initialData);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle save errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockAsyncStorage.setItem.mockRejectedValue(new Error("Save error"));

    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "save-error-test" }),
    );

    // Should not throw
    await act(async () => {
      await result.current.saveSettings({ test: "data" });
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle clear errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockAsyncStorage.removeItem.mockRejectedValue(new Error("Clear error"));

    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "clear-error-test" }),
    );

    // Should not throw
    await act(async () => {
      await result.current.clearSettings();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should work with complex nested objects", async () => {
    const complexSettings = {
      profile: {
        name: "John Doe",
        avatar: "avatar.jpg",
      },
      preferences: {
        theme: "dark",
        notifications: {
          email: true,
          push: false,
          sms: true,
        },
      },
      history: [1, 2, 3, 4, 5],
    };

    const { result } = renderHook(() =>
      useSettingsPersistence({ key: "complex-settings" }),
    );

    await act(async () => {
      await result.current.saveSettings(complexSettings);
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "complex-settings",
      JSON.stringify(complexSettings),
    );
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() =>
      useSettingsPersistence({ key: "stable-test" }),
    );

    const firstLoad = result.current.loadSettings;
    const firstSave = result.current.saveSettings;
    const firstClear = result.current.clearSettings;

    rerender();

    expect(result.current.loadSettings).toBe(firstLoad);
    expect(result.current.saveSettings).toBe(firstSave);
    expect(result.current.clearSettings).toBe(firstClear);
  });
});
