export declare const MOBILE_PERFORMANCE_BUDGET: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    javascript: number;
    css: number;
    images: number;
    frameRate: number;
    memoryUsage: number;
    batteryDrain: string;
};
export declare const MOBILE_BREAKPOINTS: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
};
export declare const TOUCH_TARGETS: {
    minimum: number;
    recommended: number;
    comfortable: number;
};
export declare const useMobileOptimization: () => {
    isMobile: boolean;
    isTablet: boolean;
    isTouchDevice: boolean;
    connectionType: string;
    batteryLevel: null;
    isLowPowerMode: boolean;
};
export declare const useIntersectionObserver: (options?: {}) => {
    elementRef: (node: any) => (() => void) | undefined;
    isIntersecting: boolean;
    hasIntersected: boolean;
};
export declare const optimizeImageForMobile: (src: any, width: any, height: any) => string;
export declare const LazyImage: ({ src, alt, width, height, className, ...props }: {
    [x: string]: any;
    src: any;
    alt: any;
    width: any;
    height: any;
    className?: string | undefined;
}) => JSX.Element;
export declare const usePerformanceMonitor: () => {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    tti: number;
};
export declare const useMemoryMonitor: () => {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
};
export declare const useNetworkAwareLoading: () => {
    loadingStrategy: string;
    connectionType: string;
};
export declare const useBatteryAwareOptimizations: () => {
    optimizations: {
        reduceAnimations: boolean;
        reduceImageQuality: boolean;
        disableAutoPlay: boolean;
        reducePolling: boolean;
    };
    batteryLevel: null;
    isLowPowerMode: boolean;
};
export declare const useTouchGestures: () => {
    gestureState: {
        isPressed: boolean;
        isDragging: boolean;
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
        deltaX: number;
        deltaY: number;
    };
    handleTouchStart: (event: any) => void;
    handleTouchMove: (event: any) => void;
    handleTouchEnd: () => void;
};
export declare const usePWA: () => {
    isInstallable: boolean;
    isInstalled: boolean;
    installApp: () => Promise<void>;
};
export declare const useOfflineDetection: () => {
    isOnline: boolean;
    offlineQueue: never[];
    addToOfflineQueue: (item: any) => void;
};
//# sourceMappingURL=mobile-optimization.d.ts.map