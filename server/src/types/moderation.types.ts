/**
 * Type definitions for moderation system
 * Eliminates 'any' types and provides strict type safety
 */

import { Document, Types } from 'mongoose';

/**
 * Moderation filter for querying flagged content
 */
export interface ModerationFilter {
  moderationStatus?: 'pending' | 'flagged' | 'reviewed' | 'approved' | 'rejected' | 'banned' | 'quarantined';
  reportCount?: { $gte: number };
  active?: boolean;
  contentType?: 'user' | 'pet' | 'post' | 'message';
}

/**
 * Date range filter for analytics queries
 */
export interface DateFilter {
  $gte?: Date;
  $lte?: Date;
}

/**
 * Update data for moderation actions
 */
export interface ModerationUpdateData {
  moderationStatus: string;
  moderatedAt: Date;
  moderatedBy: string;
  moderationNote?: string;
  moderationReason?: string;
  bannedBy?: string;
  bannedAt?: Date;
  banReason?: string;
  quarantinedAt?: Date;
  quarantineReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  flagData?: {
    cleared: boolean;
    clearedAt: Date;
    clearedBy: string;
  };
}

/**
 * Status counts for moderation analytics
 */
export interface StatusCounts {
  approved: number;
  flagged: number;
  rejected: number;
  banned: number;
}

/**
 * Flagged content item in review queue
 */
export interface FlaggedContentItem {
  contentId: string;
  contentType: 'user' | 'pet' | 'post' | 'message';
  reportCount: number;
  flaggedAt: Date;
  reasons: string[];
  content: {
    title?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    breed?: string;
    messageText?: string;
    postContent?: string;
  };
  moderationStatus: string;
}

/**
 * Quarantined content item
 */
export interface QuarantinedContentItem {
  contentId: string;
  contentType: 'post' | 'message';
  quarantinedAt: Date;
  quarantineReason: string;
  flagCount: number;
  author?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  sender?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  recipient?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  content: string;
}

/**
 * Moderation statistics by content type
 */
export interface ModerationStats {
  contentType: 'users' | 'pets' | 'posts' | 'messages';
  total: number;
  approved: number;
  flagged: number;
  rejected: number;
  banned: number;
}

/**
 * Aggregation result from MongoDB
 */
export interface AggregationResult {
  _id: string | null;
  count: number;
}

/**
 * Content document with moderation fields
 * Generic type for User, Pet, Post, or Message documents
 */
export interface ModeratedContent extends Document {
  _id: Types.ObjectId;
  moderationStatus?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNote?: string;
  bannedBy?: string;
  bannedAt?: Date;
  banReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reportCount?: number;
  flagData?: {
    reporters?: string[];
    reasons?: string[];
    cleared?: boolean;
  };
  active?: boolean;
  // Allow additional properties from specific models
  [key: string]: unknown;
}

/**
 * Pet query filter
 */
export interface PetQueryFilter {
  active: boolean;
  owner: string;
  'location.coordinates'?: {
    $near: {
      $geometry: {
        type: string;
        coordinates: [number, number];
      };
      $maxDistance: number;
    };
  };
}

/**
 * Extended Express Request with authenticated user info
 * Use declaration merging to extend Express types globally
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: 'admin' | 'moderator' | 'user';
    }
  }
}

/**
 * Window interface extension for Sentry
 */
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: {
        tags?: Record<string, string>;
        contexts?: Record<string, unknown>;
        extra?: Record<string, unknown>;
      }) => void;
      captureMessage: (message: string, level?: string) => void;
    };
  }
}

export {};
