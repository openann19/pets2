/**
 * Wraps a component to automatically track lifecycle events
 *
 * @param Component - The component to wrap
 * @param componentName - Name for tracking (e.g., 'SwipeCard', 'MatchModal')
 * @returns Wrapped component with analytics tracking
 *
 * @example
 * ```tsx
 * const TrackedSwipeCard = withAnalytics(SwipeCard, 'SwipeCard');
 * export default TrackedSwipeCard;
 * ```
 */
export declare function withAnalytics(Component: any, componentName: any): {
    (props: any): JSX.Element;
    displayName: string;
};
/**
 * Hook version for functional components
 * Use this inside your component instead of HOC if preferred
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useComponentTracking('MyComponent');
 *   return <div>...</div>;
 * }
 * ```
 */
export declare function useComponentTracking(componentName: any, metadata: any): void;
export default withAnalytics;
//# sourceMappingURL=withAnalytics.d.ts.map