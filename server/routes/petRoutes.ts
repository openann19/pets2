/**
 * Pet-First API Routes
 * Enhanced pet management with playdates, health tracking, and lost pet features
 */

import { Router } from 'express';
import type { Response, Request } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { Pet } from '../models/Pet';
import { User } from '../models/User';
import LostPetAlert from '../models/LostPetAlert';

interface PlaydateMatch {
  id: string;
  pet1: unknown;
  pet2: unknown;
  compatibilityScore: number;
  compatibilityFactors: {
    playStyle: number;
    energy: number;
    size: number;
    sociability: number;
    location: number;
  };
  recommendedActivities: string[];
  safetyNotes: string[];
  distanceKm: number;
}

const router = Router();

// Apply authentication to all pet routes
router.use(authenticateToken);

// GET /api/pets/my-pets - Get user's pets with enhanced data
router.get('/playdate-matches', authenticateToken, [
  query('size').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('location').optional().isString(),
  query('breed').optional().isString(),
  query('age').optional().isInt({ min: 0, max: 30 }).toInt(),
  query('energyLevel').optional().isIn(['low', 'medium', 'high']),
  query('playStyle').optional().isIn(['playful', 'calm', 'energetic', 'social']),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      size = 10,
      location,
      breed,
      age,
      energyLevel,
      playStyle
    } = req.query as {
      size?: string;
      location?: string;
      breed?: string;
      age?: string;
      energyLevel?: string;
      playStyle?: string;
    };

    const limit = Math.min(parseInt(size as string) || 10, 50);

    // Build match criteria
    const matchCriteria: any = {
      owner: { $ne: user._id },
      isActive: true
    };

    if (breed) matchCriteria.breed = breed;
    if (age) matchCriteria.age = parseInt(age as string);
    if (energyLevel) matchCriteria.energyLevel = energyLevel;
    if (playStyle) matchCriteria.playStyle = playStyle;

    // Location-based matching if provided
    if (location) {
      // This would require geocoding the location string to coordinates
      // For now, we'll skip location filtering in this implementation
    }

    const matches = await Pet.find(matchCriteria)
      .populate('owner', 'firstName lastName avatar location')
      .limit(limit)
      .sort({ createdAt: -1 });

    // Calculate compatibility scores
    const matchesWithScores = matches.map((pet: any) => ({
      ...pet.toObject(),
      compatibilityScore: Math.floor(Math.random() * 100) + 1 // Placeholder scoring
    }));

    res.json({
      matches: matchesWithScores,
      total: matchesWithScores.length
    });
  } catch (error) {
    console.error('Error finding playdate matches:', error);
    res.status(500).json({ error: 'Failed to find playdate matches' });
  }
});

// POST /api/pets - Create new pet with enhanced fields
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 50 }),
  body('species').isIn(['dog', 'cat', 'other']),
  body('breed').optional().trim().isLength({ max: 50 }),
  body('age').optional().isInt({ min: 0, max: 50 }),
  body('playStyle').optional().isArray(),
  body('energy').optional().isInt({ min: 1, max: 5 }),
  body('sociability').optional().isIn(['shy', 'neutral', 'social']),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const user = req.user as any;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const petData = {
      ...req.body,
      owner: user._id,
    };

    const pet = new Pet(petData);
    await pet.save();

    res.status(201).json({
      success: true,
      data: pet,
      message: 'Pet created successfully',
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pet',
    });
  }
});

// GET /api/pets/:petId/playdate-matches - Find compatible playdate partners
router.get('/:petId/playdate-matches', [
  param('petId').isMongoId(),
  query('distance').optional().isInt({ min: 1, max: 100 }),
  query('playStyles').optional().isArray(),
  query('energy').optional().isInt({ min: 1, max: 5 }),
  query('size').optional().isIn(['small', 'medium', 'large', 'xlarge']),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const user = req.user as any;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { petId } = req.params;
    const { size } = req.query;

    // Find the source pet
    const sourcePet = await Pet.findById(petId);
    if (!sourcePet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Build compatibility query
    interface PetMatchQuery {
      _id: { $ne: string };
      owner: { $ne: string };
      size?: string;
    }

    const query: PetMatchQuery = {
      _id: { $ne: petId as string }, // Exclude source pet
      owner: { $ne: user._id }, // Exclude user's own pets
    };

    // Add filters
    if (size && typeof size === 'string') {
      query.size = size;
    }

    // Find potential matches
    const potentialMatches = await Pet.find(query)
      .populate('owner', 'firstName lastName location')
      .limit(20);

    // Calculate compatibility scores
    const matches: PlaydateMatch[] = potentialMatches.map((pet: any) => {
      let score = 0;
      let distanceKm = 2.5; // Default distance estimate
      const factors = {
        playStyle: 0,
        energy: 0,
        size: 0,
        sociability: 0,
        location: 0,
      };

      // Play style compatibility (25% weight)
      if (sourcePet.playStyle && pet.playStyle) {
        const common = sourcePet.playStyle.filter((style: string) =>
          pet.playStyle!.includes(style)
        );
        factors.playStyle = (common.length / Math.max(sourcePet.playStyle.length, pet.playStyle.length)) * 25;
      }
      score += factors.playStyle;

      // Energy compatibility (25% weight)
      if (sourcePet.energy && pet.energy) {
        const energyDiff = Math.abs(sourcePet.energy - pet.energy);
        factors.energy = Math.max(0, 25 - (energyDiff * 5));
      }
      score += factors.energy;

      // Size compatibility (20% weight)
      if (sourcePet.size && pet.size) {
        const sizeOrder = { small: 1, medium: 2, large: 3, xlarge: 4 };
        const sizeDiff = Math.abs(sizeOrder[sourcePet.size as keyof typeof sizeOrder] - sizeOrder[pet.size as keyof typeof sizeOrder]);
        factors.size = Math.max(0, 20 - (sizeDiff * 5));
      }
      score += factors.size;

      // Sociability compatibility (15% weight)
      if (sourcePet.sociability && pet.sociability) {
        factors.sociability = sourcePet.sociability === pet.sociability ? 15 : 7.5;
      }
      score += factors.sociability;

      // Location compatibility (15% weight) - calculate actual distance
      if (sourcePet.location && pet.location) {
        // Haversine distance formula
        const lat1 = sourcePet.location.coordinates[1];
        const lon1 = sourcePet.location.coordinates[0];
        const lat2 = pet.location.coordinates[1];
        const lon2 = pet.location.coordinates[0];

        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Score based on distance: full points if within 5km, decreasing after
        if (distance <= 5) {
          factors.location = 15;
        } else if (distance <= 10) {
          factors.location = 10;
        } else if (distance <= 20) {
          factors.location = 5;
        } else {
          factors.location = 0;
        }
        distanceKm = distance;
      } else {
        factors.location = 15; // Assume within range if location data missing
        distanceKm = 2.5; // Default estimate
      }
      score += factors.location;

      // Determine recommended activities based on pet characteristics
      const activities = [];
      if (sourcePet.energyLevel === 'high' && pet.energyLevel === 'high') {
        activities.push('fetch', 'run', 'agility course');
      } else if (sourcePet.energyLevel === 'low' && pet.energyLevel === 'low') {
        activities.push('walk', 'relaxed play', 'socializing');
      } else {
        activities.push('walk', 'light play', 'exploration');
      }

      // Add breed-specific activities
      if ((sourcePet.breed && sourcePet.breed.toLowerCase().includes('retriever')) ||
          (pet.breed && pet.breed.toLowerCase().includes('retriever'))) {
        activities.push('fetch');
      }
      if ((sourcePet.breed && sourcePet.breed.toLowerCase().includes('shepherd')) ||
          (pet.breed && pet.breed.toLowerCase().includes('shepherd'))) {
        activities.push('training games');
      }

      return {
        id: `${sourcePet._id}-${pet._id}`,
        pet1: sourcePet,
        pet2: pet,
        compatibilityScore: Math.round(score),
        compatibilityFactors: factors,
        recommendedActivities: activities.slice(0, 3),
        safetyNotes: score < 70 ? ['Monitor initial interactions', 'Keep on leash initially'] : [],
        distanceKm: Math.round(distanceKm * 10) / 10,
      };
    });

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      success: true,
      data: matches.slice(0, 10), // Return top 10 matches
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to find matches';
    console.error('Error finding playdate matches:', error);
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

// PUT /api/pets/:petId - Update pet with enhanced fields
router.put('/:id', authenticateToken, [
  param('id').isMongoId(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('breed').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('age').optional().isInt({ min: 0, max: 30 }),
  body('weight').optional().isFloat({ min: 0.1, max: 200 }),
  body('energyLevel').optional().isIn(['low', 'medium', 'high']),
  body('playStyle').optional().isIn(['playful', 'calm', 'energetic', 'social']),
  body('bio').optional().isString().trim().isLength({ max: 500 }),
  body('isActive').optional().isBoolean(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const pet = await Pet.findOneAndUpdate(
      { _id: id, owner: user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found or access denied' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

// POST /api/pets/:petId/health - Add health record
router.post('/:id/health', authenticateToken, [
  param('id').isMongoId(),
  body('type').isIn(['vaccination', 'checkup', 'medication', 'injury', 'illness']),
  body('description').isString().trim().isLength({ min: 1, max: 500 }),
  body('date').isISO8601(),
  body('vetName').optional().isString().trim().isLength({ max: 100 }),
  body('cost').optional().isFloat({ min: 0 }),
  body('nextDueDate').optional().isISO8601(),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const healthData = req.body;

    // Verify pet ownership
    const pet = await Pet.findOne({ _id: id, owner: user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found or access denied' });
    }

    // Add health record to pet
    pet.healthRecords = pet.healthRecords || [];
    pet.healthRecords.push({
      ...healthData,
      date: new Date(healthData.date),
      nextDueDate: healthData.nextDueDate ? new Date(healthData.nextDueDate) : undefined,
    });

    await pet.save();

    res.status(201).json({
      message: 'Health record added successfully',
      record: pet.healthRecords[pet.healthRecords.length - 1]
    });
  } catch (error) {
    console.error('Error adding health record:', error);
    res.status(500).json({ error: 'Failed to add health record' });
  }
});

// GET /api/pets/:petId/health - Get health records
router.get('/:petId/health', [
  param('petId').isMongoId(),
], async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { petId } = req.params;

    const pet = await Pet.findOne({ _id: petId, owner: user._id });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Generate reminders from health records
    const reminders: Array<{ type: string; dueDate: Date; petId: string; message: string }> = [];

    if (pet.healthRecords?.vaccines) {
      pet.healthRecords.vaccines.forEach((vaccine: { nextDueDate?: Date; type?: string }) => {
        if (vaccine.nextDueDate) {
          reminders.push({
            type: 'vaccination',
            dueDate: vaccine.nextDueDate,
            petId: String(pet._id),
            message: `${vaccine.type || 'Vaccine'} booster due`
          });
        }
      });
    }

    res.json({
      success: true,
      data: {
        records: pet.healthRecords || { vaccines: [], medications: [] },
        reminders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health data';
    console.error('Error fetching health data:', error);
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

// POST /api/lost-pet-alerts - Create lost pet alert
router.post('/lost-pet-alerts', [
  body('petId').isMongoId(),
  body('lastSeenAt').isISO8601(),
  body('lastSeenLocation').isObject(),
  body('lastSeenLocation.lat').isFloat(),
  body('lastSeenLocation.lng').isFloat(),
  body('lastSeenLocation.address').trim().notEmpty(),
  body('description').trim().isLength({ min: 1 }),
  body('contactInfo.method').isIn(['inapp', 'phone', 'email']),
  body('contactInfo.value').trim().notEmpty(),
  body('reward').optional().isFloat({ min: 0 }),
  body('broadcastRadius').optional().isFloat({ min: 1, max: 100 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const user = req.user as any;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const pet = await Pet.findById(req.body.petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    if (String(pet.owner) !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create alert for this pet',
      });
    }

    const alert = new LostPetAlert({
      petId: req.body.petId,
      owner: user._id,
      status: 'active',
      lastSeenAt: new Date(req.body.lastSeenAt),
      lastSeenLocation: {
        type: 'Point',
        coordinates: [req.body.lastSeenLocation.lng, req.body.lastSeenLocation.lat],
        address: req.body.lastSeenLocation.address,
      },
      description: req.body.description,
      reward: req.body.reward,
      contactInfo: {
        method: req.body.contactInfo.method,
        value: req.body.contactInfo.value,
      },
      broadcastRadius: req.body.broadcastRadius || 10,
      sightings: [],
    });

    await alert.save();

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Lost pet alert created successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create alert';
    console.error('Error creating lost pet alert:', error);
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

export default router;
