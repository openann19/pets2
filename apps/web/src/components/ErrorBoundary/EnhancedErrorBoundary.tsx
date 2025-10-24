'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
export class EnhancedErrorBoundary extends Component {
    retryTimeout = null;
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }
    static getDerivedStateFromError(error) {
        // Generate unique error ID for tracking
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            hasError: true,
            error,
            errorId
        };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            errorInfo
        });
        // Log error to monitoring service
        this.logError(error, errorInfo);
        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
        // Auto-retry for certain types of errors
        if (this.shouldAutoRetry(error)) {
            this.scheduleAutoRetry();
        }
    }
    logError = (error, errorInfo) => {
        const errorData = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            level: this.props.level || 'component',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            logger.error('Error Boundary Caught Error:', { errorData });
        }
        // Send to monitoring service (Sentry, LogRocket, etc.)
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.captureException(error, {
                tags: {
                    errorBoundary: true,
                    level: this.props.level
                },
                extra: errorData
            });
        }
        // Send to custom analytics
        this.sendToAnalytics(errorData);
    };
    sendToAnalytics = (errorData) => {
        // Send to your analytics service
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
                description: errorData.message,
                fatal: false,
                custom_parameter_1: errorData.level,
                custom_parameter_2: errorData.errorId
            });
        }
    };
    shouldAutoRetry = (error) => {
        // Auto-retry for network errors, chunk loading errors, etc.
        const retryableErrors = [
            'ChunkLoadError',
            'Loading chunk',
            'Network request failed',
            'Failed to fetch'
        ];
        return retryableErrors.some(errorType => error.message.includes(errorType) || error.name.includes(errorType));
    };
    scheduleAutoRetry = () => {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
        this.retryTimeout = setTimeout(() => {
            this.handleRetry();
        }, 3000); // Retry after 3 seconds
    };
    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        });
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
    };
    handleGoHome = () => {
        window.location.href = '/';
    };
    handleReload = () => {
        window.location.reload();
    };
    componentWillUnmount() {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI based on level
            return (<AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={this.getErrorContainerClasses()}>
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }} className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600"/>
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-gray-900 mb-4">
                {this.getErrorTitle()}
              </motion.h2>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-gray-600 mb-8 max-w-md mx-auto">
                {this.getErrorMessage()}
              </motion.p>

              {process.env.NODE_ENV === 'development' && this.state.error && (<motion.details initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 text-left bg-gray-100 p-4 rounded-lg max-w-2xl mx-auto">
                  <summary className="cursor-pointer font-semibold text-gray-800 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (<div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>)}
                  </div>
                </motion.details>)}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {this.props.showRetry !== false && (<button onClick={this.handleRetry} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    <ArrowPathIcon className="h-5 w-5 mr-2"/>
                    Try Again
                  </button>)}

                {this.props.showHome !== false && (<button onClick={this.handleGoHome} className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    <HomeIcon className="h-5 w-5 mr-2"/>
                    Go Home
                  </button>)}

                <button onClick={this.handleReload} className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                  Reload Page
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>);
        }
        return this.props.children;
    }
    getErrorContainerClasses = () => {
        const baseClasses = "flex items-center justify-center p-8";
        switch (this.props.level) {
            case 'page':
                return `${baseClasses} min-h-screen bg-gray-50`;
            case 'section':
                return `${baseClasses} min-h-96 bg-white rounded-lg border border-gray-200 shadow-sm`;
            case 'component':
            default:
                return `${baseClasses} p-4 bg-white rounded-lg border border-gray-200`;
        }
    };
    getErrorTitle = () => {
        switch (this.props.level) {
            case 'page':
                return 'Something went wrong';
            case 'section':
                return 'This section failed to load';
            case 'component':
            default:
                return 'Component error';
        }
    };
    getErrorMessage = () => {
        switch (this.props.level) {
            case 'page':
                return 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.';
            case 'section':
                return 'This section encountered an error while loading. You can try refreshing or continue using other parts of the app.';
            case 'component':
            default:
                return 'This component encountered an error. The rest of the page should continue to work normally.';
        }
    };
}
// Hook for functional components
export function useErrorHandler() {
    const handleError = (error, errorInfo) => {
        // Log error
        logger.error('Error caught by useErrorHandler:', { error, errorInfo });
        // Send to monitoring service
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.captureException(error, {
                tags: { hook: 'useErrorHandler' },
                extra: errorInfo
            });
        }
    };
    return { handleError };
}
// Higher-order component for easier usage
export function withErrorBoundary(Component, errorBoundaryProps) {
    const WrappedComponent = (props) => (<EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props}/>
    </EnhancedErrorBoundary>);
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
export default EnhancedErrorBoundary;
//# sourceMappingURL=EnhancedErrorBoundary.jsx.map