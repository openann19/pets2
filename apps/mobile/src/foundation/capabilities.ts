/**
 * Device Capabilities Hook
 * Provides device capability information for adaptive features
 */

import { useMemo } from 'react';
import * as Device from 'expo-device';

export interface Capabilities {
  highPerf: boolean;
  thermalsOk: boolean;
  skia: boolean;
  gpuAccelerated: boolean;
  memoryAvailable: boolean;
}

/**
 * Hook to determine device capabilities for adaptive feature rendering
 * Gates heavy animations and effects based on device capabilities
 */
export function useCapabilities(): Capabilities {
  return useMemo(() => {
    // Check device model/tier for performance
    const deviceYear = Device.modelYear ?? 0;
    const isRecentDevice = deviceYear >= 2020;

    // Assume high performance for recent devices
    // In production, this could check actual device specs
    const highPerf = isRecentDevice;

    // Assume thermal state is ok (in production, would check actual thermal state)
    const thermalsOk = true;

    // Check if Skia is available (React Native Skia support)
    // For now, assume available on supported platforms
    const skia = true;

    // GPU acceleration available
    const gpuAccelerated = true;

    // Memory available (could check actual memory in production)
    const memoryAvailable = true;

    return {
      highPerf,
      thermalsOk,
      skia,
      gpuAccelerated,
      memoryAvailable,
    };
  }, []);
}
