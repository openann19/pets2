/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useAICompatibilityScreen } from "../useAICompatibilityScreen";

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: jest.fn(),
};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
}));

// Mock AI compatibility domain hook
const mockAnalyzeCompatibility = jest.fn();
const mockLoadAvailablePets = jest.fn();
const mockSetSelectedPet1 = jest.fn();
const mockSetSelectedPet2 = jest.fn();
const mockResetAnalysis = jest.fn();
const mockClearError = jest.fn();

jest.mock("../../domains/ai/useAICompatibility", () => ({
  useAICompatibility: () => ({
    analyzeCompatibility: mockAnalyzeCompatibility,
    isAnalyzing: false,
    compatibilityResult: null,
    error: null,
    loadAvailablePets: mockLoadAvailablePets,
    availablePets: [],
    isLoadingPets: false,
    selectedPet1: null,
    selectedPet2: null,
    setSelectedPet1: mockSetSelectedPet1,
    setSelectedPet2: mockSetSelectedPet2,
    resetAnalysis: mockResetAnalysis,
    clearError: mockClearError,
  }),
}));

// Mock logger
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, "alert");

describe("useAICompatibilityScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should initialize and load available pets", () => {
    renderHook(() => useAICompatibilityScreen());

    expect(mockLoadAvailablePets).toHaveBeenCalled();
  });

  it("should provide state from domain hook", () => {
    const { result } = renderHook(() => useAICompatibilityScreen());

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.compatibilityResult).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.availablePets).toEqual([]);
    expect(result.current.isLoadingPets).toBe(false);
  });

  it("should provide action methods", () => {
    const { result } = renderHook(() => useAICompatibilityScreen());

    expect(typeof result.current.setSelectedPet1).toBe("function");
    expect(typeof result.current.setSelectedPet2).toBe("function");
    expect(typeof result.current.analyzeCompatibility).toBe("function");
    expect(typeof result.current.resetAnalysis).toBe("function");
    expect(typeof result.current.handleGoBack).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  it("should handle go back navigation", () => {
    const { result } = renderHook(() => useAICompatibilityScreen());

    act(() => {
      result.current.handleGoBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it("should show alert when analyzing without both pets selected", async () => {
    const { result } = renderHook(() => useAICompatibilityScreen());

    await act(async () => {
      await result.current.analyzeCompatibility();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Selection Required",
      "Please select two pets to analyze compatibility.",
    );
    expect(mockAnalyzeCompatibility).not.toHaveBeenCalled();
  });

  it("should call analyzeCompatibility when both pets selected", async () => {
    const mockPet1 = { _id: "pet1", name: "Buddy" };
    const mockPet2 = { _id: "pet2", name: "Max" };

    jest
      .mocked(require("../../domains/ai/useAICompatibility").useAICompatibility)
      .mockReturnValue({
        analyzeCompatibility: mockAnalyzeCompatibility,
        isAnalyzing: false,
        compatibilityResult: null,
        error: null,
        loadAvailablePets: mockLoadAvailablePets,
        availablePets: [mockPet1, mockPet2],
        isLoadingPets: false,
        selectedPet1: mockPet1,
        selectedPet2: mockPet2,
        setSelectedPet1: mockSetSelectedPet1,
        setSelectedPet2: mockSetSelectedPet2,
        resetAnalysis: mockResetAnalysis,
        clearError: mockClearError,
      });

    const { result } = renderHook(() => useAICompatibilityScreen());

    await act(async () => {
      await result.current.analyzeCompatibility();
    });

    expect(mockAnalyzeCompatibility).toHaveBeenCalledWith("pet1", "pet2");
  });

  it("should load specific pets from route params", async () => {
    const mockPet1 = { _id: "pet-a", name: "Buddy" };
    const mockPet2 = { _id: "pet-b", name: "Max" };

    jest
      .mocked(require("../../domains/ai/useAICompatibility").useAICompatibility)
      .mockReturnValue({
        analyzeCompatibility: mockAnalyzeCompatibility,
        isAnalyzing: false,
        compatibilityResult: null,
        error: null,
        loadAvailablePets: mockLoadAvailablePets.mockResolvedValue(undefined),
        availablePets: [mockPet1, mockPet2],
        isLoadingPets: false,
        selectedPet1: null,
        selectedPet2: null,
        setSelectedPet1: mockSetSelectedPet1,
        setSelectedPet2: mockSetSelectedPet2,
        resetAnalysis: mockResetAnalysis,
        clearError: mockClearError,
      });

    const route = {
      params: {
        petAId: "pet-a",
        petBId: "pet-b",
      },
    };

    renderHook(() => useAICompatibilityScreen(route));

    // Should load available pets
    expect(mockLoadAvailablePets).toHaveBeenCalled();
  });

  it("should handle error when analyzing compatibility fails", async () => {
    const error = new Error("Analysis failed");
    mockAnalyzeCompatibility.mockRejectedValue(error);

    const mockPet1 = { _id: "pet1", name: "Buddy" };
    const mockPet2 = { _id: "pet2", name: "Max" };

    jest
      .mocked(require("../../domains/ai/useAICompatibility").useAICompatibility)
      .mockReturnValue({
        analyzeCompatibility: mockAnalyzeCompatibility,
        isAnalyzing: false,
        compatibilityResult: null,
        error: null,
        loadAvailablePets: mockLoadAvailablePets,
        availablePets: [mockPet1, mockPet2],
        isLoadingPets: false,
        selectedPet1: mockPet1,
        selectedPet2: mockPet2,
        setSelectedPet1: mockSetSelectedPet1,
        setSelectedPet2: mockSetSelectedPet2,
        resetAnalysis: mockResetAnalysis,
        clearError: mockClearError,
      });

    const { result } = renderHook(() => useAICompatibilityScreen());

    await act(async () => {
      await result.current.analyzeCompatibility();
    });

    expect(mockAnalyzeCompatibility).toHaveBeenCalled();
  });

  it("should expose selected pets from domain hook", () => {
    const mockPet1 = { _id: "pet1", name: "Buddy" };
    const mockPet2 = { _id: "pet2", name: "Max" };

    jest
      .mocked(require("../../domains/ai/useAICompatibility").useAICompatibility)
      .mockReturnValue({
        analyzeCompatibility: mockAnalyzeCompatibility,
        isAnalyzing: false,
        compatibilityResult: null,
        error: null,
        loadAvailablePets: mockLoadAvailablePets,
        availablePets: [mockPet1, mockPet2],
        isLoadingPets: false,
        selectedPet1: mockPet1,
        selectedPet2: mockPet2,
        setSelectedPet1: mockSetSelectedPet1,
        setSelectedPet2: mockSetSelectedPet2,
        resetAnalysis: mockResetAnalysis,
        clearError: mockClearError,
      });

    const { result } = renderHook(() => useAICompatibilityScreen());

    expect(result.current.selectedPet1).toEqual(mockPet1);
    expect(result.current.selectedPet2).toEqual(mockPet2);
  });

  it("should expose compatibility result from domain hook", () => {
    const mockResult = {
      score: 85,
      traits: ["playful", "friendly"],
      analysis: "Great match!",
    };

    jest
      .mocked(require("../../domains/ai/useAICompatibility").useAICompatibility)
      .mockReturnValue({
        analyzeCompatibility: mockAnalyzeCompatibility,
        isAnalyzing: false,
        compatibilityResult: mockResult,
        error: null,
        loadAvailablePets: mockLoadAvailablePets,
        availablePets: [],
        isLoadingPets: false,
        selectedPet1: null,
        selectedPet2: null,
        setSelectedPet1: mockSetSelectedPet1,
        setSelectedPet2: mockSetSelectedPet2,
        resetAnalysis: mockResetAnalysis,
        clearError: mockClearError,
      });

    const { result } = renderHook(() => useAICompatibilityScreen());

    expect(result.current.compatibilityResult).toEqual(mockResult);
  });

  it("should expose error state from domain hook", () => {
    jest
      .mocked(require("../../domains/ai/useAICompatibility").useAICompatibility)
      .mockReturnValue({
        analyzeCompatibility: mockAnalyzeCompatibility,
        isAnalyzing: false,
        compatibilityResult: null,
        error: "Failed to analyze",
        loadAvailablePets: mockLoadAvailablePets,
        availablePets: [],
        isLoadingPets: false,
        selectedPet1: null,
        selectedPet2: null,
        setSelectedPet1: mockSetSelectedPet1,
        setSelectedPet2: mockSetSelectedPet2,
        resetAnalysis: mockResetAnalysis,
        clearError: mockClearError,
      });

    const { result } = renderHook(() => useAICompatibilityScreen());

    expect(result.current.error).toBe("Failed to analyze");
  });

  it("should expose analyzing state from domain hook", () => {
    jest
      .mocked(require("../../domains/ai/useAICompatibility").useAICompatibility)
      .mockReturnValue({
        analyzeCompatibility: mockAnalyzeCompatibility,
        isAnalyzing: true,
        compatibilityResult: null,
        error: null,
        loadAvailablePets: mockLoadAvailablePets,
        availablePets: [],
        isLoadingPets: false,
        selectedPet1: null,
        selectedPet2: null,
        setSelectedPet1: mockSetSelectedPet1,
        setSelectedPet2: mockSetSelectedPet2,
        resetAnalysis: mockResetAnalysis,
        clearError: mockClearError,
      });

    const { result } = renderHook(() => useAICompatibilityScreen());

    expect(result.current.isAnalyzing).toBe(true);
  });

  it("should reload pets when route params change", () => {
    const { rerender } = renderHook(
      ({ route }) => useAICompatibilityScreen(route),
      {
        initialProps: { route: undefined },
      },
    );

    expect(mockLoadAvailablePets).toHaveBeenCalledTimes(1);

    rerender({
      route: {
        params: {
          petAId: "new-pet-a",
          petBId: "new-pet-b",
        },
      },
    });

    // Should load pets again for new params
    expect(mockLoadAvailablePets).toHaveBeenCalledTimes(2);
  });
});
