'use client';
import React, { useState } from 'react';
import { TrophyIcon, FireIcon, HeartIcon, ChatBubbleLeftRightIcon, } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
export const Leaderboard = ({ entries, category, timeframe, onCategoryChange, onTimeframeChange, }) => {
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
    const categories = [
        { id: 'overall', label: 'Overall', icon: TrophyIcon },
        { id: 'streak', label: 'Streak', icon: FireIcon },
        { id: 'matches', label: 'Matches', icon: HeartIcon },
        { id: 'engagement', label: 'Engagement', icon: ChatBubbleLeftRightIcon },
    ];
    const timeframes = [
        { id: 'daily', label: 'Today' },
        { id: 'weekly', label: 'This Week' },
        { id: 'monthly', label: 'This Month' },
        { id: 'allTime', label: 'All Time' },
    ];
    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        onCategoryChange?.(cat);
    };
    const handleTimeframeChange = (tf) => {
        setSelectedTimeframe(tf);
        onTimeframeChange?.(tf);
    };
    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'from-yellow-400 to-yellow-600';
            case 2:
                return 'from-gray-300 to-gray-500';
            case 3:
                return 'from-orange-400 to-orange-600';
            default:
                return 'from-gray-200 to-gray-400';
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
    return (<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          <TrophyIcon className="w-8 h-8 text-yellow-300"/>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (<button key={cat.id} onClick={() => { handleCategoryChange(cat.id); }} className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat.id
                    ? 'bg-white text-pink-600'
                    : 'bg-white/20 text-white hover:bg-white/30'}`}>
                <Icon className="w-4 h-4"/>
                <span className="text-sm font-medium">{cat.label}</span>
              </button>);
        })}
        </div>
      </div>

      {/* Timeframe Filter */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          {timeframes.map((tf) => (<button key={tf.id} onClick={() => { handleTimeframeChange(tf.id); }} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${selectedTimeframe === tf.id
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>
              {tf.label}
            </button>))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (<div className="p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800">
          <div className="flex items-end justify-center space-x-4">
            {/* 2nd Place */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {entries[1]?.avatar ? (<img src={entries[1].avatar} alt={entries[1]?.username} className="w-full h-full object-cover"/>) : (<span className="text-2xl">🐾</span>)}
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-2xl">
                  🥈
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {entries[1]?.username}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {entries[1]?.score.toLocaleString()}
                </div>
              </div>
              <div className="mt-2 h-20 w-20 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg"/>
            </motion.div>

            {/* 1st Place */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {entries[0]?.avatar ? (<img src={entries[0].avatar} alt={entries[0]?.username} className="w-full h-full object-cover"/>) : (<span className="text-3xl">🐾</span>)}
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-3xl">
                  🥇
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {entries[0]?.username}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {entries[0]?.score.toLocaleString()}
                </div>
              </div>
              <div className="mt-2 h-28 w-20 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg"/>
            </motion.div>

            {/* 3rd Place */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {entries[2]?.avatar ? (<img src={entries[2].avatar} alt={entries[2]?.username} className="w-full h-full object-cover"/>) : (<span className="text-2xl">🐾</span>)}
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-2xl">
                  🥉
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {entries[2]?.username}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {entries[2]?.score.toLocaleString()}
                </div>
              </div>
              <div className="mt-2 h-16 w-20 bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-lg"/>
            </motion.div>
          </div>
        </div>)}

      {/* Rest of Leaderboard */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {entries.slice(3).map((entry, index) => (<motion.div key={entry.userId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${entry.isCurrentUser ? 'bg-pink-50 dark:bg-pink-900/20 border-l-4 border-pink-500' : ''}`}>
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(entry.rank)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold">{getRankIcon(entry.rank)}</span>
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {entry.avatar ? (<img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover"/>) : (<span className="text-xl">🐾</span>)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {entry.username}
                  </div>
                  {entry.isCurrentUser && (<span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                      You
                    </span>)}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  {entry.streak && (<span className="flex items-center space-x-1">
                      <FireIcon className="w-4 h-4 text-orange-500"/>
                      <span>{entry.streak}</span>
                    </span>)}
                  {entry.matches && (<span className="flex items-center space-x-1">
                      <HeartIcon className="w-4 h-4 text-pink-500"/>
                      <span>{entry.matches}</span>
                    </span>)}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
              </div>
            </div>
          </motion.div>))}
      </div>

      {/* Empty State */}
      {entries.length === 0 && (<div className="p-12 text-center">
          <TrophyIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
          <div className="text-gray-600 dark:text-gray-400">No entries yet. Be the first!</div>
        </div>)}
    </div>);
};
export default Leaderboard;
//# sourceMappingURL=Leaderboard.jsx.map