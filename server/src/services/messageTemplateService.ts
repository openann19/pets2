/**
 * Message Template Service
 * Phase 2 Product Enhancement - Message Templates
 */

import MessageTemplate from '../models/MessageTemplate';
import logger from '../utils/logger';
import type {
  CreateMessageTemplateRequest,
  MessageTemplate as MessageTemplateType,
  RenderedTemplate,
} from '@pawfectmatch/core/types/phase2-contracts';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Extract variables from template content
 * Variables are in format: {{variableName}}
 */
function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

/**
 * Render template with variables
 */
function renderTemplate(content: string, variables: Record<string, string>): string {
  let rendered = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, value);
  }
  
  return rendered;
}

/**
 * Create a message template
 */
export async function createMessageTemplate(
  userId: string,
  request: CreateMessageTemplateRequest
): Promise<MessageTemplateType> {
  try {
    // Extract variables if not provided
    const variables = request.variables || extractVariables(request.content);

    // Encrypt content if requested
    let content = request.content;
    if (request.encrypted) {
      content = await encrypt(content);
    }

    const template = await MessageTemplate.create({
      userId,
      name: request.name,
      content,
      variables,
      category: request.category || 'personal',
      encrypted: request.encrypted || false,
      usageCount: 0,
    });

    logger.info('Message template created', {
      id: template._id.toString(),
      userId,
      name: request.name,
    });

    return {
      id: template._id.toString(),
      name: template.name,
      content: request.encrypted ? '***encrypted***' : template.content,
      variables: template.variables,
      category: template.category,
      version: template.version,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      encrypted: template.encrypted,
    };
  } catch (error) {
    logger.error('Failed to create message template', { error, userId, request });
    throw error;
  }
}

/**
 * Get templates for a user
 */
export async function getMessageTemplates(
  userId: string,
  category?: 'personal' | 'team' | 'ops'
): Promise<MessageTemplateType[]> {
  try {
    const query: any = { userId };
    if (category) {
      query.category = category;
    }

    const templates = await MessageTemplate.find(query)
      .sort({ usageCount: -1, lastUsedAt: -1 })
      .lean();

    return templates.map(async (template) => {
      let content = template.content;
      
      // Decrypt if encrypted
      if (template.encrypted) {
        try {
          content = await decrypt(content);
        } catch (error) {
          logger.error('Failed to decrypt template', { templateId: template._id.toString() });
          content = '***decryption failed***';
        }
      }

      return {
        id: template._id.toString(),
        name: template.name,
        content,
        variables: template.variables,
        category: template.category,
        version: template.version,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        encrypted: template.encrypted,
      };
    }).reduce(async (acc, promise) => {
      const arr = await acc;
      arr.push(await promise);
      return arr;
    }, Promise.resolve([] as MessageTemplateType[]));
  } catch (error) {
    logger.error('Failed to get message templates', { error, userId });
    throw error;
  }
}

/**
 * Render a template with variables
 */
export async function renderMessageTemplate(
  userId: string,
  templateId: string,
  variables: Record<string, string>
): Promise<RenderedTemplate> {
  try {
    const template = await MessageTemplate.findOne({
      _id: templateId,
      userId,
    });

    if (!template) {
      throw new Error('Template not found');
    }

    let content = template.content;

    // Decrypt if encrypted
    if (template.encrypted) {
      content = await decrypt(content);
    }

    // Render template
    const rendered = renderTemplate(content, variables);

    // Update usage stats
    template.usageCount = (template.usageCount || 0) + 1;
    template.lastUsedAt = new Date();
    await template.save();

    logger.info('Template rendered', {
      templateId,
      userId,
      variablesCount: Object.keys(variables).length,
    });

    return {
      templateId,
      content: rendered,
      variables,
    };
  } catch (error) {
    logger.error('Failed to render template', { error, userId, templateId });
    throw error;
  }
}

/**
 * Update a message template
 */
export async function updateMessageTemplate(
  userId: string,
  templateId: string,
  updates: Partial<CreateMessageTemplateRequest>
): Promise<MessageTemplateType> {
  try {
    const template = await MessageTemplate.findOne({
      _id: templateId,
      userId,
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (updates.name) template.name = updates.name;
    if (updates.content !== undefined) {
      template.content = updates.encrypted 
        ? await encrypt(updates.content)
        : updates.content;
      template.variables = updates.variables || extractVariables(updates.content);
    }
    if (updates.category) template.category = updates.category;
    if (updates.encrypted !== undefined) template.encrypted = updates.encrypted;
    template.version += 1;

    await template.save();

    logger.info('Template updated', { templateId, userId });

    return {
      id: template._id.toString(),
      name: template.name,
      content: template.encrypted ? '***encrypted***' : template.content,
      variables: template.variables,
      category: template.category,
      version: template.version,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      encrypted: template.encrypted,
    };
  } catch (error) {
    logger.error('Failed to update template', { error, userId, templateId });
    throw error;
  }
}

/**
 * Delete a message template
 */
export async function deleteMessageTemplate(
  userId: string,
  templateId: string
): Promise<void> {
  try {
    const result = await MessageTemplate.deleteOne({
      _id: templateId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new Error('Template not found');
    }

    logger.info('Template deleted', { templateId, userId });
  } catch (error) {
    logger.error('Failed to delete template', { error, userId, templateId });
    throw error;
  }
}

