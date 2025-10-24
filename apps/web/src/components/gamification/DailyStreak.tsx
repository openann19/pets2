'use client';
import React from 'react';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
export const DailyStreak = ({ currentStreak, longestStreak, lastCheckIn }) => {
    const isActiveToday = lastCheckIn
        ? new Date(lastCheckIn).toDateString() === new Date().toDateString()
        : false;
    const getStreakLevel = (streak) => {
        if (streak >= 30)
            return { level: 'Legend', color: 'from-purple-500 to-pink-500' };
        if (streak >= 14)
            return { level: 'Master', color: 'from-orange-500 to-red-500' };
        if (streak >= 7)
            return { level: 'Pro', color: 'from-yellow-500 to-orange-500' };
        if (streak >= 3)
            return { level: 'Rising', color: 'from-green-500 to-teal-500' };
        return { level: 'Beginner', color: 'from-blue-500 to-cyan-500' };
    };
    const { level, color } = getStreakLevel(currentStreak);
    return (<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Streak</h3>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${color} text-white text-xs font-semibold`}>
          {level}
        </div>
      </div>

      {/* Current Streak */}
      <div className="flex items-center justify-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${color} flex items-center justify-center shadow-xl`}>
            <div className="bg-white dark:bg-gray-800 w-28 h-28 rounded-full flex flex-col items-center justify-center">
              <FireIcon className={`w-12 h-12 bg-gradient-to-r ${color} bg-clip-text text-transparent`}/>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentStreak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">days</div>
            </div>
          </div>
          {isActiveToday && (<motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✓</span>
            </motion.div>)}
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{longestStreak}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Best Streak</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.floor(currentStreak / 7)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Weeks</div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Next milestone</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentStreak >= 30 ? '30+ days!' : `${Math.ceil(currentStreak / 7) * 7} days`}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(currentStreak % 7) * (100 / 7)}%` }} className={`h-2 rounded-full bg-gradient-to-r ${color}`}/>
        </div>
      </div>

      {/* Encouragement */}
      {!isActiveToday && (<div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            🔥 Don't break your streak! Check in today
          </p>
        </div>)}
    </div>);
};
export default DailyStreak;
//# sourceMappingURL=DailyStreak.jsx.map