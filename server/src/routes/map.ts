import express, { type Request, type Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import Pet from '../models/Pet';
import Match from '../models/Match';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    _id: string;
    email: string;
    [key: string]: unknown;
  };
}

const router: Router = express.Router();

// @desc    Get map statistics
// @route   GET /api/map/stats
// @access  Private
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get real statistics from database
    const [
      totalPets,
      activePets,
      recentMatches,
      recentActivity
    ] = await Promise.all([
      Pet.countDocuments(),
      Pet.countDocuments({ 
        'analytics.lastActive': { $gte: oneHourAgo } 
      }),
      Match.countDocuments({ 
        createdAt: { $gte: oneDayAgo } 
      }),
      Match.countDocuments({ 
        'analytics.events.timestamp': { $gte: oneHourAgo } 
      })
    ]);

    res.json({
      success: true,
      data: {
        totalPets,
        activePets,
        nearbyMatches: recentMatches,
        recentActivity
      }
    });
  } catch (error: unknown) {
    logger.error('Map stats error:', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch map statistics',
      error: error.message
    });
  }
});

// @desc    Get nearby pets
// @route   POST /api/map/nearby
// @access  Private
router.post('/nearby', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius = 5000 } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }

    const pets = await Pet.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [longitude, latitude],
            radius / 6371000
          ]
        }
      }
    }).populate('owner', 'firstName lastName avatar').limit(50);

    res.json({
      success: true,
      data: {
        pets: pets.map(pet => ({
          id: pet._id,
          name: pet.name,
          photos: pet.photos,
          location: pet.location,
          owner: pet.owner,
          distance: calculateDistance(
            latitude, longitude,
            pet.location.coordinates[1], pet.location.coordinates[0]
          )
        }))
      }
    });
  } catch (error: unknown) {
    logger.error('Nearby pets error:', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby pets',
      error: error.message
    });
  }
});

// @desc    Get map pins/activities
// @route   GET /api/map/pins
// @access  Private
router.get('/pins', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }

    // Get recent pet activities in the area
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const activities = await Pet.aggregate([
      {
        $match: {
          'location.coordinates': {
            $geoWithin: {
              $centerSphere: [
                [parseFloat(longitude as string), parseFloat(latitude as string)],
                parseFloat(radius as string) / 6371000
              ]
            }
          },
          'analytics.lastActive': { $gte: oneHourAgo }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $unwind: '$owner'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          photos: 1,
          location: 1,
          owner: {
            firstName: 1,
            lastName: 1,
            avatar: 1
          },
          'analytics.lastActive': 1
        }
      },
      {
        $limit: 100
      }
    ]);

    const pins = activities.map(activity => ({
      id: activity._id,
      petId: activity._id,
      ownerId: activity.owner._id,
      coordinates: activity.location.coordinates,
      activity: 'active',
      message: `${activity.name} is active nearby`,
      createdAt: activity.analytics.lastActive,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      pet: {
        name: activity.name,
        photos: activity.photos,
        owner: activity.owner
      }
    }));

    res.json({
      success: true,
      data: { pins }
    });
  } catch (error: unknown) {
    logger.error('Map pins error:', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch map pins',
      error: error.message
    });
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

