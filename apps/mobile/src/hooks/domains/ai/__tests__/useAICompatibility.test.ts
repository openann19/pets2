/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAICompatibility } from "../useAICompatibility";

// Mock API
const mockAnalyzeCompatibility = jest.fn();
const mockGetPets = jest.fn();

jest.mock("../../../../services/api", () => ({
  api: {
    ai: {
      analyzeCompatibility: mockAnalyzeCompatibility,
    },
  },
  matchesAPI: {
    getPets: mockGetPets,
  },
}));

// Mock logger
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPets = [
  {
    _id: "pet1",
    name: "Buddy",
    photos: ["photo1.jpg"],
    breed: "Golden Retriever",
    age: 3,
    species: "dog",
    owner: { _id: "user1", name: "Alice" },
  },
  {
    _id: "pet2",
    name: "Max",
    photos: ["photo2.jpg"],
    breed: "Labrador",
    age: 2,
    species: "dog",
    owner: { _id: "user2", name: "Bob" },
  },
];

const mockCompatibilityResult = {
  compatibility_score: 92,
  ai_analysis: "Excellent compatibility! Both pets are energetic and social.",
  breakdown: {
    personality_compatibility: 95,
    lifestyle_compatibility: 90,
    activity_compatibility: 92,
    social_compatibility: 88,
    environment_compatibility: 91,
  },
  recommendations: {
    meeting_suggestions: [
      "Meet in neutral space",
      "Keep initial meetings short",
    ],
    activity_recommendations: ["Daily walks", "Joint play sessions"],
    supervision_requirements: ["Monitor stress", "Separate if uncomfortable"],
    success_probability: 92,
  },
};

describe("useAICompatibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPets.mockResolvedValue(mockPets);
    mockAnalyzeCompatibility.mockResolvedValue(mockCompatibilityResult);
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAICompatibility());

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.compatibilityResult).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.availablePets).toEqual([]);
    expect(result.current.isLoadingPets).toBe(false);
    expect(result.current.selectedPet1).toBe(null);
    expect(result.current.selectedPet2).toBe(null);
  });

  it("should load available pets", async () => {
    const { result } = renderHook(() => useAICompatibility());

    await act(async () => {
      await result.current.loadAvailablePets();
    });

    expect(mockGetPets).toHaveBeenCalled();
    expect(result.current.availablePets).toEqual(mockPets);
    expect(result.current.isLoadingPets).toBe(false);
  });

  it("should set loading state when loading pets", async () => {
    mockGetPets.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockPets), 100)),
    );

    const { result } = renderHook(() => useAICompatibility());

    const loadPromise = act(async () => {
      await result.current.loadAvailablePets();
    });

    // Should be loading
    expect(result.current.isLoadingPets).toBe(true);

    await loadPromise;

    // Should finish loading
    expect(result.current.isLoadingPets).toBe(false);
  });

  it("should handle pet loading error", async () => {
    mockGetPets.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAICompatibility());

    await expect(
      act(async () => {
        await result.current.loadAvailablePets();
      }),
    ).rejects.toThrow("Failed to load pets");

    expect(result.current.error).toBe("Failed to load pets. Please try again.");
    expect(result.current.availablePets).toEqual([]);
  });

  it("should analyze compatibility successfully", async () => {
    const { result } = renderHook(() => useAICompatibility());

    let compatibilityResult;
    await act(async () => {
      compatibilityResult = await result.current.analyzeCompatibility(
        "pet1",
        "pet2",
      );
    });

    expect(mockAnalyzeCompatibility).toHaveBeenCalledWith({
      pet1Id: "pet1",
      pet2Id: "pet2",
    });

    expect(result.current.compatibilityResult).toEqual(mockCompatibilityResult);
    expect(compatibilityResult).toEqual(mockCompatibilityResult);
    expect(result.current.isAnalyzing).toBe(false);
  });

  it("should require both pet IDs", async () => {
    const { result } = renderHook(() => useAICompatibility());

    await expect(
      act(async () => {
        await result.current.analyzeCompatibility("", "pet2");
      }),
    ).rejects.toThrow("Please select two pets");

    expect(result.current.error).toBe(
      "Please select two pets to analyze compatibility.",
    );
    expect(mockAnalyzeCompatibility).not.toHaveBeenCalled();
  });

  it("should require different pets", async () => {
    const { result } = renderHook(() => useAICompatibility());

    await expect(
      act(async () => {
        await result.current.analyzeCompatibility("pet1", "pet1");
      }),
    ).rejects.toThrow("Please select two different pets");

    expect(result.current.error).toBe("Please select two different pets.");
    expect(mockAnalyzeCompatibility).not.toHaveBeenCalled();
  });

  it("should set loading state during analysis", async () => {
    mockAnalyzeCompatibility.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockCompatibilityResult), 100),
        ),
    );

    const { result } = renderHook(() => useAICompatibility());

    const analyzePromise = act(async () => {
      await result.current.analyzeCompatibility("pet1", "pet2");
    });

    // Should be analyzing
    expect(result.current.isAnalyzing).toBe(true);

    await analyzePromise;

    // Should finish analyzing
    expect(result.current.isAnalyzing).toBe(false);
  });

  it("should handle API error with fallback result", async () => {
    mockAnalyzeCompatibility.mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useAICompatibility());

    let compatibilityResult;
    await act(async () => {
      compatibilityResult = await result.current.analyzeCompatibility(
        "pet1",
        "pet2",
      );
    });

    // Should use mock result as fallback
    expect(compatibilityResult).toBeDefined();
    expect((compatibilityResult as any).compatibility_score).toBe(85);
    expect(result.current.compatibilityResult).not.toBe(null);
  });

  it("should allow selecting pets", () => {
    const { result } = renderHook(() => useAICompatibility());

    act(() => {
      result.current.setSelectedPet1(mockPets[0]);
    });

    expect(result.current.selectedPet1).toEqual(mockPets[0]);

    act(() => {
      result.current.setSelectedPet2(mockPets[1]);
    });

    expect(result.current.selectedPet2).toEqual(mockPets[1]);
  });

  it("should reset analysis", () => {
    const { result } = renderHook(() => useAICompatibility());

    act(() => {
      result.current.setSelectedPet1(mockPets[0]);
      result.current.setSelectedPet2(mockPets[1]);
    });

    // Manually set compatibility result
    act(async () => {
      await result.current.analyzeCompatibility("pet1", "pet2");
    });

    act(() => {
      result.current.resetAnalysis();
    });

    expect(result.current.selectedPet1).toBe(null);
    expect(result.current.selectedPet2).toBe(null);
    expect(result.current.compatibilityResult).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should clear error", async () => {
    const { result } = renderHook(() => useAICompatibility());

    await act(async () => {
      try {
        await result.current.analyzeCompatibility("", "");
      } catch {
        // Expected error
      }
    });

    expect(result.current.error).not.toBe(null);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it("should provide detailed compatibility breakdown", async () => {
    const { result } = renderHook(() => useAICompatibility());

    await act(async () => {
      await result.current.analyzeCompatibility("pet1", "pet2");
    });

    const breakdown = result.current.compatibilityResult?.breakdown;
    expect(breakdown).toBeDefined();
    expect(breakdown?.personality_compatibility).toBe(95);
    expect(breakdown?.lifestyle_compatibility).toBe(90);
    expect(breakdown?.activity_compatibility).toBe(92);
    expect(breakdown?.social_compatibility).toBe(88);
    expect(breakdown?.environment_compatibility).toBe(91);
  });

  it("should provide recommendations", async () => {
    const { result } = renderHook(() => useAICompatibility());

    await act(async () => {
      await result.current.analyzeCompatibility("pet1", "pet2");
    });

    const recommendations = result.current.compatibilityResult?.recommendations;
    expect(recommendations).toBeDefined();
    expect(recommendations?.meeting_suggestions).toHaveLength(2);
    expect(recommendations?.activity_recommendations).toHaveLength(2);
    expect(recommendations?.supervision_requirements).toHaveLength(2);
    expect(recommendations?.success_probability).toBe(92);
  });

  it("should provide AI analysis text", async () => {
    const { result } = renderHook(() => useAICompatibility());

    await act(async () => {
      await result.current.analyzeCompatibility("pet1", "pet2");
    });

    expect(result.current.compatibilityResult?.ai_analysis).toBe(
      "Excellent compatibility! Both pets are energetic and social.",
    );
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() => useAICompatibility());

    const firstAnalyzeCompatibility = result.current.analyzeCompatibility;
    const firstLoadAvailablePets = result.current.loadAvailablePets;
    const firstResetAnalysis = result.current.resetAnalysis;
    const firstClearError = result.current.clearError;

    rerender();

    expect(result.current.analyzeCompatibility).toBe(firstAnalyzeCompatibility);
    expect(result.current.loadAvailablePets).toBe(firstLoadAvailablePets);
    expect(result.current.resetAnalysis).toBe(firstResetAnalysis);
    expect(result.current.clearError).toBe(firstClearError);
  });
});
