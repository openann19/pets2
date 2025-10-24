/**
 * Specialized error boundary for different app sections
 */
export declare const SectionErrorBoundary: ({ children, section, fallback, onError }: {
    children: any;
    section: any;
    fallback: any;
    onError: any;
}) => JSX.Element;
/**
 * Chat Error Boundary - Specialized for chat components
 */
export declare const ChatErrorBoundary: ({ children }: {
    children: any;
}) => JSX.Element;
/**
 * Map Error Boundary - Specialized for map components
 */
export declare const MapErrorBoundary: ({ children }: {
    children: any;
}) => JSX.Element;
/**
 * Profile Error Boundary - Specialized for profile components
 */
export declare const ProfileErrorBoundary: ({ children }: {
    children: any;
}) => JSX.Element;
/**
 * Swipe Error Boundary - Specialized for swipe/matching components
 */
export declare const SwipeErrorBoundary: ({ children }: {
    children: any;
}) => JSX.Element;
/**
 * Payment Error Boundary - Specialized for payment/subscription components
 */
export declare const PaymentErrorBoundary: ({ children }: {
    children: any;
}) => JSX.Element;
export default SectionErrorBoundary;
//# sourceMappingURL=SectionErrorBoundary.d.ts.map