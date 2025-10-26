/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAIBio } from "../useAIBio";

// Mock API
const mockGenerateBio = jest.fn();

jest.mock("../../../../services/api", () => ({
  api: {
    ai: {
      generateBio: mockGenerateBio,
    },
  },
}));

// Mock logger
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useAIBio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAIBio());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.lastGeneratedBio).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.bioHistory).toEqual([]);
  });

  it("should generate bio successfully", async () => {
    const mockResponse = {
      bio: "Meet Buddy! A playful golden retriever ready for adventures.",
      keywords: ["friendly", "playful", "energetic"],
      sentiment: { score: 0.9, label: "positive" },
      matchScore: 92,
    };

    mockGenerateBio.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAIBio());

    const params = {
      petName: "Buddy",
      keywords: ["friendly", "playful"],
      tone: "playful" as const,
      length: "medium" as const,
      petType: "dog",
      age: 3,
      breed: "Golden Retriever",
    };

    let generatedBio;
    await act(async () => {
      generatedBio = await result.current.generateBio(params);
    });

    expect(mockGenerateBio).toHaveBeenCalledWith(params);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.lastGeneratedBio).toEqual(mockResponse);
    expect(generatedBio).toEqual(mockResponse);
  });

  it("should set loading state during generation", async () => {
    mockGenerateBio.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                bio: "Test bio",
                keywords: [],
                sentiment: { score: 0.8, label: "positive" },
                matchScore: 85,
              }),
            100,
          ),
        ),
    );

    const { result } = renderHook(() => useAIBio());

    const params = {
      petName: "Buddy",
      keywords: [],
      tone: "casual" as const,
      length: "short" as const,
      petType: "dog",
      age: 2,
      breed: "Labrador",
    };

    const generatePromise = act(async () => {
      await result.current.generateBio(params);
    });

    // Should be loading
    expect(result.current.isGenerating).toBe(true);

    await generatePromise;

    // Should finish loading
    expect(result.current.isGenerating).toBe(false);
  });

  it("should require pet name", async () => {
    const { result } = renderHook(() => useAIBio());

    const params = {
      petName: "",
      keywords: [],
      tone: "casual" as const,
      length: "short" as const,
      petType: "dog",
      age: 2,
      breed: "Labrador",
    };

    await expect(
      act(async () => {
        await result.current.generateBio(params);
      }),
    ).rejects.toThrow("Pet name is required");

    expect(result.current.error).toBe("Pet name is required");
    expect(mockGenerateBio).not.toHaveBeenCalled();
  });

  it("should handle API errors with fallback bio", async () => {
    mockGenerateBio.mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useAIBio());

    const params = {
      petName: "Buddy",
      keywords: ["friendly"],
      tone: "playful" as const,
      length: "medium" as const,
      petType: "dog",
      age: 3,
      breed: "Golden Retriever",
    };

    let generatedBio;
    await act(async () => {
      generatedBio = await result.current.generateBio(params);
    });

    // Should use fallback bio
    expect(generatedBio).toBeDefined();
    expect((generatedBio as any).bio).toContain("Buddy");
    expect((generatedBio as any).bio).toContain("Golden Retriever");
    expect(result.current.lastGeneratedBio).not.toBe(null);
  });

  it("should add bio to history", async () => {
    const mockResponse = {
      bio: "Test bio",
      keywords: ["test"],
      sentiment: { score: 0.8, label: "positive" },
      matchScore: 85,
    };

    mockGenerateBio.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAIBio());

    const params = {
      petName: "Buddy",
      keywords: [],
      tone: "casual" as const,
      length: "short" as const,
      petType: "dog",
      age: 2,
      breed: "Labrador",
    };

    await act(async () => {
      await result.current.generateBio(params);
    });

    expect(result.current.bioHistory).toHaveLength(1);
    expect(result.current.bioHistory[0]).toEqual(mockResponse);
  });

  it("should maintain history of last 5 bios", async () => {
    const { result } = renderHook(() => useAIBio());

    // Generate 6 bios
    for (let i = 0; i < 6; i++) {
      const bio = {
        bio: `Bio ${i}`,
        keywords: [],
        sentiment: { score: 0.8, label: "positive" },
        matchScore: 85,
      };

      mockGenerateBio.mockResolvedValue(bio);

      const params = {
        petName: `Pet${i}`,
        keywords: [],
        tone: "casual" as const,
        length: "short" as const,
        petType: "dog",
        age: 2,
        breed: "Labrador",
      };

      await act(async () => {
        await result.current.generateBio(params);
      });
    }

    // Should only keep last 5
    expect(result.current.bioHistory).toHaveLength(5);
    expect(result.current.bioHistory[0].bio).toBe("Bio 5");
    expect(result.current.bioHistory[4].bio).toBe("Bio 1");
  });

  it("should clear history", () => {
    const { result } = renderHook(() => useAIBio());

    const bio = {
      bio: "Test bio",
      keywords: [],
      sentiment: { score: 0.8, label: "positive" },
      matchScore: 85,
    };

    act(() => {
      result.current.addToHistory(bio);
    });

    expect(result.current.bioHistory).toHaveLength(1);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.bioHistory).toEqual([]);
  });

  it("should clear error", () => {
    const { result } = renderHook(() => useAIBio());

    const params = {
      petName: "",
      keywords: [],
      tone: "casual" as const,
      length: "short" as const,
      petType: "dog",
      age: 2,
      breed: "Labrador",
    };

    act(async () => {
      try {
        await result.current.generateBio(params);
      } catch {
        // Expected error
      }
    });

    expect(result.current.error).toBe("Pet name is required");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it("should handle different tones", async () => {
    const tones: Array<
      "playful" | "professional" | "casual" | "romantic" | "funny"
    > = ["playful", "professional", "casual", "romantic", "funny"];

    const { result } = renderHook(() => useAIBio());

    for (const tone of tones) {
      mockGenerateBio.mockResolvedValue({
        bio: `${tone} bio`,
        keywords: [],
        sentiment: { score: 0.8, label: "positive" },
        matchScore: 85,
      });

      const params = {
        petName: "Buddy",
        keywords: [],
        tone,
        length: "medium" as const,
        petType: "dog",
        age: 3,
        breed: "Labrador",
      };

      await act(async () => {
        await result.current.generateBio(params);
      });

      expect(mockGenerateBio).toHaveBeenCalledWith(
        expect.objectContaining({ tone }),
      );
    }
  });

  it("should handle different lengths", async () => {
    const lengths: Array<"short" | "medium" | "long"> = [
      "short",
      "medium",
      "long",
    ];

    const { result } = renderHook(() => useAIBio());

    for (const length of lengths) {
      mockGenerateBio.mockResolvedValue({
        bio: `${length} bio`,
        keywords: [],
        sentiment: { score: 0.8, label: "positive" },
        matchScore: 85,
      });

      const params = {
        petName: "Buddy",
        keywords: [],
        tone: "casual" as const,
        length,
        petType: "dog",
        age: 3,
        breed: "Labrador",
      };

      await act(async () => {
        await result.current.generateBio(params);
      });

      expect(mockGenerateBio).toHaveBeenCalledWith(
        expect.objectContaining({ length }),
      );
    }
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() => useAIBio());

    const firstGenerateBio = result.current.generateBio;
    const firstClearError = result.current.clearError;
    const firstClearHistory = result.current.clearHistory;

    rerender();

    expect(result.current.generateBio).toBe(firstGenerateBio);
    expect(result.current.clearError).toBe(firstClearError);
    expect(result.current.clearHistory).toBe(firstClearHistory);
  });
});
