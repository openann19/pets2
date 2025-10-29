/**
 * API Response Types for PawfectMatch
 * Strict TypeScript interfaces for all API responses
 * Rule II.1: Cross-Platform Architecture - shared types in packages/core
 */

// ============================================================================
// Pet API Responses
// ============================================================================

export interface PetPhoto {
  url: string;
  thumbnail: string;
  cloudinaryId: string;
  order?: number;
}

export interface PetVideo {
  url: string;
  thumbnail: string;
  cloudinaryId: string;
  duration?: number;
}

export interface PetCreateResponse {
  _id: string;
  owner: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  weight?: number;
  photos: PetPhoto[];
  videos?: PetVideo[];
  description?: string;
  personalityTags: string[];
  intent: 'adoption' | 'mating' | 'playdate' | 'all';
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
    healthConditions?: string[];
    medications?: string[];
    specialNeeds?: string;
    lastVetVisit?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  availability?: {
    isAvailable: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PetResponse extends PetCreateResponse {
  // Same structure as create, server returns full pet object
}

export interface PetListResponse {
  pets: PetResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PetDiscoverResponse {
  pets: PetResponse[];
  hasMore: boolean;
}

// ============================================================================
// User API Responses
// ============================================================================

export interface UserProfileResponse {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  age?: number;
  avatar?: string;
  bio?: string;
  phone?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  preferences: {
    maxDistance: number;
    ageRange: {
      min: number;
      max: number;
    };
    species: string[];
    intents: string[];
    notifications: {
      email: boolean;
      push: boolean;
      matches: boolean;
      messages: boolean;
    };
  };
  premium: {
    isActive: boolean;
    plan: 'basic' | 'premium' | 'gold';
    expiresAt?: string;
    features: {
      unlimitedLikes: boolean;
      boostProfile: boolean;
      seeWhoLiked: boolean;
      advancedFilters: boolean;
    };
  };
  streak?: {
    current: number;
    longest: number;
    lastCheckIn?: string;
  };
  stats?: {
    matches?: number;
    messages?: number;
    likes?: number;
  };
  twoFactorEnabled?: boolean;
  privacySettings?: {
    profileVisibility: 'everyone' | 'matches' | 'nobody';
    showOnlineStatus: boolean;
    showDistance: boolean;
    showLastActive: boolean;
    allowMessages: 'everyone' | 'matches' | 'nobody';
    showReadReceipts: boolean;
    incognitoMode: boolean;
    shareLocation: boolean;
  };
  notificationPreferences?: {
    enabled: boolean;
    matches: boolean;
    messages: boolean;
    likes: boolean;
    reminders: boolean;
    quietHours?: {
      enabled: boolean;
      start: string;
      end: string;
    };
    frequency: 'instant' | 'batched' | 'daily';
    sound: boolean;
    vibration: boolean;
  };
  pets: string[];
  analytics?: {
    totalSwipes: number;
    totalLikes: number;
    totalMatches: number;
    profileViews: number;
    lastActive: string;
  };
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserUpdateResponse extends UserProfileResponse {
  // Same structure as profile response
}

// ============================================================================
// Subscription API Responses
// ============================================================================

export interface SubscriptionResponse {
  id: string;
  userId: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  plan: 'basic' | 'premium' | 'gold';
  tier: 'basic' | 'premium' | 'gold';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  features: {
    unlimitedLikes: boolean;
    boostProfile: boolean;
    seeWhoLiked: boolean;
    advancedFilters: boolean;
  };
  usage?: {
    swipes: { used: number; limit: number };
    superlikes: { used: number; limit: number };
    boosts: { used: number; limit: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  publishableKey?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'gold';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export interface UsageStatsResponse {
  subscription: {
    tier: string;
    status: string;
  };
  usage: {
    swipes: { used: number; limit: number; resetsAt: string };
    superlikes: { used: number; limit: number; resetsAt: string };
    boosts: { used: number; limit: number; resetsAt: string };
  };
  features: {
    unlimitedLikes: boolean;
    boostProfile: boolean;
    seeWhoLiked: boolean;
    advancedFilters: boolean;
  };
}

// ============================================================================
// Match API Responses
// ============================================================================

export interface MatchResponse {
  _id: string;
  pet1: PetResponse | string;
  pet2: PetResponse | string;
  status: 'pending' | 'active' | 'rejected' | 'expired';
  matchedAt: string;
  lastMessage?: {
    _id: string;
    content: string;
    sender: string;
    timestamp: string;
    read: boolean;
  };
  unreadCount?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchListResponse {
  matches: MatchResponse[];
  total: number;
  hasUnread: boolean;
}

export interface SwipeResponse {
  action: 'like' | 'pass' | 'superlike';
  match?: MatchResponse;
  isMatch: boolean;
}

// ============================================================================
// Message API Responses
// ============================================================================

export interface MessageResponse {
  _id: string;
  match: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
  type?: 'text' | 'image' | 'system';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total: number;
  hasMore: boolean;
  match: {
    _id: string;
    pet1: string;
    pet2: string;
  };
}

// ============================================================================
// Notification API Responses
// ============================================================================

export interface NotificationSettings {
  enabled: boolean;
  matches: boolean;
  messages: boolean;
  likes: boolean;
  reminders: boolean;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'instant' | 'batched' | 'daily';
  sound: boolean;
  vibration: boolean;
}

export interface NotificationSettingsResponse extends NotificationSettings {
  userId: string;
  updatedAt: string;
}

// ============================================================================
// AI API Responses
// ============================================================================

export interface AIBioResponse {
  bio: string;
  suggestions: string[];
  tone?: string;
  length?: number;
}

export interface AIPhotoAnalysisResponse {
  quality: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  content: {
    detectedObjects: string[];
    animalDetected: boolean;
    species?: string;
    breed?: string;
  };
  recommendations: string[];
}

export interface AICompatibilityResponse {
  score: number;
  compatibility: 'excellent' | 'good' | 'fair' | 'poor';
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  breakdown: {
    personality: number;
    lifestyle: number;
    activity: number;
    size: number;
  };
}

// ============================================================================
// Analytics API Responses
// ============================================================================

export interface AnalyticsEventResponse {
  success: boolean;
  eventId: string;
}

export interface UserAnalyticsResponse {
  userId: string;
  totalSwipes: number;
  totalLikes: number;
  totalMatches: number;
  profileViews: number;
  messagesSent: number;
  messagesReceived: number;
  averageResponseTime?: number;
  lastActive: string;
  engagement: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface PetAnalyticsResponse {
  petId: string;
  profileViews: number;
  likes: number;
  matches: number;
  popularity: number;
  engagementRate: number;
}

// ============================================================================
// Admin API Responses
// ============================================================================

export interface AdminUserListResponse {
  users: UserProfileResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminAnalyticsResponse {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalPets: number;
    totalMatches: number;
    premiumUsers: number;
    revenue: number;
  };
  growth: {
    users: { current: number; previous: number; change: number };
    matches: { current: number; previous: number; change: number };
    revenue: { current: number; previous: number; change: number };
  };
  engagement: {
    dailyActiveUsers: number;
    averageSessionDuration: number;
    messagesSent: number;
  };
}

export interface AdminSecurityAlert {
  _id: string;
  type: 'suspicious_activity' | 'failed_login' | 'abuse_report' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  metadata?: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminSecurityAlertsResponse {
  alerts: AdminSecurityAlert[];
  total: number;
  unresolved: number;
}

// ============================================================================
// Generic API Responses
// ============================================================================

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
  field?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiHealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    stripe: 'available' | 'unavailable';
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    'message' in response
  );
}

export function isApiSuccessResponse<T>(response: unknown): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as ApiSuccessResponse<T>).success
  );
}
