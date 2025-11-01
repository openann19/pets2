/**
 * 🛡️ ADVANCED ERROR BOUNDARY SYSTEM
 * Comprehensive error handling with recovery mechanisms and user feedback
 */
'use client';
import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { logger } from '@pawfectmatch/core';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface EnhancedErrorBoundaryProps {
    children: ReactNode;
    level?: 'component' | 'critical';
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface EnhancedErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string | null;
    retryCount: number;
}

export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
    retryTimeoutId: NodeJS.Timeout | null = null;
    constructor(props: EnhancedErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            retryCount: 0,
        };
    }
    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Filter out NEXT_REDIRECT errors - these are expected Next.js behavior, not actual errors
        if (error.message === 'NEXT_REDIRECT') {
            return; // Silently ignore redirects
        }
        
        this.setState({ errorInfo });
        // Log error details
        logger.error('🚨 Error Boundary Caught:', { error });
        logger.error('📍 Error Info:', { errorInfo });
        // Send to monitoring service
        this.reportError(error, errorInfo);
        // Call custom error handler
        this.props.onError?.(error, errorInfo);
        // Auto-retry for component-level errors
        if (this.props.level === 'component' && this.state.retryCount < 3) {
            this.scheduleRetry();
        }
    }
    reportError(error: Error, errorInfo: ErrorInfo) {
        // Skip NEXT_REDIRECT errors - these are expected Next.js behavior
        if (error.message === 'NEXT_REDIRECT') {
            return;
        }
        
        try {
            // Send to analytics/monitoring
            if (typeof window !== 'undefined') {
                const errorReport = {
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    errorId: this.state.errorId,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    level: this.props.level || 'component',
                    retryCount: this.state.retryCount,
                };
                // Send to backend or analytics service
                fetch('/api/errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(errorReport),
                }).catch(err => {
                    logger.warn('Failed to report error:', { err });
                });
                // Store locally for debugging
                localStorage.setItem(`error_${this.state.errorId}`, JSON.stringify(errorReport));
            }
        }
        catch (reportingError) {
            logger.error('Failed to report error:', { reportingError });
        }
    }
    scheduleRetry() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
        this.retryTimeoutId = setTimeout(() => {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: prevState.retryCount + 1,
            }));
        }, 2000 * (this.state.retryCount + 1)); // Exponential backoff
    }
    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1,
        }));
    };
    handleGoHome = () => {
        if (typeof window !== 'undefined') {
            window.location.href = './dashboard';
        }
    };
    handleReport = () => {
        if (typeof window !== 'undefined') {
            const subject = encodeURIComponent('PawfectMatch Error Report');
            const body = encodeURIComponent(`Error ID: ${this.state.errorId}\nError: ${this.state.error?.message}`);
            window.open(`mailto:support@pawfectmatch.com?subject=${subject}&body=${body}`);
        }
    };
    override render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Premium error UI based on level
            return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-6">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="max-w-md w-full text-center">
            {/* Error Icon */}
            <motion.div animate={{
                    rotate: [0, 10, -10, 5, -5, 0],
                    scale: [1, 1.1, 1]
                }} transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                }} className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500"/>
              </div>
            </motion.div>

            {/* Error Content */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {this.props.level === 'critical' ? 'Something went wrong' : 'Oops! A hiccup occurred'}
              </h1>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {this.props.level === 'critical'
                    ? 'We encountered a critical error. Our team has been notified and will fix this soon.'
                    : 'Don\'t worry! This happens sometimes. We\'ve automatically reported this issue.'}
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (<motion.details className="mb-6 text-left bg-gray-100 rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </motion.details>)}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.state.retryCount < 3 && (<motion.button onClick={this.handleRetry} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                    <ArrowPathIcon className="w-5 h-5"/>
                    Try Again
                  </motion.button>)}

                <motion.button onClick={this.handleGoHome} className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl border border-gray-200 transition-all" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                  <HomeIcon className="w-5 h-5"/>
                  Go Home
                </motion.button>

                <motion.button onClick={this.handleReport} className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium shadow-md hover:shadow-lg transition-all" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                  <ChatBubbleLeftIcon className="w-5 h-5"/>
                  Report Issue
                </motion.button>
              </div>

              {/* Retry Information */}
              {this.state.retryCount > 0 && (<motion.p className="mt-4 text-sm text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                  Retry attempt: {this.state.retryCount}/3
                </motion.p>)}
            </motion.div>

            {/* Decorative Elements */}
            <motion.div className="absolute top-4 right-4 text-gray-300" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              🐾
            </motion.div>
          </motion.div>
        </div>);
        }
        return this.props.children;
    }
    override componentWillUnmount(): void {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
    }
}
// ====== ERROR BOUNDARY FACTORY ======
export const withErrorBoundary = (Component: React.ComponentType<Record<string, unknown>>, errorBoundaryProps: Partial<EnhancedErrorBoundaryProps>) => {
    const WrappedComponent = (props: Record<string, unknown>) => (<EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props}/>
    </EnhancedErrorBoundary>);
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
};
// ====== HOOK FOR ERROR REPORTING ======
export const useErrorReporting = () => {
    const reportError = React.useCallback((error: Error, context?: string) => {
        logger.error('🚨 Manual Error Report:', { error });
        try {
            const errorReport = {
                message: error.message,
                stack: error.stack,
                context,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
            };
            // Send to backend
            fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorReport),
            }).catch(err => {
                logger.warn('Failed to report error:', { err });
            });
        }
        catch (reportingError) {
            logger.error('Failed to report error:', { reportingError });
        }
    }, []);
    return { reportError };
};
//# sourceMappingURL=error-boundary.jsx.map