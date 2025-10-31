/**
 * Pet Chat Service
 * Service for pet-centric chat features
 */

import { logger } from '@pawfectmatch/core';
import { request } from '../services/api';
import type {
  PetProfileCard,
  CompatibilityIndicator,
  BreedInformation,
  PetHealthAlert,
  PlaydateProposal,
  ChatMessageWithPetContext,
  SmartChatSuggestion,
  LocalPetService,
} from '@pawfectmatch/core/types/pet-chat';

class PetChatService {
  /**
   * Share pet profile in chat
   */
  async sharePetProfile(
    matchId: string,
    petId: string,
  ): Promise<{ success: boolean; message: ChatMessageWithPetContext }> {
    try {
      const response = await request<{
        success: boolean;
        message: ChatMessageWithPetContext;
      }>(`/chat/${matchId}/share-pet-profile`, {
        method: 'POST',
        body: { petId },
      });

      logger.info('Pet profile shared', { matchId, petId });
      return response;
    } catch (error) {
      logger.error('Failed to share pet profile', { error, matchId, petId });
      throw error;
    }
  }

  /**
   * Get compatibility indicator for two pets
   */
  async getCompatibilityIndicator(
    matchId: string,
    pet1Id: string,
    pet2Id: string,
  ): Promise<CompatibilityIndicator> {
    try {
      const response = await request<CompatibilityIndicator>(
        `/chat/${matchId}/compatibility`,
        {
          method: 'GET',
          params: { pet1Id, pet2Id },
        },
      );

      logger.info('Compatibility indicator retrieved', { matchId, pet1Id, pet2Id });
      return response;
    } catch (error) {
      logger.error('Failed to get compatibility indicator', {
        error,
        matchId,
        pet1Id,
        pet2Id,
      });
      throw error;
    }
  }

  /**
   * Get breed information
   */
  async getBreedInformation(
    breedName: string,
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
  ): Promise<BreedInformation> {
    try {
      const response = await request<BreedInformation>('/chat/breed-info', {
        method: 'GET',
        params: { breedName, species },
      });

      logger.info('Breed information retrieved', { breedName, species });
      return response;
    } catch (error) {
      logger.error('Failed to get breed information', { error, breedName, species });
      throw error;
    }
  }

  /**
   * Share breed information in chat
   */
  async shareBreedInformation(
    matchId: string,
    breedName: string,
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
  ): Promise<{ success: boolean; message: ChatMessageWithPetContext }> {
    try {
      const response = await request<{
        success: boolean;
        message: ChatMessageWithPetContext;
      }>(`/chat/${matchId}/share-breed-info`, {
        method: 'POST',
        body: { breedName, species },
      });

      logger.info('Breed information shared', { matchId, breedName, species });
      return response;
    } catch (error) {
      logger.error('Failed to share breed information', {
        error,
        matchId,
        breedName,
        species,
      });
      throw error;
    }
  }

  /**
   * Create pet health alert
   */
  async createHealthAlert(
    matchId: string,
    petId: string,
    alert: Omit<PetHealthAlert, 'alertId' | 'petId'>,
  ): Promise<{ success: boolean; alert: PetHealthAlert }> {
    try {
      const response = await request<{
        success: boolean;
        alert: PetHealthAlert;
      }>(`/chat/${matchId}/health-alert`, {
        method: 'POST',
        body: { petId, ...alert },
      });

      logger.info('Health alert created', { matchId, petId });
      return response;
    } catch (error) {
      logger.error('Failed to create health alert', { error, matchId, petId });
      throw error;
    }
  }

  /**
   * Get health alerts for a pet
   */
  async getHealthAlerts(petId: string): Promise<PetHealthAlert[]> {
    try {
      const response = await request<PetHealthAlert[]>(`/chat/pets/${petId}/health-alerts`, {
        method: 'GET',
      });

      logger.info('Health alerts retrieved', { petId });
      return response;
    } catch (error) {
      logger.error('Failed to get health alerts', { error, petId });
      throw error;
    }
  }

  /**
   * Propose playdate
   */
  async proposePlaydate(
    matchId: string,
    proposal: Omit<PlaydateProposal, 'proposalId' | 'matchId' | 'proposedBy' | 'status'>,
  ): Promise<{ success: boolean; proposal: PlaydateProposal }> {
    try {
      const response = await request<{
        success: boolean;
        proposal: PlaydateProposal;
      }>(`/chat/${matchId}/playdate-proposal`, {
        method: 'POST',
        body: proposal,
      });

      logger.info('Playdate proposal created', { matchId });
      return response;
    } catch (error) {
      logger.error('Failed to propose playdate', { error, matchId });
      throw error;
    }
  }

  /**
   * Accept playdate proposal
   */
  async acceptPlaydate(
    matchId: string,
    proposalId: string,
  ): Promise<{ success: boolean; proposal: PlaydateProposal }> {
    try {
      const response = await request<{
        success: boolean;
        proposal: PlaydateProposal;
      }>(`/chat/${matchId}/playdate/${proposalId}/accept`, {
        method: 'POST',
      });

      logger.info('Playdate proposal accepted', { matchId, proposalId });
      return response;
    } catch (error) {
      logger.error('Failed to accept playdate', { error, matchId, proposalId });
      throw error;
    }
  }

  /**
   * Decline playdate proposal
   */
  async declinePlaydate(
    matchId: string,
    proposalId: string,
  ): Promise<{ success: boolean }> {
    try {
      const response = await request<{ success: boolean }>(
        `/chat/${matchId}/playdate/${proposalId}/decline`,
        {
          method: 'POST',
        },
      );

      logger.info('Playdate proposal declined', { matchId, proposalId });
      return response;
    } catch (error) {
      logger.error('Failed to decline playdate', { error, matchId, proposalId });
      throw error;
    }
  }

  /**
   * Get nearby pet-friendly venues
   */
  async getNearbyVenues(
    latitude: number,
    longitude: number,
    radius: number = 10,
    type?: 'park' | 'trail' | 'patio' | 'vet' | 'groomer' | 'shelter' | 'store' | 'cafe',
  ): Promise<LocalPetService[]> {
    try {
      const response = await request<LocalPetService[]>('/chat/venues/nearby', {
        method: 'GET',
        params: { latitude, longitude, radius, type },
      });

      logger.info('Nearby venues retrieved', { latitude, longitude, radius, type });
      return response;
    } catch (error) {
      logger.error('Failed to get nearby venues', {
        error,
        latitude,
        longitude,
        radius,
        type,
      });
      throw error;
    }
  }

  /**
   * Get weather forecast for location
   */
  async getWeatherForecast(
    latitude: number,
    longitude: number,
    date: string,
  ): Promise<{
    suitableForOutdoor: boolean;
    forecast: {
      condition: string;
      temperature: { high: number; low: number; unit: string };
      precipitation: number;
      windSpeed: number;
      recommendations?: string[];
    };
  }> {
    try {
      const response = await request<{
        suitableForOutdoor: boolean;
        forecast: {
          condition: string;
          temperature: { high: number; low: number; unit: string };
          precipitation: number;
          windSpeed: number;
          recommendations?: string[];
        };
      }>('/chat/weather', {
        method: 'GET',
        params: { latitude, longitude, date },
      });

      logger.info('Weather forecast retrieved', { latitude, longitude, date });
      return response;
    } catch (error) {
      logger.error('Failed to get weather forecast', { error, latitude, longitude, date });
      throw error;
    }
  }

  /**
   * Get smart chat suggestions
   */
  async getSmartSuggestions(
    matchId: string,
    context?: {
      lastMessages?: number;
      petTopics?: string[];
    },
  ): Promise<SmartChatSuggestion[]> {
    try {
      const response = await request<SmartChatSuggestion[]>(
        `/chat/${matchId}/suggestions`,
        {
          method: 'GET',
          params: context,
        },
      );

      logger.info('Smart suggestions retrieved', { matchId });
      return response;
    } catch (error) {
      logger.error('Failed to get smart suggestions', { error, matchId });
      throw error;
    }
  }

  /**
   * Get local pet services
   */
  async getLocalPetServices(
    latitude: number,
    longitude: number,
    radius: number = 10,
    type?: 'vet' | 'groomer' | 'pet_store' | 'trainer' | 'daycare' | 'boarding' | 'sitter',
  ): Promise<LocalPetService[]> {
    try {
      const response = await request<LocalPetService[]>('/chat/services/local', {
        method: 'GET',
        params: { latitude, longitude, radius, type },
      });

      logger.info('Local pet services retrieved', { latitude, longitude, radius, type });
      return response;
    } catch (error) {
      logger.error('Failed to get local pet services', {
        error,
        latitude,
        longitude,
        radius,
        type,
      });
      throw error;
    }
  }
}

export const petChatService = new PetChatService();

