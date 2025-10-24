export interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    url: string;
    userAgent: string;
    connection?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
    };
    memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    };
}
export interface CoreWebVitals {
    FCP: number;
    LCP: number;
    FID: number;
    CLS: number;
    TTFB: number;
    INP: number;
}
export interface PerformanceConfig {
    enableCoreWebVitals: boolean;
    enableResourceTiming: boolean;
    enableUserTiming: boolean;
    enableMemoryMonitoring: boolean;
    enableNetworkMonitoring: boolean;
    enableErrorTracking: boolean;
    sampleRate: number;
    endpoint: string;
    batchSize: number;
    flushInterval: number;
}
declare class PerformanceMonitor {
    private config;
    private metrics;
    private isEnabled;
    private flushTimer;
    private observers;
    constructor(config?: Partial<PerformanceConfig>);
    private initialize;
    private initializeCoreWebVitals;
    private initializeResourceTiming;
    private initializeUserTiming;
    private initializeErrorTracking;
    private addMetric;
    private startFlushTimer;
    private flush;
    private getSessionId;
    mark(name: string): void;
    measure(name: string, startMark?: string, endMark?: string): void;
    getCoreWebVitals(): CoreWebVitals | null;
    getMetrics(): PerformanceMetric[];
    destroy(): void;
}
export declare const initializePerformanceMonitoring: (config?: Partial<PerformanceConfig>) => PerformanceMonitor;
export declare const getPerformanceMonitor: () => PerformanceMonitor | null;
export declare const mark: (name: string) => void;
export declare const measure: (name: string, startMark?: string, endMark?: string) => void;
export declare const getCoreWebVitals: () => CoreWebVitals | null;
export declare const getMetrics: () => PerformanceMetric[];
export declare const usePerformanceMonitoring: (config?: Partial<PerformanceConfig>) => {
    monitor: PerformanceMonitor | null;
    coreWebVitals: CoreWebVitals | null;
    mark: (name: string) => void | undefined;
    measure: (name: string, startMark?: string, endMark?: string) => void | undefined;
};
export declare const useCoreWebVitals: () => CoreWebVitals | null;
export declare const measureAsync: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
export declare const measureSync: <T>(name: string, fn: () => T) => T;
export default PerformanceMonitor;
//# sourceMappingURL=performance-monitoring.d.ts.map