/**
 * Personalized Dashboard Service (Mobile)
 * Phase 1 Product Enhancement - Home Screen
 */

import type {
  PersonalizedDashboardData,
  PersonalizedDashboardResponse,
} from '@pawfectmatch/core/types/phase1-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';

class PersonalizedDashboardService {
  /**
   * Get personalized dashboard data
   */
  async getDashboard(): Promise<PersonalizedDashboardData> {
    try {
      const response = await api.request<PersonalizedDashboardResponse>(
        '/home/dashboard',
        {
          method: 'GET',
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load dashboard');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Failed to get personalized dashboard', { error });
      throw error;
    }
  }
}

export const personalizedDashboardService = new PersonalizedDashboardService();
export default personalizedDashboardService;

