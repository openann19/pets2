export declare class ComponentTestSuite {
    results: never[];
    runAllTests(): Promise<void>;
    runTest(name: any, testFn: any): Promise<void>;
    testAuthHook(): Promise<void>;
    testDashboardHook(): Promise<void>;
    testSwipeHook(): Promise<void>;
    testErrorBoundaries(): Promise<void>;
    testAccessibility(): Promise<void>;
    printResults(): void;
}
export declare const componentTestSuite: ComponentTestSuite;
//# sourceMappingURL=component-tests.d.ts.map