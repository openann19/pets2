/**
 * Admin Analytics Hook
 * Fetches and manages analytics data for admin dashboard
 */
export interface AnalyticsData {
    totalUsers: number;
    activeUsers: number;
    totalMatches: number;
    matchRate: number;
    userGrowth: number;
    activeUserGrowth: number;
    matchGrowth: number;
    matchRateChange: number;
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    avgSessionDuration: number;
    previousDailyActiveUsers: number;
    previousMonthlyActiveUsers: number;
    previousAvgSessionDuration: number;
    dailyActiveUsersChange: number;
    monthlyActiveUsersChange: number;
    sessionDurationChange: number;
    userGrowthData: Array<{
        date: string;
        newUsers: number;
        totalUsers: number;
    }>;
    matchActivityData: Array<{
        date: string;
        matches: number;
        likes: number;
        passes: number;
    }>;
    userDemographics: Array<{
        name: string;
        value: number;
    }>;
    petSpeciesData: Array<{
        species: string;
        count: number;
    }>;
    churnData: Array<{
        date: string;
        churnRate: number;
        retentionRate: number;
    }>;
}
export type DateRange = '7d' | '30d' | '90d' | '1y';
export declare function useAdminAnalytics(): {
    analytics: AnalyticsData | null;
    isLoading: boolean;
    error: string | null;
    dateRange: DateRange;
    setDateRange: import("react").Dispatch<import("react").SetStateAction<DateRange>>;
    fetchAnalytics: () => Promise<void>;
};
//# sourceMappingURL=useAdminAnalytics.d.ts.map