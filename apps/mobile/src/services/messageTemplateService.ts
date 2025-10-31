/**
 * Message Template Service (Mobile)
 * Phase 2 Product Enhancement - Message Templates
 */

import type {
  MessageTemplate,
  MessageTemplatesListResponse,
  MessageTemplateResponse,
  CreateMessageTemplateRequest,
  RenderedTemplate,
} from '@pawfectmatch/core/types/phase2-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';

class MessageTemplateService {
  /**
   * Create a message template
   */
  async createTemplate(
    request: CreateMessageTemplateRequest
  ): Promise<MessageTemplate> {
    try {
      const response = await api.request<MessageTemplateResponse>(
        '/chat/templates',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create template');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to create template', { error });
      throw error;
    }
  }

  /**
   * Get templates for the current user
   */
  async getTemplates(
    category?: 'personal' | 'team' | 'ops'
  ): Promise<MessageTemplate[]> {
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;

      const queryString = new URLSearchParams(params).toString();
      const url = `/chat/templates${queryString ? `?${queryString}` : ''}`;

      const response = await api.request<MessageTemplatesListResponse>(url, {
        method: 'GET',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get templates');
      }

      return response.data.templates;
    } catch (error) {
      logger.error('Failed to get templates', { error });
      throw error;
    }
  }

  /**
   * Render a template with variables
   */
  async renderTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<RenderedTemplate> {
    try {
      const response = await api.request<{ success: boolean; data: RenderedTemplate }>(
        `/chat/templates/${templateId}/render`,
        {
          method: 'POST',
          body: JSON.stringify({ variables }),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to render template');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to render template', { error, templateId });
      throw error;
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<CreateMessageTemplateRequest>
  ): Promise<MessageTemplate> {
    try {
      const response = await api.request<MessageTemplateResponse>(
        `/chat/templates/${templateId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update template');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to update template', { error, templateId });
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const response = await api.request<{ success: boolean; message?: string }>(
        `/chat/templates/${templateId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete template');
      }
    } catch (error) {
      logger.error('Failed to delete template', { error, templateId });
      throw error;
    }
  }
}

export const messageTemplateService = new MessageTemplateService();
export default messageTemplateService;

