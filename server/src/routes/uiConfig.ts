/**
 * 🎛️ UI Config API Routes
 * Handles CRUD operations for UI configurations, validation, preview sessions, publish, and rollback
 */

import express from 'express';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/adminAuth';
import { requireAuth, requireAdmin } from '../middleware/adminAuth';
import { zodValidate } from '../middleware/zodValidator';
import { z } from 'zod';
import { UIConfigModel } from '../models/UIConfig';
import { PreviewSessionModel } from '../models/PreviewSession';
import { uiConfigSchema } from '@pawfectmatch/core';
import logger from '../utils/logger';
import { logAdminActivity } from '../middleware/adminLogger';

const router = express.Router();

/**
 * GET /api/ui-config/current
 * Get current active config for environment
 */
router.get(
  '/current',
  zodValidate({
    query: z.object({
      env: z.enum(['dev', 'stage', 'prod']).optional().default('prod'),
    }),
  }),
  async (req: Request, res: Response) => {
    try {
      const { env } = req.query as { env: 'dev' | 'stage' | 'prod' };

      // Find active config matching environment
      const config = await UIConfigModel.findOne({
        status: 'prod',
        isActive: true,
        $or: [
          { 'audience.env': env },
          { 'audience.env': { $exists: false } }, // Default config
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'No active config found for environment',
        });
      }

      return res.json({
        success: true,
        data: {
          config: config.config,
          version: config.version,
          status: config.status,
        },
      });
    } catch (error) {
      logger.error('Error fetching current config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current config',
      });
    }
  },
);

/**
 * GET /api/ui-config/:version
 * Get specific config version
 */
router.get(
  '/:version',
  zodValidate({
    params: z.object({
      version: z.string(),
    }),
  }),
  async (req: Request, res: Response) => {
    try {
      const { version } = req.params;

      const config = await UIConfigModel.findOne({
        version,
        isActive: true,
      }).lean();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Config version not found',
        });
      }

      return res.json({
        success: true,
        data: {
          config: config.config,
          version: config.version,
          status: config.status,
          createdAt: config.createdAt,
          createdBy: config.createdBy,
          changelog: config.changelog,
        },
      });
    } catch (error) {
      logger.error('Error fetching config version:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch config version',
      });
    }
  },
);

/**
 * GET /api/ui-config
 * List all configs (admin only)
 */
router.get('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const query: Record<string, unknown> = { isActive: true };
    if (status) {
      query['status'] = status;
    }

    const configs = await UIConfigModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .select('version status createdAt createdBy changelog audience')
      .lean();

    const total = await UIConfigModel.countDocuments(query);

    return res.json({
      success: true,
      data: {
        configs,
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          hasMore: total > Number(skip) + Number(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error listing configs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list configs',
    });
  }
});

/**
 * POST /api/ui-config/validate
 * Validate a config object against schema
 */
router.post(
  '/validate',
  zodValidate({
    body: z.object({
      config: uiConfigSchema,
    }),
  }),
  async (req: Request, res: Response) => {
    try {
      // Config is already validated by zodValidate middleware
      // If we reach here, it's valid
      return res.json({
        success: true,
        ok: true,
        message: 'Config is valid',
      });
    } catch (error) {
      logger.error('Error validating config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate config',
      });
    }
  },
);

/**
 * POST /api/ui-config
 * Create a new draft config (admin only)
 */
router.post(
  '/',
  requireAuth,
  requireAdmin,
  zodValidate({
    body: z.object({
      config: uiConfigSchema,
    }),
  }),
  async (req: AuthRequest, res: Response) => {
    try {
      const { config } = req.body;
      // userId is available via req.user from requireAdmin middleware

      // Check if version already exists
      const existing = await UIConfigModel.findOne({ version: config.version });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Config version ${config.version} already exists`,
        });
      }

      const userId = req.user?._id?.toString() || 'unknown';

      const newConfig = await UIConfigModel.create({
        version: config.version,
        status: config.status || 'draft',
        audience: config.audience,
        config,
        createdBy: userId,
        changelog: config.meta.changelog,
        isActive: true,
      });

      await logAdminActivity(
        req,
        'CREATE_UI_CONFIG',
        {
          version: config.version,
          status: config.status,
          resourceId: newConfig._id.toString(),
        },
        true,
      );

      return res.status(201).json({
        success: true,
        data: {
          version: newConfig.version,
          status: newConfig.status,
          createdAt: newConfig.createdAt,
        },
      });
    } catch (error) {
      logger.error('Error creating config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create config',
      });
    }
  },
);

/**
 * POST /api/ui-config/:version/publish
 * Publish or promote a config (admin only)
 */
router.post(
  '/:version/publish',
  requireAuth,
  requireAdmin,
  zodValidate({
    params: z.object({
      version: z.string(),
    }),
    body: z.object({
      status: z.enum(['preview', 'staged', 'prod']),
      audience: z
        .object({
          env: z.enum(['dev', 'stage', 'prod']).optional(),
          pct: z.number().min(0).max(100).optional(),
          countryAllow: z.array(z.string()).optional(),
        })
        .optional(),
    }),
  }),
  async (req: AuthRequest, res: Response) => {
    try {
      const { version } = req.params;
      const { status, audience } = req.body;
      // userId is available via req.user from requireAdmin middleware

      const config = await UIConfigModel.findOne({ version, isActive: true });
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Config version not found',
        });
      }

      // Update status and audience
      config.status = status;
      if (audience) {
        config.audience = audience;
      }

      await config.save();

      await logAdminActivity(
        req,
        'PUBLISH_UI_CONFIG',
        {
          version,
          status,
          audience,
          resourceId: config._id.toString(),
        },
        true,
      );

      return res.json({
        success: true,
        data: {
          version: config.version,
          status: config.status,
          audience: config.audience,
        },
      });
    } catch (error) {
      logger.error('Error publishing config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to publish config',
      });
    }
  },
);

/**
 * POST /api/ui-config/preview/session
 * Generate a preview session code (admin only)
 */
router.post(
  '/preview/session',
  requireAuth,
  requireAdmin,
  zodValidate({
    body: z.object({
      configId: z.string(),
      expiresInHours: z.number().min(1).max(168).default(24), // Max 7 days
    }),
  }),
  async (req: AuthRequest, res: Response) => {
    try {
      const { configId, expiresInHours = 24 } = req.body;

      // Verify config exists
      const config = await UIConfigModel.findOne({
        _id: configId,
        isActive: true,
      });
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Config not found',
        });
      }

      // Generate 6-char uppercase code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const session = await PreviewSessionModel.create({
        code,
        configId,
        expiresAt,
        accessCount: 0,
      });

      return res.json({
        success: true,
        data: {
          code,
          expiresAt: session.expiresAt.toISOString(),
          configId,
        },
      });
    } catch (error) {
      logger.error('Error creating preview session:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create preview session',
      });
    }
  },
);

/**
 * GET /api/ui-config/preview/:code
 * Get config by preview code (public, for mobile app)
 */
router.get(
  '/preview/:code',
  zodValidate({
    params: z.object({
      code: z.string().length(6).regex(/^[A-Z0-9]{6}$/),
    }),
  }),
  async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Preview code is required',
        });
      }

      const session = await PreviewSessionModel.findOne({
        code: code.toUpperCase(),
        expiresAt: { $gt: new Date() },
      }).populate('configId');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Preview session not found or expired',
        });
      }

      // Update access tracking
      session.accessCount += 1;
      session.accessedAt = new Date();
      await session.save();

      const config = await UIConfigModel.findById(session.configId).lean();
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Config not found',
        });
      }

      return res.json({
        success: true,
        data: {
          config: config.config,
          version: config.version,
          expiresAt: session.expiresAt.toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching preview config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch preview config',
      });
    }
  },
);

/**
 * POST /api/ui-config/rollback
 * Rollback to a previous version (admin only)
 */
router.post(
  '/rollback',
  requireAuth,
  requireAdmin,
  zodValidate({
    body: z.object({
      version: z.string(),
      reason: z.string().optional(),
    }),
  }),
  async (req: AuthRequest, res: Response) => {
    try {
      const { version, reason } = req.body;
      // userId is available via req.user from requireAdmin middleware

      const targetConfig = await UIConfigModel.findOne({
        version,
        isActive: true,
      });

      if (!targetConfig) {
        return res.status(404).json({
          success: false,
          message: 'Target config version not found',
        });
      }

      // Update current prod configs to inactive
      await UIConfigModel.updateMany(
        { status: 'prod', isActive: true },
        { isActive: false },
      );

      // Create new version from target config
      const userId = req.user?._id?.toString() || 'unknown';
      const rollbackVersion = `${version}-rollback-${Date.now()}`;
      const rollbackConfig = await UIConfigModel.create({
        version: rollbackVersion,
        status: 'prod',
        audience: targetConfig.audience,
        config: {
          ...targetConfig.config,
          version: rollbackVersion,
          meta: {
            ...targetConfig.config.meta,
            changelog: `Rollback from ${version}. ${reason || 'No reason provided'}`,
            createdBy: userId,
            createdAt: new Date().toISOString(),
          },
        },
        createdBy: userId,
        changelog: `Rollback from ${version}. ${reason || 'No reason provided'}`,
        isActive: true,
      });

      await logAdminActivity(
        req,
        'ROLLBACK_UI_CONFIG',
        {
          fromVersion: version,
          toVersion: rollbackVersion,
          reason,
          resourceId: rollbackConfig._id.toString(),
        },
        true,
      );

      return res.json({
        success: true,
        data: {
          version: rollbackConfig.version,
          status: rollbackConfig.status,
        },
      });
    } catch (error) {
      logger.error('Error rolling back config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to rollback config',
      });
    }
  },
);

export default router;

