export interface FeatureFlags {
    animations: boolean;
    enhancedMatching: boolean;
    smartRetries: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    premiumAnimations: boolean;
    animationFrameOptimization: boolean;
    accessibilityEnhancements: boolean;
    usageTracking: boolean;
    subscriptionAnalytics: boolean;
}
export declare class FeatureFlagService {
    private flags;
    constructor();
    private loadFlagsFromEnvironment;
    isEnabled(flag: keyof FeatureFlags): boolean;
    enable(flag: keyof FeatureFlags): void;
    disable(flag: keyof FeatureFlags): void;
    getFlags(): FeatureFlags;
}
export declare const featureFlags: FeatureFlagService;
export default featureFlags;
