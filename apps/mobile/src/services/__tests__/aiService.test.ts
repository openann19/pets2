/**
 * Comprehensive tests for AIService
 *
 * Coverage:
 * - Bio generation with various parameters and tones
 * - Photo analysis and scoring
 * - Compatibility computation between pets
 * - Error handling and validation
 * - AI service reliability and edge cases
 * - Parameter validation and constraints
 * - Response format validation
 * - Performance and timeout handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
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
}));

import { request } from '../api';

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBio', () => {
    it('should generate a bio with minimal parameters', async () => {
      const params: BioGenerationParams = {
        petName: 'Buddy',
        keywords: ['friendly', 'playful', 'energetic'],
      };

      const mockResponse = {
        bio: 'Meet Buddy, a friendly and playful pup who loves to run and play all day!',
        keywords: ['friendly', 'playful', 'energetic'],
        sentiment: { score: 0.8, label: 'positive' },
        matchScore: 0.85,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(params);

      expect(mockRequest).toHaveBeenCalledWith('/ai/generate-bio', {
        method: 'POST',
        body: params,
      });
      expect(result).toBe('Meet Buddy, a friendly and playful pup who loves to run and play all day!');
    });

    it('should generate a bio with all parameters', async () => {
      const params: BioGenerationParams = {
        petName: 'Luna',
        keywords: ['cuddly', 'gentle', 'indoor'],
        tone: 'professional',
        length: 'long',
        petType: 'cat',
        age: 3,
        breed: 'Persian',
      };

      const mockResponse = {
        bio: 'Luna is a three-year-old Persian cat who embodies gentleness and affection. As a professional companion, she enjoys quiet indoor activities and provides the perfect cuddly presence for those seeking a serene pet experience. Her gentle nature makes her an ideal match for families or individuals looking for a calm and loving feline friend.',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(params);

      expect(result).toBe(mockResponse.bio);
      expect(mockRequest).toHaveBeenCalledWith('/ai/generate-bio', {
        method: 'POST',
        body: params,
      });
    });

    it('should handle different tones', async () => {
      const tones: Array<'playful' | 'professional' | 'casual' | 'romantic' | 'funny'> = [
        'playful', 'professional', 'casual', 'romantic', 'funny'
      ];

      for (const tone of tones) {
        const params: BioGenerationParams = {
          petName: 'TestPet',
          keywords: ['test'],
          tone,
        };

        const mockResponse = { bio: `Bio in ${tone} tone` };
        mockRequest.mockResolvedValueOnce(mockResponse);

        const result = await generateBio(params);
        expect(result).toBe(`Bio in ${tone} tone`);
      }
    });

    it('should handle different lengths', async () => {
      const lengths: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];

      for (const length of lengths) {
        const params: BioGenerationParams = {
          petName: 'TestPet',
          keywords: ['test'],
          length,
        };

        const mockResponse = { bio: `Bio with ${length} length` };
        mockRequest.mockResolvedValueOnce(mockResponse);

        const result = await generateBio(params);
        expect(result).toBe(`Bio with ${length} length`);
      }
    });

    it('should validate required parameters', async () => {
      // Missing petName
      await expect(generateBio({
        petName: '',
        keywords: ['test'],
      } as any)).rejects.toThrow();

      // Missing keywords
      await expect(generateBio({
        petName: 'Test',
        keywords: [],
      } as any)).rejects.toThrow();

      // Empty keywords
      await expect(generateBio({
        petName: 'Test',
        keywords: [''],
      } as any)).rejects.toThrow();
    });

    it('should handle API errors gracefully', async () => {
      const params: BioGenerationParams = {
        petName: 'Buddy',
        keywords: ['friendly'],
      };

      mockRequest.mockRejectedValue(new Error('AI service unavailable'));

      await expect(generateBio(params)).rejects.toThrow('AI service unavailable');
    });

    it('should handle empty or whitespace-only keywords', async () => {
      const params: BioGenerationParams = {
        petName: 'Test',
        keywords: ['  ', '', 'valid'],
      };

      const mockResponse = { bio: 'Test bio' };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(params);
      expect(result).toBe('Test bio');
    });

    it('should handle special characters in pet names and keywords', async () => {
      const params: BioGenerationParams = {
        petName: 'Fluffy 🐱',
        keywords: ['cuddly', 'purr-fect', 'feline-friend'],
      };

      const mockResponse = { bio: 'Special character bio' };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(params);
      expect(result).toBe('Special character bio');
    });

    it('should handle very long inputs', async () => {
      const params: BioGenerationParams = {
        petName: 'A'.repeat(100), // Very long name
        keywords: Array.from({ length: 50 }, (_, i) => `keyword${i}`.repeat(10)), // Many long keywords
        tone: 'professional',
        length: 'long',
      };

      const mockResponse = { bio: 'Long input bio' };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(params);
      expect(result).toBe('Long input bio');
    });
  });

  describe('analyzePhoto', () => {
    it('should analyze a photo successfully', async () => {
      const photoUrl = 'https://example.com/photo.jpg';
      const mockResponse: PhotoAnalysisResult = {
        labels: ['dog', 'golden retriever', 'outdoor'],
        lighting: 0.85,
        sharpness: 0.92,
        score: 0.88,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await analyzePhoto(photoUrl);

      expect(mockRequest).toHaveBeenCalledWith('/ai/analyze-photo', {
        method: 'POST',
        body: { url: photoUrl },
      });
      expect(result).toEqual(mockResponse);
      expect(result.labels).toContain('dog');
      expect(result.score).toBe(0.88);
    });

    it('should handle different photo URLs', async () => {
      const urls = [
        'https://cdn.example.com/photo1.jpg',
        'http://localhost:3000/uploads/photo2.png',
        'https://storage.googleapis.com/bucket/photo3.jpeg',
      ];

      for (const url of urls) {
        const mockResponse: PhotoAnalysisResult = {
          labels: ['pet'],
          lighting: 0.8,
          sharpness: 0.9,
          score: 0.85,
        };

        mockRequest.mockResolvedValueOnce(mockResponse);

        const result = await analyzePhoto(url);
        expect(result.score).toBe(0.85);
      }
    });

    it('should handle analysis with no labels', async () => {
      const mockResponse: PhotoAnalysisResult = {
        labels: [],
        lighting: 0.5,
        sharpness: 0.6,
        score: 0.3,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await analyzePhoto('test-url');

      expect(result.labels).toHaveLength(0);
      expect(result.score).toBe(0.3);
    });

    it('should handle API errors during photo analysis', async () => {
      mockRequest.mockRejectedValue(new Error('Photo analysis failed'));

      await expect(analyzePhoto('invalid-url')).rejects.toThrow('Photo analysis failed');
    });

    it('should validate photo URL format', async () => {
      // Should handle various URL formats
      const urls = [
        'https://example.com/photo.jpg',
        'http://example.com/photo.png',
        '//example.com/photo.jpeg',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ',
      ];

      for (const url of urls) {
        const mockResponse: PhotoAnalysisResult = {
          labels: ['test'],
          lighting: 0.8,
          sharpness: 0.9,
          score: 0.8,
        };

        mockRequest.mockResolvedValueOnce(mockResponse);

        const result = await analyzePhoto(url);
        expect(result.labels).toContain('test');
      }
    });

    it('should handle extreme analysis scores', async () => {
      const extremeResults: PhotoAnalysisResult[] = [
        { labels: ['perfect'], lighting: 1.0, sharpness: 1.0, score: 1.0 }, // Perfect
        { labels: ['poor'], lighting: 0.0, sharpness: 0.0, score: 0.0 },   // Terrible
        { labels: ['average'], lighting: 0.5, sharpness: 0.5, score: 0.5 }, // Average
      ];

      for (const result of extremeResults) {
        mockRequest.mockResolvedValueOnce(result);

        const analysis = await analyzePhoto('test-url');
        expect(analysis.score).toBe(result.score);
        expect(analysis.lighting).toBe(result.lighting);
        expect(analysis.sharpness).toBe(result.sharpness);
      }
    });

    it('should handle analysis with many labels', async () => {
      const manyLabels = Array.from({ length: 100 }, (_, i) => `label${i}`);
      const mockResponse: PhotoAnalysisResult = {
        labels: manyLabels,
        lighting: 0.8,
        sharpness: 0.9,
        score: 0.85,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await analyzePhoto('test-url');

      expect(result.labels).toHaveLength(100);
      expect(result.labels[0]).toBe('label0');
      expect(result.labels[99]).toBe('label99');
    });
  });

  describe('computeCompatibility', () => {
    it('should compute compatibility between two pets', async () => {
      const petA = {
        id: 'pet1',
        breed: 'Golden Retriever',
        size: 'large',
        energy: 'high',
        age: 3,
        traits: ['friendly', 'playful'],
      };

      const petB = {
        id: 'pet2',
        breed: 'Labrador',
        size: 'large',
        energy: 'high',
        age: 2,
        traits: ['friendly', 'outgoing'],
      };

      const mockResponse: CompatibilityResult = {
        score: 0.92,
        breakdown: {
          breed: 0.95,
          size: 1.0,
          energy: 1.0,
          age: 0.8,
          traits: 0.9,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await computeCompatibility(petA, petB);

      expect(mockRequest).toHaveBeenCalledWith('/ai/compatibility', {
        method: 'POST',
        body: { a: petA, b: petB },
      });
      expect(result).toEqual(mockResponse);
      expect(result.score).toBe(0.92);
    });

    it('should handle perfect compatibility', async () => {
      const mockResponse: CompatibilityResult = {
        score: 1.0,
        breakdown: {
          breed: 1.0,
          size: 1.0,
          energy: 1.0,
          age: 1.0,
          traits: 1.0,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await computeCompatibility({}, {});

      expect(result.score).toBe(1.0);
      expect(result.breakdown.breed).toBe(1.0);
    });

    it('should handle zero compatibility', async () => {
      const mockResponse: CompatibilityResult = {
        score: 0.0,
        breakdown: {
          breed: 0.0,
          size: 0.0,
          energy: 0.0,
          age: 0.0,
          traits: 0.0,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await computeCompatibility({}, {});

      expect(result.score).toBe(0.0);
    });

    it('should handle complex pet data structures', async () => {
      const complexPetA = {
        basic: { name: 'Buddy', age: 3 },
        physical: { breed: 'Golden Retriever', size: 'large', weight: 30 },
        behavioral: { energy: 'high', temperament: 'friendly' },
        health: { vaccinated: true, neutered: true },
        preferences: { indoor: false, kids: true },
        history: { adopted: true, previousOwners: 1 },
      };

      const complexPetB = {
        basic: { name: 'Luna', age: 2 },
        physical: { breed: 'Labrador', size: 'large', weight: 28 },
        behavioral: { energy: 'high', temperament: 'playful' },
        health: { vaccinated: true, spayed: true },
        preferences: { indoor: false, kids: true },
        history: { adopted: true, previousOwners: 0 },
      };

      const mockResponse: CompatibilityResult = {
        score: 0.88,
        breakdown: {
          breed: 0.9,
          size: 1.0,
          energy: 1.0,
          age: 0.7,
          traits: 0.85,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await computeCompatibility(complexPetA, complexPetB);

      expect(result.score).toBe(0.88);
      expect(result.breakdown.size).toBe(1.0);
    });

    it('should handle API errors during compatibility computation', async () => {
      mockRequest.mockRejectedValue(new Error('Compatibility computation failed'));

      await expect(computeCompatibility({}, {})).rejects.toThrow('Compatibility computation failed');
    });

    it('should handle empty pet objects', async () => {
      const mockResponse: CompatibilityResult = {
        score: 0.5,
        breakdown: {
          breed: 0.5,
          size: 0.5,
          energy: 0.5,
          age: 0.5,
          traits: 0.5,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await computeCompatibility({}, {});

      expect(result.score).toBe(0.5);
    });

    it('should handle pets with conflicting traits', async () => {
      const aggressivePet = {
        temperament: 'aggressive',
        energy: 'very_high',
        size: 'large',
      };

      const timidPet = {
        temperament: 'timid',
        energy: 'low',
        size: 'small',
      };

      const mockResponse: CompatibilityResult = {
        score: 0.2,
        breakdown: {
          breed: 0.3,
          size: 0.1,
          energy: 0.0,
          age: 0.5,
          traits: 0.1,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await computeCompatibility(aggressivePet, timidPet);

      expect(result.score).toBe(0.2);
      expect(result.breakdown.energy).toBe(0.0);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network timeouts', async () => {
      mockRequest.mockRejectedValue(new Error('Request timeout'));

      await expect(generateBio({ petName: 'Test', keywords: ['test'] })).rejects.toThrow('Request timeout');
    });

    it('should handle service unavailability', async () => {
      mockRequest.mockRejectedValue(new Error('AI service is temporarily unavailable'));

      await expect(analyzePhoto('test-url')).rejects.toThrow('AI service is temporarily unavailable');
    });

    it('should handle rate limiting', async () => {
      mockRequest.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(computeCompatibility({}, {})).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle malformed API responses', async () => {
      mockRequest.mockResolvedValue('invalid response');

      const result = await generateBio({ petName: 'Test', keywords: ['test'] });
      expect(result).toBeUndefined();
    });

    it('should handle responses with missing fields', async () => {
      const incompleteResponse = { labels: ['dog'] }; // Missing other fields
      mockRequest.mockResolvedValue(incompleteResponse);

      const result = await analyzePhoto('test-url');
      expect(result.labels).toEqual(['dog']);
      expect(result.score).toBeUndefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent bio generations', async () => {
      const bioPromises = [
        generateBio({ petName: 'Buddy', keywords: ['friendly'] }),
        generateBio({ petName: 'Luna', keywords: ['playful'] }),
        generateBio({ petName: 'Max', keywords: ['energetic'] }),
      ];

      const mockResponses = [
        { bio: 'Buddy bio' },
        { bio: 'Luna bio' },
        { bio: 'Max bio' },
      ];

      mockResponses.forEach(response => {
        mockRequest.mockResolvedValueOnce(response);
      });

      const results = await Promise.all(bioPromises);

      expect(results).toEqual(['Buddy bio', 'Luna bio', 'Max bio']);
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed concurrent operations', async () => {
      const operations = [
        generateBio({ petName: 'Test', keywords: ['test'] }),
        analyzePhoto('photo1.jpg'),
        computeCompatibility({ id: 'pet1' }, { id: 'pet2' }),
        generateBio({ petName: 'Test2', keywords: ['test2'] }),
      ];

      const mockResponses = [
        { bio: 'Bio 1' },
        { labels: ['pet'], lighting: 0.8, sharpness: 0.9, score: 0.85 },
        { score: 0.9, breakdown: { breed: 0.9, size: 0.9, energy: 0.9, age: 0.9, traits: 0.9 } },
        { bio: 'Bio 2' },
      ];

      mockResponses.forEach(response => {
        mockRequest.mockResolvedValueOnce(response);
      });

      const results = await Promise.all(operations);

      expect(results).toHaveLength(4);
      expect(results[0]).toBe('Bio 1');
      expect(results[1].score).toBe(0.85);
      expect(results[2].score).toBe(0.9);
      expect(results[3]).toBe('Bio 2');
    });

    it('should handle partial failures in concurrent operations', async () => {
      const operations = [
        generateBio({ petName: 'Success', keywords: ['test'] }),
        generateBio({ petName: 'Fail', keywords: ['test'] }),
        generateBio({ petName: 'Success2', keywords: ['test'] }),
      ];

      mockRequest.mockResolvedValueOnce({ bio: 'Success bio' });
      mockRequest.mockRejectedValueOnce(new Error('AI failed'));
      mockRequest.mockResolvedValueOnce({ bio: 'Success2 bio' });

      const results = await Promise.allSettled(operations);

      expect(results[0].status).toBe('fulfilled');
      expect((results[0] as any).value).toBe('Success bio');

      expect(results[1].status).toBe('rejected');
      expect((results[1] as any).reason.message).toBe('AI failed');

      expect(results[2].status).toBe('fulfilled');
      expect((results[2] as any).value).toBe('Success2 bio');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extreme parameter values', async () => {
      const extremeParams: BioGenerationParams = {
        petName: 'A'.repeat(1000), // Very long name
        keywords: Array.from({ length: 100 }, () => 'A'.repeat(100)), // Many long keywords
        tone: 'professional',
        length: 'long',
        petType: 'A'.repeat(500), // Very long type
        age: 999, // Very old age
        breed: 'A'.repeat(300), // Very long breed
      };

      const mockResponse = { bio: 'Extreme bio' };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(extremeParams);
      expect(result).toBe('Extreme bio');
    });

    it('should handle unicode and special characters', async () => {
      const unicodeParams: BioGenerationParams = {
        petName: 'Fluffy 🐱',
        keywords: ['可愛い', 'フレンドリー', '遊び好き 🚀'],
      };

      const mockResponse = { bio: 'Unicode bio with 🐱 and 🚀' };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(unicodeParams);
      expect(result).toContain('🐱');
    });

    it('should handle zero and negative values', async () => {
      const zeroParams: BioGenerationParams = {
        petName: 'Test',
        keywords: ['test'],
        age: 0, // Newborn
      };

      const negativeParams: BioGenerationParams = {
        petName: 'Test',
        keywords: ['test'],
        age: -1, // Invalid but should handle
      };

      mockRequest.mockResolvedValueOnce({ bio: 'Zero age bio' });
      mockRequest.mockResolvedValueOnce({ bio: 'Negative age bio' });

      const result1 = await generateBio(zeroParams);
      const result2 = await generateBio(negativeParams);

      expect(result1).toBe('Zero age bio');
      expect(result2).toBe('Negative age bio');
    });

    it('should handle circular references in pet data', async () => {
      const petA: any = { id: 'pet1', name: 'Buddy' };
      const petB: any = { id: 'pet2', name: 'Luna' };
      petA.friend = petB;
      petB.friend = petA; // Circular reference

      const mockResponse: CompatibilityResult = {
        score: 0.8,
        breakdown: {
          breed: 0.8,
          size: 0.8,
          energy: 0.8,
          age: 0.8,
          traits: 0.8,
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await computeCompatibility(petA, petB);
      expect(result.score).toBe(0.8);
    });

    it('should handle very large photo URLs', async () => {
      const hugeUrl = 'https://example.com/' + 'a'.repeat(10000) + '.jpg';

      const mockResponse: PhotoAnalysisResult = {
        labels: ['large-url-pet'],
        lighting: 0.8,
        sharpness: 0.9,
        score: 0.85,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await analyzePhoto(hugeUrl);
      expect(result.labels).toContain('large-url-pet');
    });

    it('should handle rapid successive calls', async () => {
      const calls = Array.from({ length: 10 }, (_, i) =>
        generateBio({ petName: `Pet${i}`, keywords: [`keyword${i}`] })
      );

      calls.forEach((_, i) => {
        mockRequest.mockResolvedValueOnce({ bio: `Bio ${i}` });
      });

      const results = await Promise.all(calls);

      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result).toBe(`Bio ${i}`);
      });
    });
  });

  describe('Type Safety and Interface Compliance', () => {
    it('should maintain type safety for bio generation results', async () => {
      const params: BioGenerationParams = {
        petName: 'Test',
        keywords: ['test'],
        tone: 'playful',
        length: 'medium',
      };

      const result = await generateBio(params);
      expect(typeof result).toBe('string');
    });

    it('should maintain type safety for photo analysis results', async () => {
      const result = await analyzePhoto('test-url');

      expect(Array.isArray(result.labels)).toBe(true);
      expect(typeof result.lighting).toBe('number');
      expect(typeof result.sharpness).toBe('number');
      expect(typeof result.score).toBe('number');
    });

    it('should maintain type safety for compatibility results', async () => {
      const result = await computeCompatibility({}, {});

      expect(typeof result.score).toBe('number');
      expect(typeof result.breakdown).toBe('object');
      expect(typeof result.breakdown.breed).toBe('number');
      expect(typeof result.breakdown.size).toBe('number');
      expect(typeof result.breakdown.energy).toBe('number');
      expect(typeof result.breakdown.age).toBe('number');
      expect(typeof result.breakdown.traits).toBe('number');
    });

    it('should handle flexible parameter objects', async () => {
      const flexibleParams = {
        petName: 'Test',
        keywords: ['test'],
        customField: 'custom',
        extraData: { nested: true },
      } as BioGenerationParams & { customField: string; extraData: any };

      const mockResponse = { bio: 'Flexible bio' };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await generateBio(flexibleParams);
      expect(result).toBe('Flexible bio');
    });
  });
});
