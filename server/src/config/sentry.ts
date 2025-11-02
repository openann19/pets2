export {};// Added to mark file as a module
/**
 * Sentry Error Monitoring Configuration
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const logger = require('../utils/logger');

/**
 * Initialize Sentry error tracking
 */
function initSentry(app) {
  if (!process.env.SENTRY_DSN) {
    logger.warn('SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  if (process.env.NODE_ENV === 'test') {
    logger.info('Sentry disabled in test environment');
    return;
  }

  // Build integrations array safely
  const integrations = [];

  try {
    // Enable HTTP calls tracing
    if (Sentry.Integrations && Sentry.Integrations.Http) {
      integrations.push(new Sentry.Integrations.Http({ tracing: true }));
    }
    // Enable Express.js middleware tracing
    if (Sentry.Integrations && Sentry.Integrations.Express) {
      integrations.push(new Sentry.Integrations.Express({ app }));
    }
    // Enable profiling
    integrations.push(new ProfilingIntegration());
  } catch (error) {
    logger.warn('Some Sentry integrations unavailable:', { error: error.message });
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

    // Integrations
    integrations,

    // Filter out sensitive data
  beforeSend(event) {
      // Don't send if explicitly disabled
      if (process.env.SENTRY_ENABLED === 'false') {
        return null;
      }

      // Remove sensitive data from request
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }

      // Remove sensitive data from extra
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.secret;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser errors
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors
      'NetworkError',
      'Network request failed',
      // Auth errors (these are expected)
      'Invalid token',
      'Token expired',
      'Unauthorized',
    ],

    // Release tracking
    // Prefer explicit release env var, fallback to package version
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
  });

  logger.info('Sentry error tracking initialized', { 
    environment: process.env.NODE_ENV,
    sampleRate: process.env.NODE_ENV === 'production' ? '10%' : '100%'
  });
}

/**
 * Request handler - must be the first middleware
 */
function sentryRequestHandler() {
  if (process.env.NODE_ENV === 'test' || !process.env.SENTRY_DSN || !Sentry.Handlers) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler();
}

/**
 * Tracing handler - must come after request handler
 */
function sentryTracingHandler() {
  if (process.env.NODE_ENV === 'test' || !process.env.SENTRY_DSN || !Sentry.Handlers) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.tracingHandler();
}

/**
 * Error handler - must be before other error handlers
 */
function sentryErrorHandler() {
  if (process.env.NODE_ENV === 'test' || !process.env.SENTRY_DSN || !Sentry.Handlers) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status >= 500
      if (error.status >= 500) {
        return true;
      }
      // Don't capture 4xx errors (client errors)
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      return true;
    },
  });
}

/**
 * Manually capture exception
 */
function captureException(error, context = {}) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  Sentry.captureException(error, {
    level: 'error',
    ...context,
  });
}

/**
 * Manually capture message
 */
function captureMessage(message, level = 'info', context = {}) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  Sentry.captureMessage(message, {
    level,
    ...context,
  });
}

/**
 * Set user context for error tracking
 */
function setUser(user) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  Sentry.setUser({
    id: user.id || user._id,
    email: user.email,
    username: user.name || user.username,
  });
}

/**
 * Clear user context
 */
function clearUser() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
function addBreadcrumb(message, data = {}, level = 'info') {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

module.exports = {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  Sentry,
};
