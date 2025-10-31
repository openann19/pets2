import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
const logger = require('../utils/logger');

// Event types enum
export const EVENT_TYPES = {
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  PET_CREATE: 'pet_create',
  PET_VIEW: 'pet_view',
  PET_LIKE: 'pet_like',
  PET_SUPERLIKE: 'pet_superlike',
  PET_PASS: 'pet_pass',
  MATCH_CREATE: 'match_create',
  MESSAGE_SEND: 'message_send',
  PROFILE_UPDATE: 'profile_update',
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  PREMIUM_FEATURE_USE: 'premium_feature_use',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Interface for analytics event
export interface AnalyticsEvent {
  type: EventType;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

// Interface for user analytics
export interface UserAnalytics {
  totalSwipes?: number;
  totalLikes?: number;
  totalMatches?: number;
  profileViews?: number;
  lastActive?: Date;
  totalPetsCreated?: number;
  totalMessagesSent?: number;
  totalSubscriptionsStarted?: number;
  totalSubscriptionsCancelled?: number;
  totalPremiumFeaturesUsed?: number;
  events?: AnalyticsEvent[];
}

// Interface for user analytics result
export interface UserAnalyticsResult extends UserAnalytics {
  period: string;
  periodStart: Date;
  periodEnd: Date;
}

// Interface for pet analytics
export interface PetAnalyticsResult {
  views: number;
  likes: number;
  superLikes: number;
  matches: number;
  messages: number;
  lastViewed?: Date;
  events: AnalyticsEvent[];
}

// Interface for match analytics
export interface MatchAnalyticsResult {
  totalMatches: number;
  activeMatches: number;
  totalMessages: number;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  matches: Array<{
    id: string;
    pet1Name: string;
    pet2Name: string;
    lastMessage?: {
      content?: string;
      sentAt?: Date;
      sender?: string;
    };
    createdAt: Date;
  }>;
}

// Interface for match event analytics
export interface MatchEventAnalytics {
  events: AnalyticsEvent[];
  pet1Name: string;
  pet2Name: string;
  createdAt: Date;
  lastMessage?: {
    content?: string;
    sentAt?: Date;
    sender?: string;
  };
}

type PeriodType = 'day' | 'week' | 'month' | 'year';

/**
 * Track user event
 * @param userId - User ID
 * @param eventType - Event type
 * @param metadata - Additional metadata
 * @returns Success status
 */
export const trackUserEvent = async (
  userId: string,
  eventType: EventType,
  metadata: Record<string, unknown> = {}
): Promise<{ success: boolean; userId: string; eventType: EventType } | null> => {
  try {
    if (!userId || !eventType) {
      logger.warn('Invalid parameters for trackUserEvent', { userId, eventType });
      return null;
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn('User not found for analytics tracking', { userId, eventType });
      return null;
    }

    // Initialize analytics object if it doesn't exist
    if (!user.analytics) {
      user.analytics = {
        totalSwipes: 0,
        totalLikes: 0,
        totalMatches: 0,
        profileViews: 0,
        lastActive: new Date(),
        totalPetsCreated: 0,
        totalMessagesSent: 0,
        totalSubscriptionsStarted: 0,
        totalSubscriptionsCancelled: 0,
        totalPremiumFeaturesUsed: 0,
        events: []
      };
    }

    // Update user analytics based on event type
    switch (eventType) {
      case EVENT_TYPES.USER_LOGIN:
        if (user.analytics) {
          user.analytics.lastActive = new Date();
        }
        break;
      case EVENT_TYPES.PET_CREATE:
        if (user.analytics) {
          user.analytics.totalPetsCreated = (user.analytics.totalPetsCreated || 0) + 1;
        }
        break;
      case EVENT_TYPES.PET_LIKE:
      case EVENT_TYPES.PET_SUPERLIKE:
        if (user.analytics) {
          user.analytics.totalLikes = (user.analytics.totalLikes || 0) + 1;
        }
        break;
      case EVENT_TYPES.MATCH_CREATE:
        if (user.analytics) {
          user.analytics.totalMatches = (user.analytics.totalMatches || 0) + 1;
        }
        break;
      case EVENT_TYPES.MESSAGE_SEND:
        if (user.analytics) {
          user.analytics.totalMessagesSent = (user.analytics.totalMessagesSent || 0) + 1;
        }
        break;
      case EVENT_TYPES.SUBSCRIPTION_START:
        if (user.analytics) {
          user.analytics.totalSubscriptionsStarted = (user.analytics.totalSubscriptionsStarted || 0) + 1;
        }
        break;
      case EVENT_TYPES.SUBSCRIPTION_CANCEL:
        if (user.analytics) {
          user.analytics.totalSubscriptionsCancelled = (user.analytics.totalSubscriptionsCancelled || 0) + 1;
        }
        break;
      case EVENT_TYPES.PREMIUM_FEATURE_USE:
        if (user.analytics) {
          user.analytics.totalPremiumFeaturesUsed = (user.analytics.totalPremiumFeaturesUsed || 0) + 1;
        }
        break;
      default:
        logger.warn('Unknown event type for user analytics', { userId, eventType });
    }

    // Add event to user's event log
    if (user.analytics) {
      user.analytics.events = user.analytics.events || [];
      user.analytics.events.push({
        type: eventType,
        timestamp: new Date(),
        metadata,
      });

      // Keep only last 100 events
      if (user.analytics.events.length > 100) {
        user.analytics.events = user.analytics.events.slice(-100);
      }
    }

    await user.save();
    
    logger.info('User event tracked successfully', { userId, eventType });
    return { success: true, userId, eventType };
  } catch (error) {
    logger.error('Error tracking user event', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      userId,
      eventType,
      metadata
    });
    
    // Return error info instead of throwing to avoid breaking main flow
    return null;
  }
};

/**
 * Track pet event
 * @param petId - Pet ID
 * @param eventType - Event type
 * @param userId - User ID who triggered the event
 * @param metadata - Additional metadata
 */
export const trackPetEvent = async (
  petId: string,
  eventType: EventType,
  userId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> => {
  try {
    const pet = await Pet.findById(petId);
    if (!pet) return;

    // Initialize pet analytics if it doesn't exist
    if (!pet.analytics) {
      pet.analytics = {
        views: 0,
        likes: 0,
        superLikes: 0,
        matches: 0,
        messages: 0,
        events: []
      };
    }

    // Update pet analytics based on event type
    switch (eventType) {
      case EVENT_TYPES.PET_VIEW:
        if (pet.analytics) {
          pet.analytics.views = (pet.analytics.views || 0) + 1;
          pet.analytics.lastViewed = new Date();
        }
        break;
      case EVENT_TYPES.PET_LIKE:
        if (pet.analytics) {
          pet.analytics.likes = (pet.analytics.likes || 0) + 1;
        }
        break;
      case EVENT_TYPES.PET_SUPERLIKE:
        if (pet.analytics) {
          pet.analytics.superLikes = (pet.analytics.superLikes || 0) + 1;
        }
        break;
      case EVENT_TYPES.MATCH_CREATE:
        if (pet.analytics) {
          pet.analytics.matches = (pet.analytics.matches || 0) + 1;
        }
        break;
      case EVENT_TYPES.MESSAGE_SEND:
        if (pet.analytics) {
          pet.analytics.messages = (pet.analytics.messages || 0) + 1;
        }
        break;
    }

    // Add event to pet's event log
    if (pet.analytics) {
      pet.analytics.events = pet.analytics.events || [];
      pet.analytics.events.push({
        type: eventType,
        userId,
        timestamp: new Date(),
        metadata,
      });

      // Keep only last 50 events
      if (pet.analytics.events.length > 50) {
        pet.analytics.events = pet.analytics.events.slice(-50);
      }
    }

    await pet.save();
  } catch (error) {
    logger.error('Error tracking pet event', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      petId,
      eventType,
      userId,
      metadata
    });
  }
};

/**
 * Track match event
 * @param matchId - Match ID
 * @param eventType - Event type
 * @param userId - User ID
 * @param metadata - Additional metadata
 */
export const trackMatchEvent = async (
  matchId: string,
  eventType: EventType,
  userId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> => {
  try {
    const match = await Match.findById(matchId);
    if (!match) return;

    // Initialize analytics if it doesn't exist
    if (!match.analytics) {
      match.analytics = { events: [] };
    }

    // Add event to match's event log
    if (match.analytics && !match.analytics.events) {
      match.analytics.events = [];
    }
    if (match.analytics?.events) {
      match.analytics.events.push({
        type: eventType,
        userId,
        timestamp: new Date(),
        metadata,
      });

      // Keep only last 20 events
      if (match.analytics.events.length > 20) {
        match.analytics.events = match.analytics.events.slice(-20);
      }
    }

    await match.save();
  } catch (error) {
    logger.error('Error tracking match event', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      matchId,
      eventType,
      userId,
      metadata
    });
  }
};

/**
 * Get user analytics
 * @param userId - User ID
 * @param period - Time period (day, week, month, year)
 * @returns User analytics data
 */
export const getUserAnalytics = async (
  userId: string,
  period: PeriodType = 'week'
): Promise<UserAnalyticsResult | null> => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Filter events by period
    const recentEvents = (user.analytics?.events || []).filter((event: AnalyticsEvent) => 
      new Date(event.timestamp) >= startDate
    );

    return {
      totalSwipes: user.analytics?.totalSwipes || 0,
      totalLikes: user.analytics?.totalLikes || 0,
      totalMatches: user.analytics?.totalMatches || 0,
      profileViews: user.analytics?.profileViews || 0,
      lastActive: user.analytics?.lastActive,
      totalPetsCreated: user.analytics?.totalPetsCreated || 0,
      totalMessagesSent: user.analytics?.totalMessagesSent || 0,
      totalSubscriptionsStarted: user.analytics?.totalSubscriptionsStarted || 0,
      totalSubscriptionsCancelled: user.analytics?.totalSubscriptionsCancelled || 0,
      totalPremiumFeaturesUsed: user.analytics?.totalPremiumFeaturesUsed || 0,
      events: recentEvents,
      period,
      periodStart: startDate,
      periodEnd: now,
    };
  } catch (error) {
    logger.error('Error getting user analytics', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      userId,
      period
    });
    return null;
  }
};

/**
 * Get pet analytics
 * @param petId - Pet ID
 * @returns Pet analytics data
 */
export const getPetAnalytics = async (
  petId: string
): Promise<PetAnalyticsResult | null> => {
  try {
    const pet = await Pet.findById(petId);
    if (!pet) return null;

    return {
      views: pet.analytics?.views || 0,
      likes: pet.analytics?.likes || 0,
      superLikes: pet.analytics?.superLikes || 0,
      matches: pet.analytics?.matches || 0,
      messages: pet.analytics?.messages || 0,
      lastViewed: pet.analytics?.lastViewed,
      events: pet.analytics?.events || [],
    };
  } catch (error) {
    logger.error('Error getting pet analytics', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      petId
    });
    return null;
  }
};

/**
 * Get match analytics
 * @param matchIdOrUserId - Match ID or User ID
 * @param period - Time period
 * @returns Match analytics data
 */
export const getMatchAnalytics = async (
  matchIdOrUserId: string,
  period: PeriodType = 'week'
): Promise<MatchAnalyticsResult | MatchEventAnalytics | null> => {
  try {
    // If it's a user ID, get match analytics for that user
    if (matchIdOrUserId.length === 24) { // MongoDB ObjectId length
      const user = await User.findById(matchIdOrUserId);
      if (!user) return null;

      // Get all matches for this user
      const matches = await Match.find({
        $or: [
          { 'pet1.owner': matchIdOrUserId },
          { 'pet2.owner': matchIdOrUserId }
        ]
      });

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Aggregate match analytics
      interface MatchWithPopulatedPets {
        _id: { toString: () => string };
        pet1?: { name?: string };
        pet2?: { name?: string };
        lastMessage?: {
          timestamp?: Date | string;
          content?: string;
        };
        createdAt: Date;
        analytics?: {
          events?: Array<{
            type?: string;
            timestamp?: Date | string;
          }>;
        };
      }
      
      const totalMatches = matches.length;
      const activeMatches = matches.filter((match) => {
        const matchWithPets = match as unknown as MatchWithPopulatedPets;
        return matchWithPets.lastMessage && new Date(matchWithPets.lastMessage.timestamp || 0) >= startDate;
      }).length;

      const totalMessages = matches.reduce((sum, match) => {
        const matchWithPets = match as unknown as MatchWithPopulatedPets;
        const messageEvents = matchWithPets.analytics?.events?.filter((event) => 
          event.type === 'message_send' && new Date(event.timestamp || 0) >= startDate
        ) || [];
        return sum + messageEvents.length;
      }, 0);

      return {
        totalMatches,
        activeMatches,
        totalMessages,
        period,
        periodStart: startDate,
        periodEnd: now,
        matches: matches.map((match) => {
          const matchWithPets = match as unknown as MatchWithPopulatedPets;
          return {
            id: matchWithPets._id.toString(),
            pet1Name: matchWithPets.pet1?.name || 'Unknown',
            pet2Name: matchWithPets.pet2?.name || 'Unknown',
            lastMessage: matchWithPets.lastMessage,
            createdAt: matchWithPets.createdAt,
          };
        })
      };
    } else {
      // If it's a match ID, get analytics for that specific match
      const match = await Match.findById(matchIdOrUserId).populate('pet1 pet2');
      if (!match) return null;
      
      interface MatchWithPopulatedData {
        pet1?: { name?: string };
        pet2?: { name?: string };
        lastMessage?: {
          content?: string;
          sentAt?: Date;
        };
        createdAt: Date;
        analytics?: {
          events?: AnalyticsEvent[];
        };
      }
      
      const matchWithData = match as unknown as MatchWithPopulatedData;

      return {
        events: matchWithData.analytics?.events || [],
        pet1Name: matchWithData.pet1?.name || 'Unknown',
        pet2Name: matchWithData.pet2?.name || 'Unknown',
        createdAt: matchWithData.createdAt,
        lastMessage: matchWithData.lastMessage,
      };
    }
  } catch (error) {
    logger.error('Error getting match analytics', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      matchIdOrUserId,
      period
    });
    return null;
  }
};

// Export default object for backward compatibility
export default {
  EVENT_TYPES,
  trackUserEvent,
  trackPetEvent,
  trackMatchEvent,
  getUserAnalytics,
  getPetAnalytics,
  getMatchAnalytics,
};

