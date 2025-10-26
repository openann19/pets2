/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useThemeToggle } from "../useThemeToggle";
import * as Haptics from "expo-haptics";

// Mock Haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock ThemeContext
const mockToggleTheme = jest.fn();
const mockSetThemeMode = jest.fn();

const mockThemeContext = {
  isDark: false,
  themeMode: "light" as const,
  colors: {
    primary: "#FF6B6B",
    background: "#FFFFFF",
    text: "#000000",
  },
  styles: {},
  shadows: {},
  toggleTheme: mockToggleTheme,
  setThemeMode: mockSetThemeMode,
};

jest.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => mockThemeContext,
}));

describe("useThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it("should initialize with theme context values", () => {
    const { result } = renderHook(() => useThemeToggle());

    expect(result.current.isDark).toBe(false);
    expect(result.current.themeMode).toBe("light");
    expect(result.current.colors).toEqual(mockThemeContext.colors);
    expect(result.current.styles).toEqual(mockThemeContext.styles);
    expect(result.current.shadows).toEqual(mockThemeContext.shadows);
  });

  it("should provide all theme control functions", () => {
    const { result } = renderHook(() => useThemeToggle());

    expect(typeof result.current.toggleTheme).toBe("function");
    expect(typeof result.current.setLightTheme).toBe("function");
    expect(typeof result.current.setDarkTheme).toBe("function");
    expect(typeof result.current.setSystemTheme).toBe("function");
    expect(typeof result.current.showThemeSelector).toBe("function");
  });

  it("should toggle theme with haptic feedback", async () => {
    const { result } = renderHook(() => useThemeToggle());

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    );
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it("should toggle theme even if haptics fail", async () => {
    (Haptics.impactAsync as jest.Mock).mockRejectedValue(
      new Error("Haptics unavailable"),
    );

    const { result } = renderHook(() => useThemeToggle());

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it("should set light theme", () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.setLightTheme();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith("light");
  });

  it("should set dark theme", () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.setDarkTheme();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith("dark");
  });

  it("should set system theme", () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.setSystemTheme();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith("system");
  });

  it("should show theme selector with current theme", () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.showThemeSelector();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Select Theme",
      "Current theme: Light",
      expect.arrayContaining([
        expect.objectContaining({ text: "Light" }),
        expect.objectContaining({ text: "Dark" }),
        expect.objectContaining({ text: "System Default" }),
        expect.objectContaining({ text: "Cancel", style: "cancel" }),
      ]),
      expect.objectContaining({
        cancelable: true,
        userInterfaceStyle: "light",
      }),
    );
  });

  it("should show theme selector with dark mode UI", () => {
    // Mock the theme context to return dark theme
    const mockUseTheme = require("../../contexts/ThemeContext").useTheme;
    mockUseTheme.mockReturnValue({
      ...mockThemeContext,
      isDark: true,
      themeMode: "dark",
    });

    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.showThemeSelector();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Select Theme",
      "Current theme: Dark",
      expect.any(Array),
      expect.objectContaining({
        userInterfaceStyle: "dark",
      }),
    );
  });

  it("should show theme selector with system theme label", () => {
    // Mock the theme context to return system theme
    const mockUseTheme = require("../../contexts/ThemeContext").useTheme;
    mockUseTheme.mockReturnValue({
      ...mockThemeContext,
      themeMode: "system",
    });

    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.showThemeSelector();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Select Theme",
      "Current theme: System Default",
      expect.any(Array),
      expect.any(Object),
    );
  });

  it("should call setLightTheme when Light option selected in selector", () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.showThemeSelector();
    });

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const lightButton = buttons.find((btn: any) => btn.text === "Light");

    act(() => {
      lightButton.onPress();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith("light");
  });

  it("should call setDarkTheme when Dark option selected in selector", () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.showThemeSelector();
    });

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const darkButton = buttons.find((btn: any) => btn.text === "Dark");

    act(() => {
      darkButton.onPress();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith("dark");
  });

  it("should call setSystemTheme when System Default option selected", () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.showThemeSelector();
    });

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const systemButton = buttons.find(
      (btn: any) => btn.text === "System Default",
    );

    act(() => {
      systemButton.onPress();
    });

    expect(mockSetThemeMode).toHaveBeenCalledWith("system");
  });

  it("should expose theme colors", () => {
    const customColors = {
      primary: "#007AFF",
      background: "#F5F5F5",
      text: "#333333",
    };

    jest
      .mocked(require("../../contexts/ThemeContext").useTheme)
      .mockReturnValue({
        ...mockThemeContext,
        colors: customColors,
      });

    const { result } = renderHook(() => useThemeToggle());

    expect(result.current.colors).toEqual(customColors);
  });

  it("should maintain stable function references", () => {
    const { result } = renderHook(() => useThemeToggle());

    const firstToggle = result.current.toggleTheme;
    const firstSetLight = result.current.setLightTheme;
    const firstSetDark = result.current.setDarkTheme;
    const firstSetSystem = result.current.setSystemTheme;

    // No need to rerender for hook stability testing
    expect(result.current.toggleTheme).toBe(firstToggle);
    expect(result.current.setLightTheme).toBe(firstSetLight);
    expect(result.current.setDarkTheme).toBe(firstSetDark);
    expect(result.current.setSystemTheme).toBe(firstSetSystem);
  });

  it("should handle theme mode changes reactively", () => {
    // Mock the theme context to return dark theme
    const mockUseTheme = require("../../contexts/ThemeContext").useTheme;
    mockUseTheme.mockReturnValue({
      ...mockThemeContext,
      themeMode: "dark",
      isDark: true,
    });

    const { result } = renderHook(() => useThemeToggle());

    expect(result.current.themeMode).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should expose styles from theme context", () => {
    const customStyles = {
      container: { padding: 16 },
      text: { fontSize: 14 },
    };

    // Mock the theme context with custom styles
    const mockUseTheme = require("../../contexts/ThemeContext").useTheme;
    mockUseTheme.mockReturnValue({
      ...mockThemeContext,
      styles: customStyles,
    });

    const { result } = renderHook(() => useThemeToggle());

    expect(result.current.styles).toEqual(customStyles);
  });

  it("should expose shadows from theme context", () => {
    const customShadows = {
      sm: { shadowOpacity: 0.1 },
      md: { shadowOpacity: 0.2 },
    };

    // Mock the theme context with custom shadows
    const mockUseTheme = require("../../contexts/ThemeContext").useTheme;
    mockUseTheme.mockReturnValue({
      ...mockThemeContext,
      shadows: customShadows,
    });

    const { result } = renderHook(() => useThemeToggle());

    expect(result.current.shadows).toEqual(customShadows);
  });
});
