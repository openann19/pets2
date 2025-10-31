/**
 * Advanced Match Filter Service (Mobile)
 * Phase 1 Product Enhancement - Matches Screen
 */

import type {
  AdvancedMatchFilter,
  MatchFilterResponse,
  MatchInsightsResponse,
} from '@pawfectmatch/core/types/phase1-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';

class AdvancedMatchFilterService {
  /**
   * Filter matches with advanced options
   */
  async filterMatches(filter: AdvancedMatchFilter): Promise<MatchFilterResponse['data']> {
    try {
      // Build query params
      const params: Record<string, string> = {};
      
      if (filter.page) params.page = String(filter.page);
      if (filter.limit) params.limit = String(filter.limit);
      if (filter.sort) params.sort = filter.sort;
      if (filter.search) params.search = filter.search;
      
      // Distance params
      if (filter.distance) {
        if (filter.distance.minKm) params.minDistance = String(filter.distance.minKm);
        if (filter.distance.maxKm) params.maxDistance = String(filter.distance.maxKm);
        if (filter.distance.userLocation) {
          params.userLat = String(filter.distance.userLocation.lat);
          params.userLng = String(filter.distance.userLocation.lng);
        }
      }
      
      // Age params
      if (filter.age) {
        if (filter.age.min) params.minAge = String(filter.age.min);
        if (filter.age.max) params.maxAge = String(filter.age.max);
      }
      
      // Pet preferences params
      if (filter.petPreferences) {
        if (filter.petPreferences.species?.length) {
          params.species = filter.petPreferences.species.join(',');
        }
        if (filter.petPreferences.breeds?.length) {
          params.breeds = filter.petPreferences.breeds.join(',');
        }
        if (filter.petPreferences.sizes?.length) {
          params.sizes = filter.petPreferences.sizes.join(',');
        }
        if (filter.petPreferences.energyLevels?.length) {
          params.energyLevels = filter.petPreferences.energyLevels.join(',');
        }
        if (filter.petPreferences.genders?.length) {
          params.genders = filter.petPreferences.genders.join(',');
        }
      }
      
      // Activity status
      if (filter.activityStatus) {
        params.activityStatus = filter.activityStatus;
      }

      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/matches/filter${queryString ? `?${queryString}` : ''}`;

      const response = await api.request<MatchFilterResponse>(endpoint, {
        method: 'GET',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to filter matches');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Failed to filter matches', { error, filter });
      throw error;
    }
  }

  /**
   * Get match insights (compatibility analysis)
   */
  async getMatchInsights(matchId: string): Promise<MatchInsightsResponse['data']> {
    try {
      const response = await api.request<MatchInsightsResponse>(
        `/matches/${matchId}/insights`,
        {
          method: 'GET',
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get match insights');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Failed to get match insights', { error, matchId });
      throw error;
    }
  }
}

export const advancedMatchFilterService = new AdvancedMatchFilterService();
export default advancedMatchFilterService;

