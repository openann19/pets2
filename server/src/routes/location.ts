import { Router, type Request, type Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import LocationHistory from '../models/LocationHistory';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  userId: string;
}

const router = Router();

/**
 * POST /api/location/history
 * Store location history entry
 */
router.post('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { latitude, longitude, accuracy, altitude, heading, speed, timestamp, activity, petId } = req.body;

    if (!latitude || !longitude || !timestamp) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const locationEntry = await LocationHistory.create({
      userId,
      petId,
      latitude,
      longitude,
      accuracy,
      altitude,
      heading,
      speed,
      activity,
      timestamp: new Date(timestamp),
    });

    res.json({ success: true, data: locationEntry });
  } catch (error: unknown) {
    logger.error('Failed to save location history', { error: (error as Error).message });
    res.status(500).json({ success: false, error: 'Failed to save location history' });
  }
});

/**
 * GET /api/location/history
 * Get location history for a time range
 */
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { startTime, endTime, petId, limit = 1000 } = req.query;

    const query: any = { userId };

    if (petId) {
      query.petId = petId;
    }

    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) {
        query.timestamp.$gte = new Date(startTime as string);
      }
      if (endTime) {
        query.timestamp.$lte = new Date(endTime as string);
      }
    }

    const history = await LocationHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ success: true, data: history });
  } catch (error: unknown) {
    logger.error('Failed to fetch location history', { error: (error as Error).message });
    res.status(500).json({ success: false, error: 'Failed to fetch location history' });
  }
});

/**
 * GET /api/location/history/trail
 * Get location trail for pet activity visualization
 */
router.get('/history/trail', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { petId, startTime, endTime } = req.query;

    if (!petId || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const trail = await LocationHistory.find({
      userId,
      petId,
      timestamp: {
        $gte: new Date(startTime as string),
        $lte: new Date(endTime as string),
      },
    })
      .sort({ timestamp: 1 })
      .select('latitude longitude timestamp activity')
      .lean();

    res.json({ success: true, data: trail });
  } catch (error: unknown) {
    logger.error('Failed to fetch location trail', { error: (error as Error).message });
    res.status(500).json({ success: false, error: 'Failed to fetch location trail' });
  }
});

/**
 * DELETE /api/location/history
 * Clear location history (for privacy/GDPR)
 */
router.delete('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { olderThan } = req.query;

    const query: any = { userId };
    if (olderThan) {
      query.timestamp = { $lt: new Date(olderThan as string) };
    }

    await LocationHistory.deleteMany(query);

    res.json({ success: true, message: 'Location history cleared' });
  } catch (error: unknown) {
    logger.error('Failed to clear location history', { error: (error as Error).message });
    res.status(500).json({ success: false, error: 'Failed to clear location history' });
  }
});

export default router;

