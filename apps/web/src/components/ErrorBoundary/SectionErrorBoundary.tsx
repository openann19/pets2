'use client';
import React from 'react'
import { logger } from '@pawfectmatch/core';
;
import { ErrorBoundary } from './ErrorBoundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
/**
 * Specialized error boundary for different app sections
 */
export const SectionErrorBoundary = ({ children, section, fallback, onError }) => {
    const handleError = (error, errorInfo) => {
        logger.error(`Error in ${section} section:`, { error, errorInfo });
        if (onError) {
            onError(error, errorInfo);
        }
    };
    const defaultFallback = (<div className="border border-red-200 bg-red-50 rounded-lg p-6 m-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0"/>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {section} Error
          </h3>
          
          <p className="text-red-700 mb-4">
            We encountered an error in the {section.toLowerCase()} section. This section may not work properly.
          </p>
          
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4"/>
              Reload Page
            </button>
            
            <button onClick={() => window.location.href = '/'} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4"/>
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>);
    return (<ErrorBoundary level="component" fallback={fallback || defaultFallback} onError={handleError}>
      {children}
    </ErrorBoundary>);
};
/**
 * Chat Error Boundary - Specialized for chat components
 */
export const ChatErrorBoundary = ({ children }) => (<SectionErrorBoundary section="Chat" fallback={<div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-3"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chat Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the chat. Please try refreshing the page.
          </p>
          <button onClick={() => window.location.reload()} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Refresh Page
          </button>
        </div>
      </div>}>
    {children}
  </SectionErrorBoundary>);
/**
 * Map Error Boundary - Specialized for map components
 */
export const MapErrorBoundary = ({ children }) => (<SectionErrorBoundary section="Map" fallback={<div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-blue-500 mx-auto mb-3"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Map Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the map. Please check your internet connection and try again.
          </p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      </div>}>
    {children}
  </SectionErrorBoundary>);
/**
 * Profile Error Boundary - Specialized for profile components
 */
export const ProfileErrorBoundary = ({ children }) => (<SectionErrorBoundary section="Profile" fallback={<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-purple-500 mx-auto mb-3"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profile Error
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't load your profile information. Please try again.
          </p>
          <button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Reload Profile
          </button>
        </div>
      </div>}>
    {children}
  </SectionErrorBoundary>);
/**
 * Swipe Error Boundary - Specialized for swipe/matching components
 */
export const SwipeErrorBoundary = ({ children }) => (<SectionErrorBoundary section="Swipe" fallback={<div className="flex items-center justify-center h-96 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-pink-500 mx-auto mb-3"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Matching Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading new matches. Please try again in a moment.
          </p>
          <button onClick={() => window.location.reload()} className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
            Find New Matches
          </button>
        </div>
      </div>}>
    {children}
  </SectionErrorBoundary>);
/**
 * Payment Error Boundary - Specialized for payment/subscription components
 */
export const PaymentErrorBoundary = ({ children }) => (<SectionErrorBoundary section="Payment" fallback={<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-3"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment System Error
          </h3>
          <p className="text-gray-600 mb-4">
            We're experiencing issues with our payment system. Please try again later or contact support.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Try Again
            </button>
            <button onClick={() => window.location.href = '/support'} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>}>
    {children}
  </SectionErrorBoundary>);
export default SectionErrorBoundary;
//# sourceMappingURL=SectionErrorBoundary.jsx.map