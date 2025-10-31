/**
 * Extended Navigator types for web APIs
 * Provides type safety for experimental/optional navigator properties
 */

interface Navigator {
  /**
   * Device memory in GB (experimental API)
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
   */
  readonly deviceMemory?: number;

  /**
   * Network connection information (experimental API)
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection
   */
  readonly connection?: NetworkInformation;
  readonly mozConnection?: NetworkInformation;
  readonly webkitConnection?: NetworkInformation;
}

interface NetworkInformation extends EventTarget {
  readonly effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  readonly type?: ConnectionType;
}

type ConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'mixed'
  | 'none'
  | 'other'
  | 'unknown'
  | 'wifi'
  | 'wimax';

