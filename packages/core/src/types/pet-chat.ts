/**
 * Pet-Centric Chat Types
 * Comprehensive type definitions for pet-first chat features
 */

// Note: Pet and User types are available from './index' but not directly used in this file
// They are referenced in comments and may be used in future extensions

export interface PetProfileCard {
  petId: string;
  petName: string;
  breed: string;
  age: number;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  photos: string[];
  personality: string[];
  size: 'small' | 'medium' | 'large' | 'extra-large';
  energy?: 1 | 2 | 3 | 4 | 5;
  sociability?: 'shy' | 'neutral' | 'social';
  bio?: string;
  badges?: ('vaccinated' | 'microchipped' | 'spayed_neutered' | 'trained' | 'rescue')[];
  verificationStatus?: 'unverified' | 'pending' | 'verified';
}

export interface CompatibilityIndicator {
  score: number; // 0-100
  factors: CompatibilityFactor[];
  recommendedActivities: string[];
  safetyNotes?: string[];
  compatibilityBreakdown: {
    playStyle: number;
    energy: number;
    size: number;
    sociability: number;
    location: number;
  };
}

export interface CompatibilityFactor {
  type: 'playStyle' | 'energy' | 'size' | 'sociability' | 'personality' | 'age' | 'location';
  score: number;
  description: string;
  positive: boolean;
}

export interface BreedInformation {
  breedId: string;
  breedName: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  characteristics: string[];
  careTips: string[];
  compatibility: {
    goodWith: string[];
    notGoodWith: string[];
    energyLevel: 'low' | 'medium' | 'high';
    exerciseNeeds: 'low' | 'medium' | 'high';
  };
  averageLifespan: number;
  averageSize: 'small' | 'medium' | 'large' | 'extra-large';
  images?: string[];
}

export interface PetHealthAlert {
  alertId: string;
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
  sharedWith?: string[]; // User IDs who can see this alert
}

export interface PlaydateProposal {
  proposalId: string;
  matchId: string;
  proposedBy: string; // User ID
  proposedAt: string; // ISO date string
  proposedTime: string; // ISO datetime string
  duration?: number; // minutes
  venue?: VenueInfo;
  location?: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  notes?: string;
  status: 'proposed' | 'accepted' | 'declined' | 'confirmed' | 'cancelled';
  acceptedAt?: string;
  declinedAt?: string;
  confirmedAt?: string;
  weatherCheck?: WeatherForecast;
  safetyChecklist?: SafetyCheckpoint[];
}

export interface VenueInfo {
  venueId: string;
  name: string;
  type: 'park' | 'trail' | 'patio' | 'vet' | 'groomer' | 'shelter' | 'store' | 'cafe' | 'beach';
  address: string;
  coordinates: { lat: number; lng: number };
  amenities: string[];
  petPolicies: {
    allowed: boolean;
    restrictions?: string[];
    maxSize?: 'small' | 'medium' | 'large' | 'any';
    leashedRequired: boolean;
    fees?: number;
  };
  rating: number;
  reviews: number;
  distance?: number; // km
}

export interface WeatherForecast {
  date: string;
  condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'stormy';
  temperature: {
    high: number;
    low: number;
    unit: 'celsius' | 'fahrenheit';
  };
  precipitation: number; // percentage
  windSpeed: number;
  suitableForOutdoor: boolean;
  recommendations?: string[];
}

export interface SafetyCheckpoint {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'first_meetup' | 'location' | 'pets' | 'emergency' | 'weather';
}

export interface PetPhotoFilter {
  filterId: string;
  name: string;
  category: 'hearts' | 'paw_prints' | 'breed_themed' | 'seasonal' | 'fun';
  previewImage: string;
  overlay?: string; // SVG or image URL
}

export interface PetReaction {
  emoji: string;
  name: string;
  category: 'pet_emoji' | 'love' | 'playful' | 'care' | 'custom';
  unicode?: string;
}

export interface AnimatedSticker {
  stickerId: string;
  name: string;
  category: 'pet' | 'reaction' | 'emotion' | 'action' | 'seasonal';
  url: string; // GIF or animated image URL
  thumbnail: string;
  tags: string[];
}

export interface PhotoAnnotation {
  annotationId: string;
  photoId: string;
  type: 'arrow' | 'circle' | 'text' | 'freehand';
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: Array<{ x: number; y: number }>;
  };
  color: string;
  text?: string;
  author: string;
  createdAt: string;
}

export interface ChatMessageWithPetContext {
  messageId: string;
  matchId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'pet_profile' | 'playdate_proposal' | 'health_alert' | 'breed_info' | 'compatibility' | 'photo_filter' | 'voice' | 'video' | 'file';
  timestamp: string;
  petContext?: {
    petId: string;
    petName: string;
    action: 'profile_share' | 'playdate_proposal' | 'vet_share' | 'behavior_note' | 'health_update' | 'breed_info_share';
  };
  petProfileCard?: PetProfileCard;
  compatibilityIndicator?: CompatibilityIndicator;
  breedInformation?: BreedInformation;
  healthAlert?: PetHealthAlert;
  playdateProposal?: PlaydateProposal;
  photoFilter?: PetPhotoFilter;
  reactions?: Array<{
    emoji: string;
    userId: string;
    timestamp: string;
  }>;
  attachments?: Array<{
    type: 'image' | 'video' | 'file';
    url: string;
    name?: string;
    size?: number;
    annotations?: PhotoAnnotation[];
  }>;
}

export interface SmartChatSuggestion {
  suggestionId: string;
  type: 'pet_care_advice' | 'local_service' | 'compatibility_question' | 'translation' | 'conversation_starter';
  title: string;
  message: string;
  context: string;
  confidence: number; // 0-1
  metadata?: {
    serviceId?: string;
    questionId?: string;
    translationFrom?: string;
    translationTo?: string;
  };
}

export interface LocalPetService {
  serviceId: string;
  name: string;
  type: 'vet' | 'groomer' | 'pet_store' | 'trainer' | 'daycare' | 'boarding' | 'sitter';
  address: string;
  coordinates: { lat: number; lng: number };
  distance: number; // km
  rating: number;
  reviews: number;
  phone?: string;
  website?: string;
  hours?: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  specialties?: string[];
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
}

export interface PetSound {
  soundId: string;
  name: string;
  category: 'bark' | 'meow' | 'chirp' | 'whine' | 'purr' | 'growl' | 'howl';
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  url: string;
  duration: number; // seconds
  context?: string;
}

export interface PetInterestGroup {
  groupId: string;
  name: string;
  description: string;
  category: 'pet_type' | 'breed' | 'location' | 'activity' | 'interest';
  memberCount: number;
  isPublic: boolean;
  tags: string[];
  icon?: string;
}

export interface LostPetAlert {
  alertId: string;
  petId: string;
  petName: string;
  petPhoto?: string;
  status: 'active' | 'found' | 'cancelled';
  lastSeenAt: string; // ISO datetime
  lastSeenLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  contactInfo: {
    method: 'inapp' | 'phone' | 'email';
    value: string;
  };
  reward?: number;
  broadcastRadius: number; // km
  sightings: Array<{
    sightingId: string;
    reporterId: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    description: string;
    photos?: string[];
    reportedAt: string;
    verified: boolean;
  }>;
  createdAt: string;
}

export interface PetVerificationBadge {
  badgeId: string;
  userId: string;
  petId: string;
  type: 'ownership' | 'background_check' | 'reference';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  expiresAt?: string;
  metadata?: {
    verificationMethod?: string;
    referenceIds?: string[];
    backgroundCheckProvider?: string;
  };
}

export interface TrustBadge {
  badgeId: string;
  userId: string;
  type: 'verified_owner' | 'background_verified' | 'community_vouched' | 'premium_member';
  displayName: string;
  icon: string;
  verifiedAt: string;
  expiresAt?: string;
}

export interface ChatAnalytics {
  conversationId: string;
  matchId: string;
  metrics: {
    totalMessages: number;
    averageResponseTime: number; // seconds
    engagementScore: number; // 0-100
    petTopicFrequency: Record<string, number>;
    successfulMatches: boolean;
    matchSuccessDate?: string;
  };
  petTopics: Array<{
    topic: string;
    frequency: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  behaviorPatterns: {
    mostActiveHours: number[];
    preferredMessageTypes: string[];
    averageMessageLength: number;
  };
}

export interface PersonalizationProfile {
  userId: string;
  preferences: {
    preferredTopics: string[];
    conversationStyle: 'casual' | 'formal' | 'empathetic' | 'informative';
    notificationFrequency: 'high' | 'medium' | 'low';
  };
  behavioralInsights: {
    activeHours: number[];
    responsePattern: 'immediate' | 'thoughtful' | 'delayed';
    engagementLevel: 'high' | 'medium' | 'low';
  };
  customTemplates: Array<{
    templateId: string;
    name: string;
    message: string;
    category: string;
    usageCount: number;
  }>;
}

