import { Response, NextFunction } from 'express';
import logger from '../utils/logger';
import type { AuthenticatedRequest, ApiResponse } from '../types';

// Import adminNotificationService - it's a CommonJS module
const adminNotificationService = require('../services/adminNotificationService');
const { sendAdminNotification } = adminNotificationService;

interface ErrorWithStatus {
  statusCode?: number;
  name?: string;
  type?: string;
  code?: string | number;
  message: string;
  stack?: string;
}

const errorHandler = (
  err: ErrorWithStatus, 
  req: AuthenticatedRequest, 
  res: Response, 
  _next: NextFunction
): void => {
  void _next;
  let error: ErrorWithStatus = { ...err };
  error.message = err.message;

  // Generate unique error ID for tracking
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced logging with context
  logger.error('Server Error Occurred', {
    errorId,
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req.user as any)?._id || (req.user as any)?.id,
    body: req.method === 'POST' ? req.body : undefined,
    query: req.query,
    params: req.params,
  });

  // Send admin notification for critical errors
  const shouldNotifyAdmin = (err.statusCode ?? 500) >= 500 || 
                           err.name === 'MongoNetworkError' || 
                           err.name === 'MongoTimeoutError' ||
                           err.type === 'StripeCardError' ||
                           err.message?.includes('AI service');

  if (shouldNotifyAdmin) {
    sendAdminNotification({
      type: 'error',
      severity: (err.statusCode ?? 500) >= 500 ? 'critical' : 'high',
      title: 'Server Error Alert',
      message: `Error ${errorId}: ${err.message}`,
      metadata: {
        errorId,
        method: req.method,
        url: req.url,
        userId: (req.user as any)?._id || (req.user as any)?.id,
        stack: err.stack,
      },
    }).catch((notificationError: any) => {
      logger.error('Failed to send admin notification', {
        originalError: err.message,
        notificationError: notificationError?.message,
      });
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { ...error, message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000 || err.code === '11000') {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    const message = `${field} already exists`;
    error = { ...error, message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = { ...error, message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { ...error, message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { ...error, message, statusCode: 401 };
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    const message = 'Payment failed';
    error = { ...error, message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.message?.includes('Too many requests')) {
    error = { ...error, message: 'Too many requests, please try again later', statusCode: 429 };
  }

  // File upload errors
  if (err.message?.includes('File too large')) {
    error = { ...error, message: 'File size exceeds limit', statusCode: 413 };
  }

  // AI service errors
  if (err.message?.includes('AI service')) {
    error = { ...error, message: 'AI service temporarily unavailable', statusCode: 503 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = { ...error, message: 'Database connection failed', statusCode: 503 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? 'Internal Server Error';

  // Don't expose internal errors in production
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const response: ApiResponse = {
    success: false,
    message: isDevelopment ? message : 'Something went wrong',
    error: isDevelopment ? JSON.stringify({
      errorId,
      message,
      stack: err.stack,
      details: {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
      }
    }) : errorId
  };

  res.status(statusCode).json(response);
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
export class CustomAppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
} as const;

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes];

export default errorHandler;
