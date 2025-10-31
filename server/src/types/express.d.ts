import type { IUserDocument } from './mongoose.d';

/**
 * Extended Express Request types using declaration merging
 * This allows Request.user and Request.userId to be available globally
 * without conflicting with Mongoose Document types
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user ID (set by auth middleware)
       */
      userId?: string;
      
      /**
       * Authenticated user document (set by auth middleware)
       * Uses type assertion at assignment point to handle Mongoose Document types
       */
      user?: IUserDocument;
    }
  }
}

/**
 * Type alias for authenticated requests
 * Use Request directly - user and userId are available via declaration merging
 */
export type AuthRequest = Request;

/**
 * Extended Express Request with file uploads
 */
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Typed response with pagination
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: PaginationMeta;
}

