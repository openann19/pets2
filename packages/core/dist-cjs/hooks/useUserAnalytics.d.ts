/**
 * User Analytics Hook
 * Tracks user behavior and provides analytics data
 */
export interface UserAnalytics {
    totalSwipes: number;
    totalLikes: number;
    totalMatches: number;
    profileViews: number;
    messagesReceived: number;
    messagesSent: number;
    averageResponseTime: number;
    activeTime: number;
    lastActive: Date;
    swipeAccuracy: number;
    popularityScore: number;
}
export interface AnalyticsTimeframe {
    daily: UserAnalytics;
    weekly: UserAnalytics;
    monthly: UserAnalytics;
    allTime: UserAnalytics;
}
interface UseUserAnalyticsOptions {
    userId?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
interface UseUserAnalyticsReturn {
    analytics: AnalyticsTimeframe | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}
/**
 * Hook to fetch and track user analytics
 */
export declare function useUserAnalytics(options?: UseUserAnalyticsOptions): UseUserAnalyticsReturn;
export {};
