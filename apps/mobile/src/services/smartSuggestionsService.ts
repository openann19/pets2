/**
 * Smart Suggestions Service (Mobile)
 * Phase 2 Product Enhancement - AI-powered message suggestions
 */

import type {
  SmartSuggestionsRequest,
  SmartSuggestionsResponse,
} from '@pawfectmatch/core/types/phase2-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';

class SmartSuggestionsService {
  /**
   * Get smart suggestions for a conversation
   */
  async getSuggestions(request: SmartSuggestionsRequest): Promise<SmartSuggestionsResponse> {
    try {
      const response = await api.request<SmartSuggestionsResponse>(
        '/chat/suggestions',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to get suggestions');
      }

      return response;
    } catch (error) {
      logger.error('Failed to get smart suggestions', { error });
      throw error;
    }
  }
}

export const smartSuggestionsService = new SmartSuggestionsService();
export default smartSuggestionsService;

