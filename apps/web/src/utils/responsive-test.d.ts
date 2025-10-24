/**
 * Utility component to test responsive design across different screen sizes
 */
export declare function ResponsiveTest(): JSX.Element;
/**
 * Hook to detect current screen size
 */
export declare function useScreenSize(): {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
};
/**
 * Utility to generate responsive class names
 */
export declare function responsiveClass(baseClass: any, mobileClass: any, tabletClass: any, desktopClass: any): string;
/**
 * Component to test button responsiveness
 */
export declare function ButtonResponsiveTest(): JSX.Element;
/**
 * Component to test card responsiveness
 */
export declare function CardResponsiveTest(): JSX.Element;
/**
 * Component to test swipe card responsiveness
 */
export declare function SwipeCardResponsiveTest(): JSX.Element;
//# sourceMappingURL=responsive-test.d.ts.map