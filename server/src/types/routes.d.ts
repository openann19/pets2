import { Request, Response } from 'express';
import { IUserDocument } from './mongoose.d';
import { AuthRequest } from './express';

/**
 * Standard Error type for route handlers
 */
export interface RouteError extends Error {
  statusCode?: number;
  errorCode?: string;
  details?: Record<string, unknown>;
}

/**
 * Type-safe wrapper for route handlers that properly types the request parameter
 */
export type RouteHandler<TRequest = AuthRequest> = (
  req: TRequest,
  res: Response
) => Promise<void>;

/**
 * Type-safe wrapper that preserves type information through Express middleware
 */
export function createTypeSafeWrapper<TRequest = AuthRequest>(
  handler: RouteHandler<TRequest>
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    await handler(req as TRequest, res);
  };
}

/**
 * Authenticated request with file upload support
 */
export interface AuthenticatedFileRequest extends AuthRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
}

/**
 * Authenticated request with query parameters
 */
export interface AuthenticatedQueryRequest extends AuthRequest {
  query: Record<string, unknown>;
}

/**
 * Chat request with match context
 */
export interface ChatRequest extends AuthRequest {
  params: {
    matchId: string;
    messageId?: string;
  };
  body: {
    content?: string;
    messageType?: 'text' | 'image' | 'location' | 'file';
    attachments?: Array<{
      type: string;
      url?: string;
      filename?: string;
    }>;
    reaction?: string;
    matchId?: string;
    messageId?: string;
  };
}

/**
 * Upload request with file upload support
 */
export interface UploadRequest extends AuthRequest {
  file?: Express.Multer.File;
  body: {
    key?: string;
    contentType?: string;
    filename?: string;
    fileType?: string;
    userId?: string;
    mimeType?: string;
    petId?: string;
  };
}

/**
 * Presigned URL request
 */
export interface PresignRequest extends AuthRequest {
  body: {
    contentType: string;
    filename?: string;
  };
}

/**
 * Voice note request
 */
export interface VoiceNoteRequest extends AuthRequest {
  params: {
    matchId: string;
  };
  body: {
    key: string;
    duration: number;
    waveform: number[];
  };
}

/**
 * Reaction request
 */
export interface ReactionRequest extends AuthRequest {
  body: {
    matchId: string;
    messageId: string;
    reaction: string;
  };
}

/**
 * Match request with match operations
 */
export interface MatchRequest extends AuthRequest {
  params: {
    matchId?: string;
  };
  body: {
    action?: 'like' | 'pass' | 'superlike';
    petId?: string;
    messageId?: string;
    status?: 'active' | 'archived' | 'blocked';
  };
}

/**
 * Pet request with pet operations
 */
export interface PetRequest extends AuthRequest {
  params: {
    id?: string;
    petId?: string;
    photoId?: string;
  };
  body: {
    name?: string;
    species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed?: string;
    age?: number;
    gender?: 'male' | 'female';
    size?: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
    description?: string;
    photos?: string[];
    primaryPhoto?: string;
    status?: 'active' | 'paused' | 'adopted' | 'unavailable';
  };
}

/**
 * Settings request with profile updates
 */
export interface SettingsRequest extends AuthRequest {
  body: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    dateOfBirth?: string;
    phone?: string;
    location?: {
      coordinates: [number, number];
      address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
    };
    preferences?: {
      maxDistance?: number;
      ageRange?: {
        min: number;
        max: number;
      };
      species?: string[];
      intents?: string[];
      notifications?: {
        email?: boolean;
        push?: boolean;
        matches?: boolean;
        messages?: boolean;
      };
    };
    [key: string]: unknown;
  };
}

/**
 * Admin request with admin operations
 */
export interface AdminRequest extends AuthRequest {
  query: {
    page?: string;
    limit?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    status?: string;
    role?: string;
  };
}

/**
 * Analytics request with query parameters
 */
export interface AnalyticsRequest extends AuthRequest {
  query: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    metrics?: string;
  };
}

/**
 * Map request with location data
 */
export interface MapRequest extends AuthRequest {
  query: {
    bounds?: string;
    zoom?: string;
    center?: string;
  };
  body: {
    coordinates?: [number, number];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
}

/**
 * AI compatibility request
 */
export interface AICompatRequest extends AuthRequest {
  body: {
    pet1Id: string;
    pet2Id: string;
    analysisType?: 'basic' | 'enhanced' | 'personality';
  };
}

/**
 * Live stream request
 */
export interface LiveStreamRequest extends AuthRequest {
  params: {
    streamId?: string;
  };
  query: {
    status?: 'active' | 'ended';
  };
  body: {
    title?: string;
    description?: string;
    pets?: string[];
    blockedUserIds?: string[];
  };
}

/**
 * Verification request
 */
export interface VerificationRequest extends Request {
  user?: IUserDocument & {
    [key: string]: unknown;
  };
  body: {
    verificationCode?: string;
    verificationMethod?: 'email' | 'sms';
    phone?: string;
  };
}

/**
 * Search request with query parameters
 */
export interface SearchRequest extends AuthRequest {
  query: {
    q?: string;
    species?: string;
    age?: string;
    location?: string;
    distance?: string;
    intent?: string;
    page?: string;
    limit?: string;
    sort?: 'newest' | 'distance' | 'relevance';
  };
}

/**
 * Filter request for discovery
 */
export interface FilterRequest extends AuthRequest {
  body: {
    filters?: Record<string, unknown>;
    species?: string[];
    ageRange?: {
      min: number;
      max: number;
    };
    gender?: string[];
    size?: string[];
    intent?: string[];
    maxDistance?: number;
  };
}

/**
 * Type guard for identifying RouteError
 */
export function isRouteError(error: unknown): error is RouteError {
  return error instanceof Error && 'statusCode' in error;
}

/**
 * Create a properly typed error
 */
export function createRouteError(
  message: string,
  statusCode = 500,
  errorCode?: string,
  details?: Record<string, unknown>
): RouteError {
  const error = new Error(message) as RouteError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  error.details = details;
  return error;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

/**
 * Type-safe error handler for route handlers
 */
export function handleRouteError(error: unknown, res: Response): void {
  const routeError = isRouteError(error) 
    ? error 
    : createRouteError(error instanceof Error ? error.message : 'Unknown error');

  res.status(routeError.statusCode || 500).json({
    success: false,
    error: routeError.errorCode || 'INTERNAL_ERROR',
    message: routeError.message,
    details: routeError.details,
    statusCode: routeError.statusCode
  });
}

