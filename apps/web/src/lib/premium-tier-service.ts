class PremiumTierService {
    async getUserSubscription(userId) {
        return { tier: 'free', status: 'inactive' };
    }
    async upgradeTier(userId, tier) {
        return { tier, status: 'active' };
    }
    async cancelSubscription(userId) {
        // Stub
    }
}
export const premiumTierService = new PremiumTierService();
//# sourceMappingURL=premium-tier-service.js.map