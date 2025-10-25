/**
 * Domain Model Types
 * Core business entities used throughout the application
 */

// User Model
export interface User {
  _id: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  age?: number;
  phone?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  premium: {
    isActive: boolean;
    plan: 'basic' | 'premium' | 'gold';
    expiresAt?: string;
    features?: {
      unlimitedLikes: boolean;
      boostProfile: boolean;
      seeWhoLiked: boolean;
      advancedFilters: boolean;
    };
  };
  profileComplete: boolean;
  subscriptionStatus: 'free' | 'premium' | 'premium_plus';
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified?: boolean;
  isActive?: boolean;
  preferences?: {
    maxDistance: number;
    ageRange: { min: number; max: number };
    species: string[];
    intents: string[];
    notifications: {
      email: boolean;
      push: boolean;
      matches: boolean;
      messages: boolean;
    };
  };
  pets?: string[];
  analytics?: {
    totalSwipes: number;
    totalLikes: number;
    totalMatches: number;
    profileViews: number;
    lastActive: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Pet Model
export interface Pet {
  _id: string;
  id?: string; // Alias for _id for backward compatibility
  owner: string | { _id: string; [key: string]: unknown };
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  photos: Array<{
    url: string;
    thumbnail?: string;
    cloudinaryId?: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
  videos?: Array<{
    url: string;
    thumbnail?: string;
    duration?: number;
  }>;
  personalityTags: string[];
  intent: 'adoption' | 'mating' | 'playdate' | 'all';
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  availability?: {
    isAvailable: boolean;
    nextAvailableDate?: string | null;
    reason?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  bio?: string;
  description?: string;
  weight?: number;
  compatibilityScore?: number;
  featured?: {
    isFeatured: boolean;
    boostCount: number;
    expiresAt?: string | null;
  };
  analytics?: {
    views: number;
    likes: number;
    matches: number;
    messages: number;
  };
  isActive?: boolean;
  isVerified?: boolean;
  status?: 'active' | 'pending' | 'adopted' | 'inactive';
  listedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Match Model
export interface Match {
  _id: string;
  pet1: Pet;
  pet2: Pet;
  status: 'pending' | 'active' | 'rejected';
  matchedAt: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  petName: string;
  petAge: number;
  petBreed: string;
  isOnline: boolean;
  lastActive?: string;
}

// Message Model
export interface Message {
  _id: string;
  match: string;
  sender: string | User;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'voice' | 'video' | 'location' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Array<{
    type: string;
    url: string;
    fileName?: string;
    fileType?: string;
  }>;
  metadata?: {
    imageUrl?: string;
    voiceUrl?: string;
    videoUrl?: string;
    duration?: number;
  };
  // Backward compatibility aliases
  messageType?: 'text' | 'image' | 'voice' | 'video' | 'location' | 'system';
  sentAt?: string;
  editedAt?: string;
  readBy?: Array<{ user: string; readAt: string }>;
  isEdited?: boolean;
  isDeleted?: boolean;
}

// Swipe Model
export interface Swipe {
  _id: string;
  swiper: string;
  swiped: string;
  action: 'like' | 'pass' | 'superlike';
  createdAt: string;
}

// Adoption Listing Model
export interface AdoptionListing {
  _id: string;
  petId: string;
  pet: Pet;
  owner: User;
  adoptionFee: number;
  requirements: string[];
  description: string;
  photos: string[];
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  applications: string[];
  createdAt: string;
  updatedAt: string;
}

// Adoption Application Model
export interface AdoptionApplication {
  _id: string;
  listingId: string;
  applicantId: string;
  applicant: User;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  applicationData: {
    experience: string;
    livingSituation: string;
    references: Array<{
      name: string;
      relationship: string;
      contact: string;
    }>;
    additionalNotes?: string;
  };
  submittedAt: string;
  reviewedAt?: string;
}

// Subscription Model
export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  plan: 'basic' | 'premium' | 'gold';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Notification Model
export interface Notification {
  _id: string;
  userId: string;
  type: 'match' | 'message' | 'like' | 'story' | 'adoption' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Report Model
export interface Report {
  _id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedPetId?: string;
  reportedMessageId?: string;
  reason: 'inappropriate_content' | 'spam' | 'harassment' | 'fake_profile' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Analytics Model
export interface Analytics {
  _id: string;
  userId: string;
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
  platform: 'ios' | 'android' | 'web';
  version: string;
}

// Chat Room Model (for group chats)
export interface ChatRoom {
  _id: string;
  name: string;
  participants: string[];
  admins: string[];
  type: 'direct' | 'group';
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

// Call Model
export interface Call {
  _id: string;
  callerId: string;
  receiverId: string;
  type: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'answered' | 'ended' | 'missed' | 'rejected';
  duration?: number;
  startedAt: string;
  endedAt?: string;
}

// Filter Model
export interface Filter {
  species?: string[];
  breeds?: string[];
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: string[];
  size?: string[];
  distance?: number;
  onlineOnly?: boolean;
  vaccinated?: boolean;
  spayedNeutered?: boolean;
}

// Search Model
export interface SearchQuery {
  query: string;
  filters: Filter;
  location?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
}

// Pagination Model
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Form Validation Models
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface PetForm {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  personalityTags: string[];
  intent: 'adoption' | 'mating' | 'playdate' | 'all';
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  bio?: string;
  photos: string[];
}

// Navigation Models
export interface NavigationParams {
  [key: string]: unknown;
}

export interface RootStackParamList {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Swipe: undefined;
  Matches: undefined;
  Chat: { matchId: string; petName: string };
  Profile: undefined;
  EditProfile: undefined;
  Premium: undefined;
  SubscriptionManager: undefined;
  SubscriptionSuccess: undefined;
  PrivacySettings: undefined;
  BlockedUsers: undefined;
  SafetyCenter: undefined;
  NotificationPreferences: undefined;
  HelpSupport: undefined;
  AboutTermsPrivacy: undefined;
  DeactivateAccount: undefined;
  AdvancedFilters: undefined;
  ModerationTools: undefined;
  ARScentTrails: undefined;
  CreateListing: { petId?: string };
  AIBio: undefined;
  AIPhotoAnalyzer: undefined;
  AICompatibility: { pet1Id: string; pet2Id: string };
  Stories: { groupIndex?: number };
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminAnalytics: undefined;
  AdminModeration: undefined;
}

// Theme Models
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}

// Device Models
export interface DeviceInfo {
  platform: 'ios' | 'android';
  version: string;
  model: string;
  brand?: string;
  isTablet: boolean;
  hasNotch: boolean;
  screenWidth: number;
  screenHeight: number;
  statusBarHeight: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Location Models
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  formattedAddress: string;
}