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
  readReceipts: boolean;
  videoCalls: boolean;
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
  rewindsUsed: number;
  iapSuperLikes?: number; // In-app purchase super likes
  iapBoosts?: number; // In-app purchase boosts
}

/**
 * Premium subscription information
 */
export interface IUserPremium {
  isActive: boolean;
  plan: 'basic' | 'premium' | 'ultimate' | 'free';
  expiresAt: Date | null;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd: boolean;
  paymentStatus: 'active' | 'past_due' | 'failed';
  features: IUserPremiumFeatures;
  usage: IUserPremiumUsage;
  retryCount?: number; // For payment retry tracking
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
 * Note: Does not extend Document - HydratedDocument<IUser, IUserMethods> already includes Document properties
 */
export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  avatar: string | null;
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
  privacySettings: {
    profileVisibility: 'public' | 'matches' | 'premium';
    showLocation: boolean;
    showActivityStatus: boolean;
    allowMessages: 'everyone' | 'matches' | 'none';
  };
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
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties (computed at runtime)
  age: number;
  fullName: string;
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
 * Note: Does not extend Document - HydratedDocument<IPet, IPetMethods> already includes Document properties
 */
export interface IPet {
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
  updateAnalytics(action: 'view' | 'like' | 'match' | 'message'): Promise<void>;
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
 * Note: Does not extend Document - HydratedDocument<IMatch, IMatchMethods> already includes Document properties
 */
export interface IMatch {
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
  addMessage(senderId: string, content: string, messageType?: string, attachments?: IMatchMessageAttachment[]): Promise<IMatchDocument>;
  markMessagesAsRead(userId: string): Promise<IMatchDocument>;
  isUserBlocked(userId: string): boolean;
  toggleArchive(userId: string): Promise<IMatchDocument>;
  toggleFavorite(userId: string): Promise<IMatchDocument>;
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

/**
 * Conversation message read receipt
 */
export interface IConversationMessageRead {
  user: string;
  readAt: Date;
}

/**
 * Conversation message reaction
 */
export interface IConversationMessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

/**
 * Conversation message
 */
export interface IConversationMessage {
  _id?: string;
  sender: string;
  content: string;
  messageType: 'text' | 'location' | 'image' | 'system';
  attachments: string[];
  reactions: IConversationMessageReaction[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  sentAt: Date;
  readBy: IConversationMessageRead[];
}

/**
 * Conversation user actions
 */
export interface IConversationUserActions {
  blockedBy: string[];
  favoritedBy: string[];
  archivedBy: string[];
}

/**
 * Conversation document interface
 * Note: Does not extend Document - HydratedDocument<IConversation, IConversationMethods> already includes Document properties
 */
export interface IConversation {
  participants: string[];
  lastMessageAt: Date;
  messages: IConversationMessage[];
  isArchivedBy: string[];
  isUserBlocked: string[];
  userActions: IConversationUserActions;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation methods (instance methods)
 */
export interface IConversationMethods {
  addMessage(senderId: string, content: string, attachments?: string[]): Promise<IConversationDocument>;
  markMessagesAsRead(userId: string): Promise<boolean>;
  toggleArchive(userId: string): Promise<void>;
  toggleFavorite(userId: string): Promise<void>;
}

/**
 * Conversation statics (model methods)
 */
export interface IConversationModel extends Model<IConversation, Record<string, never>, IConversationMethods> {
  findOrCreateOneToOne(userA: string, userB: string): Promise<IConversationDocument>;
  getMessagesPage(conversationId: string, options: { before?: string; limit?: number }): Promise<{ messages: IConversationMessage[]; hasMore: boolean; nextCursor?: string }>;
}

/**
 * Fully typed Conversation document
 */
export type IConversationDocument = HydratedDocument<IConversation, IConversationMethods>;

/**
 * Story view
 */
export interface IStoryView {
  userId: string;
  viewedAt: Date;
}

/**
 * Story reply
 */
export interface IStoryReply {
  _id?: string;
  userId: string;
  message: string;
  createdAt: Date;
}

/**
 * Story document interface
 * Note: Does not extend Document - HydratedDocument<IStory, IStoryMethods> already includes Document properties
 */
export interface IStory {
  userId: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  duration: number;
  views: IStoryView[];
  viewCount: number;
  replies: IStoryReply[];
  replyCount: number;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
}

/**
 * Story methods (instance methods)
 */
export interface IStoryMethods {
  addView(userId: string): boolean;
  addReply(userId: string, message: string): void;
  isExpired(): boolean;
  hasUserViewed(userId: string): boolean;
}

/**
 * Story statics (model methods)
 */
export interface IStoryModel extends Model<IStory, Record<string, never>, IStoryMethods> {
  getActiveFeedStories(userId: string, followingIds?: string[], options?: Record<string, unknown>): Promise<IStoryDocument[]>;
  getUserActiveStories(userId: string, options?: Record<string, unknown>): Promise<IStoryDocument[]>;
  getStoriesGroupedByUser(userId: string, followingIds?: string[], options?: Record<string, unknown>): Promise<Array<{ _id: string; stories: IStoryDocument[] }>>;
  deleteExpiredStories(): Promise<number>;
}

/**
 * Fully typed Story document
 */
export type IStoryDocument = HydratedDocument<IStory, IStoryMethods>;

/**
 * Notification document interface
 * Note: Does not extend Document - HydratedDocument<INotification, INotificationMethods> already includes Document properties
 */
export interface INotification {
  userId: string;
  type: 'match' | 'message' | 'like' | 'super_like' | 'reminder' | 'system' | 'test';
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification methods (instance methods)
 */
export interface INotificationMethods {
  markAsRead(): Promise<INotificationDocument>;
}

/**
 * Notification statics (model methods)
 */
export interface INotificationModel extends Model<INotification, Record<string, never>, INotificationMethods> {
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<{ acknowledged: boolean; modifiedCount: number }>;
}

/**
 * Fully typed Notification document
 */
export type INotificationDocument = HydratedDocument<INotification, INotificationMethods>;

/**
 * Favorite document interface
 * Note: Does not extend Document - HydratedDocument<IFavorite, IFavoriteMethods> already includes Document properties
 */
export interface IFavorite {
  userId: string;
  petId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Favorite methods (instance methods)
 */
export interface IFavoriteMethods {}

/**
 * Favorite statics (model methods)
 */
export interface IFavoriteModel extends Model<IFavorite, Record<string, never>, IFavoriteMethods> {
  getUserFavorites(userId: string, pageOrOptions?: Record<string, unknown> | number, perPage?: number): Promise<IFavoriteDocument[]>;
  isFavorited(userId: string, petId: string): Promise<boolean>;
  getPetFavoriteCount(petId: string): Promise<number>;
  getUserFavoriteCount(userId: string): Promise<number>;
}

/**
 * Fully typed Favorite document
 */
export type IFavoriteDocument = HydratedDocument<IFavorite, IFavoriteMethods>;
