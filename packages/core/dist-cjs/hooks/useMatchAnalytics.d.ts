/**
 * Match Analytics Hook
 * Tracks match-related analytics and insights
 */
export interface MatchInsights {
    totalMatches: number;
    activeConversations: number;
    averageMatchScore: number;
    topMatchedBreeds: Array<{
        breed: string;
        count: number;
    }>;
    matchSuccessRate: number;
    averageTimeToMatch: number;
    peakMatchingHours: number[];
    geographicDistribution: Array<{
        location: string;
        count: number;
    }>;
}
export interface MatchTrends {
    daily: number[];
    weekly: number[];
    monthly: number[];
}
interface UseMatchAnalyticsOptions {
    userId?: string;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all';
}
interface UseMatchAnalyticsReturn {
    insights: MatchInsights | null;
    trends: MatchTrends | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}
/**
 * Hook to fetch match analytics and insights
 */
export declare function useMatchAnalytics(options?: UseMatchAnalyticsOptions): UseMatchAnalyticsReturn;
export {};
//# sourceMappingURL=useMatchAnalytics.d.ts.map