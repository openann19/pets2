"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animationConfig = void 0;
exports.useAnimationConfig = useAnimationConfig;
const animations_1 = require("../types/animations");
const env_1 = require("../utils/env");
class AnimationConfigService {
    config = { ...animations_1.defaultAnimationConfig };
    listeners = new Set();
    constructor() {
        void this.loadConfig();
    }
    // Get current configuration
    getConfig() {
        return { ...this.config };
    }
    // Update configuration
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        void this.saveConfig();
        this.notifyListeners();
    }
    // Reset to defaults
    resetToDefaults() {
        this.config = { ...animations_1.defaultAnimationConfig };
        void this.saveConfig();
        this.notifyListeners();
    }
    // Subscribe to configuration changes
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    // Check if animations are enabled globally
    areAnimationsEnabled() {
        return this.config.enabled;
    }
    // Check if a specific feature is enabled
    isFeatureEnabled(feature) {
        return this.config.enabled && Boolean(this.config[feature]);
    }
    // Get button animation config
    getButtonConfig() {
        return this.config.buttons;
    }
    // Get card animation config
    getCardConfig() {
        return this.config.cards;
    }
    // Get list animation config
    getListConfig() {
        return this.config.lists;
    }
    // Get celebration config
    getCelebrationConfig() {
        return this.config.celebrations;
    }
    // Get platform-specific config
    getMobileConfig() {
        return this.config.mobile;
    }
    getWebConfig() {
        return this.config.web;
    }
    async loadConfig() {
        try {
            await Promise.resolve(); // Satisfy require-await
            // Load from localStorage (web) or AsyncStorage (mobile)
            const stored = (0, env_1.getLocalStorageItem)('animation-config');
            if (stored != null && stored !== '') {
                const parsed = JSON.parse(stored);
                this.config = { ...animations_1.defaultAnimationConfig, ...parsed };
            }
        }
        catch (error) {
            console.warn('Failed to load animation config:', error);
            this.config = { ...animations_1.defaultAnimationConfig };
        }
    }
    async saveConfig() {
        try {
            await Promise.resolve(); // Satisfy require-await
            (0, env_1.setLocalStorageItem)('animation-config', JSON.stringify(this.config));
        }
        catch (error) {
            console.warn('Failed to save animation config:', error);
        }
    }
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.getConfig());
            }
            catch (error) {
                console.warn('Error notifying animation config listener:', error);
            }
        });
    }
}
// Singleton instance
exports.animationConfig = new AnimationConfigService();
// Lightweight helper for consumers that previously relied on a
// named export `useAnimationConfig`. Historically this returned a
// small accessor around the singleton. Provide a stable export
// to satisfy existing public API surface and TypeScript checks.
function useAnimationConfig() {
    // Return the singleton instance; callers can call getConfig() or
    // subscribe() on the returned object.
    return exports.animationConfig;
}
