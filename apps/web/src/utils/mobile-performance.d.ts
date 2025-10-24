/**
 * Mobile Performance Optimization Utilities
 * Provides lazy loading, bundle splitting, and performance monitoring for mobile devices
 */
/**
 * Hook for lazy loading components with intersection observer
 */
export declare function useLazyLoad(options?: IntersectionObserverInit): {
    isVisible: boolean;
    elementRef: import("react").RefObject<HTMLElement>;
};
/**
 * Hook for performance monitoring on mobile devices
 */
export declare function usePerformanceMonitor(): {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    isMobile: boolean;
};
/**
 * Hook for optimizing images on mobile
 */
export declare function useOptimizedImage(src: string, options?: {
    sizes?: string;
    quality?: number;
    priority?: boolean;
}): {
    optimizedSrc: string;
    isLoading: boolean;
    error: string | null;
};
/**
 * Hook for managing bundle splitting and code splitting
 */
export declare function useCodeSplitting(): {
    loadModule: (moduleName: string, importFn: () => Promise<any>) => Promise<void>;
    isModuleLoaded: (moduleName: string) => boolean;
};
/**
 * Hook for managing memory usage on mobile devices
 */
export declare function useMemoryOptimization(): {
    memoryInfo: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
        isLowMemory: boolean;
    };
    clearCache: () => void;
};
/**
 * Utility for preloading critical resources
 */
export declare function preloadCriticalResources(): void;
/**
 * Utility for optimizing touch interactions
 */
export declare function optimizeTouchInteractions(): void;
/**
 * Initialize mobile performance optimizations
 */
export declare function initializeMobileOptimizations(): void;
//# sourceMappingURL=mobile-performance.d.ts.map