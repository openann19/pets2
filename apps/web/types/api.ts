/**
 * Web API Type Definitions
 * TypeScript definitions for web API interactions
 * Aligned with core package types and design tokens
 */

import React from 'react';
import type { User, Pet, Match, Message, PetFilters } from '@pawfectmatch/core';

// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: File;
  preferences?: User['preferences'];
}

export interface CreatePetRequest {
  name: string;
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  energy: 'low' | 'medium' | 'high';
  friendliness: 'shy' | 'friendly' | 'very_friendly';
  description?: string;
  photos?: File[];
}

export interface UpdatePetRequest extends Partial<CreatePetRequest> {
  id: string;
}

export interface SendMessageRequest {
  content: string;
  attachments?: File[];
}

export interface ReportContentRequest {
  type: 'user' | 'pet' | 'message';
  targetId: string;
  reason: string;
  description?: string;
}

export interface SubscriptionRequest {
  plan: 'basic' | 'premium' | 'gold';
  paymentMethodId: string;
}

// API Response Types (extending core types)
export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    tokenType: string;
  };
}

export interface PetsResponse {
  pets: Pet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    applied: PetFilters;
    available: {
      breeds: string[];
      sizes: string[];
      ages: { min: number; max: number };
      locations: string[];
    };
  };
}

export interface MatchesResponse {
  matches: Match[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface CompatibilityResponse {
  score: number;
  analysis: string;
  factors: {
    personality: number;
    lifestyle: number;
    activity: number;
    social: number;
    environment: number;
  };
  recommendations: string[];
}

export interface SubscriptionResponse {
  id: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  features: Record<string, boolean>;
}

export interface NotificationResponse {
  id: string;
  type: 'match' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface StatsResponse {
  totalUsers: number;
  totalPets: number;
  totalMatches: number;
  activeUsers: number;
  newRegistrations: number;
  matchRate: number;
  averageSessionTime: number;
}

// Web-specific API types
export interface UploadResponse {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
}

export interface GeolocationResponse {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
}

export interface SearchResponse {
  query: string;
  results: {
    pets: Pet[];
    users: User[];
  };
  suggestions: string[];
  totalResults: number;
}

// Error Response Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  timestamp: string;
}

export interface ValidationError extends ApiError {
  field: string;
  value: unknown;
  rule: string;
}

// WebSocket Event Types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'match' | 'notification';
  data: unknown;
  timestamp: string;
}

export interface TypingIndicator {
  userId: string;
  matchId: string;
  isTyping: boolean;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface PageViewEvent extends AnalyticsEvent {
  event: 'page_view';
  properties: {
    page: string;
    referrer?: string;
    duration?: number;
    scrollDepth?: number;
  };
}

// Form Validation Types
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

export interface InfiniteScrollState<T = unknown> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  nextCursor?: string;
  totalCount?: number;
}

// Export React for JSX compatibility
export { React };
