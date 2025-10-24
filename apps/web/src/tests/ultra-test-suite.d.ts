/**
 * ULTRA TESTING SUITE 🧪
 * Comprehensive end-to-end testing for all PawfectMatch Premium features
 */
interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    duration: number;
    error?: string;
    data?: Record<string, unknown>;
}
declare class UltraTestSuite {
    private results;
    private startTime;
    runAllTests(): Promise<TestResult[]>;
    private runTest;
    private testAuthenticationFlow;
    private testAllEndpoints;
    private testAIServices;
    private testWebSocketConnection;
    private testPerformance;
    private testErrorHandling;
    private printResults;
}
export declare const ultraTestSuite: UltraTestSuite;
export {};
//# sourceMappingURL=ultra-test-suite.d.ts.map