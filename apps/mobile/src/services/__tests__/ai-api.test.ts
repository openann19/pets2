/**
 * AI API Service Tests
 * Tests the AI API service layer without React Native components
 */

jest.mock("../apiClient", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { aiAPI } from "../api";
import apiClient from "../apiClient";

const mockedApiClient = apiClient as unknown as {
  post: jest.Mock;
  get: jest.Mock;
  put: jest.Mock;
  patch: jest.Mock;
  delete: jest.Mock;
};

describe("AI API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateBio", () => {
    it("should call the correct endpoint with proper data", async () => {
      const mockResponse = {
        success: true,
        data: {
          bio: "Buddy is a friendly and energetic Golden Retriever who loves to play fetch.",
          keywords: ["friendly", "energetic", "playful"],
          sentiment: { score: 0.9, label: "positive" },
          matchScore: 85,
        },
      };
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiAPI.generateBio({
        petName: "Buddy",
        keywords: ["friendly", "energetic", "playful"],
        tone: "playful",
        length: "medium",
        petType: "dog",
        age: 3,
        breed: "Golden Retriever",
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith("/ai/generate-bio", {
        petName: "Buddy",
        keywords: ["friendly", "energetic", "playful"],
        tone: "playful",
        length: "medium",
        petType: "dog",
        age: 3,
        breed: "Golden Retriever",
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when API call fails", async () => {
      const mockError = new Error("API Error");
      mockedApiClient.post.mockRejectedValue(mockError);

      await expect(
        aiAPI.generateBio({
          petName: "Buddy",
          keywords: ["friendly"],
          tone: "playful",
          length: "medium",
          petType: "dog",
          age: 3,
          breed: "Golden Retriever",
        }),
      ).rejects.toThrow("API Error");
    });

    it("should throw error when response is not successful", async () => {
      const mockResponse = {
        success: false,
        error: "Failed to generate bio",
      };
      mockedApiClient.post.mockResolvedValue(mockResponse);

      await expect(
        aiAPI.generateBio({
          petName: "Buddy",
          keywords: ["friendly"],
          tone: "playful",
          length: "medium",
          petType: "dog",
          age: 3,
          breed: "Golden Retriever",
        }),
      ).rejects.toThrow("Failed to generate bio");
    });
  });

  describe("analyzePhotos", () => {
    it("should call the correct endpoint with photo URIs", async () => {
      const mockResponse = {
        success: true,
        data: {
          breed_analysis: {
            primary_breed: "Golden Retriever",
            confidence: 0.95,
            secondary_breeds: [{ breed: "Labrador", confidence: 0.3 }],
          },
          health_assessment: {
            age_estimate: 3,
            health_score: 0.9,
            recommendations: ["Regular exercise recommended"],
          },
          photo_quality: {
            overall_score: 0.85,
            lighting_score: 0.9,
            composition_score: 0.8,
            clarity_score: 0.85,
          },
          matchability_score: 0.88,
          ai_insights: ["High quality photo", "Good lighting"],
        },
      };
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiAPI.analyzePhotos(["photo1-uri", "photo2-uri"]);

      expect(mockedApiClient.post).toHaveBeenCalledWith("/ai/analyze-photos", {
        photos: ["photo1-uri", "photo2-uri"],
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when API call fails", async () => {
      const mockError = new Error("Analysis failed");
      mockedApiClient.post.mockRejectedValue(mockError);

      await expect(aiAPI.analyzePhotos(["photo1-uri"])).rejects.toThrow(
        "Analysis failed",
      );
    });
  });

  describe("analyzeCompatibility", () => {
    it("should call the correct endpoint with pet IDs", async () => {
      const mockResponse = {
        success: true,
        data: {
          compatibility_score: 0.85,
          ai_analysis: "These pets show excellent compatibility potential.",
          breakdown: {
            personality_compatibility: 0.9,
            lifestyle_compatibility: 0.8,
            activity_compatibility: 0.85,
            social_compatibility: 0.9,
            environment_compatibility: 0.8,
          },
          recommendations: {
            meeting_suggestions: [
              "Neutral territory",
              "Supervised introduction",
            ],
            activity_recommendations: ["Play fetch together", "Go for walks"],
            supervision_requirements: ["Initial supervision recommended"],
            success_probability: 0.9,
          },
        },
      };
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiAPI.analyzeCompatibility({
        pet1Id: "pet1-id",
        pet2Id: "pet2-id",
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/ai/enhanced-compatibility",
        {
          pet1Id: "pet1-id",
          pet2Id: "pet2-id",
        },
      );

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when API call fails", async () => {
      const mockError = new Error("Compatibility analysis failed");
      mockedApiClient.post.mockRejectedValue(mockError);

      await expect(
        aiAPI.analyzeCompatibility({
          pet1Id: "pet1-id",
          pet2Id: "pet2-id",
        }),
      ).rejects.toThrow("Compatibility analysis failed");
    });
  });

  describe("getCompatibility", () => {
    it("should call the legacy compatibility endpoint", async () => {
      const mockResponse = {
        success: true,
        data: {
          score: 75,
          analysis: "Good compatibility potential",
          factors: {
            age_compatibility: true,
            size_compatibility: true,
            breed_compatibility: true,
            personality_match: true,
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiAPI.getCompatibility({
        pet1Id: "pet1-id",
        pet2Id: "pet2-id",
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith("/ai/compatibility", {
        pet1Id: "pet1-id",
        pet2Id: "pet2-id",
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when API call fails", async () => {
      const mockError = new Error("Legacy compatibility failed");
      mockedApiClient.post.mockRejectedValue(mockError);

      await expect(
        aiAPI.getCompatibility({
          pet1Id: "pet1-id",
          pet2Id: "pet2-id",
        }),
      ).rejects.toThrow("Legacy compatibility failed");
    });
  });

  describe("Error Handling", () => {
    it("should handle network timeout errors", async () => {
      const timeoutError = new Error("Network timeout");
      timeoutError.name = "TimeoutError";

      mockedApiClient.post.mockRejectedValue(timeoutError);

      await expect(
        aiAPI.generateBio({
          petName: "Buddy",
          keywords: ["friendly"],
          tone: "playful",
          length: "medium",
          petType: "dog",
          age: 3,
          breed: "Golden Retriever",
        }),
      ).rejects.toThrow("Network timeout");
    });

    it("should handle 503 service unavailable errors", async () => {
      const serviceError = new Error("Service Unavailable");
      (serviceError as any).response = { status: 503 };

      mockedApiClient.post.mockRejectedValue(serviceError);

      await expect(aiAPI.analyzePhotos(["photo1-uri"])).rejects.toThrow(
        "Service Unavailable",
      );
    });

    it("should handle malformed response data", async () => {
      const mockResponse = {
        success: true,
        data: null, // Malformed response
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      await expect(
        aiAPI.generateBio({
          petName: "Buddy",
          keywords: ["friendly"],
          tone: "playful",
          length: "medium",
          petType: "dog",
          age: 3,
          breed: "Golden Retriever",
        }),
      ).rejects.toThrow("Failed to generate bio");
    });
  });

  describe("Data Validation", () => {
    it("should handle empty keywords array", async () => {
      const mockResponse = {
        success: true,
        data: {
          bio: "Generated bio",
          keywords: [],
          sentiment: { score: 0.8, label: "positive" },
          matchScore: 80,
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiAPI.generateBio({
        petName: "Buddy",
        keywords: [], // Empty array
        tone: "playful",
        length: "medium",
        petType: "dog",
        age: 3,
        breed: "Golden Retriever",
      });

      expect(result.keywords).toEqual([]);
    });

    it("should handle missing optional parameters", async () => {
      const mockResponse = {
        success: true,
        data: {
          bio: "Generated bio",
          keywords: ["friendly"],
          sentiment: { score: 0.8, label: "positive" },
          matchScore: 80,
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await aiAPI.generateBio({
        petName: "Buddy",
        keywords: ["friendly"],
        // Missing optional parameters
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith("/ai/generate-bio", {
        petName: "Buddy",
        keywords: ["friendly"],
      });

      expect(result).toEqual(mockResponse.data);
    });
  });
});
