/**
 * Extended browser API type definitions
 * Covers experimental and non-standard browser APIs
 */

// Extended Navigator interface for experimental APIs
interface Navigator {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connection?: NetworkInformation;
}

// Extended Performance interface for memory API
interface Performance {
  memory?: PerformanceMemory;
}

interface PerformanceMemory {
  readonly usedJSHeapSize: number;
  readonly totalJSHeapSize: number;
  readonly jsHeapSizeLimit: number;
}

// NetworkInformation interface
interface NetworkInformation extends EventTarget {
  readonly effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  readonly type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
}

// Extended Window interface for garbage collection
interface Window {
  gc?: () => void;
}

// Add to global scope
declare global {
  interface Navigator {
    readonly deviceMemory?: number;
    readonly hardwareConcurrency?: number;
    readonly connection?: NetworkInformation;
  }

  interface Performance {
    memory?: PerformanceMemory;
  }

  interface NetworkInformation extends EventTarget {
    readonly effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    readonly downlink?: number;
    readonly rtt?: number;
    readonly saveData?: boolean;
    readonly type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  }

  interface Window {
    gc?: () => void;
  }
}

export {};

