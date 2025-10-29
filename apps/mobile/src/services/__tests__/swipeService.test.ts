/**
 * Comprehensive tests for Swipe Service
 *
 * Coverage:
 * - Like, pass, superlike functionality
 * - Rewind last swipe
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { likePet, passPet, superLikePet, rewindLast } from '../swipeService';
import { request } from '../api';
import type { Pet } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('../api', () => ({
  request: jest.fn(),
}));

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('Swipe Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Like Pet', () => {
    it('should like a pet successfully', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      const result = await likePet('pet123');

      expect(result).toEqual({ petId: 'pet123' });
      expect(mockRequest).toHaveBeenCalledWith(
        '/api/pets/like',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({ petId: 'pet123' }),
        }),
      );
    });

    it('should handle multiple pets', async () => {
      mockRequest.mockResolvedValue({ success: true });

      await likePet('pet1');
      await likePet('pet2');
      await likePet('pet3');

      expect(mockRequest).toHaveBeenCalledTimes(3);
      const calls = mockRequest.mock.calls;
      expect(calls[0]?.[1]?.body?.petId).toBe('pet1');
      expect(calls[1]?.[1]?.body?.petId).toBe('pet2');
      expect(calls[2]?.[1]?.body?.petId).toBe('pet3');
    });
  });

  describe('Happy Path - Pass Pet', () => {
    it('should pass a pet successfully', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      const result = await passPet('pet456');

      expect(result).toEqual({ petId: 'pet456' });
      expect(mockRequest).toHaveBeenCalledWith(
        '/api/pets/pass',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({ petId: 'pet456' }),
        }),
      );
    });

    it('should differentiate pass from like', async () => {
      mockRequest.mockResolvedValue({ success: true });

      await likePet('pet1');
      await passPet('pet2');

      const likeCall = mockRequest.mock.calls[0];
      const passCall = mockRequest.mock.calls[1];

      expect(likeCall?.[0]).toBe('/api/pets/like');
      expect(passCall?.[0]).toBe('/api/pets/pass');
    });
  });

  describe('Happy Path - Super Like Pet', () => {
    it('should super like a pet successfully', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      const result = await superLikePet('pet789');

      expect(result).toEqual({ petId: 'pet789' });
      expect(mockRequest).toHaveBeenCalledWith(
        '/api/pets/super-like',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({ petId: 'pet789' }),
        }),
      );
    });

    it('should differentiate super like from regular like', async () => {
      mockRequest.mockResolvedValue({ success: true });

      await likePet('pet1');
      await superLikePet('pet2');

      const likeCall = mockRequest.mock.calls[0];
      const superLikeCall = mockRequest.mock.calls[1];

      expect(likeCall?.[0]).toBe('/api/pets/like');
      expect(superLikeCall?.[0]).toBe('/api/pets/super-like');
    });
  });

  describe('Happy Path - Rewind Last', () => {
    it('should rewind last swipe successfully', async () => {
      const mockPet: Pet = {
        _id: 'pet123',
        id: 'pet123',
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        bio: 'A friendly dog',
        photos: ['photo1.jpg'],
        location: 'New York',
        distance: 5,
        compatibility: 95,
      };

      mockRequest.mockResolvedValueOnce({ restoredPet: mockPet });

      const result = await rewindLast();

      expect(result).toEqual(mockPet);
      expect(mockRequest).toHaveBeenCalledWith(
        '/api/swipe/rewind',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should return null when no pet to restore', async () => {
      mockRequest.mockResolvedValueOnce({ restoredPet: undefined });

      const result = await rewindLast();

      expect(result).toBeNull();
    });

    it('should return null on rewind error', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Rewind failed'));

      const result = await rewindLast();

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors for like', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Like failed'));

      await expect(likePet('pet123')).rejects.toThrow('Like failed');
    });

    it('should handle API errors for pass', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Pass failed'));

      await expect(passPet('pet123')).rejects.toThrow('Pass failed');
    });

    it('should handle API errors for super like', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Super like failed'));

      await expect(superLikePet('pet123')).rejects.toThrow('Super like failed');
    });

    it('should handle network errors', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      await expect(likePet('pet123')).rejects.toThrow('Network error');
      await expect(passPet('pet123')).rejects.toThrow('Network error');
      await expect(superLikePet('pet123')).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      mockRequest.mockRejectedValue(new Error('Timeout'));

      await expect(likePet('pet123')).rejects.toThrow('Timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pet ID', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      await likePet('');

      expect(mockRequest).toHaveBeenCalledWith(
        '/api/pets/like',
        expect.objectContaining({
          body: expect.objectContaining({ petId: '' }),
        }),
      );
    });

    it('should handle very long pet IDs', async () => {
      const longId = 'pet'.repeat(100);
      mockRequest.mockResolvedValueOnce({ success: true });

      await likePet(longId);

      expect(mockRequest).toHaveBeenCalled();
    });

    it('should handle concurrent likes', async () => {
      mockRequest.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 10)),
      );

      const promises = ['pet1', 'pet2', 'pet3'].map((id) => likePet(id));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid rewind requests', async () => {
      mockRequest.mockResolvedValueOnce({ restoredPet: null });

      const results = await Promise.all([rewindLast(), rewindLast(), rewindLast()]);

      expect(results.every((r) => r === null)).toBe(true);
    });

    it('should handle pet with missing fields', async () => {
      const partialPet = {
        _id: 'pet123',
        id: 'pet123',
        name: 'Max',
      } as Pet;

      mockRequest.mockResolvedValueOnce({ restoredPet: partialPet });

      const result = await rewindLast();

      expect(result).toEqual(partialPet);
    });
  });

  describe('Integration', () => {
    it('should work with API request service', async () => {
      mockRequest.mockResolvedValue({ success: true });

      await likePet('pet123');
      await passPet('pet456');
      await superLikePet('pet789');

      expect(mockRequest).toHaveBeenCalledTimes(3);
      expect(mockRequest).toHaveBeenNthCalledWith(
        1,
        '/api/pets/like',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(mockRequest).toHaveBeenNthCalledWith(
        2,
        '/api/pets/pass',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(mockRequest).toHaveBeenNthCalledWith(
        3,
        '/api/pets/super-like',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should maintain state across multiple operations', async () => {
      mockRequest.mockResolvedValue({ success: true });

      await likePet('pet1');
      await passPet('pet1'); // Same pet, different action
      await superLikePet('pet2');

      const calls = mockRequest.mock.calls;
      expect(calls[0]?.[0]).toBe('/api/pets/like');
      expect(calls[1]?.[0]).toBe('/api/pets/pass');
      expect(calls[2]?.[0]).toBe('/api/pets/super-like');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for like result', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      const result = await likePet('pet123');

      expect(typeof result.petId).toBe('string');
    });

    it('should maintain type safety for rewind result', async () => {
      const mockPet: Pet = {
        _id: 'pet123',
        id: 'pet123',
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        bio: 'A friendly dog',
        photos: ['photo1.jpg'],
        location: 'New York',
        distance: 5,
        compatibility: 95,
      };

      mockRequest.mockResolvedValueOnce({ restoredPet: mockPet });

      const result = await rewindLast();

      if (result) {
        expect(typeof result._id).toBe('string');
        expect(typeof result.name).toBe('string');
        expect(Array.isArray(result.photos)).toBe(true);
      }
    });

    it('should handle Pet type correctly', async () => {
      const completePet: Pet = {
        _id: 'pet123',
        id: 'pet123',
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        bio: 'A friendly dog',
        photos: ['photo1.jpg'],
        location: 'New York',
        distance: 5,
        compatibility: 95,
        isVerified: true,
        owner: {
          name: 'John',
          verified: true,
        },
        tags: ['friendly', 'playful'],
      };

      mockRequest.mockResolvedValueOnce({ restoredPet: completePet });

      const result = await rewindLast();

      if (result) {
        expect(result.isVerified).toBe(true);
        expect(result.owner).toBeDefined();
        expect(Array.isArray(result.tags)).toBe(true);
      }
    });
  });
});
