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
  // Phase 1 Product Enhancements
  homeDashboard: boolean; // home.dashboard.v1
  matchesAdvancedFilter: boolean; // matches.filter.v1
  pushRich: boolean; // push.rich.v1
  chatSchedule: boolean; // chat.schedule.v1 (Phase 2)
  chatTemplates: boolean; // chat.templates.v1 (Phase 2)
  chatSmartSuggestions: boolean; // chat.suggestions.v1 (Phase 2)
  chatTranslation: boolean; // chat.translation.v1 (Phase 2)
  swipePremium: boolean; // swipe.premium.v1 (Phase 2)
  offlineOutbox: boolean; // offline.outbox.v1 (Phase 2)
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
  // Phase 1 - Enabled by default, can be disabled via env
  homeDashboard: true,
  matchesAdvancedFilter: true,
  pushRich: true,
  // Phase 2 - Disabled by default
  chatSchedule: false,
  chatTemplates: false,
  chatSmartSuggestions: false,
  chatTranslation: false,
  swipePremium: false,
  offlineOutbox: false,
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

    // Phase 1 Product Enhancements
    if (process.env['FEATURE_HOME_DASHBOARD'] != null) {
      flags.homeDashboard = process.env['FEATURE_HOME_DASHBOARD'] === 'true';
    }
    if (process.env['FEATURE_MATCHES_ADVANCED_FILTER'] != null) {
      flags.matchesAdvancedFilter = process.env['FEATURE_MATCHES_ADVANCED_FILTER'] === 'true';
    }
    if (process.env['FEATURE_PUSH_RICH'] != null) {
      flags.pushRich = process.env['FEATURE_PUSH_RICH'] === 'true';
    }
    if (process.env['FEATURE_CHAT_SCHEDULE'] != null) {
      flags.chatSchedule = process.env['FEATURE_CHAT_SCHEDULE'] === 'true';
    }
    if (process.env['FEATURE_CHAT_TEMPLATES'] != null) {
      flags.chatTemplates = process.env['FEATURE_CHAT_TEMPLATES'] === 'true';
    }
    if (process.env['FEATURE_CHAT_SMART_SUGGESTIONS'] != null) {
      flags.chatSmartSuggestions = process.env['FEATURE_CHAT_SMART_SUGGESTIONS'] === 'true';
    }
    if (process.env['FEATURE_CHAT_TRANSLATION'] != null) {
      flags.chatTranslation = process.env['FEATURE_CHAT_TRANSLATION'] === 'true';
    }
    if (process.env['FEATURE_SWIPE_PREMIUM'] != null) {
      flags.swipePremium = process.env['FEATURE_SWIPE_PREMIUM'] === 'true';
    }
    if (process.env['FEATURE_OFFLINE_OUTBOX'] != null) {
      flags.offlineOutbox = process.env['FEATURE_OFFLINE_OUTBOX'] === 'true';
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
