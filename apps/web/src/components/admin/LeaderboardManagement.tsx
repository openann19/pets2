'use client';
import { useToast } from '@/components/ui/toast';
import { ArrowPathIcon, CalendarIcon, ChartBarIcon, TrophyIcon, UsersIcon, } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
export const LeaderboardManagement = ({ onBack }) => {
    const toast = useToast();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('overall');
    const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetForm, setResetForm] = useState({
        category: '',
        timeframe: '',
        userId: '',
    });
    useEffect(() => {
        fetchLeaderboardData();
    }, [selectedCategory, selectedTimeframe]);
    const fetchLeaderboardData = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                category: selectedCategory,
                timeframe: selectedTimeframe,
            });
            const response = await fetch(`/api/admin/enhanced-features/leaderboard?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        }
        catch (error) {
            logger.error('Failed to fetch leaderboard data:', { error });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleResetLeaderboard = async () => {
        if (!confirm('Are you sure you want to reset the leaderboard? This action cannot be undone.')) {
            return;
        }
        try {
            const response = await fetch('/api/admin/enhanced-features/leaderboard/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(resetForm),
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Leaderboard reset successfully', result.message || 'Scores have been cleared.');
                setShowResetModal(false);
                setResetForm({ category: '', timeframe: '', userId: '' });
                fetchLeaderboardData();
            }
            else {
                toast.error('Failed to reset leaderboard', result.message || 'Please try again.');
            }
        }
        catch (error) {
            logger.error('Failed to reset leaderboard:', { error });
            toast.error('Failed to reset leaderboard', 'An error occurred. Please try again.');
        }
    };
    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500';
            case 3:
                return 'bg-gradient-to-r from-orange-400 to-orange-600';
            default:
                return 'bg-gray-200 dark:bg-gray-600';
        }
    };
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return `#${rank}`;
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Leaderboard Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage leaderboard scores and categories
            </p>
          </div>
        </div>
        <button onClick={() => {
            setShowResetModal(true);
        }} className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          <ArrowPathIcon className="w-5 h-5"/>
          <span>Reset Leaderboard</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select value={selectedCategory} onChange={(e) => {
            setSelectedCategory(e.target.value);
        }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
              <option value="overall">Overall</option>
              <option value="streak">Streak</option>
              <option value="matches">Matches</option>
              <option value="engagement">Engagement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeframe
            </label>
            <select value={selectedTimeframe} onChange={(e) => {
            setSelectedTimeframe(e.target.value);
        }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="allTime">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {data ? (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <TrophyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Top Performers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.topPerformers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.categoryStats.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeframes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.timeframeStats.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Scores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.categoryStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>) : null}

      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Top Performers - {selectedCategory} ({selectedTimeframe})
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {data?.topPerformers.map((performer, index) => (<motion.div key={performer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRankColor(performer.rank)}`}>
                    {getRankIcon(performer.rank)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {performer.userId.firstName} {performer.userId.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {performer.userId.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performer.score.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rank #{performer.rank}</p>
                </div>
              </motion.div>))}
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Statistics
          </h3>
          <div className="space-y-3">
            {data?.categoryStats.map((stat) => (<div key={stat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {stat._id}
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.count} entries
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Avg: {Math.round(stat.avgScore)} | Max: {stat.maxScore}
                  </p>
                </div>
              </div>))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Timeframe Statistics
          </h3>
          <div className="space-y-3">
            {data?.timeframeStats.map((stat) => (<div key={stat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {stat._id}
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.count} entries
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Avg: {Math.round(stat.avgScore)}
                  </p>
                </div>
              </div>))}
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal ? (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Reset Leaderboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action will permanently delete leaderboard scores. Choose what to reset:
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category (optional)
                </label>
                <select value={resetForm.category} onChange={(e) => {
                setResetForm((prev) => ({ ...prev, category: e.target.value }));
            }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option value="">All Categories</option>
                  <option value="overall">Overall</option>
                  <option value="streak">Streak</option>
                  <option value="matches">Matches</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeframe (optional)
                </label>
                <select value={resetForm.timeframe} onChange={(e) => {
                setResetForm((prev) => ({ ...prev, timeframe: e.target.value }));
            }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option value="">All Timeframes</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="allTime">All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID (optional)
                </label>
                <input type="text" value={resetForm.userId} onChange={(e) => {
                setResetForm((prev) => ({ ...prev, userId: e.target.value }));
            }} placeholder="Leave empty to reset all users" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button onClick={() => {
                setShowResetModal(false);
            }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleResetLeaderboard} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>) : null}
    </div>);
};
//# sourceMappingURL=LeaderboardManagement.jsx.map