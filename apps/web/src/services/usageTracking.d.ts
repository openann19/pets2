interface UsageStats {
    swipesUsed: number;
    swipesLimit: number;
    superLikesUsed: number;
    superLikesLimit: number;
    boostsUsed: number;
    boostsLimit: number;
    profileViews: number;
    messagesSent: number;
    matchRate: number;
}
export declare const UsageTrackingService: {
    /**
     * Track a swipe action
     */
    trackSwipe(userId: string, petId: string, action: "like" | "pass" | "superlike"): Promise<boolean>;
    /**
     * Track a super like action
     */
    trackSuperLike(userId: string, petId: string): Promise<boolean>;
    /**
     * Track a boost action
     */
    trackBoost(userId: string): Promise<boolean>;
    /**
     * Get usage stats for user
     */
    getUsageStats(userId: string): Promise<UsageStats | null>;
};
export default UsageTrackingService;
//# sourceMappingURL=usageTracking.d.ts.map