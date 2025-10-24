/**
 * Web Vitals v5 monitoring implementation
 * Tracks Core Web Vitals and sends to analytics
 */
export interface WebVitalsMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
    navigationType: string;
}
/**
 * Initialize Web Vitals monitoring
 * Call this from your app entry point or _app.tsx
 */
export declare function initWebVitals(): Promise<void>;
/**
 * Report custom performance metrics
 */
export declare function reportCustomMetric(name: string, value: number, metadata?: Record<string, unknown>): void;
/**
 * Get Navigation Timing metrics
 */
export declare function getNavigationMetrics(): Record<string, number> | null;
/**
 * Get Resource Timing metrics
 */
export declare function getResourceMetrics(): PerformanceResourceTiming[];
//# sourceMappingURL=webVitals.d.ts.map