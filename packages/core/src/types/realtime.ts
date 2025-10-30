/**
 * Realtime domain types shared across web, mobile and backend.
 * These are used by Socket.io events for Phase-3/4 features.
 */

export interface PulsePin {
  _id: string; // Mongo ObjectId
  petId: string; // Reference to Pet
  ownerId: string; // Reference to User
  coordinates: [number, number]; // [lng, lat]
  activity: 'walking' | 'playing' | 'grooming' | 'vet' | 'park' | 'other';
  message?: string; // Optional short status
  createdAt: string;
}

export interface MemoryNode {
  _id: string;
  matchId: string; // Chat / Match relationship
  summary: string; // AI-generated summary paragraph
  highlights: string[]; // Key sentences / moments
  imageUrl?: string; // Representative photo (if any)
  createdAt: string; // nightly batch timestamp
}

export interface SuggestionEvent {
  matchId: string;
  senderId: string;
  suggestionType: 'schedule_playdate' | 'share_photo' | 'share_location';
  payload: Record<string, string | number | boolean>; // e.g. { location:'Central Park', time:'Tomorrow 17:00' }
}
