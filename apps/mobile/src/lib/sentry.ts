/**
 * Sentry initialization for mobile app
 * Production-ready error tracking and performance monitoring
 */

import { logger } from "@pawfectmatch/core";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const SENTRY_DSN = Constants?.expoConfig?.extra?.["sentryDsn"];
const ENVIRONMENT =
  Constants?.expoConfig?.extra?.["environment"] || "development";

/**
 * Initialize Sentry for mobile error tracking
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (ENVIRONMENT === "production") {
      logger.warn("Sentry DSN not configured - error tracking disabled");
    }
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,

      // Performance monitoring
      tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,

      // Enable native crash reporting
      enableNative: true,
      enableNativeCrashHandling: true,
      enableNativeNagger: __DEV__,

      // Privacy settings
      beforeSend(event) {
        // Redact sensitive data
        if (event.request) {
          // Remove auth headers
          if (event.request.headers) {
            delete event.request.headers["authorization"];
            delete event.request.headers["cookie"];
          }

          // Redact sensitive query params
          if (event.request.query_string) {
            event.request.query_string = (event.request.query_string as string)
              .replace(/token=[^&]*/g, "token=[REDACTED]")
              .replace(/password=[^&]*/g, "password=[REDACTED]")
              .replace(/api_key=[^&]*/g, "api_key=[REDACTED]");
          }
        }

        // Filter out certain errors
        if (event.exception?.values) {
          const errorMessage = event.exception.values[0]?.value || "";

          // Ignore known non-critical errors
          const ignoredErrors = [
            "Network request failed",
            "Timeout",
            "AbortError",
            "cancelled",
          ];

          if (ignoredErrors.some((ignored) => errorMessage.includes(ignored))) {
            return null;
          }
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        // Network errors
        "NetworkError",
        "Failed to fetch",
        "Network request failed",
        // Timeout errors
        "timeout",
        "Timeout",
      ],

      // Release tracking
      release: Constants.expoConfig?.version || "1.0.0",
      dist:
        Constants.expoConfig?.ios?.buildNumber ||
        Constants.expoConfig?.android?.versionCode?.toString() ||
        "1",

      // Additional options
      normalizeDepth: 10,
      maxBreadcrumbs: 50,
      attachStacktrace: true,

      // Enable debug in development
      debug: __DEV__,

      // Auto session tracking
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,

      // Custom integrations
      integrations: [
        // ReactNativeTracing has been replaced with automatic tracing in newer Sentry versions
        // If using navigation instrumentation, use: Sentry.reactNavigationIntegration()
      ],
    });

    logger.debug("Sentry initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Sentry", { error });
  }
}

/**
 * Set Sentry user context
 * @param user - The user object
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    ...(user.email && { email: user.email }),
    ...(user.username && { username: user.username }),
  });
}

/**
 * Clear user context in Sentry
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Add context to Sentry
 */
export function setSentryContext(
  name: string,
  context: Record<string, unknown>,
): void {
  Sentry.setContext(name, context);
}

/**
 * Capture exception manually
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  if (context) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture message manually
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
): void {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a transaction for performance monitoring
 * Note: startTransaction is deprecated in newer Sentry versions
 * Use Sentry.startSpan() instead
 */
export function startTransaction(name: string, op: string): void {
  // startTransaction has been deprecated - transactions are now automatic
  logger.debug("Transaction tracking:", { name, op });
}

/**
 * Wrap a component with Sentry error boundary
 */
export const _ErrorBoundary = Sentry.wrap;
