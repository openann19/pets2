import { Response } from 'express';
import logger from '../utils/logger';

// Defer requiring analyticsService until inside handlers to play nicely with jest.mock
const getAnalyticsService = () => require('../services/analyticsService');

/**
 * Request interfaces
 */
interface AuthenticatedRequest {
  userId?: string;
  params: any;
  query: any;
  body: any;
}

interface TrackUserEventRequest extends AuthenticatedRequest {
  body: {
    eventType: string;
    metadata?: any;
  };
}

interface TrackPetEventRequest extends AuthenticatedRequest {
  body: {
    petId: string;
    eventType: string;
    metadata?: any;
  };
}

interface TrackMatchEventRequest extends AuthenticatedRequest {
  body: {
    matchId: string;
    eventType: string;
    metadata?: any;
  };
}

interface GetUserAnalyticsRequest extends AuthenticatedRequest {
  params: {
    userId?: string;
  };
  query: {
    period?: string;
  };
}

interface GetPetAnalyticsRequest extends AuthenticatedRequest {
  params: {
    petId: string;
  };
}

interface GetMatchAnalyticsRequest extends AuthenticatedRequest {
  params: {
    matchId?: string;
    userId?: string;
  };
  query: {
    period?: string;
  };
}

/**
 * @desc    Track user event
 * @route   POST /api/analytics/user
 * @access  Private
 */
export const trackUserEventController = async (req: TrackUserEventRequest, res: Response): Promise<void> => {
  try {
    const { trackUserEvent, EVENT_TYPES } = getAnalyticsService();
    const { eventType, metadata } = req.body;

    // Validate event type
    if (!eventType || !Object.values(EVENT_TYPES).includes(eventType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await trackUserEvent(req.userId, eventType, metadata);
    res.json({ success: true, message: 'User event tracked successfully' });
  } catch (error) {
    logger.error('Error in trackUserEventController:', { error });
    res.status(500).json({ success: false, message: 'Failed to track user event' });
  }
};

/**
 * @desc    Track pet event
 * @route   POST /api/analytics/pet
 * @access  Private
 */
export const trackPetEventController = async (req: TrackPetEventRequest, res: Response): Promise<void> => {
  try {
    const { trackPetEvent, EVENT_TYPES } = getAnalyticsService();
    const { petId, eventType, metadata } = req.body;

    // Validate event type
    if (!eventType || !Object.values(EVENT_TYPES).includes(eventType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await trackPetEvent(petId, eventType, req.userId, metadata);
    res.json({ success: true, message: 'Pet event tracked successfully' });
  } catch (error) {
    logger.error('Error in trackPetEventController:', { error });
    res.status(500).json({ success: false, message: 'Failed to track pet event' });
  }
};

/**
 * @desc    Track match event
 * @route   POST /api/analytics/match
 * @access  Private
 */
export const trackMatchEventController = async (req: TrackMatchEventRequest, res: Response): Promise<void> => {
  try {
    const { trackMatchEvent, EVENT_TYPES } = getAnalyticsService();
    const { matchId, eventType, metadata } = req.body;

    // Validate event type
    if (!eventType || !Object.values(EVENT_TYPES).includes(eventType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await trackMatchEvent(matchId, eventType, req.userId, metadata);
    res.json({ success: true, message: 'Match event tracked successfully' });
  } catch (error) {
    logger.error('Error in trackMatchEventController:', { error });
    res.status(500).json({ success: false, message: 'Failed to track match event' });
  }
};

/**
 * @desc    Get user analytics
 * @route   GET /api/analytics/user
 * @access  Private
 */
export const getUserAnalyticsController = async (req: GetUserAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { getUserAnalytics } = getAnalyticsService();
    const userId = req.params.userId || req.userId;
    const { period = 'week' } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const analytics = await getUserAnalytics(userId, period);
    if (!analytics) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Convert dates to ISO strings for JSON serialization if they're Date objects
    if (analytics.lastActive && analytics.lastActive instanceof Date) {
      (analytics as any).lastActive = analytics.lastActive.toISOString();
    }

    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error in getUserAnalyticsController:', { error });
    res.status(500).json({ success: false, message: 'Failed to get user analytics' });
  }
};

/**
 * @desc    Get pet analytics
 * @route   GET /api/analytics/pet/:petId
 * @access  Private
 */
export const getPetAnalyticsController = async (req: GetPetAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { getPetAnalytics } = getAnalyticsService();
    const analytics = await getPetAnalytics(req.params.petId);
    if (!analytics) {
      res.status(404).json({ success: false, message: 'Pet not found' });
      return;
    }

    // Convert dates to ISO strings for JSON serialization if they're Date objects
    if (analytics.lastViewed && analytics.lastViewed instanceof Date) {
      (analytics as any).lastViewed = analytics.lastViewed.toISOString();
    }

    res.json({ success: true, data: { analytics } });
  } catch (error) {
    logger.error('Error in getPetAnalyticsController:', { error });
    res.status(500).json({ success: false, message: 'Failed to get pet analytics' });
  }
};

/**
 * @desc    Get match analytics
 * @route   GET /api/analytics/match/:matchId
 * @access  Private
 */
export const getMatchAnalyticsController = async (req: GetMatchAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { getMatchAnalytics } = getAnalyticsService();
    const matchId = req.params.matchId || req.params.userId;
    const { period = 'week' } = req.query;

    // If it's a user ID, get match analytics for that user
    if (req.params.userId) {
      const analytics = await getMatchAnalytics(req.params.userId, period);
      res.json({ success: true, data: analytics });
    } else {
      // If it's a match ID, get analytics for that specific match
      const analytics = await getMatchAnalytics(matchId);
      if (!analytics) {
        res.status(404).json({ success: false, message: 'Match not found' });
        return;
      }
      res.json({ success: true, data: analytics });
    }
  } catch (error) {
    logger.error('Error in getMatchAnalyticsController:', { error });
    res.status(500).json({ success: false, message: 'Failed to get match analytics' });
  }
};
