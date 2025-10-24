/**
 * Admin Analytics Dashboard
 * Visualizes sign-ups, matches, churn, and other key metrics
 */
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, UsersIcon, HeartIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { InteractiveButton } from '@/components/ui/Interactive';
export default function AdminAnalyticsPage() {
    const { analytics, isLoading, error, fetchAnalytics, dateRange, setDateRange } = useAdminAnalytics();
    const [selectedMetric, setSelectedMetric] = useState('overview');
    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h2>
            <p className="text-red-600">{error}</p>
            <InteractiveButton onClick={fetchAnalytics} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
              Retry
            </InteractiveButton>
          </div>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-white"/>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Monitor key metrics and user behavior</p>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center space-x-4">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <InteractiveButton onClick={fetchAnalytics} variant="outline" icon={<Cog6ToothIcon className="w-4 h-4"/>}>
              Refresh
            </InteractiveButton>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Users" value={analytics?.totalUsers || 0} change={analytics?.userGrowth || 0} icon={UsersIcon} color="blue"/>
          <MetricCard title="Active Users" value={analytics?.activeUsers || 0} change={analytics?.activeUserGrowth || 0} icon={UsersIcon} color="green"/>
          <MetricCard title="Total Matches" value={analytics?.totalMatches || 0} change={analytics?.matchGrowth || 0} icon={HeartIcon} color="pink"/>
          <MetricCard title="Match Rate" value={`${analytics?.matchRate || 0}%`} change={analytics?.matchRateChange || 0} icon={ArrowTrendingUpIcon} color="purple"/>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.userGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="date"/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="New Users"/>
                <Area type="monotone" dataKey="totalUsers" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Total Users"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Match Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.matchActivityData || []}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="date"/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="matches" stroke="#ec4899" strokeWidth={2} name="Matches"/>
                <Line type="monotone" dataKey="likes" stroke="#f59e0b" strokeWidth={2} name="Likes"/>
                <Line type="monotone" dataKey="passes" stroke="#6b7280" strokeWidth={2} name="Passes"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Demographics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analytics?.userDemographics || []} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {(analytics?.userDemographics || []).map((entry, index) => (<Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][index % 4]}/>))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pet Species Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Species</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.petSpeciesData || []}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="species"/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Churn Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.churnData || []}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="date"/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="churnRate" stroke="#ef4444" strokeWidth={2} name="Churn Rate %"/>
                <Line type="monotone" dataKey="retentionRate" stroke="#10b981" strokeWidth={2} name="Retention Rate %"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previous Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Daily Active Users
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics?.dailyActiveUsers || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics?.previousDailyActiveUsers || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(analytics?.dailyActiveUsersChange || 0) >= 0
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'}`}>
                      {(analytics?.dailyActiveUsersChange || 0) >= 0 ? '+' : ''}
                      {analytics?.dailyActiveUsersChange || 0}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Monthly Active Users
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics?.monthlyActiveUsers || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics?.previousMonthlyActiveUsers || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(analytics?.monthlyActiveUsersChange || 0) >= 0
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'}`}>
                      {(analytics?.monthlyActiveUsersChange || 0) >= 0 ? '+' : ''}
                      {analytics?.monthlyActiveUsersChange || 0}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Average Session Duration
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics?.avgSessionDuration || 0}m
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics?.previousAvgSessionDuration || 0}m
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(analytics?.sessionDurationChange || 0) >= 0
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'}`}>
                      {(analytics?.sessionDurationChange || 0) >= 0 ? '+' : ''}
                      {analytics?.sessionDurationChange || 0}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>);
}
// Metric Card Component
function MetricCard({ title, value, change, icon: Icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        pink: 'bg-pink-500',
        purple: 'bg-purple-500'
    };
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {change >= 0 ? (<ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1"/>) : (<ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1"/>)}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 ${colorClasses[color]} rounded-lg`}>
          <Icon className="w-6 h-6 text-white"/>
        </div>
      </div>
    </motion.div>);
}
//# sourceMappingURL=page.jsx.map