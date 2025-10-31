/**
 * Unit Tests for Personalized Dashboard Service
 * Phase 1 Product Enhancement
 */

import { personalizedDashboardService } from '../personalizedDashboardService';
import { api } from '../api';
import type { PersonalizedDashboardResponse } from '@pawfectmatch/core/types/phase1-contracts';

jest.mock('../api');

describe('PersonalizedDashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch and return dashboard data successfully', async () => {
      const mockDashboardData: PersonalizedDashboardResponse = {
        success: true,
        data: {
          recentlyViewedProfiles: [
            {
              id: '1',
              petId: 'pet1',
              petName: 'Luna',
              petPhoto: 'https://example.com/luna.jpg',
              viewedAt: new Date().toISOString(),
            },
          ],
          suggestedMatches: [
            {
              id: '2',
              petId: 'pet2',
              petName: 'Max',
              petPhoto: 'https://example.com/max.jpg',
              compatibilityScore: 85,
              reasons: ['Both are dogs', 'Similar size'],
              signals: {
                behavioral: 0.7,
                contentBased: 0.8,
                preferences: 0.85,
              },
            },
          ],
          activityInsights: {
            streakDays: 5,
            lastActivityAt: new Date().toISOString(),
            totalSwipes: 50,
            matchRate: 0.15,
            tips: ['Complete your profile'],
          },
          quickActions: [
            {
              id: 'swipe',
              label: 'Start Swiping',
              icon: 'heart',
              deeplink: 'pawfectmatch://swipe',
              priority: 10,
            },
          ],
        },
        timestamp: new Date().toISOString(),
      };

      (api.request as jest.Mock).mockResolvedValue(mockDashboardData);

      const result = await personalizedDashboardService.getDashboard();

      expect(api.request).toHaveBeenCalledWith('/home/dashboard', {
        method: 'GET',
      });
      expect(result).toEqual(mockDashboardData.data);
    });

    it('should throw error when API returns failure', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Failed to load dashboard',
      };

      (api.request as jest.Mock).mockResolvedValue(mockErrorResponse);

      await expect(personalizedDashboardService.getDashboard()).rejects.toThrow(
        'Failed to load dashboard'
      );
    });

    it('should throw error when API request fails', async () => {
      const error = new Error('Network error');
      (api.request as jest.Mock).mockRejectedValue(error);

      await expect(personalizedDashboardService.getDashboard()).rejects.toThrow('Network error');
    });

    it('should handle empty dashboard data', async () => {
      const mockEmptyResponse: PersonalizedDashboardResponse = {
        success: true,
        data: {
          recentlyViewedProfiles: [],
          suggestedMatches: [],
          activityInsights: {
            streakDays: 0,
            lastActivityAt: new Date().toISOString(),
            totalSwipes: 0,
            matchRate: 0,
            tips: [],
          },
          quickActions: [],
        },
        timestamp: new Date().toISOString(),
      };

      (api.request as jest.Mock).mockResolvedValue(mockEmptyResponse);

      const result = await personalizedDashboardService.getDashboard();

      expect(result.recentlyViewedProfiles).toEqual([]);
      expect(result.suggestedMatches).toEqual([]);
    });
  });
});

