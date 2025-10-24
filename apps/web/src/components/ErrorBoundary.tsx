'use client';
import React, { Component, ReactNode } from 'react'
import { logger } from '@pawfectmatch/core';
;
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            logger.error('ErrorBoundary caught an error:', { error, errorInfo });
        }
        // You could also log to an error reporting service here
        // logErrorToService(error, errorInfo);
    }
    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };
    handleRefresh = () => {
        window.location.reload();
    };
    render() {
        if (this.state.hasError) {
            if (this.props.fallback != null) {
                return this.props.fallback;
            }
            return (<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Error Details (Development)</h3>
                <p className="text-sm text-red-700 font-mono mb-2">
                  {this.state.error.message}
                </p>
                {this.state.error.stack != null && (<details className="text-xs text-red-600 font-mono">
                    <summary className="cursor-pointer hover:text-red-800">Stack Trace</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </details>)}
              </div>)}

            <div className="flex gap-3 justify-center">
              <button onClick={this.handleRetry} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Try Again
              </button>
              <button onClick={this.handleRefresh} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                Refresh Page
              </button>
            </div>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.jsx.map