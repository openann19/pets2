/**
 * Sentry Error Monitoring Configuration
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
const logger = require('../utils/logger');

/**
 * Initialize Sentry error tracking
 */
function initSentry(app?: any): void {
  if (!process.env.SENTRY_DSN) {
    logger.warn('SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  if (process.env.NODE_ENV === 'test') {
    logger.info('Sentry disabled in test environment');
    return;
  }

  // Build integrations array safely
  const integrations: any[] = [];

  try {
    // Enable HTTP calls tracing
    if (Sentry.Integrations && Sentry.Integrations.Http) {
      integrations.push(new Sentry.Integrations.Http({ tracing: true }));
    }
    // Enable Express.js middleware tracing
    if (Sentry.Integrations && Sentry.Integrations.Express && app) {
      integrations.push(new Sentry.Integrations.Express({ app }));
    }
    // Enable profiling
    integrations.push(new ProfilingIntegration());
  } catch (error) {
    logger.warn('Some Sentry integrations unavailable:', { error: (error as Error).message });
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production to reduce volume
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Set profilesSampleRate to 1.0 to profile every transaction.
    // Adjust this value in production
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    integrations,

    // Capture console logs as breadcrumbs
    beforeBreadcrumb: (breadcrumb: any) => {
      // Filter out noisy breadcrumbs in production
      if (process.env.NODE_ENV === 'production') {
        if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
          return null;
        }
      }
      return breadcrumb;
    },

    // Customize error filtering
    beforeSend: (event: any) => {
      // Filter out certain types of errors in production
      if (process.env.NODE_ENV === 'production') {
        // Filter out client-side errors (handled by frontend Sentry)
        if (event.tags && event.tags.side === 'client') {
          return null;
        }

        // Filter out common non-critical errors
        if (event.exception) {
          const errorMessage = event.exception.values?.[0]?.value || '';
          if (errorMessage.includes('Client disconnected') ||
              errorMessage.includes('aborted')) {
            return null;
          }
        }
      }

      return event;
    },
  });

  // Set user context if available
  Sentry.setTag('service', 'pawfectmatch-api');
  Sentry.setTag('version', process.env.npm_package_version || '1.0.0');

  logger.info('Sentry error tracking initialized', {
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  });
}

/**
 * Set user context for error tracking
 */
function setUserContext(userId: string, email?: string, username?: string): void {
  Sentry.setUser({
    id: userId,
    email,
    username
  });
}

/**
 * Clear user context
 */
function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Capture an exception with additional context
 */
function captureException(error: Error, context?: Record<string, any>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message with level and context
 */
function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
      Sentry.captureMessage(message);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Add breadcrumb for debugging
 */
function addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel): void {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info'
  });
}

/**
 * Set extra context data
 */
function setExtra(key: string, value: any): void {
  Sentry.setExtra(key, value);
}

/**
 * Set a tag for filtering
 */
function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Flush pending events (useful before app shutdown)
 */
async function flush(timeout = 2000): Promise<boolean> {
  return await Sentry.flush(timeout);
}

/**
 * Close Sentry connection
 */
async function close(timeout = 2000): Promise<boolean> {
  return await Sentry.close(timeout);
}

/**
 * Get current Sentry configuration status
 */
function getStatus(): {
  enabled: boolean;
  dsn: string | null;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
} {
  return {
    enabled: !!process.env.SENTRY_DSN,
    dsn: process.env.SENTRY_DSN ? '[REDACTED]' : null,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  };
}

export {
  initSentry,
  setUserContext,
  clearUserContext,
  captureException,
  captureMessage,
  addBreadcrumb,
  setExtra,
  setTag,
  flush,
  close,
  getStatus
};
