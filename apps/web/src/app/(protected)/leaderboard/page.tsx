'use client';
import Leaderboard from '@/components/Gamification/Leaderboard';
import { logger } from '@pawfectmatch/core';
;
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import { useEffect, useState } from 'react';
export default function LeaderboardPage() {
    const { user } = useAuthStore();
    const [entries, setEntries] = useState([]);
    const [category, setCategory] = useState('overall');
    const [timeframe, setTimeframe] = useState('weekly');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchLeaderboard(category, timeframe);
    }, [category, timeframe]);
    const fetchLeaderboard = async (cat, tf) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/leaderboard/${cat}/${tf}`);
            const data = await response.json();
            // Mark current user in the entries
            const entriesWithCurrentUser = data.entries.map((entry) => ({
                ...entry,
                isCurrentUser: entry.userId === user?.id,
            }));
            setEntries(entriesWithCurrentUser);
        }
        catch (error) {
            logger.error('Failed to fetch leaderboard:', { error });
            // Show empty leaderboard on error
            setEntries([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank against other pet lovers!
          </p>
        </div>

        {/* Leaderboard */}
        {isLoading ? (<div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
          </div>) : (<Leaderboard entries={entries} category={category} timeframe={timeframe} onCategoryChange={(newCategory) => setCategory(newCategory)} onTimeframeChange={(newTimeframe) => setTimeframe(newTimeframe)}/>)}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900 dark:text-white">How to Rank Up</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get matches, send messages, and maintain your streak!
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold text-gray-900 dark:text-white">Points System</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Match: 100pts • Message: 10pts • Daily Login: 50pts
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🏅</div>
            <div className="font-semibold text-gray-900 dark:text-white">Rewards</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Top 10 users get exclusive badges and perks!
            </div>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.jsx.map