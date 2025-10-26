import express, { type Request, type Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import Event from '../models/Event';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  userId: string; // Required - set by authenticateToken middleware
  user?: {
    _id: string;
    email: string;
    [key: string]: any;
  };
}

const router: Router = express.Router();

// @desc    Get nearby events
// @route   POST /api/events/nearby
// @access  Private
router.post('/nearby', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius = 10 } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required as numbers'
      });
      return;
    }

    const meters = Math.max(0, Number(radius) || 10) * 1000;

    const results = await Event.find({
      date: { $gte: new Date() },
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: meters
        }
      }
    })
      .limit(50)
      .lean();

    const events = results.map((ev: any) => ({
      id: ev._id,
      title: ev.title,
      description: ev.description,
      date: ev.date,
      time: ev.time,
      category: ev.category,
      attendees: ev.attendees,
      maxAttendees: ev.maxAttendees,
      price: ev.price,
      tags: ev.tags,
      location: {
        name: ev.location?.name,
        address: ev.location?.address,
        coordinates: { lat: (ev.location?.coordinates as any)?.coordinates?.[1], lng: (ev.location?.coordinates as any)?.coordinates?.[0] }
      },
      distance: calculateDistance(latitude, longitude, (ev.location?.coordinates as any)?.coordinates?.[1], (ev.location?.coordinates as any)?.coordinates?.[0])
    }));

    res.json({ success: true, data: { events } });
  } catch (error: any) {
    logger.error('Nearby events error:', { error });
    res.status(500).json({ success: false, message: 'Failed to fetch nearby events', error: error.message });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      maxAttendees,
      price,
      tags
    } = req.body;

    if (!title || !description || !date || !location) {
      res.status(400).json({ success: false, message: 'Title, description, date, and location are required' });
      return;
    }

    // Normalize location to GeoJSON [lng, lat]
    const lng = location?.coordinates?.lng ?? location?.coordinates?.longitude ?? location?.lng ?? location?.longitude;
    const lat = location?.coordinates?.lat ?? location?.coordinates?.latitude ?? location?.lat ?? location?.latitude;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ success: false, message: 'Location coordinates (lat, lng) are required as numbers' });
      return;
    }

    const eventDoc = await Event.create({
      title,
      description,
      date: new Date(date),
      time: time || '12:00 PM',
      category: category || 'general',
      maxAttendees: maxAttendees || 20,
      price: price || 0,
      tags: tags || [],
      organizer: (req as AuthenticatedRequest).userId,
      location: {
        name: location?.name,
        address: location?.address,
        coordinates: { type: 'Point', coordinates: [lng, lat] }
      }
    });

    res.json({ success: true, data: { event: eventDoc } });
  } catch (error: any) {
    logger.error('Create event error:', { error });
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default router;

