/**
 * Enhanced Structured Logger (2025 Standards)
 * Uses Winston for secure structured logging with compliance features
 */

import winston from 'winston';
import path from 'path';
import { createHash } from 'crypto';
import { createSentryTransport } from 'winston-transport-sentry-node';
import fs from 'fs';
import os from 'os';

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
    const sanitizedMeta = sanitizeLogData(metadata);
    
    let msg = `${timestamp} [${level}] ${message}`;
    if (sanitizedMeta && Object.keys(sanitizedMeta).length > 0) {
      msg += ` ${JSON.stringify(sanitizedMeta)}`;
    }
    return msg;
  })
);

// Sanitize sensitive data
function sanitizeLogData(data: any): any {
  if (!data) return {};
  
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // List of fields to mask
  const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'apiKey',
    'authorization', 'cookie', 'jwt', 'key', 'auth', 'credentials', 'ccNumber'];
  
  // Recursively sanitize objects
  function sanitizeObj(obj: any): void {
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
    hostname: os.hostname()
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
    logger.add(createSentryTransport({
      sentry: {
        dsn: process.env.SENTRY_DSN,
      },
      level: 'error'
    }));
    
    logger.info('Sentry logging enabled');
  } catch (e: any) {
    logger.warn('Sentry transport configuration failed', { error: e.message });
  }
}

interface Request {
  method?: string;
  path?: string;
  url?: string;
  ip?: string;
  headers?: { [key: string]: any };
  id?: string;
  userId?: string;
  user?: { id?: string };
  query?: any;
  duration?: number;
}

interface Error {
  name?: string;
  message?: string;
  stack?: string;
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Extended logger with custom methods
interface ExtendedLogger extends winston.Logger {
  request: (req: Request, message: string, additionalMeta?: any) => string;
  apiError: (req: Request, error: Error, statusCode?: number, additionalMeta?: any) => string;
  security: (event: string, data?: any) => void;
  performance: (operation: string, durationMs: number, meta?: any) => void;
}

// Enhanced convenience methods with 2025 standardized fields
(logger as ExtendedLogger).request = (req: Request, message: string, additionalMeta: any = {}): string => {
  // Extract basic request data safely
  const meta = {
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

(logger as ExtendedLogger).apiError = (req: Request, error: Error, statusCode: number = 500, additionalMeta: any = {}): string => {
  const errorMeta = {
    method: req?.method,
    path: req?.path || req?.url,
    statusCode,
    errorName: error?.name || 'Error',
    errorMessage: error?.message || 'Unknown error',
    stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    requestId: req?.id || req?.headers?.['x-request-id'] || generateRequestId(),
    userId: req?.userId || req?.user?.id || 'unauthenticated',
    ...additionalMeta
  };

  logger.error('API Error', errorMeta);
  return errorMeta.requestId; // Return requestId for correlation
};

// Security event logging
(logger as ExtendedLogger).security = (event: string, data: any = {}): void => {
  logger.warn(`Security: ${event}`, {
    securityEvent: true,
    timestamp: new Date().toISOString(),
    event,
    ...sanitizeLogData(data)
  });
};

// Performance monitoring
(logger as ExtendedLogger).performance = (operation: string, durationMs: number, meta: any = {}): void => {
  logger.info(`Performance: ${operation}`, {
    performance: true,
    operation,
    durationMs,
    ...meta
  });
};

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

export default logger as ExtendedLogger;
