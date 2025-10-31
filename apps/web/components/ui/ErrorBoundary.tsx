/**
 * Error Boundary Component
 * Production-hardened error boundary for React applications
 * Features: Error logging, fallback UI, recovery mechanisms
 */

import React, { Component, type ReactNode } from 'react';
import { logger } from '@pawfectmatch/core';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReset?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | undefined;
  errorId: string | undefined;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined, errorId: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error_${String(Date.now())}_${crypto.randomUUID()}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with comprehensive context
    logger.error('React Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (this.props.onError !== undefined) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in custom error handler', {
          handlerError: handlerError instanceof Error ? handlerError.message : String(handlerError),
          originalError: error.message,
        });
      }
    }

    // Report to error monitoring service (Sentry, etc.)
    this.reportToMonitoring(error, errorInfo);
  }

  override componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { resetKeys: prevResetKeys } = prevProps;

    // Reset error boundary if resetKeys have changed
    if (resetKeys !== undefined && prevResetKeys !== undefined && resetKeys.length === prevResetKeys.length) {
      const hasChanged = resetKeys.some((key, index) => key !== prevResetKeys[index]);
      if (hasChanged && this.state.hasError) {
        this.resetErrorBoundary();
      }
    }
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId !== null) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  private reportToMonitoring = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to logger in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error Boundary Report:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
    }

    // Send to monitoring service
    try {
      // Send to backend error tracking API
      fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch((reportError) => {
        // Don't let reporting errors crash the app
        logger.error('Failed to report error:', reportError);
      });

      // If Sentry is configured, also send there
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: { react: errorInfo },
          tags: { errorId: this.state.errorId },
        });
      }
    } catch (reportingError) {
      logger.error('Error reporting failed:', reportingError);
    }
  };

  private resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  private handleRetry = () => {
    // Add a small delay before reset to prevent rapid clicking
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>

            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Our team has been notified and is working to fix this issue.
            </p>

            {this.props.showReset !== false && (
              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleRetry} variant="primary">
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    window.location.reload();
                  }}
                  variant="ghost"
                >
                  Reload Page
                </Button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error !== undefined && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack !== undefined && `\n\n${this.state.error.stack}`}
                </pre>
                {this.state.errorId !== undefined && (
                  <p className="mt-2 text-xs text-gray-500">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    logger.error('Error captured by hook', { error: error.message, stack: error.stack });
  }, []);

  React.useEffect(() => {
    if (error !== null) {
      throw error; // This will be caught by the nearest ErrorBoundary
    }
  }, [error]);

  return { captureError, resetError, hasError: error !== null };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  return WrappedComponent;
}
