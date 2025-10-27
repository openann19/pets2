/**
 * Reels Controller for PawfectMatch PawReels
 * Handles reel creation, rendering, viewing, sharing, and remixing
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import Reel from '../models/Reel';
import Template from '../models/Template';
import Track from '../models/Track';
import Clip from '../models/Clip';
import ShareEvent from '../models/ShareEvent';
import ModerationFlag from '../models/ModerationFlag';
import RemixEdge from '../models/RemixEdge';
import { z } from 'zod';
const logger = require('../utils/logger');

// Type definitions
interface AuthRequest extends Request {
  user?: IUserDocument;
}

interface CreateReelBody {
  templateId: string;
  trackId: string;
  locale?: string;
  remixOfId?: string;
}

interface AddClipsBody {
  clips: Array<{
    srcUrl: string;
    startMs: number;
    endMs: number;
    captionJson?: Record<string, unknown>;
  }>;
}

interface ShareReelBody {
  channel: string;
  referrerUserId?: string;
}

// Validation schemas
const createReelSchema = z.object({
  templateId: z.string().min(1),
  trackId: z.string().min(1),
  locale: z.enum(['bg', 'en']).default('bg'),
  remixOfId: z.string().optional(),
});

const addClipsSchema = z.object({
  clips: z.array(
    z.object({
      srcUrl: z.string().url(),
      startMs: z.number().min(0),
      endMs: z.number().min(0),
      captionJson: z.record(z.unknown()).optional(),
    })
  ).min(1),
});

const shareReelSchema = z.object({
  channel: z.enum(['instagram', 'tiktok', 'snapchat', 'twitter', 'facebook', 'copy-link', 'save']),
  referrerUserId: z.string().optional(),
});

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
 * Create a new reel
 * POST /api/reels
 */
export const createReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      fail(res, 401, 'Unauthorized');
      return;
    }

    // Validate input
    const validation = createReelSchema.safeParse(req.body);
    if (!validation.success) {
      fail(res, 400, 'Invalid input', { errors: validation.error.errors });
      return;
    }

    const { templateId, trackId, locale, remixOfId } = validation.data;

    // Validate template exists and is active
    const template = await Template.findById(templateId);
    if (!template || !template.isActive) {
      fail(res, 404, 'Template not found or inactive');
      return;
    }

    // Validate track exists and license is valid
    const track = await Track.findById(trackId);
    if (!track || !track.isActive || track.licenseExpiry < new Date()) {
      fail(res, 404, 'Track not found or license expired');
      return;
    }

    // Create reel
    const reel = await Reel.create({
      ownerId: user._id,
      templateId,
      trackId,
      srcJson: template.jsonSpec,
      duration: template.duration,
      remixOfId,
      watermark: true,
      locale: locale || 'bg',
      status: 'draft',
      kpiShares: 0,
      kpiInstallsFromLink: 0,
    });

    // Create remix edge if this is a remix
    if (remixOfId) {
      await RemixEdge.create({
        parentId: remixOfId,
        childId: reel._id,
      });
    }

    logger.info('Reel created', { reelId: reel._id, userId: user._id, templateId, trackId });

    ok(res, 201, {
      reel: {
        id: reel._id,
        status: reel.status,
        createdAt: reel.createdAt,
      },
    });
  } catch (error: any) {
    logger.error('Error creating reel:', error);
    fail(res, 500, 'Failed to create reel');
  }
};

/**
 * Add clips to a reel
 * PUT /api/reels/:id/clips
 */
export const addClips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      fail(res, 401, 'Unauthorized');
      return;
    }

    const { id } = req.params;

    // Validate input
    const validation = addClipsSchema.safeParse(req.body);
    if (!validation.success) {
      fail(res, 400, 'Invalid input', { errors: validation.error.errors });
      return;
    }

    const { clips } = validation.data;

    // Get reel and verify ownership
    const reel = await Reel.findById(id);
    if (!reel) {
      fail(res, 404, 'Reel not found');
      return;
    }

    if (reel.ownerId.toString() !== user._id.toString()) {
      fail(res, 403, 'Forbidden');
      return;
    }

    // Validate clip count against template limits
    const template = await Template.findById(reel.templateId);
    if (!template) {
      fail(res, 404, 'Template not found');
      return;
    }

    if (clips.length < template.minClips || clips.length > template.maxClips) {
      fail(res, 400, `Clip count must be between ${template.minClips} and ${template.maxClips}`);
      return;
    }

    // Delete existing clips for this reel
    await Clip.deleteMany({ reelId: reel._id });

    // Create new clips
    const clipDocs = clips.map((clip, index) => ({
      reelId: reel._id,
      order: index,
      srcUrl: clip.srcUrl,
      startMs: clip.startMs,
      endMs: clip.endMs,
      captionJson: clip.captionJson,
    }));

    await Clip.insertMany(clipDocs);

    logger.info('Clips added to reel', { reelId: reel._id, clipCount: clips.length });

    ok(res, 200, {
      reelId: reel._id,
      clipCount: clips.length,
    });
  } catch (error: any) {
    logger.error('Error adding clips:', error);
    fail(res, 500, 'Failed to add clips');
  }
};

/**
 * Enqueue reel for rendering
 * POST /api/reels/:id/render
 */
export const renderReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      fail(res, 401, 'Unauthorized');
      return;
    }

    const { id } = req.params;

    // Get reel and verify ownership
    const reel = await Reel.findById(id).populate('clips');
    if (!reel) {
      fail(res, 404, 'Reel not found');
      return;
    }

    if (reel.ownerId.toString() !== user._id.toString()) {
      fail(res, 403, 'Forbidden');
      return;
    }

    // Verify clips exist
    const clips = await Clip.findByReelId(reel._id);
    if (clips.length === 0) {
      fail(res, 400, 'Reel has no clips');
      return;
    }

    // Update status to rendering (this would trigger a worker in production)
    reel.status = 'rendering';
    await reel.save();

    logger.info('Reel queued for rendering', { reelId: reel._id, userId: user._id });

    ok(res, 202, {
      reelId: reel._id,
      status: reel.status,
      message: 'Reel queued for rendering',
    });
  } catch (error: any) {
    logger.error('Error rendering reel:', error);
    fail(res, 500, 'Failed to render reel');
  }
};

/**
 * Get reel details
 * GET /api/reels/:id
 */
export const getReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const reel = await Reel.findById(id);
    if (!reel) {
      fail(res, 404, 'Reel not found');
      return;
    }

    // Populate related data
    const clips = await Clip.findByReelId(reel._id);
    const template = await Template.findById(reel.templateId);
    const track = await Track.findById(reel.trackId);

    ok(res, 200, {
      reel: {
        id: reel._id,
        ownerId: reel.ownerId,
        mp4Url: reel.mp4Url,
        posterUrl: reel.posterUrl,
        duration: reel.duration,
        status: reel.status,
        kpiShares: reel.kpiShares,
        kpiInstallsFromLink: reel.kpiInstallsFromLink,
        createdAt: reel.createdAt,
        clips,
        template,
        track: track ? { id: track._id, title: track.title, artist: track.artist } : null,
      },
    });
  } catch (error: any) {
    logger.error('Error getting reel:', error);
    fail(res, 500, 'Failed to get reel');
  }
};

/**
 * Track share event
 * POST /api/reels/:id/share
 */
export const shareReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Validate input
    const validation = shareReelSchema.safeParse(req.body);
    if (!validation.success) {
      fail(res, 400, 'Invalid input', { errors: validation.error.errors });
      return;
    }

    const { channel, referrerUserId } = validation.data;

    // Verify reel exists
    const reel = await Reel.findById(id);
    if (!reel) {
      fail(res, 404, 'Reel not found');
      return;
    }

    // Create share event
    await ShareEvent.create({
      reelId: reel._id,
      channel,
      referrerUserId,
      userId: user?._id,
    });

    // Update reel KPIs
    reel.kpiShares += 1;
    await reel.save();

    logger.info('Reel share tracked', { reelId: reel._id, channel, userId: user?._id });

    ok(res, 200, {
      reelId: reel._id,
      shares: reel.kpiShares,
    });
  } catch (error: any) {
    logger.error('Error sharing reel:', error);
    fail(res, 500, 'Failed to share reel');
  }
};

/**
 * Create remix of a reel
 * POST /api/reels/:id/remix
 */
export const remixReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      fail(res, 401, 'Unauthorized');
      return;
    }

    const { id } = req.params;

    // Get original reel
    const originalReel = await Reel.findById(id);
    if (!originalReel) {
      fail(res, 404, 'Reel not found');
      return;
    }

    // Create new reel (simplified - in production would copy template/track selection)
    const remixReel = await Reel.create({
      ownerId: user._id,
      templateId: originalReel.templateId,
      trackId: originalReel.trackId,
      srcJson: originalReel.srcJson,
      duration: originalReel.duration,
      remixOfId: originalReel._id,
      watermark: true,
      locale: originalReel.locale,
      status: 'draft',
      kpiShares: 0,
      kpiInstallsFromLink: 0,
    });

    // Create remix edge
    await RemixEdge.create({
      parentId: originalReel._id,
      childId: remixReel._id,
    });

    logger.info('Reel remix created', { parentId: originalReel._id, childId: remixReel._id });

    ok(res, 201, {
      reel: {
        id: remixReel._id,
        status: remixReel.status,
        remixOfId: remixReel.remixOfId,
      },
    });
  } catch (error: any) {
    logger.error('Error creating remix:', error);
    fail(res, 500, 'Failed to create remix');
  }
};

/**
 * List reels (feed)
 * GET /api/reels
 */
export const listReels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = parseInt(req.query.skip as string, 10) || 0;

    // Get public reels
    const reels = await Reel.find({ status: 'public' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Populate basic info
    const result = await Promise.all(
      reels.map(async (reel) => {
        const track = await Track.findById(reel.trackId);
        return {
          id: reel._id,
          mp4Url: reel.mp4Url,
          posterUrl: reel.posterUrl,
          duration: reel.duration,
          kpiShares: reel.kpiShares,
          remixOfId: reel.remixOfId,
          track: track ? { title: track.title, artist: track.artist } : null,
          createdAt: reel.createdAt,
        };
      })
    );

    ok(res, 200, {
      reels: result,
      limit,
      skip,
    });
  } catch (error: any) {
    logger.error('Error listing reels:', error);
    fail(res, 500, 'Failed to list reels');
  }
};

