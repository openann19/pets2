/**
 * Shared Constants for PawfectMatch
 * Rule II.1: Cross-Platform Architecture - shared constants in packages/core
 * Used by both web and mobile applications
 */

// Species Options
export const SPECIES_OPTIONS = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐱 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'other', label: '🐾 Other' },
];

// Size Options
export const SIZE_OPTIONS = [
  { value: 'tiny', label: 'Tiny (0-10 lbs)' },
  { value: 'small', label: 'Small (10-25 lbs)' },
  { value: 'medium', label: 'Medium (25-55 lbs)' },
  { value: 'large', label: 'Large (55-85 lbs)' },
  { value: 'extra-large', label: 'Extra Large (85+ lbs)' },
];

// Intent Options
export const INTENT_OPTIONS = [
  { value: 'adoption', label: 'Available for Adoption' },
  { value: 'mating', label: 'Looking for Mates' },
  { value: 'playdate', label: 'Playdates Only' },
  { value: 'all', label: 'Open to All' },
];

// Personality Tags
export const PERSONALITY_TAGS = [
  'friendly',
  'energetic',
  'playful',
  'calm',
  'shy',
  'protective',
  'good-with-kids',
  'good-with-pets',
  'trained',
  'house-trained',
  'intelligent',
  'loyal',
  'independent',
  'social',
  'gentle',
  'active',
  'quiet',
  'affectionate',
  'curious',
  'brave',
];

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// Health Status Options
export const HEALTH_STATUS_OPTIONS = [
  { value: 'vaccinated', label: 'Vaccinated' },
  { value: 'spayedNeutered', label: 'Spayed/Neutered' },
  { value: 'microchipped', label: 'Microchipped' },
];

// Activity Level Options
export const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low Energy' },
  { value: 'moderate', label: 'Moderate Energy' },
  { value: 'high', label: 'High Energy' },
  { value: 'very-high', label: 'Very High Energy' },
];

// Temperament Options
export const TEMPERAMENT_OPTIONS = [
  'friendly',
  'playful',
  'calm',
  'energetic',
  'shy',
  'confident',
  'protective',
  'gentle',
  'independent',
  'social',
];

// Training Level Options
export const TRAINING_LEVEL_OPTIONS = [
  { value: 'none', label: 'No Training' },
  { value: 'basic', label: 'Basic Commands' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert Level' },
];

// Grooming Needs Options
export const GROOMING_NEEDS_OPTIONS = [
  { value: 'minimal', label: 'Minimal Grooming' },
  { value: 'regular', label: 'Regular Grooming' },
  { value: 'high', label: 'High Maintenance' },
];

// Exercise Needs Options
export const EXERCISE_NEEDS_OPTIONS = [
  { value: 'low', label: 'Low Exercise Needs' },
  { value: 'moderate', label: 'Moderate Exercise' },
  { value: 'high', label: 'High Exercise Needs' },
  { value: 'very-high', label: 'Very High Exercise Needs' },
];

// Family Friendly Options
export const FAMILY_FRIENDLY_OPTIONS = [
  { value: 'excellent', label: 'Excellent with Kids' },
  { value: 'good', label: 'Good with Kids' },
  { value: 'fair', label: 'Fair with Kids' },
  { value: 'poor', label: 'Not Good with Kids' },
];

// Apartment Friendly Options
export const APARTMENT_FRIENDLY_OPTIONS = [
  { value: 'excellent', label: 'Excellent for Apartments' },
  { value: 'good', label: 'Good for Apartments' },
  { value: 'fair', label: 'Fair for Apartments' },
  { value: 'poor', label: 'Not Good for Apartments' },
];

// Health Concerns Options
export const HEALTH_CONCERNS_OPTIONS = [
  'hip-dysplasia',
  'eye-problems',
  'heart-conditions',
  'skin-allergies',
  'joint-issues',
  'breathing-problems',
  'digestive-issues',
  'none',
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'distance', label: 'Distance' },
  { value: 'age', label: 'Age' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

// Distance Options (in miles)
export const DISTANCE_OPTIONS = [
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
  { value: 100, label: '100 miles' },
  { value: 500, label: '500+ miles' },
];

// Age Range Options
export const AGE_RANGE_OPTIONS = [
  { value: 'puppy', label: 'Puppy (0-1 year)' },
  { value: 'young', label: 'Young (1-3 years)' },
  { value: 'adult', label: 'Adult (3-7 years)' },
  { value: 'senior', label: 'Senior (7+ years)' },
];

// Notification Types
export const NOTIFICATION_TYPES = [
  'new_match',
  'new_message',
  'new_like',
  'profile_view',
  'reminder',
  'system',
];

// Message Types
export const MESSAGE_TYPES = [
  'text',
  'image',
  'location',
  'system',
  'voice',
  'video',
  'audio',
  'gif',
  'sticker',
];

// Match Types
export const MATCH_TYPES = [
  'adoption',
  'mating',
  'playdate',
  'general',
];

// Pet Status Options
export const PET_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'adopted', label: 'Adopted' },
  { value: 'unavailable', label: 'Unavailable' },
];

// Verification Status Options
export const VERIFICATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

// Premium Plan Options
export const PREMIUM_PLAN_OPTIONS = [
  { value: 'basic', label: 'Basic Plan' },
  { value: 'premium', label: 'Premium Plan' },
  { value: 'gold', label: 'Gold Plan' },
];

// Privacy Settings Options
export const PRIVACY_SETTINGS_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'matches', label: 'Matches Only' },
  { value: 'nobody', label: 'Nobody' },
];

// Notification Frequency Options
export const NOTIFICATION_FREQUENCY_OPTIONS = [
  { value: 'instant', label: 'Instant' },
  { value: 'batched', label: 'Batched' },
  { value: 'daily', label: 'Daily' },
];

// Residence Type Options
export const RESIDENCE_TYPE_OPTIONS = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'mobile_home', label: 'Mobile Home' },
  { value: 'other', label: 'Other' },
];

// Ownership Type Options
export const OWNERSHIP_TYPE_OPTIONS = [
  { value: 'own', label: 'Own' },
  { value: 'rent', label: 'Rent' },
  { value: 'lease', label: 'Lease' },
  { value: 'other', label: 'Other' },
];

// Yard Type Options
export const YARD_TYPE_OPTIONS = [
  { value: 'fenced', label: 'Fenced Yard' },
  { value: 'unfenced', label: 'Unfenced Yard' },
  { value: 'no_yard', label: 'No Yard' },
  { value: 'shared', label: 'Shared Yard' },
];

// Application Status Options
export const APPLICATION_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'completed', label: 'Completed' },
];

// Meeting Status Options
export const MEETING_STATUS_OPTIONS = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Virtual Meetup Platform Options
export const VIRTUAL_MEETUP_PLATFORM_OPTIONS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'video_call', label: 'Video Call' },
];

// Shelter Specialization Options
export const SHELTER_SPECIALIZATION_OPTIONS = [
  'dogs',
  'cats',
  'birds',
  'rabbits',
  'rescue',
  'foster',
  'senior-pets',
  'special-needs',
  'wildlife',
];

// Shelter Service Options
export const SHELTER_SERVICE_OPTIONS = [
  'adoption',
  'foster',
  'medical',
  'training',
  'grooming',
  'boarding',
  'emergency-care',
  'behavioral-support',
];

// Pack Group Activity Level Options
export const PACK_ACTIVITY_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low Activity' },
  { value: 'moderate', label: 'Moderate Activity' },
  { value: 'high', label: 'High Activity' },
  { value: 'very-high', label: 'Very High Activity' },
];

// Pack Group Meeting Frequency Options
export const PACK_MEETING_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'irregular', label: 'Irregular' },
];

// Pack Group Privacy Options
export const PACK_PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'invite-only', label: 'Invite Only' },
];

// Story Types
export const STORY_TYPES = [
  'daily-life',
  'adventure',
  'training',
  'health',
  'adoption',
  'meetup',
  'achievement',
  'funny',
  'educational',
];

// Story Visibility Options
export const STORY_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'friends', label: 'Friends Only' },
  { value: 'private', label: 'Private' },
];

// Report Types
export const REPORT_TYPES = [
  'inappropriate-content',
  'spam',
  'harassment',
  'fake-profile',
  'safety-concern',
  'other',
];

// Report Status Options
export const REPORT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

// Block Reasons
export const BLOCK_REASONS = [
  'inappropriate-behavior',
  'spam',
  'harassment',
  'safety-concern',
  'fake-profile',
  'other',
];

// Support Ticket Categories
export const SUPPORT_TICKET_CATEGORIES = [
  'technical-issue',
  'account-problem',
  'billing-question',
  'feature-request',
  'bug-report',
  'general-inquiry',
];

// Support Ticket Priority Options
export const SUPPORT_TICKET_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' },
];

// Support Ticket Status Options
export const SUPPORT_TICKET_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

// Analytics Event Types
export const ANALYTICS_EVENT_TYPES = [
  'user_signup',
  'user_login',
  'pet_created',
  'pet_viewed',
  'pet_liked',
  'pet_passed',
  'match_created',
  'message_sent',
  'profile_updated',
  'premium_purchased',
  'feature_used',
  'error_occurred',
];

// Feature Flags
export const FEATURE_FLAGS = {
  AI_BIO_GENERATION: 'ai_bio_generation',
  AI_PHOTO_ANALYSIS: 'ai_photo_analysis',
  AI_COMPATIBILITY: 'ai_compatibility',
  PREMIUM_FEATURES: 'premium_features',
  STORIES_FEATURE: 'stories_feature',
  PACK_GROUPS: 'pack_groups',
  VIRTUAL_MEETUPS: 'virtual_meetups',
  SHELTER_INTEGRATION: 'shelter_integration',
  ADOPTION_TRACKING: 'adoption_tracking',
  ADVANCED_FILTERS: 'advanced_filters',
  VOICE_MESSAGES: 'voice_messages',
  VIDEO_CALLS: 'video_calls',
  REAL_TIME_LOCATION: 'real_time_location',
  PUSH_NOTIFICATIONS: 'push_notifications',
  DARK_MODE: 'dark_mode',
  MULTI_LANGUAGE: 'multi_language',
  ACCESSIBILITY_FEATURES: 'accessibility_features',
  OFFLINE_MODE: 'offline_mode',
  ANALYTICS_TRACKING: 'analytics_tracking',
  MODERATION_SYSTEM: 'moderation_system',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    DELETE: '/users/delete',
    PREFERENCES: '/users/preferences',
  },
  PETS: {
    LIST: '/pets',
    CREATE: '/pets',
    UPDATE: '/pets/:id',
    DELETE: '/pets/:id',
    DETAILS: '/pets/:id',
    PHOTOS: '/pets/:id/photos',
  },
  MATCHES: {
    LIST: '/matches',
    CREATE: '/matches',
    DETAILS: '/matches/:id',
    MESSAGES: '/matches/:id/messages',
  },
  MESSAGES: {
    SEND: '/messages',
    LIST: '/messages',
    UPDATE: '/messages/:id',
    DELETE: '/messages/:id',
  },
  ANALYTICS: {
    EVENTS: '/analytics/events',
    METRICS: '/analytics/metrics',
    REPORTS: '/analytics/reports',
  },
  ADMIN: {
    USERS: '/admin/users',
    PETS: '/admin/pets',
    REPORTS: '/admin/reports',
    ANALYTICS: '/admin/analytics',
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  SUBSCRIPTION_ERROR: 'SUBSCRIPTION_ERROR',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PET_CREATED: 'Pet profile created successfully',
  PET_UPDATED: 'Pet profile updated successfully',
  PET_DELETED: 'Pet profile deleted successfully',
  MATCH_CREATED: 'New match created!',
  MESSAGE_SENT: 'Message sent successfully',
  PHOTO_UPLOADED: 'Photo uploaded successfully',
  PREFERENCES_SAVED: 'Preferences saved successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  PASSWORD_RESET: 'Password reset successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  SUBSCRIPTION_ACTIVATED: 'Subscription activated successfully',
  REPORT_SUBMITTED: 'Report submitted successfully',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_TOO_WEAK: 'Password must contain uppercase, lowercase, and number',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  AGE_INVALID: 'Must be between 18 and 120 years old',
  PHONE_INVALID: 'Please enter a valid phone number',
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  NAME_TOO_LONG: 'Name must be less than 50 characters',
  BIO_TOO_LONG: 'Bio must be less than 500 characters',
  PHOTO_REQUIRED: 'At least one photo is required',
  PHOTO_TOO_LARGE: 'Photo file size too large',
  PHOTO_FORMAT_INVALID: 'Invalid photo format',
  LOCATION_REQUIRED: 'Location is required',
  TERMS_NOT_ACCEPTED: 'You must accept the terms and conditions',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  MAX_DISTANCE: 50,
  MIN_AGE: 0,
  MAX_AGE: 30,
  PAGE_SIZE: 20,
  MAX_PHOTOS: 10,
  MAX_BIO_LENGTH: 500,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Rate Limits
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  PASSWORD_RESET_REQUESTS: 3,
  MESSAGE_SEND: 100,
  PHOTO_UPLOAD: 20,
  PROFILE_VIEWS: 50,
  SWIPE_ACTIONS: 1000,
  REPORT_SUBMISSIONS: 10,
  SUPPORT_TICKETS: 5,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_PHOTO_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  ALLOWED_VIDEO_FORMATS: ['mp4', 'mov', 'avi'],
  ALLOWED_AUDIO_FORMATS: ['mp3', 'wav', 'm4a'],
} as const;

// Pagination Constants
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  PET_PROFILES: 'pet_profiles',
  MATCHES: 'matches',
  MESSAGES: 'messages',
  PREFERENCES: 'preferences',
  ANALYTICS: 'analytics',
  FEATURE_FLAGS: 'feature_flags',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  NOTIFICATION_SETTINGS: 'notification_settings',
  OFFLINE_DATA: 'offline_data',
} as const;

// Environment Variables
export const ENV_VARIABLES = {
  API_BASE_URL: 'REACT_APP_API_BASE_URL',
  WS_BASE_URL: 'REACT_APP_WS_BASE_URL',
  STRIPE_PUBLISHABLE_KEY: 'REACT_APP_STRIPE_PUBLISHABLE_KEY',
  GOOGLE_MAPS_API_KEY: 'REACT_APP_GOOGLE_MAPS_API_KEY',
  SENTRY_DSN: 'REACT_APP_SENTRY_DSN',
  ANALYTICS_ID: 'REACT_APP_ANALYTICS_ID',
  DEBUG_MODE: 'REACT_APP_DEBUG_MODE',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL: /^https?:\/\/.+/,
  COORDINATES: /^-?\d+\.?\d*,-?\d+\.?\d*$/,
} as const;

// Color Constants
export const COLOR_CONSTANTS = {
  PRIMARY: '#7C3AED',
  SECONDARY: '#0EA5E9',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  LIGHT: '#F8FAFC',
  DARK: '#1E293B',
  GRAY: '#6B7280',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
  LARGE_DESKTOP: 1536,
} as const;

// Z-Index Values
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Accessibility Constants
export const ACCESSIBILITY_CONSTANTS = {
  MIN_TOUCH_TARGET: 44, // pixels
  MIN_CONTRAST_RATIO: 4.5,
  MAX_LINE_LENGTH: 75, // characters
  MIN_FONT_SIZE: 16, // pixels
} as const;

// Performance Constants
export const PERFORMANCE_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  LAZY_LOAD_THRESHOLD: 100, // pixels
  IMAGE_LOAD_TIMEOUT: 10000, // milliseconds
  API_TIMEOUT: 30000, // milliseconds
} as const;

// Security Constants
export const SECURITY_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour
  EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Haptic Settings (re-exported from haptics.ts)
export { HAPTICS, HAPTIC_CLASSES, HAPTIC_DURATIONS } from './haptics';

// Haptic Settings Configuration
export const HAPTIC_SETTINGS = {
  enabled: true,
  intensity: 'medium-impact' as const,
  vibration: true,
  sound: false,
  customPatterns: {
    success: [100, 50, 100],
    warning: [200, 100, 200],
    error: [300, 150, 300],
  },
} as const;

// General Settings
export const SETTINGS = {
  HAPTICS: HAPTIC_SETTINGS,
  THEME: 'light' as const,
  LANGUAGE: 'en' as const,
  NOTIFICATIONS: {
    enabled: true,
    sound: true,
    vibration: true,
    badges: true,
  },
  PRIVACY: {
    profileVisibility: 'everyone' as const,
    showOnlineStatus: true,
    showDistance: true,
    allowMessages: 'everyone' as const,
  },
  ACCESSIBILITY: {
    highContrast: false,
    largeText: false,
    screenReader: false,
    reducedMotion: false,
  },
} as const;