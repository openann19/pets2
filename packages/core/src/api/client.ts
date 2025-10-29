import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosHeaders } from 'axios';
import { getLocalStorage, redirectTo } from '../utils/environment';

// Generic API response wrapper
export interface ApiClientResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Error response structure
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

// Request configuration types
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

// File upload configuration
export interface FileUploadConfig {
  file: File;
  additionalData?: Record<string, string | number | boolean>;
  onProgress?: (progress: number) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const storage = getLocalStorage();
        const token = storage?.getItem('accessToken');
        if (typeof token === 'string' && token.trim().length > 0) {
          const bearerToken = `Bearer ${token.trim()}`;
          const headers = isAxiosHeaders(config.headers)
            ? config.headers
            : new AxiosHeaders((config.headers as Record<string, string> | undefined) ?? {});
          headers.set('Authorization', bearerToken);
          config.headers = headers;
        }

        return config;
      },
      (error: unknown) =>
        Promise.reject(new Error(extractErrorMessage(error, 'Request interceptor failed'))),
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: unknown) => {
        console.error('Response interceptor error:', extractErrorMessage(error, 'Unknown error'));
        if (isAxiosErrorLike(error)) {
          if (error.response?.status === 401) {
            const storage = getLocalStorage();
            storage?.removeItem('accessToken');
            storage?.removeItem('refreshToken');
            redirectTo('/login');
          }

          const statusCode = error.response?.status;
          return Promise.reject(
            new Error(`API request failed: ${statusCode?.toString() ?? 'Unknown error'}`),
          );
        }
        return Promise.reject(new Error(extractErrorMessage(error, 'Response interceptor failed')));
      },
    );
  }

  // Generic request methods with proper error handling
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.get<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, 'Request failed'));
    }
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.post<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, 'Request failed'));
    }
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.put<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, 'Request failed'));
    }
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.patch<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, 'Request failed'));
    }
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.delete<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, 'Request failed'));
    }
  }

  // File upload helper with proper typing
  async uploadFile<T = unknown>(
    url: string,
    config: FileUploadConfig,
  ): Promise<ApiClientResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', config.file);

      if (config.additionalData != null) {
        Object.entries(config.additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const axiosConfig: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (config.onProgress != null) {
        axiosConfig.onUploadProgress = (progressEvent): void => {
          if (progressEvent.total != null && progressEvent.total > 0) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            (config.onProgress as (progress: number) => void)(progress);
          }
        };
      }

      const response = await this.client.post<ApiClientResponse<T>>(url, formData, axiosConfig);

      return response.data;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, 'Upload failed'));
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

type AxiosErrorLike = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const isAxiosErrorLike = (error: unknown): error is AxiosErrorLike => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

const isAxiosHeaders = (headers: unknown): headers is AxiosHeaders => {
  return (
    typeof headers === 'object' &&
    headers !== null &&
    'set' in headers &&
    typeof (headers as { set?: unknown }).set === 'function'
  );
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosErrorLike(error)) {
    const message = error.response?.data?.message ?? error.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }

  return fallback;
};
