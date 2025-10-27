'use client';
import React, { Suspense, lazy, ComponentType } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion } from 'framer-motion';
import PremiumSkeleton from './UI/PremiumSkeleton';
import { ComponentType as CommonComponentType } from '@/types/common';
// Loading component with premium styling
const LoadingComponent = ({ className = '' }) => (<div className={`flex items-center justify-center p-8 ${className}`}>
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
    </motion.div>
  </div>);
// Skeleton loading component
const SkeletonLoading = ({ className = '' }) => (<div className={className}>
    <PremiumSkeleton variant="rectangular" height={200} className="mb-4"/>
    <PremiumSkeleton variant="text" width="80%" className="mb-2"/>
    <PremiumSkeleton variant="text" width="60%"/>
  </div>);
// Error boundary for lazy components
class LazyErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        logger.error('Lazy component failed to load:', { error, errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (<div className="p-8 text-center">
          <p className="text-red-500 mb-4">Failed to load component</p>
          <button onClick={() => { this.setState({ hasError: false }); }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retry
          </button>
        </div>);
        }
        return this.props.children;
    }
}
// Lazy load wrapper with error boundary and loading states
export function LazyLoadWrapper(importFunc, options = {}) {
    const { loading = 'spinner', customLoading, fallback, className = '' } = options;
    const LazyComponent = lazy(importFunc);
    const LoadingComponent = () => {
        switch (loading) {
            case 'skeleton':
                return <SkeletonLoading className={className}/>;
            case 'custom':
                return customLoading ? React.createElement(customLoading) : <SkeletonLoading className={className}/>;
            default:
                return <LoadingComponent className={className}/>;
        }
    };
    return React.forwardRef((props, ref) => (<LazyErrorBoundary fallback={fallback ? React.createElement(fallback) : undefined}>
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} ref={ref}/>
      </Suspense>
    </LazyErrorBoundary>));
}
// Predefined lazy components for common use cases
export const LazySwipeCard = LazyLoadWrapper(() => import('@/components/Pet/SwipeCard'), { loading: 'skeleton', className: 'w-full max-w-sm mx-auto' });
export const LazyMatchModal = LazyLoadWrapper(() => import('@/components/Pet/MatchModal'), { loading: 'spinner' });
export const LazyChatInterface = LazyLoadWrapper(() => import('@/components/Chat/ChatInterface'), { loading: 'skeleton', className: 'h-96' });
export const LazyMapComponent = LazyLoadWrapper(() => import('@/components/Map/MapComponent'), { loading: 'skeleton', className: 'h-64' });
export const LazyVideoCall = LazyLoadWrapper(() => import('@/components/VideoCall/VideoCallComponent'), { loading: 'spinner' });
export const LazyAnalytics = LazyLoadWrapper(() => import('@/components/Analytics/AnalyticsDashboard'), { loading: 'skeleton', className: 'h-96' });
// Heavy components that should be lazy loaded
export const LazyThreeJSBackground = LazyLoadWrapper(() => import('@/components/Background/ThreeJSBackground'), { loading: 'spinner' });
export const LazyLottieAnimation = LazyLoadWrapper(() => import('@/components/Animation/LottieAnimation'), { loading: 'spinner' });
// Utility function to preload components
export function preloadComponent(importFunc) {
    return () => {
        importFunc();
    };
}
// Hook for managing component loading states
export function useLazyLoading() {
    const [loadingStates, setLoadingStates] = React.useState({});
    const setLoading = (componentName, loading) => {
        setLoadingStates(prev => ({
            ...prev,
            [componentName]: loading
        }));
    };
    const isComponentLoading = (componentName) => {
        return loadingStates[componentName] || false;
    };
    return {
        setLoading,
        isComponentLoading,
        loadingStates
    };
}
export default LazyLoadWrapper;
//# sourceMappingURL=LazyLoadWrapper.jsx.map