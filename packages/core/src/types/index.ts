/**
 * Shared Types for PawfectMatch
 * Rule II.1: Cross-Platform Architecture - shared types in packages/core
 * Comprehensive types migrated from client/src/types
 */

import type { Match, Message } from './models';

// Export account management types
export * from './account';

// Export API response types
export * from './api-responses';

// Export model types
export * from './models';

// Export story types
export * from './story';

// Export moderation types
export * from './moderation';

// Filter Types
export interface PetFilters {
  species?: string;
  intent?: string;
  maxDistance?: number;
  minAge?: number;
  maxAge?: number;
  size?: string;
  gender?: string;
  breed?: string;
  personalityTags?: string[];
  excludeIds?: string[];
}

// Swipe Types
export interface SwipeAction {
  petId: string;
  action: 'like' | 'pass' | 'superlike';
}

export interface SwipeResult {
  isMatch: boolean;
  matchId?: string;
  action: string;
  match?: Match;
}

// AI Types
export interface AIRecommendation {
  petId: string;
  score: number;
  reasons: string[];
}

export interface CompatibilityAnalysis {
  compatibility_score: number;
  factors: string[];
  recommendation: string;
}

// UI Types
export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Socket Types
export interface SocketMessage {
  matchId: string;
  message: Message;
}

export interface SocketNotification {
  type: 'new_message' | 'new_match' | 'user_online' | 'user_offline';
  title: string;
  body?: string;
  matchId?: string;
  senderId?: string;
  userId?: string;
}

// Shelter Types
export interface Shelter {
  _id: string;
  name: string;
  description?: string;
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates: [number, number];
    };
  };
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationDocuments?: {
    businessLicense?: string;
    nonProfitStatus?: string;
    insurance?: string;
    facilityPhotos?: string[];
  };
  operatingHours: WeeklySchedule;
  capacity: {
    current: number;
    max: number;
  };
  specializations: string[]; // e.g., ['dogs', 'cats', 'rescue', 'foster']
  services: string[]; // e.g., ['adoption', 'foster', 'medical', 'training']
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  adoptionStats: {
    totalAdoptions: number;
    successRate: number;
    averageWaitTime: number; // in days
  };
  policies: {
    adoptionFee?: number;
    applicationProcess?: string;
    homeVisitRequired: boolean;
    referencesRequired: number;
    ageRestrictions?: {
      minAge?: number;
      maxAge?: number;
    };
  };
  admins: string[]; // User IDs of shelter administrators
  volunteers: string[]; // User IDs of volunteers
  pets: string[]; // Pet IDs available for adoption
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  available: boolean;
  times: string[];
}

export interface PetPhoto {
  url: string;
  publicId?: string;
  caption?: string;
  isPrimary: boolean;
}

export interface PetVideo {
  url: string;
  publicId?: string;
  caption?: string;
  duration?: number;
}

export interface UserMatchActions {
  isArchived: boolean;
  isBlocked: boolean;
  isFavorite: boolean;
  muteNotifications: boolean;
  lastSeen?: string;
}

export interface Meeting {
  _id?: string;
  proposedBy: string;
  title: string;
  description?: string;
  proposedDate: string;
  location?: {
    name?: string;
    address?: string;
    coordinates?: [number, number];
  };
  status: 'proposed' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  responses: MeetingResponse[];
  createdAt: string;
}

export interface MeetingResponse {
  user: string;
  response: 'accepted' | 'declined' | 'maybe';
  respondedAt: string;
  note?: string;
}

export interface Attachment {
  type: string;
  fileType?: string;
  fileName?: string;
  url: string;
}

export interface ReadReceipt {
  user: string;
  readAt: string;
}

export interface CurrentPetInfo {
  name: string;
  species: string;
  age: number;
  vaccinated: boolean;
  spayedNeutered: boolean;
}

export interface PreviousPetInfo {
  name: string;
  species: string;
  ownedFor: number; // years
  reasonForChange: string;
}

export interface AdoptionReference {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  knownFor: number; // years known
  contacted: boolean;
  response?: string;
}

export interface VirtualMeetup {
  _id: string;
  petId: string;
  applicantId: string;
  shelterId: string;
  applicationId: string;
  scheduledDate: string;
  duration: number; // minutes
  platform: 'zoom' | 'google_meet' | 'phone' | 'video_call';
  meetingLink?: string;
  phoneNumber?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  participants: {
    shelter: string[]; // User IDs
    applicant: string; // User ID
  };
  agenda: string[];
  notes?: string;
  followUpRequired: boolean;
  rescheduleReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdoptionSuccessStory {
  _id: string;
  petId: string;
  adopterId: string;
  shelterId: string;
  title: string;
  story: string;
  photos: string[];
  adoptionDate: string;
  featured: boolean;
  testimonial?: string;
  followUpUpdates?: FollowUpUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpUpdate {
  date: string;
  update: string;
  photos?: string[];
}

// Pack Group Types
export interface PackGroup {
  _id: string;
  name: string;
  description: string;
  location: string;
  maxMembers: number;
  currentMembers: number;
  activityLevel: string;
  meetingFrequency: string;
  privacy: string;
  tags: string[];
  members: string[];
  admins: string[];
  createdAt: string;
  updatedAt: string;
}
