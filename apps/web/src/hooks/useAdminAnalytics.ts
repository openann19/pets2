/**
 * Admin Analytics Hook
 * Fetches and manages analytics data for admin dashboard
 */
import { useState, useEffect } from 'react';
import { logger } from '@/services/logger';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  matches: {
    total: number;
    active: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  messages: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    conversionRate: number;
    churnRate: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    retentionRate: number;
  };
  security: {
    suspiciousLogins: number;
    blockedIPs: number;
    reportedContent: number;
    bannedUsers: number;
  };
  topPerformers?: {
    users: Array<{
      id: string;
      name: string;
      matches: number;
      messages: number;
    }>;
    pets: Array<{
      id: string;
      name: string;
      breed: string;
      likes: number;
      matches: number;
    }>;
  };
}

export function useAdminAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState('30d');
    
    const getTrendFromGrowth = (growth: number): 'up' | 'down' | 'stable' => {
        if (growth > 0.1) return 'up';
        if (growth < -0.1) return 'down';
        return 'stable';
    };
    
    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Use backend API endpoint for real MongoDB data
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('accessToken') || localStorage.getItem('admin-token');
            
            const response = await fetch(`${apiUrl}/api/admin/analytics`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch analytics: ${response.status}`);
            }
            const data = await response.json();
            
            // Transform backend data to match frontend format
            if (data.success && data.analytics) {
                const analyticsData = data.analytics;
                const userGrowth = analyticsData.users?.growth || 0;
                const matchGrowth = analyticsData.matches?.growth || 0;
                const messageGrowth = analyticsData.messages?.growth || 0;
                
                setAnalytics({
                    users: {
                        total: analyticsData.users?.total || 0,
                        active: analyticsData.users?.active || 0,
                        growth: userGrowth,
                        trend: getTrendFromGrowth(userGrowth),
                    },
                    matches: {
                        total: analyticsData.matches?.total || 0,
                        active: analyticsData.matches?.active || 0,
                        growth: matchGrowth,
                        trend: getTrendFromGrowth(matchGrowth),
                    },
                    messages: {
                        total: analyticsData.messages?.total || 0,
                        growth: messageGrowth,
                        trend: getTrendFromGrowth(messageGrowth),
                    },
                    revenue: {
                        totalRevenue: analyticsData.revenue?.totalRevenue || 0,
                        monthlyRecurringRevenue: analyticsData.revenue?.monthlyRecurringRevenue || 0,
                        averageRevenuePerUser: analyticsData.revenue?.averageRevenuePerUser || 0,
                        conversionRate: analyticsData.revenue?.conversionRate || 0,
                        churnRate: analyticsData.revenue?.churnRate || 0,
                    },
                    engagement: {
                    dailyActiveUsers: analyticsData.engagement?.dailyActiveUsers || 0,
                        weeklyActiveUsers: analyticsData.engagement?.weeklyActiveUsers || 0,
                    monthlyActiveUsers: analyticsData.engagement?.monthlyActiveUsers || 0,
                        averageSessionDuration: analyticsData.engagement?.averageSessionDuration || analyticsData.engagement?.averageSession || 0,
                        bounceRate: analyticsData.engagement?.bounceRate || 0,
                        retentionRate: analyticsData.engagement?.retentionRate || 0,
                    },
                    security: {
                        suspiciousLogins: analyticsData.security?.suspiciousLogins || 0,
                        blockedIPs: analyticsData.security?.blockedIPs || 0,
                        reportedContent: analyticsData.security?.reportedContent || 0,
                        bannedUsers: analyticsData.security?.bannedUsers || 0,
                    },
                    topPerformers: analyticsData.topPerformers,
                });
            } else {
                throw new Error('Invalid analytics response');
            }
        }
        catch (error) {
            logger.error('Failed to fetch analytics', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
            // Set fallback data for development
            setAnalytics(getFallbackAnalytics());
        }
        finally {
            setIsLoading(false);
        }
    };
    
    const getFallbackAnalytics = (): AnalyticsData => {
        const now = new Date();
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
        
        return {
            users: {
                total: 12543,
                active: 8932,
                growth: 12.3,
                trend: 'up',
            },
            matches: {
                total: 4567,
                active: 3500,
                growth: 15.2,
                trend: 'up',
            },
            messages: {
                total: 89234,
                growth: 8.5,
                trend: 'up',
            },
            revenue: {
                totalRevenue: 125000,
                monthlyRecurringRevenue: 45000,
                averageRevenuePerUser: 9.95,
                conversionRate: 23.5,
                churnRate: 2.1,
            },
            engagement: {
            dailyActiveUsers: 2341,
                weeklyActiveUsers: 6543,
            monthlyActiveUsers: 8932,
                averageSessionDuration: 510, // seconds
                bounceRate: 15.2,
                retentionRate: 85.5,
            },
            security: {
                suspiciousLogins: 12,
                blockedIPs: 5,
                reportedContent: 23,
                bannedUsers: 8,
            },
        };
    };
    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);
    return {
        analytics,
        isLoading,
        error,
        dateRange,
        setDateRange,
        fetchAnalytics
    };
}
//# sourceMappingURL=useAdminAnalytics.js.map