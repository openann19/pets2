/**
 * Events Routes
 * Handles event ingestion from mobile + web apps
 */

import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { EventEnvelope } from '../../packages/api/src/types/events';
import { EventLog } from '../models/EventLog';
import logger from '../utils/logger';

const router = express.Router();

/**
 * @route   POST /api/v1/events
 * @desc    Ingest events from mobile + web
 * @access  Private (user authenticated)
 */
router.post('/v1/events', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    // Validate event envelope
    const events = Array.isArray(body) ? body : [body];
    
    // Parse and validate each event
    const validEvents = events
      .map((event) => {
        try {
          return EventEnvelope.parse(event);
        } catch (error) {
          logger.warn('Invalid event envelope', { error, event });
          return null;
        }
      })
      .filter(Boolean);

    if (validEvents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid events to process',
      });
    }

    // Store events in database
    const result = await EventLog.insertMany(
      validEvents.map((event) => ({
        app: event.app,
        userId: event.userId,
        sessionId: event.sessionId,
        ts: new Date(event.ts),
        type: event.type,
        payload: event.payload,
        meta: event.meta,
      }))
    );

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to ingest events', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to ingest events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route   GET /api/admin/events
 * @desc    Query events with filters
 * @access  Private (admin only)
 */
router.get('/admin/events', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      app,
      userId,
      sessionId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query: Record<string, unknown> = {};

    if (app) query.app = app;
    if (userId) query.userId = userId;
    if (sessionId) query.sessionId = sessionId;
    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.ts = {};
      if (startDate) (query.ts as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (query.ts as Record<string, Date>).$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const [events, total] = await Promise.all([
      EventLog.find(query)
        .sort({ ts: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean(),
      EventLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to query events', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to query events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;