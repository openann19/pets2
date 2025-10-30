/**
 * Type definitions for React Native SSL Pinning
 */

/**
 * Type definitions for React Native SSL Pinning
 */

/**
 * SSL Pinning configuration
 */
export interface SSLPinningConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | string;
  headers: Record<string, string>;
  body?: string;
  timeoutInterval: number;
  sslPinning: {
    certs: string | Array<{ algorithm: string; value: string }>;
  };
}

/**
 * SSL Fetch response type
 */
export interface SSLResponse {
  status: number;
  statusText?: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

/**
 * SSL Fetch function signature
 */
export type SSLFetch = (url: string, config: SSLPinningConfig) => Promise<SSLResponse>;
