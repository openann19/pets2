/**
 * Templates Controller for PawfectMatch PawReels
 * Handles template listing and management
 */

import type { Request, Response } from 'express';
import Template from '../models/Template';
const logger = require('../utils/logger');

// Helper functions
function ok(res: Response, status: number, payload: Record<string, unknown>): void {
  res.status(status).json({ success: true, ...payload });
}

function fail(res: Response, status: number, message: string, meta?: Record<string, unknown>): void {
  const body: { success: boolean; message: string; meta?: Record<string, unknown> } = { success: false, message };
  if (meta && process.env.NODE_ENV !== 'production') {
    body.meta = meta;
  }
  res.status(status).json(body);
}

/**
 * List all active templates
 * GET /api/templates
 */
export const listTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const theme = req.query.theme as string | undefined;

    let templates;
    if (theme) {
      templates = await Template.findByTheme(theme);
    } else {
      templates = await Template.findActive();
    }

    const result = templates.map((template) => ({
      id: template._id,
      name: template.name,
      theme: template.theme,
      thumbUrl: template.thumbUrl,
      minClips: template.minClips,
      maxClips: template.maxClips,
      duration: template.duration,
    }));

    ok(res, 200, {
      templates: result,
      count: result.length,
    });
  } catch (error: any) {
    logger.error('Error listing templates:', error);
    fail(res, 500, 'Failed to list templates');
  }
};

/**
 * Get template by ID
 * GET /api/templates/:id
 */
export const getTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template || !template.isActive) {
      fail(res, 404, 'Template not found or inactive');
      return;
    }

    ok(res, 200, {
      template: {
        id: template._id,
        name: template.name,
        theme: template.theme,
        jsonSpec: template.jsonSpec,
        thumbUrl: template.thumbUrl,
        minClips: template.minClips,
        maxClips: template.maxClips,
        duration: template.duration,
      },
    });
  } catch (error: any) {
    logger.error('Error getting template:', error);
    fail(res, 500, 'Failed to get template');
  }
};

