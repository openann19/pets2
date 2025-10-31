/**
 * Adaptive Quality Hook
 * 
 * Adjusts quality/features based on device performance and network
 */
import { useState, useEffect, useMemo } from 'react';
import { useNetworkQuality } from '../performance/useNetworkQuality';
import { useQualityTier, type QualityTier } from '@/foundation/quality/useQualityTier';

interface AdaptiveQualityOptions {
  /** Minimum quality level */
  minQuality?: 'low' | 'medium' | 'high';
  /** Maximum quality level */
  maxQuality?: 'low' | 'medium' | 'high';
  /** Whether to adapt to network */
  adaptToNetwork?: boolean;
  /** Whether to adapt to device */
  adaptToDevice?: boolean;
}

type QualityLevel = 'low' | 'medium' | 'high';

/**
 * Hook for adaptive quality based on device and network
 */
export function useAdaptiveQuality(options: AdaptiveQualityOptions = {}) {
  const {
    minQuality = 'low',
    maxQuality = 'high',
    adaptToNetwork = true,
    adaptToDevice = true,
  } = options;

  const networkQuality = useNetworkQuality();
  const deviceQuality = useQualityTier();
  
  const [quality, setQuality] = useState<QualityLevel>('medium');

  useEffect(() => {
    let newQuality: QualityLevel = 'medium';

    // Determine base quality from device
    if (adaptToDevice) {
      if (deviceQuality.tier === 'high') {
        newQuality = 'high';
      } else if (deviceQuality.tier === 'low') {
        newQuality = 'low';
      } else {
        newQuality = 'medium';
      }
    }

    // Adjust based on network
    if (adaptToNetwork) {
      if (networkQuality === 'slow') {
        // Reduce quality on slow network
        if (newQuality === 'high') {
          newQuality = 'medium';
        } else if (newQuality === 'medium') {
          newQuality = 'low';
        }
      } else if (networkQuality === 'offline') {
        newQuality = 'low';
      } else if (networkQuality === 'fast' && newQuality === 'medium') {
        // Can increase quality on fast network if device supports it
        if (deviceQuality.tier !== 'low') {
          newQuality = 'high';
        }
      }
    }

    // Clamp to min/max
    const qualityLevels: QualityLevel[] = ['low', 'medium', 'high'];
    const minIndex = qualityLevels.indexOf(minQuality);
    const maxIndex = qualityLevels.indexOf(maxQuality);
    const currentIndex = qualityLevels.indexOf(newQuality);
    
    if (currentIndex < minIndex) {
      newQuality = minQuality;
    } else if (currentIndex > maxIndex) {
      newQuality = maxQuality;
    }

    setQuality(newQuality);
  }, [networkQuality, deviceQuality, adaptToNetwork, adaptToDevice, minQuality, maxQuality]);

  // Quality-based settings
  const settings = useMemo(() => {
    switch (quality) {
      case 'high':
        return {
          imageQuality: 'high' as const,
          enableAnimations: true,
          enableEffects: true,
          enablePrefetching: true,
          maxConcurrentRequests: 10,
        };
      case 'medium':
        return {
          imageQuality: 'medium' as const,
          enableAnimations: true,
          enableEffects: false,
          enablePrefetching: true,
          maxConcurrentRequests: 5,
        };
      case 'low':
        return {
          imageQuality: 'low' as const,
          enableAnimations: false,
          enableEffects: false,
          enablePrefetching: false,
          maxConcurrentRequests: 3,
        };
    }
  }, [quality]);

  return {
    quality,
    settings,
    networkQuality,
    deviceQuality: deviceQuality.tier,
  };
}

/**
 * Hook for adaptive image quality
 */
export function useAdaptiveImageQuality() {
  const { quality, networkQuality } = useAdaptiveQuality({
    adaptToNetwork: true,
    adaptToDevice: true,
  });

  const getImageUrl = useMemo(() => {
    return (baseUrl: string, variants?: { low?: string; medium?: string; high?: string }) => {
      if (!variants) return baseUrl;

      switch (quality) {
        case 'high':
          return variants.high || variants.medium || variants.low || baseUrl;
        case 'medium':
          return variants.medium || variants.low || baseUrl;
        case 'low':
          return variants.low || baseUrl;
      }
    };
  }, [quality]);

  const getImagePriority = useMemo(() => {
    return (): 'low' | 'normal' | 'high' => {
      if (networkQuality === 'fast') {
        return 'high';
      } else if (networkQuality === 'slow') {
        return 'low';
      }
      return 'normal';
    };
  }, [networkQuality]);

  return {
    quality,
    getImageUrl,
    getImagePriority,
    networkQuality,
  };
}
