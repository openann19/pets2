// Re-export all core types for mobile app
export type {
  User,
  Pet,
  Match,
  Message,
  SwipeAction,
  SwipeResult,
  PetFilters,
} from '@pawfectmatch/core';

// Export API response types
export * from './api-responses';

// Export navigation types
export * from './navigation';

// Export Reanimated types
export * from './reanimated';

// Mobile-specific type extensions (if needed in future)
export interface MobileUserPreferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  cameraPermission: boolean;
  pushNotifications: boolean;
}

export interface MobileNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}
