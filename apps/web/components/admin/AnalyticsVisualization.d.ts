interface AnalyticsData {
    users: {
        total: number;
        active: number;
        suspended: number;
        banned: number;
        verified: number;
        recent24h: number;
        growth: number;
        trend: 'up' | 'down' | 'stable';
    };
    pets: {
        total: number;
        active: number;
        recent24h: number;
        growth: number;
        trend: 'up' | 'down' | 'stable';
    };
    matches: {
        total: number;
        active: number;
        blocked: number;
        recent24h: number;
        growth: number;
        trend: 'up' | 'down' | 'stable';
    };
    messages: {
        total: number;
        deleted: number;
        recent24h: number;
        growth: number;
        trend: 'up' | 'down' | 'stable';
    };
    engagement: {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
        bounceRate: number;
        retentionRate: number;
    };
    revenue: {
        totalRevenue: number;
        monthlyRecurringRevenue: number;
        averageRevenuePerUser: number;
        conversionRate: number;
        churnRate: number;
    };
    timeSeries: Array<{
        date: string;
        users: number;
        pets: number;
        matches: number;
        messages: number;
        revenue: number;
        engagement: number;
    }>;
    topPerformers: Array<{
        id: string;
        name: string;
        type: 'user' | 'pet';
        score: number;
        metric: string;
    }>;
    geographicData: Array<{
        country: string;
        users: number;
        revenue: number;
        growth: number;
    }>;
    deviceStats: Array<{
        device: string;
        count: number;
        percentage: number;
    }>;
    securityMetrics: {
        totalAlerts: number;
        criticalAlerts: number;
        resolvedAlerts: number;
        averageResponseTime: number;
    };
}
interface AnalyticsVisualizationProps {
    data: AnalyticsData;
    isLoading?: boolean;
    onRefresh?: () => void;
    onExport?: (format: 'csv' | 'pdf' | 'json') => void;
}
export default function AnalyticsVisualization({ data, isLoading, onRefresh, onExport, }: AnalyticsVisualizationProps): JSX.Element;
export {};
//# sourceMappingURL=AnalyticsVisualization.d.ts.map