import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import MapPin from '../models/MapPin';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/map/activity/start
 * Create a new activity pin
 */
router.post('/activity/start', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { petId, activity, message, shareToMap, location, radiusMeters } = req.body;

    if (!petId || !activity || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const pin = await MapPin.create({
      userId,
      petId,
      activity,
      message: message || '',
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      radiusMeters: radiusMeters || 500,
      shareToMap: shareToMap !== false
    });

    // Emit socket event to notify clients
    const io = req.app.get('io');
    if (io) {
      io.emit('pin:update', pin);
    }

    res.json({ success: true, data: pin });
  } catch (error: any) {
    logger.error('Failed to start activity', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to start activity' });
  }
});

/**
 * POST /api/map/activity/end
 * End an active activity pin
 */
router.post('/activity/end', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { activityId } = req.body;

    const pin = await MapPin.findOneAndUpdate(
      { _id: activityId, userId, active: true },
      { active: false, updatedAt: new Date() },
      { new: true }
    );

    if (!pin) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    // Emit socket event to remove pin
    const io = req.app.get('io');
    if (io) {
      io.emit('pin:remove', { _id: pin._id });
    }

    res.json({ success: true, data: pin });
  } catch (error: any) {
    logger.error('Failed to end activity', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to end activity' });
  }
});

/**
 * GET /api/map/pins
 * Get nearby activity pins
 */
router.get('/pins', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'Location required' });
    }

    const pins = await MapPin.find({
      active: true,
      shareToMap: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseInt(maxDistance as string)
        }
      }
    })
      .populate('userId', 'firstName lastName avatar')
      .populate('petId', 'name breed photos')
      .sort('-createdAt')
      .limit(50)
      .lean();

    res.json({ success: true, data: pins });
  } catch (error: any) {
    logger.error('Failed to fetch pins', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch pins' });
  }
});

/**
 * POST /api/map/pins/:pinId/like
 * Like a pin
 */
router.post('/pins/:pinId/like', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const pin = await MapPin.findById(req.params.pinId);

    if (!pin) {
      return res.status(404).json({ success: false, error: 'Pin not found' });
    }

    const hasLiked = pin.likes.some(l => l.userId.toString() === userId);

    if (hasLiked) {
      pin.likes = pin.likes.filter(l => l.userId.toString() !== userId);
    } else {
      pin.likes.push({ userId: userId as any, likedAt: new Date() });
    }

    await pin.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('pin:like', { pinId: pin._id, userId, hasLiked });
    }

    res.json({ success: true, data: { likes: pin.likes.length } });
  } catch (error: any) {
    logger.error('Failed to like pin', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to like pin' });
  }
});

/**
 * POST /api/map/pins/:pinId/comment
 * Add comment to a pin
 */
router.post('/pins/:pinId/comment', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment text required' });
    }

    const pin = await MapPin.findById(req.params.pinId);

    if (!pin) {
      return res.status(404).json({ success: false, error: 'Pin not found' });
    }

    pin.comments.push({
      userId: userId as any,
      text: text.trim(),
      createdAt: new Date()
    });

    await pin.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('pin:comment', { pinId: pin._id, userId, text });
    }

    res.json({ success: true, data: { comments: pin.comments.length } });
  } catch (error: any) {
    logger.error('Failed to comment on pin', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to comment on pin' });
  }
});

export default router;

