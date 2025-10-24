/**
 * Gamification Service
 * Handles streaks, badges, and achievement system
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'swipe' | 'match' | 'chat' | 'profile' | 'social' | 'premium';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
}
export interface Streak {
    type: 'daily_swipe' | 'daily_login' | 'daily_chat';
    current: number;
    longest: number;
    lastActivity: string;
    nextMilestone: number;
}
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
}
export interface UserGamification {
    userId: string;
    totalPoints: number;
    level: number;
    badges: Badge[];
    streaks: Streak[];
    achievements: Achievement[];
    lastUpdated: string;
}
declare class GamificationService {
    private apiUrl;
    /**
     * Get user's gamification data
     */
    getUserGamification(userId: string): Promise<UserGamification | null>;
    /**
     * Record user activity for streaks
     */
    recordActivity(userId: string, activity: {
        type: 'swipe' | 'login' | 'chat' | 'match' | 'profile_update';
        count?: number;
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Check and unlock new badges
     */
    checkBadgeUnlocks(userId: string): Promise<Badge[]>;
    /**
     * Get available badges
     */
    getAvailableBadges(): Promise<Badge[]>;
    /**
     * Get leaderboard
     */
    getLeaderboard(type: 'points' | 'streaks' | 'badges', limit?: number): Promise<Array<{
        userId: string;
        userName: string;
        userAvatar?: string;
        score: number;
        rank: number;
    }>>;
    /**
     * Get fallback badges when API is unavailable
     */
    private getFallbackBadges;
    /**
     * Calculate user level from points
     */
    calculateLevel(points: number): number;
    /**
     * Calculate points needed for next level
     */
    getPointsForNextLevel(currentLevel: number): number;
    /**
     * Get level progress percentage
     */
    getLevelProgress(points: number): {
        current: number;
        next: number;
        percentage: number;
    };
}
export declare const gamificationService: GamificationService;
export declare function useGamification(userId?: string): {
    gamification: any;
    isLoading: any;
    error: any;
    newBadges: any;
    fetchGamification: () => Promise<void>;
    recordActivity: (activity: Parameters<typeof gamificationService.recordActivity>[1]) => Promise<void>;
    clearNewBadges: () => void;
    calculateLevel: (points: number) => number;
    getLevelProgress: (points: number) => {
        current: number;
        next: number;
        percentage: number;
    };
};
export default gamificationService;
//# sourceMappingURL=gamification.d.ts.map