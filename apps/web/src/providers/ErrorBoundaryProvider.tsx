'use client';
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { logger } from '@pawfectmatch/core';
;
import React, { createContext, useCallback, useContext, useState } from 'react';
import { AsyncErrorBoundary, ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
const ErrorContext = createContext(undefined);
export const useErrorContext = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useErrorContext must be used within ErrorBoundaryProvider');
    }
    return context;
};
/**
 * Global Error Boundary Provider
 * Provides error handling context and global error UI
 */
export const ErrorBoundaryProvider = ({ children }) => {
    const [globalError, setGlobalError] = useState(null);
    const [errorContext, setErrorContext] = useState('');
    const reportError = useCallback((error, context) => {
        logger.error('Global error reported:', { error, context });
        setGlobalError(error);
        setErrorContext(context || 'Unknown context');
        // Send to error reporting service
        if (process.env.NODE_ENV === 'production') {
            fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    context: context || 'Unknown',
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                })
            }).catch(console.error);
        }
    }, []);
    const clearError = useCallback(() => {
        setGlobalError(null);
        setErrorContext('');
    }, []);
    const handleError = useCallback((error, errorInfo) => {
        reportError(error, 'React Error Boundary');
    }, [reportError]);
    const contextValue = {
        reportError,
        clearError,
        hasError: !!globalError,
        error: globalError
    };
    return (<ErrorContext.Provider value={contextValue}>
      <ErrorBoundary level="critical" onError={handleError} fallback={<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-500"/>
                  <h1 className="text-xl font-bold text-gray-900">
                    Application Error
                  </h1>
                </div>
                <button onClick={clearError} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                We're sorry, but something went wrong. Our team has been notified and is working to fix this issue.
              </p>
              
              <div className="space-y-3">
                <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4"/>
                  Reload Application
                </button>
                
                <button onClick={() => window.location.href = '/'} className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Go to Home Page
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && globalError && (<details className="mt-6">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Context:</strong> {errorContext}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {globalError.message}
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {globalError.stack}
                    </pre>
                  </div>
                </details>)}
            </div>
          </div>}>
        <AsyncErrorBoundary fallback={<div className="border border-orange-200 bg-orange-50 rounded-lg p-4 m-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500"/>
                <span className="text-sm text-orange-800">
                  An async operation failed. Please refresh the page.
                </span>
                <button onClick={() => window.location.reload()} className="ml-auto text-sm bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors">
                  Refresh
                </button>
              </div>
            </div>}>
          {children}
        </AsyncErrorBoundary>
      </ErrorBoundary>
    </ErrorContext.Provider>);
};
/**
 * Hook for reporting errors from anywhere in the app
 */
export const useErrorReporter = () => {
    const { reportError } = useErrorContext();
    return useCallback((error, context) => {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        reportError(errorObj, context);
    }, [reportError]);
};
/**
 * Higher-order component for error reporting
 */
export function withErrorReporting(Component, context) {
    const WrappedComponent = (props) => {
        const reportError = useErrorReporter();
        React.useEffect(() => {
            const originalConsoleError = console.error;
            console.error = (...args) => {
                originalConsoleError(...args);
                // Report console errors in development
                if (process.env.NODE_ENV === 'development') {
                    const error = new Error(args.join(' '));
                    reportError(error, context || 'Console Error');
                }
            };
            return () => {
                console.error = originalConsoleError;
            };
        }, [reportError]);
        return <Component {...props}/>;
    };
    WrappedComponent.displayName = `withErrorReporting(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
export default ErrorBoundaryProvider;
//# sourceMappingURL=ErrorBoundaryProvider.jsx.map