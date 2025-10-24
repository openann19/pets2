/**
 * 📊 ADVANCED ANALYTICS SYSTEM
 * Comprehensive user behavior tracking and performance monitoring
 */
declare class AdvancedAnalytics {
    private sessionId;
    private userId;
    private pageStartTime;
    private userBehavior;
    private performanceMetrics;
    private queue;
    private isOnline;
    constructor();
    private generateSessionId;
    private initializeTracking;
    private startPerformanceMonitoring;
    setUserId(userId: string): void;
    trackSwipe(direction: 'like' | 'pass' | 'superlike', petId: string): void;
    trackMessage(matchId: string, messageLength: number): void;
    trackPageView(page: string, duration?: number): void;
    trackInteraction(element: string, action: string, metadata?: Record<string, any>): void;
    trackAIUsage(feature: string, success: boolean, duration?: number, metadata?: Record<string, any>): void;
    trackPremiumFeatureAttempt(feature: string, hasAccess: boolean): void;
    trackMatchSuccess(matchId: string, compatibilityScore?: number): void;
    trackApiCall(endpoint: string, duration: number, status: number): void;
    trackError(error: Error, context?: Record<string, any>): void;
    private track;
    private sendEvent;
    private flushQueue;
    private getConnectionType;
    generateUserBehaviorReport(): {
        session: {
            id: string;
            duration: number;
            userId: string | null;
        };
        last24Hours: {
            swipes: {
                total: number;
                likes: number;
                passes: number;
                superLikes: number;
            };
            messages: number;
            pageViews: number;
            averageSessionTime: number;
        };
        engagement: {
            swipeRate: number;
            messageRate: number;
            retentionScore: number;
        };
    };
    generatePerformanceReport(): {
        sessionId: string;
        timestamp: number;
        metrics: {
            averageApiResponseTime: number;
            errorRate: number;
            memoryTrend: "stable" | "increasing" | "decreasing";
            slowRequests: number;
        };
        recommendations: string[];
    };
    private calculateRetentionScore;
    private calculateAverageApiTime;
    private calculateErrorRate;
    private calculateMemoryTrend;
    private generatePerformanceRecommendations;
}
export declare const getAnalytics: () => AdvancedAnalytics;
export declare const useAnalytics: () => {
    trackSwipe: (direction: "like" | "pass" | "superlike", petId: string) => void;
    trackMessage: (matchId: string, messageLength: number) => void;
    trackInteraction: (element: string, action: string, metadata?: Record<string, any>) => void;
    trackAIUsage: (feature: string, success: boolean, duration?: number, metadata?: Record<string, any>) => void;
    trackPremiumFeatureAttempt: (feature: string, hasAccess: boolean) => void;
    trackMatchSuccess: (matchId: string, compatibilityScore?: number) => void;
    trackApiCall: (endpoint: string, duration: number, status: number) => void;
    generateReport: () => {
        behavior: {
            session: {
                id: string;
                duration: number;
                userId: string | null;
            };
            last24Hours: {
                swipes: {
                    total: number;
                    likes: number;
                    passes: number;
                    superLikes: number;
                };
                messages: number;
                pageViews: number;
                averageSessionTime: number;
            };
            engagement: {
                swipeRate: number;
                messageRate: number;
                retentionScore: number;
            };
        };
        performance: {
            sessionId: string;
            timestamp: number;
            metrics: {
                averageApiResponseTime: number;
                errorRate: number;
                memoryTrend: "stable" | "increasing" | "decreasing";
                slowRequests: number;
            };
            recommendations: string[];
        };
    };
    setUserId: (userId: string) => void;
};
export declare const trackAPIPerformance: (originalFetch: typeof fetch) => (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export { AdvancedAnalytics };
export default getAnalytics;
//# sourceMappingURL=analytics-system.d.ts.map