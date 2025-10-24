/**
 * 🎬 ULTRA PREMIUM HAPTICS & SOUND DESIGN SYSTEM
 * Professional-grade haptic feedback and sound design
 * Cross-platform with intelligent fallbacks and accessibility support
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { logger } from '@pawfectmatch/core';
;

export interface HapticPattern {
  /** Pattern type */
  type: 'impact' | 'notification' | 'selection' | 'custom';
  /** Intensity level */
  intensity: 'light' | 'medium' | 'heavy';
  /** Duration in milliseconds */
  duration?: number;
  /** Custom pattern data */
  pattern?: number[];
}

export interface SoundEffect {
  /** Sound identifier */
  id: string;
  /** Audio file path or data */
  source: string | ArrayBuffer;
  /** Volume level (0-1) */
  volume: number;
  /** Playback rate */
  rate: number;
  /** Whether to loop */
  loop: boolean;
  /** Preload the sound */
  preload: boolean;
}

export interface HapticSoundConfig {
  /** Enable haptic feedback */
  enableHaptics: boolean;
  /** Enable sound effects */
  enableSounds: boolean;
  /** Master volume */
  masterVolume: number;
  /** Respect system settings */
  respectSystemSettings: boolean;
  /** Accessibility mode */
  accessibilityMode: boolean;
}

const DEFAULT_CONFIG: HapticSoundConfig = {
  enableHaptics: true,
  enableSounds: true,
  masterVolume: 0.7,
  respectSystemSettings: true,
  accessibilityMode: false,
};

/**
 * Haptic Feedback Manager
 */
export class HapticManager {
  private static instance: HapticManager;
  private config: HapticSoundConfig;
  private isEnabled: boolean = true;

  static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager();
    }
    return HapticManager.instance;
  }

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.initializeHaptics();
  }

  /**
   * Initialize haptic system
   */
  private async initializeHaptics(): Promise<void> {
    // Web haptic feedback (if supported)
    this.isEnabled = 'vibrate' in navigator;
  }

  /**
   * Configure haptic manager
   */
  configure(config: Partial<HapticSoundConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Trigger impact haptic feedback
   */
  async impact(intensity: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.config.enableHaptics || !this.isEnabled) return;

    try {
      // Web vibration API
      const pattern = this.getWebVibrationPattern(intensity);
      navigator.vibrate(pattern);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Trigger notification haptic feedback
   */
  async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    if (!this.config.enableHaptics || !this.isEnabled) return;

    try {
      const pattern = this.getNotificationPattern(type);
      navigator.vibrate(pattern);
    } catch (error) {
      logger.warn('Notification haptic failed:', { error });
    }
  }

  /**
   * Trigger selection haptic feedback
   */
  async selection(): Promise<void> {
    if (!this.config.enableHaptics || !this.isEnabled) return;

    try {
      navigator.vibrate(10);
    } catch (error) {
      logger.warn('Selection haptic failed:', { error });
    }
  }

  /**
   * Trigger custom haptic pattern
   */
  async custom(pattern: number[]): Promise<void> {
    if (!this.config.enableHaptics || !this.isEnabled) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      logger.warn('Custom haptic pattern failed:', { error });
    }
  }

  /**
   * Get web vibration pattern for intensity
   */
  private getWebVibrationPattern(intensity: 'light' | 'medium' | 'heavy'): number[] {
    switch (intensity) {
      case 'light':
        return [50];
      case 'medium':
        return [100];
      case 'heavy':
        return [200];
      default:
        return [100];
    }
  }

  /**
   * Get notification vibration pattern
   */
  private getNotificationPattern(type: 'success' | 'warning' | 'error'): number[] {
    switch (type) {
      case 'success':
        return [100, 50, 100];
      case 'warning':
        return [200, 100, 200];
      case 'error':
        return [300, 100, 300, 100, 300];
      default:
        return [100, 50, 100];
    }
  }

}

/**
 * Sound Effect Manager
 */
export class SoundManager {
  private static instance: SoundManager;
  private config: HapticSoundConfig;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.initializeAudio();
  }

  /**
   * Initialize audio system
   */
  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isEnabled = true;
    } catch (error) {
      logger.warn('Audio context not available:', { error });
      this.isEnabled = false;
    }
  }

  /**
   * Configure sound manager
   */
  configure(config: Partial<HapticSoundConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Load sound effect
   */
  async loadSound(id: string, source: string | ArrayBuffer): Promise<void> {
    if (!this.config.enableSounds || !this.isEnabled) return;

    try {
      if (this.audioContext) {
        let arrayBuffer: ArrayBuffer;
        
        if (typeof source === 'string') {
          const response = await fetch(source);
          arrayBuffer = await response.arrayBuffer();
        } else {
          arrayBuffer = source;
        }
        
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds.set(id, audioBuffer);
      }
    } catch (error) {
      logger.warn(`Failed to load sound ${id}:`, { error });
    }
  }

  /**
   * Play sound effect
   */
  async playSound(
    id: string, 
    options: {
      volume?: number;
      rate?: number;
      loop?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.config.enableSounds || !this.isEnabled) return;

    const {
      volume = 1,
      rate = 1,
      loop = false,
    } = options;

    try {
      if (this.audioContext) {
        const audioBuffer = this.sounds.get(id);
        if (!audioBuffer) {
          logger.warn(`Sound ${id} not found`);
          return;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = audioBuffer;
        source.playbackRate.value = rate;
        source.loop = loop;
        
        gainNode.gain.value = volume * this.config.masterVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
      }
    } catch (error) {
      logger.warn(`Failed to play sound ${id}:`, { error });
    }
  }

  /**
   * Generate procedural sound
   */
  async playProceduralSound(
    type: 'click' | 'swipe' | 'success' | 'error' | 'notification',
    options: {
      volume?: number;
      duration?: number;
      frequency?: number;
    } = {}
  ): Promise<void> {
    if (!this.config.enableSounds || !this.isEnabled || !this.audioContext) return;

    const {
      volume = 0.3,
      duration = 0.1,
      frequency = 800,
    } = options;

    try {
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate sound based on type
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        let sample = 0;

        switch (type) {
          case 'click':
            sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 20);
            break;
          case 'swipe':
            sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10) * 0.5;
            break;
          case 'success':
            sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5) * 0.7;
            break;
          case 'error':
            sample = Math.sin(2 * Math.PI * frequency * 0.5 * t) * Math.exp(-t * 15) * 0.8;
            break;
          case 'notification':
            sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.6;
            break;
        }

        data[i] = sample * volume * this.config.masterVolume;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      logger.warn('Failed to play procedural sound:', { error });
    }
  }
}

/**
 * Combined Haptic & Sound Manager
 */
export class HapticSoundManager {
  private static instance: HapticSoundManager;
  public hapticManager: HapticManager;
  public soundManager: SoundManager;
  private config: HapticSoundConfig;

  static getInstance(): HapticSoundManager {
    if (!HapticSoundManager.instance) {
      HapticSoundManager.instance = new HapticSoundManager();
    }
    return HapticSoundManager.instance;
  }

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.hapticManager = HapticManager.getInstance();
    this.soundManager = SoundManager.getInstance();
  }

  /**
   * Configure both managers
   */
  configure(config: Partial<HapticSoundConfig>): void {
    this.config = { ...this.config, ...config };
    this.hapticManager.configure(config);
    this.soundManager.configure(config);
  }

  /**
   * Trigger combined haptic and sound feedback
   */
  async feedback(
    type: 'tap' | 'swipe' | 'success' | 'error' | 'notification' | 'celebration',
    options: {
      hapticIntensity?: 'light' | 'medium' | 'heavy';
      soundVolume?: number;
      customSound?: string;
    } = {}
  ): Promise<void> {
    const {
      hapticIntensity = 'medium',
      soundVolume = 0.5,
      customSound,
    } = options;

    // Trigger haptic feedback
    switch (type) {
      case 'tap':
        await this.hapticManager.impact(hapticIntensity);
        break;
      case 'swipe':
        await this.hapticManager.impact('light');
        break;
      case 'success':
        await this.hapticManager.notification('success');
        break;
      case 'error':
        await this.hapticManager.notification('error');
        break;
      case 'notification':
        await this.hapticManager.notification('warning');
        break;
      case 'celebration':
        await this.hapticManager.custom([100, 50, 100, 50, 200]);
        break;
    }

    // Trigger sound feedback
    if (customSound) {
      await this.soundManager.playSound(customSound, { volume: soundVolume });
    } else {
      await this.soundManager.playProceduralSound(type as any, { volume: soundVolume });
    }
  }
}

/**
 * Hook for using haptic and sound feedback
 */
export function useHapticSound(config?: Partial<HapticSoundConfig>) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const manager = useMemo(() => HapticSoundManager.getInstance(), []);

  useEffect(() => {
    if (config) {
      manager.configure(config);
    }
  }, [config, manager]);

  const feedback = useCallback(async (
    type: 'tap' | 'swipe' | 'success' | 'error' | 'notification' | 'celebration',
    options?: {
      hapticIntensity?: 'light' | 'medium' | 'heavy';
      soundVolume?: number;
      customSound?: string;
    }
  ) => {
    if (!isEnabled) return;
    
    setIsLoading(true);
    try {
      await manager.feedback(type, options);
    } catch (error) {
      logger.warn('Feedback failed:', { error });
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, manager]);

  const impact = useCallback(async (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isEnabled) return;
    await manager.hapticManager.impact(intensity);
  }, [isEnabled, manager]);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isEnabled) return;
    await manager.hapticManager.notification(type);
  }, [isEnabled, manager]);

  const selection = useCallback(async () => {
    if (!isEnabled) return;
    await manager.hapticManager.selection();
  }, [isEnabled, manager]);

  const playSound = useCallback(async (
    id: string,
    options?: { volume?: number; rate?: number; loop?: boolean }
  ) => {
    if (!isEnabled) return;
    await manager.soundManager.playSound(id, options);
  }, [isEnabled, manager]);

  const loadSound = useCallback(async (id: string, source: string | ArrayBuffer) => {
    setIsLoading(true);
    try {
      await manager.soundManager.loadSound(id, source);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  return {
    isEnabled,
    isLoading,
    setIsEnabled,
    feedback,
    impact,
    notification,
    selection,
    playSound,
    loadSound,
  };
}

/**
 * Preset feedback patterns
 */
export const FEEDBACK_PRESETS = {
  subtle: {
    tap: { hapticIntensity: 'light' as const, soundVolume: 0.2 },
    swipe: { hapticIntensity: 'light' as const, soundVolume: 0.1 },
    success: { hapticIntensity: 'light' as const, soundVolume: 0.3 },
  },
  medium: {
    tap: { hapticIntensity: 'medium' as const, soundVolume: 0.5 },
    swipe: { hapticIntensity: 'light' as const, soundVolume: 0.3 },
    success: { hapticIntensity: 'medium' as const, soundVolume: 0.6 },
  },
  dramatic: {
    tap: { hapticIntensity: 'heavy' as const, soundVolume: 0.8 },
    swipe: { hapticIntensity: 'medium' as const, soundVolume: 0.6 },
    success: { hapticIntensity: 'heavy' as const, soundVolume: 0.9 },
    celebration: { hapticIntensity: 'heavy' as const, soundVolume: 1.0 },
  },
};
