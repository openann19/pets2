/**
 * Translation Service (Mobile)
 * Phase 2 Product Enhancement - Chat Translation
 */

import type {
  TranslationRequest,
  TranslationResponse,
  Translation,
} from '@pawfectmatch/core/types/phase2-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';

class TranslationService {
  /**
   * Get translation for a message
   */
  async translateMessage(request: TranslationRequest): Promise<Translation> {
    try {
      const response = await api.request<TranslationResponse>(
        '/chat/translate',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to translate message');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to translate message', { error });
      throw error;
    }
  }
}

export const translationService = new TranslationService();
export default translationService;

