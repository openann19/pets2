/**
 * 🎬 ULTRA PREMIUM ANIMATION PERFORMANCE BUDGET SYSTEM
 * Professional-grade performance monitoring and optimization
 * Device-class detection with intelligent throttling and fallbacks
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { Platform } from 'react-native';

export interface PerformanceMetrics {
  /** Frames per second */
  fps: number;
  /** Frame time in milliseconds */
  frameTime: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** CPU usage percentage */
  cpuUsage: number;
  /** Device performance score (0-100) */
  performanceScore: number;
}

export interface DeviceClass {
  /** Device tier */
  tier: 'low' | 'medium' | 'high' | 'premium';
  /** Performance multiplier */
  performanceMultiplier: number;
  /** Maximum concurrent animations */
  maxConcurrentAnimations: number;
  /** Animation quality level */
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  /** Recommended settings */
  recommendedSettings: {
    enableComplexAnimations: boolean;
    enableParticleEffects: boolean;
    enable3DTransforms: boolean;
    enableBlurEffects: boolean;
    maxAnimationDuration: number;
    maxStaggerDelay: number;
  };
}

export interface AnimationBudget {
  /** Current animation count */
  activeAnimations: number;
  /** Maximum allowed animations */
  maxAnimations: number;
  /** Available animation slots */
  availableSlots: number;
  /** Performance level */
  performanceLevel: 'critical' | 'low' | 'medium' | 'high';
  /** Throttling factor */
  throttlingFactor: number;
}

export interface AnimationBudgetConfig {
  /** Enable performance monitoring */
  enableMonitoring: boolean;
  /** Monitoring interval in milliseconds */
  monitoringInterval: number;
  /** Performance thresholds */
  thresholds: {
    fps: {
      low: number;
      medium: number;
      high: number;
    };
    memoryUsage: {
      low: number;
      medium: number;
      high: number;
    };
    cpuUsage: {
      low: number;
      medium: number;
      high: number;
    };
  };
  /** Fallback strategies */
  fallbacks: {
    reduceAnimations: boolean;
    disableComplexEffects: boolean;
    enableReducedMotion: boolean;
  };
}

const DEFAULT_CONFIG: AnimationBudgetConfig = {
  enableMonitoring: true,
  monitoringInterval: 1000,
  thresholds: {
    fps: {
      low: 30,
      medium: 45,
      high: 55,
    },
    memoryUsage: {
      low: 100,
      medium: 200,
      high: 300,
    },
    cpuUsage: {
      low: 50,
      medium: 70,
      high: 85,
    },
  },
  fallbacks: {
    reduceAnimations: true,
    disableComplexEffects: true,
    enableReducedMotion: true,
  },
};

/**
 * Device Performance Detection
 */
export class DevicePerformanceDetector {
  private static instance: DevicePerformanceDetector;
  private deviceClass: DeviceClass | null = null;
  private performanceMetrics: PerformanceMetrics | null = null;

  static getInstance(): DevicePerformanceDetector {
    if (!DevicePerformanceDetector.instance) {
      DevicePerformanceDetector.instance = new DevicePerformanceDetector();
    }
    return DevicePerformanceDetector.instance;
  }

  /**
   * Detect device performance class
   */
  detectDeviceClass(): DeviceClass {
    if (this.deviceClass) return this.deviceClass;

    const userAgent = Platform.OS === 'web' ? navigator.userAgent : '';
    const memory = Platform.OS === 'web' ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : 4;
    const cores = Platform.OS === 'web' ? navigator.hardwareConcurrency : 4;

    let tier: DeviceClass['tier'] = 'medium';
    let performanceMultiplier = 1;
    let maxConcurrentAnimations = 8;
    let qualityLevel: DeviceClass['qualityLevel'] = 'medium';

    // Web platform detection
    if (Platform.OS === 'web') {
      // High-end devices
      if (memory >= 8 && cores >= 8) {
        tier = 'premium';
        performanceMultiplier = 1.2;
        maxConcurrentAnimations = 16;
        qualityLevel = 'ultra';
      }
      // Medium-high devices
      else if (memory >= 4 && cores >= 4) {
        tier = 'high';
        performanceMultiplier = 1.1;
        maxConcurrentAnimations = 12;
        qualityLevel = 'high';
      }
      // Medium devices
      else if (memory >= 2 && cores >= 2) {
        tier = 'medium';
        performanceMultiplier = 1;
        maxConcurrentAnimations = 8;
        qualityLevel = 'medium';
      }
      // Low-end devices
      else {
        tier = 'low';
        performanceMultiplier = 0.8;
        maxConcurrentAnimations = 4;
        qualityLevel = 'low';
      }
    }
    // Mobile platform detection
    else {
      // iOS devices (generally better performance)
      if (Platform.OS === 'ios') {
        tier = 'high';
        performanceMultiplier = 1.1;
        maxConcurrentAnimations = 12;
        qualityLevel = 'high';
      }
      // Android devices (varies widely)
      else {
        tier = 'medium';
        performanceMultiplier = 1;
        maxConcurrentAnimations = 8;
        qualityLevel = 'medium';
      }
    }

    this.deviceClass = {
      tier,
      performanceMultiplier,
      maxConcurrentAnimations,
      qualityLevel,
      recommendedSettings: {
        enableComplexAnimations: tier !== 'low',
        enableParticleEffects: tier === 'premium' || tier === 'high',
        enable3DTransforms: tier !== 'low',
        enableBlurEffects: tier === 'premium' || tier === 'high',
        maxAnimationDuration: tier === 'low' ? 300 : tier === 'medium' ? 500 : 800,
        maxStaggerDelay: tier === 'low' ? 50 : tier === 'medium' ? 100 : 150,
      },
    };

    return this.deviceClass;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    if (this.performanceMetrics) return this.performanceMetrics;

    // Default metrics (would be replaced with actual monitoring)
    this.performanceMetrics = {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 50,
      cpuUsage: 30,
      performanceScore: 85,
    };

    return this.performanceMetrics;
  }

  /**
   * Update performance metrics
   */
  updateMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = {
      ...this.getPerformanceMetrics(),
      ...metrics,
    };
  }
}

/**
 * Animation Budget Manager
 */
export class AnimationBudgetManager {
  private static instance: AnimationBudgetManager;
  private activeAnimations: Set<string> = new Set();
  private config: AnimationBudgetConfig;
  private detector: DevicePerformanceDetector;
  private performanceLevel: AnimationBudget['performanceLevel'] = 'medium';

  static getInstance(): AnimationBudgetManager {
    if (!AnimationBudgetManager.instance) {
      AnimationBudgetManager.instance = new AnimationBudgetManager();
    }
    return AnimationBudgetManager.instance;
  }

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.detector = DevicePerformanceDetector.getInstance();
  }

  /**
   * Configure the budget manager
   */
  configure(config: Partial<AnimationBudgetConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Register an animation
   */
  registerAnimation(id: string): boolean {
    const deviceClass = this.detector.detectDeviceClass();
    const maxAnimations = deviceClass.maxConcurrentAnimations;

    if (this.activeAnimations.size >= maxAnimations) {
      logger.warn(`Animation budget exceeded. Max animations: ${maxAnimations}`);
      return false;
    }

    this.activeAnimations.add(id);
    return true;
  }

  /**
   * Unregister an animation
   */
  unregisterAnimation(id: string): void {
    this.activeAnimations.delete(id);
  }

  /**
   * Get current budget status
   */
  getBudget(): AnimationBudget {
    const deviceClass = this.detector.detectDeviceClass();
    const maxAnimations = deviceClass.maxConcurrentAnimations;
    const activeCount = this.activeAnimations.size;
    const availableSlots = maxAnimations - activeCount;

    // Calculate performance level based on metrics
    const metrics = this.detector.getPerformanceMetrics();
    let performanceLevel: AnimationBudget['performanceLevel'] = 'medium';

    if (metrics.fps < this.config.thresholds.fps.low || 
        metrics.memoryUsage > this.config.thresholds.memoryUsage.high ||
        metrics.cpuUsage > this.config.thresholds.cpuUsage.high) {
      performanceLevel = 'critical';
    } else if (metrics.fps < this.config.thresholds.fps.medium ||
               metrics.memoryUsage > this.config.thresholds.memoryUsage.medium ||
               metrics.cpuUsage > this.config.thresholds.cpuUsage.medium) {
      performanceLevel = 'low';
    } else if (metrics.fps >= this.config.thresholds.fps.high &&
               metrics.memoryUsage < this.config.thresholds.memoryUsage.low &&
               metrics.cpuUsage < this.config.thresholds.cpuUsage.low) {
      performanceLevel = 'high';
    }

    this.performanceLevel = performanceLevel;

    // Calculate throttling factor
    let throttlingFactor = 1;
    switch (performanceLevel) {
      case 'critical':
        throttlingFactor = 0.3;
        break;
      case 'low':
        throttlingFactor = 0.6;
        break;
      case 'medium':
        throttlingFactor = 0.8;
        break;
      case 'high':
        throttlingFactor = 1;
        break;
    }

    return {
      activeAnimations: activeCount,
      maxAnimations: maxAnimations,
      availableSlots,
      performanceLevel,
      throttlingFactor,
    };
  }

  /**
   * Check if animation should be throttled
   */
  shouldThrottle(): boolean {
    const budget = this.getBudget();
    return budget.performanceLevel === 'critical' || budget.performanceLevel === 'low';
  }

  /**
   * Get recommended animation settings
   */
  getRecommendedSettings() {
    const deviceClass = this.detector.detectDeviceClass();
    const budget = this.getBudget();
    
    return {
      ...deviceClass.recommendedSettings,
      enableComplexAnimations: deviceClass.recommendedSettings.enableComplexAnimations && 
                              budget.performanceLevel !== 'critical',
      enableParticleEffects: deviceClass.recommendedSettings.enableParticleEffects && 
                            budget.performanceLevel === 'high',
      enable3DTransforms: deviceClass.recommendedSettings.enable3DTransforms && 
                         budget.performanceLevel !== 'critical',
      enableBlurEffects: deviceClass.recommendedSettings.enableBlurEffects && 
                        budget.performanceLevel === 'high',
      maxAnimationDuration: Math.floor(deviceClass.recommendedSettings.maxAnimationDuration * 
                                      budget.throttlingFactor),
      maxStaggerDelay: Math.floor(deviceClass.recommendedSettings.maxStaggerDelay * 
                                 budget.throttlingFactor),
    };
  }
}

/**
 * Hook for using animation budget
 */
export function useAnimationBudget(config?: Partial<AnimationBudgetConfig>) {
  const [budget, setBudget] = useState<AnimationBudget>({
    activeAnimations: 0,
    maxAnimations: 8,
    availableSlots: 8,
    performanceLevel: 'medium',
    throttlingFactor: 1,
  });

  const [deviceClass, setDeviceClass] = useState<DeviceClass | null>(null);
  const [recommendedSettings, setRecommendedSettings] = useState<DeviceClass['recommendedSettings'] | null>(null);

  const manager = useMemo(() => AnimationBudgetManager.getInstance(), []);
  const detector = useMemo(() => DevicePerformanceDetector.getInstance(), []);

  useEffect(() => {
    if (config) {
      manager.configure(config);
    }

    // Initialize device class
    const detectedClass = detector.detectDeviceClass();
    setDeviceClass(detectedClass);

    // Get initial budget
    const initialBudget = manager.getBudget();
    setBudget(initialBudget);

    // Get recommended settings
    const settings = manager.getRecommendedSettings();
    setRecommendedSettings(settings);

    // Set up monitoring if enabled
    if (config?.enableMonitoring !== false) {
      const interval = setInterval(() => {
        const currentBudget = manager.getBudget();
        setBudget(currentBudget);
        
        const settings = manager.getRecommendedSettings();
        setRecommendedSettings(settings);
      }, config?.monitoringInterval || DEFAULT_CONFIG.monitoringInterval);

      return () => clearInterval(interval);
    }
  }, [config, manager, detector]);

  const registerAnimation = useCallback((id: string) => {
    return manager.registerAnimation(id);
  }, [manager]);

  const unregisterAnimation = useCallback((id: string) => {
    manager.unregisterAnimation(id);
  }, [manager]);

  const shouldThrottle = useCallback(() => {
    return manager.shouldThrottle();
  }, [manager]);

  return {
    budget,
    deviceClass,
    recommendedSettings,
    registerAnimation,
    unregisterAnimation,
    shouldThrottle,
  };
}

/**
 * Performance monitoring utilities
 */
export const PerformanceUtils = {
  /**
   * Measure animation performance
   */
  measureAnimation<T>(
    animationFn: () => T,
    onComplete?: (metrics: { duration: number; fps: number }) => void
  ): T {
    const startTime = performance.now();
    const startFrame = requestAnimationFrame(() => {});
    
    const result = animationFn();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (onComplete) {
      const fps = 1000 / duration;
      onComplete({ duration, fps });
    }
    
    return result;
  },

  /**
   * Throttle function based on performance
   */
  throttleByPerformance<T extends (...args: unknown[]) => unknown>(
    fn: T,
    budget: AnimationBudget
  ): T {
    const throttledFn = (...args: Parameters<T>) => {
      if (budget.throttlingFactor >= 0.8) {
        return fn(...args);
      } else if (budget.throttlingFactor >= 0.5) {
        // Throttle to 50% of calls
        if (Math.random() < budget.throttlingFactor) {
          return fn(...args);
        }
      }
      // Skip execution for low performance
    };
    
    return throttledFn as T;
  },

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion(): boolean {
    if (Platform.OS === 'web') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    // For React Native, you would check accessibility settings
    return false;
  },
};
