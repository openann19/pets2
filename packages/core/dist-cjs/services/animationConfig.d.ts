import type { AnimationConfig } from '../types/animations';
declare class AnimationConfigService {
    private config;
    private listeners;
    constructor();
    getConfig(): AnimationConfig;
    updateConfig(updates: Partial<AnimationConfig>): void;
    resetToDefaults(): void;
    subscribe(listener: (config: AnimationConfig) => void): () => void;
    areAnimationsEnabled(): boolean;
    isFeatureEnabled(feature: keyof AnimationConfig): boolean;
    getButtonConfig(): {
        enabled: boolean;
        preset: "default" | "gentle" | "bouncy" | "stiff";
        hapticFeedback: boolean;
    };
    getCardConfig(): {
        enabled: boolean;
        preset: "default" | "gentle" | "bouncy" | "stiff";
        parallax: boolean;
    };
    getListConfig(): {
        enabled: boolean;
        stagger: boolean;
        staggerDelay: number;
    };
    getCelebrationConfig(): {
        enabled: boolean;
        confetti: boolean;
        haptics: boolean;
    };
    getMobileConfig(): {
        reducedMotion: boolean;
        performance: "low" | "medium" | "high";
    };
    getWebConfig(): {
        reducedMotion: boolean;
        respectSystemPreferences: boolean;
    };
    private loadConfig;
    private saveConfig;
    private notifyListeners;
}
export declare const animationConfig: AnimationConfigService;
export declare function useAnimationConfig(): AnimationConfigService | AnimationConfig;
export {};
//# sourceMappingURL=animationConfig.d.ts.map