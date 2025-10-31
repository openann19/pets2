/**
 * Message Template Controller
 * Phase 2 Product Enhancement - Message Templates
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import {
  createMessageTemplate,
  getMessageTemplates,
  renderMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
} from '../services/messageTemplateService';
import logger from '../utils/logger';
import type { CreateMessageTemplateRequest } from '@pawfectmatch/core/types/phase2-contracts';

/**
 * @desc    Create a message template
 * @route   POST /api/chat/templates
 * @access  Private
 */
export const createTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const request: CreateMessageTemplateRequest = req.body;
    
    if (!request.name || !request.content) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: name, content',
      });
      return;
    }

    const template = await createMessageTemplate(userId, request);

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error('Failed to create template', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get templates for a user
 * @route   GET /api/chat/templates
 * @access  Private
 */
export const getTemplates = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const category = req.query.category as 'personal' | 'team' | 'ops' | undefined;
    const templates = await getMessageTemplates(userId, category);

    res.status(200).json({
      success: true,
      data: {
        templates,
        total: templates.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get templates', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get templates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Render a template with variables
 * @route   POST /api/chat/templates/:templateId/render
 * @access  Private
 */
export const renderTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const templateId = req.params.templateId;
    const { variables } = req.body;

    if (!templateId) {
      res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
      return;
    }

    if (!variables || typeof variables !== 'object') {
      res.status(400).json({
        success: false,
        message: 'Variables object is required',
      });
      return;
    }

    const rendered = await renderMessageTemplate(userId, templateId, variables);

    res.status(200).json({
      success: true,
      data: rendered,
    });
  } catch (error) {
    logger.error('Failed to render template', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
      templateId: req.params.templateId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to render template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Update a template
 * @route   PUT /api/chat/templates/:templateId
 * @access  Private
 */
export const updateTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const templateId = req.params.templateId;
    const updates: Partial<CreateMessageTemplateRequest> = req.body;

    if (!templateId) {
      res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
      return;
    }

    const template = await updateMessageTemplate(userId, templateId, updates);

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error('Failed to update template', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
      templateId: req.params.templateId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Delete a template
 * @route   DELETE /api/chat/templates/:templateId
 * @access  Private
 */
export const deleteTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const templateId = req.params.templateId;
    if (!templateId) {
      res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
      return;
    }

    await deleteMessageTemplate(userId, templateId);

    res.status(200).json({
      success: true,
      message: 'Template deleted',
    });
  } catch (error) {
    logger.error('Failed to delete template', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
      templateId: req.params.templateId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

