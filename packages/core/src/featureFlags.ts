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

const defaultFlags: FeatureFlags = {
  animations: true,
  enhancedMatching: false,
  smartRetries: false,
  prioritySupport: false,
  advancedAnalytics: false,
  premiumAnimations: true,
  animationFrameOptimization: true,
  accessibilityEnhancements: true,
  usageTracking: true,
  subscriptionAnalytics: true,
};

export class FeatureFlagService {
  private flags: FeatureFlags;

  constructor() {
    // Load flags from environment or config
    this.flags = {
      ...defaultFlags,
      ...this.loadFlagsFromEnvironment(),
    };
  }

  private loadFlagsFromEnvironment(): Partial<FeatureFlags> {
    const flags: Partial<FeatureFlags> = {};

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
      flags.animationFrameOptimization =
        process.env['FEATURE_ANIMATION_FRAME_OPTIMIZATION'] === 'true';
    }

    if (process.env['FEATURE_ACCESSIBILITY_ENHANCEMENTS'] != null) {
      flags.accessibilityEnhancements =
        process.env['FEATURE_ACCESSIBILITY_ENHANCEMENTS'] === 'true';
    }

    if (process.env['FEATURE_USAGE_TRACKING'] != null) {
      flags.usageTracking = process.env['FEATURE_USAGE_TRACKING'] === 'true';
    }

    if (process.env['FEATURE_SUBSCRIPTION_ANALYTICS'] != null) {
      flags.subscriptionAnalytics = process.env['FEATURE_SUBSCRIPTION_ANALYTICS'] === 'true';
    }

    return flags;
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag];
  }

  enable(flag: keyof FeatureFlags): void {
    this.flags[flag] = true;
  }

  disable(flag: keyof FeatureFlags): void {
    this.flags[flag] = false;
  }

  getFlags(): FeatureFlags {
    return { ...this.flags };
  }
}

export const featureFlags = new FeatureFlagService();
export default featureFlags;
