'use client';
import React, { useState, useEffect } from 'react';
import { logger } from '@pawfectmatch/core';
;
import { FingerPrintIcon, TrophyIcon, BellIcon, } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
export const EnhancedFeaturesOverview = ({ onNavigate }) => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchOverviewStats();
    }, []);
    const fetchOverviewStats = async () => {
        try {
            const response = await fetch('/api/admin/enhanced-features/overview', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        }
        catch (error) {
            logger.error('Failed to fetch overview stats:', { error });
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    if (!stats) {
        return (<div className="text-center py-20">
        <p className="text-gray-500">Failed to load enhanced features overview</p>
      </div>);
    }
    const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick, }) => (<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:shadow-xl ${onClick ? 'hover:border-pink-300' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white"/>
        </div>
      </div>
    </motion.div>);
    return (<div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🌟 Enhanced Features 2025
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage biometric authentication, leaderboard, and smart notifications
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Biometric Authentication" value={`${stats.biometric.adoptionRate}%`} subtitle={`${stats.biometric.biometricUsers} of ${stats.biometric.totalUsers} users`} icon={FingerPrintIcon} color="bg-gradient-to-r from-blue-500 to-blue-600" onClick={() => onNavigate('biometric')}/>

        <StatCard title="Leaderboard System" value={stats.leaderboard.totalScores} subtitle={`${stats.leaderboard.categories.length} categories, ${stats.leaderboard.timeframes.length} timeframes`} icon={TrophyIcon} color="bg-gradient-to-r from-yellow-500 to-yellow-600" onClick={() => onNavigate('leaderboard')}/>

        <StatCard title="Smart Notifications" value={`${stats.notifications.adoptionRate}%`} subtitle={`${stats.notifications.enabledUsers} enabled, ${stats.notifications.quietHoursUsers} quiet hours`} icon={BellIcon} color="bg-gradient-to-r from-green-500 to-green-600" onClick={() => onNavigate('notifications')}/>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Biometric Registrations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FingerPrintIcon className="w-5 h-5 text-blue-500 mr-2"/>
              Biometric Registrations
            </h3>
            <div className="space-y-3">
              {stats.recentActivity.biometric.slice(0, 5).map((item, index) => (<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {item.userId?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.userId?.firstName} {item.userId?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>))}
            </div>
          </div>

          {/* Recent Leaderboard Updates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2"/>
              Leaderboard Updates
            </h3>
            <div className="space-y-3">
              {stats.recentActivity.leaderboard.slice(0, 5).map((item, index) => (<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      {item.userId?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.userId?.firstName} {item.userId?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.score} points • {item.category}
                    </p>
                  </div>
                </div>))}
            </div>
          </div>

          {/* Recent Notification Updates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BellIcon className="w-5 h-5 text-green-500 mr-2"/>
              Notification Updates
            </h3>
            <div className="space-y-3">
              {stats.recentActivity.notifications.slice(0, 5).map((item, index) => (<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      {item.userId?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.userId?.firstName} {item.userId?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.enabled ? 'Enabled' : 'Disabled'} • {item.frequency}
                    </p>
                  </div>
                </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => onNavigate('biometric')} className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <FingerPrintIcon className="w-5 h-5 text-blue-500"/>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Manage Biometric Auth
            </span>
          </button>

          <button onClick={() => onNavigate('leaderboard')} className="flex items-center justify-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
            <TrophyIcon className="w-5 h-5 text-yellow-500"/>
            <span className="font-medium text-yellow-700 dark:text-yellow-300">
              Manage Leaderboard
            </span>
          </button>

          <button onClick={() => onNavigate('notifications')} className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <BellIcon className="w-5 h-5 text-green-500"/>
            <span className="font-medium text-green-700 dark:text-green-300">
              Manage Notifications
            </span>
          </button>
        </div>
      </div>
    </div>);
};
//# sourceMappingURL=EnhancedFeaturesOverview.jsx.map