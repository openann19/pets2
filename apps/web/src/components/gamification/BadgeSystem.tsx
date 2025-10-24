/**
 * Badge System Component
 * Displays user badges, streaks, and achievements
 */
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, StarIcon, SparklesIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useGamification, Badge, Streak } from '@/services/gamification';
import { InteractiveButton } from '@/components/ui/Interactive';
export function BadgeSystem({ userId, className = '', showStreaks = true, showLevel = true }) {
    const { gamification, isLoading, newBadges, clearNewBadges, calculateLevel, getLevelProgress } = useGamification(userId);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showBadgeDetails, setShowBadgeDetails] = useState(null);
    const categories = [
        { id: 'all', label: 'All', icon: TrophyIcon },
        { id: 'swipe', label: 'Swiping', icon: FireIcon },
        { id: 'match', label: 'Matching', icon: StarIcon },
        { id: 'chat', label: 'Chatting', icon: SparklesIcon },
        { id: 'profile', label: 'Profile', icon: TrophyIcon },
        { id: 'social', label: 'Social', icon: SparklesIcon },
        { id: 'premium', label: 'Premium', icon: StarIcon }
    ];
    const filteredBadges = selectedCategory === 'all'
        ? gamification?.badges || []
        : gamification?.badges?.filter(badge => badge.category === selectedCategory) || [];
    const getRarityColor = (rarity) => {
        const colors = {
            common: 'bg-gray-100 text-gray-800 border-gray-300',
            rare: 'bg-blue-100 text-blue-800 border-blue-300',
            epic: 'bg-purple-100 text-purple-800 border-purple-300',
            legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
        return colors[rarity] || colors.common;
    };
    const getRarityGlow = (rarity) => {
        const glows = {
            common: 'shadow-gray-200',
            rare: 'shadow-blue-200',
            epic: 'shadow-purple-200',
            legendary: 'shadow-yellow-200'
        };
        return glows[rarity] || glows.common;
    };
    if (isLoading) {
        return (<div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (<div key={i} className="h-16 bg-gray-200 rounded-lg"></div>))}
          </div>
        </div>
      </div>);
    }
    return (<div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <TrophyIcon className="w-6 h-6 text-white"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
            {showLevel && gamification && (<div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Level {calculateLevel(gamification.totalPoints)}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300" style={{ width: `${getLevelProgress(gamification.totalPoints).percentage}%` }}/>
                </div>
              </div>)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {gamification?.totalPoints || 0}
          </div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>
      </div>

      {/* Streaks */}
      {showStreaks && gamification?.streaks && gamification.streaks.length > 0 && (<div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Streaks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gamification.streaks.map((streak) => (<StreakCard key={streak.type} streak={streak}/>))}
          </div>
        </div>)}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => {
            const Icon = category.icon;
            return (<button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}>
              <Icon className="w-4 h-4"/>
              <span>{category.label}</span>
            </button>);
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBadges.map((badge) => (<motion.div key={badge.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`
              relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${badge.unlockedAt
                ? `${getRarityColor(badge.rarity)} shadow-lg ${getRarityGlow(badge.rarity)}`
                : 'bg-gray-100 text-gray-400 border-gray-200'}
            `} onClick={() => setShowBadgeDetails(badge)}>
            {/* Badge Icon */}
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium truncate">{badge.name}</div>
            </div>

            {/* Progress Bar */}
            {badge.progress !== undefined && badge.maxProgress && (<div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300" style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}/>
              </div>)}

            {/* Unlocked Indicator */}
            {badge.unlockedAt && (<div className="absolute top-1 right-1">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"/>
                </div>
              </div>)}
          </motion.div>))}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (<div className="text-center py-8">
          <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
          <p className="text-gray-600">
            {selectedCategory === 'all'
                ? 'No badges earned yet. Start swiping to unlock achievements!'
                : `No ${selectedCategory} badges earned yet.`}
          </p>
        </div>)}

      {/* New Badge Notifications */}
      <AnimatePresence>
        {newBadges.length > 0 && (<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">New Badge Unlocked! 🎉</h4>
                <button onClick={clearNewBadges} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5"/>
                </button>
              </div>
              {newBadges.map((badge) => (<div key={badge.id} className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                </div>))}
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {showBadgeDetails && (<BadgeDetailsModal badge={showBadgeDetails} onClose={() => setShowBadgeDetails(null)}/>)}
      </AnimatePresence>
    </div>);
}
// Streak Card Component
function StreakCard({ streak }) {
    const getStreakIcon = (type) => {
        const icons = {
            daily_swipe: '👆',
            daily_login: '🔥',
            daily_chat: '💬'
        };
        return icons[type] || '🔥';
    };
    const getStreakLabel = (type) => {
        const labels = {
            daily_swipe: 'Swipe Streak',
            daily_login: 'Login Streak',
            daily_chat: 'Chat Streak'
        };
        return labels[type] || 'Streak';
    };
    return (<div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 border border-orange-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl">{getStreakIcon(streak.type)}</span>
            <span className="font-semibold text-gray-900">{getStreakLabel(streak.type)}</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{streak.current}</div>
          <div className="text-sm text-gray-600">days</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Best: {streak.longest}</div>
          <div className="text-xs text-gray-500">Next: {streak.nextMilestone}</div>
        </div>
      </div>
    </div>);
}
// Badge Details Modal
function BadgeDetailsModal({ badge, onClose }) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-6xl mb-4">{badge.icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{badge.name}</h3>
          <p className="text-gray-600 mb-4">{badge.description}</p>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(badge.rarity)}`}>
              {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
            </span>
            <span className="text-sm text-gray-500 capitalize">{badge.category}</span>
          </div>

          {badge.unlockedAt && (<div className="text-sm text-gray-500 mb-4">
              Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
            </div>)}

          {badge.progress !== undefined && badge.maxProgress && (<div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{badge.progress} / {badge.maxProgress}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300" style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}/>
              </div>
            </div>)}

          <InteractiveButton onClick={onClose} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white">
            Got it!
          </InteractiveButton>
        </div>
      </motion.div>
    </motion.div>);
}
function getRarityColor(rarity) {
    const colors = {
        common: 'bg-gray-100 text-gray-800 border-gray-300',
        rare: 'bg-blue-100 text-blue-800 border-blue-300',
        epic: 'bg-purple-100 text-purple-800 border-purple-300',
        legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity] || colors.common;
}
//# sourceMappingURL=BadgeSystem.jsx.map