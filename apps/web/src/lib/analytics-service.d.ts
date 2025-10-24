export interface UserAnalytics {
    totalSwipes: number;
    totalMatches: number;
    totalMessages: number;
    profileViews: number;
    metrics?: {
        profileViews: number;
        swipesReceived: number;
        matchesCreated: number;
        messagesExchanged: number;
        videoCalls: number;
        successRate: number;
    };
    trends?: {
        viewsChange: number;
        matchesChange: number;
        engagementChange: number;
    };
    insights?: Array<{
        type: string;
        message: string;
        impact: 'positive' | 'negative' | 'neutral';
    }>;
}
export interface MatchAnalytics {
    matchRate: number;
    averageResponseTime: number;
    popularTimes: string[];
    totalMatches: number;
    successfulMeetups: number;
}
declare class AnalyticsService {
    getUserAnalytics(userId: string): Promise<UserAnalytics>;
    getMatchAnalytics(userId: string): Promise<MatchAnalytics>;
}
export declare const analyticsService: AnalyticsService;
export {};
//# sourceMappingURL=analytics-service.d.ts.map