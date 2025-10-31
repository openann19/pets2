/**
 * Pet Chat Controller
 * Backend controller for pet-centric chat features
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import Match from '../models/Match';
import Pet from '../models/Pet';
import User from '../models/User';
import logger from '../utils/logger';
import { calculateCompatibilityScore } from '../../core/src/utils';
import type {
  PetProfileCard,
  CompatibilityIndicator,
  PlaydateProposal,
  PetHealthAlert,
} from '../../core/src/types/pet-chat';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface SharePetProfileRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  body: {
    petId: string;
  };
}

interface GetCompatibilityRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  query: {
    pet1Id?: string;
    pet2Id?: string;
  };
}

interface CreatePlaydateRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  body: {
    proposedTime: string;
    duration?: number;
    venueId?: string;
    location?: {
      name: string;
      address: string;
      coordinates: { lat: number; lng: number };
    };
    notes?: string;
  };
}

interface HealthAlertRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  body: {
    petId: string;
    type: 'vaccination' | 'vet_appointment' | 'medication' | 'health_update' | 'emergency';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    date?: string;
    location?: {
      name: string;
      address: string;
      coordinates?: { lat: number; lng: number };
    };
    metadata?: {
      recordId?: string;
      vetName?: string;
      clinicName?: string;
      reminderDate?: string;
    };
  };
}

/**
 * @desc    Share pet profile in chat
 * @route   POST /api/chat/:matchId/share-pet-profile
 * @access  Private
 */
export const sharePetProfile = async (
  req: SharePetProfileRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { petId } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    const pet = await Pet.findById(petId);
    if (!pet || pet.owner.toString() !== req.userId) {
      res.status(404).json({
        success: false,
        message: 'Pet not found or access denied',
      });
      return;
    }

    // Create pet profile card
    const petProfileCard: PetProfileCard = {
      petId: pet._id.toString(),
      petName: pet.name,
      breed: pet.breed || 'Unknown',
      age: pet.age || 0,
      species: pet.species as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
      photos: pet.photos || [],
      personality: pet.personalityTags || [],
      size: pet.size || 'medium',
      energy: pet.energy as 1 | 2 | 3 | 4 | 5 | undefined,
      sociability: pet.sociability as 'shy' | 'neutral' | 'social' | undefined,
      bio: pet.bio,
      badges: pet.badges as
        | ('vaccinated' | 'microchipped' | 'spayed_neutered' | 'trained' | 'rescue')[]
        | undefined,
      verificationStatus: pet.verificationStatus as
        | 'unverified'
        | 'pending'
        | 'verified'
        | undefined,
    };

    // Send message with pet profile card
    const message = await match.addMessage(
      req.userId,
      `Shared ${pet.name}'s profile`,
      'pet_profile',
      [],
      undefined,
    );

    // Store pet profile card data in message metadata
    const lastMessage = match.messages[match.messages.length - 1];
    (lastMessage as any).petProfileCard = petProfileCard;
    await match.save();

    await lastMessage.populate([
      { path: 'sender', select: 'firstName lastName avatar' },
    ]);

    res.status(201).json({
      success: true,
      data: {
        message: {
          ...lastMessage.toObject(),
          petProfileCard,
        },
      },
    });
  } catch (error) {
    logger.error('Share pet profile error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to share pet profile',
    });
  }
};

/**
 * @desc    Get compatibility indicator for pets in match
 * @route   GET /api/chat/:matchId/compatibility
 * @access  Private
 */
export const getCompatibilityIndicator = async (
  req: GetCompatibilityRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { pet1Id, pet2Id } = req.query;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    }).populate('pet1 pet2');

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    const pet1 = pet1Id
      ? await Pet.findById(pet1Id)
      : (match.pet1 as any);
    const pet2 = pet2Id
      ? await Pet.findById(pet2Id)
      : (match.pet2 as any);

    if (!pet1 || !pet2) {
      res.status(404).json({
        success: false,
        message: 'Pets not found',
      });
      return;
    }

    // Calculate compatibility score
    const compatibilityScore = calculateCompatibilityScore(pet1, pet2);

    // Build compatibility factors
    const factors: CompatibilityIndicator['factors'] = [];

    // Species match
    if (pet1.species === pet2.species) {
      factors.push({
        type: 'personality',
        score: 100,
        description: 'Same species - great match!',
        positive: true,
      });
    }

    // Size compatibility
    const sizeCompatibility = calculateSizeCompatibility(pet1.size, pet2.size);
    if (sizeCompatibility > 0.7) {
      factors.push({
        type: 'size',
        score: sizeCompatibility * 100,
        description: 'Compatible sizes for safe play',
        positive: true,
      });
    }

    // Energy level match
    if (pet1.energy === pet2.energy) {
      factors.push({
        type: 'energy',
        score: 100,
        description: 'Similar energy levels',
        positive: true,
      });
    } else if (pet1.energy && pet2.energy) {
      const energyDiff = Math.abs(pet1.energy - pet2.energy);
      if (energyDiff <= 1) {
        factors.push({
          type: 'energy',
          score: 75,
          description: 'Compatible energy levels',
          positive: true,
        });
      }
    }

    // Personality tags overlap
    const commonTags = (pet1.personalityTags || []).filter((tag: string) =>
      (pet2.personalityTags || []).includes(tag),
    );
    if (commonTags.length > 0) {
      factors.push({
        type: 'personality',
        score: (commonTags.length / Math.max(pet1.personalityTags?.length || 1, pet2.personalityTags?.length || 1)) * 100,
        description: `Shared traits: ${commonTags.slice(0, 3).join(', ')}`,
        positive: true,
      });
    }

    // Age compatibility
    if (pet1.age && pet2.age) {
      const ageDiff = Math.abs(pet1.age - pet2.age);
      if (ageDiff <= 2) {
        factors.push({
          type: 'age',
          score: Math.max(0, 100 - ageDiff * 20),
          description: 'Similar age - great for playdates',
          positive: true,
        });
      }
    }

    // Build compatibility breakdown
    const compatibilityBreakdown = {
      playStyle: Math.floor(Math.random() * 30) + 60, // Placeholder - implement actual calculation
      energy: pet1.energy && pet2.energy
        ? Math.max(0, 100 - Math.abs(pet1.energy - pet2.energy) * 20)
        : 70,
      size: sizeCompatibility * 100,
      sociability: pet1.sociability === pet2.sociability ? 100 : 70,
      location: 80, // Placeholder - implement location-based calculation
    };

    const indicator: CompatibilityIndicator = {
      score: compatibilityScore,
      factors,
      recommendedActivities: generateRecommendedActivities(pet1, pet2),
      compatibilityBreakdown,
    };

    res.json({
      success: true,
      data: indicator,
    });
  } catch (error) {
    logger.error('Get compatibility indicator error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get compatibility indicator',
    });
  }
};

/**
 * @desc    Create playdate proposal
 * @route   POST /api/chat/:matchId/playdate-proposal
 * @access  Private
 */
export const createPlaydateProposal = async (
  req: CreatePlaydateRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { proposedTime, duration, venueId, location, notes } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    const proposal: PlaydateProposal = {
      proposalId: `proposal_${Date.now()}`,
      matchId,
      proposedBy: req.userId,
      proposedAt: new Date().toISOString(),
      proposedTime,
      duration,
      venue: venueId ? await getVenueById(venueId) : undefined,
      location,
      notes,
      status: 'proposed',
    };

    // Send message with playdate proposal
    const message = await match.addMessage(
      req.userId,
      `Proposed a playdate for ${new Date(proposedTime).toLocaleDateString()}`,
      'playdate_proposal',
      [],
      undefined,
    );

    const lastMessage = match.messages[match.messages.length - 1];
    (lastMessage as any).playdateProposal = proposal;
    await match.save();

    await lastMessage.populate([
      { path: 'sender', select: 'firstName lastName avatar' },
    ]);

    res.status(201).json({
      success: true,
      data: {
        proposal,
        message: {
          ...lastMessage.toObject(),
          playdateProposal: proposal,
        },
      },
    });
  } catch (error) {
    logger.error('Create playdate proposal error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create playdate proposal',
    });
  }
};

/**
 * @desc    Create health alert
 * @route   POST /api/chat/:matchId/health-alert
 * @access  Private
 */
export const createHealthAlert = async (
  req: HealthAlertRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { petId, type, title, message, priority, date, location, metadata } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    const pet = await Pet.findById(petId);
    if (!pet || pet.owner.toString() !== req.userId) {
      res.status(404).json({
        success: false,
        message: 'Pet not found or access denied',
      });
      return;
    }

    const alert: PetHealthAlert = {
      alertId: `alert_${Date.now()}`,
      petId,
      type,
      title,
      message,
      priority,
      date,
      location,
      metadata,
      sharedWith: [match.user1.toString(), match.user2.toString()],
    };

    // Send message with health alert
    const chatMessage = await match.addMessage(
      req.userId,
      `Health alert: ${title}`,
      'health_alert',
      [],
      undefined,
    );

    const lastMessage = match.messages[match.messages.length - 1];
    (lastMessage as any).healthAlert = alert;
    await match.save();

    await lastMessage.populate([
      { path: 'sender', select: 'firstName lastName avatar' },
    ]);

    res.status(201).json({
      success: true,
      data: {
        alert,
        message: {
          ...lastMessage.toObject(),
          healthAlert: alert,
        },
      },
    });
  } catch (error) {
    logger.error('Create health alert error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create health alert',
    });
  }
};

// Helper functions
function calculateSizeCompatibility(
  size1: string | undefined,
  size2: string | undefined,
): number {
  if (!size1 || !size2) return 0.5;

  const sizeOrder = ['tiny', 'small', 'medium', 'large', 'extra-large'];
  const index1 = sizeOrder.indexOf(size1);
  const index2 = sizeOrder.indexOf(size2);

  if (index1 === -1 || index2 === -1) return 0.5;

  const diff = Math.abs(index1 - index2);
  return Math.max(0, 1 - diff * 0.2);
}

function generateRecommendedActivities(pet1: any, pet2: any): string[] {
  const activities: string[] = [];

  if (pet1.species === 'dog' && pet2.species === 'dog') {
    activities.push('Dog park playdate', 'Fetch session', 'Group walk');
  } else if (pet1.species === 'cat' && pet2.species === 'cat') {
    activities.push('Indoor play session', 'Interactive toys', 'Cat tree exploration');
  } else {
    activities.push('Supervised introduction', 'Neutral territory meetup');
  }

  if (pet1.energy && pet2.energy && Math.max(pet1.energy, pet2.energy) >= 4) {
    activities.push('Active play session', 'Running exercise');
  } else if (pet1.energy && pet2.energy && Math.max(pet1.energy, pet2.energy) <= 2) {
    activities.push('Relaxed social time', 'Quiet play');
  }

  return activities.slice(0, 5);
}

async function getVenueById(venueId: string): Promise<any> {
  // Placeholder - implement actual venue lookup
  return {
    venueId,
    name: 'Pet Park',
    type: 'park',
    address: 'Unknown',
    coordinates: { lat: 0, lng: 0 },
    amenities: [],
    petPolicies: {
      allowed: true,
      leashedRequired: true,
    },
    rating: 4,
    reviews: 0,
  };
}

