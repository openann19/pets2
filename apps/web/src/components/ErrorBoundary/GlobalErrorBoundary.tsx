'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
export class GlobalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            logger.error('GlobalErrorBoundary caught an error:', { error, errorInfo });
        }
        // Log to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            this.logErrorToService(error, errorInfo);
        }
        this.setState({
            errorInfo,
        });
        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }
    logErrorToService = (error, errorInfo) => {
        // Example implementation - replace with your error reporting service
        const errorData = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };
        // Send to your error reporting service
        fetch('/api/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorData),
        }).catch(() => {
            // Silently fail if error reporting fails
        });
    };
    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        });
    };
    handleGoHome = () => {
        window.location.href = '/';
    };
    handleReload = () => {
        window.location.reload();
    };
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return (<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            {/* Error Icon */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500"/>
            </motion.div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {/* Error ID for support */}
            {this.state.errorId && (<div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Error ID (for support):
                </p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {this.state.errorId}
                </p>
              </div>)}

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={this.handleRetry} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <ArrowPathIcon className="w-5 h-5"/>
                Try Again
              </motion.button>

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={this.handleGoHome} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <HomeIcon className="w-5 h-5"/>
                  Go Home
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={this.handleReload} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <ArrowPathIcon className="w-5 h-5"/>
                  Reload
                </motion.button>
              </div>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (<details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (<pre className="text-xs text-red-600 dark:text-red-300 mt-2 whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </pre>)}
                </div>
              </details>)}
          </motion.div>
        </div>);
        }
        return this.props.children;
    }
}
// Hook for functional components to trigger error boundary
export function useErrorHandler() {
    return (error, errorInfo) => {
        // This will be caught by the nearest ErrorBoundary
        throw error;
    };
}
// Higher-order component for wrapping components with error boundary
export function withErrorBoundary(Component, errorBoundaryProps) {
    const WrappedComponent = (props) => (<GlobalErrorBoundary {...errorBoundaryProps}>
      <Component {...props}/>
    </GlobalErrorBoundary>);
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
export default GlobalErrorBoundary;
//# sourceMappingURL=GlobalErrorBoundary.jsx.map