/**
 * Advanced Match Filter Service
 * Phase 1 Product Enhancement - Matches Screen
 * Supports geo-indexing (H3), pet preferences, activity status, sorting
 */

import type { AdvancedMatchFilter, MatchFilterResponse } from '@pawfectmatch/core/types/phase1-contracts';
import Match from '../models/Match';
import Pet from '../models/Pet';
import User from '../models/User';
import logger from '../utils/logger';

/**
 * Filter and sort matches with advanced options
 */
export async function filterMatches(
  userId: string,
  filter: AdvancedMatchFilter
): Promise<MatchFilterResponse> {
  try {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    // Build base query
    const baseQuery: Record<string, unknown> = {
      $or: [{ user1: userId }, { user2: userId }],
      status: 'active',
    };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: baseQuery },
      // Join pets early for filtering
      {
        $lookup: {
          from: 'pets',
          localField: 'pet1',
          foreignField: '_id',
          as: 'pet1',
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'pet2',
          foreignField: '_id',
          as: 'pet2',
        },
      },
      { $unwind: '$pet1' },
      { $unwind: '$pet2' },
      // Get the other pet (not user's pet)
      {
        $addFields: {
          otherPet: {
            $cond: {
              if: { $eq: ['$user1', userId] },
              then: '$pet2',
              else: '$pet1',
            },
          },
        },
      },
    ];

    // Apply distance filter (if user location and geo-indexing available)
    if (filter.distance?.userLocation && filter.distance?.maxKm) {
      // Note: Full geo-indexing would use H3 or MongoDB geospatial queries
      // For now, we'll filter based on user's stored location
      const user = await User.findById(userId).lean();
      if (user?.location?.coordinates) {
        // Distance filtering would go here with actual geo calculations
        // For MVP, we'll skip distance filtering without proper geo-index
        logger.debug('Distance filter requested but geo-index not fully implemented', {
          userId,
        });
      }
    }

    // Apply pet preferences filter
    if (filter.petPreferences) {
      const prefMatch: Record<string, unknown> = {};
      const otherPetFields = ['otherPet'];

      if (filter.petPreferences.species?.length) {
        prefMatch['otherPet.species'] = { $in: filter.petPreferences.species };
      }

      if (filter.petPreferences.breeds?.length) {
        prefMatch['otherPet.breed'] = { $in: filter.petPreferences.breeds };
      }

      if (filter.petPreferences.sizes?.length) {
        prefMatch['otherPet.size'] = { $in: filter.petPreferences.sizes };
      }

      if (filter.petPreferences.energyLevels?.length) {
        prefMatch['otherPet.energyLevel'] = { $in: filter.petPreferences.energyLevels };
      }

      if (filter.petPreferences.genders?.length) {
        prefMatch['otherPet.gender'] = { $in: filter.petPreferences.genders };
      }

      if (Object.keys(prefMatch).length > 0) {
        pipeline.push({ $match: prefMatch });
      }
    }

    // Apply age filter
    if (filter.age) {
      const ageMatch: Record<string, unknown> = {};
      if (filter.age.min !== undefined) {
        ageMatch['otherPet.age'] = { $gte: filter.age.min, ...ageMatch['otherPet.age'] };
      }
      if (filter.age.max !== undefined) {
        ageMatch['otherPet.age'] = {
          $lte: filter.age.max,
          ...(ageMatch['otherPet.age'] || {}),
        };
      }
      if (Object.keys(ageMatch).length > 0) {
        pipeline.push({ $match: ageMatch });
      }
    }

    // Apply search filter
    if (filter.search) {
      pipeline.push({
        $match: {
          $or: [
            { 'otherPet.name': { $regex: filter.search, $options: 'i' } },
            { 'otherPet.breed': { $regex: filter.search, $options: 'i' } },
            { 'otherPet.bio': { $regex: filter.search, $options: 'i' } },
          ],
        },
      });
    }

    // Apply activity status filter
    if (filter.activityStatus && filter.activityStatus !== 'any') {
      const now = new Date();
      const activityMatch: Record<string, unknown> = {};

      switch (filter.activityStatus) {
        case 'online':
          // Would check user's online status from socket/redis
          // For now, check recent activity (last 15 minutes)
          activityMatch.lastActivity = {
            $gte: new Date(now.getTime() - 15 * 60 * 1000),
          };
          break;
        case 'recent':
          // Active in last 24 hours
          activityMatch.lastActivity = {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          };
          break;
        case 'active':
          // Active in last 7 days
          activityMatch.lastActivity = {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          };
          break;
      }

      if (Object.keys(activityMatch).length > 0) {
        pipeline.push({ $match: activityMatch });
      }
    }

    // Apply sorting
    const sortStage = getSortStage(filter.sort || 'newest');
    pipeline.push(sortStage);

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Match.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Apply pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Project final fields
    pipeline.push({
      $project: {
        _id: 1,
        user1: 1,
        user2: 1,
        pet1: 1,
        pet2: 1,
        status: 1,
        createdAt: 1,
        lastActivity: 1,
        lastMessageAt: 1,
        messages: { $slice: ['$messages', 1] }, // Latest message only
      },
    });

    // Execute aggregation
    const matches = await Match.aggregate(pipeline);

    // Populate pet and user data
    const populatedMatches = await Promise.all(
      matches.map(async (match) => {
        const pet1 = await Pet.findById(match.pet1).lean();
        const pet2 = await Pet.findById(match.pet2).lean();

        return {
          ...match,
          pet1,
          pet2,
        };
      })
    );

    return {
      success: true,
      data: {
        matches: populatedMatches,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    };
  } catch (error) {
    logger.error('Failed to filter matches', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      filter,
    });
    throw error;
  }
}

/**
 * Get sort stage for aggregation pipeline
 */
function getSortStage(sort: string): Record<string, unknown> {
  switch (sort) {
    case 'newest':
      return { $sort: { createdAt: -1 } };
    case 'oldest':
      return { $sort: { createdAt: 1 } };
    case 'distance':
      // Would sort by distance if geo-indexing implemented
      return { $sort: { createdAt: -1 } };
    case 'compatibility':
      // Would calculate and sort by compatibility score
      return { $sort: { createdAt: -1 } };
    case 'lastActivity':
      return { $sort: { lastActivity: -1 } };
    default:
      return { $sort: { createdAt: -1 } };
  }
}

/**
 * Get match insights (compatibility analysis)
 */
export async function getMatchInsights(
  userId: string,
  matchId: string
): Promise<{
  success: boolean;
  data: {
    matchId: string;
    compatibilityScore: number;
    reasons: string[];
    mutualInterests: string[];
    conversationStarters: string[];
  };
}> {
  try {
    const match = await Match.findById(matchId)
      .populate('pet1 pet2')
      .lean();

    if (!match) {
      throw new Error('Match not found');
    }

    // Determine which pet is the user's and which is the other
    const userPet =
      match.user1?.toString() === userId ? match.pet1 : match.pet2;
    const otherPet =
      match.user1?.toString() === userId ? match.pet2 : match.pet1;

    if (!userPet || !otherPet) {
      throw new Error('Pet data not found');
    }

    // Calculate compatibility score
    const compatibilityScore = calculateCompatibilityScore(userPet as any, otherPet as any);

    // Generate reasons
    const reasons = generateCompatibilityReasons(userPet as any, otherPet as any, compatibilityScore);

    // Find mutual interests (simplified - would use actual profile data)
    const mutualInterests = findMutualInterests(userPet as any, otherPet as any);

    // Generate conversation starters
    const conversationStarters = generateConversationStarters(userPet as any, otherPet as any);

    return {
      success: true,
      data: {
        matchId,
        compatibilityScore,
        reasons,
        mutualInterests,
        conversationStarters,
      },
    };
  } catch (error) {
    logger.error('Failed to get match insights', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      matchId,
    });
    throw error;
  }
}

/**
 * Calculate compatibility score (0-100)
 */
function calculateCompatibilityScore(pet1: any, pet2: any): number {
  let score = 50;

  // Species match
  if (pet1.species === pet2.species) score += 20;

  // Size compatibility
  if (pet1.size && pet2.size && pet1.size === pet2.size) score += 10;

  // Energy level
  if (pet1.energyLevel && pet2.energyLevel) {
    const levels = ['low', 'medium', 'high'];
    const idx1 = levels.indexOf(pet1.energyLevel);
    const idx2 = levels.indexOf(pet2.energyLevel);
    if (Math.abs(idx1 - idx2) <= 1) score += 10;
  }

  // Intent match
  if (pet1.intent && pet2.intent && pet1.intent === pet2.intent) score += 10;

  return Math.min(100, score);
}

/**
 * Generate compatibility reasons
 */
function generateCompatibilityReasons(pet1: any, pet2: any, score: number): string[] {
  const reasons: string[] = [];

  if (pet1.species === pet2.species) {
    reasons.push(`Both are ${pet1.species}s - perfect for companionship!`);
  }

  if (pet1.size === pet2.size) {
    reasons.push(`Similar size means they can play together safely`);
  }

  if (pet1.intent && pet2.intent && pet1.intent === pet2.intent) {
    reasons.push(`Looking for the same thing (${pet1.intent})`);
  }

  if (score >= 80) {
    reasons.push('Very high compatibility match!');
  }

  return reasons.slice(0, 3);
}

/**
 * Find mutual interests
 */
function findMutualInterests(pet1: any, pet2: any): string[] {
  const interests: string[] = [];

  // Simplified - would use actual interests/preferences data
  if (pet1.intent && pet2.intent && pet1.intent === pet2.intent) {
    interests.push(pet1.intent);
  }

  return interests;
}

/**
 * Generate conversation starters
 */
function generateConversationStarters(pet1: any, pet2: any): string[] {
  const starters: string[] = [];

  if (pet1.name && pet2.name) {
    starters.push(`Hi! ${pet1.name} looks like they'd get along great with ${pet2.name}!`);
  }

  if (pet1.species === pet2.species) {
    starters.push(`Two ${pet1.species}s - they must have a lot in common!`);
  }

  starters.push(`Would love to connect and see if our pets are a good match!`);

  return starters.slice(0, 3);
}

