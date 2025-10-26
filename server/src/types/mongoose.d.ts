import { Document, HydratedDocument, Model } from 'mongoose';

/**
 * User preferences structure
 */
export interface IUserPreferences {
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
  species: ('dog' | 'cat' | 'bird' | 'rabbit' | 'other')[];
  intents: ('adoption' | 'mating' | 'playdate')[];
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
  };
}

/**
 * User location structure
 */
export interface IUserLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
}

/**
 * Premium features structure
 */
export interface IUserPremiumFeatures {
  unlimitedLikes: boolean;
  boostProfile: boolean;
  seeWhoLiked: boolean;
  advancedFilters: boolean;
  aiMatching: boolean;
  prioritySupport: boolean;
  globalPassport: boolean;
}

/**
 * Premium usage tracking
 */
export interface IUserPremiumUsage {
  swipesUsed: number;
  swipesLimit: number;
  superLikesUsed: number;
  superLikesLimit: number;
  boostsUsed: number;
  boostsLimit: number;
  messagesSent: number;
  profileViews: number;
}

/**
 * Premium subscription information
 */
export interface IUserPremium {
  isActive: boolean;
  plan: 'basic' | 'premium' | 'ultimate';
  expiresAt?: Date;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd: boolean;
  paymentStatus: 'active' | 'past_due' | 'failed';
  features: IUserPremiumFeatures;
  usage: IUserPremiumUsage;
}

/**
 * User analytics structure
 */
export interface IUserAnalytics {
  totalSwipes: number;
  totalLikes: number;
  totalMatches: number;
  profileViews: number;
  lastActive: Date;
  totalPetsCreated: number;
  totalMessagesSent: number;
  totalSubscriptionsStarted: number;
  totalSubscriptionsCancelled: number;
  totalPremiumFeaturesUsed: number;
  events: Array<{
    type: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
  }>;
}

/**
 * Swiped pet entry
 */
export interface ISwipedPet {
  petId: string;
  action: 'like' | 'pass' | 'superlike';
  swipedAt: Date;
}

/**
 * Push token structure
 */
export interface IPushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  registeredAt: Date;
  lastUsedAt: Date;
}

/**
 * User document interface (base fields only)
 * Extended with full fields in the model definition
 */
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  avatar?: string;
  bio?: string;
  phone?: string;
  location: IUserLocation;
  preferences: IUserPreferences;
  premium: IUserPremium;
  pets: string[];
  swipedPets: ISwipedPet[];
  matches: string[];
  analytics: IUserAnalytics;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  role: 'user' | 'premium' | 'administrator' | 'moderator' | 'support' | 'analyst' | 'billing_admin';
  refreshTokens: string[];
  tokensInvalidatedAt?: Date;
  revokedJtis: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  pushTokens: IPushToken[];
  lastLoginAt?: Date;
  lastLoginIP?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorMethod?: 'sms' | 'email' | 'totp';
  twoFactorCode?: string;
  twoFactorCodeExpiry?: Date;
  biometricEnabled: boolean;
  biometricToken?: string;
  biometricTokenExpiry?: Date;
  webauthnChallenge?: string;
  deletionRequestedAt?: Date;
  deletionRequestId?: string;
  deletionReason?: string;
  deletionFeedback?: string;
  deletionGracePeriodEndsAt?: Date;
  deletionCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User methods (instance methods)
 */
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Partial<IUser>;
}

/**
 * User statics (model methods)
 */
export interface IUserModel extends Model<IUser, Record<string, never>, IUserMethods> {
  findActiveUsers(): ReturnType<Model<IUser>['find']>;
  findPremiumUsers(): ReturnType<Model<IUser>['find']>;
}

/**
 * Fully typed User document
 */
export type IUserDocument = HydratedDocument<IUser, IUserMethods>;

/**
 * Pet media structures
 */
export interface IPetPhoto {
  url: string;
  publicId?: string;
  caption?: string;
  isPrimary: boolean;
}

export interface IPetVideo {
  url: string;
  publicId?: string;
  caption?: string;
  duration?: number;
}

export interface IPetColor {
  primary?: string;
  secondary?: string;
  pattern?: 'solid' | 'spotted' | 'striped' | 'mixed' | 'other';
}

export interface IPetSchedule {
  available: boolean;
  times: string[];
}

export interface IPetAvailability {
  isAvailable: boolean;
  schedule: {
    monday: IPetSchedule;
    tuesday: IPetSchedule;
    wednesday: IPetSchedule;
    thursday: IPetSchedule;
    friday: IPetSchedule;
    saturday: IPetSchedule;
    sunday: IPetSchedule;
  };
}

export interface IPetHealthInfo {
  vaccinated: boolean;
  spayedNeutered: boolean;
  microchipped: boolean;
  healthConditions: string[];
  medications: string[];
  specialNeeds?: string;
  lastVetVisit?: Date;
  vetContact?: {
    name?: string;
    phone?: string;
    clinic?: string;
  };
}

export interface IPetLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
}

export interface IPetAIPersonalityArchetype {
  primary: string;
  secondary: string;
  confidence: number;
}

export interface IPetAIPersonalityScore {
  friendliness: number; // 0-10
  energy: number; // 0-10
  trainability: number; // 0-10
  socialness: number; // 0-10
  aggression: number; // 0-10
  independence: number; // 0-10
}

export interface IPetAIBreedCharacteristics {
  temperament: string[];
  energyLevel: string;
  groomingNeeds: string;
  healthConcerns: string[];
}

export interface IPetAIData {
  personalityArchetype: IPetAIPersonalityArchetype;
  personalityScore: IPetAIPersonalityScore;
  compatibilityTags: string[];
  breedCharacteristics: IPetAIBreedCharacteristics;
  lastUpdated: Date;
}

export interface IPetFeatured {
  isFeatured: boolean;
  featuredUntil?: Date;
  boostCount: number;
  lastBoosted?: Date;
}

export interface IPetAnalytics {
  views: number;
  likes: number;
  superLikes: number;
  matches: number;
  messages: number;
  lastViewed?: Date;
  events: Array<{
    type: string;
    userId: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
  }>;
}

/**
 * Pet document interface
 */
export interface IPet extends Document {
  owner: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  weight?: number;
  color: IPetColor;
  photos: IPetPhoto[];
  videos: IPetVideo[];
  description?: string;
  personalityTags: string[];
  intent: 'adoption' | 'mating' | 'playdate' | 'all';
  availability: IPetAvailability;
  healthInfo: IPetHealthInfo;
  location: IPetLocation;
  aiData: IPetAIData;
  featured: IPetFeatured;
  analytics: IPetAnalytics;
  isActive: boolean;
  isVerified: boolean;
  status: 'active' | 'paused' | 'adopted' | 'unavailable';
  adoptedAt?: Date;
  listedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pet methods (instance methods)
 */
export interface IPetMethods {
  updateAnalytics(action: 'view' | 'like' | 'match' | 'message'): Promise<any>;
  isCompatibleWith(otherPet: IPet): boolean;
  toJSON(): Partial<IPet>;
}

/**
 * Pet statics (model methods)
 */
export interface IPetModel extends Model<IPet, Record<string, never>, IPetMethods> {
  findBySpeciesAndIntent(species?: string, intent?: string): ReturnType<Model<IPet>['find']>;
  findFeatured(): ReturnType<Model<IPet>['find']>;
}

/**
 * Fully typed Pet document
 */
export type IPetDocument = HydratedDocument<IPet, IPetMethods>;

/**
 * Match message attachment
 */
export interface IMatchMessageAttachment {
  type: string;
  fileType?: string;
  fileName?: string;
}

/**
 * Match message read status
 */
export interface IMatchMessageRead {
  user: string;
  readAt: Date;
}

/**
 * Match message
 */
export interface IMatchMessage {
  sender: string;
  content: string;
  messageType: 'text' | 'image' | 'location' | 'system';
  attachments: IMatchMessageAttachment[];
  readBy: IMatchMessageRead[];
  sentAt: Date;
  editedAt?: Date;
  isEdited: boolean;
  isDeleted: boolean;
}

/**
 * Meeting location
 */
export interface IMeetingLocation {
  name?: string;
  address?: string;
  coordinates?: [number, number];
}

/**
 * Meeting response
 */
export interface IMeetingResponse {
  user: string;
  response: 'accepted' | 'declined' | 'maybe';
  respondedAt: Date;
  note?: string;
}

/**
 * Match meeting
 */
export interface IMatchMeeting {
  proposedBy: string;
  title: string;
  description?: string;
  proposedDate: Date;
  location?: IMeetingLocation;
  status: 'proposed' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  responses: IMeetingResponse[];
  createdAt: Date;
}

/**
 * User actions on match
 */
export interface IMatchUserActions {
  isArchived: boolean;
  isBlocked: boolean;
  isFavorite: boolean;
  muteNotifications: boolean;
  lastSeen?: Date;
}

/**
 * Match outcome rating
 */
export interface IMatchOutcomeRating {
  user1Rating?: number;
  user2Rating?: number;
}

/**
 * Match outcome feedback
 */
export interface IMatchOutcomeFeedback {
  user1Feedback?: string;
  user2Feedback?: string;
}

/**
 * Match outcome
 */
export interface IMatchOutcome {
  result?: 'pending' | 'met' | 'adopted' | 'mated' | 'no-show' | 'incompatible';
  completedAt?: Date;
  rating: IMatchOutcomeRating;
  feedback: IMatchOutcomeFeedback;
}

/**
 * Match document interface
 */
export interface IMatch extends Document {
  pet1: string;
  pet2: string;
  user1: string;
  user2: string;
  matchType: 'adoption' | 'mating' | 'playdate' | 'general';
  compatibilityScore: number;
  aiRecommendationReason?: string;
  status: 'active' | 'archived' | 'blocked' | 'deleted' | 'completed';
  messages: IMatchMessage[];
  meetings: IMatchMeeting[];
  lastActivity: Date;
  lastMessageAt?: Date;
  messageCount: number;
  userActions: {
    user1: IMatchUserActions;
    user2: IMatchUserActions;
  };
  outcome: IMatchOutcome;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Match methods (instance methods)
 */
export interface IMatchMethods {
  addMessage(senderId: string, content: string, messageType?: string, attachments?: IMatchMessageAttachment[]): Promise<any>;
  markMessagesAsRead(userId: string): Promise<any>;
  isUserBlocked(userId: string): boolean;
  toggleArchive(userId: string): Promise<any>;
  toggleFavorite(userId: string): Promise<any>;
}

/**
 * Match statics (model methods)
 */
export interface IMatchModel extends Model<IMatch, Record<string, never>, IMatchMethods> {
  findActiveMatchesForUser(userId: string): ReturnType<Model<IMatch>['find']>;
  findByPets(pet1Id: string, pet2Id: string): ReturnType<Model<IMatch>['findOne']>;
}

/**
 * Fully typed Match document
 */
export type IMatchDocument = HydratedDocument<IMatch, IMatchMethods>;

