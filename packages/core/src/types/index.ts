/**
 * Shared Types for PawfectMatch
 * Rule II.1: Cross-Platform Architecture - shared types in packages/core
 * Comprehensive types migrated from client/src/types
 */

// Export account management types
export * from './account';

// Export API response types
export * from './api-responses';

// Export story types
export * from './story';

// User Types
export interface User {
  _id: string;
  id: string; // Alias for _id
  activePetId?: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  avatar?: string;
  bio?: string;
  phone?: string;
  token?: string;
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
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    frequency: 'instant' | 'batched' | 'daily';
    sound: boolean;
    vibration: boolean;
  };
  pets: string[];
  analytics: {
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

// Pet Types
export interface Pet {
  _id: string;
  id: string; // Alias for _id for consistency
  owner: User | string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  weight?: number;
  color?: {
    primary?: string;
    secondary?: string;
    pattern?: 'solid' | 'spotted' | 'striped' | 'mixed' | 'other';
  };
  photos: PetPhoto[];
  videos?: PetVideo[];
  description?: string;
  personalityTags: string[];
  intent: 'adoption' | 'mating' | 'playdate' | 'all';
  availability: {
    isAvailable: boolean;
    schedule?: WeeklySchedule;
  };
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
    healthConditions?: string[];
    medications?: string[];
    specialNeeds?: string;
    lastVetVisit?: string;
    vetContact?: {
      name?: string;
      phone?: string;
      clinic?: string;
    };
  };
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
  aiData?: {
    personalityScore?: {
      friendliness?: number;
      energy?: number;
      trainability?: number;
      socialness?: number;
      aggression?: number;
    };
    compatibilityTags?: string[];
    breedCharacteristics?: {
      temperament?: string[];
      energyLevel?: string;
      groomingNeeds?: string;
      healthConcerns?: string[];
    };
    lastUpdated?: string;
  };
  featured: {
    isFeatured: boolean;
    featuredUntil?: string;
    boostCount: number;
    lastBoosted?: string;
  };
  analytics: {
    views: number;
    likes: number;
    matches: number;
    messages: number;
    lastViewed?: string;
  };
  isActive: boolean;
  isVerified: boolean;
  status: 'active' | 'paused' | 'adopted' | 'unavailable';
  adoptedAt?: string;
  listedAt: string;
  createdAt: string;
  updatedAt: string;
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

// Match Types
export interface Match {
  _id: string;
  pet1: Pet;
  pet2: Pet;
  user1: User;
  user2: User;
  matchType: 'adoption' | 'mating' | 'playdate' | 'general';
  compatibilityScore: number;
  aiRecommendationReason?: string;
  status: 'active' | 'archived' | 'blocked' | 'deleted' | 'completed';
  messages: Message[];
  meetings?: Meeting[];
  lastActivity: string;
  lastMessageAt?: string;
  messageCount: number;
  userActions: {
    user1: UserMatchActions;
    user2: UserMatchActions;
  };
  outcome?: {
    result?: 'pending' | 'met' | 'adopted' | 'mated' | 'no-show' | 'incompatible';
    completedAt?: string;
    rating?: {
      user1Rating?: number;
      user2Rating?: number;
    };
    feedback?: {
      user1Feedback?: string;
      user2Feedback?: string;
    };
  };
  isMatch: boolean; // Indicates if this is a mutual match
  matchId?: string; // Optional ID for the match
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  messageType: 'text' | 'image' | 'location' | 'system' | 'voice' | 'video' | 'audio' | 'gif' | 'sticker';
  attachments?: Attachment[];
  readBy: ReadReceipt[];
  sentAt: string;
  editedAt?: string;
  isEdited: boolean;
  isDeleted: boolean;
  duration?: number; // For voice/video messages
  thumbnailUrl?: string; // For video messages
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

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  agreeToTerms: boolean;
}

export interface PetForm {
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  weight?: number;
  description?: string;
  personalityTags: string[];
  intent: string;
  photos: File[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
    specialNeeds?: string;
  };
}

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

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type PaginatedResponse<T = unknown> = ApiResponse<{
  items?: T[];
  pets?: T[];
  matches?: T[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
    hasMore: boolean;
  };
}>;

// Re-export socket event types
export * from './moderation';
export * from './socket';

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

export interface AdoptionApplication {
  _id: string;
  petId: string;
  applicantId: string;
  shelterId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn' | 'completed';
  submittedAt?: string;
  reviewedAt?: string;
  completedAt?: string;

  // Application data
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    occupation?: string;
    householdSize: number;
    hasChildren: boolean;
    childrenAges?: number[];
  };

  livingSituation: {
    residenceType: 'house' | 'apartment' | 'condo' | 'mobile_home' | 'other';
    ownership: 'own' | 'rent' | 'lease' | 'other';
    yardType?: 'fenced' | 'unfenced' | 'no_yard' | 'shared';
    landlordPermission?: boolean; // if renting
    movePlans?: string; // any planned moves
  };

  petExperience: {
    hasOwnedPets: boolean;
    currentPets: CurrentPetInfo[];
    previousPets: PreviousPetInfo[];
    petPreferences: {
      species: string[];
      size: string[];
      ageRange: {
        min: number;
        max: number;
      };
      specialNeeds: boolean;
    };
  };

  lifestyle: {
    dailySchedule: string;
    exercisePlan: string;
    aloneTime: string; // how long pet would be alone
    vacationPlans: string;
    budget: {
      monthlyPetBudget: number;
      emergencyFund: boolean;
    };
  };

  references: AdoptionReference[];
  homeVisit: {
    scheduled: boolean;
    scheduledDate?: string;
    completed: boolean;
    completedDate?: string;
    notes?: string;
  };

  documents: {
    idVerification?: string;
    incomeProof?: string;
    residenceProof?: string;
    references?: string[];
  };

  aiInsights?: {
    compatibilityScore: number;
    riskFactors: string[];
    recommendations: string[];
    interviewQuestions?: string[];
  };

  notes?: string; // Internal shelter notes
  createdAt: string;
  updatedAt: string;
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
