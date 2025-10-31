/**
 * Feed Enhancement Hooks
 * Phase 1: Performance & Scalability
 * Phase 2: UX Polish
 */

// Phase 1: Performance & Scalability
export { useSmartFeedPreloading } from './useSmartFeedPreloading';
export type { PreloadConfig, SmartFeedPreloadingReturn } from './useSmartFeedPreloading';

export { useFeedCaching } from './useFeedCaching';
export type {
  FeedCacheConfig,
  UseFeedCachingOptions,
  UseFeedCachingReturn,
} from './useFeedCaching';

export { useEnhancedSwipeData } from './useEnhancedSwipeData';
export type { SwipeFilters, SwipeData, SwipeActions } from './useEnhancedSwipeData';

// Phase 2: UX Polish
export { useOptimisticSwipe } from './useOptimisticSwipe';
export type {
  UseOptimisticSwipeOptions,
  UseOptimisticSwipeReturn,
  OptimisticSwipeState,
} from './useOptimisticSwipe';

export { useFeedErrorHandling } from './useFeedErrorHandling';
export type {
  FeedError,
  UseFeedErrorHandlingOptions,
  UseFeedErrorHandlingReturn,
} from './useFeedErrorHandling';

// Phase 3: Advanced Features
export { useAdvancedFeedFilters } from './useAdvancedFeedFilters';
export type {
  AdvancedFeedFilters,
  FilterPreset,
  UseAdvancedFeedFiltersOptions,
  UseAdvancedFeedFiltersReturn,
  PetSize,
  EnergyLevel,
  Gender,
} from './useAdvancedFeedFilters';

export { useRealtimeFeedUpdates } from './useRealtimeFeedUpdates';
export type {
  RealtimeFeedEvent,
  NewPetEvent,
  NewMatchEvent,
  UseRealtimeFeedUpdatesOptions,
  UseRealtimeFeedUpdatesReturn,
} from './useRealtimeFeedUpdates';

export { useFeedGeolocation } from './useFeedGeolocation';
export type {
  UserLocation,
  LocationPreferences,
  UseFeedGeolocationOptions,
  UseFeedGeolocationReturn,
} from './useFeedGeolocation';

// Phase 4: Intelligence & Personalization
export { useOfflineFeed } from './useOfflineFeed';
export type {
  UseOfflineFeedOptions,
  UseOfflineFeedReturn,
} from './useOfflineFeed';

export { useFeedAnalytics } from './useFeedAnalytics';
export type {
  FeedInteractionEvent,
  FeedAnalyticsMetrics,
  UseFeedAnalyticsOptions,
  UseFeedAnalyticsReturn,
} from './useFeedAnalytics';

