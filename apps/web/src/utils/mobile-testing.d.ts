/**
 * Mobile Testing and Validation Utilities
 * Comprehensive testing suite for mobile compliance and performance
 */
export interface MobileTestResults {
    touchTargets: TouchTargetTest[];
    responsiveDesign: ResponsiveTest[];
    performance: PerformanceTest[];
    accessibility: AccessibilityTest[];
    safeAreas: SafeAreaTest[];
    overallScore: number;
    recommendations: string[];
}
export interface TouchTargetTest {
    element: string;
    size: {
        width: number;
        height: number;
    };
    meetsMinimum: boolean;
    recommendation?: string;
}
export interface ResponsiveTest {
    breakpoint: string;
    viewport: {
        width: number;
        height: number;
    };
    elementsVisible: number;
    elementsHidden: number;
    layoutBroken: boolean;
    issues: string[];
}
export interface PerformanceTest {
    metric: string;
    value: number;
    threshold: number;
    passed: boolean;
    impact: 'low' | 'medium' | 'high';
}
export interface AccessibilityTest {
    element: string;
    test: string;
    passed: boolean;
    severity: 'error' | 'warning' | 'info';
    message: string;
}
export interface SafeAreaTest {
    device: string;
    insets: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    elementsAffected: number;
    properlyHandled: boolean;
}
/**
 * Hook for running comprehensive mobile tests
 */
export declare function useMobileTesting(): {
    results: MobileTestResults | null;
    isRunning: boolean;
    progress: number;
    runTests: () => Promise<void>;
};
/**
 * Utility to run quick mobile health check
 */
export declare function quickMobileHealthCheck(): Promise<{
    score: number;
    issues: string[];
}>;
//# sourceMappingURL=mobile-testing.d.ts.map