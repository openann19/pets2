/**
 * Enhanced Structured Logger (2025 Standards)
 * Uses Winston for secure structured logging with compliance features
 */

import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { createHash } from 'crypto';

// Define secured log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Console format for development with sanitization
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    // Sanitize sensitive data
    const sanitizedMeta = sanitizeLogData(metadata as Record<string, any>);
    
    let msg = `${timestamp} [${level}] ${message}`;
    if (sanitizedMeta && Object.keys(sanitizedMeta).length > 0) {
      msg += ` ${JSON.stringify(sanitizedMeta)}`;
    }
    return msg;
  })
);

// Sanitize sensitive data
function sanitizeLogData(data: Record<string, any> | undefined): Record<string, any> {
  if (!data) return {};
  
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // List of fields to mask
  const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'apiKey',
    'authorization', 'cookie', 'jwt', 'key', 'auth', 'credentials', 'ccNumber'];
  
  // Recursively sanitize objects
  function sanitizeObj(obj: Record<string, unknown>): void {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Check if this is a sensitive field
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        if (typeof obj[key] === 'string') {
          // Create a hash of the value to maintain traceability while protecting the data
          const hash = createHash('sha256').update(obj[key]).digest('hex').substring(0, 8);
          obj[key] = `[REDACTED:${hash}]`;
        } else {
          obj[key] = '[REDACTED]';
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively sanitize nested objects
        sanitizeObj(obj[key]);
      }
    });
  }
  
  sanitizeObj(sanitized);
  return sanitized;
}

// Create enhanced logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'pawfectmatch-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    hostname: require('os').hostname()
  },
  transports: [
    // Write all logs to combined.log with rotation
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
      zippedArchive: true
    }),
    // Write errors to error.log with rotation
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
      zippedArchive: true
    }),
    // Write security-related logs separately
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'security.log'),
      level: 'warn',
      maxsize: 10485760, // 10MB
      maxFiles: 15,
      tailable: true,
      zippedArchive: true
    })
  ],
  // Enhanced exception and rejection handling
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      maxsize: 10485760,
      maxFiles: 7,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.json(),
        winston.format.errors({ stack: true })
      )
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      maxsize: 10485760,
      maxFiles: 7,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.json(),
        winston.format.errors({ stack: true })
      )
    })
  ],
  // Don't exit on handled exceptions
  exitOnError: false
});

// Add enhanced console transport
if (process.env.NODE_ENV !== 'production') {
  // Detailed development logging
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
} else {
  // Limited console output in production for critical issues
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'warn' // Only warnings and errors in production console
  }));
}

// Add Sentry transport in production if configured
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  // Note: Requires @sentry/node and winston-transport-sentry-node packages
  try {
    const { createSentryTransport } = require('winston-transport-sentry-node');
    
    logger.add(createSentryTransport({
      sentry: {
        dsn: process.env.SENTRY_DSN,
      },
      level: 'error'
    }));
    
    logger.info('Sentry logging enabled');
  } catch (e: unknown) {
    logger.warn('Sentry transport configuration failed', { error: e instanceof Error ? e.message : String(e) });
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Type definitions for Express Request
interface RequestMetadata {
  method?: string;
  path?: string;
  url?: string;
  ip?: string;
  headers?: Record<string, unknown>;
  id?: string;
  user?: { id: string };
  userId?: string;
  duration?: number;
  query?: Record<string, unknown>;
}

// Enhanced convenience methods with 2025 standardized fields
(logger as ExtendedLogger).request = (req: RequestMetadata, message: string, additionalMeta: Record<string, unknown> = {}) => {
  // Extract basic request data safely
  const meta: Record<string, unknown> = {
    method: req?.method,
    path: req?.path || req?.url,
    ip: req?.ip || req?.headers?.['x-forwarded-for'] || 'unknown',
    userAgent: req?.headers?.['user-agent'] || 'unknown',
    requestId: req?.id || req?.headers?.['x-request-id'] || generateRequestId(),
    userId: req?.userId || req?.user?.id || 'unauthenticated',
    duration: req?.duration,
    query: sanitizeLogData(req?.query),
    ...additionalMeta
  };
  
  logger.info(message, meta);
  return meta.requestId; // Return requestId for correlation
};

(logger as ExtendedLogger).apiError = (req: RequestMetadata, error: Error | unknown, statusCode: number = 500, additionalMeta: Record<string, unknown> = {}) => {
  const errorMeta: Record<string, unknown> = {
    method: req?.method,
    path: req?.path || req?.url,
    statusCode,
    errorName: error instanceof Error ? error.name : 'Error',
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined,
    requestId: req?.id || req?.headers?.['x-request-id'] || generateRequestId(),
    userId: req?.userId || req?.user?.id || 'unauthenticated',
    ...additionalMeta
  };

  logger.error('API Error', errorMeta);
  return errorMeta.requestId; // Return requestId for correlation
};

// Security event logging
(logger as ExtendedLogger).security = (event: string, data: Record<string, unknown> = {}) => {
  logger.warn(`Security: ${event}`, {
    securityEvent: true,
    timestamp: new Date().toISOString(),
    event,
    ...sanitizeLogData(data)
  });
};

// Performance monitoring
(logger as ExtendedLogger).performance = (operation: string, durationMs: number, meta: Record<string, unknown> = {}) => {
  logger.info(`Performance: ${operation}`, {
    performance: true,
    operation,
    durationMs,
    ...meta
  });
};

// Extended Logger interface
export interface ExtendedLogger extends winston.Logger {
  request: (req: RequestMetadata, message: string, additionalMeta?: Record<string, unknown>) => string;
  apiError: (req: RequestMetadata, error: Error | unknown, statusCode?: number, additionalMeta?: Record<string, unknown>) => string;
  security: (event: string, data?: Record<string, unknown>) => void;
  performance: (operation: string, durationMs: number, meta?: Record<string, unknown>) => void;
}

// Export logger with enhanced types
export default logger as ExtendedLogger;
