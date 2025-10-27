import { Request } from 'express';
import { IUserDocument } from './mongoose.d';

/**
 * Extended Express Request with authentication
 */
export interface AuthRequest extends Request {
  userId?: string;
  user?: IUserDocument;
}

/**
 * Extend Express Request to include userId
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

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

