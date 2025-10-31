/**
 * Unit Tests for Advanced Match Filter Service
 * Phase 1 Product Enhancement
 */

import { advancedMatchFilterService } from '../advancedMatchFilterService';
import { api } from '../api';
import type {
  AdvancedMatchFilter,
  MatchFilterResponse,
  MatchInsightsResponse,
} from '@pawfectmatch/core/types/phase1-contracts';

jest.mock('../api');

describe('AdvancedMatchFilterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('filterMatches', () => {
    it('should filter matches with basic parameters', async () => {
      const filter: AdvancedMatchFilter = {
        page: 1,
        limit: 20,
        sort: 'newest',
      };

      const mockResponse: MatchFilterResponse = {
        success: true,
        data: {
          matches: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false,
        },
      };

      (api.request as jest.Mock).mockResolvedValue(mockResponse);

      const result = await advancedMatchFilterService.filterMatches(filter);

      expect(api.request).toHaveBeenCalledWith('/matches/filter?page=1&limit=20&sort=newest', {
        method: 'GET',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should filter matches with distance parameters', async () => {
      const filter: AdvancedMatchFilter = {
        distance: {
          minKm: 0,
          maxKm: 10,
          userLocation: { lat: 40.7128, lng: -74.006 },
        },
      };

      const mockResponse: MatchFilterResponse = {
        success: true,
        data: {
          matches: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false,
        },
      };

      (api.request as jest.Mock).mockResolvedValue(mockResponse);

      await advancedMatchFilterService.filterMatches(filter);

      expect(api.request).toHaveBeenCalledWith(
        expect.stringContaining('minDistance=0&maxDistance=10&userLat=40.7128&userLng=-74.006'),
        { method: 'GET' }
      );
    });

    it('should filter matches with pet preferences', async () => {
      const filter: AdvancedMatchFilter = {
        petPreferences: {
          species: ['dog', 'cat'],
          sizes: ['medium', 'large'],
          energyLevels: ['high'],
        },
      };

      const mockResponse: MatchFilterResponse = {
        success: true,
        data: {
          matches: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false,
        },
      };

      (api.request as jest.Mock).mockResolvedValue(mockResponse);

      await advancedMatchFilterService.filterMatches(filter);

      const callArgs = (api.request as jest.Mock).mock.calls[0][0];
      expect(callArgs).toContain('species=dog%2Ccat');
      expect(callArgs).toContain('sizes=medium%2Clarge');
      expect(callArgs).toContain('energyLevels=high');
    });

    it('should handle API errors', async () => {
      const filter: AdvancedMatchFilter = { sort: 'newest' };
      const error = new Error('Filter failed');

      (api.request as jest.Mock).mockRejectedValue(error);

      await expect(advancedMatchFilterService.filterMatches(filter)).rejects.toThrow('Filter failed');
    });
  });

  describe('getMatchInsights', () => {
    it('should fetch match insights successfully', async () => {
      const matchId = 'match123';
      const mockResponse: MatchInsightsResponse = {
        success: true,
        data: {
          matchId,
          compatibilityScore: 85,
          reasons: ['Both are dogs', 'Similar size'],
          mutualInterests: ['playing fetch'],
          conversationStarters: ['Hi! Your dogs would get along great!'],
        },
      };

      (api.request as jest.Mock).mockResolvedValue(mockResponse);

      const result = await advancedMatchFilterService.getMatchInsights(matchId);

      expect(api.request).toHaveBeenCalledWith(`/matches/${matchId}/insights`, {
        method: 'GET',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const matchId = 'match123';
      const error = new Error('Failed to get insights');

      (api.request as jest.Mock).mockRejectedValue(error);

      await expect(advancedMatchFilterService.getMatchInsights(matchId)).rejects.toThrow(
        'Failed to get insights'
      );
    });
  });
});

