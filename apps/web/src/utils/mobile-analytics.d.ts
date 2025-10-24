/**
 * Mobile Analytics and Performance Monitoring
 * Comprehensive tracking and monitoring for mobile devices
 */
export interface AnalyticsEvent {
    name: string;
    properties: Record<string, any>;
    timestamp: number;
    sessionId: string;
    userId?: string;
    deviceInfo: DeviceInfo;
    performance?: PerformanceMetrics;
}
export interface DeviceInfo {
    userAgent: string;
    platform: string;
    language: string;
    timezone: string;
    screenResolution: string;
    viewportSize: string;
    devicePixelRatio: number;
    connectionType: string;
    memoryInfo?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    };
    batteryLevel?: number;
    isOnline: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}
export interface PerformanceMetrics {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
    totalBlockingTime: number;
    speedIndex: number;
}
export interface UserSession {
    sessionId: string;
    startTime: number;
    endTime?: number;
    pageViews: number;
    events: AnalyticsEvent[];
    deviceInfo: DeviceInfo;
    userId?: string;
}
export interface MobileAnalyticsConfig {
    enablePerformanceTracking: boolean;
    enableUserTracking: boolean;
    enableErrorTracking: boolean;
    enableGestureTracking: boolean;
    enableBatteryTracking: boolean;
    enableMemoryTracking: boolean;
    enableNetworkTracking: boolean;
    batchSize: number;
    flushInterval: number;
    apiEndpoint: string;
    debug: boolean;
}
/**
 * Hook for mobile analytics
 */
export declare function useMobileAnalytics(config?: Partial<MobileAnalyticsConfig>): {
    session: UserSession | null;
    deviceInfo: DeviceInfo | null;
    trackEvent: (name: string, properties?: Record<string, any>) => void;
    trackPageView: (page: string, properties?: Record<string, any>) => void;
    trackInteraction: (type: string, element: string, properties?: Record<string, any>) => void;
    trackGesture: (gesture: string, properties?: Record<string, any>) => void;
    trackError: (error: Error, context?: Record<string, any>) => void;
    trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => void;
    flushEvents: () => Promise<void>;
};
/**
 * Hook for performance monitoring
 */
export declare function usePerformanceMonitoring(): {
    metrics: PerformanceMetrics | null;
    isMonitoring: boolean;
    startMonitoring: () => () => void;
    stopMonitoring: () => void;
    getMetrics: () => PerformanceMetrics | null;
};
/**
 * Utility functions for analytics
 */
export declare const analyticsUtils: {
    generateUserId: () => string;
    getUserId: () => string | null;
    setUserId: (userId: string) => void;
    isNewUser: () => boolean;
    getSessionDuration: (startTime: number) => number;
    formatMetric: (value: number, unit?: string) => string;
    isGoodMetric: (metric: string, value: number) => boolean;
    getMetricColor: (metric: string, value: number) => "green" | "red" | "yellow";
};
//# sourceMappingURL=mobile-analytics.d.ts.map