/**
 * Message Scheduling Service (Mobile)
 * Phase 2 Product Enhancement - Message Scheduling
 */

import type {
  ScheduledMessage,
  ScheduledMessagesListResponse,
  ScheduledMessageResponse,
  CreateScheduledMessageRequest,
} from '@pawfectmatch/core/types/phase2-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';

class MessageSchedulingService {
  /**
   * Create a scheduled message
   */
  async createScheduledMessage(
    request: CreateScheduledMessageRequest
  ): Promise<ScheduledMessage> {
    try {
      const response = await api.request<ScheduledMessageResponse>(
        '/chat/schedule',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create scheduled message');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to create scheduled message', { error });
      throw error;
    }
  }

  /**
   * Get scheduled messages for the current user
   */
  async getScheduledMessages(
    convoId?: string,
    status?: 'scheduled' | 'sent' | 'canceled' | 'failed'
  ): Promise<ScheduledMessage[]> {
    try {
      const params: Record<string, string> = {};
      if (convoId) params.convoId = convoId;
      if (status) params.status = status;

      const queryString = new URLSearchParams(params).toString();
      const url = `/chat/schedule${queryString ? `?${queryString}` : ''}`;

      const response = await api.request<ScheduledMessagesListResponse>(url, {
        method: 'GET',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get scheduled messages');
      }

      return response.data.messages;
    } catch (error) {
      logger.error('Failed to get scheduled messages', { error });
      throw error;
    }
  }

  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(messageId: string): Promise<void> {
    try {
      const response = await api.request<{ success: boolean; message?: string }>(
        `/chat/schedule/${messageId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel scheduled message');
      }
    } catch (error) {
      logger.error('Failed to cancel scheduled message', { error, messageId });
      throw error;
    }
  }
}

export const messageSchedulingService = new MessageSchedulingService();
export default messageSchedulingService;

