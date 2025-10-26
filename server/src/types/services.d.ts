import { IUserDocument } from './mongoose';

/**
 * Email service interface
 */
export interface IEmailService {
  sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean>;
  
  sendVerificationEmail(userId: string, email: string, token: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
  send2FACode(email: string, code: string, method: 'sms' | 'email'): Promise<boolean>;
  sendWelcomeEmail(email: string, name: string): Promise<boolean>;
  sendAccountDeletionEmail(email: string, gracePeriodEnds: Date): Promise<boolean>;
}

/**
 * Push notification service interface
 */
export interface IPushNotificationService {
  sendPush(token: string, notification: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<boolean>;
  
  sendBatchPush(tokens: string[], notification: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<{ success: number; failed: number }>;
  
  registerPushToken(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<void>;
  unregisterPushToken(userId: string, token: string): Promise<void>;
}

/**
 * Storage service interface (Cloudinary)
 */
export interface IStorageService {
  uploadImage(file: Buffer | string, folder?: string, transformation?: Record<string, unknown>): Promise<{
    url: string;
    publicId: string;
  }>;
  
  deleteImage(publicId: string): Promise<boolean>;
  uploadVideo(file: Buffer | string, folder?: string): Promise<{
    url: string;
    publicId: string;
  }>;
}

/**
 * Content moderation service interface
 */
export interface IContentModerationService {
  moderateImage(imageUrl: string): Promise<{
    approved: boolean;
    reason?: string;
    confidence?: number;
  }>;
  
  moderateText(text: string): Promise<{
    approved: boolean;
    reason?: string;
    categories?: string[];
  }>;
  
  moderateVideo(videoUrl: string): Promise<{
    approved: boolean;
    reason?: string;
    duration?: number;
  }>;
}

/**
 * Analytics service interface
 */
export interface IAnalyticsService {
  trackEvent(userId: string, event: string, metadata?: Record<string, unknown>): Promise<void>;
  getUserAnalytics(userId: string): Promise<Record<string, unknown>>;
  getPetAnalytics(petId: string): Promise<Record<string, unknown>>;
  getPlatformAnalytics(): Promise<Record<string, unknown>>;
}

/**
 * Matching service interface
 */
export interface IMatchingService {
  findMatches(petId: string, filters?: Record<string, unknown>): Promise<unknown[]>;
  calculateCompatibility(pet1: unknown, pet2: unknown): Promise<number>;
  getRecommendedPets(userId: string, limit?: number): Promise<unknown[]>;
}

/**
 * Encryption service interface
 */
export interface IEncryptionService {
  encrypt(text: string): string;
  decrypt(encryptedText: string): string;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}

/**
 * Logger service interface
 */
export interface ILoggerService {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Cache service interface (Redis)
 */
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, seconds: number): Promise<void>;
  flush(pattern?: string): Promise<void>;
}

/**
 * Webhook service interface
 */
export interface IWebhookService {
  handleStripeWebhook(event: unknown): Promise<void>;
  handleVerificationWebhook(event: unknown): Promise<void>;
}

/**
 * Moderator notification service interface
 */
export interface IModeratorNotificationService {
  notifyModerators(report: {
    type: string;
    userId: string;
    content?: string;
    severity: 'low' | 'medium' | 'high';
  }): Promise<void>;
  
  escalateToAdmins(report: unknown): Promise<void>;
}

/**
 * AI moderation service interface
 */
export interface IAIModerationService {
  analyzeContent(content: unknown): Promise<{
    toxicity: number;
    categories: string[];
    needsReview: boolean;
  }>;
  
  predictModeration(userId: string, content: unknown): Promise<{
    risk: number;
    recommendedActions: string[];
  }>;
}

/**
 * Biometric service interface
 */
export interface IBiometricService {
  generateBiometricToken(userId: string): Promise<string>;
  verifyBiometricToken(token: string, userId: string): Promise<boolean>;
  revokeBiometricToken(userId: string): Promise<void>;
}

/**
 * QR code service interface
 */
export interface IQRCodeService {
  generateQRCode(data: string): Promise<Buffer>;
  generateVerificationQR(userId: string): Promise<Buffer>;
}

/**
 * Scheduler service interface
 */
export interface ISchedulerService {
  scheduleJob(name: string, cron: string, callback: () => void | Promise<void>): void;
  cancelJob(name: string): void;
  runNow(jobName: string): Promise<void>;
}
