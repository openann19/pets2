/**
 * Admin Analytics Hook
 * Fetches and manages analytics data for admin dashboard
 */
import { useState, useEffect } from 'react';
import { logger } from '@/services/logger';
export function useAdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('30d');
    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch analytics: ${response.status}`);
            }
            const data = await response.json();
            setAnalytics(data.analytics);
        }
        catch (error) {
            logger.error('Failed to fetch analytics', error);
            setError(error.message);
            // Set fallback data for development
            setAnalytics(getFallbackAnalytics());
        }
        finally {
            setIsLoading(false);
        }
    };
    const getFallbackAnalytics = () => {
        const now = new Date();
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
        return {
            totalUsers: 12543,
            activeUsers: 8932,
            totalMatches: 4567,
            matchRate: 23.5,
            userGrowth: 12.3,
            activeUserGrowth: 8.7,
            matchGrowth: 15.2,
            matchRateChange: 2.1,
            dailyActiveUsers: 2341,
            monthlyActiveUsers: 8932,
            avgSessionDuration: 8.5,
            previousDailyActiveUsers: 2156,
            previousMonthlyActiveUsers: 8234,
            previousAvgSessionDuration: 7.8,
            dailyActiveUsersChange: 8.6,
            monthlyActiveUsersChange: 8.5,
            sessionDurationChange: 9.0,
            userGrowthData: Array.from({ length: days }, (_, i) => {
                const date = new Date(now);
                date.setDate(date.getDate() - (days - i - 1));
                return {
                    date: date.toISOString().split('T')[0],
                    newUsers: Math.floor(Math.random() * 50) + 20,
                    totalUsers: 10000 + (i * 15) + Math.floor(Math.random() * 100)
                };
            }),
            matchActivityData: Array.from({ length: days }, (_, i) => {
                const date = new Date(now);
                date.setDate(date.getDate() - (days - i - 1));
                return {
                    date: date.toISOString().split('T')[0],
                    matches: Math.floor(Math.random() * 200) + 50,
                    likes: Math.floor(Math.random() * 1000) + 300,
                    passes: Math.floor(Math.random() * 800) + 200
                };
            }),
            userDemographics: [
                { name: '18-25', value: 25 },
                { name: '26-35', value: 35 },
                { name: '36-45', value: 20 },
                { name: '46+', value: 20 }
            ],
            petSpeciesData: [
                { species: 'Dogs', count: 65 },
                { species: 'Cats', count: 25 },
                { species: 'Birds', count: 5 },
                { species: 'Other', count: 5 }
            ],
            churnData: Array.from({ length: days }, (_, i) => {
                const date = new Date(now);
                date.setDate(date.getDate() - (days - i - 1));
                return {
                    date: date.toISOString().split('T')[0],
                    churnRate: Math.random() * 5 + 2,
                    retentionRate: Math.random() * 10 + 85
                };
            })
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