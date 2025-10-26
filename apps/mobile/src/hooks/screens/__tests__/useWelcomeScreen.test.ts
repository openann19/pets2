/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { useWelcomeScreen } from "../useWelcomeScreen";

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as any;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
}));

// Mock theme context
const mockTheme = {
  colors: {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
  },
  styles: {},
  isDark: false,
};

jest.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => mockTheme,
}));

// Mock domain hook
const mockDomainHandleGetStarted = jest.fn();
const mockDomainHandleSkipOnboarding = jest.fn();

jest.mock("../../domains/onboarding/useWelcome", () => ({
  useWelcome: () => ({
    logoScale: { value: 1 },
    logoOpacity: { value: 1 },
    titleOpacity: { value: 1 },
    titleTranslateY: { value: 0 },
    subtitleOpacity: { value: 1 },
    subtitleTranslateY: { value: 0 },
    featuresOpacity: { value: 1 },
    featuresTranslateY: { value: 0 },
    buttonOpacity: { value: 1 },
    buttonScale: { value: 1 },
    confettiScale: { value: 0 },
    isReady: true,
    handleGetStarted: mockDomainHandleGetStarted,
    handleSkipOnboarding: mockDomainHandleSkipOnboarding,
  }),
}));

describe("useWelcomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with theme data", () => {
    const { result } = renderHook(() => useWelcomeScreen());

    expect(result.current.colors).toEqual(mockTheme.colors);
    expect(result.current.styles).toEqual(mockTheme.styles);
    expect(result.current.isDark).toBe(false);
  });

  it("should provide animation values from domain hook", () => {
    const { result } = renderHook(() => useWelcomeScreen());

    expect(result.current.logoScale).toBeDefined();
    expect(result.current.logoOpacity).toBeDefined();
    expect(result.current.titleOpacity).toBeDefined();
    expect(result.current.titleTranslateY).toBeDefined();
    expect(result.current.buttonOpacity).toBeDefined();
    expect(result.current.buttonScale).toBeDefined();
  });

  it("should indicate when ready", () => {
    const { result } = renderHook(() => useWelcomeScreen());

    expect(result.current.isReady).toBe(true);
  });

  it("should handle get started action", () => {
    const { result } = renderHook(() => useWelcomeScreen());

    act(() => {
      result.current.handleGetStarted();
    });

    expect(mockDomainHandleGetStarted).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("UserIntent");
  });

  it("should handle skip onboarding action", () => {
    const { result } = renderHook(() => useWelcomeScreen());

    act(() => {
      result.current.handleSkipOnboarding();
    });

    expect(mockDomainHandleSkipOnboarding).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("Main");
  });

  it("should provide all animation values", () => {
    const { result } = renderHook(() => useWelcomeScreen());

    // Check all animation values are present
    expect(result.current.logoScale).toBeDefined();
    expect(result.current.logoOpacity).toBeDefined();
    expect(result.current.titleOpacity).toBeDefined();
    expect(result.current.titleTranslateY).toBeDefined();
    expect(result.current.subtitleOpacity).toBeDefined();
    expect(result.current.subtitleTranslateY).toBeDefined();
    expect(result.current.featuresOpacity).toBeDefined();
    expect(result.current.featuresTranslateY).toBeDefined();
    expect(result.current.buttonOpacity).toBeDefined();
    expect(result.current.buttonScale).toBeDefined();
    expect(result.current.confettiScale).toBeDefined();
  });

  it("should expose theme information", () => {
    const { result } = renderHook(() => useWelcomeScreen());

    expect(result.current.colors.primary).toBe("#007AFF");
    expect(result.current.colors.background).toBe("#FFFFFF");
    expect(result.current.colors.text).toBe("#000000");
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() => useWelcomeScreen());

    const firstHandleGetStarted = result.current.handleGetStarted;
    const firstHandleSkipOnboarding = result.current.handleSkipOnboarding;

    rerender();

    expect(result.current.handleGetStarted).toBe(firstHandleGetStarted);
    expect(result.current.handleSkipOnboarding).toBe(firstHandleSkipOnboarding);
  });
});
