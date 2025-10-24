'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
/**
 * Comprehensive Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component {
    retryTimeoutId = null;
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
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
        // Update state with error info
        this.setState({
            errorInfo
        });
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 Error Boundary Caught Error');
            logger.error('Error:', { error });
            logger.error('Error Info:', { errorInfo });
            logger.error('Component Stack:', { errorInfo.componentStack });
            console.groupEnd();
        }
        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        // Send error to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            this.reportError(error, errorInfo);
        }
    }
    reportError = async (error, errorInfo) => {
        try {
            // Send to error reporting service (Sentry, LogRocket, etc.)
            const errorReport = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                errorId: this.state.errorId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                level: this.props.level || 'component'
            };
            // Example: Send to your error reporting endpoint
            await fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorReport)
            });
        }
        catch (reportingError) {
            logger.error('Failed to report error:', { reportingError });
        }
    };
    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        });
    };
    handleReload = () => {
        window.location.reload();
    };
    handleGoHome = () => {
        window.location.href = '/';
    };
    componentWillUnmount() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
    }
    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Render appropriate error UI based on level
            return this.renderErrorUI();
        }
        return this.props.children;
    }
    renderErrorUI() {
        const { level = 'component' } = this.props;
        const { error, errorId } = this.state;
        if (level === 'critical') {
            return this.renderCriticalError();
        }
        if (level === 'page') {
            return this.renderPageError();
        }
        return this.renderComponentError();
    }
    renderCriticalError() {
        return (<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto"/>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Critical Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're experiencing technical difficulties. Our team has been notified and is working to fix this issue.
          </p>
          
          <div className="space-y-3">
            <button onClick={this.handleReload} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4"/>
              Reload Page
            </button>
            
            <button onClick={this.handleGoHome} className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
              <Home className="w-4 h-4"/>
              Go to Home
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (<details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {this.state.error?.stack}
              </pre>
            </details>)}
        </div>
      </div>);
    }
    renderPageError() {
        return (<div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto"/>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          
          <p className="text-gray-600 mb-6">
            We encountered an error while loading this page. Please try again.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button onClick={this.handleRetry} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4"/>
              Try Again
            </button>
            
            <button onClick={this.handleGoHome} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4"/>
              Go Home
            </button>
          </div>
        </div>
      </div>);
    }
    renderComponentError() {
        return (<div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"/>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Component Error
            </h3>
            
            <p className="text-sm text-red-700 mb-3">
              This component failed to render properly.
            </p>
            
            <div className="flex gap-2">
              <button onClick={this.handleRetry} className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center gap-1">
                <RefreshCw className="w-3 h-3"/>
                Retry
              </button>
              
              {process.env.NODE_ENV === 'development' && (<button onClick={() => logger.error('Error Details:', { this.state.error })} className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1">
                  <Bug className="w-3 h-3"/>
                  Debug
                </button>)}
            </div>
          </div>
        </div>
      </div>);
    }
}
/**
 * Hook for functional components to trigger error boundary
 */
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);
    return setError;
};
/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary(Component, errorBoundaryProps) {
    const WrappedComponent = (props) => (<ErrorBoundary {...errorBoundaryProps}>
      <Component {...props}/>
    </ErrorBoundary>);
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
/**
 * Async error boundary for handling promise rejections
 */
export class AsyncErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }
    componentDidMount() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
    componentWillUnmount() {
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
    handleUnhandledRejection = (event) => {
        const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
        this.setState({
            hasError: true,
            error,
            errorId: `async_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        // Prevent default browser behavior
        event.preventDefault();
    };
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (<div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500"/>
            <span className="text-sm text-red-800">
              An async operation failed. Please refresh the page.
            </span>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.jsx.map