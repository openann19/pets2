export {};// Added to mark file as a module
const express = require('express');
const UsageTrackingService = require('../services/usageTrackingService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Track swipe usage
 * @route POST /api/usage/swipe
 * @access Private
 */
router.post('/swipe', async (req, res) => {
  try {
    const { userId, petId, action } = req.body;
    
    if (!userId || !petId || !action) {
      return res.status(400).json({ error: 'Missing required parameters: userId, petId, action' });
    }
    
    const result = await UsageTrackingService.trackSwipe(userId, petId, action);
    
    res.json(result);
  } catch (error) {
    logger.error('Error tracking swipe', { error: error.message });
    res.status(500).json({ error: 'Failed to track swipe' });
  }
});

/**
 * Track super like usage
 * @route POST /api/usage/superlike
 * @access Private
 */
router.post('/superlike', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    
    const result = await UsageTrackingService.trackSuperLike(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error tracking super like', { error: error.message });
    res.status(500).json({ error: 'Failed to track super like' });
  }
});

/**
 * Track boost usage
 * @route POST /api/usage/boost
 * @access Private
 */
router.post('/boost', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    
    const result = await UsageTrackingService.trackBoost(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error tracking boost', { error: error.message });
    res.status(500).json({ error: 'Failed to track boost' });
  }
});

/**
 * Get usage stats for user
 * @route GET /api/usage/stats
 * @access Private
 */
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    
    const result = await UsageTrackingService.getUsageStats(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error getting usage stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

module.exports = router;