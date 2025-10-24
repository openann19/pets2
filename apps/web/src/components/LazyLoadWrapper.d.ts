import React from 'react';
export declare function LazyLoadWrapper(importFunc: any, options?: {}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazySwipeCard: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazyMatchModal: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazyChatInterface: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazyMapComponent: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazyVideoCall: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazyAnalytics: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazyThreeJSBackground: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const LazyLottieAnimation: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare function preloadComponent(importFunc: any): () => void;
export declare function useLazyLoading(): {
    setLoading: (componentName: any, loading: any) => void;
    isComponentLoading: (componentName: any) => any;
    loadingStates: {};
};
export default LazyLoadWrapper;
//# sourceMappingURL=LazyLoadWrapper.d.ts.map