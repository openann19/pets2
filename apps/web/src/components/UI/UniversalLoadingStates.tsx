'use client';
import { motion, AnimatePresence } from 'framer-motion';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { EnhancedLoading } from './EnhancedLoadingSystem';
import LoadingSpinner from './LoadingSpinner';
import PremiumSkeleton from './PremiumSkeleton';
const LoadingContext = createContext(null);
export const useLoadingStates = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoadingStates must be used within LoadingProvider');
    }
    return context;
};
export const LoadingProvider = ({ children }) => {
    const [loadingStates, setLoadingStates] = useState([]);
    const startLoading = useCallback((id, options) => {
        setLoadingStates(prev => {
            const existing = prev.find(state => state.id === id);
            if (existing) {
                return prev.map(state => state.id === id ? { ...state, ...options } : state);
            }
            return [...prev, { id, ...options }];
        });
    }, []);
    const updateLoading = useCallback((id, updates) => {
        setLoadingStates(prev => prev.map(state => state.id === id ? { ...state, ...updates } : state));
    }, []);
    const stopLoading = useCallback((id) => {
        setLoadingStates(prev => prev.filter(state => state.id !== id));
    }, []);
    const isLoading = useCallback((id) => {
        return loadingStates.some(state => state.id === id);
    }, [loadingStates]);
    const getLoadingState = useCallback((id) => {
        loadingStates.find(state => state.id === id);
    }, [loadingStates]);
    return (<LoadingContext.Provider value={{
            loadingStates,
            startLoading,
            updateLoading,
            stopLoading,
            isLoading,
            getLoadingState,
        }}>
      {children}
    </LoadingContext.Provider>);
};
export const UniversalLoading = ({ id, children, fallback, className = '' }) => {
    const { isLoading, getLoadingState } = useLoadingStates();
    const loadingState = getLoadingState(id);
    const isCurrentlyLoading = isLoading(id);
    if (!isCurrentlyLoading || !loadingState) {
        return <>{children}</>;
    }
    if (fallback) {
        return <>{fallback}</>;
    }
    return (<EnhancedLoading isLoading={true} type={loadingState.type} skeletonType={loadingState.skeletonType} message={loadingState.message} className={className}>
      {children}
    </EnhancedLoading>);
};
export const ProgressLoading = ({ id, children, className = '' }) => {
    const { isLoading, getLoadingState } = useLoadingStates();
    const loadingState = getLoadingState(id);
    const isCurrentlyLoading = isLoading(id);
    if (!isCurrentlyLoading || !loadingState) {
        return <>{children}</>;
    }
    return (<div className={`relative ${className}`}>
      {/* Progress Bar */}
      {loadingState.showProgress && (<div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden z-10">
          <motion.div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${loadingState.progress || 0}%` }} transition={{ duration: 0.3, ease: 'easeOut' }}/>
        </div>)}

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
        <div className="text-center">
          <LoadingSpinner size="lg" message={loadingState.message}/>
          {loadingState.showProgress && (<div className="mt-2 text-sm text-gray-600">
              {Math.round(loadingState.progress || 0)}%
            </div>)}
        </div>
      </div>

      {children}
    </div>);
};
// ====== SPECIALIZED LOADING HOOKS ======
export const useAPILoading = () => {
    const { startLoading, stopLoading, updateLoading } = useLoadingStates();
    const startAPILoading = useCallback((operation, options) => {
        startLoading(`api-${operation}`, {
            message: options?.message || `Loading ${operation}...`,
            type: 'spinner',
            showProgress: options?.showProgress || false,
        });
    }, [startLoading]);
    const updateAPIProgress = useCallback((operation, progress) => {
        updateLoading(`api-${operation}`, { progress });
    }, [updateLoading]);
    const stopAPILoading = useCallback((operation) => {
        stopLoading(`api-${operation}`);
    }, [stopLoading]);
    return {
        startAPILoading,
        updateAPIProgress,
        stopAPILoading,
    };
};
export const usePageLoading = () => {
    const { startLoading, stopLoading } = useLoadingStates();
    const startPageLoading = useCallback((page, options) => {
        startLoading(`page-${page}`, {
            message: options?.message || `Loading ${page}...`,
            type: 'skeleton',
            skeletonType: options?.skeletonType || 'card',
        });
    }, [startLoading]);
    const stopPageLoading = useCallback((page) => {
        stopLoading(`page-${page}`);
    }, [stopLoading]);
    return {
        startPageLoading,
        stopPageLoading,
    };
};
export const useFormLoading = () => {
    const { startLoading, stopLoading } = useLoadingStates();
    const startFormLoading = useCallback((form, options) => {
        startLoading(`form-${form}`, {
            message: options?.message || `Processing ${form}...`,
            type: 'progressive',
        });
    }, [startLoading]);
    const stopFormLoading = useCallback((form) => {
        stopLoading(`form-${form}`);
    }, [stopLoading]);
    return {
        startFormLoading,
        stopFormLoading,
    };
};
export const APILoadingWrapper = ({ operation, children, message, showProgress = false, className = '' }) => {
    return (<UniversalLoading id={`api-${operation}`} className={className}>
      {children}
    </UniversalLoading>);
};
export const PageLoadingWrapper = ({ page, children, skeletonType = 'card', className = '' }) => {
    return (<UniversalLoading id={`page-${page}`} className={className}>
      {children}
    </UniversalLoading>);
};
export const FormLoadingWrapper = ({ form, children, className = '' }) => {
    return (<ProgressLoading id={`form-${form}`} className={className}>
      {children}
    </ProgressLoading>);
};
// ====== LOADING INDICATORS ======
export const LoadingIndicator = ({ id, className = '' }) => {
    const { isLoading, getLoadingState } = useLoadingStates();
    const loadingState = getLoadingState(id);
    const isCurrentlyLoading = isLoading(id);
    if (!isCurrentlyLoading || !loadingState) {
        return null;
    }
    return (<div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size="sm"/>
      <span className="text-sm text-gray-600">{loadingState.message}</span>
    </div>);
};
export const LoadingBadge = ({ id, className = '' }) => {
    const { isLoading } = useLoadingStates();
    const isCurrentlyLoading = isLoading(id);
    if (!isCurrentlyLoading) {
        return null;
    }
    return (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ${className}`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
      Loading...
    </motion.div>);
};
// ====== EXPORT ALL COMPONENTS ======
export { LoadingProvider as default, useLoadingStates, UniversalLoading, ProgressLoading, useAPILoading, usePageLoading, useFormLoading, APILoadingWrapper, PageLoadingWrapper, FormLoadingWrapper, LoadingIndicator, LoadingBadge, };
//# sourceMappingURL=UniversalLoadingStates.jsx.map