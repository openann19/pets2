import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import AnalyticsEvent from '../models/AnalyticsEvent';
import logger from '../utils/logger';
import { AnalyticsService } from '../types';

// Event types
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

// Track user event
export const trackUserEvent = async (userId: string, eventType: string, metadata: any = {}): Promise<any> => {
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
      user.analytics = {};
    }

    // Update user analytics based on event type
    switch (eventType) {
      case EVENT_TYPES.USER_LOGIN:
        user.analytics.lastActive = new Date();
        break;
      case EVENT_TYPES.PET_CREATE:
        user.analytics.totalPetsCreated = (user.analytics.totalPetsCreated || 0) + 1;
        break;
      case EVENT_TYPES.PET_LIKE:
      case EVENT_TYPES.PET_SUPERLIKE:
        user.analytics.totalLikes = (user.analytics.totalLikes || 0) + 1;
        break;
      case EVENT_TYPES.MATCH_CREATE:
        user.analytics.totalMatches = (user.analytics.totalMatches || 0) + 1;
        break;
      case EVENT_TYPES.MESSAGE_SEND:
        user.analytics.totalMessagesSent = (user.analytics.totalMessagesSent || 0) + 1;
        break;
      case EVENT_TYPES.SUBSCRIPTION_START:
        user.analytics.totalSubscriptionsStarted = (user.analytics.totalSubscriptionsStarted || 0) + 1;
        break;
      case EVENT_TYPES.SUBSCRIPTION_CANCEL:
        user.analytics.totalSubscriptionsCancelled = (user.analytics.totalSubscriptionsCancelled || 0) + 1;
        break;
      case EVENT_TYPES.PREMIUM_FEATURE_USE:
        user.analytics.totalPremiumFeaturesUsed = (user.analytics.totalPremiumFeaturesUsed || 0) + 1;
        break;
      default:
        logger.warn('Unknown event type for user analytics', { userId, eventType });
    }

    // Add event to user's event log
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

    await user.save();
    
    logger.info('User event tracked successfully', { userId, eventType });
    return { success: true, userId, eventType };
  } catch (error) {
    logger.error('Error tracking user event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      eventType,
      metadata
    });
    
    // Return error info instead of throwing to avoid breaking main flow
    return null;
  }
};

// Track pet event
export const trackPetEvent = async (petId: string, eventType: string, metadata: any = {}): Promise<any> => {
  try {
    if (!petId || !eventType) {
      logger.warn('Invalid parameters for trackPetEvent', { petId, eventType });
      return null;
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      logger.warn('Pet not found for analytics tracking', { petId, eventType });
      return null;
    }

    // Create analytics event record
    await AnalyticsEvent.create({
      entityType: 'pet',
      entityId: petId,
      eventType,
      metadata,
      success: true,
      createdAt: new Date(),
    });

    logger.info('Pet event tracked successfully', { petId, eventType });
    return { success: true, petId, eventType };
  } catch (error) {
    logger.error('Error tracking pet event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      petId,
      eventType,
      metadata
    });
    
    return null;
  }
};

// Track match event
export const trackMatchEvent = async (matchId: string, eventType: string, metadata: any = {}): Promise<any> => {
  try {
    if (!matchId || !eventType) {
      logger.warn('Invalid parameters for trackMatchEvent', { matchId, eventType });
      return null;
    }

    const match = await Match.findById(matchId);
    if (!match) {
      logger.warn('Match not found for analytics tracking', { matchId, eventType });
      return null;
    }

    // Create analytics event record
    await AnalyticsEvent.create({
      entityType: 'match',
      entityId: matchId,
      eventType,
      metadata,
      success: true,
      createdAt: new Date(),
    });

    logger.info('Match event tracked successfully', { matchId, eventType });
    return { success: true, matchId, eventType };
  } catch (error) {
    logger.error('Error tracking match event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      matchId,
      eventType,
      metadata
    });
    
    return null;
  }
};

// Get user analytics
export const getUserAnalytics = async (userId: string, period: string = '30d'): Promise<any> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics events for the period
    const events = await AnalyticsEvent.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Calculate metrics
    const metrics = {
      totalEvents: events.length,
      eventsByType: {},
      dailyActivity: {},
      weeklyActivity: {},
      monthlyActivity: {},
      topEvents: [],
      engagementScore: 0,
    };

    // Process events
    events.forEach(event => {
      // Count events by type
      metrics.eventsByType[event.eventType] = (metrics.eventsByType[event.eventType] || 0) + 1;
      
      // Daily activity
      const day = event.createdAt.toISOString().split('T')[0];
      metrics.dailyActivity[day] = (metrics.dailyActivity[day] || 0) + 1;
      
      // Weekly activity
      const week = getWeekNumber(event.createdAt);
      metrics.weeklyActivity[week] = (metrics.weeklyActivity[week] || 0) + 1;
      
      // Monthly activity
      const month = event.createdAt.toISOString().substring(0, 7);
      metrics.monthlyActivity[month] = (metrics.monthlyActivity[month] || 0) + 1;
    });

    // Calculate top events
    metrics.topEvents = Object.entries(metrics.eventsByType)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    // Calculate engagement score
    metrics.engagementScore = calculateEngagementScore(metrics);

    return {
      success: true,
      userId,
      period,
      metrics,
      userAnalytics: user.analytics,
    };
  } catch (error) {
    logger.error('Error getting user analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      period
    });
    
    throw error;
  }
};

// Get pet analytics
export const getPetAnalytics = async (petId: string, period: string = '30d'): Promise<any> => {
  try {
    const pet = await Pet.findById(petId);
    if (!pet) {
      throw new Error('Pet not found');
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics events for the pet
    const events = await AnalyticsEvent.find({
      entityType: 'pet',
      entityId: petId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Calculate metrics
    const metrics = {
      totalEvents: events.length,
      eventsByType: {},
      dailyActivity: {},
      views: 0,
      likes: 0,
      matches: 0,
      engagementRate: 0,
    };

    // Process events
    events.forEach(event => {
      metrics.eventsByType[event.eventType] = (metrics.eventsByType[event.eventType] || 0) + 1;
      
      if (event.eventType === 'pet_view') metrics.views++;
      if (event.eventType === 'pet_like' || event.eventType === 'pet_superlike') metrics.likes++;
      if (event.eventType === 'match_create') metrics.matches++;
      
      // Daily activity
      const day = event.createdAt.toISOString().split('T')[0];
      metrics.dailyActivity[day] = (metrics.dailyActivity[day] || 0) + 1;
    });

    // Calculate engagement rate
    metrics.engagementRate = metrics.views > 0 ? (metrics.likes / metrics.views) * 100 : 0;

    return {
      success: true,
      petId,
      period,
      metrics,
      pet: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        photos: pet.photos.length,
      },
    };
  } catch (error) {
    logger.error('Error getting pet analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      petId,
      period
    });
    
    throw error;
  }
};

// Get match analytics
export const getMatchAnalytics = async (matchId: string, period: string = '30d'): Promise<any> => {
  try {
    const match = await Match.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics events for the match
    const events = await AnalyticsEvent.find({
      entityType: 'match',
      entityId: matchId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Calculate metrics
    const metrics = {
      totalEvents: events.length,
      eventsByType: {},
      dailyActivity: {},
      messages: 0,
      interactions: 0,
      engagementScore: 0,
    };

    // Process events
    events.forEach(event => {
      metrics.eventsByType[event.eventType] = (metrics.eventsByType[event.eventType] || 0) + 1;
      
      if (event.eventType === 'message_send') metrics.messages++;
      if (event.eventType === 'match_interaction') metrics.interactions++;
      
      // Daily activity
      const day = event.createdAt.toISOString().split('T')[0];
      metrics.dailyActivity[day] = (metrics.dailyActivity[day] || 0) + 1;
    });

    // Calculate engagement score
    metrics.engagementScore = calculateMatchEngagementScore(metrics);

    return {
      success: true,
      matchId,
      period,
      metrics,
      match: {
        status: match.status,
        compatibilityScore: match.compatibilityScore,
        createdAt: match.createdAt,
      },
    };
  } catch (error) {
    logger.error('Error getting match analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      matchId,
      period
    });
    
    throw error;
  }
};

// Helper function to get week number
function getWeekNumber(date: Date): string {
  const year = date.getFullYear();
  const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}

// Helper function to calculate engagement score
function calculateEngagementScore(metrics: any): number {
  const weights = {
    totalEvents: 0.3,
    eventsByType: 0.4,
    dailyActivity: 0.3,
  };
  
  let score = 0;
  
  // Base score from total events
  score += Math.min(metrics.totalEvents / 100, 1) * weights.totalEvents;
  
  // Score from event diversity
  const eventTypes = Object.keys(metrics.eventsByType).length;
  score += Math.min(eventTypes / 10, 1) * weights.eventsByType;
  
  // Score from daily activity consistency
  const activeDays = Object.keys(metrics.dailyActivity).length;
  score += Math.min(activeDays / 30, 1) * weights.dailyActivity;
  
  return Math.round(score * 100);
}

// Helper function to calculate match engagement score
function calculateMatchEngagementScore(metrics: any): number {
  const weights = {
    messages: 0.5,
    interactions: 0.3,
    totalEvents: 0.2,
  };
  
  let score = 0;
  
  // Score from messages
  score += Math.min(metrics.messages / 50, 1) * weights.messages;
  
  // Score from interactions
  score += Math.min(metrics.interactions / 20, 1) * weights.interactions;
  
  // Score from total events
  score += Math.min(metrics.totalEvents / 100, 1) * weights.totalEvents;
  
  return Math.round(score * 100);
}

// Export the service interface
const analyticsService: AnalyticsService = {
  trackUserEvent,
  trackPetEvent,
  trackMatchEvent,
  getUserAnalytics,
  getPetAnalytics,
  getMatchAnalytics,
};

export default analyticsService;
