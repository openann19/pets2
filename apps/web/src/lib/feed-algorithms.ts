/**
 * ADVANCED FEED ALGORITHMS - Pet-Aware Personalization Engine
 *
 * This system implements sophisticated feed ranking that considers:
 * - Pet compatibility scores between users' pets
 * - Geographic proximity and local events
 * - Activity preferences and behavior patterns
 * - Social connections and interaction history
 * - Content freshness and engagement metrics
 * - Safety and moderation scores
 */

// Core Data Types
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: PetSize;
  energyLevel: EnergyLevel;
  personalityTraits: string[];
  preferredActivities: string[];
  healthConditions: string[];
  trainingLevel: number; // 1-10 scale
  photos: string[];
  vaccinationStatus: boolean;
}

export type PetSize = 'small' | 'medium' | 'large' | 'extra_large';
export type EnergyLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface LocationPreferences {
  localRadiusKm: number;
  regionalRadiusKm: number;
  nationalRadiusKm: number;
  preferLocal: boolean;
}

export interface SocialGraph {
  following: string[];
  followers: string[];
  connections: Record<string, string[]>;
  communities: string[];
  userCommunities: string[];
}

export interface UserProfile {
  id: string;
  petProfile: PetProfile;
  location: GeoPoint;
  locationPreferences: LocationPreferences;
  feedHistory: FeedContent[];
  interests: string[];
  activeHours: number[];
}

export interface UserEngagementHistory {
  contentTypePreferences: Record<string, number>; // 0-1 scale
  interests: string[];
  authorEngagements: Record<string, number>; // 0-1 scale
  activeHours: number[]; // 0-23 hours
  recentEngagements: EngagementEvent[];
}

export interface EngagementEvent {
  contentId: string;
  type: 'view' | 'like' | 'comment' | 'share' | 'save';
  timestamp: Date;
  duration?: number; // For views
}

export type ContentType = 'post' | 'photo' | 'video' | 'story' | 'event' | 'adoption' | 'lost_pet' | 'pet_tip' | 'question';

export interface FeedContent {
  id: string;
  type: ContentType;
  authorId: string;
  petProfile: PetProfile;
  title?: string;
  content: string;
  mediaUrls?: string[];
  location?: GeoPoint;
  topics: string[];
  createdAt: Date;
  moderationScore?: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  metadata?: Record<string, any>;
}

export interface FeedPreferences {
  blockedContentTypes?: ContentType[];
  blockedAuthors?: string[];
  locationOnly?: boolean;
  petTypes?: string[];
  ageRanges?: [number, number][];
}

export interface FeedGenerationContext {
  userProfile: UserProfile;
  socialGraph: SocialGraph;
  engagementHistory: UserEngagementHistory;
  userPreferences: FeedPreferences;
}

export interface UserFeedback {
  contentId: string;
  rating: number; // 1-5 scale
  reason?: string;
  timestamp: Date;
}

// Feed Algorithm Types
export interface FeedScore {
  contentId: string;
  score: number;
  factors: FeedScoreFactors;
  lastCalculated: Date;
}

export interface FeedScoreFactors {
  petCompatibility: number;      // 0-100 based on pet profiles
  geographicRelevance: number;   // 0-100 based on location
  socialConnection: number;      // 0-100 based on relationships
  contentFreshness: number;      // 0-100 based on recency
  engagementPotential: number;   // 0-100 based on user interests
  safetyScore: number;          // 0-100 based on moderation
  diversityBonus: number;       // 0-50 for content variety
}

export interface FeedAlgorithmConfig {
  weights: {
    petCompatibility: number;
    geographicRelevance: number;
    socialConnection: number;
    contentFreshness: number;
    engagementPotential: number;
    safetyScore: number;
    diversityBonus: number;
  };
  timeDecay: {
    halfLifeHours: number;
    maxAgeDays: number;
  };
  personalization: {
    enableGeographic: boolean;
    enablePetMatching: boolean;
    enableSocialGraph: boolean;
    diversityThreshold: number;
  };
}

// Pet Compatibility Scoring Engine
export class PetCompatibilityEngine {
  // Breed compatibility database with scientific backing
  private static readonly BREED_COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
    'Golden Retriever': {
      'Labrador Retriever': 95,
      'German Shepherd': 75,
      'Border Collie': 80,
      'Poodle': 85,
      'Boxer': 70,
      'Bulldog': 60,
      'Chihuahua': 45,
      'Persian Cat': 30,
      'Siamese Cat': 35,
    },
    'Labrador Retriever': {
      'Golden Retriever': 95,
      'German Shepherd': 70,
      'Poodle': 80,
      'Boxer': 75,
      'Bulldog': 65,
      'Chihuahua': 50,
      'Persian Cat': 35,
      'Siamese Cat': 40,
    },
    'German Shepherd': {
      'Border Collie': 90,
      'Boxer': 80,
      'Labrador Retriever': 70,
      'Golden Retriever': 75,
      'Bulldog': 55,
      'Chihuahua': 30,
      'Persian Cat': 20,
      'Siamese Cat': 25,
    },
    'Persian Cat': {
      'Siamese Cat': 75,
      'British Shorthair': 80,
      'Maine Coon': 65,
      'Golden Retriever': 30,
      'Labrador Retriever': 35,
      'German Shepherd': 20,
    },
    'Siamese Cat': {
      'Persian Cat': 75,
      'British Shorthair': 70,
      'Maine Coon': 70,
      'Golden Retriever': 35,
      'Labrador Retriever': 40,
      'German Shepherd': 25,
    },
  };

  // Behavioral trait compatibility weights
  private static readonly TRAIT_COMPATIBILITY_WEIGHTS: Record<string, Record<string, number>> = {
    'playful': {
      'playful': 100,
      'calm': 70,
      'aggressive': 40,
      'shy': 60,
    },
    'calm': {
      'calm': 100,
      'playful': 70,
      'shy': 85,
      'aggressive': 30,
    },
    'aggressive': {
      'aggressive': 100,
      'playful': 40,
      'calm': 30,
      'shy': 20,
    },
    'shy': {
      'shy': 100,
      'calm': 85,
      'playful': 60,
      'aggressive': 20,
    },
  };

  // Activity compatibility matrix
  private static readonly ACTIVITY_COMPATIBILITY: Record<string, string[]> = {
    'walking': ['running', 'hiking', 'fetch', 'agility'],
    'running': ['walking', 'hiking', 'fetch', 'agility', 'swimming'],
    'hiking': ['walking', 'running', 'camping', 'exploring'],
    'fetch': ['running', 'agility', 'playing', 'swimming'],
    'agility': ['fetch', 'running', 'playing', 'training'],
    'swimming': ['fetch', 'running', 'playing'],
    'cuddling': ['grooming', 'petting', 'sleeping'],
    'playing': ['fetch', 'agility', 'cuddling', 'training'],
    'training': ['agility', 'playing', 'walking'],
    'grooming': ['cuddling', 'petting', 'bathing'],
    'petting': ['cuddling', 'grooming', 'sleeping'],
    'sleeping': ['cuddling', 'petting', 'resting'],
    'exploring': ['hiking', 'walking', 'running', 'camping'],
    'camping': ['hiking', 'exploring', 'walking'],
  };

  static calculateCompatibility(pet1: PetProfile, pet2: PetProfile): number {
    let score = 0;
    const maxScore = 100;

    // Breed compatibility (30% weight)
    const breedScore = this.calculateBreedCompatibility(pet1.breed, pet2.breed);
    score += breedScore * 0.3;

    // Age compatibility (15% weight)
    const ageScore = this.calculateAgeCompatibility(pet1.age, pet2.age);
    score += ageScore * 0.15;

    // Size compatibility (15% weight)
    const sizeScore = this.calculateSizeCompatibility(pet1.size, pet2.size);
    score += sizeScore * 0.15;

    // Energy level matching (15% weight)
    const energyScore = this.calculateEnergyCompatibility(pet1.energyLevel, pet2.energyLevel);
    score += energyScore * 0.15;

    // Personality traits (10% weight)
    const personalityScore = this.calculatePersonalityCompatibility(pet1.personalityTraits, pet2.personalityTraits);
    score += personalityScore * 0.1;

    // Activity preferences (10% weight)
    const activityScore = this.calculateActivityCompatibility(pet1.preferredActivities, pet2.preferredActivities);
    score += activityScore * 0.1;

    // Health considerations (5% weight)
    const healthScore = this.calculateHealthCompatibility(pet1.healthConditions, pet2.healthConditions);
    score += healthScore * 0.05;

    return Math.min(maxScore, Math.round(score));
  }

  private static calculateBreedCompatibility(breed1: string, breed2: string): number {
    // Check direct compatibility matrix
    if (this.BREED_COMPATIBILITY_MATRIX[breed1]?.[breed2]) {
      return this.BREED_COMPATIBILITY_MATRIX[breed1][breed2];
    }
    if (this.BREED_COMPATIBILITY_MATRIX[breed2]?.[breed1]) {
      return this.BREED_COMPATIBILITY_MATRIX[breed2][breed1];
    }

    // Fallback: same species bonus
    const species1 = this.getSpecies(breed1);
    const species2 = this.getSpecies(breed2);

    if (species1 === species2) {
      return 70; // Same species, decent compatibility
    }

    return 50; // Unknown breeds, neutral compatibility
  }

  private static calculateAgeCompatibility(age1: number, age2: number): number {
    const ageDiff = Math.abs(age1 - age2);

    // Age difference scoring
    if (ageDiff === 0) return 100; // Same age - perfect
    if (ageDiff <= 1) return 90;   // 1 year difference
    if (ageDiff <= 2) return 80;   // 2 years difference
    if (ageDiff <= 3) return 70;   // 3 years difference
    if (ageDiff <= 5) return 60;   // 5 years difference

    // Large age differences can be challenging
    return Math.max(30, 60 - (ageDiff - 5) * 5);
  }

  private static calculateSizeCompatibility(size1: PetSize, size2: PetSize): boolean {
    const sizeCompatibility: Record<PetSize, PetSize[]> = {
      small: ['small', 'medium'],
      medium: ['small', 'medium', 'large'],
      large: ['medium', 'large', 'extra_large'],
      extra_large: ['large', 'extra_large']
    };

    return sizeCompatibility[size1]?.includes(size2) ?? false;
  }

  private static calculateEnergyCompatibility(energy1: EnergyLevel, energy2: EnergyLevel): number {
    const energyLevels = ['low', 'medium', 'high', 'very_high'];
    const level1 = energyLevels.indexOf(energy1);
    const level2 = energyLevels.indexOf(energy2);

    const difference = Math.abs(level1 - level2);

    // Energy level differences
    switch (difference) {
      case 0: return 100; // Perfect match
      case 1: return 85;  // Good match
      case 2: return 60;  // Moderate match
      case 3: return 30;  // Poor match
      default: return 50;
    }
  }

  private static calculatePersonalityCompatibility(traits1: string[], traits2: string[]): number {
    if (traits1.length === 0 || traits2.length === 0) return 50;

    let totalCompatibility = 0;
    let comparisons = 0;

    for (const trait1 of traits1) {
      for (const trait2 of traits2) {
        const compatibility = this.TRAIT_COMPATIBILITY_WEIGHTS[trait1]?.[trait2] ||
                             this.TRAIT_COMPATIBILITY_WEIGHTS[trait2]?.[trait1] || 50;
        totalCompatibility += compatibility;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalCompatibility / comparisons : 50;
  }

  private static calculateActivityCompatibility(activities1: string[], activities2: string[]): number {
    if (activities1.length === 0 || activities2.length === 0) return 50;

    let sharedActivities = 0;
    let compatibleActivities = 0;

    for (const activity1 of activities1) {
      for (const activity2 of activities2) {
        if (activity1 === activity2) {
          sharedActivities++;
        } else if (this.ACTIVITY_COMPATIBILITY[activity1]?.includes(activity2)) {
          compatibleActivities++;
        }
      }
    }

    const totalMatches = sharedActivities + (compatibleActivities * 0.7);
    const maxPossible = Math.max(activities1.length, activities2.length);

    return Math.min(100, (totalMatches / maxPossible) * 100);
  }

  private static calculateHealthCompatibility(conditions1: string[], conditions2: string[]): boolean {
    // Check for conflicting health conditions
    const conflictingConditions = [
      ['diabetes', 'pancreatitis'],
      ['arthritis', 'joint_problems'],
      ['kidney_disease', 'urinary_tract_issues'],
      ['heart_conditions', 'respiratory_problems'],
    ];

    return !conditions1.some(cond1 =>
      conditions2.some(cond2 =>
        conflictingConditions.some(([c1, c2]) =>
          (cond1 === c1 && cond2 === c2) || (cond1 === c2 && cond2 === c1)
        )
      )
    );
  }

  private static getSpecies(breed: string): 'dog' | 'cat' | 'other' {
    const dogBreeds = ['Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Border Collie', 'Poodle', 'Boxer', 'Bulldog', 'Chihuahua'];
    const catBreeds = ['Persian Cat', 'Siamese Cat', 'British Shorthair', 'Maine Coon'];

    if (dogBreeds.some(dogBreed => breed.includes(dogBreed))) return 'dog';
    if (catBreeds.some(catBreed => breed.includes(catBreed))) return 'cat';
    return 'other';
  }

  // ML-based compatibility prediction (placeholder for future enhancement)
  static async predictCompatibilityWithML(pet1: PetProfile, pet2: PetProfile): Promise<number> {
    // This would integrate with a machine learning model
    // For now, fall back to rule-based system
    return this.calculateCompatibility(pet1, pet2);
  }
}

// Geographic Relevance Engine
export class GeographicEngine {
  static calculateRelevance(
    userLocation: GeoPoint,
    contentLocation: GeoPoint | null,
    userPreferences: LocationPreferences
  ): number {
    if (!contentLocation) return 50; // Neutral score for non-location content

    const distance = this.calculateDistance(userLocation, contentLocation);

    // Distance-based scoring
    let score = 0;
    if (distance <= userPreferences.localRadiusKm) {
      score = 100; // Within local radius
    } else if (distance <= userPreferences.regionalRadiusKm) {
      score = 75; // Within regional radius
    } else if (distance <= userPreferences.nationalRadiusKm) {
      score = 50; // Within national radius
    } else {
      score = 25; // Outside national radius
    }

    // Adjust based on user preferences
    if (userPreferences.preferLocal && distance > userPreferences.localRadiusKm) {
      score *= 0.7; // Reduce score for non-local content
    }

    return Math.round(score);
  }

  private static calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    // Haversine formula implementation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lng - point1.lng);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Social Connection Engine
export class SocialConnectionEngine {
  static calculateConnectionScore(
    userId: string,
    contentAuthorId: string,
    socialGraph: SocialGraph
  ): number {
    // Direct connection (friends/following)
    if (socialGraph.following.includes(contentAuthorId)) {
      return 100;
    }

    // Mutual connections
    const mutualConnections = socialGraph.following.filter(id =>
      socialGraph.followers.includes(id)
    ).length;

    if (mutualConnections > 0) {
      return Math.min(80, mutualConnections * 10);
    }

    // Second-degree connections
    const secondDegree = socialGraph.following.some(followingId =>
      socialGraph.connections[followingId]?.includes(contentAuthorId)
    );

    if (secondDegree) {
      return 60;
    }

    // Community overlap (same groups, events, etc.)
    const sharedCommunities = socialGraph.communities.filter(community =>
      socialGraph.userCommunities.includes(community)
    ).length;

    if (sharedCommunities > 0) {
      return Math.min(40, sharedCommunities * 5);
    }

    return 20; // Base score for content from unknown users
  }
}

// Content Freshness Engine
export class ContentFreshnessEngine {
  static calculateFreshness(contentCreatedAt: Date, config: FeedAlgorithmConfig): number {
    const now = new Date();
    const ageHours = (now.getTime() - contentCreatedAt.getTime()) / (1000 * 60 * 60);

    // Time decay using exponential decay
    const decayFactor = Math.pow(0.5, ageHours / config.timeDecay.halfLifeHours);

    // Cap maximum age
    const maxAgeHours = config.timeDecay.maxAgeDays * 24;
    if (ageHours > maxAgeHours) {
      return 10; // Minimum freshness score for very old content
    }

    // Boost for very recent content
    let freshnessScore = decayFactor * 100;
    if (ageHours < 1) {
      freshnessScore *= 1.2; // 20% boost for content < 1 hour old
    } else if (ageHours < 24) {
      freshnessScore *= 1.1; // 10% boost for content < 24 hours old
    }

    return Math.round(Math.min(100, Math.max(10, freshnessScore)));
  }
}

// Engagement Prediction Engine
export class EngagementPredictionEngine {
  // Seasonal content multipliers
  private static readonly SEASONAL_MULTIPLIERS: Record<string, Record<ContentType, number>> = {
    'winter': {
      'post': 1.0,
      'photo': 1.2,  // Holiday photos
      'video': 1.1,
      'story': 1.0,
      'event': 0.8,  // Fewer outdoor events
      'adoption': 1.3, // Holiday adoptions
      'lost_pet': 1.2, // Indoor pet concerns
      'pet_tip': 1.1, // Indoor care tips
      'question': 1.0,
    },
    'spring': {
      'post': 1.0,
      'photo': 1.3,  // Outdoor photos
      'video': 1.2,  // Outdoor activities
      'story': 1.1,
      'event': 1.4,  // Outdoor events
      'adoption': 1.1,
      'lost_pet': 0.9, // Pets less likely to get lost
      'pet_tip': 1.2, // Seasonal care tips
      'question': 1.0,
    },
    'summer': {
      'post': 1.0,
      'photo': 1.4,  // Beach/outdoor photos
      'video': 1.3,  // Vacation videos
      'story': 1.2,
      'event': 1.5,  // Summer events
      'adoption': 0.9, // Fewer adoptions
      'lost_pet': 1.3, // Pets more likely to wander
      'pet_tip': 1.3, // Summer care tips
      'question': 1.1,
    },
    'fall': {
      'post': 1.0,
      'photo': 1.2,  // Fall foliage with pets
      'video': 1.1,
      'story': 1.0,
      'event': 1.2,  // Fall events
      'adoption': 1.2, // Back-to-school adoptions
      'lost_pet': 1.0,
      'pet_tip': 1.2, // Seasonal care tips
      'question': 1.0,
    },
  };

  // Trending topic detection
  private static readonly TRENDING_TOPICS: Record<string, { weight: number; decay: number }> = {
    'vaccination': { weight: 1.3, decay: 0.95 },
    'training': { weight: 1.2, decay: 0.98 },
    'health': { weight: 1.4, decay: 0.97 },
    'adoption': { weight: 1.5, decay: 0.96 },
    'lost_pet': { weight: 1.6, decay: 0.94 },
    'breeding': { weight: 0.8, decay: 0.99 }, // Controversial topic
    'diet': { weight: 1.2, decay: 0.98 },
    'grooming': { weight: 1.1, decay: 0.99 },
  };

  static predictEngagement(
    userId: string,
    content: FeedContent,
    userHistory: UserEngagementHistory,
    trendingTopics?: Record<string, number>
  ): number {
    let score = 50; // Base score

    // Content type preferences (20% weight)
    const contentTypePreference = userHistory.contentTypePreferences[content.type] || 0.5;
    score += (contentTypePreference - 0.5) * 40;

    // Topic interests (25% weight)
    const topicRelevance = this.calculateTopicRelevance(content.topics, userHistory.interests);
    score += topicRelevance * 25;

    // Author engagement history (15% weight)
    const authorEngagement = userHistory.authorEngagements[content.authorId] || 0.5;
    score += (authorEngagement - 0.5) * 30;

    // Time-based patterns (10% weight)
    const timeRelevance = this.calculateTimeRelevance(content.createdAt, userHistory.activeHours);
    score += timeRelevance * 10;

    // Seasonal factors (10% weight)
    const seasonalMultiplier = this.getSeasonalMultiplier(content.type, content.createdAt);
    score *= seasonalMultiplier;

    // Trending topics (10% weight)
    const trendingBonus = this.calculateTrendingBonus(content.topics, trendingTopics);
    score += trendingBonus * 10;

    // Behavioral patterns (10% weight)
    const behavioralScore = this.analyzeBehavioralPatterns(content, userHistory.recentEngagements);
    score += behavioralScore * 10;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  private static calculateTopicRelevance(contentTopics: string[], userInterests: string[]): number {
    if (contentTopics.length === 0 || userInterests.length === 0) return 0.5;

    const matches = contentTopics.filter(topic => userInterests.includes(topic)).length;
    const partialMatches = contentTopics.filter(topic =>
      userInterests.some(interest => interest.includes(topic) || topic.includes(interest))
    ).length;

    const totalRelevance = (matches * 1.0) + (partialMatches * 0.5);
    return totalRelevance / contentTopics.length;
  }

  private static calculateTimeRelevance(contentTime: Date, activeHours: number[]): number {
    const contentHour = contentTime.getHours();
    const activeHourCount = activeHours.filter(hour =>
      Math.abs(hour - contentHour) <= 2 // Within 2 hours of active time
    ).length;

    return activeHourCount / activeHours.length;
  }

  private static getSeasonalMultiplier(contentType: ContentType, contentDate: Date): number {
    const month = contentDate.getMonth();
    let season: keyof typeof this.SEASONAL_MULTIPLIERS;

    if (month >= 11 || month <= 1) season = 'winter';      // Dec-Feb
    else if (month >= 2 && month <= 4) season = 'spring';  // Mar-May
    else if (month >= 5 && month <= 7) season = 'summer';  // Jun-Aug
    else season = 'fall';                                   // Sep-Nov

    return this.SEASONAL_MULTIPLIERS[season][contentType] || 1.0;
  }

  private static calculateTrendingBonus(contentTopics: string[], trendingTopics?: Record<string, number>): number {
    if (!trendingTopics || contentTopics.length === 0) return 0;

    let totalBonus = 0;
    for (const topic of contentTopics) {
      const trendScore = trendingTopics[topic] || 0;
      const baseWeight = this.TRENDING_TOPICS[topic]?.weight || 1.0;
      totalBonus += trendScore * baseWeight;
    }

    return Math.min(10, totalBonus / contentTopics.length);
  }

  private static analyzeBehavioralPatterns(content: FeedContent, recentEngagements: EngagementEvent[]): number {
    // Analyze user's recent engagement patterns
    const recentLikes = recentEngagements.filter(e => e.type === 'like').length;
    const recentComments = recentEngagements.filter(e => e.type === 'comment').length;
    const recentShares = recentEngagements.filter(e => e.type === 'share').length;

    // High engagement content gets bonus if user is active
    const userActivityScore = (recentLikes + recentComments * 2 + recentShares * 3) / recentEngagements.length;

    // Content with high engagement gets bonus for active users
    const contentPopularityScore = (
      content.engagement.likes +
      content.engagement.comments * 2 +
      content.engagement.shares * 3 +
      content.engagement.views * 0.1
    ) / 100; // Normalize

    return Math.min(10, userActivityScore * contentPopularityScore);
  }

  // Advanced ML-based prediction (future enhancement)
  static async predictEngagementWithML(
    userId: string,
    content: FeedContent,
    userHistory: UserEngagementHistory
  ): Promise<number> {
    // Placeholder for ML model integration
    // Would use features like:
    // - User embedding
    // - Content embedding
    // - Temporal patterns
    // - Social graph features
    // - Content metadata
    return this.predictEngagement(userId, content, userHistory);
  }
}

// Main Feed Scoring Engine
export class FeedScoringEngine {
  static calculateFeedScore(
    userId: string,
    content: FeedContent,
    userProfile: UserProfile,
    socialGraph: SocialGraph,
    engagementHistory: UserEngagementHistory,
    config: FeedAlgorithmConfig
  ): FeedScore {
    const factors: FeedScoreFactors = {
      petCompatibility: config.personalization.enablePetMatching
        ? PetCompatibilityEngine.calculateCompatibility(
            userProfile.petProfile,
            content.petProfile
          )
        : 50,

      geographicRelevance: config.personalization.enableGeographic
        ? GeographicEngine.calculateRelevance(
            userProfile.location,
            content.location,
            userProfile.locationPreferences
          )
        : 50,

      socialConnection: config.personalization.enableSocialGraph
        ? SocialConnectionEngine.calculateConnectionScore(
            userId,
            content.authorId,
            socialGraph
          )
        : 50,

      contentFreshness: ContentFreshnessEngine.calculateFreshness(
        content.createdAt,
        config
      ),

      engagementPotential: EngagementPredictionEngine.predictEngagement(
        userId,
        content,
        engagementHistory
      ),

      safetyScore: content.moderationScore || 85, // Default high safety score

      diversityBonus: this.calculateDiversityBonus(content, userProfile.feedHistory),
    };

    // Calculate weighted score
    const score = (
      factors.petCompatibility * config.weights.petCompatibility +
      factors.geographicRelevance * config.weights.geographicRelevance +
      factors.socialConnection * config.weights.socialConnection +
      factors.contentFreshness * config.weights.contentFreshness +
      factors.engagementPotential * config.weights.engagementPotential +
      factors.safetyScore * config.weights.safetyScore +
      factors.diversityBonus * config.weights.diversityBonus
    ) / 100;

    return {
      contentId: content.id,
      score: Math.round(Math.min(100, Math.max(0, score))),
      factors,
      lastCalculated: new Date(),
    };
  }

  private static calculateDiversityBonus(content: FeedContent, feedHistory: FeedContent[]): number {
    // Encourage content variety by giving bonus to underrepresented content types
    const recentContentTypes = feedHistory.slice(-20).map(c => c.type);
    const contentTypeFrequency = recentContentTypes.filter(type => type === content.type).length;
    const diversityScore = 1 - (contentTypeFrequency / 20); // Higher for less frequent types

    return diversityScore * 50; // Max 50 points for diversity
  }

  static rankContent(scores: FeedScore[]): FeedScore[] {
    return scores.sort((a, b) => b.score - a.score);
  }

  static filterContent(
    content: FeedContent[],
    userPreferences: FeedPreferences,
    safetyThreshold: number = 70
  ): FeedContent[] {
    return content.filter(item => {
      // Safety filter
      if ((item.moderationScore || 0) < safetyThreshold) {
        return false;
      }

      // Content type preferences
      if (userPreferences.blockedContentTypes?.includes(item.type)) {
        return false;
      }

      // Author preferences
      if (userPreferences.blockedAuthors?.includes(item.authorId)) {
        return false;
      }

      // Geographic preferences
      if (userPreferences.locationOnly && !item.location) {
        return false;
      }

      return true;
    });
  }
}

// Feed Personalization Service
export class FeedPersonalizationService {
  private algorithmConfig: FeedAlgorithmConfig;

  constructor(config: Partial<FeedAlgorithmConfig> = {}) {
    this.algorithmConfig = {
      weights: {
        petCompatibility: 25,
        geographicRelevance: 20,
        socialConnection: 15,
        contentFreshness: 10,
        engagementPotential: 15,
        safetyScore: 10,
        diversityBonus: 5,
        ...config.weights,
      },
      timeDecay: {
        halfLifeHours: 24,
        maxAgeDays: 7,
        ...config.timeDecay,
      },
      personalization: {
        enableGeographic: true,
        enablePetMatching: true,
        enableSocialGraph: true,
        diversityThreshold: 0.7,
        ...config.personalization,
      },
    };
  }

  async generatePersonalizedFeed(
    userId: string,
    availableContent: FeedContent[],
    context: FeedGenerationContext
  ): Promise<FeedContent[]> {
    // Filter content based on user preferences and safety
    const filteredContent = FeedScoringEngine.filterContent(
      availableContent,
      context.userPreferences,
      70 // Safety threshold
    );

    // Calculate scores for remaining content
    const scores = await Promise.all(
      filteredContent.map(content =>
        FeedScoringEngine.calculateFeedScore(
          userId,
          content,
          context.userProfile,
          context.socialGraph,
          context.engagementHistory,
          this.algorithmConfig
        )
      )
    );

    // Rank content by score
    const rankedScores = FeedScoringEngine.rankContent(scores);

    // Return content in ranked order
    const rankedContent = rankedScores.map(score =>
      filteredContent.find(content => content.id === score.contentId)!
    ).filter(Boolean);

    // Apply diversity threshold
    return this.applyDiversityThreshold(rankedContent);
  }

  private applyDiversityThreshold(content: FeedContent[]): FeedContent[] {
    if (content.length <= 5) return content; // Don't apply diversity to small feeds

    const diverseContent: FeedContent[] = [];
    const contentTypes = new Map<string, number>();

    for (const item of content) {
      const currentCount = contentTypes.get(item.type) || 0;
      const typeRatio = currentCount / diverseContent.length;

      // If this content type exceeds diversity threshold, skip it
      if (typeRatio > this.algorithmConfig.personalization.diversityThreshold) {
        continue;
      }

      diverseContent.push(item);
      contentTypes.set(item.type, currentCount + 1);

      // Stop when we have enough diverse content
      if (diverseContent.length >= 50) break;
    }

    return diverseContent;
  }

  // Update algorithm weights based on user feedback
  updateWeightsFromFeedback(feedback: UserFeedback): void {
    // Implement reinforcement learning to adjust weights
    // based on user engagement and explicit feedback
  }
}

// A/B Testing Framework for Algorithm Optimization
export interface ABTestVariant {
  id: string;
  name: string;
  config: Partial<FeedAlgorithmConfig>;
  targetMetrics: {
    engagementRate: number;
    retentionRate: number;
    diversityScore: number;
  };
  sampleSize: number;
  currentUsers: number;
}

export interface ABTestResult {
  variantId: string;
  metrics: {
    engagementRate: number;
    retentionRate: number;
    diversityScore: number;
    averageScore: number;
  };
  confidence: number;
  winner: boolean;
}

export class ABTestingEngine {
  private variants: ABTestVariant[] = [];
  private results: Map<string, ABTestResult> = new Map();

  constructor() {
    this.initializeDefaultVariants();
  }

  private initializeDefaultVariants(): void {
    // Control variant - current algorithm
    this.variants.push({
      id: 'control',
      name: 'Current Algorithm',
      config: {},
      targetMetrics: {
        engagementRate: 0.15,
        retentionRate: 0.75,
        diversityScore: 0.7,
      },
      sampleSize: 10000,
      currentUsers: 0,
    });

    // Variant A - Boost pet compatibility
    this.variants.push({
      id: 'pet_boost',
      name: 'Pet Compatibility Boost',
      config: {
        weights: {
          petCompatibility: 35,
          geographicRelevance: 15,
          socialConnection: 15,
          contentFreshness: 10,
          engagementPotential: 15,
          safetyScore: 5,
          diversityBonus: 5,
        },
      },
      targetMetrics: {
        engagementRate: 0.18,
        retentionRate: 0.78,
        diversityScore: 0.65,
      },
      sampleSize: 5000,
      currentUsers: 0,
    });

    // Variant B - Social graph emphasis
    this.variants.push({
      id: 'social_boost',
      name: 'Social Graph Emphasis',
      config: {
        weights: {
          petCompatibility: 20,
          geographicRelevance: 15,
          socialConnection: 30,
          contentFreshness: 10,
          engagementPotential: 10,
          safetyScore: 10,
          diversityBonus: 5,
        },
      },
      targetMetrics: {
        engagementRate: 0.17,
        retentionRate: 0.80,
        diversityScore: 0.75,
      },
      sampleSize: 5000,
      currentUsers: 0,
    });

    // Variant C - Freshness and trending
    this.variants.push({
      id: 'freshness_boost',
      name: 'Freshness & Trending',
      config: {
        weights: {
          petCompatibility: 20,
          geographicRelevance: 20,
          socialConnection: 10,
          contentFreshness: 20,
          engagementPotential: 20,
          safetyScore: 5,
          diversityBonus: 5,
        },
        timeDecay: {
          halfLifeHours: 12, // More aggressive decay
          maxAgeDays: 3,
        },
      },
      targetMetrics: {
        engagementRate: 0.16,
        retentionRate: 0.72,
        diversityScore: 0.8,
      },
      sampleSize: 5000,
      currentUsers: 0,
    });
  }

  assignUserToVariant(userId: string): ABTestVariant {
    // Simple hash-based assignment for consistency
    const hash = this.simpleHash(userId);
    const variantIndex = hash % this.variants.length;
    const variant = this.variants[variantIndex];

    variant.currentUsers++;
    return variant;
  }

  recordMetrics(variantId: string, userMetrics: {
    engagementRate: number;
    retentionRate: number;
    diversityScore: number;
    averageScore: number;
  }): void {
    const variant = this.variants.find(v => v.id === variantId);
    if (!variant) return;

    const existingResult = this.results.get(variantId);
    if (existingResult) {
      // Update running averages
      const newResult: ABTestResult = {
        variantId,
        metrics: {
          engagementRate: (existingResult.metrics.engagementRate + userMetrics.engagementRate) / 2,
          retentionRate: (existingResult.metrics.retentionRate + userMetrics.retentionRate) / 2,
          diversityScore: (existingResult.metrics.diversityScore + userMetrics.diversityScore) / 2,
          averageScore: (existingResult.metrics.averageScore + userMetrics.averageScore) / 2,
        },
        confidence: this.calculateConfidence(variant.currentUsers),
        winner: false,
      };
      this.results.set(variantId, newResult);
    } else {
      this.results.set(variantId, {
        variantId,
        metrics: userMetrics,
        confidence: this.calculateConfidence(1),
        winner: false,
      });
    }

    this.evaluateWinner();
  }

  getWinner(): ABTestVariant | null {
    const results = Array.from(this.results.values());
    if (results.length === 0) return null;

    // Find variant with highest composite score and sufficient confidence
    const winners = results
      .filter(result => result.confidence > 0.95)
      .sort((a, b) => {
        const scoreA = this.calculateCompositeScore(a.metrics);
        const scoreB = this.calculateCompositeScore(b.metrics);
        return scoreB - scoreA;
      });

    return winners.length > 0 ? this.variants.find(v => v.id === winners[0].variantId) || null : null;
  }

  private calculateCompositeScore(metrics: ABTestResult['metrics']): number {
    return (
      metrics.engagementRate * 0.4 +
      metrics.retentionRate * 0.4 +
      metrics.diversityScore * 0.2
    );
  }

  private calculateConfidence(sampleSize: number): number {
    // Simplified confidence calculation
    // In production, use proper statistical tests
    if (sampleSize < 100) return 0.5;
    if (sampleSize < 1000) return 0.75;
    if (sampleSize < 5000) return 0.9;
    return 0.95;
  }

  private evaluateWinner(): void {
    const winner = this.getWinner();
    if (winner) {
      // Mark winner
      this.results.forEach(result => {
        result.winner = result.variantId === winner.id;
      });
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getVariants(): ABTestVariant[] {
    return [...this.variants];
  }

  getResults(): ABTestResult[] {
    return Array.from(this.results.values());
  }
}

// Performance Optimization Engine
export class FeedPerformanceEngine {
  private scoreCache: Map<string, { score: FeedScore; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Batch processing for multiple users
  async calculateBatchScores(
    userContexts: Array<{
      userId: string;
      content: FeedContent[];
      context: FeedGenerationContext;
    }>,
    config: FeedAlgorithmConfig
  ): Promise<Array<{ userId: string; scores: FeedScore[] }>> {
    const results: Array<{ userId: string; scores: FeedScore[] }> = [];

    // Process in parallel with controlled concurrency
    const batchSize = 10;
    for (let i = 0; i < userContexts.length; i += batchSize) {
      const batch = userContexts.slice(i, i + batchSize);
      const batchPromises = batch.map(async ({ userId, content, context }) => {
        const scores = await this.calculateScoresWithCache(userId, content, context, config);
        return { userId, scores };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  private async calculateScoresWithCache(
    userId: string,
    content: FeedContent[],
    context: FeedGenerationContext,
    config: FeedAlgorithmConfig
  ): Promise<FeedScore[]> {
    const scores: FeedScore[] = [];
    const now = Date.now();

    for (const item of content) {
      const cacheKey = `${userId}:${item.id}`;
      const cached = this.scoreCache.get(cacheKey);

      if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
        scores.push(cached.score);
      } else {
        const score = FeedScoringEngine.calculateFeedScore(
          userId,
          item,
          context.userProfile,
          context.socialGraph,
          context.engagementHistory,
          config
        );

        this.scoreCache.set(cacheKey, { score, timestamp: now });
        scores.push(score);
      }
    }

    return scores;
  }

  // Cache statistics for monitoring
  getCacheStats(): { size: number; hitRate: number; totalRequests: number } {
    return {
      size: this.scoreCache.size,
      hitRate: 0, // Would need to track hits vs misses
      totalRequests: 0,
    };
  }

  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.scoreCache.entries()) {
      if ((now - value.timestamp) > this.CACHE_TTL) {
        this.scoreCache.delete(key);
      }
    }
  }
}

// Analytics and Monitoring Engine
export class FeedAnalyticsEngine {
  private metrics: Map<string, any[]> = new Map();

  recordMetric(metricName: string, value: any, tags: Record<string, string> = {}): void {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }

    this.metrics.get(metricName)!.push({
      value,
      tags,
      timestamp: new Date(),
    });
  }

  getMetrics(metricName: string, timeRange?: { start: Date; end: Date }): any[] {
    const data = this.metrics.get(metricName) || [];

    if (!timeRange) return data;

    return data.filter(item =>
      item.timestamp >= timeRange.start && item.timestamp <= timeRange.end
    );
  }

  calculateEngagementRate(userId: string, timeRange: { start: Date; end: Date }): number {
    const engagements = this.getMetrics('user_engagement', timeRange)
      .filter(item => item.tags.userId === userId);

    const impressions = this.getMetrics('content_impression', timeRange)
      .filter(item => item.tags.userId === userId);

    return impressions.length > 0 ? engagements.length / impressions.length : 0;
  }

  calculateDiversityScore(feedContent: FeedContent[]): number {
    if (feedContent.length === 0) return 0;

    const typeCounts = new Map<string, number>();
    for (const content of feedContent) {
      typeCounts.set(content.type, (typeCounts.get(content.type) || 0) + 1);
    }

    // Calculate entropy-based diversity
    const total = feedContent.length;
    let entropy = 0;

    for (const count of typeCounts.values()) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }

    // Normalize to 0-1 scale (higher entropy = more diverse)
    const maxEntropy = Math.log2(typeCounts.size);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  generateReport(timeRange: { start: Date; end: Date }): FeedAnalyticsReport {
    const engagementRate = this.calculateEngagementRate('global', timeRange);
    const diversityScore = this.calculateDiversityScore([]);

    return {
      period: timeRange,
      engagementRate,
      diversityScore,
      totalImpressions: this.getMetrics('content_impression', timeRange).length,
      totalEngagements: this.getMetrics('user_engagement', timeRange).length,
      topContentTypes: this.getTopContentTypes(timeRange),
      geographicDistribution: this.getGeographicDistribution(timeRange),
    };
  }

  private getTopContentTypes(timeRange: { start: Date; end: Date }): Array<{ type: string; count: number }> {
    const impressions = this.getMetrics('content_impression', timeRange);
    const typeCounts = new Map<string, number>();

    for (const impression of impressions) {
      const type = impression.tags.contentType;
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getGeographicDistribution(timeRange: { start: Date; end: Date }): Array<{ region: string; count: number }> {
    // Placeholder - would analyze geographic data
    return [];
  }
}

export interface FeedAnalyticsReport {
  period: { start: Date; end: Date };
  engagementRate: number;
  diversityScore: number;
  totalImpressions: number;
  totalEngagements: number;
  topContentTypes: Array<{ type: string; count: number }>;
  geographicDistribution: Array<{ region: string; count: number }>;
}
