/**
 * Comprehensive TypeScript Types for PawfectMatch
 * Central export point for all type definitions
 */

// Export all types from index.d.ts
export type {
  ApiResponse,
  PaginatedResponse,
  PetPhoto,
  PetLocation,
  PetOwner,
  PetHealthInfo,
  PetAnalytics,
  Pet,
  User,
  UserPreferences,
  Match,
  MatchData,
  Message,
  MessageMetadata,
  MessageAttachment,
  SocketError,
  SocketMessageData,
  SocketNotificationData,
  SocketUserStatusData,
  SocketCallData,
  SocketTypingData,
  SocketMatchData,
  FilterState,
  SwipeParams,
  SubscriptionPlan,
  SubscriptionStatus,
  AdminStats,
  SystemHealth,
  MemoryUsage,
  SystemLog,
  NotificationRequest,
  ApiError,
  ValidationError,
  AnimationConfig,
  SocketEventHandlers,
  ComponentProps,
  ButtonProps,
  FormField,
  FormData,
  SearchFilters,
  DiscoveryResult,
  UserAnalytics,
  PetAnalyticsData,
  PremiumFeature,
  BoostFeature,
  LocationData,
  GeocodingResult,
  FileUpload,
  ImageUpload,
  Notification,
  NotificationSettings,
  ChatRoom,
  TypingIndicator,
  Report,
  Block,
  VerificationRequest,
  UserRegistrationData,
  PetCreationData,
  BioGenerationData,
  CompatibilityOptions,
  BehaviorAnalysisData,
} from './index.d';

// Export utility types
export type {
  DeepPartial,
  Optional,
  RequiredFields,
} from './index.d';

// Re-export from common.d.ts
export type {
  SecurityEventDetails,
  SecurityEvent,
} from './common.d';

// Re-export from pet-types.d.ts
export type { SwipePet } from './pet-types.d';
export {
  isFeaturedPet,
  hasPetPersonality,
  hasPetHealthInfo,
} from './pet-types';

// Re-export from weather.d.ts (if it has exports)
export type * from './weather.d';

// Re-export from openweather.d.ts (if it has exports)
export type * from './openweather.d';

// Re-export from react-types.d.ts (if it has exports)
export type * from './react-types.d';

// Note: browser.d.ts, motion-helpers.d.ts, canvas-confetti.d.ts, 
// webrtc-extensions.d.ts, jest-dom.d.ts, and styled-jsx.d.ts are
// mainly for augmenting existing global types and don't need to be exported
