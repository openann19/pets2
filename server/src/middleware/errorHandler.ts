import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { sendAdminNotification } from '../services/adminNotificationService';

/**
 * Custom error type with status code
 */
interface AppError {
  name?: string;
  message: string;
  statusCode?: number;
  code?: number | string;
  status?: number;
  retryAfter?: number;
  keyValue?: Record<string, unknown>;
  type?: string;
  details?: string[];
  stack?: string;
  errors?: unknown;
}

/**
 * Error response type
 */
interface ErrorResponse {
  success: false;
  message: string;
  errorId: string;
  timestamp: string;
  details?: string[];
  retryAfter?: number;
  stack?: string;
  originalError?: string;
  errorType?: string;
}

/**
 * Enhanced error handler with extensive logging and admin notifications
 */
export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  let error: AppError = { ...err };
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
    userId: (req as Request & { user?: { id: string } }).user?.id,
    body: req.method === 'POST' ? req.body : undefined,
    query: req.query,
    params: req.params,
  });

  // Send admin notification for critical errors
  const shouldNotifyAdmin = (err.statusCode && err.statusCode >= 500) || 
                           err.name === 'MongoNetworkError' || 
                           err.name === 'MongoTimeoutError' ||
                           err.type === 'StripeCardError' ||
                           err.message?.includes('AI service');

  if (shouldNotifyAdmin) {
    sendAdminNotification({
      type: 'error',
      severity: (err.statusCode && err.statusCode >= 500) ? 'critical' : 'high',
      title: 'Server Error Alert',
      message: `Error ${errorId}: ${err.message}`,
      metadata: {
        errorId,
        method: req.method,
        url: req.url,
        userId: (req as Request & { user?: { id: string } }).user?.id,
        stack: err.stack,
      },
    }).catch((notificationError: Error) => {
      logger.error('Failed to send admin notification', {
        originalError: err.message,
        notificationError: notificationError.message,
      });
    });
  }

  // Enhanced error type handling
  if (err.name === 'CastError') {
    const message = 'Invalid ID format provided';
    error = { message, statusCode: 400, name: 'CastError' };
  }

  if (err.code === 11000) {
    let message = 'Duplicate entry detected';
    
    const keyValue = err.keyValue || {};
    const field = Object.keys(keyValue)[0];
    const fieldMessages: Record<string, string> = {
      email: 'An account with this email already exists',
      username: 'This username is already taken',
      phone: 'This phone number is already registered',
    };
    
    message = field ? fieldMessages[field] || message : message;
    error = { message, statusCode: 409, name: 'DuplicateError' }; // Conflict
  }

  if (err.name === 'ValidationError') {
    const details = err.message ? [err.message] : [];
    error = { 
      message: 'Validation failed', 
      statusCode: 422,
      details,
      name: 'ValidationError',
    };
  }

  // Enhanced JWT error handling
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Authentication token is invalid', statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'Authentication token has expired', statusCode: 401 };
  }

  // Enhanced file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { 
      message: `File size exceeds the maximum limit of ${process.env.MAX_FILE_SIZE || '5MB'}`, 
      statusCode: 413 
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = { 
      message: 'Too many files uploaded. Maximum allowed is 10', 
      statusCode: 413 
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests. Please slow down and try again later',
      statusCode: 429,
      retryAfter: err.retryAfter || 60,
    };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = {
      message: 'Database temporarily unavailable. Please try again shortly',
      statusCode: 503,
    };
  }

  // AI Service errors
  if (err.message?.includes('AI service')) {
    error = {
      message: 'AI service is temporarily unavailable. Please try again later',
      statusCode: 503,
    };
  }

  // Payment processing errors
  if (err.type === 'StripeCardError') {
    error = {
      message: 'Payment failed. Please check your card details',
      statusCode: 402,
    };
  }

  // Default to 500 for unhandled errors
  const statusCode = error.statusCode || 500;
  const message = error.message || 'An unexpected error occurred';

  // Enhanced response with more context
  const response: ErrorResponse = {
    success: false,
    message,
    errorId,
    timestamp: new Date().toISOString(),
    ...(error.details && { details: error.details }),
    ...(error.retryAfter && { retryAfter: error.retryAfter }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.message,
      errorType: err.name,
    }),
  };

  // Set appropriate headers
  if (statusCode === 429 && error.retryAfter) {
    res.set('Retry-After', error.retryAfter.toString());
  }

  // CORS headers for error responses
  const allowedOrigin = process.env.CLIENT_URL || process.env.FRONTEND_URL;
  if (allowedOrigin) {
    res.set('Access-Control-Allow-Origin', allowedOrigin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Credentials', 'true');

  res.status(statusCode).json(response);
};
