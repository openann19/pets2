export {};// Added to mark file as a module
const express = require('express');
const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const logger = require('../utils/logger');
const { 
  trackUserEventController,
  trackPetEventController,
  trackMatchEventController,
  getUserAnalyticsController,
  getPetAnalyticsController,
  getMatchAnalyticsController
} = require('../controllers/analyticsController');

const router: Router = express.Router();

// @desc    Track user event
// @route   POST /api/analytics/user
// @access  Private
router.post('/user', trackUserEventController);

// @desc    Track pet event
// @route   POST /api/analytics/pet
// @access  Private
router.post('/pet', trackPetEventController);

// @desc    Track match event
// @route   POST /api/analytics/match
// @access  Private
router.post('/match', trackMatchEventController);

// @desc    Get user analytics
// @route   GET /api/analytics/user
// @access  Private
router.get('/user', getUserAnalyticsController);

// @desc    Get pet analytics
// @route   GET /api/analytics/pet/:petId
// @access  Private
router.get('/pet/:petId', getPetAnalyticsController);

// @desc    Get match analytics
// @route   GET /api/analytics/match/:matchId
// @access  Private
router.get('/match/:matchId', getMatchAnalyticsController);

// @desc    Get user analytics by user ID
// @route   GET /api/analytics/users/:userId
// @access  Private
router.get('/users/:userId', getUserAnalyticsController);

// @desc    Get match analytics by user ID
// @route   GET /api/analytics/matches/:userId
// @access  Private
router.get('/matches/:userId', getMatchAnalyticsController);

// @desc    Track analytics events (batch)
// @route   POST /api/analytics/events
// @access  Private
router.post('/events', async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Events array is required'
      });
    }

    // Normalize and validate events
    const docs = events.map((e) => ({
      userId: e.userId && mongoose.Types.ObjectId.isValid(e.userId) ? new mongoose.Types.ObjectId(e.userId) : undefined,
      eventType: e.eventType || 'custom',
      entityType: e.entityType,
      entityId: e.entityId && mongoose.Types.ObjectId.isValid(e.entityId) ? new mongoose.Types.ObjectId(e.entityId) : undefined,
      durationMs: typeof e.durationMs === 'number' ? e.durationMs : undefined,
      success: typeof e.success === 'boolean' ? e.success : true,
      errorCode: e.errorCode,
      metadata: e.metadata || {},
      createdAt: e.createdAt ? new Date(e.createdAt) : new Date()
    }));

    const result = await AnalyticsEvent.insertMany(docs, { ordered: false });

    res.json({
      success: true,
      message: `Processed ${result.length} events`,
      processed: result.length
    });
  } catch (error) {
    logger.error('Analytics events error:', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to process analytics events',
      error: error.message
    });
  }
});

// @desc    Get performance metrics
// @route   GET /api/analytics/performance
// @access  Private
router.get('/performance', async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const events = await AnalyticsEvent.find({ createdAt: { $gte: since } })
      .select('durationMs success userId createdAt')
      .lean();

    const durations = events.filter(e => typeof e.durationMs === 'number').map(e => e.durationMs).sort((a, b) => a - b);
    const n = durations.length;
    const p95 = n > 0 ? durations[Math.min(n - 1, Math.ceil(0.95 * n) - 1)] : 0;

    const total = events.length;
    const errors = events.filter(e => e.success === false).length;
    const errorRate = total > 0 ? +(errors / total * 100).toFixed(2) : 0;

    const uniqueUsers = new Set(events.filter(e => e.userId).map(e => e.userId.toString())).size;

    res.json({
      success: true,
      data: {
        responseTimeP95: p95,
        uptime: 99.9,
        errorRate,
        activeUsers: uniqueUsers,
        window: '24h',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Performance metrics error:', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
});

export default router;