/**
 * Test Data Factories
 * Generate consistent test data for PawfectMatch Mobile App
 */

import type {
  Pet,
  User,
  Match,
  Message,
  Notification,
} from "@pawfectmatch/core";

/**
 * Pet Data Factory
 */
export const createMockPet = (overrides: Partial<Pet> = {}): Pet => ({
  _id: `pet-${Math.random().toString(36).substring(7)}`,
  owner: "owner-123",
  name: "Buddy",
  species: "dog",
  breed: "Golden Retriever",
  age: 3,
  gender: "male",
  size: "large",
  intent: "playdate",
  bio: "Friendly and energetic dog looking for playmates",
  photos: [
    { 
      url: "https://example.com/photo1.jpg", 
      thumbnail: "https://example.com/thumb1.jpg",
      cloudinaryId: "cloudinary_123"
    },
    { 
      url: "https://example.com/photo2.jpg", 
      thumbnail: "https://example.com/thumb2.jpg",
      cloudinaryId: "cloudinary_456"
    },
  ],
  personalityTags: ["friendly", "energetic", "playful"],
  healthInfo: {
    vaccinated: true,
    spayedNeutered: true,
    microchipped: true,
  },
  location: {
    type: "Point",
    coordinates: [40.7128, -74.006],
  },
  compatibilityScore: 85,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

/**
 * User Data Factory
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: `user-${Math.random().toString(36).substring(7)}`,
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  avatar: "https://example.com/profile.jpg",
  location: {
    type: "Point",
    coordinates: [40.7128, -74.006],
  },
  premium: {
    isActive: false,
    plan: "basic",
  },
  profileComplete: true,
  subscriptionStatus: "free",
  role: "user",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

/**
 * Match Data Factory
 */
export const createMockMatch = (overrides: Partial<Match> = {}): Match => ({
  _id: `match-${Math.random().toString(36).substring(7)}`,
  pet1: createMockPet({ _id: "pet-123", name: "Buddy" }),
  pet2: createMockPet({ _id: "pet-456", name: "Max" }),
  status: "active",
  matchedAt: "2024-01-01T00:00:00.000Z",
  lastMessage: {
    content: "Hey! Want to meet up?",
    sender: "user-123",
    timestamp: "2024-01-15T00:00:00.000Z",
  },
  petName: "Buddy",
  petAge: 3,
  petBreed: "Golden Retriever",
  isOnline: true,
  lastActive: "2024-01-15T00:00:00.000Z",
  ...overrides,
});

/**
 * Message Data Factory
 */
export const createMockMessage = (
  overrides: Partial<Message> = {},
): Message => ({
  _id: `message-${Math.random().toString(36).substring(7)}`,
  match: "match-123",
  sender: "user-123",
  content: "Hello! How are you?",
  timestamp: "2024-01-15T00:00:00.000Z",
  read: false,
  type: "text",
  status: "sent",
  ...overrides,
});

/**
 * Notification Factory
 */
export const createMockNotification = (
  overrides: Partial<Notification> = {},
): Notification => ({
  _id: `notification-${Math.random().toString(36).substring(7)}`,
  userId: "user-123",
  type: "match",
  title: "New Match!",
  message: "You have a new match with Buddy",
  data: { matchId: "match-123" },
  read: false,
  createdAt: "2024-01-15T00:00:00.000Z",
  ...overrides,
});

/**
 * API Response Factory
 */
export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
  success: true,
  data,
  status: 200,
  message: "Success",
  timestamp: new Date().toISOString(),
  ...overrides,
});

/**
 * API Error Response Factory
 */
export const createMockApiError = (message = "API Error", status = 400) => ({
  success: false,
  error: message,
  status,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Swipe Recommendation Factory
 */
export const createMockSwipeRecommendations = (count = 5) =>
  Array.from({ length: count }, () => createMockPet());

/**
 * Chat Messages Factory
 */
export const createMockChatMessages = (count = 10, matchId = "match-123") =>
  Array.from({ length: count }, (_, i) => ({
    ...createMockMessage({
      match: matchId,
      content: `Message ${i + 1}`,
      sender: i % 2 === 0 ? "user-123" : "user-456",
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
    }),
  }));

/**
 * User Preferences Factory
 */
export const createMockPreferences = (overrides = {}) => ({
  maxDistance: 50,
  minAge: 0,
  maxAge: 15,
  species: ["dog", "cat"],
  gender: ["male", "female"],
  sizes: ["small", "medium", "large", "xlarge"],
  intent: ["playdate", "adoption", "breeding"],
  ...overrides,
});

/**
 * Filter State Factory
 */
export const createMockFilterState = (overrides = {}) => ({
  species: [],
  gender: [],
  ageRange: [0, 15],
  size: [],
  intent: [],
  maxDistance: 50,
  sortBy: "newest",
  ...overrides,
});

/**
 * Premium Subscription Factory
 */
export const createMockPremiumSubscription = (overrides = {}) => ({
  isActive: true,
  plan: "premium",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  features: [
    "unlimited_likes",
    "see_who_liked_you",
    "advanced_filters",
    "rewind",
    "boost",
    "read_receipts",
  ],
  ...overrides,
});

/**
 * Socket Event Factory
 */
export const createMockSocketEvent = (event: string, data: any) => ({
  event,
  data,
  timestamp: Date.now(),
});

/**
 * Gesture Event Factory for Testing
 */
export const createMockGestureEvent = (overrides: any = {}) => ({
  nativeEvent: {
    absoluteX: 100,
    absoluteY: 100,
    handlerTag: 1,
    state: 3,
    target: 1,
    timestamp: Date.now(),
    translationX: 0,
    translationY: 0,
    velocityX: 0,
    velocityY: 0,
    x: 100,
    y: 100,
    ...overrides.nativeEvent,
  },
  ...overrides,
});

/**
 * WebRTC Call Factory
 */
export const createMockCall = (overrides = {}) => ({
  callId: `call-${Math.random().toString(36).substring(7)}`,
  matchId: "match-123",
  callerId: "user-123",
  callerName: "John Doe",
  callType: "voice" as "voice" | "video",
  status: "incoming" as "incoming" | "active" | "ended",
  timestamp: Date.now(),
  ...overrides,
});

/**
 * Camera Photo Factory
 */
export const createMockPhoto = (overrides = {}) => ({
  uri: `file://photo-${Math.random().toString(36).substring(7)}.jpg`,
  width: 1920,
  height: 1080,
  type: "image/jpeg",
  size: 1024 * 1024, // 1MB
  ...overrides,
});

/**
 * Network State Factory
 */
export const createMockNetworkState = (isConnected = true) => ({
  isConnected,
  type: isConnected ? "wifi" : "none",
  isInternetReachable: isConnected,
  details: {
    isConnectionExpensive: false,
  },
});

/**
 * Biometric Result Factory
 */
export const createMockBiometricResult = (success = true) => ({
  success,
  error: success ? null : "Authentication failed",
  warning: null,
});

/**
 * Create multiple random pets
 */
export const createMockPets = (
  count: number,
  overrides: Partial<Pet> = {},
): Pet[] => Array.from({ length: count }, () => createMockPet(overrides));

/**
 * Create multiple random users
 */
export const createMockUsers = (
  count: number,
  overrides: Partial<User> = {},
): User[] => Array.from({ length: count }, () => createMockUser(overrides));

/**
 * Create multiple random matches
 */
export const createMockMatches = (
  count: number,
  overrides: Partial<Match> = {},
): Match[] => Array.from({ length: count }, () => createMockMatch(overrides));

/**
 * Random picker utilities
 */
export const randomPick = <T>(arr: T[]): T | undefined =>
  arr[Math.floor(Math.random() * arr.length)];

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
