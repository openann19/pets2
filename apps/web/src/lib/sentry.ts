/**
 * Sentry initialization for error tracking and performance monitoring
 * Production-ready configuration with privacy-first approach
 */
import { logger } from '@pawfectmatch/core';
import * as Sentry from '@sentry/nextjs';
const SENTRY_DSN = process.env['NEXT_PUBLIC_SENTRY_DSN'];
const ENVIRONMENT = process.env['NEXT_PUBLIC_ENVIRONMENT'] || process.env['NODE_ENV'] || 'development';
/**
 * Initialize Sentry for client-side error tracking
 */
export function initSentry() {
    if (!SENTRY_DSN) {
        if (ENVIRONMENT === 'production') {
            logger.warn('Sentry DSN not configured - error tracking disabled');
        }
        return;
    }
    try {
        Sentry.init({
            dsn: SENTRY_DSN,
            environment: ENVIRONMENT,
            // Performance monitoring
            tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
            // Session replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            // Privacy settings
            beforeSend(event) {
                // Redact sensitive data
                if (event.request) {
                    // Remove auth headers
                    if (event.request.headers) {
                        delete event.request.headers['authorization'];
                        delete event.request.headers['cookie'];
                    }
                    // Redact sensitive query params
                    if (event.request.query_string) {
                        event.request.query_string = event.request.query_string
                            .replace(/token=[^&]*/g, 'token=[REDACTED]')
                            .replace(/password=[^&]*/g, 'password=[REDACTED]')
                            .replace(/api_key=[^&]*/g, 'api_key=[REDACTED]');
                    }
                }
                // Filter out certain errors
                if (event.exception?.values) {
                    const errorMessage = event.exception.values[0]?.value || '';
                    // Ignore known non-critical errors
                    const ignoredErrors = [
                        'ResizeObserver loop limit exceeded',
                        'Non-Error promise rejection captured',
                        'ChunkLoadError',
                        'Loading chunk',
                        'Network request failed',
                    ];
                    if (ignoredErrors.some((ignored) => errorMessage.includes(ignored))) {
                        return null;
                    }
                }
                return event;
            },
            // Ignore certain URLs
            ignoreErrors: [
                // Browser extensions
                'top.GLOBALS',
                'chrome-extension://',
                'moz-extension://',
                // Random plugins/extensions
                "Can't find variable: _AutofillCallbackHandler",
                // Network errors
                'NetworkError',
                'Failed to fetch',
            ],
            // Configure integrations
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({
                    maskAllText: true,
                    blockAllMedia: true,
                    maskAllInputs: true,
                }),
            ],
            // Release tracking
            ...(process.env['NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA']
                ? { release: process.env['NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA'] }
                : {}),
            // Additional options
            normalizeDepth: 10,
            maxBreadcrumbs: 50,
            attachStacktrace: true,
            // Enable debug in development
            debug: ENVIRONMENT === 'development',
        });
        logger.info('Sentry initialized', { environment: ENVIRONMENT });
    }
    catch (error) {
        logger.error('Failed to initialize Sentry:', { error });
    }
}
/**
 * Set user context in Sentry
 */
export function setSentryUser(user) {
    Sentry.setUser({ id: user.id });
}
/**
 * Clear user context in Sentry
 */
export function clearSentryUser() {
    Sentry.setUser(null);
}
/**
 * Add context to Sentry
 */
export function setSentryContext(name, context) {
    Sentry.setContext(name, context);
}
/**
 * Capture exception manually
 */
export function captureException(error, context) {
    Sentry.captureException(error);
    if (context) {
        Sentry.setContext('extra', context);
    }
}
/**
 * Capture message manually
 */
export function captureMessage(message, level = 'info') {
    Sentry.captureMessage(message, level);
}
/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name, op) {
    Sentry.startSpan({ name, op }, () => { });
}
//# sourceMappingURL=sentry.js.map