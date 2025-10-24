/**
 * ⚡ PERFORMANCE OPTIMIZATIONS
 * Mobile performance optimizations based on Tinder clone best practices
 * Provides utilities for smooth, responsive mobile experience
 */
export declare const useDebounce: <T>(value: T, delay: number) => T;
export declare const useThrottle: <T extends (...args: unknown[]) => any>(callback: T, delay: number) => T;
export declare const useIntersectionObserver: (elementRef: React.RefObject<Element>, options?: IntersectionObserverInit) => boolean;
export declare const useVirtualScroll: (itemCount: number, itemHeight: number, containerHeight: number) => {
    visibleItems: number[];
    totalHeight: number;
    offsetY: number;
    setScrollTop: import("react").Dispatch<import("react").SetStateAction<number>>;
};
export declare const useOptimizedImage: (src: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
}) => {
    src: string;
    isLoaded: boolean;
    isError: boolean;
};
export declare const useMemoryOptimization: () => {
    memoryUsage: number;
    clearCache: () => void;
};
export declare const useNetworkOptimization: () => {
    connection: {
        effectiveType: string;
        downlink: number;
        rtt: number;
    } | null;
    isSlowConnection: boolean | null;
    shouldReduceQuality: boolean | null;
};
export declare const useAnimationPerformance: () => {
    fps: number;
    shouldReduceAnimations: boolean;
};
export declare const useBundleOptimization: () => {
    isLoaded: boolean;
    lazyImport: (moduleName: string) => Promise<any>;
};
export declare const useTouchOptimization: () => {
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchEnd: (e: React.TouchEvent) => void;
    getSwipeDirection: () => "left" | "right" | "up" | "down" | null;
};
export declare const usePerformanceMonitoring: () => {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
} | null;
//# sourceMappingURL=performance-optimizations.d.ts.map