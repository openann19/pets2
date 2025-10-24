'use client';

import { GlassCard } from '@/components/UI/glass-card';
import { apiClient } from '@pawfectmatch/core/api';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useMemo, useState } from 'react';

interface AnalyticsData {
    summary: {
        totalReports: number;
        totalBlocks: number;
        totalMutes: number;
        avgResolutionTime: number;
    };
    reportsByStatus: Array<{ status: string; count: number }>;
    reportsByType: Array<{ type: string; count: number }>;
    reportsByPriority: Array<{ priority: string; count: number }>;
    reportsByCategory: Array<{ category: string; count: number }>;
    reportsOverTime: Array<{ _id: Record<string, number>; count: number }>;
    topReporters: Array<{ _id: string; reportCount: number }>;
    mostReportedUsers: Array<{ _id: string; reportCount: number }>;
}

export default function ModerationAnalyticsPage() {
    const [dateRange, setDateRange] = useState(30); // days

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'moderation', 'analytics', dateRange],
        queryFn: async () => {
            const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd');
            const res = await apiClient.get<AnalyticsData>(
                `/admin/ai/moderation/analytics?startDate=${startDate}&groupBy=day`
            );
            return res.data;
        },
    });

    const chartData = useMemo(() => {
        if (!data?.reportsOverTime) return [];
        return data.reportsOverTime.map(item => ({
            date: `${item._id['year']}-${String(item._id['month']).padStart(2, '0')}-${String(item._id['day'] || 1).padStart(2, '0')}`,
            count: item.count,
        }));
    }, [data]);

    if (isLoading) return <div className="p-6">Loading analytics...</div>;
    if (!data) return <div className="p-6">No data available</div>;

    const avgResolutionHours = (data.summary.avgResolutionTime / (1000 * 60 * 60)).toFixed(1);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Moderation Analytics</h1>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(Number(e.target.value))}
                    className="bg-white/10 border border-white/20 rounded p-2"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={365}>Last year</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <GlassCard className="p-6">
                    <div className="text-sm text-gray-400">Total Reports</div>
                    <div className="text-3xl font-bold mt-2">{data.summary.totalReports}</div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="text-sm text-gray-400">Total Blocks</div>
                    <div className="text-3xl font-bold mt-2">{data.summary.totalBlocks}</div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="text-sm text-gray-400">Total Mutes</div>
                    <div className="text-3xl font-bold mt-2">{data.summary.totalMutes}</div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="text-sm text-gray-400">Avg Resolution Time</div>
                    <div className="text-3xl font-bold mt-2">{avgResolutionHours}h</div>
                </GlassCard>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Reports by Status */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Reports by Status</h2>
                    <div className="space-y-3">
                        {data.reportsByStatus.map((item) => {
                            const percentage = (item.count / data.summary.totalReports) * 100;
                            return (
                                <div key={item.status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize">{item.status}</span>
                                        <span>{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                {/* Reports by Type */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Reports by Type</h2>
                    <div className="space-y-3">
                        {data.reportsByType.map((item) => {
                            const percentage = (item.count / data.summary.totalReports) * 100;
                            return (
                                <div key={item.type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize">{item.type.replace('_', ' ')}</span>
                                        <span>{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-pink-500 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                {/* Reports Over Time */}
                <GlassCard className="p-6 md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Reports Over Time</h2>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {chartData.map((item, index) => {
                            const maxCount = Math.max(...chartData.map(d => d.count));
                            const height = (item.count / maxCount) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                                        title={`${item.date}: ${item.count} reports`}
                                    />
                                    {index % Math.ceil(chartData.length / 10) === 0 && (
                                        <span className="text-xs mt-2 transform rotate-45">{item.date.slice(5)}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                {/* Top Reporters */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Top Reporters</h2>
                    <div className="space-y-2">
                        {data.topReporters.slice(0, 5).map((item, index) => (
                            <div key={item._id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                                <span className="text-sm">#{index + 1} User {item._id.slice(-8)}</span>
                                <span className="font-semibold">{item.reportCount}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Most Reported Users */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Most Reported Users</h2>
                    <div className="space-y-2">
                        {data.mostReportedUsers.slice(0, 5).map((item, index) => (
                            <div key={item._id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                                <span className="text-sm">#{index + 1} User {item._id.slice(-8)}</span>
                                <span className="font-semibold text-red-400">{item.reportCount}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
