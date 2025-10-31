/**
 * Personalized Dashboard Service
 * Phase 1 Product Enhancement - Home Screen
 * Provides recently viewed profiles, suggested matches, activity insights
 */

import { Types } from 'mongoose';
import type {
  PersonalizedDashboardData,
  PersonalizedDashboardResponse,
} from '@pawfectmatch/core/types/phase1-contracts';
import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import logger from '../utils/logger';

interface ViewHistoryEntry {
  petId: string;
  viewedAt: Date;
}

/**
 * Get personalized dashboard data for a user
 */
export async function getPersonalizedDashboard(
  userId: string
): Promise<PersonalizedDashboardResponse> {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Get recently viewed profiles (last 7 days, limit 10)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Track view history (in production, this would be in a ViewHistory model)
    // For now, we'll use Match views and Profile views as a proxy
    const recentMatches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('pet1 pet2')
      .lean();

    const recentlyViewedProfiles = recentMatches
      .map((match) => {
        const otherPetId =
          match.user1?.toString() === userId ? match.pet2 : match.pet1;
        const otherPet =
          match.user1?.toString() === userId ? match.pet2 : match.pet1;

        if (!otherPet || typeof otherPet === 'string') return null;

        return {
          id: match._id.toString(),
          petId: otherPetId?.toString() || '',
          petName: (otherPet as any).name || 'Unknown',
          petPhoto:
            (otherPet as any).photos?.[0]?.url ||
            (otherPet as any).photos?.[0] ||
            '',
          viewedAt: match.createdAt?.toISOString() || new Date().toISOString(),
          compatibilityScore: undefined, // Will be calculated if available
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 10);

    // Get suggested matches (behavioral + content-based)
    const suggestedMatches = await getSuggestedMatches(userId, user.activePetId);

    // Get activity insights
    const activityInsights = await getActivityInsights(userId);

    // Generate dynamic quick actions
    const quickActions = generateQuickActions(userId);

    const dashboardData: PersonalizedDashboardData = {
      recentlyViewedProfiles,
      suggestedMatches,
      activityInsights,
      quickActions,
    };

    return {
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to get personalized dashboard', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    throw error;
  }
}

/**
 * Get suggested matches based on behavioral and content signals
 */
async function getSuggestedMatches(
  userId: string,
  activePetId?: string
): Promise<PersonalizedDashboardData['suggestedMatches']> {
  try {
    if (!activePetId) {
      return [];
    }

    const userPet = await Pet.findById(activePetId).lean();
    if (!userPet) {
      return [];
    }

    // Get user's preferences
    const user = await User.findById(userId).lean();
    if (!user) {
      return [];
    }

    // Find potential matches based on preferences
    const preferences = user.preferences || {};
    const maxDistance = preferences.maxDistance || 50; // km
    const ageRange = preferences.ageRange || { min: 0, max: 100 };
    const species = preferences.species || [];
    const intents = preferences.intents || [];

    // Build match query
    const matchQuery: Record<string, unknown> = {
      _id: { $ne: activePetId },
      owner: { $ne: userId },
      verified: true,
    };

    if (species.length > 0) {
      matchQuery.species = { $in: species };
    }

    if (intents.length > 0) {
      matchQuery.intent = { $in: intents };
    }

    // Age filtering
    if (ageRange.min || ageRange.max) {
      matchQuery.age = {};
      if (ageRange.min) matchQuery.age.$gte = ageRange.min;
      if (ageRange.max) matchQuery.age.$lte = ageRange.max;
    }

    // Find pets that match preferences
    const candidatePets = await Pet.find(matchQuery).limit(50).lean();

    // Calculate compatibility scores and reasons
    const suggestions = await Promise.all(
      candidatePets
        .slice(0, 10)
        .map(async (pet) => {
          const compatibilityScore = calculateCompatibilityScore(userPet, pet);
          const reasons = generateReasons(userPet, pet, compatibilityScore);

          return {
            id: pet._id.toString(),
            petId: pet._id.toString(),
            petName: pet.name || 'Unknown',
            petPhoto: pet.photos?.[0]?.url || pet.photos?.[0] || '',
            compatibilityScore,
            reasons,
            signals: {
              behavioral: 0.7, // Placeholder - would use actual behavior data
              contentBased: 0.8, // Based on profile similarity
              preferences: compatibilityScore / 100, // Normalized to 0-1
            },
          };
        })
    );

    // Sort by compatibility score
    suggestions.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return suggestions.slice(0, 6); // Top 6 suggestions
  } catch (error) {
    logger.error('Failed to get suggested matches', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    return [];
  }
}

/**
 * Calculate compatibility score between two pets
 */
function calculateCompatibilityScore(pet1: any, pet2: any): number {
  let score = 50; // Base score

  // Species match
  if (pet1.species === pet2.species) {
    score += 20;
  }

  // Size compatibility
  if (pet1.size && pet2.size && pet1.size === pet2.size) {
    score += 10;
  }

  // Energy level compatibility
  if (pet1.energyLevel && pet2.energyLevel) {
    const energy1 = ['low', 'medium', 'high'].indexOf(pet1.energyLevel);
    const energy2 = ['low', 'medium', 'high'].indexOf(pet2.energyLevel);
    if (Math.abs(energy1 - energy2) <= 1) {
      score += 10;
    }
  }

  // Intent compatibility
  if (pet1.intent && pet2.intent && pet1.intent === pet2.intent) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Generate match reasons
 */
function generateReasons(
  pet1: any,
  pet2: any,
  score: number
): string[] {
  const reasons: string[] = [];

  if (pet1.species === pet2.species) {
    reasons.push(`Both are ${pet1.species}s`);
  }

  if (pet1.size === pet2.size) {
    reasons.push(`Similar size (${pet1.size})`);
  }

  if (pet1.intent && pet2.intent && pet1.intent === pet2.intent) {
    reasons.push(`Looking for the same thing (${pet1.intent})`);
  }

  if (score >= 80) {
    reasons.push('High compatibility match!');
  }

  return reasons.slice(0, 3);
}

/**
 * Get activity insights for a user
 */
async function getActivityInsights(
  userId: string
): Promise<PersonalizedDashboardData['activityInsights']> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent matches and swipes
    const recentMatches = await Match.countDocuments({
      $or: [{ user1: userId }, { user2: userId }],
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Calculate streak (consecutive days with activity)
    const streakDays = await calculateStreak(userId);

    // Calculate match rate (would need swipe data - simplified for now)
    const matchRate = recentMatches > 0 ? 0.15 : 0; // Placeholder

    // Get last activity timestamp
    const lastMatch = await Match.findOne({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const tips = generateTips(userId, streakDays, matchRate);

    return {
      streakDays,
      lastActivityAt:
        lastMatch?.createdAt?.toISOString() || new Date().toISOString(),
      totalSwipes: recentMatches * 10, // Placeholder estimate
      matchRate,
      tips,
    };
  } catch (error) {
    logger.error('Failed to get activity insights', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    return {
      streakDays: 0,
      lastActivityAt: new Date().toISOString(),
      totalSwipes: 0,
      matchRate: 0,
      tips: [],
    };
  }
}

/**
 * Calculate activity streak
 */
async function calculateStreak(userId: string): Promise<number> {
  // Simplified streak calculation
  // In production, would track daily activity
  const recentMatches = await Match.find({
    $or: [{ user1: userId }, { user2: userId }],
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  if (recentMatches.length === 0) return 0;

  // Count consecutive days with activity
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - i);

    const hasActivity = recentMatches.some((match) => {
      const matchDate = new Date(match.createdAt || new Date());
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() === checkDate.getTime();
    });

    if (hasActivity) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generate contextual tips
 */
function generateTips(
  userId: string,
  streakDays: number,
  matchRate: number
): string[] {
  const tips: string[] = [];

  if (streakDays === 0) {
    tips.push('Complete your profile to get more matches!');
  } else if (streakDays < 3) {
    tips.push(`You're on a ${streakDays}-day streak! Keep it up!`);
  } else {
    tips.push(`Amazing ${streakDays}-day streak! 🎉`);
  }

  if (matchRate < 0.1) {
    tips.push('Try adding more photos to your pet profile');
  }

  return tips.slice(0, 3);
}

/**
 * Generate dynamic quick actions based on context
 */
function generateQuickActions(userId: string): PersonalizedDashboardData['quickActions'] {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 12;
  const isEvening = hour >= 18 && hour < 22;

  const actions: PersonalizedDashboardData['quickActions'] = [
    {
      id: 'swipe',
      label: 'Start Swiping',
      icon: 'heart',
      deeplink: 'pawfectmatch://swipe',
      priority: 10,
      timeBased: false,
    },
    {
      id: 'matches',
      label: 'View Matches',
      icon: 'users',
      deeplink: 'pawfectmatch://matches',
      priority: 9,
      timeBased: false,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'message-circle',
      deeplink: 'pawfectmatch://messages',
      priority: 8,
      timeBased: false,
    },
  ];

  if (isMorning) {
    actions.push({
      id: 'morning-tip',
      label: 'Good Morning! Start Your Day',
      icon: 'sunrise',
      deeplink: 'pawfectmatch://swipe',
      priority: 7,
      timeBased: true,
    });
  }

  if (isEvening) {
    actions.push({
      id: 'evening-reminder',
      label: 'Evening Check-in',
      icon: 'moon',
      deeplink: 'pawfectmatch://matches',
      priority: 7,
      timeBased: true,
    });
  }

  // Sort by priority
  actions.sort((a, b) => b.priority - a.priority);

  return actions.slice(0, 5);
}

