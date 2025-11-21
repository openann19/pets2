/**
 * API Response Types
 * Strict types for all API responses
 */

// Pet API Responses
export interface PetCreateResponse {
  _id: string;
  owner: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  photos: Array<{
    url: string;
    thumbnail: string;
    cloudinaryId: string;
  }>;
  personalityTags: string[];
  intent: 'adoption' | 'mating' | 'playdate' | 'all';
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PetListResponse {
  pets: PetCreateResponse[];
  total: number;
  page: number;
  limit: number;
}

// User API Responses
export interface UserProfileResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  premium: {
    isActive: boolean;
    plan: 'basic' | 'premium' | 'gold';
    expiresAt?: string;
  };
  profileComplete: boolean;
  subscriptionStatus: 'free' | 'premium' | 'premium_plus';
  createdAt: string;
  updatedAt: string;
}

// Authentication API Responses
export interface AuthResponse {
  user: UserProfileResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface BiometricLoginResponse {
  success: boolean;
  user: UserProfileResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Subscription API Responses
export interface SubscriptionResponse {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  plan: 'basic' | 'premium' | 'gold';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
  };
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Match API Responses
export interface MatchResponse {
  _id: string;
  pet1: PetCreateResponse;
  pet2: PetCreateResponse;
  status: 'pending' | 'active' | 'rejected';
  matchedAt: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  petName: string;
  petAge: number;
  petBreed: string;
  isOnline: boolean;
}

export interface MatchesListResponse {
  matches: MatchResponse[];
  total: number;
  page: number;
  limit: number;
}

// Message API Responses
export interface MessageResponse {
  _id: string;
  match: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'voice' | 'video';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    imageUrl?: string;
    voiceUrl?: string;
    videoUrl?: string;
    duration?: number;
  };
}

export interface MessagesListResponse {
  messages: MessageResponse[];
  total: number;
  page: number;
  limit: number;
}

// Swipe API Responses
export interface SwipeRecommendationResponse {
  pets: PetCreateResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface SwipeActionResponse {
  success: boolean;
  isMatch: boolean;
  matchedPet?: PetCreateResponse;
  message?: string;
}

// AI API Responses
export interface AIBioGenerationResponse {
  bio: string;
  keywords: string[];
  sentiment: {
    score: number;
    label: string;
  };
  matchScore: number;
  tone: string;
  length: string;
}

export interface AIPhotoAnalysisResponse {
  breed: {
    primary: string;
    secondary?: string;
    confidence: number;
  };
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    indicators: {
      coat: string;
      eyes: string;
      posture: string;
      energy: string;
    };
  };
  quality: {
    score: number;
    factors: {
      lighting: number;
      clarity: number;
      composition: number;
      expression: number;
    };
  };
  characteristics: {
    age: string;
    size: string;
    temperament: string[];
    features: string[];
  };
  suggestions: string[];
  tags: string[];
}

export interface AICompatibilityResponse {
  compatibilityScore: number;
  personalityMatch: {
    score: number;
    breakdown: {
      energy: number;
      sociability: number;
      trainability: number;
      independence: number;
    };
  };
  lifestyleMatch: {
    score: number;
    factors: {
      activityLevel: number;
      livingSpace: number;
      timeCommitment: number;
      experience: number;
    };
  };
  relationshipTips: string[];
  potentialChallenges: string[];
  overallRecommendation: 'excellent' | 'good' | 'fair' | 'poor';
}

// Stories API Responses
export interface StoryResponse {
  _id: string;
  userId: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  caption?: string;
  duration: number;
  viewCount: number;
  createdAt: string;
}

export interface StoryGroupResponse {
  userId: string;
  user: {
    _id: string;
    username: string;
    profilePhoto?: string;
  };
  stories: StoryResponse[];
  storyCount: number;
}

export interface StoriesFeedResponse {
  stories: StoryGroupResponse[];
  success: boolean;
}

// Adoption API Responses
export interface AdoptionListingResponse {
  _id: string;
  petId: string;
  pet: PetCreateResponse;
  owner: UserProfileResponse;
  adoptionFee: number;
  requirements: string[];
  description: string;
  photos: string[];
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AdoptionApplicationResponse {
  _id: string;
  listingId: string;
  applicantId: string;
  applicant: UserProfileResponse;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  applicationData: {
    experience: string;
    livingSituation: string;
    references: Array<{
      name: string;
      relationship: string;
      contact: string;
    }>;
    additionalNotes?: string;
  };
  submittedAt: string;
  reviewedAt?: string;
}

// Generic API Responses
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Socket.io Event Types
export interface SocketEvents {
  // Message events
  'message:new': MessageResponse;
  'message:read': { messageId: string; readAt: string };
  'message:typing': { matchId: string; userId: string; isTyping: boolean };
  
  // User events
  'user:online': { userId: string; lastSeen: string };
  'user:offline': { userId: string; lastSeen: string };
  
  // Match events
  'match:new': MatchResponse;
  'match:updated': MatchResponse;
  
  // Story events
  'story:new': StoryResponse;
  'story:viewed': { storyId: string; viewerId: string };
  
  // Call events
  'call:incoming': { callId: string; callerId: string; type: 'voice' | 'video' };
  'call:accepted': { callId: string };
  'call:rejected': { callId: string };
  'call:ended': { callId: string };
}

export interface SocketEmits {
  // Message emits
  'message:send': { matchId: string; content: string; type: 'text' | 'image' | 'voice' | 'video' };
  'message:read': { messageId: string };
  'message:typing': { matchId: string; isTyping: boolean };
  
  // Call emits
  'call:initiate': { matchId: string; type: 'voice' | 'video' };
  'call:accept': { callId: string };
  'call:reject': { callId: string };
  'call:end': { callId: string };
  
  // Story emits
  'story:view': { storyId: string };
}