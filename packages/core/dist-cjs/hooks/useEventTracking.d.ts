/**
 * Event Tracking Hook
 * Tracks user events and interactions for analytics
 */
export interface TrackEventOptions {
    category: string;
    action: string;
    label?: string;
    value?: number;
    metadata?: Record<string, unknown>;
}
export interface UseEventTrackingReturn {
    trackEvent: (options: TrackEventOptions) => Promise<void>;
    trackPageView: (pageName: string, metadata?: Record<string, unknown>) => Promise<void>;
    trackSwipe: (action: 'like' | 'pass' | 'superlike', petId: string) => Promise<void>;
    trackMatch: (matchId: string, petId: string) => Promise<void>;
    trackMessage: (matchId: string, messageLength: number) => Promise<void>;
    trackProfileView: (profileId: string, duration?: number) => Promise<void>;
}
/**
 * Hook for tracking user events and interactions
 */
export declare function useEventTracking(): UseEventTrackingReturn;
//# sourceMappingURL=useEventTracking.d.ts.map