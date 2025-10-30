/**
 * Performance Manager
 * Detects low-end devices and provides performance optimization utilities
 * 
 * Features:
 * - Device capability detection
 * - Low-end device flagging
 * - Adaptive performance settings
 * - Memory-conscious rendering hints
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';

interface DeviceInfo {
  isLowEnd: boolean;
  memoryClass: 'low' | 'medium' | 'high';
  cpuCores: number;
  platform: 'ios' | 'android' | 'web';
}

class PerfManager {
  private static instance: PerfManager | null = null;
  private deviceInfo: DeviceInfo | null = null;
  private cachedLowEndFlag: boolean | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PerfManager {
    if (!PerfManager.instance) {
      PerfManager.instance = new PerfManager();
    }
    return PerfManager.instance;
  }

  /**
   * Detect if device is low-end
   * Uses heuristics based on device model, memory, and CPU cores
   */
  isLowEnd(): boolean {
    if (this.cachedLowEndFlag !== null) {
      return this.cachedLowEndFlag;
    }

    try {
      // iOS devices - generally better performance
      if (Platform.OS === 'ios') {
        // Older iPhones (iPhone 8 and below) are considered low-end
        const deviceModel = Device.modelName || '';
        const lowEndModels = ['iPhone 6', 'iPhone 6s', 'iPhone 7', 'iPhone 8', 'iPhone SE'];
        const isLowEndModel = lowEndModels.some(model => deviceModel.includes(model));
        
        // Also check totalMemory if available
        const totalMemory = Device.totalMemory || 0;
        const isLowMemory = totalMemory > 0 && totalMemory < 2 * 1024 * 1024 * 1024; // < 2GB
        
        this.cachedLowEndFlag = isLowEndModel || isLowMemory;
      } else if (Platform.OS === 'android') {
        // Android devices vary widely
        const totalMemory = Device.totalMemory || 0;
        const isLowMemory = totalMemory > 0 && totalMemory < 3 * 1024 * 1024 * 1024; // < 3GB
        
        // Check device manufacturer/model for known low-end devices
        const deviceModel = Device.modelName || '';
        const lowEndBrands = ['Moto', 'Galaxy A', 'Galaxy J', 'Redmi', 'POCO'];
        const isLowEndModel = lowEndBrands.some(brand => deviceModel.includes(brand));
        
        this.cachedLowEndFlag = isLowMemory || isLowEndModel;
      } else {
        // Web platform - check navigator.deviceMemory
        if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
          const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
          const hardwareConcurrency = navigator.hardwareConcurrency || 4;
          this.cachedLowEndFlag = deviceMemory < 4 || hardwareConcurrency < 4;
        } else {
          // Default to medium performance for unknown web devices
          this.cachedLowEndFlag = false;
        }
      }
    } catch (error) {
      // If detection fails, assume medium performance (not low-end)
      this.cachedLowEndFlag = false;
    }

    return this.cachedLowEndFlag;
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    const totalMemory = Device.totalMemory || 0;
    const memoryGB = totalMemory > 0 ? totalMemory / (1024 * 1024 * 1024) : 4;

    let memoryClass: 'low' | 'medium' | 'high' = 'medium';
    if (memoryGB < 2) {
      memoryClass = 'low';
    } else if (memoryGB >= 6) {
      memoryClass = 'high';
    }

    const hardwareConcurrency = 
      Platform.OS === 'web' 
        ? navigator.hardwareConcurrency || 4
        : 4; // React Native doesn't expose CPU cores directly

    this.deviceInfo = {
      isLowEnd: this.isLowEnd(),
      memoryClass,
      cpuCores: hardwareConcurrency,
      platform: Platform.OS as 'ios' | 'android' | 'web',
    };

    return this.deviceInfo;
  }

  /**
   * Should skip heavy effects (confetti, complex blur, etc.)
   */
  shouldSkipHeavyEffects(): boolean {
    return this.isLowEnd();
  }

  /**
   * Get recommended blur intensity
   */
  getBlurIntensity(defaultIntensity: number): number {
    if (this.isLowEnd()) {
      return Math.max(5, defaultIntensity * 0.5); // Reduce blur intensity
    }
    return defaultIntensity;
  }

  /**
   * Get recommended animation duration multiplier
   */
  getAnimationMultiplier(): number {
    if (this.isLowEnd()) {
      return 0.7; // Faster animations on low-end
    }
    return 1.0;
  }

  /**
   * Should reduce particle count
   */
  getParticleCount(maxCount: number): number {
    if (this.isLowEnd()) {
      return Math.max(10, Math.floor(maxCount * 0.3)); // Reduce to 30%
    }
    return maxCount;
  }

  /**
   * Reset cached values (useful for testing or device changes)
   */
  reset(): void {
    this.cachedLowEndFlag = null;
    this.deviceInfo = null;
  }
}

// Export singleton instance
export const perfManager = PerfManager.getInstance();

// Export convenience functions
export const isLowEnd = (): boolean => perfManager.isLowEnd();
export const shouldSkipHeavyEffects = (): boolean => perfManager.shouldSkipHeavyEffects();
export const getBlurIntensity = (defaultIntensity: number): number => 
  perfManager.getBlurIntensity(defaultIntensity);
export const getParticleCount = (maxCount: number): number => 
  perfManager.getParticleCount(maxCount);

