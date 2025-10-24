export declare function withCodeSplit(importFunc: any, options?: {}): (props: any) => JSX.Element;
export declare function usePreloadComponent(importFunc: any): {
    preload: () => Promise<void>;
    isPreloaded: boolean;
    isPreloading: boolean;
};
export declare const LazyLoad: ({ children, fallback, rootMargin, threshold, }: {
    children: any;
    fallback?: JSX.Element | undefined;
    rootMargin?: string | undefined;
    threshold?: number | undefined;
}) => JSX.Element;
export declare function createLazyComponent(importFunc: any, displayName: any): (props: any) => JSX.Element;
export declare const preloadComponents: {
    critical: () => Promise<void>;
    onInteraction: () => Promise<void>;
};
declare const _default: {
    withCodeSplit: typeof withCodeSplit;
    LazyLoad: ({ children, fallback, rootMargin, threshold, }: {
        children: any;
        fallback?: JSX.Element | undefined;
        rootMargin?: string | undefined;
        threshold?: number | undefined;
    }) => JSX.Element;
    createLazyComponent: typeof createLazyComponent;
    preloadComponents: {
        critical: () => Promise<void>;
        onInteraction: () => Promise<void>;
    };
};
export default _default;
export declare const CodeSplitter: {
    withCodeSplit: typeof withCodeSplit;
    LazyLoad: ({ children, fallback, rootMargin, threshold, }: {
        children: any;
        fallback?: JSX.Element | undefined;
        rootMargin?: string | undefined;
        threshold?: number | undefined;
    }) => JSX.Element;
    createLazyComponent: typeof createLazyComponent;
    preloadComponents: {
        critical: () => Promise<void>;
        onInteraction: () => Promise<void>;
    };
};
//# sourceMappingURL=CodeSplitter.d.ts.map