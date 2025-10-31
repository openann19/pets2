/**
 * Phase 1 Product Enhancements - Type Contracts
 * Production-ready contracts for Chat, Home, Matches, Swipe, and Push features
 * Aligned with Product Enhancements Spec v1.1 Enhanced
 */

/**
 * Push Notification Payload Contract (v1)
 * Supports rich notifications with actions, media, and deep linking
 */
export interface PushPayload {
  type: 'message' | 'match' | 'like' | 'super_like' | 'reminder';
  deeplink: string;
  title: string;
  body: string;
  media?: {
    url: string;
    thumb?: string;
    mimeType?: string;
  };
  actions?: Array<{
    id: 'reply' | 'like' | 'view' | 'dismiss';
    title: string;
    icon?: string;
  }>;
  collapseKey?: string; // For coalescing noisy threads
  badge?: number;
  sound?: string;
  priority?: 'high' | 'normal' | 'low';
  vibrationPattern?: number[];
  data?: Record<string, unknown>;
}

/**
 * Activity Event Contract (v1)
 * Enhanced activity feed with rich notification cells
 */
export interface ActivityEvent {
  id: string;
  type: 'like' | 'message' | 'match' | 'view' | 'super_like';
  actorId: string;
  actorName?: string;
  actorAvatar?: string;
  subjectId?: string; // Pet ID, Match ID, etc.
  subjectName?: string;
  subjectAvatar?: string;
  createdAt: string; // ISO-8601 UTC
  read: boolean;
  metadata?: {
    messagePreview?: string;
    matchPhoto?: string;
    distance?: number;
    compatibilityScore?: number;
    [key: string]: unknown;
  };
}

/**
 * Personalized Dashboard Data Contract (v1)
 * Home screen personalized modules with behavioral signals
 */
export interface PersonalizedDashboardData {
  recentlyViewedProfiles: Array<{
    id: string;
    petId: string;
    petName: string;
    petPhoto: string;
    viewedAt: string;
    compatibilityScore?: number;
  }>;
  suggestedMatches: Array<{
    id: string;
    petId: string;
    petName: string;
    petPhoto: string;
    compatibilityScore: number;
    reasons: string[]; // Why this match is suggested
    signals: {
      behavioral: number; // 0-1 weight
      contentBased: number; // 0-1 weight
      preferences: number; // 0-1 weight
    };
  }>;
  activityInsights: {
    streakDays: number;
    lastActivityAt: string;
    totalSwipes: number;
    matchRate: number; // 0-1
    responseTimeMedian?: number; // seconds
    tips?: string[];
  };
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    deeplink: string;
    priority: number; // Higher = more important
    timeBased?: boolean; // Changes based on time of day
  }>;
}

/**
 * Advanced Match Filter Contract (v1)
 * Supports geo-indexing, pet preferences, activity status
 */
export interface AdvancedMatchFilter {
  // Distance filtering (geo-indexed)
  distance?: {
    minKm?: number;
    maxKm?: number;
    userLocation?: {
      lat: number;
      lng: number;
    };
  };
  // Age filtering
  age?: {
    min?: number;
    max?: number;
  };
  // Pet preferences
  petPreferences?: {
    species?: string[];
    breeds?: string[];
    sizes?: ('small' | 'medium' | 'large' | 'xlarge')[];
    energyLevels?: ('low' | 'medium' | 'high')[];
    genders?: ('male' | 'female' | 'unknown')[];
  };
  // Activity status
  activityStatus?: 'online' | 'recent' | 'active' | 'any';
  // Sorting
  sort?: 'newest' | 'oldest' | 'distance' | 'compatibility' | 'lastActivity';
  // Search
  search?: string;
  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Match Insights Contract (v1)
 * Compatibility analysis and match intelligence
 */
export interface MatchInsights {
  matchId: string;
  compatibilityScore: number; // 0-100
  reasons: string[]; // Top 3 explanations
  mutualInterests: string[];
  conversationStarters: string[];
  analysis: {
    preferences: {
      match: number; // 0-1
      explanation: string;
    };
    behavior: {
      match: number; // 0-1
      explanation: string;
    };
    content: {
      match: number; // 0-1
      explanation: string;
    };
  };
}

/**
 * Scheduled Message Contract (v1)
 * Message scheduling with timezone handling
 */
export interface ScheduledMessage {
  id: string;
  convoId: string;
  senderId: string;
  body: RichContent;
  scheduledAt: string; // ISO-8601 UTC
  tz: string; // IANA timezone
  status: 'scheduled' | 'sent' | 'canceled' | 'failed';
  createdAt: string;
  updatedAt: string;
  attempts?: number;
  error?: string;
}

/**
 * Rich Content Contract
 * Supports text, media, attachments
 */
export interface RichContent {
  text?: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'file' | 'voice';
    url: string;
    thumb?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
  }>;
  metadata?: Record<string, unknown>;
}

/**
 * Message Template Contract (v1)
 * Personal and team templates with variables
 */
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[]; // e.g., ['name', 'petName', 'meetingTime']
  category: 'personal' | 'team' | 'ops';
  version: number;
  createdAt: string;
  updatedAt: string;
  encrypted?: boolean;
}

/**
 * Translation Contract (v1)
 * Message translation with quality scores
 */
export interface Translation {
  msgId: string;
  srcLang: string;
  tgtLang: string;
  text: string;
  quality: 'high' | 'low';
  cachedUntil: string; // ISO-8601 UTC
  provider?: string;
  confidence?: number; // 0-1
}

/**
 * Conversation Intelligence Contract (v1)
 * Sentiment and insights for conversations
 */
export interface ConversationIntelligence {
  convoId: string;
  sentiment: {
    current: number; // -1 to 1
    trend: 'improving' | 'declining' | 'stable';
    messages: Array<{
      msgId: string;
      sentiment: number; // -1 to 1
      timestamp: string;
    }>;
  };
  insights: {
    responseTimeMedian: number; // seconds
    responseTimeP95: number; // seconds
    streaks: number;
    messageBalance: number; // -1 to 1 (negative = more from other user)
    lastActivity: string;
  };
  mood?: 'positive' | 'neutral' | 'negative';
  optIn: boolean; // User must opt-in
}

/**
 * API Response Wrappers
 */
export interface PersonalizedDashboardResponse {
  success: boolean;
  data: PersonalizedDashboardData;
  timestamp: string;
}

export interface MatchFilterResponse {
  success: boolean;
  data: {
    matches: unknown[]; // Match[] - using unknown to avoid circular dependencies
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface MatchInsightsResponse {
  success: boolean;
  data: MatchInsights;
}

export interface ActivityEventListResponse {
  success: boolean;
  data: {
    events: ActivityEvent[];
    total: number;
    unread: number;
    hasMore: boolean;
  };
}

export interface PushNotificationResponse {
  success: boolean;
  messageId?: string;
  delivered?: boolean;
  error?: string;
}

/**
 * Type Guards
 */
export function isPushPayload(obj: unknown): obj is PushPayload {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    'title' in obj &&
    'body' in obj &&
    'deeplink' in obj
  );
}

export function isActivityEvent(obj: unknown): obj is ActivityEvent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'actorId' in obj &&
    'createdAt' in obj
  );
}

/**
 * Schema Versions
 */
export const CONTRACT_VERSIONS = {
  PUSH_PAYLOAD: 'v1',
  ACTIVITY_EVENT: 'v1',
  PERSONALIZED_DASHBOARD: 'v1',
  ADVANCED_MATCH_FILTER: 'v1',
  MATCH_INSIGHTS: 'v1',
  SCHEDULED_MESSAGE: 'v1',
  MESSAGE_TEMPLATE: 'v1',
  TRANSLATION: 'v1',
  CONVERSATION_INTELLIGENCE: 'v1',
} as const;

