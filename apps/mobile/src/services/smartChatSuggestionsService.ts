/**
 * Smart Chat Suggestions Service
 * AI-powered suggestions based on breed and conversation context
 */

import { logger } from '@pawfectmatch/core';
import { request } from '../services/api';
import type {
  SmartChatSuggestion,
  LocalPetService,
} from '@pawfectmatch/core/types/pet-chat';

class SmartChatSuggestionsService {
  /**
   * Get pet care advice based on breed and conversation context
   */
  async getPetCareAdvice(
    matchId: string,
    breed: string,
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
    context?: {
      lastMessages?: number;
      topics?: string[];
    },
  ): Promise<SmartChatSuggestion[]> {
    try {
      const response = await request<SmartChatSuggestion[]>(
        `/chat/${matchId}/suggestions/care-advice`,
        {
          method: 'POST',
          body: {
            breed,
            species,
            context,
          },
        },
      );

      logger.info('Pet care advice retrieved', { matchId, breed, species });
      return response;
    } catch (error) {
      logger.error('Failed to get pet care advice', {
        error,
        matchId,
        breed,
        species,
      });
      throw error;
    }
  }

  /**
   * Get local pet services recommendations
   */
  async getLocalPetServices(
    latitude: number,
    longitude: number,
    radius: number = 10,
    type?: 'vet' | 'groomer' | 'pet_store' | 'trainer' | 'daycare' | 'boarding' | 'sitter',
    context?: {
      petBreed?: string;
      petSize?: string;
      needs?: string[];
    },
  ): Promise<LocalPetService[]> {
    try {
      const response = await request<LocalPetService[]>('/chat/services/local', {
        method: 'POST',
        body: {
          latitude,
          longitude,
          radius,
          type,
          context,
        },
      });

      logger.info('Local pet services retrieved', {
        latitude,
        longitude,
        radius,
        type,
      });
      return response;
    } catch (error) {
      logger.error('Failed to get local pet services', {
        error,
        latitude,
        longitude,
      });
      throw error;
    }
  }

  /**
   * Get compatibility questions to ask
   */
  async getCompatibilityQuestions(
    matchId: string,
    pet1Id: string,
    pet2Id: string,
  ): Promise<SmartChatSuggestion[]> {
    try {
      const response = await request<SmartChatSuggestion[]>(
        `/chat/${matchId}/suggestions/compatibility-questions`,
        {
          method: 'GET',
          params: { pet1Id, pet2Id },
        },
      );

      logger.info('Compatibility questions retrieved', { matchId, pet1Id, pet2Id });
      return response;
    } catch (error) {
      logger.error('Failed to get compatibility questions', {
        error,
        matchId,
        pet1Id,
        pet2Id,
      });
      throw error;
    }
  }

  /**
   * Translate pet care terminology
   */
  async translateTerminology(
    text: string,
    fromLanguage: string,
    toLanguage: string,
    context?: 'pet_care' | 'veterinary' | 'general',
  ): Promise<{ translated: string; original: string }> {
    try {
      const response = await request<{
        translated: string;
        original: string;
      }>('/chat/translate', {
        method: 'POST',
        body: {
          text,
          fromLanguage,
          toLanguage,
          context,
        },
      });

      logger.info('Terminology translated', { fromLanguage, toLanguage });
      return response;
    } catch (error) {
      logger.error('Failed to translate terminology', {
        error,
        fromLanguage,
        toLanguage,
      });
      throw error;
    }
  }

  /**
   * Get conversation starters based on pet compatibility
   */
  async getConversationStarters(
    matchId: string,
    compatibilityScore: number,
    sharedInterests?: string[],
  ): Promise<SmartChatSuggestion[]> {
    try {
      const response = await request<SmartChatSuggestion[]>(
        `/chat/${matchId}/suggestions/conversation-starters`,
        {
          method: 'POST',
          body: {
            compatibilityScore,
            sharedInterests,
          },
        },
      );

      logger.info('Conversation starters retrieved', {
        matchId,
        compatibilityScore,
      });
      return response;
    } catch (error) {
      logger.error('Failed to get conversation starters', {
        error,
        matchId,
      });
      throw error;
    }
  }

  /**
   * Get general smart suggestions based on conversation context
   */
  async getSmartSuggestions(
    matchId: string,
    context?: {
      lastMessages?: number;
      petTopics?: string[];
      conversationStage?: 'initial' | 'active' | 'planning' | 'established';
    },
  ): Promise<SmartChatSuggestion[]> {
    try {
      const response = await request<SmartChatSuggestion[]>(
        `/chat/${matchId}/suggestions`,
        {
          method: 'POST',
          body: context,
        },
      );

      logger.info('Smart suggestions retrieved', { matchId });
      return response;
    } catch (error) {
      logger.error('Failed to get smart suggestions', { error, matchId });
      throw error;
    }
  }
}

export const smartChatSuggestionsService = new SmartChatSuggestionsService();

