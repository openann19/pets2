'use client';
import { logger } from '@pawfectmatch/core';
import { motion } from 'framer-motion';
import React, { Suspense, lazy } from 'react';
// Loading component with animation
const LoadingSpinner = () => (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"/>
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </motion.div>);
class LazyErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        logger.error('Lazy component error:', { error, errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (<div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to Load
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Something went wrong while loading this component.
            </p>
            <button onClick={() => this.setState({ hasError: false })} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors">
              Try Again
            </button>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
// Higher-order component for code splitting
export function withCodeSplit(importFunc, options = {}) {
    const LazyComponent = lazy(importFunc);
    const { fallback = <LoadingSpinner />, delay = 0 } = options;
    return function CodeSplitComponent(props) {
        const [showComponent, setShowComponent] = React.useState(delay === 0);
        React.useEffect(() => {
            if (delay > 0) {
                const timer = setTimeout(() => setShowComponent(true), delay);
                return () => { clearTimeout(timer); };
            }
            return undefined;
        }, [delay]);
        if (!showComponent) {
            return <LoadingSpinner />;
        }
        return (<LazyErrorBoundary>
        <Suspense fallback={fallback}>
          <LazyComponent {...props}/>
        </Suspense>
      </LazyErrorBoundary>);
    };
}
// Hook for preloading components
export function usePreloadComponent(importFunc) {
    const [isPreloaded, setIsPreloaded] = React.useState(false);
    const [isPreloading, setIsPreloading] = React.useState(false);
    const preload = React.useCallback(async () => {
        if (isPreloaded || isPreloading)
            return;
        setIsPreloading(true);
        try {
            await importFunc();
            setIsPreloaded(true);
        }
        catch (error) {
            logger.error('Failed to preload component:', { error });
        }
        finally {
            setIsPreloading(false);
        }
    }, [importFunc, isPreloaded, isPreloading]);
    return { preload, isPreloaded, isPreloading };
}
export const LazyLoad = ({ children, fallback = <LoadingSpinner />, rootMargin = '50px', threshold = 0.1, }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef(null);
    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry && entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin, threshold });
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => { observer.disconnect(); };
    }, [rootMargin, threshold]);
    return <div ref={ref}>{isVisible ? children : fallback}</div>;
};
// Utility for creating lazy components with better error handling
export function createLazyComponent(importFunc, displayName) {
    const LazyComponent = lazy(importFunc);
    if (displayName) {
        LazyComponent.displayName = displayName;
    }
    return function WrappedLazyComponent(props) {
        return (<LazyErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <LazyComponent {...props}/>
        </Suspense>
      </LazyErrorBoundary>);
    };
}
// Preload utility for critical components
export const preloadComponents = {
    // Preload critical components on app start
    critical: async () => {
        const components = [
            () => import('@/components/Chat/MessageInput'),
            () => import('@/components/Photo/PhotoCropper'),
            () => import('@/components/AI/BioGenerator'),
        ];
        await Promise.allSettled(components.map((component) => component()));
    },
    // Preload components on user interaction
    onInteraction: async () => {
        const components = [
            () => import('@/components/Chat/GifPicker'),
            () => import('@/components/Chat/StickerPicker'),
            () => import('@/components/VideoCall/VideoCallRoom'),
        ];
        await Promise.allSettled(components.map((component) => component()));
    },
};
// Default export for convenience
export default { withCodeSplit, LazyLoad, createLazyComponent, preloadComponents };
// Named export alias for backward compatibility
export const CodeSplitter = { withCodeSplit, LazyLoad, createLazyComponent, preloadComponents };
//# sourceMappingURL=CodeSplitter.jsx.map