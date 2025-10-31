/**
 * Swipe Premium Service (Mobile)
 * Phase 2 Product Enhancement - Premium swipe features
 */

import type {
  SwipePremiumUsageResponse,
  SwipePremiumUsage,
} from '@pawfectmatch/core/types/phase2-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';

class SwipePremiumService {
  /**
   * Get premium usage for the current user
   */
  async getUsage(): Promise<SwipePremiumUsage> {
    try {
      const response = await api.request<SwipePremiumUsageResponse>(
        '/swipe/premium/usage',
        {
          method: 'GET',
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get premium usage');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to get premium usage', { error });
      throw error;
    }
  }

  /**
   * Use rewind feature
   */
  async useRewind(petId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.request<{ success: boolean; error?: string }>(
        '/swipe/premium/rewind',
        {
          method: 'POST',
          body: JSON.stringify({ petId }),
        }
      );

      return response;
    } catch (error) {
      logger.error('Failed to use rewind', { error, petId });
      throw error;
    }
  }

  /**
   * Use super like feature
   */
  async useSuperLike(matchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.request<{ success: boolean; error?: string }>(
        '/swipe/premium/super-like',
        {
          method: 'POST',
          body: JSON.stringify({ matchId }),
        }
      );

      return response;
    } catch (error) {
      logger.error('Failed to use super like', { error, matchId });
      throw error;
    }
  }

  /**
   * Activate profile boost
   */
  async activateBoost(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.request<{ success: boolean; error?: string }>(
        '/swipe/premium/boost',
        {
          method: 'POST',
        }
      );

      return response;
    } catch (error) {
      logger.error('Failed to activate boost', { error });
      throw error;
    }
  }
}

export const swipePremiumService = new SwipePremiumService();
export default swipePremiumService;

