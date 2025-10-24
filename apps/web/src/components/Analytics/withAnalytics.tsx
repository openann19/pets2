/**
 * Analytics Higher-Order Component (HOC)
 *
 * Automatically tracks component mount/unmount events
 * Refactored from analytics-system.ts to fix Next.js compilation issues
 */
'use client';
import React, { useEffect } from 'react';
import { useAnalytics } from '@/utils/analytics-system';
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
export function withAnalytics(Component, componentName) {
    const WrappedComponent = (props) => {
        const analytics = useAnalytics();
        useEffect(() => {
            // Track when component mounts
            analytics.trackInteraction(componentName, 'component_mounted', {
                timestamp: Date.now(),
                props: Object.keys(props),
            });
            return () => {
                // Track when component unmounts
                analytics.trackInteraction(componentName, 'component_unmounted', {
                    timestamp: Date.now(),
                });
            };
        }, [analytics]);
        return <Component {...props}/>;
    };
    WrappedComponent.displayName = `withAnalytics(${componentName})`;
    return WrappedComponent;
}
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
export function useComponentTracking(componentName, metadata) {
    const analytics = useAnalytics();
    useEffect(() => {
        analytics.trackInteraction(componentName, 'component_mounted', {
            timestamp: Date.now(),
            ...metadata,
        });
        return () => {
            analytics.trackInteraction(componentName, 'component_unmounted', {
                timestamp: Date.now(),
            });
        };
    }, [analytics, componentName, metadata]);
}
export default withAnalytics;
//# sourceMappingURL=withAnalytics.jsx.map