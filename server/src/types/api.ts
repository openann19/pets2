/**
 * API-specific TypeScript interfaces
 */

import { Request, Response, NextFunction } from 'express';
import { User, Pet, Match } from './index';

// API error response
export interface ApiError {
  success: false;
  error: string;
  status: number;
  code?: string;
  details?: any;
}

// API success response
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Combined API response type
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Paginated API response
export interface PaginatedApiResponse<T = any> extends ApiSuccess<T[]> {
  pagination: PaginationMeta;
}

// Filter parameters
export interface FilterParams {
  [key: string]: any;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Query parameters
export interface QueryParams extends PaginationParams, FilterParams {}

// User creation request
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
}

// User update request
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  preferences?: {
    ageRange?: [number, number];
    maxDistance?: number;
    species?: string[];
  };
}

// Pet creation request
export interface CreatePetRequest {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  breed: string;
  age: number;
  bio?: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  personality?: string[];
  activityLevel?: 'low' | 'medium' | 'high';
  size?: 'small' | 'medium' | 'large';
}

// Pet update request
export interface UpdatePetRequest {
  name?: string;
  breed?: string;
  age?: number;
  bio?: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  personality?: string[];
  activityLevel?: 'low' | 'medium' | 'high';
  size?: 'small' | 'medium' | 'large';
  isActive?: boolean;
}

// Match creation request
export interface CreateMatchRequest {
  petId: string;
  targetPetId: string;
}

// Authentication request
export interface LoginRequest {
  email: string;
  password: string;
}

// Authentication response
export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: number;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password update request
export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

// Email verification request
export interface EmailVerificationRequest {
  code: string;
}

// Phone verification request
export interface PhoneVerificationRequest {
  code: string;
  phone: string;
}

// Subscription creation request
export interface SubscriptionRequest {
  plan: 'basic' | 'premium' | 'pro';
  paymentMethodId?: string;
}

// Webhook payload
export interface WebhookPayload {
  type: string;
  data: any;
}

// File upload response
export interface FileUploadResponse {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

// Search request
export interface SearchRequest {
  query?: string;
  filters?: {
    species?: string[];
    ageRange?: [number, number];
    distance?: number;
    activityLevel?: 'low' | 'medium' | 'high';
    size?: 'small' | 'medium' | 'large';
  };
  location?: {
    coordinates: [number, number];
  };
  pagination?: PaginationParams;
}

// Search response
export interface SearchResponse {
  results: Pet[];
  pagination: PaginationMeta;
  filters: {
    species: { [key: string]: number };
    activityLevel: { [key: string]: number };
    size: { [key: string]: number };
  };
}

// Notification settings
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  matches: boolean;
  messages: boolean;
  likes: boolean;
  system: boolean;
}

// User preferences
export interface UserPreferences {
  ageRange: [number, number];
  maxDistance: number;
  species: string[];
  notifications: NotificationSettings;
}

// User profile
export interface UserProfile extends User {
  pets: Pet[];
  matches: Match[];
  preferences: UserPreferences;
  premium: {
    isActive: boolean;
    plan?: string;
    expiresAt?: string;
    features: string[];
  };
}

// Error handler
export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;
