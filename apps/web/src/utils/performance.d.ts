/**
 * 🚀 PERFORMANCE OPTIMIZATION UTILITIES
 * Advanced performance monitoring and optimization for jaw-dropping UX
 */
import React from 'react';
export declare const dynamicImport: <T>(importFn: () => Promise<T>, fallback?: React.ComponentType) => React.LazyExoticComponent<any>;
export declare const optimizeImageUrl: (url: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "auto";
    blur?: boolean;
}) => string;
export declare const analyzeBundleSize: () => {
    scripts: number;
    styles: number;
    total: number;
    estimate: string;
} | undefined;
export declare class PerformanceMonitor {
    private metrics;
    private observers;
    constructor();
    private initializeObservers;
    trackMetric(name: string, value: number): void;
    getMetrics(): Record<string, any>;
    generateReport(): {
        timestamp: string;
        metrics: Record<string, any>;
        recommendations: string[];
        score: number;
    };
    private generateRecommendations;
    private calculatePerformanceScore;
    destroy(): void;
}
export declare const optimizeAnimations: () => {
    prefersReducedMotion: boolean;
    isLowEndDevice: boolean;
} | undefined;
export declare const optimizeMemory: () => {
    getMemoryInfo: () => {
        used: string;
        total: string;
        limit: string;
        percentage: string;
    } | null;
    cleanupImages: () => void;
    startMemoryMonitoring: () => void;
} | undefined;
export declare const optimizeNetwork: () => {
    getConnectionInfo: () => {
        effectiveType: any;
        downlink: any;
        rtt: any;
        saveData: any;
    } | null;
    shouldOptimizeForConnection: () => any;
} | undefined;
export declare const preloadCriticalResources: () => {
    preloadImage: (src: string) => Promise<void>;
    preloadFont: (fontUrl: string) => Promise<void>;
    preloadCriticalImages: () => Promise<void>;
} | undefined;
export declare const createPerformanceMonitor: () => PerformanceMonitor;
//# sourceMappingURL=performance.d.ts.map