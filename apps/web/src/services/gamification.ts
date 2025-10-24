/**
 * Gamification Service
 * Handles streaks, badges, and achievement system
 */
import { logger } from './logger';
class GamificationService {
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    /**
     * Get user's gamification data
     */
    async getUserGamification(userId) {
        try {
            const response = await fetch(`${this.apiUrl}/api/gamification/user/${userId}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            return data.gamification;
        }
        catch (error) {
            logger.error('Failed to get user gamification data', error);
            return null;
        }
    }
    /**
     * Record user activity for streaks
     */
    async recordActivity(userId, activity) {
        try {
            await fetch(`${this.apiUrl}/api/gamification/activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    activity,
                    timestamp: new Date().toISOString()
                })
            });
        }
        catch (error) {
            logger.error('Failed to record activity', error);
        }
    }
    /**
     * Check and unlock new badges
     */
    async checkBadgeUnlocks(userId) {
        try {
            const response = await fetch(`${this.apiUrl}/api/gamification/check-badges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId })
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            return data.newBadges || [];
        }
        catch (error) {
            logger.error('Failed to check badge unlocks', error);
            return [];
        }
    }
    /**
     * Get available badges
     */
    async getAvailableBadges() {
        try {
            const response = await fetch(`${this.apiUrl}/api/gamification/badges`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            return data.badges || [];
        }
        catch (error) {
            logger.error('Failed to get available badges', error);
            return this.getFallbackBadges();
        }
    }
    /**
     * Get leaderboard
     */
    async getLeaderboard(type, limit = 10) {
        try {
            const response = await fetch(`${this.apiUrl}/api/gamification/leaderboard?type=${type}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            return data.leaderboard || [];
        }
        catch (error) {
            logger.error('Failed to get leaderboard', error);
            return [];
        }
    }
    /**
     * Get fallback badges when API is unavailable
     */
    getFallbackBadges() {
        return [
            {
                id: 'first_swipe',
                name: 'First Swipe',
                description: 'Complete your first swipe',
                icon: '👆',
                category: 'swipe',
                rarity: 'common',
                maxProgress: 1
            },
            {
                id: 'swipe_streak_7',
                name: 'Week Warrior',
                description: 'Swipe for 7 days in a row',
                icon: '🔥',
                category: 'swipe',
                rarity: 'rare',
                maxProgress: 7
            },
            {
                id: 'first_match',
                name: 'Matchmaker',
                description: 'Get your first match',
                icon: '💕',
                category: 'match',
                rarity: 'common',
                maxProgress: 1
            },
            {
                id: 'match_streak_5',
                name: 'Love Magnet',
                description: 'Get 5 matches in a row',
                icon: '🧲',
                category: 'match',
                rarity: 'epic',
                maxProgress: 5
            },
            {
                id: 'first_chat',
                name: 'Chatterbox',
                description: 'Send your first message',
                icon: '💬',
                category: 'chat',
                rarity: 'common',
                maxProgress: 1
            },
            {
                id: 'chat_streak_30',
                name: 'Social Butterfly',
                description: 'Chat for 30 days in a row',
                icon: '🦋',
                category: 'chat',
                rarity: 'legendary',
                maxProgress: 30
            },
            {
                id: 'complete_profile',
                name: 'Profile Perfectionist',
                description: 'Complete your pet profile with all details',
                icon: '✨',
                category: 'profile',
                rarity: 'rare',
                maxProgress: 1
            },
            {
                id: 'premium_member',
                name: 'Premium Paws',
                description: 'Upgrade to Premium',
                icon: '👑',
                category: 'premium',
                rarity: 'epic',
                maxProgress: 1
            },
            {
                id: 'social_share',
                name: 'Social Sharer',
                description: 'Share your pet profile on social media',
                icon: '📱',
                category: 'social',
                rarity: 'common',
                maxProgress: 1
            },
            {
                id: 'feedback_giver',
                name: 'Helpful Hound',
                description: 'Submit feedback to help improve the app',
                icon: '🐕',
                category: 'social',
                rarity: 'rare',
                maxProgress: 1
            }
        ];
    }
    /**
     * Calculate user level from points
     */
    calculateLevel(points) {
        // Level formula: level = floor(sqrt(points / 100))
        return Math.floor(Math.sqrt(points / 100)) + 1;
    }
    /**
     * Calculate points needed for next level
     */
    getPointsForNextLevel(currentLevel) {
        return Math.pow(currentLevel, 2) * 100;
    }
    /**
     * Get level progress percentage
     */
    getLevelProgress(points) {
        const currentLevel = this.calculateLevel(points);
        const currentLevelPoints = Math.pow(currentLevel - 1, 2) * 100;
        const nextLevelPoints = Math.pow(currentLevel, 2) * 100;
        const progress = points - currentLevelPoints;
        const total = nextLevelPoints - currentLevelPoints;
        const percentage = (progress / total) * 100;
        return {
            current: currentLevelPoints,
            next: nextLevelPoints,
            percentage: Math.min(100, Math.max(0, percentage))
        };
    }
}
// Create singleton instance
export const gamificationService = new GamificationService();
// React hook for gamification
export function useGamification(userId) {
    const [gamification, setGamification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newBadges, setNewBadges] = useState([]);
    const fetchGamification = async () => {
        if (!userId)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await gamificationService.getUserGamification(userId);
            setGamification(data);
        }
        catch (error) {
            setError(error.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const recordActivity = async (activity) => {
        if (!userId)
            return;
        try {
            await gamificationService.recordActivity(userId, activity);
            // Check for new badges
            const badges = await gamificationService.checkBadgeUnlocks(userId);
            if (badges.length > 0) {
                setNewBadges(badges);
                // Refresh gamification data
                await fetchGamification();
            }
        }
        catch (error) {
            setError(error.message);
        }
    };
    const clearNewBadges = () => {
        setNewBadges([]);
    };
    useEffect(() => {
        if (userId) {
            fetchGamification();
        }
    }, [userId]);
    return {
        gamification,
        isLoading,
        error,
        newBadges,
        fetchGamification,
        recordActivity,
        clearNewBadges,
        calculateLevel: gamificationService.calculateLevel.bind(gamificationService),
        getLevelProgress: gamificationService.getLevelProgress.bind(gamificationService)
    };
}
export default gamificationService;
//# sourceMappingURL=gamification.js.map