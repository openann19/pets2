class AnalyticsService {
    async getUserAnalytics(userId) {
        return {
            totalSwipes: 0,
            totalMatches: 0,
            totalMessages: 0,
            profileViews: 0,
            metrics: {
                profileViews: 0,
                swipesReceived: 0,
                matchesCreated: 0,
                messagesExchanged: 0,
                videoCalls: 0,
                successRate: 0,
            },
            trends: {
                viewsChange: 0,
                matchesChange: 0,
                engagementChange: 0,
            },
            insights: [],
        };
    }
    async getMatchAnalytics(userId) {
        return {
            matchRate: 0,
            averageResponseTime: 0,
            popularTimes: [],
            totalMatches: 0,
            successfulMeetups: 0,
        };
    }
}
export const analyticsService = new AnalyticsService();
//# sourceMappingURL=analytics-service.js.map