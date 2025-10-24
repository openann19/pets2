// Defer requiring analyticsService until inside handlers to play nicely with jest.mock
// This ensures tests that mock ../services/analyticsService capture the references used here.
const getAnalyticsService = () => require('../services/analyticsService');
const logger = require('../utils/logger');

// @desc    Track user event
// @route   POST /api/analytics/user
// @access  Private
const trackUserEventController = async (req, res) => {
  try {
    const { trackUserEvent, EVENT_TYPES } = getAnalyticsService();
    const { eventType, metadata } = req.body;

    // Validate event type
    if (!eventType || !Object.values(EVENT_TYPES).includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
    }

    await trackUserEvent(req.userId, eventType, metadata);
    res.json({ success: true, message: 'User event tracked successfully' });
  } catch (error) {
    logger.error('Error in trackUserEventController:', { error });
    res.status(500).json({ success: false, message: 'Failed to track user event' });
  }
};

// @desc    Track pet event
// @route   POST /api/analytics/pet
// @access  Private
const trackPetEventController = async (req, res) => {
  try {
    const { trackPetEvent, EVENT_TYPES } = getAnalyticsService();
    const { petId, eventType, metadata } = req.body;

    // Validate event type
    if (!eventType || !Object.values(EVENT_TYPES).includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
    }

    await trackPetEvent(petId, eventType, req.userId, metadata);
    res.json({ success: true, message: 'Pet event tracked successfully' });
  } catch (error) {
    logger.error('Error in trackPetEventController:', { error });
    res.status(500).json({ success: false, message: 'Failed to track pet event' });
  }
};

// @desc    Track match event
// @route   POST /api/analytics/match
// @access  Private
const trackMatchEventController = async (req, res) => {
  try {
    const { trackMatchEvent, EVENT_TYPES } = getAnalyticsService();
    const { matchId, eventType, metadata } = req.body;

    // Validate event type
    if (!eventType || !Object.values(EVENT_TYPES).includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
    }

    await trackMatchEvent(matchId, eventType, req.userId, metadata);
    res.json({ success: true, message: 'Match event tracked successfully' });
  } catch (error) {
    logger.error('Error in trackMatchEventController:', { error });
    res.status(500).json({ success: false, message: 'Failed to track match event' });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/user
// @access  Private
const getUserAnalyticsController = async (req, res) => {
  try {
    const { getUserAnalytics } = getAnalyticsService();
    const userId = req.params.userId || req.userId;
    const { period = 'week' } = req.query;

    const analytics = await getUserAnalytics(userId, period);
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert dates to ISO strings for JSON serialization if they're Date objects
    if (analytics.lastActive && analytics.lastActive instanceof Date) {
      analytics.lastActive = analytics.lastActive.toISOString();
    }

    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error in getUserAnalyticsController:', { error });
    res.status(500).json({ success: false, message: 'Failed to get user analytics' });
  }
};

// @desc    Get pet analytics
// @route   GET /api/analytics/pet/:petId
// @access  Private
const getPetAnalyticsController = async (req, res) => {
  try {
    const { getPetAnalytics } = getAnalyticsService();
    const analytics = await getPetAnalytics(req.params.petId);
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Convert dates to ISO strings for JSON serialization if they're Date objects
    if (analytics.lastViewed && analytics.lastViewed instanceof Date) {
      analytics.lastViewed = analytics.lastViewed.toISOString();
    }

    res.json({ success: true, data: { analytics } });
  } catch (error) {
    logger.error('Error in getPetAnalyticsController:', { error });
    res.status(500).json({ success: false, message: 'Failed to get pet analytics' });
  }
};

// @desc    Get match analytics
// @route   GET /api/analytics/match/:matchId
// @access  Private
const getMatchAnalyticsController = async (req, res) => {
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
        return res.status(404).json({ success: false, message: 'Match not found' });
      }
      res.json({ success: true, data: analytics });
    }
  } catch (error) {
    logger.error('Error in getMatchAnalyticsController:', { error });
    res.status(500).json({ success: false, message: 'Failed to get match analytics' });
  }
};

module.exports = {
  trackUserEventController,
  trackPetEventController,
  trackMatchEventController,
  getUserAnalyticsController,
  getPetAnalyticsController,
  getMatchAnalyticsController,
};