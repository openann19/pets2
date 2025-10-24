'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftRightIcon, StarIcon, FireIcon, TrophyIcon, SparklesIcon, } from '@heroicons/react/24/solid';
const iconMap = {
    heart: HeartIcon,
    chat: ChatBubbleLeftRightIcon,
    star: StarIcon,
    fire: FireIcon,
    trophy: TrophyIcon,
    sparkles: SparklesIcon,
};
const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
};
export const AchievementBadges = ({ achievements, onBadgeClick }) => {
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    return (<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Achievements</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {unlockedCount}/{achievements.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }} className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"/>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
            const Icon = iconMap[achievement.icon];
            const rarityColor = rarityColors[achievement.rarity];
            return (<motion.button key={achievement.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} onClick={() => onBadgeClick?.(achievement)} className={`relative aspect-square rounded-xl p-3 transition-all ${achievement.unlocked
                    ? 'bg-gradient-to-br ' + rarityColor + ' shadow-lg hover:scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 opacity-50 hover:opacity-70'}`}>
              {/* Icon */}
              <div className="flex items-center justify-center h-full">
                <Icon className={`w-8 h-8 ${achievement.unlocked ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}/>
              </div>

              {/* Progress Ring */}
              {!achievement.unlocked &&
                    achievement.progress !== undefined &&
                    achievement.maxProgress && (<div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600"/>
                      <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - achievement.progress / achievement.maxProgress)}`} className="text-pink-500"/>
                    </svg>
                  </div>)}

              {/* New Badge Indicator */}
              {achievement.unlocked && achievement.unlockedAt && (<div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>)}

              {/* Rarity Indicator */}
              {achievement.unlocked && (<div className="absolute bottom-1 right-1">
                  {achievement.rarity === 'legendary' && (<SparklesIcon className="w-4 h-4 text-yellow-300"/>)}
                  {achievement.rarity === 'epic' && (<StarIcon className="w-4 h-4 text-purple-300"/>)}
                </div>)}
            </motion.button>);
        })}
      </div>

      {/* Recent Achievements */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Recently Unlocked
        </h4>
        <div className="space-y-2">
          {achievements
            .filter((a) => a.unlocked && a.unlockedAt)
            .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
            .slice(0, 3)
            .map((achievement) => {
            const Icon = iconMap[achievement.icon];
            const rarityColor = rarityColors[achievement.rarity];
            return (<div key={achievement.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rarityColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {achievement.description}
                    </div>
                  </div>
                </div>);
        })}
        </div>
      </div>
    </div>);
};
export default AchievementBadges;
//# sourceMappingURL=AchievementBadges.jsx.map