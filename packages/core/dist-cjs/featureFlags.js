"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlags = exports.FeatureFlagService = void 0;
const defaultFlags = {
    animations: true,
    enhancedMatching: false,
    smartRetries: false,
    prioritySupport: false,
    advancedAnalytics: false,
    premiumAnimations: true,
    animationFrameOptimization: true,
    accessibilityEnhancements: true,
    usageTracking: true,
    subscriptionAnalytics: true
};
class FeatureFlagService {
    flags;
    constructor() {
        // Load flags from environment or config
        this.flags = {
            ...defaultFlags,
            ...this.loadFlagsFromEnvironment()
        };
    }
    loadFlagsFromEnvironment() {
        const flags = {};
        if (process.env['FEATURE_ANIMATIONS'] != null) {
            flags.animations = process.env['FEATURE_ANIMATIONS'] === 'true';
        }
        if (process.env['FEATURE_ENHANCED_MATCHING'] != null) {
            flags.enhancedMatching = process.env['FEATURE_ENHANCED_MATCHING'] === 'true';
        }
        if (process.env['FEATURE_SMART_RETRIES'] != null) {
            flags.smartRetries = process.env['FEATURE_SMART_RETRIES'] === 'true';
        }
        if (process.env['FEATURE_PRIORITY_SUPPORT'] != null) {
            flags.prioritySupport = process.env['FEATURE_PRIORITY_SUPPORT'] === 'true';
        }
        if (process.env['FEATURE_ADVANCED_ANALYTICS'] != null) {
            flags.advancedAnalytics = process.env['FEATURE_ADVANCED_ANALYTICS'] === 'true';
        }
        if (process.env['FEATURE_PREMIUM_ANIMATIONS'] != null) {
            flags.premiumAnimations = process.env['FEATURE_PREMIUM_ANALYTICS'] === 'true';
        }
        if (process.env['FEATURE_ANIMATION_FRAME_OPTIMIZATION'] != null) {
            flags.animationFrameOptimization = process.env['FEATURE_ANIMATION_FRAME_OPTIMIZATION'] === 'true';
        }
        if (process.env['FEATURE_ACCESSIBILITY_ENHANCEMENTS'] != null) {
            flags.accessibilityEnhancements = process.env['FEATURE_ACCESSIBILITY_ENHANCEMENTS'] === 'true';
        }
        if (process.env['FEATURE_USAGE_TRACKING'] != null) {
            flags.usageTracking = process.env['FEATURE_USAGE_TRACKING'] === 'true';
        }
        if (process.env['FEATURE_SUBSCRIPTION_ANALYTICS'] != null) {
            flags.subscriptionAnalytics = process.env['FEATURE_SUBSCRIPTION_ANALYTICS'] === 'true';
        }
        return flags;
    }
    isEnabled(flag) {
        return this.flags[flag];
    }
    enable(flag) {
        this.flags[flag] = true;
    }
    disable(flag) {
        this.flags[flag] = false;
    }
    getFlags() {
        return { ...this.flags };
    }
}
exports.FeatureFlagService = FeatureFlagService;
exports.featureFlags = new FeatureFlagService();
exports.default = exports.featureFlags;
