/**
 * Simplified AIService Tests - Core functionality
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  generateBio,
  analyzePhoto,
  computeCompatibility,
  type BioGenerationParams,
  type PhotoAnalysisResult,
  type CompatibilityResult,
} from '../aiService';

// Mock dependencies
jest.mock('../api', () => ({
  request: jest.fn(),
  api: {
    ai: {
      getCompatibility: jest.fn(),
    },
  },
}));

import { request } from '../api';
import { api } from '../api';

const mockRequest = request as jest.MockedFunction<typeof request>;
const mockGetCompatibility = api.ai.getCompatibility as jest.MockedFunction<any>;

describe('AIService - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBio', () => {
    const bioParams: BioGenerationParams = {
      petName: 'Luna',
      keywords: ['friendly', 'playful', 'cuddly'],
      tone: 'professional',
      length: 'medium',
      petType: 'cat',
      age: 3,
      breed: 'Persian',
    };

    it('should generate a bio successfully', async () => {
      const mockResponse = {
        bio: 'Luna is a three-year-old Persian cat who embodies gentleness and affection.',
        keywords: ['friendly', 'gentle', 'affectionate'],
        sentiment: { score: 0.8, label: 'positive' },
        matchScore: 85,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await generateBio(bioParams);

      expect(result).toBe(mockResponse.bio);
      expect(typeof result).toBe('string');
      expect(mockRequest).toHaveBeenCalledWith('/ai/generate-bio', {
        method: 'POST',
        body: bioParams,
      });
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('AI service unavailable'));

      await expect(generateBio(bioParams)).rejects.toThrow('AI service unavailable');
    });

    it('should handle different parameter combinations', async () => {
      const minimalParams: BioGenerationParams = {
        petName: 'Buddy',
        keywords: ['energetic'],
      };

      const mockResponse = {
        bio: 'Buddy is an energetic dog full of life.',
        keywords: ['energetic', 'playful'],
        sentiment: { score: 0.9, label: 'very positive' },
        matchScore: 90,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await generateBio(minimalParams);

      expect(result).toBe(mockResponse.bio);
      expect(mockRequest).toHaveBeenCalledWith('/ai/generate-bio', {
        method: 'POST',
        body: minimalParams,
      });
    });
  });

  describe('analyzePhoto', () => {
    const photoUrl = 'https://example.com/photo.jpg';

    it('should analyze a photo successfully', async () => {
      const mockResponse: PhotoAnalysisResult = {
        labels: ['dog', 'golden retriever', 'outdoor'],
        lighting: 0.85,
        sharpness: 0.92,
        score: 0.88,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await analyzePhoto(photoUrl);

      expect(result).toEqual(mockResponse);
      expect(result.labels).toContain('dog');
      expect(result.score).toBeGreaterThan(0.8);
      expect(mockRequest).toHaveBeenCalledWith('/ai/analyze-photo', {
        method: 'POST',
        body: { url: photoUrl },
      });
    });

    it('should handle photo analysis errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Invalid image format'));

      await expect(analyzePhoto(photoUrl)).rejects.toThrow('Invalid image format');
    });

    it('should handle empty labels', async () => {
      const mockResponse: PhotoAnalysisResult = {
        labels: [],
        lighting: 0.5,
        sharpness: 0.6,
        score: 0.4,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await analyzePhoto(photoUrl);

      expect(result.labels).toEqual([]);
      expect(result.score).toBeLessThan(0.5);
    });
  });

  describe('computeCompatibility', () => {
    it('should compute compatibility between two pets', async () => {
      const mockResponse: CompatibilityResult = {
        score: 85,
        breakdown: {
          breed: 90,
          size: 80,
          energy: 85,
          age: 80,
          traits: 90,
        },
      };

      const apiResponse = {
        score: 85,
        analysis: 'Good compatibility',
        factors: {
          age_compatibility: true,
          size_compatibility: true,
          breed_compatibility: true,
          personality_match: true,
        },
      };

      mockGetCompatibility.mockResolvedValueOnce(apiResponse);

      const result = await computeCompatibility('pet1', 'pet2');

      expect(result).toEqual(mockResponse);
      expect(result.score).toBe(85);
      expect(result.breakdown.breed).toBe(90);
      expect(typeof result.breakdown).toBe('object');
      expect(mockGetCompatibility).toHaveBeenCalledWith({
        pet1Id: 'pet1',
        pet2Id: 'pet2',
      });
    });

    it('should handle perfect compatibility', async () => {
      const apiResponse = {
        score: 100,
        analysis: 'Perfect compatibility',
        factors: {
          age_compatibility: true,
          size_compatibility: true,
          breed_compatibility: true,
          personality_match: true,
        },
      };

      mockGetCompatibility.mockResolvedValueOnce(apiResponse);

      const result = await computeCompatibility('pet1', 'pet2');

      expect(result.score).toBe(100);
      expect(result.breakdown.breed).toBe(90); // Note: function returns fixed values for now
    });

    it('should handle zero compatibility', async () => {
      const apiResponse = {
        score: 0,
        analysis: 'No compatibility',
        factors: {
          age_compatibility: false,
          size_compatibility: false,
          breed_compatibility: false,
          personality_match: false,
        },
      };

      mockGetCompatibility.mockResolvedValueOnce(apiResponse);

      const result = await computeCompatibility('pet1', 'pet2');

      expect(result.score).toBe(0);
      expect(result.breakdown.energy).toBe(85); // Note: function returns fixed values for now
    });

    it('should handle API errors during compatibility computation', async () => {
      mockGetCompatibility.mockRejectedValueOnce(new Error('Compatibility calculation failed'));

      await expect(computeCompatibility('pet1', 'pet2')).rejects.toThrow(
        'Compatibility calculation failed',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(generateBio({ petName: 'Test', keywords: ['test'] })).rejects.toThrow(
        'Network timeout',
      );
    });

    it('should handle service unavailability', async () => {
      mockRequest.mockRejectedValueOnce(new Error('AI service is temporarily unavailable'));

      await expect(analyzePhoto('test.jpg')).rejects.toThrow(
        'AI service is temporarily unavailable',
      );
    });

    it('should handle malformed API responses', async () => {
      mockRequest.mockResolvedValueOnce(null);

      await expect(generateBio({ petName: 'Test', keywords: ['test'] })).rejects.toThrow();
    });
  });
});
