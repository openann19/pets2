import type { AnimationConfig } from '../types/animations';
import { defaultAnimationConfig } from '../types/animations';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/env';
import { logger } from '../utils/logger';

class AnimationConfigService {
  private config: AnimationConfig = { ...defaultAnimationConfig };
  private listeners: Set<(config: AnimationConfig) => void> = new Set();

  constructor() {
    void this.loadConfig();
  }

  // Get current configuration
  getConfig(): AnimationConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...updates };
    void this.saveConfig();
    this.notifyListeners();
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.config = { ...defaultAnimationConfig };
    void this.saveConfig();
    this.notifyListeners();
  }

  // Subscribe to configuration changes
  subscribe(listener: (config: AnimationConfig) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Check if animations are enabled globally
  areAnimationsEnabled(): boolean {
    return this.config.enabled;
  }

  // Check if a specific feature is enabled
  isFeatureEnabled(feature: keyof AnimationConfig): boolean {
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

  private async loadConfig(): Promise<void> {
    try {
      await Promise.resolve(); // Satisfy require-await
      // Load from localStorage (web) or AsyncStorage (mobile)
      const stored = getLocalStorageItem('animation-config');
      if (stored != null && stored !== '') {
        const parsed = JSON.parse(stored) as Partial<AnimationConfig>;
        this.config = { ...defaultAnimationConfig, ...parsed };
      }
    } catch (error) {
      logger.warn('Failed to load animation config:', error);
      this.config = { ...defaultAnimationConfig };
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await Promise.resolve(); // Satisfy require-await
      setLocalStorageItem('animation-config', JSON.stringify(this.config));
    } catch (error) {
      logger.warn('Failed to save animation config:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getConfig());
      } catch (error) {
        logger.warn('Error notifying animation config listener:', error);
      }
    });
  }
}

// Singleton instance
export const animationConfig = new AnimationConfigService();

// Lightweight helper for consumers that previously relied on a
// named export `useAnimationConfig`. Historically this returned a
// small accessor around the singleton. Provide a stable export
// to satisfy existing public API surface and TypeScript checks.
export function useAnimationConfig(): AnimationConfigService | AnimationConfig {
  // Return the singleton instance; callers can call getConfig() or
  // subscribe() on the returned object.
  return animationConfig as unknown as AnimationConfigService;
}
