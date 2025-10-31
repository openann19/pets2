/**
 * Message Scheduling Controller
 * Phase 2 Product Enhancement - Message Scheduling
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import {
  createScheduledMessage,
  getScheduledMessages,
  cancelScheduledMessage,
} from '../services/messageSchedulingService';
import logger from '../utils/logger';
import type { CreateScheduledMessageRequest } from '@pawfectmatch/core/types/phase2-contracts';

/**
 * @desc    Create a scheduled message
 * @route   POST /api/chat/schedule
 * @access  Private
 */
export const createScheduled = async (
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

    const request: CreateScheduledMessageRequest = req.body;
    
    // Validate request
    if (!request.convoId || !request.body || !request.scheduledAt || !request.tz) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: convoId, body, scheduledAt, tz',
      });
      return;
    }

    const scheduledMessage = await createScheduledMessage(userId, request);

    res.status(201).json({
      success: true,
      data: scheduledMessage,
    });
  } catch (error) {
    logger.error('Failed to create scheduled message', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create scheduled message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get scheduled messages for a user
 * @route   GET /api/chat/schedule
 * @access  Private
 */
export const getScheduled = async (
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

    const convoId = req.query.convoId as string | undefined;
    const status = req.query.status as 'scheduled' | 'sent' | 'canceled' | 'failed' | undefined;

    const messages = await getScheduledMessages(userId, convoId, status);

    res.status(200).json({
      success: true,
      data: {
        messages,
        total: messages.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get scheduled messages', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduled messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Cancel a scheduled message
 * @route   DELETE /api/chat/schedule/:messageId
 * @access  Private
 */
export const cancelScheduled = async (
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

    const messageId = req.params.messageId;
    if (!messageId) {
      res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
      return;
    }

    await cancelScheduledMessage(userId, messageId);

    res.status(200).json({
      success: true,
      message: 'Scheduled message canceled',
    });
  } catch (error) {
    logger.error('Failed to cancel scheduled message', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
      messageId: req.params.messageId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

