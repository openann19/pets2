/**
 * Service-specific TypeScript interfaces
 */

import { Document } from 'mongoose';
import { User, Pet, Match, ApiResponse } from './index';

// Email service
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: (data: any) => string;
}

export interface EmailService {
  sendEmail(options: EmailOptions): Promise<boolean>;
  sendWelcomeEmail(email: string, name: string): Promise<boolean>;
  sendVerificationEmail(email: string, code: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
  sendMatchNotificationEmail(email: string, matchData: any): Promise<boolean>;
}

// Analytics service
export interface AnalyticsEvent {
  userId?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AnalyticsService {
  trackEvent(event: AnalyticsEvent): Promise<boolean>;
  getUserAnalytics(userId: string, period?: string): Promise<any>;
  getPetAnalytics(petId: string, period?: string): Promise<any>;
  getMatchAnalytics(matchId: string, period?: string): Promise<any>;
  getSystemAnalytics(period?: string): Promise<any>;
  exportAnalytics(startDate: Date, endDate: Date, format?: 'csv' | 'json'): Promise<Buffer>;
}

// AI service
export interface AIServiceOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIAnalysisRequest {
  imageUrl?: string;
  imageBuffer?: Buffer;
  text?: string;
  petData?: {
    species?: string;
    breed?: string;
    age?: number;
    personality?: string[];
  };
}

export interface AIAnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AIService {
  analyzeImage(imageUrl: string): Promise<AIAnalysisResponse>;
  generateBio(petData: any): Promise<string>;
  moderateContent(content: string, type: string): Promise<{
    isApproved: boolean;
    confidence: number;
    flags: string[];
  }>;
  getCompatibilityScore(pet1: any, pet2: any): Promise<number>;
}

// Chat service
export interface ChatMessage {
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: Date;
  read: boolean;
}

export interface ChatService {
  sendMessage(matchId: string, senderId: string, content: string, type?: string): Promise<ChatMessage>;
  getMessages(matchId: string, page?: number, limit?: number): Promise<{
    messages: ChatMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>;
  markAsRead(matchId: string, userId: string): Promise<boolean>;
  getConversations(userId: string): Promise<any[]>;
}

// Socket service
export interface SocketEvent {
  type: string;
  payload: any;
  room?: string;
  userId?: string;
}

export interface SocketService {
  emitToUser(userId: string, event: string, data: any): boolean;
  emitToRoom(room: string, event: string, data: any): boolean;
  joinRoom(socketId: string, room: string): boolean;
  leaveRoom(socketId: string, room: string): boolean;
  getUserSockets(userId: string): string[];
  getRoomSockets(room: string): string[];
}

// Cloudinary service
export interface CloudinaryOptions {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: 'image' | 'video' | 'raw';
  tags?: string[];
  transformation?: any;
}

export interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  etag: string;
}

export interface CloudinaryService {
  uploadBuffer(buffer: Buffer, options?: CloudinaryUploadOptions): Promise<CloudinaryUploadResult>;
  uploadUrl(url: string, options?: CloudinaryUploadOptions): Promise<CloudinaryUploadResult>;
  delete(publicId: string): Promise<boolean>;
  generateSignature(options: any): Promise<{
    signature: string;
    timestamp: number;
    api_key: string;
  }>;
}

// Stripe service
export interface StripeOptions {
  apiKey: string;
  webhookSecret?: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata: {
    userId: string;
  };
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_end: number;
  current_period_start: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
        unit_amount: number;
      };
    }>;
  };
}

export interface StripeService {
  createCustomer(user: User): Promise<StripeCustomer>;
  createSubscription(customerId: string, priceId: string): Promise<StripeSubscription>;
  cancelSubscription(subscriptionId: string): Promise<StripeSubscription>;
  updateSubscription(subscriptionId: string, priceId: string): Promise<StripeSubscription>;
  createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<{
    id: string;
    url: string;
  }>;
  handleWebhook(payload: Buffer, signature: string): Promise<{
    type: string;
    data: any;
  }>;
}

// Notification service
export interface NotificationOptions {
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'message' | 'like' | 'system' | 'premium';
  data?: any;
}

export interface NotificationService {
  sendNotification(options: NotificationOptions): Promise<boolean>;
  getNotifications(userId: string, page?: number, limit?: number): Promise<any>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
  deleteNotification(notificationId: string): Promise<boolean>;
}

// Moderation service
export interface ModerationOptions {
  userId?: string;
  contentType: 'photo' | 'bio' | 'message' | 'comment';
  content: string | Buffer;
}

export interface ModerationResult {
  isApproved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
}

export interface ModerationService {
  moderateContent(options: ModerationOptions): Promise<ModerationResult>;
  getModerationQueue(page?: number, limit?: number): Promise<any>;
  approveContent(contentId: string, adminId: string): Promise<boolean>;
  rejectContent(contentId: string, adminId: string, reason?: string): Promise<boolean>;
}

// Logger service
export interface LogOptions {
  level?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface LoggerService {
  error(message: string, options?: LogOptions): void;
  warn(message: string, options?: LogOptions): void;
  info(message: string, options?: LogOptions): void;
  debug(message: string, options?: LogOptions): void;
  trace(message: string, options?: LogOptions): void;
}

// Cache service
export interface CacheOptions {
  ttl?: number;
  namespace?: string;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(namespace?: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
}

// Geolocation service
export interface GeolocationOptions {
  maxDistance?: number;
  limit?: number;
}

export interface GeolocationService {
  getNearbyUsers(coordinates: [number, number], options?: GeolocationOptions): Promise<User[]>;
  getNearbyPets(coordinates: [number, number], options?: GeolocationOptions): Promise<Pet[]>;
  getDistance(coordinates1: [number, number], coordinates2: [number, number]): number;
  geocodeAddress(address: string): Promise<{
    coordinates: [number, number];
    formattedAddress: string;
  }>;
}
