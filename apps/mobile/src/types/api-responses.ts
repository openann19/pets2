/**
 * Comprehensive API Response Types
 *
 * Defines all request/response types for mobile app API endpoints.
 * These types provide full type safety for all API interactions.
 */

import type { Pet, User, Match, Message, PetFilters } from '@pawfectmatch/core';

// ============================================================================
// Common Response Wrappers
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// Matches API
// ============================================================================

export interface CreateMatchRequest {
  petId: string;
  targetPetId: string;
}

export interface SendMessageRequest {
  content: string;
  replyTo?: {
    _id: string;
    author?: string;
    text?: string;
  };
}

export interface TypingIndicatorRequest {
  isTyping: boolean;
}

export interface MarkAsReadRequest {
  messageIds: string[];
}

export interface GetMatchesResponse {
  data: Match[];
  pagination: {
    matches: number;
  };
}

export interface LikeUserRequest {
  userId: string;
}

export interface ReportContentRequest {
  type: 'user' | 'pet' | 'message';
  targetId: string;
  reason: string;
  description?: string;
}

export interface BlockUserRequest {
  userId: string;
}

export interface SearchPetsRequest {
  query: string;
  filters?: PetFilters;
}

export interface NearbyPetsRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface PetCompatibilityResponse {
  compatibility_score: number;
  factors: string[];
  recommendation: string;
}

// ============================================================================
// User API
// ============================================================================

export interface UpdateUserProfileRequest extends Partial<User> {}

export interface UserStatsResponse {
  matches: number;
  messages: number;
  pets: number;
}

export interface UserPreferences {
  ageRange: { min: number; max: number };
  breedPreferences: string[];
  distance: number;
  showMeInDiscover: boolean;
  notifications: {
    newMatch: boolean;
    message: boolean;
    like: boolean;
  };
}

export interface UserActivity {
  type: string;
  description: string;
  timestamp: string;
}

export interface UserActivityResponse {
  activities: UserActivity[];
}

// ============================================================================
// Pet API
// ============================================================================

export interface CreatePetRequest extends Partial<Pet> {}

export interface UpdatePetRequest extends Partial<Pet> {}

export interface UploadPhotosRequest {
  petId: string;
  photos: FormData;
}

export interface PetSearchRequest {
  query: string;
  filters?: PetFilters;
}

// ============================================================================
// Premium API
// ============================================================================

export interface PremiumFeaturesResponse {
  features: Record<string, boolean>;
}

export interface SubscribeToPremiumRequest {
  plan: 'basic' | 'premium' | 'gold';
  paymentMethodId: string;
}

export interface SubscribeToPremiumResponse {
  success: boolean;
  subscriptionId: string;
}

export interface CurrentSubscriptionResponse {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
}

// ============================================================================
// Adoption API
// ============================================================================

export interface AdoptionApplication {
  _id: string;
  petId: string;
  applicantId: string;
  applicant: User;
  pet: Pet;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  applicationData: {
    experience: string;
    livingSituation: string;
    otherPets: string;
    timeAlone: string;
    vetReference?: string;
    personalReference?: string;
    additionalInfo?: string;
  };
  submittedAt: string;
}

export interface SubmitAdoptionApplicationRequest {
  petId: string;
  applicantId: string;
  applicationData: Omit<
    AdoptionApplication,
    '_id' | 'submittedAt' | 'applicant' | 'pet' | 'status'
  >;
}

// ============================================================================
// Notifications API
// ============================================================================

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface MarkNotificationReadResponse {
  success: boolean;
}

// ============================================================================
// AI API
// ============================================================================

export interface GenerateBioRequest {
  petName: string;
  keywords: string[];
  tone?: 'playful' | 'professional' | 'casual' | 'romantic' | 'funny';
  length?: 'short' | 'medium' | 'long';
  petType?: string;
  age?: number;
  breed?: string;
}

export interface GenerateBioResponse {
  bio: string;
  keywords: string[];
  sentiment: {
    score: number;
    label: string;
  };
  matchScore: number;
}

export interface AnalyzePhotosRequest {
  photos: string[];
}

export interface BreedAnalysis {
  primary_breed: string;
  confidence: number;
  secondary_breeds?: Array<{
    breed: string;
    confidence: number;
  }>;
}

export interface HealthAssessment {
  age_estimate: number;
  health_score: number;
  recommendations: string[];
}

export interface PhotoQuality {
  overall_score: number;
  lighting_score: number;
  composition_score: number;
  clarity_score: number;
}

export interface AnalyzePhotosResponse {
  breed_analysis: BreedAnalysis;
  health_assessment: HealthAssessment;
  photo_quality: PhotoQuality;
  matchability_score: number;
  ai_insights: string[];
}

export interface AnalyzeCompatibilityRequest {
  pet1Id: string;
  pet2Id: string;
}

export interface CompatibilityBreakdown {
  personality_compatibility: number;
  lifestyle_compatibility: number;
  activity_compatibility: number;
  social_compatibility: number;
  environment_compatibility: number;
}

export interface CompatibilityRecommendations {
  meeting_suggestions: string[];
  activity_recommendations: string[];
  supervision_requirements: string[];
  success_probability: number;
}

export interface AnalyzeCompatibilityResponse {
  compatibility_score: number;
  ai_analysis: string;
  breakdown: CompatibilityBreakdown;
  recommendations: CompatibilityRecommendations;
}

export interface GetCompatibilityRequest {
  pet1Id: string;
  pet2Id: string;
}

export interface GetCompatibilityResponse {
  score: number;
  analysis: string;
  factors: {
    age_compatibility: boolean;
    size_compatibility: boolean;
    breed_compatibility: boolean;
    personality_match: boolean;
  };
}

// ============================================================================
// GDPR API
// ============================================================================

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletionId?: string;
  gracePeriodEndsAt?: string;
  canCancel?: boolean;
  error?: string;
}

export interface AccountStatusResponse {
  success: boolean;
  status: 'not-found' | 'pending' | 'processing' | 'completed';
  scheduledDeletionDate?: string;
  daysRemaining?: number;
  canCancel?: boolean;
  requestId?: string;
}

export interface DataExportRequest {
  format?: 'json' | 'csv';
  includeMessages?: boolean;
  includeMatches?: boolean;
  includeProfileData?: boolean;
  includePreferences?: boolean;
}

export interface DataExportResponse {
  success: boolean;
  exportId?: string;
  estimatedTime?: string;
  message?: string;
  exportData?: {
    profile: User;
    pets: Pet[];
    matches: Match[];
    messages: Message[];
    preferences: UserPreferences;
  };
  error?: string;
}

export interface DataExportDownloadRequest {
  exportId: string;
}

// ============================================================================
// Community API
// ============================================================================

export interface CommunityPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  images: string[];
  likes: number;
  liked: boolean;
  comments: CommunityComment[];
  createdAt: string;
  packId?: string;
  packName?: string;
  type: 'post' | 'activity';
  activityDetails?: ActivityDetails;
}

export interface ActivityDetails {
  date: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  attending: boolean;
}

export interface CommunityComment {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  postId: string;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  packId?: string;
  type?: 'post' | 'activity';
  activityDetails?: ActivityDetails;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CommunityFeedResponse {
  success: boolean;
  posts: CommunityPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  appliedFilters: {
    packId: string | null;
    userId: string | null;
    type: string | null;
    matchedCount: number;
  };
}

export interface LikeResponse {
  success: boolean;
  post: {
    _id: string;
    likes: number;
    liked: boolean;
  };
  message: string;
}

export interface CommentResponse {
  success: boolean;
  comment: CommunityComment;
  message: string;
}

export interface CommentsListResponse {
  success: boolean;
  comments: CommunityComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  postId: string;
}

export interface GetFeedParams {
  page?: number;
  limit?: number;
  packId?: string;
  userId?: string;
  type?: 'post' | 'activity';
}

export interface GetCommentsParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// Settings API
// ============================================================================

export interface UpdateUserSettingsRequest extends UserPreferences {}

export interface UserSettingsResponse extends UserPreferences {}

// ============================================================================
// Upload/Presign API
// ============================================================================

export interface PresignRequest {
  contentType: string;
}

export interface PresignResponse {
  key: string;
  url: string;
}

// ============================================================================
// App Info API
// ============================================================================

export interface AppStatisticsResponse {
  statistics: Record<string, number>;
}

export interface AppVersionResponse {
  version: string;
  build: string;
  environment: string;
}

// ============================================================================
// Subscription API (Stripe)
// ============================================================================

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionResponse {
  url: string;
}
