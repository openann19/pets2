/**
 * Translation Controller
 * Phase 2 Product Enhancement - Chat Translation
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import { getTranslation } from '../services/translationService';
import logger from '../utils/logger';
import type { TranslationRequest } from '@pawfectmatch/core/types/phase2-contracts';

/**
 * @desc    Get translation for a message
 * @route   POST /api/chat/translate
 * @access  Private
 */
export const translateMessage = async (
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

    const request: TranslationRequest = req.body;
    
    // Validate request
    if (!request.msgId || !request.msgText || !request.tgtLang) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: msgId, msgText, tgtLang',
      });
      return;
    }

    const response = await getTranslation(request);

    if (response.success && response.data) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    logger.error('Failed to translate message', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

