export declare function useSafeArea(): never;
export declare function SafeAreaProvider({ children }: {
    children: any;
}): JSX.Element;
export declare function SafeArea({ children, edges, className }: {
    children: any;
    edges?: string[] | undefined;
    className?: string | undefined;
}): JSX.Element;
/**
 * Hook for getting responsive spacing based on device type
 */
export declare function useResponsiveSpacing(): {
    buttonGap: string;
    containerPadding: string;
    sectionSpacing: string;
    cardSpacing: string;
    textSpacing: string;
};
//# sourceMappingURL=SafeAreaProvider.d.ts.map