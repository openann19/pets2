import { apiClient, type ApiClientResponse } from '@pawfectmatch/core';
import type { AdminApiResponse, AdminUser, AdminStats, AdminChat, AdminUpload, AdminAnalytics, AdminFilter, SecurityAlert } from '../types';

// Platform-agnostic API service using @pawfectmatch/core apiClient
export class AdminAPIService {
  private basePath: string;

  constructor(basePath = '/admin') {
    this.basePath = basePath;
  }

  /**
   * Convert ApiClientResponse to AdminApiResponse
   */
  private convertResponse<T>(response: ApiClientResponse<T>): AdminApiResponse<T> {
    const result: AdminApiResponse<T> = {
      success: response.success ?? true,
      data: response.data as T,
    };
    
    if (response.message !== undefined) {
      result.message = response.message;
    }
    
    return result;
  }

  /**
   * Handle API errors and convert to AdminApiResponse format
   */
  private async request<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: unknown): Promise<AdminApiResponse<T>> {
    try {
      const url = `${this.basePath}${endpoint}`;
      let response: ApiClientResponse<T>;

      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(url);
          break;
        case 'POST':
          response = await apiClient.post<T>(url, data);
          break;
        case 'PUT':
          response = await apiClient.put<T>(url, data);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(url);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return this.convertResponse(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : `Admin API error: ${String(error)}`);
    }
  }

  // User Management
  async getUsers(filters: AdminFilter = {}): Promise<AdminApiResponse<AdminUser[]>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return this.request<AdminUser[]>(`/users${queryString ? `?${queryString}` : ''}`, 'GET');
  }

  async getUserDetails(userId: string): Promise<AdminApiResponse<AdminUser>> {
    return this.request<AdminUser>(`/users/${userId}`, 'GET');
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminApiResponse<AdminUser>> {
    return this.request<AdminUser>(`/users/${userId}`, 'PUT', updates);
  }

  // Analytics
  async getStats(): Promise<AdminApiResponse<AdminStats>> {
    return this.request<AdminStats>('/stats', 'GET');
  }

  async getAnalytics(filters: AdminFilter = {}): Promise<AdminApiResponse<AdminAnalytics>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return this.request<AdminAnalytics>(`/analytics${queryString ? `?${queryString}` : ''}`, 'GET');
  }

  // Chat Management
  async getChats(filters: AdminFilter = {}): Promise<AdminApiResponse<AdminChat[]>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return this.request<AdminChat[]>(`/chats${queryString ? `?${queryString}` : ''}`, 'GET');
  }

  async moderateChat(chatId: string, action: 'block' | 'unblock', reason?: string): Promise<AdminApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/chats/${chatId}/moderate`, 'POST', { action, reason });
  }

  // Content Moderation
  async getUploads(filters: AdminFilter = {}): Promise<AdminApiResponse<AdminUpload[]>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return this.request<AdminUpload[]>(`/uploads${queryString ? `?${queryString}` : ''}`, 'GET');
  }

  async moderateUpload(uploadId: string, action: 'approve' | 'reject', reason?: string): Promise<AdminApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/uploads/${uploadId}/moderate`, 'POST', { action, reason });
  }

  // Security
  async getSecurityAlerts(filters: AdminFilter = {}): Promise<AdminApiResponse<SecurityAlert[]>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return this.request<SecurityAlert[]>(`/security/alerts${queryString ? `?${queryString}` : ''}`, 'GET');
  }

  async resolveSecurityAlert(alertId: string, action: string, notes?: string): Promise<AdminApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/security/alerts/${alertId}/resolve`, 'POST', { action, notes });
  }
}

// Singleton instance
let adminAPIService: AdminAPIService;

export const getAdminAPI = (): AdminAPIService => {
  if (!adminAPIService) {
    adminAPIService = new AdminAPIService();
  }
  return adminAPIService;
};
