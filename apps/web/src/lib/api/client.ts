import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiClientConfig extends AxiosRequestConfig {
  [key: string]: unknown;
}

class ApiClient {
  client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig): AxiosRequestConfig => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: Error): Promise<never> => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => response,
      (error: Error): Promise<never> => {
        if ((error as any)?.response?.status === 401) {
          // Handle token refresh or logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T = unknown>(url: string, config?: ApiClientConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      const err = error as any;
      throw new Error(err.response?.data?.message || err.message || 'Request failed');
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: ApiClientConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      const err = error as any;
      throw new Error(err.response?.data?.message || err.message || 'Request failed');
    }
  }

  async put<T = unknown>(url: string, data?: unknown, config?: ApiClientConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      const err = error as any;
      throw new Error(err.response?.data?.message || err.message || 'Request failed');
    }
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: ApiClientConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      const err = error as any;
      throw new Error(err.response?.data?.message || err.message || 'Request failed');
    }
  }

  async delete<T = unknown>(url: string, config?: ApiClientConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      const err = error as any;
      throw new Error(err.response?.data?.message || err.message || 'Request failed');
    }
  }

  // File upload helper
  async uploadFile<T = unknown>(
    url: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }
      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as any;
      throw new Error(err.response?.data?.message || err.message || 'Upload failed');
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
//# sourceMappingURL=client.js.map