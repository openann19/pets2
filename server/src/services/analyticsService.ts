export {};// Added to mark file as a module
const User = require('../models/User');
const Pet = require('../models/Pet');
const Match = require('../models/Match');
const logger = require('../utils/logger');

// Event types
const EVENT_TYPES = {
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
};

// Track user event
const trackUserEvent = async (userId, eventType, metadata = {}) => {
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
      error: error.message,
      stack: error.stack,
      userId,
      eventType,
      metadata
    });
    
    // Return error info instead of throwing to avoid breaking main flow
    return null;
  }
};

// Track pet event
const trackPetEvent = async (petId, eventType, userId, metadata = {}) => {
  try {
    const pet = await Pet.findById(petId);
    if (!pet) return;

    // Update pet analytics based on event type
    switch (eventType) {
      case EVENT_TYPES.PET_VIEW:
        pet.analytics.views = (pet.analytics.views || 0) + 1;
        pet.analytics.lastViewed = new Date();
        break;
      case EVENT_TYPES.PET_LIKE:
        pet.analytics.likes = (pet.analytics.likes || 0) + 1;
        break;
      case EVENT_TYPES.PET_SUPERLIKE:
        pet.analytics.superLikes = (pet.analytics.superLikes || 0) + 1;
        break;
      case EVENT_TYPES.MATCH_CREATE:
        pet.analytics.matches = (pet.analytics.matches || 0) + 1;
        break;
      case EVENT_TYPES.MESSAGE_SEND:
        pet.analytics.messages = (pet.analytics.messages || 0) + 1;
        break;
    }

    // Add event to pet's event log
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

    await pet.save();
  } catch (error) {
    logger.error('Error tracking pet event', {
      error: error.message,
      stack: error.stack,
      petId,
      eventType,
      userId,
      metadata
    });
  }
};

// Track match event
const trackMatchEvent = async (matchId, eventType, userId, metadata = {}) => {
  try {
    const match = await Match.findById(matchId);
    if (!match) return;

    // Add event to match's event log
    match.analytics.events = match.analytics.events || [];
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

    await match.save();
  } catch (error) {
    logger.error('Error tracking match event', {
      error: error.message,
      stack: error.stack,
      matchId,
      eventType,
      userId,
      metadata
    });
  }
};

// Get user analytics
const getUserAnalytics = async (userId, period = 'week') => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
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
    const recentEvents = (user.analytics.events || []).filter(event => 
      new Date(event.timestamp) >= startDate
    );

    return {
      totalSwipes: user.analytics.totalSwipes || 0,
      totalLikes: user.analytics.totalLikes || 0,
      totalMatches: user.analytics.totalMatches || 0,
      profileViews: user.analytics.profileViews || 0,
      lastActive: user.analytics.lastActive,
      totalPetsCreated: user.analytics.totalPetsCreated || 0,
      totalMessagesSent: user.analytics.totalMessagesSent || 0,
      totalSubscriptionsStarted: user.analytics.totalSubscriptionsStarted || 0,
      totalSubscriptionsCancelled: user.analytics.totalSubscriptionsCancelled || 0,
      totalPremiumFeaturesUsed: user.analytics.totalPremiumFeaturesUsed || 0,
      events: recentEvents,
      period: period,
      periodStart: startDate,
      periodEnd: now,
    };
  } catch (error) {
    logger.error('Error getting user analytics', {
      error: error.message,
      stack: error.stack,
      userId,
      period
    });
    return null;
  }
};

// Get pet analytics
const getPetAnalytics = async (petId) => {
  try {
    const pet = await Pet.findById(petId);
    if (!pet) return null;

    return {
      views: pet.analytics.views || 0,
      likes: pet.analytics.likes || 0,
      superLikes: pet.analytics.superLikes || 0,
      matches: pet.analytics.matches || 0,
      messages: pet.analytics.messages || 0,
      lastViewed: pet.analytics.lastViewed,
      events: pet.analytics.events || [],
    };
  } catch (error) {
    logger.error('Error getting pet analytics', {
      error: error.message,
      stack: error.stack,
      petId
    });
    return null;
  }
};

// Get match analytics
const getMatchAnalytics = async (matchIdOrUserId, period = 'week') => {
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
      let startDate;
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
      const totalMatches = matches.length;
      const activeMatches = matches.filter(match => 
        match.lastMessage && new Date(match.lastMessage.timestamp) >= startDate
      ).length;

      const totalMessages = matches.reduce((sum, match) => 
        sum + (match.analytics?.events?.filter(event => 
          event.type === 'message_send' && new Date(event.timestamp) >= startDate
        ).length || 0), 0
      );

      return {
        totalMatches,
        activeMatches,
        totalMessages,
        period: period,
        periodStart: startDate,
        periodEnd: now,
        matches: matches.map(match => ({
          id: match._id,
          pet1Name: match.pet1.name,
          pet2Name: match.pet2.name,
          lastMessage: match.lastMessage,
          createdAt: match.createdAt,
        }))
      };
    } else {
      // If it's a match ID, get analytics for that specific match
      const match = await Match.findById(matchIdOrUserId);
      if (!match) return null;

      return {
        events: match.analytics.events || [],
        pet1Name: match.pet1.name,
        pet2Name: match.pet2.name,
        createdAt: match.createdAt,
        lastMessage: match.lastMessage,
      };
    }
  } catch (error) {
    logger.error('Error getting match analytics', {
      error: error.message,
      stack: error.stack,
      matchIdOrUserId,
      period
    });
    return null;
  }
};

module.exports = {
  EVENT_TYPES,
  trackUserEvent,
  trackPetEvent,
  trackMatchEvent,
  getUserAnalytics,
  getPetAnalytics,
  getMatchAnalytics,
};