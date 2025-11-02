import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
import mongoose, { Document } from 'mongoose';

// User Types
export interface User {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  photos: string[];
  primaryPhoto?: string;
  preferences: {
    ageRange: [number, number];
    maxDistance: number;
    species: string[];
  };
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Pet Types
export interface Pet {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  breed: string;
  age: number;
  photos: string[];
  bio: string;
  owner: string; // User ID
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  personality: string[];
  activityLevel: 'low' | 'medium' | 'high';
  size: 'small' | 'medium' | 'large';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Match Types
export interface Match {
  _id: string;
  users: [string, string]; // User IDs
  pets: [string, string]; // Pet IDs
  status: 'pending' | 'matched' | 'unmatched';
  compatibilityScore: number;
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: string;
  read: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

// AI Types
export interface AIAnalysis {
  breed: {
    primary: string;
    confidence: number;
  };
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    indicators: {
      coat: string;
      eyes: string;
      posture: string;
      energy: string;
    };
  };
  quality: {
    score: number;
    factors: {
      lighting: number;
      clarity: number;
      composition: number;
      expression: number;
    };
  };
  characteristics: {
    age: string;
    size: string;
    temperament: string[];
    features: string[];
  };
  suggestions: string[];
  tags: string[];
}

// Premium Types
export interface Subscription {
  _id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

// Support Types
export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  category: 'account' | 'matching' | 'premium' | 'technical' | 'safety' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface BugReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  deviceInfo?: string;
  appVersion?: string;
  status: 'new' | 'investigating' | 'fixed' | 'wontfix';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface AuthenticatedRequest extends Request {
  userId: string;
  user?: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Socket Types
export interface SocketData {
  userId: string;
  roomId?: string;
}

export interface ChatMessage {
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: string;
}

export interface TypingData {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Middleware Types
export interface AuthMiddleware {
  authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}

// Controller Types
export interface Controller {
  [key: string]: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}

// Route Types
export interface RouteHandler {
  (req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> | void;
}

// Database Types
export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CLIENT_URL: string;
  AI_SERVICE_URL: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// Swagger Types
export interface SwaggerConfig {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
    };
    servers: Array<{
      url: string;
      description: string;
    }>;
    components: {
      securitySchemes: {
        bearerAuth: {
          type: string;
          scheme: string;
          bearerFormat: string;
        };
      };
    };
  };
  apis: string[];
}

// Mongoose Document Types
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  avatar?: string;
  bio?: string;
  phone?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country: string;
    };
  };
  preferences: {
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
  premium: {
    isActive: boolean;
    plan: 'basic' | 'premium' | 'ultimate';
    expiresAt?: Date;
    stripeSubscriptionId?: string;
    cancelAtPeriodEnd: boolean;
    paymentStatus: 'active' | 'past_due' | 'failed';
    features: {
      unlimitedLikes: boolean;
      boostProfile: boolean;
      seeWhoLiked: boolean;
      advancedFilters: boolean;
      aiMatching: boolean;
    };
  };
  analytics?: {
    lastActive?: Date;
    totalPetsCreated?: number;
    totalLikes?: number;
    totalMatches?: number;
    totalMessagesSent?: number;
    totalSubscriptionsStarted?: number;
    totalSubscriptionsCancelled?: number;
    totalPremiumFeaturesUsed?: number;
    events?: Array<{
      type: string;
      timestamp: Date;
      metadata: any;
    }>;
  };
  isActive: boolean;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  biometricCredentials?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface IPet extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  weight?: number;
  color: {
    primary?: string;
    secondary?: string;
    pattern?: 'solid' | 'spotted' | 'striped' | 'mixed' | 'other';
  };
  photos: Array<{
    url: string;
    publicId?: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  videos?: Array<{
    url: string;
    publicId?: string;
    caption?: string;
  }>;
  description?: string;
  personalityTags: string[];
  intent: 'adoption' | 'mating' | 'playdate' | 'other';
  availability: {
    isAvailable: boolean;
    schedule?: any;
    restrictions?: string[];
  };
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    medicalHistory?: string[];
    allergies?: string[];
    medications?: string[];
  };
  specialNeeds?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMatch extends Document {
  _id: mongoose.Types.ObjectId;
  users: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  pets: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  status: 'pending' | 'matched' | 'unmatched' | 'blocked';
  compatibilityScore: number;
  matchedAt?: Date;
  unmatchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyticsEvent extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  eventType: string;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  durationMs?: number;
  success: boolean;
  errorCode?: string;
  metadata: any;
  createdAt: Date;
}

export interface IAdminActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetType?: string;
  targetId?: mongoose.Types.ObjectId;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export interface IAdminApiKey extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface IBiometricCredential extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'fingerprint' | 'face' | 'voice';
  credentialId: string;
  publicKey: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConfiguration extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: any;
  description?: string;
  isEncrypted: boolean;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentModeration extends Document {
  _id: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  contentType: 'photo' | 'message' | 'profile' | 'story';
  userId?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  aiAnalysis?: any;
  humanReview?: {
    reviewerId: mongoose.Types.ObjectId;
    decision: 'approve' | 'reject';
    reason?: string;
    reviewedAt: Date;
  };
  flags: string[];
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  matchId: mongoose.Types.ObjectId;
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  organizer: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IFavorite extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILeaderboardScore extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  category: string;
  score: number;
  rank: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  createdAt: Date;
  updatedAt: Date;
}

export interface IModerationSettings extends Document {
  _id: mongoose.Types.ObjectId;
  autoModerationEnabled: boolean;
  aiConfidenceThreshold: number;
  humanReviewRequired: boolean;
  blockedKeywords: string[];
  allowedDomains: string[];
  maxReportThreshold: number;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'match' | 'message' | 'like' | 'system' | 'premium';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface INotificationPreference extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: boolean;
  push: boolean;
  sms: boolean;
  types: {
    matches: boolean;
    messages: boolean;
    likes: boolean;
    system: boolean;
    premium: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reportedUserId?: mongoose.Types.ObjectId;
  reportedPetId?: mongoose.Types.ObjectId;
  reportedMessageId?: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  petId?: mongoose.Types.ObjectId;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    publicId?: string;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  tags: string[];
  isPublic: boolean;
  expiresAt: Date;
  likes: mongoose.Types.ObjectId[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpload extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  publicId?: string;
  metadata?: any;
  createdAt: Date;
}

export interface IUserAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface IUserBlock extends Document {
  _id: mongoose.Types.ObjectId;
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  reason?: string;
  createdAt: Date;
}

export interface IUserMute extends Document {
  _id: mongoose.Types.ObjectId;
  muterId: mongoose.Types.ObjectId;
  mutedId: mongoose.Types.ObjectId;
  reason?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface IVerification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'email' | 'phone' | 'identity' | 'address';
  status: 'pending' | 'verified' | 'rejected';
  verificationCode?: string;
  verificationData?: any;
  expiresAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Service Types
export interface AnalyticsService {
  trackUserEvent(userId: string, eventType: string, metadata?: Record<string, unknown>): Promise<{ success: boolean; userId: string; eventType: string; timestamp: Date } | null>;
  trackPetEvent(petId: string, eventType: string, metadata?: Record<string, unknown>): Promise<{ success: boolean; petId: string; eventType: string; timestamp: Date } | null>;
  trackMatchEvent(matchId: string, eventType: string, metadata?: Record<string, unknown>): Promise<{ success: boolean; matchId: string; eventType: string; timestamp: Date } | null>;
  getUserAnalytics(userId: string, period?: string): Promise<{ success: boolean; userId: string; period: string; metrics: Record<string, unknown>; userAnalytics?: Record<string, unknown> }>;
  getPetAnalytics(petId: string, period?: string): Promise<{ success: boolean; petId: string; period: string; metrics: Record<string, unknown>; pet?: { name: string; species: string; breed: string; photos: number } }>;
  getMatchAnalytics(matchId: string, period?: string): Promise<{ success: boolean; matchId: string; period: string; metrics: Record<string, unknown>; match?: { status: string; compatibilityScore: number; createdAt: Date } }>;
}

export interface AIService {
  analyzePetPhoto(imageUrl: string): Promise<AIAnalysis>;
  generatePetBio(petData: { id: string; name: string; species: string; breed: string; age: number; size: string; personality_tags: string[]; photos?: string[] }): Promise<string>;
  getCompatibilityScore(pet1: { id: string; name: string; species: string; breed: string; age: number; size: string; personality_tags: string[]; photos?: string[] }, pet2: { id: string; name: string; species: string; breed: string; age: number; size: string; personality_tags: string[]; photos?: string[] }): Promise<number>;
  moderateContent(content: string, type: string): Promise<{ isApproved: boolean; confidence: number; flags: string[]; reason?: string }>;
}

export interface CloudinaryService {
  uploadToCloudinary(buffer: Buffer, folder: string): Promise<{ public_id: string; version: number; signature: string; width: number; height: number; format: string; resource_type: string; created_at: string; tags: string[]; bytes: number; type: string; etag: string; placeholder: boolean; url: string; secure_url: string; access_mode: string; original_filename: string }>;
  deleteFromCloudinary(publicId: string): Promise<{ result: string; public_id: string }>;
  generateUploadSignature(folder: string): Promise<{ signature: string; timestamp: number; cloud_name: string; api_key: string; folder?: string }>;
}

export interface EmailService {
  sendWelcomeEmail(userEmail: string, userName: string): Promise<void>;
  sendVerificationEmail(userEmail: string, verificationCode: string): Promise<void>;
  sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<void>;
  sendMatchNotificationEmail(userEmail: string, matchData: any): Promise<void>;
}

// Stripe Types
export interface StripeCustomerData {
  email: string;
  firstName: string;
  lastName: string;
  _id: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  metadata: {
    userId: string;
    platform: string;
  };
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number | null;
      };
    }>;
  };
  created: number;
  current_period_end?: number;
  current_period_start?: number;
}

export interface StripeInvoice {
  id: string | undefined;
  customer: string;
  subscription?: string;
  amount_paid: number;
  amount_due: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  created: number;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeSubscription | StripeInvoice;
  };
  created: number;
}

export interface StripeCheckoutSession {
  id: string;
  url: string | null;
  customer: string;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
}

export interface StripeBalance {
  available: Array<{
    amount: number;
    currency: string;
  }>;
  pending: Array<{
    amount: number;
    currency: string;
  }>;
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  created: number;
}

export interface StripeChargesList {
  data: StripeCharge[];
  has_more: boolean;
}

export interface StripeService {
  createCustomer(userData: StripeCustomerData): Promise<StripeCustomer>;
  createSubscription(customerId: string, planId: string): Promise<StripeSubscription>;
  cancelSubscription(subscriptionId: string): Promise<StripeSubscription>;
  updateSubscription(subscriptionId: string, planId: string): Promise<StripeSubscription>;
  handleWebhook(payload: Buffer | string, signature: string): Promise<StripeWebhookEvent>;
}

export interface ChatService {
  sendMessage(matchId: string, senderId: string, content: string, type: string): Promise<any>;
  getMessages(matchId: string, page?: number, limit?: number): Promise<any>;
  markAsRead(matchId: string, userId: string): Promise<void>;
  getConversations(userId: string): Promise<any>;
}

// Controller Types
export interface PetController {
  createPet(req: AuthenticatedRequest, res: Response): Promise<void>;
  getPets(req: AuthenticatedRequest, res: Response): Promise<void>;
  getPetById(req: AuthenticatedRequest, res: Response): Promise<void>;
  updatePet(req: AuthenticatedRequest, res: Response): Promise<void>;
  deletePet(req: AuthenticatedRequest, res: Response): Promise<void>;
  uploadPhotos(req: AuthenticatedRequest, res: Response): Promise<void>;
  deletePhoto(req: AuthenticatedRequest, res: Response): Promise<void>;
}

export interface MatchController {
  getMatches(req: AuthenticatedRequest, res: Response): Promise<void>;
  createMatch(req: AuthenticatedRequest, res: Response): Promise<void>;
  unmatch(req: AuthenticatedRequest, res: Response): Promise<void>;
  getMatchById(req: AuthenticatedRequest, res: Response): Promise<void>;
}

export interface AdminController {
  getUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
  getUserById(req: AuthenticatedRequest, res: Response): Promise<void>;
  updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
  deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
  getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
  getModerationQueue(req: AuthenticatedRequest, res: Response): Promise<void>;
  moderateContent(req: AuthenticatedRequest, res: Response): Promise<void>;
}

export interface PremiumController {
  getPlans(req: AuthenticatedRequest, res: Response): Promise<void>;
  subscribe(req: AuthenticatedRequest, res: Response): Promise<void>;
  cancelSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
  updateSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
  getSubscriptionStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
}

// Route Types
export interface AdminRoutes {
  '/analytics': RouteHandler;
  '/analytics/export': RouteHandler;
  '/api-management/stats': RouteHandler;
  '/api-management/endpoints': RouteHandler;
  '/kyc-management/stats': RouteHandler;
  '/kyc-management/verifications': RouteHandler;
  '/audit-logs': RouteHandler;
  '/stripe/config': RouteHandler;
  '/users': RouteHandler;
  '/users/:id': RouteHandler;
  '/moderation/queue': RouteHandler;
  '/moderation/content/:id': RouteHandler;
}

export interface AnalyticsRoutes {
  '/user': RouteHandler;
  '/pet': RouteHandler;
  '/match': RouteHandler;
  '/events': RouteHandler;
  '/performance': RouteHandler;
  '/users/:userId': RouteHandler;
  '/pet/:petId': RouteHandler;
  '/match/:matchId': RouteHandler;
  '/matches/:userId': RouteHandler;
}

// Export all types
export type {
  Request,
  Response,
  NextFunction,
  Socket,
  Document,
};
