/**
 * Admin-specific TypeScript interfaces
 */

import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import { User, AuthenticatedRequest } from './index';

// Admin-authenticated request
export interface AdminAuthenticatedRequest extends AuthenticatedRequest {
  isAdmin: boolean;
  adminLevel?: 'basic' | 'moderator' | 'full' | 'super';
  adminPermissions?: string[];
}

// Admin user interface
export interface AdminUser extends User {
  adminLevel: 'basic' | 'moderator' | 'full' | 'super';
  permissions: string[];
  lastAdminAction?: Date;
  adminNotes?: string;
}

// Admin API key request
export interface AdminApiKeyRequest extends Request {
  apiKey?: string;
  apiKeyData?: {
    name: string;
    permissions: string[];
  };
}

// Admin middleware
export interface AdminMiddleware {
  requireAdmin: (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  requireSuperAdmin: (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  requireApiKey: (req: AdminApiKeyRequest, res: Response, next: NextFunction) => Promise<void>;
  validatePermissions: (permissions: string[]) => (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}

// Admin dashboard stats
export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    premium: number;
    newToday: number;
    growth: number;
  };
  pets: {
    total: number;
    bySpecies: Record<string, number>;
    newToday: number;
  };
  matches: {
    total: number;
    active: number;
    newToday: number;
    conversionRate: number;
  };
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    growth: number;
  };
  moderation: {
    pendingCount: number;
    approvalRate: number;
    flaggedContent: number;
  };
}

// Admin activity log entry
export interface AdminActivityLogEntry {
  adminId: string;
  action: string;
  target?: {
    type: string;
    id: string;
  };
  details: any;
  timestamp: Date;
  ip: string;
  success: boolean;
}

// Admin notification
export interface AdminNotification {
  id: string;
  type: 'alert' | 'warning' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Admin KYC verification request
export interface KYCVerificationRequest {
  id: string;
  userId: string;
  documentType: 'passport' | 'drivers_license' | 'id_card';
  documentImages: string[];
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

// Admin moderation decision
export interface ModerationDecision {
  contentId: string;
  contentType: 'photo' | 'bio' | 'message' | 'comment';
  decision: 'approve' | 'reject';
  reason?: string;
  adminId: string;
  timestamp: Date;
}

// Admin API usage stats
export interface ApiUsageStats {
  endpoint: string;
  calls: number;
  errors: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  lastCalled: Date;
}
