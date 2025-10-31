/**
 * Moderation Controller for PawfectMatch
 * Handles user reports, blocks, mutes, and moderation actions
 */

import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/express';
import { z } from 'zod';
import Report from '../models/Report';
import UserBlock from '../models/UserBlock';
import UserMute from '../models/UserMute';
import adminNotifications from '../services/adminNotifications';
import logger from '../utils/logger';
import type { IUserDocument } from '../types/mongoose';
import { getErrorMessage } from '../../utils/errorHandler';

// Schemas
const reportSchema = z.object({
  type: z.enum([
    'inappropriate_content', 'harassment', 'spam', 'fake_profile', 'underage', 'animal_abuse', 'scam', 'inappropriate_behavior', 'copyright_violation', 'other'
  ]),
  category: z.enum(['user', 'pet', 'chat', 'message', 'other']),
  reason: z.string().min(3).max(1000),
  description: z.string().max(2000).optional(),
  targetId: z.string().min(1),
  evidence: z.array(z.object({
    type: z.enum(['screenshot', 'message', 'photo', 'video', 'other']),
    url: z.string().url().optional(),
    description: z.string().optional()
  })).optional(),
  isAnonymous: z.boolean().optional()
});

const blockSchema = z.object({
  blockedUserId: z.string().min(1),
  reason: z.string().max(1000).optional()
});

const muteSchema = z.object({
  mutedUserId: z.string().min(1),
  durationMinutes: z.number().int().min(1).max(60 * 24 * 30), // up to 30 days
  reason: z.string().max(1000).optional()
});

interface CreateReportBody {
  type: string;
  category: string;
  reason: string;
  description?: string;
  targetId: string;
  evidence?: Array<{
    type: string;
    url?: string;
    description?: string;
  }>;
  isAnonymous?: boolean;
}

interface BlockUserBody {
  blockedUserId: string;
  reason?: string;
}

interface MuteUserBody {
  mutedUserId: string;
  durationMinutes: number;
  reason?: string;
}

/**
 * Create a new report
 * POST /api/moderation/reports
 */
interface ReportPayload {
  reporterId: string;
  reason: string;
  description?: string;
  type: string;
  category: string;
  evidence: Array<{
    type?: string;
    url?: string;
    description?: string;
  }>;
  isAnonymous: boolean;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    reportSource: string;
  };
  reportedUserId?: string;
  reportedPetId?: string;
  reportedChatId?: string;
  otherTargetId?: string;
}

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = reportSchema.parse(req.body);
    const payload: ReportPayload = {
      reporterId: req.user!._id.toString(),
      reason: parsed.reason,
      description: parsed.description,
      type: parsed.type,
      category: parsed.category,
      evidence: parsed.evidence || [],
      isAnonymous: !!parsed.isAnonymous,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        reportSource: 'web'
      }
    };

    // Set target ID based on category
    switch (parsed.category) {
      case 'user':
        payload.reportedUserId = parsed.targetId;
        break;
      case 'pet':
        payload.reportedPetId = parsed.targetId;
        break;
      case 'chat':
      case 'message':
        payload.reportedChatId = parsed.targetId;
        break;
      default:
        payload.otherTargetId = parsed.targetId;
    }

    const report = await Report.create(payload);

    // Notify admins
    try {
      adminNotifications.notifyNewReport({
        _id: report._id.toString(),
        type: parsed.type,
        category: parsed.category,
        reporterId: req.user!._id.toString(),
        reportedUserId: payload.reportedUserId || '',
        reason: parsed.reason,
        status: 'pending',
        priority: getReportSeverity(parsed.type),
        createdAt: new Date()
      });
    } catch (notifyError) {
      logger.warn('Failed to notify admins of new report', { error: notifyError });
    }

    logger.info('Report created', {
      reportId: report._id,
      type: parsed.type,
      category: parsed.category,
      reporterId: req.user!._id
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { reportId: report._id }
    });

  } catch (error: unknown) {
    logger.error('Failed to create report', { error: getErrorMessage(error) });
    const status = error instanceof Error && error.name === 'ZodError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: 'Failed to submit report',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Block a user
 * POST /api/moderation/block
 */
export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = blockSchema.parse(req.body);
    const doc = await UserBlock.findOneAndUpdate(
      { blockerId: req.user!._id, blockedUserId: parsed.blockedUserId },
      { $set: { reason: parsed.reason } },
      { upsert: true, new: true }
    );

    logger.info('User blocked', {
      blockerId: req.user!._id,
      blockedUserId: parsed.blockedUserId
    });

    res.json({
      success: true,
      data: { id: doc._id }
    });

  } catch (error: unknown) {
    logger.error('Failed to block user', { error: getErrorMessage(error) });
    const status = error instanceof Error && error.name === 'ZodError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: 'Failed to block user',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Unblock a user
 * DELETE /api/moderation/block/:blockedUserId
 */
export const unblockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blockedUserId } = req.params;
    await UserBlock.findOneAndDelete({
      blockerId: req.user!._id,
      blockedUserId
    });

    logger.info('User unblocked', {
      blockerId: req.user!._id,
      blockedUserId
    });

    res.json({ success: true });

  } catch (error: unknown) {
    logger.error('Failed to unblock user', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Mute a user
 * POST /api/moderation/mute
 */
export const muteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = muteSchema.parse(req.body);
    const expiresAt = new Date(Date.now() + parsed.durationMinutes * 60 * 1000);

    const doc = await UserMute.findOneAndUpdate(
      { userId: req.user!._id, mutedUserId: parsed.mutedUserId },
      {
        $set: {
          durationMinutes: parsed.durationMinutes,
          expiresAt,
          reason: parsed.reason
        }
      },
      { upsert: true, new: true }
    );

    logger.info('User muted', {
      userId: req.user!._id,
      mutedUserId: parsed.mutedUserId,
      duration: parsed.durationMinutes
    });

    res.json({
      success: true,
      data: { id: doc._id, expiresAt }
    });

  } catch (error: unknown) {
    logger.error('Failed to mute user', { error: getErrorMessage(error) });
    const status = error instanceof Error && error.name === 'ZodError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: 'Failed to mute user',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Unmute a user
 * DELETE /api/moderation/mute/:mutedUserId
 */
export const unmuteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mutedUserId } = req.params;
    await UserMute.findOneAndDelete({
      userId: req.user!._id,
      mutedUserId
    });

    logger.info('User unmuted', {
      userId: req.user!._id,
      mutedUserId
    });

    res.json({ success: true });

  } catch (error: unknown) {
    logger.error('Failed to unmute user', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to unmute user',
      error: getErrorMessage(error)
    });
  }
};

/**
 * Get user's moderation state (blocks and mutes)
 * GET /api/moderation/state
 */
export const getModerationState = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Get active blocks
    const blocks = await UserBlock.find({
      blockerId: userId
    }).select('blockedUserId reason createdAt');

    // Get active mutes
    const mutes = await UserMute.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).select('mutedUserId durationMinutes expiresAt reason createdAt');

    res.json({
      success: true,
      data: { blocks, mutes }
    });

  } catch (error: unknown) {
    logger.error('Failed to fetch moderation state', { error: getErrorMessage(error) });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation state',
      error: getErrorMessage(error)
    });
  }
};

// Helper function
function getReportSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
  const criticalTypes = ['underage', 'animal_abuse', 'scam'];
  const highTypes = ['harassment', 'inappropriate_content', 'copyright_violation'];
  const mediumTypes = ['spam', 'fake_profile', 'inappropriate_behavior'];

  if (criticalTypes.includes(type)) return 'critical';
  if (highTypes.includes(type)) return 'high';
  if (mediumTypes.includes(type)) return 'medium';
  return 'low';
}

export default {
  createReport,
  blockUser,
  unblockUser,
  muteUser,
  unmuteUser,
  getModerationState
};
