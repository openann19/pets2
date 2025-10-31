/**
 * Offline Outbox Sync Controller
 * Phase 2 Product Enhancement - Offline message sync
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import { syncOutbox } from '../services/outboxSyncService';
import logger from '../utils/logger';
import type { OutboxSyncRequest } from '@pawfectmatch/core/types/phase2-contracts';

/**
 * @desc    Sync outbox items (messages queued while offline)
 * @route   POST /api/chat/outbox/sync
 * @access  Private
 */
export const syncOutboxItems = async (
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

    const request: OutboxSyncRequest = req.body;
    
    if (!request.items || !Array.isArray(request.items)) {
      res.status(400).json({
        success: false,
        message: 'Missing or invalid items array',
      });
      return;
    }

    const response = await syncOutbox(userId, request);

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to sync outbox', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

