'use client';
import React, { Component } from 'react';
import { logger } from '../../services/logger';
/**
 * Production-ready error boundary with comprehensive error handling,
 * logging, and user-friendly fallback UI
 */
export class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        logger.error('Application Error Boundary caught an error:', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            errorInfo: {
                componentStack: errorInfo.componentStack,
            },
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        });
        this.setState({
            error,
            errorInfo,
        });
        // Report to external error tracking service
        if (typeof window !== 'undefined' && 'Sentry' in window) {
            try {
                const sentrySdk = window.Sentry;
                sentrySdk.captureException(error, {
                    contexts: {
                        react: {
                            componentStack: errorInfo.componentStack,
                        },
                    },
                });
            }
            catch (sentryError) {
                logger.warn('Failed to report error to Sentry:', { error: sentryError });
            }
        }
    }
    handleRetry = () => {
        this.setState({ hasError: false });
    };
    handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
        return Promise.resolve();
    };
    handleReportError = () => {
        const { error, errorInfo } = this.state;
        if (!error)
            return;
        const errorReport = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        };
        // Copy to clipboard if available
        if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard
                .writeText(JSON.stringify(errorReport, null, 2))
                .then(() => {
                alert('Error details copied to clipboard. Please send this to support.');
            })
                .catch(() => {
                // Fallback: show error details in alert
                alert(`Error details:\n\n${JSON.stringify(errorReport, null, 2)}`);
            });
        }
        else {
            alert(`Error details:\n\n${JSON.stringify(errorReport, null, 2)}`);
        }
    };
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return (<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Oops! Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </p>
            </div>

            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">What can you do?</h3>
                </div>

                <div className="space-y-3">
                  <button onClick={this.handleRetry} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Try Again
                  </button>

                  <button onClick={this.handleReload} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Reload Page
                  </button>

                  <button onClick={this.handleReportError} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:驾-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Report Error
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Error ID: {this.state.error?.name || 'unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (<div className="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Development Error Details:
                </h4>
                <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo !== undefined && (<pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-40 mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>)}
              </div>)}
          </div>
        </div>);
        }
        return this.props.children;
    }
}
// Higher-order component for easier usage
export function withErrorBoundary(Component, fallback) {
    const WrappedComponent = (props) => (<AppErrorBoundary fallback={fallback}>
      <Component {...props}/>
    </AppErrorBoundary>);
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
export default AppErrorBoundary;
//# sourceMappingURL=AppErrorBoundary.jsx.map