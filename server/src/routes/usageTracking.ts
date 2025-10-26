import express, { type Request, type Response, Router } from 'express';
import UsageTrackingService from '../services/usageTrackingService';
import logger from '../utils/logger';

const router: Router = express.Router();

/**
 * Track swipe usage
 * @route POST /api/usage/swipe
 * @access Private
 */
router.post('/swipe', async (req: Request, res: Response) => {
  try {
    const { userId, petId, action } = req.body;
    
    if (!userId || !petId || !action) {
      return res.status(400).json({ error: 'Missing required parameters: userId, petId, action' });
    }
    
    const result = await UsageTrackingService.trackSwipe(userId, petId, action);
    
    res.json(result);
  } catch (error) {
    logger.error('Error tracking swipe', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Failed to track swipe' });
  }
});

/**
 * Track super like usage
 * @route POST /api/usage/superlike
 * @access Private
 */
router.post('/superlike', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    
    const result = await UsageTrackingService.trackSuperLike(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error tracking super like', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Failed to track super like' });
  }
});

/**
 * Track boost usage
 * @route POST /api/usage/boost
 * @access Private
 */
router.post('/boost', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    
    const result = await UsageTrackingService.trackBoost(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error tracking boost', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Failed to track boost' });
  }
});

/**
 * Get usage stats for user
 * @route GET /api/usage/stats
 * @access Private
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    
    const result = await UsageTrackingService.getUsageStats(userId as string);
    
    res.json(result);
  } catch (error) {
    logger.error('Error getting usage stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

export default router;

