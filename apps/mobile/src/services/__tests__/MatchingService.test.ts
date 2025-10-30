/**
 * Matching Service Tests
 * Tests pet matching logic, recommendations, and swipe actions
 */

import { MatchingService } from '../MatchingService';

// Mock the API
jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { api } from '../api';

const mockApi = api as jest.Mocked<typeof api>;

describe('MatchingService', () => {
  let matchingService: MatchingService;

  beforeEach(() => {
    matchingService = new MatchingService();
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should get recommendations without filters', async () => {
      const mockRecommendations = [
        {
          pet: {
            id: 'pet1',
            name: 'Buddy',
            species: 'Dog',
            breed: 'Golden Retriever',
            age: 2,
            size: 'large',
            personalityTags: ['friendly', 'energetic'],
            intent: 'friendship',
            photos: ['photo1.jpg'],
            ownerId: 'user1',
          },
          compatibilityScore: 85,
          reasons: ['Similar energy levels', 'Compatible personalities'],
          distance: 5.2,
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockRecommendations });

      const result = await matchingService.getRecommendations();

      expect(mockApi.get).toHaveBeenCalledWith('/matching/recommendations');
      expect(result).toEqual(mockRecommendations);
    });

    it('should get recommendations with filters', async () => {
      const filters = {
        species: 'Dog',
        minAge: 1,
        maxAge: 5,
        size: 'medium',
        intent: 'friendship',
        distance: 10,
      };

      const mockRecommendations = [
        {
          pet: {
            id: 'pet2',
            name: 'Max',
            species: 'Dog',
            breed: 'Labrador',
            age: 3,
            size: 'medium',
            personalityTags: ['playful', 'loyal'],
            intent: 'friendship',
            photos: ['photo2.jpg'],
            ownerId: 'user2',
          },
          compatibilityScore: 92,
          reasons: ['Perfect match!', 'Shared interests'],
          distance: 3.1,
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockRecommendations });

      const result = await matchingService.getRecommendations(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/matching/recommendations', {
        params: filters,
      });
      expect(result).toEqual(mockRecommendations);
    });

    it('should handle empty recommendations', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await matchingService.getRecommendations();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      mockApi.get.mockRejectedValue(mockError);

      await expect(matchingService.getRecommendations()).rejects.toThrow('Network error');
    });
  });

  describe('recordSwipe', () => {
    it('should record like action successfully', async () => {
      const swipeAction = {
        petId: 'pet123',
        action: 'like' as const,
        timestamp: Date.now(),
      };

      const mockResponse = {
        success: true,
        match: {
          id: 'match123',
          pet1Id: 'currentPet',
          pet2Id: 'pet123',
          compatibilityScore: 88,
          createdAt: new Date().toISOString(),
        },
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await matchingService.recordSwipe(swipeAction);

      expect(mockApi.post).toHaveBeenCalledWith('/matching/swipe', {
        petId: 'pet123',
        action: 'like',
        timestamp: swipeAction.timestamp,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should record pass action successfully', async () => {
      const swipeAction = {
        petId: 'pet456',
        action: 'pass' as const,
        timestamp: Date.now(),
      };

      const mockResponse = {
        success: true,
        match: null, // No match for pass action
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await matchingService.recordSwipe(swipeAction);

      expect(mockApi.post).toHaveBeenCalledWith('/matching/swipe', {
        petId: 'pet456',
        action: 'pass',
        timestamp: swipeAction.timestamp,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should record superlike action successfully', async () => {
      const swipeAction = {
        petId: 'pet789',
        action: 'superlike' as const,
        timestamp: Date.now(),
      };

      const mockResponse = {
        success: true,
        match: {
          id: 'match456',
          pet1Id: 'currentPet',
          pet2Id: 'pet789',
          compatibilityScore: 95,
          createdAt: new Date().toISOString(),
        },
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await matchingService.recordSwipe(swipeAction);

      expect(mockApi.post).toHaveBeenCalledWith('/matching/swipe', {
        petId: 'pet789',
        action: 'superlike',
        timestamp: swipeAction.timestamp,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle swipe recording errors', async () => {
      const swipeAction = {
        petId: 'pet999',
        action: 'like' as const,
        timestamp: Date.now(),
      };

      const mockError = new Error('Invalid pet ID');
      mockApi.post.mockRejectedValue(mockError);

      await expect(matchingService.recordSwipe(swipeAction)).rejects.toThrow('Invalid pet ID');
    });
  });

  describe('getMatches', () => {
    it('should get user matches successfully', async () => {
      const mockMatches = [
        {
          id: 'match1',
          pet1: {
            id: 'pet1',
            name: 'Buddy',
            photos: ['buddy1.jpg'],
          },
          pet2: {
            id: 'pet2',
            name: 'Luna',
            photos: ['luna1.jpg'],
          },
          compatibilityScore: 87,
          createdAt: '2024-01-15T10:30:00Z',
          lastMessage: {
            text: 'Hey! Want to meet up?',
            timestamp: '2024-01-15T11:00:00Z',
            senderId: 'user1',
          },
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockMatches });

      const result = await matchingService.getMatches();

      expect(mockApi.get).toHaveBeenCalledWith('/matching/matches');
      expect(result).toEqual(mockMatches);
    });

    it('should handle empty matches list', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await matchingService.getMatches();

      expect(result).toEqual([]);
    });

    it('should handle matches API errors', async () => {
      const mockError = new Error('Failed to load matches');
      mockApi.get.mockRejectedValue(mockError);

      await expect(matchingService.getMatches()).rejects.toThrow('Failed to load matches');
    });
  });

  describe('getCompatibilityScore', () => {
    it('should calculate compatibility between two pets', async () => {
      const pet1Id = 'pet1';
      const pet2Id = 'pet2';

      const mockCompatibility = {
        score: 78,
        reasons: ['Similar energy levels', 'Compatible sizes', 'Shared personality traits'],
        breakdown: {
          personalityMatch: 80,
          sizeCompatibility: 85,
          ageDifference: 70,
          intentAlignment: 75,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockCompatibility });

      const result = await matchingService.getCompatibilityScore(pet1Id, pet2Id);

      expect(mockApi.get).toHaveBeenCalledWith(`/matching/compatibility/${pet1Id}/${pet2Id}`);
      expect(result).toEqual(mockCompatibility);
    });

    it('should handle compatibility calculation errors', async () => {
      const mockError = new Error('Pets not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(matchingService.getCompatibilityScore('invalid1', 'invalid2')).rejects.toThrow(
        'Pets not found',
      );
    });
  });

  describe('updateFilters', () => {
    it('should update user matching filters', async () => {
      const filters = {
        species: 'Dog',
        minAge: 1,
        maxAge: 7,
        size: 'medium',
        intent: 'friendship',
        distance: 25,
        breed: 'Golden Retriever',
      };

      const mockResponse = {
        success: true,
        filters: { ...filters, userId: 'currentUser' },
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await matchingService.updateFilters(filters);

      expect(mockApi.post).toHaveBeenCalledWith('/matching/filters', filters);
      expect(result).toEqual(mockResponse);
    });

    it('should handle filter update errors', async () => {
      const filters = { species: 'Invalid' };
      const mockError = new Error('Invalid species filter');
      mockApi.post.mockRejectedValue(mockError);

      await expect(matchingService.updateFilters(filters)).rejects.toThrow(
        'Invalid species filter',
      );
    });
  });

  describe('getFilterOptions', () => {
    it('should get available filter options', async () => {
      const mockOptions = {
        species: ['Dog', 'Cat', 'Bird', 'Rabbit'],
        sizes: ['small', 'medium', 'large'],
        intents: ['friendship', 'dating', 'breeding'],
        breeds: ['Golden Retriever', 'Labrador', 'Poodle'],
        maxDistance: 100,
      };

      mockApi.get.mockResolvedValue({ data: mockOptions });

      const result = await matchingService.getFilterOptions();

      expect(mockApi.get).toHaveBeenCalledWith('/matching/filter-options');
      expect(result).toEqual(mockOptions);
    });

    it('should handle filter options fetch errors', async () => {
      const mockError = new Error('Service unavailable');
      mockApi.get.mockRejectedValue(mockError);

      await expect(matchingService.getFilterOptions()).rejects.toThrow('Service unavailable');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete matching workflow', async () => {
      // Mock recommendations
      const mockRecommendations = [
        {
          pet: { id: 'pet1', name: 'Buddy' },
          compatibilityScore: 85,
          reasons: ['Great match!'],
        },
      ];
      mockApi.get.mockResolvedValueOnce({ data: mockRecommendations });

      // Mock successful swipe
      const mockSwipeResult = {
        success: true,
        match: { id: 'match1', compatibilityScore: 85 },
      };
      mockApi.post.mockResolvedValueOnce({ data: mockSwipeResult });

      // Execute workflow
      const recommendations = await matchingService.getRecommendations();
      expect(recommendations).toHaveLength(1);

      const swipeResult = await matchingService.recordSwipe({
        petId: 'pet1',
        action: 'like',
        timestamp: Date.now(),
      });
      expect(swipeResult.success).toBe(true);
      expect(swipeResult.match).toBeDefined();
    });

    it('should handle filter and recommendation workflow', async () => {
      // Mock filter update
      mockApi.post.mockResolvedValueOnce({ data: { success: true } });

      // Mock filtered recommendations
      const mockFilteredRecs = [
        {
          pet: { id: 'pet2', species: 'Dog', size: 'medium' },
          compatibilityScore: 90,
          reasons: ['Perfect size match'],
        },
      ];
      mockApi.get.mockResolvedValueOnce({ data: mockFilteredRecs });

      // Execute workflow
      const filters = { species: 'Dog', size: 'medium' };
      await matchingService.updateFilters(filters);

      const recommendations = await matchingService.getRecommendations(filters);
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].pet.species).toBe('Dog');
    });
  });
});
