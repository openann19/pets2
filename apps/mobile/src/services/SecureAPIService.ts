/**
 * Secure API Service with SSL Pinning for PawfectMatch Mobile App
 * Provides certificate pinning and secure HTTP communication
 */
import { fetch as sslFetch } from 'react-native-ssl-pinning';
import { logger } from '../services/logger';
import type { SSLResponse } from '../types/ssl-pinning';
import { SSL_CONFIG, getSSLConfigForDomain } from '../config/sslCertificates';

const BASE_URL =
  process.env['EXPO_PUBLIC_API_URL'] ??
  (__DEV__ ? 'http://localhost:3001/api' : 'https://api.pawfectmatch.com/api');

interface SSLConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface SSLRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  timeoutInterval: number;
  sslPinning: {
    certs: string | Array<{ algorithm: string; value: string }>;
  };
  body?: string;
}

class SecureAPIService {
  private static instance: SecureAPIService | null = null;
  private authToken: string | null = null;

  private constructor() {}

  static getInstance(): SecureAPIService {
    if (SecureAPIService.instance === null) {
      SecureAPIService.instance = new SecureAPIService();
    }
    return SecureAPIService.instance;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Get SSL configuration for a domain
   */
  private getSSLConfig(domain: string): {
    sslPinning: { certs: string | Array<{ algorithm: string; value: string }> };
  } {
    // Use centralized SSL config from config/sslCertificates.ts
    const config = getSSLConfigForDomain(domain);
    return config;
  }

  /**
   * Make a secure HTTP request with SSL pinning
   */
  async request<T = unknown>(endpoint: string, options: RequestInit & SSLConfig = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const domain = new URL(url).hostname;

    const { timeout = 30000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string> | undefined),
    };

    // Add auth token if available
    if (this.authToken !== null) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // SSL pinning configuration
    const sslConfig = this.getSSLConfig(domain);

    const requestConfig: SSLRequestConfig = {
      method: (fetchOptions.method ?? 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE',
      headers,
      timeoutInterval: timeout,
      ...sslConfig,
      ...(fetchOptions.body !== undefined ? { body: String(fetchOptions.body) } : {}),
    };

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.debug(`Secure API request attempt ${String(attempt + 1)}/${String(retries)}`, {
          url,
          method: requestConfig.method,
        });

        // Type-safe SSL fetch with method validation
        // Cast to satisfy react-native-ssl-pinning type requirements
        const sslFetchConfig = {
          method: requestConfig.method,
          headers: requestConfig.headers,
          timeoutInterval: requestConfig.timeoutInterval,
          sslPinning: requestConfig.sslPinning,
          ...(requestConfig.body !== undefined ? { body: requestConfig.body } : {}),
        } as unknown as Parameters<typeof sslFetch>[1];
        
        const response = (await sslFetch(url, sslFetchConfig)) as SSLResponse;
        const status = response.status;
        const ok = status >= 200 && status < 300;
        if (!ok) {
          const statusText = response.statusText || '';
          throw new Error(`HTTP ${String(status)}: ${statusText}`);
        }

        const data = (await response.json()) as T;
        logger.debug('Secure API request successful', {
          url,
          status: response.status,
        });

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn(`Secure API request attempt ${String(attempt + 1)} failed`, {
          url,
          error: lastError,
          attempt: attempt + 1,
          maxRetries: retries,
        });

        // If not the last attempt, wait before retrying
        if (attempt < retries - 1) {
          await new Promise<void>((resolve) => {
            setTimeout(
              () => {
                resolve();
              },
              retryDelay * (attempt + 1),
            );
          });
        }
      }
    }

    // All retries failed
    logger.error('Secure API request failed after all retries', {
      url,
      ...(lastError ? { error: lastError } : {}),
      retries,
    });

    throw new SecureAPIError(
      `Request failed after ${String(retries)} attempts: ${lastError?.message ?? 'Unknown error'}`,
      lastError ?? undefined,
    );
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...(config ?? {}),
      method: 'POST',
      ...(data !== null && data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...(config ?? {}),
      method: 'PUT',
      ...(data !== null && data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Check SSL certificate validity
   */
  async validateCertificate(domain: string): Promise<boolean> {
    try {
      const sslConfig = this.getSSLConfig(domain);
      // Perform a test request to validate SSL pinning
      const testConfig = {
        method: 'HEAD' as const,
        headers: {},
        timeoutInterval: 5000,
        ...sslConfig,
      } as unknown as Parameters<typeof sslFetch>[1];
      await sslFetch(`https://${domain}`, testConfig);
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('SSL certificate validation failed', {
        domain,
        error: err,
      });
      return false;
    }
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): {
    sslEnabled: boolean;
    certificatePinning: boolean;
    supportedDomains: string[];
  } {
    return {
      sslEnabled: SSL_CONFIG.enabled,
      certificatePinning: SSL_CONFIG.enabled,
      supportedDomains: SSL_CONFIG.pinnedDomains,
    };
  }
}

/**
 * Custom error class for secure API errors
 */
export class SecureAPIError extends Error {
  public originalError?: Error | undefined;

  constructor(message: string, originalError?: Error | undefined) {
    super(message);
    this.name = 'SecureAPIError';
    this.originalError = originalError ?? undefined;
  }
}

// Export singleton instance
export const secureAPI = SecureAPIService.getInstance();

// Export types
export type { SSLConfig };
export default secureAPI;
