export type PremiumTier = 'free' | 'premium' | 'ultra';
export interface UserSubscription {
    tier: PremiumTier;
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
}
declare class PremiumTierService {
    getUserSubscription(userId: string): Promise<UserSubscription>;
    upgradeTier(userId: string, tier: PremiumTier): Promise<UserSubscription>;
    cancelSubscription(userId: string): Promise<void>;
}
export declare const premiumTierService: PremiumTierService;
export {};
//# sourceMappingURL=premium-tier-service.d.ts.map