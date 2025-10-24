declare class CodeSplittingManager {
    static preloadedComponents: Set<unknown>;
    static loadingPromises: Map<any, any>;
    /**
     * Create lazy component with error boundary and loading fallback
     */
    static createLazyComponent(importFn: any, componentName: any, fallback: any): {
        (props: any): JSX.Element;
        displayName: string;
    };
    /**
     * Preload component for better performance
     */
    static preloadComponent(importFn: any, componentName: any): Promise<any>;
    /**
     * Preload multiple components
     */
    static preloadComponents(components: any): Promise<PromiseSettledResult<any>[]>;
    /**
     * Get preload status
     */
    static isPreloaded(componentName: any): boolean;
}
export declare const createRouteLazyComponent: (importFn: any, routeName: any) => {
    (props: any): JSX.Element;
    displayName: string;
};
export declare const createComponentLazyComponent: (importFn: any, componentName: any) => {
    (props: any): JSX.Element;
    displayName: string;
};
declare class PreloadingStrategies {
    /**
     * Preload on hover
     */
    static preloadOnHover(importFn: any, componentName: any): {
        onMouseEnter: () => void;
        onTouchStart: () => void;
    };
    /**
     * Preload on intersection
     */
    static preloadOnIntersection(importFn: any, componentName: any): {
        ref: (node: any) => void;
    };
    /**
     * Preload on idle
     */
    static preloadOnIdle(importFn: any, componentName: any): void;
}
declare class BundleAnalyzer {
    static chunkSizes: Map<any, any>;
    /**
     * Track chunk size
     */
    static trackChunkSize(chunkName: any, size: any): void;
    /**
     * Get bundle statistics
     */
    static getBundleStats(): {
        totalChunks: number;
        totalSize: number;
        averageSize: number;
        largestChunk: {
            name: any;
            size: any;
        };
        smallestChunk: {
            name: any;
            size: any;
        };
    };
}
export { BundleAnalyzer, CodeSplittingManager, PreloadingStrategies };
//# sourceMappingURL=codeSplitting.d.ts.map