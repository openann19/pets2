export interface AnalyticsEvent {
    event_name: string;
    user_id?: string;
    timestamp: string;
    properties: Record<string, unknown>;
}
export interface UserAnalytics {
    profile_views: number;
    match_rate: number;
    active_days: number;
    messages_sent: number;
    messages_received: number;
    time_spent: number;
    average_response_time: number;
    daily_stats: {
        date: string;
        views: number;
        matches: number;
        messages: number;
    }[];
}
export interface MatchAnalytics {
    total_matches: number;
    active_conversations: number;
    conversion_rate: number;
    average_response_time: number;
    messages_per_match: number;
    match_quality_score: number;
    match_sources: {
        source: string;
        count: number;
        percentage: number;
    }[];
    match_by_pet_type: {
        pet_type: string;
        count: number;
        percentage: number;
    }[];
}
export interface PerformanceMetrics {
    responseTime: number;
    activeUsers: number;
    serverLoad: number;
    uptime: number;
    errorRate: number;
}
export declare class AnalyticsService {
    private events;
    private flushInterval;
    private isInitialized;
    /**
     * Initialize the analytics service
     */
    initialize(userId?: string): void;
    /**
     * Clean up the analytics service
     */
    dispose(): void;
    /**
     * Track an event
     */
    trackEvent(eventName: string, properties?: Record<string, unknown>): void;
    /**
     * Track a page view
     */
    private trackPageView;
    /**
     * Send events to the server
     */
    private flushEvents;
    /**
     * Get user analytics
     */
    getUserAnalytics(userId: string, period?: 'day' | 'week' | 'month' | 'year'): Promise<UserAnalytics>;
    /**
     * Get match analytics
     */
    getMatchAnalytics(userId: string, period?: 'day' | 'week' | 'month' | 'year'): Promise<MatchAnalytics>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): Promise<PerformanceMetrics>;
}
declare const analyticsService: AnalyticsService;
export default analyticsService;
//# sourceMappingURL=AnalyticsService.d.ts.map