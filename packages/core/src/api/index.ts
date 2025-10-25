/**
 * API Client and Types
 */

// Export API client
export {
  apiClient,
  type ApiClientResponse,
  type ApiClientError,
  type FileUploadConfig,
} from './client';
export type { RequestConfig as ApiClientRequestConfig } from './client';

// Export unified API client and infrastructure
export * from './UnifiedAPIClient';
export * from './CircuitBreaker';
export * from './RequestRetryStrategy';
export * from './OfflineQueueManager';
export * from './APIErrorClassifier';
export * from './RecoveryStrategies';
export * from './RateLimiter';

// Export hooks
export * from './hooks';
