/**
 * Content Moderation Service
 * AI content filtering and pet safety guidelines
 */

import { logger } from '@pawfectmatch/core';
import { request } from '../services/api';

interface ContentModerationResult {
  isSafe: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  suggestions?: string[];
}

interface ReportContentParams {
  matchId: string;
  messageId: string;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'unsafe' | 'other';
  description?: string;
}

class ContentModerationService {
  /**
   * Check if message content is safe
   */
  async checkContentSafety(content: string): Promise<ContentModerationResult> {
    try {
      const response = await request<ContentModerationResult>(
        '/chat/moderation/check',
        {
          method: 'POST',
          body: { content },
        },
      );

      logger.info('Content safety check completed', { isSafe: response.isSafe });
      return response;
    } catch (error) {
      logger.error('Failed to check content safety', { error });
      // Default to safe if check fails
      return { isSafe: true };
    }
  }

  /**
   * Report inappropriate content
   */
  async reportContent(params: ReportContentParams): Promise<{ success: boolean }> {
    try {
      const response = await request<{ success: boolean }>('/chat/moderation/report', {
        method: 'POST',
        body: params,
      });

      logger.info('Content reported', { matchId: params.matchId, messageId: params.messageId });
      return response;
    } catch (error) {
      logger.error('Failed to report content', { error, params });
      throw error;
    }
  }

  /**
   * Get pet safety guidelines
   */
  async getSafetyGuidelines(): Promise<{
    guidelines: Array<{
      title: string;
      description: string;
      category: 'first_meetup' | 'location' | 'pets' | 'emergency' | 'general';
    }>;
  }> {
    try {
      const response = await request<{
        guidelines: Array<{
          title: string;
          description: string;
          category: string;
        }>;
      }>('/chat/moderation/guidelines', {
        method: 'GET',
      });

      logger.info('Safety guidelines retrieved');
      return response;
    } catch (error) {
      logger.error('Failed to get safety guidelines', { error });
      throw error;
    }
  }

  /**
   * Get emergency contacts for location
   */
  async getEmergencyContacts(
    latitude: number,
    longitude: number,
  ): Promise<{
    contacts: Array<{
      type: 'animal_control' | 'vet_emergency' | 'pet_hospital' | 'police';
      name: string;
      phone: string;
      address: string;
      distance?: number;
    }>;
  }> {
    try {
      const response = await request<{
        contacts: Array<{
          type: string;
          name: string;
          phone: string;
          address: string;
          distance?: number;
        }>;
      }>('/chat/moderation/emergency-contacts', {
        method: 'GET',
        params: { latitude, longitude },
      });

      logger.info('Emergency contacts retrieved', { latitude, longitude });
      return response;
    } catch (error) {
      logger.error('Failed to get emergency contacts', { error, latitude, longitude });
      throw error;
    }
  }
}

export const contentModerationService = new ContentModerationService();

