import { logger } from "@pawfectmatch/core";

/**
 * Admin API Service for Mobile
 * Handles all admin-related API calls
 */

const BASE_URL =
  process.env["EXPO_PUBLIC_API_URL"] ?? "http://localhost:3001/api";

interface AdminAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginationParams {
  page?: number | null;
  limit?: number | null;
  search?: string | null;
  status?: string | null;
  role?: string | null;
  verified?: string | null;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  pets: Array<{
    _id: string;
    name: string;
    species: string;
    photos: Array<{ url: string }>;
  }>;
}

interface Chat {
  _id: string;
  user1: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  user2: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  pet1: {
    _id: string;
    name: string;
    species: string;
    photos: Array<{ url: string }>;
  };
  pet2: {
    _id: string;
    name: string;
    species: string;
    photos: Array<{ url: string }>;
  };
  status: string;
  isBlocked: boolean;
  createdAt: string;
  messageCount: number;
}

interface Upload {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  status: string;
  uploadedAt: string;
}

interface Verification {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  status: string;
  documents: Array<{
    type: string;
    url: string;
    publicId: string;
    uploadedAt: string;
  }>;
  submittedAt: string;
}

class AdminAPIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<AdminAPIResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string> | undefined),
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`);
      }

      return (await response.json()) as AdminAPIResponse<T>;
    } catch (error) {
      logger.error("Admin API request failed", { endpoint, error });
      throw error;
    }
  }

  // User Management
  async getUsers(params: PaginationParams = {}): Promise<
    AdminAPIResponse<{
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params.page !== null && params.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params.limit !== null && params.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (
      params.search !== null &&
      params.search !== undefined &&
      params.search !== ""
    )
      queryParams.append("search", params.search);
    if (
      params.status !== null &&
      params.status !== undefined &&
      params.status !== ""
    )
      queryParams.append("status", params.status);
    if (params.role !== null && params.role !== undefined && params.role !== "")
      queryParams.append("role", params.role);
    if (
      params.verified !== null &&
      params.verified !== undefined &&
      params.verified !== ""
    )
      queryParams.append("verified", params.verified);

    return await this.request(`/admin/users?${queryParams.toString()}`);
  }

  async getUserDetails(userId: string): Promise<
    AdminAPIResponse<{
      user: User;
      stats: {
        petCount: number;
        matchCount: number;
        messageCount: number;
      };
    }>
  > {
    return await this.request(`/admin/users/${userId}`);
  }

  async suspendUser(
    userId: string,
    reason: string,
    duration?: number,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/users/${userId}/suspend`, {
      method: "PUT",
      body: JSON.stringify({ reason, duration }),
    });
  }

  async banUser(
    userId: string,
    reason: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/users/${userId}/ban`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(
    userId: string,
    reason: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/users/${userId}/activate`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  // Chat Management
  async getChats(params: PaginationParams = {}): Promise<
    AdminAPIResponse<{
      chats: Chat[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params.page !== null && params.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params.limit !== null && params.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (
      params.status !== null &&
      params.status !== undefined &&
      params.status !== ""
    )
      queryParams.append("status", params.status);

    return await this.request(`/admin/chats?${queryParams.toString()}`);
  }

  async getChatDetails(chatId: string): Promise<
    AdminAPIResponse<{
      chat: Chat;
      messages: Array<{
        _id: string;
        sender: {
          _id: string;
          firstName: string;
          lastName: string;
        };
        content: string;
        type: string;
        createdAt: string;
        isDeleted: boolean;
      }>;
    }>
  > {
    return await this.request(`/admin/chats/${chatId}`);
  }

  async blockChat(
    chatId: string,
    reason: string,
    duration?: number,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/chats/${chatId}/block`, {
      method: "PUT",
      body: JSON.stringify({ reason, duration }),
    });
  }

  async unblockChat(
    chatId: string,
    reason: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/chats/${chatId}/unblock`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  async deleteMessage(
    chatId: string,
    messageId: string,
    reason: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/chats/${chatId}/messages/${messageId}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    });
  }

  // Upload Management
  async getUploads(params: PaginationParams = {}): Promise<
    AdminAPIResponse<{
      uploads: Upload[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params.page !== null && params.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params.limit !== null && params.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (
      params.status !== null &&
      params.status !== undefined &&
      params.status !== ""
    )
      queryParams.append("status", params.status);

    return await this.request(`/admin/uploads?${queryParams.toString()}`);
  }

  async getUploadDetails(uploadId: string): Promise<
    AdminAPIResponse<{
      upload: Upload;
    }>
  > {
    return await this.request(`/admin/uploads/${uploadId}`);
  }

  async approveUpload(
    uploadId: string,
    notes?: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/uploads/${uploadId}/approve`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  }

  async rejectUpload(
    uploadId: string,
    reason: string,
    notes?: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/uploads/${uploadId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason, notes }),
    });
  }

  async deleteUpload(
    uploadId: string,
    reason: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/uploads/${uploadId}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    });
  }

  // Verification Management
  async getVerifications(params: PaginationParams = {}): Promise<
    AdminAPIResponse<{
      verifications: Verification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params.page !== null && params.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params.limit !== null && params.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (
      params.status !== null &&
      params.status !== undefined &&
      params.status !== ""
    )
      queryParams.append("status", params.status);

    return await this.request(
      `/admin/verifications/pending?${queryParams.toString()}`,
    );
  }

  async getVerificationDetails(verificationId: string): Promise<
    AdminAPIResponse<{
      verification: Verification;
    }>
  > {
    return await this.request(`/admin/verifications/${verificationId}`);
  }

  async approveVerification(
    verificationId: string,
    notes?: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(
      `/admin/verifications/${verificationId}/approve`,
      {
        method: "PUT",
        body: JSON.stringify({ notes }),
      },
    );
  }

  async rejectVerification(
    verificationId: string,
    reason: string,
    notes?: string,
  ): Promise<AdminAPIResponse<unknown>> {
    return await this.request(`/admin/verifications/${verificationId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason, notes }),
    });
  }

  // Analytics
  async getAnalytics(params?: { period?: string }): Promise<
    AdminAPIResponse<{
      users: {
        total: number;
        active: number;
        suspended: number;
        banned: number;
        verified: number;
        recent24h: number;
      };
      pets: {
        total: number;
        active: number;
        recent24h: number;
      };
      matches: {
        total: number;
        active: number;
        blocked: number;
        recent24h: number;
      };
      messages: {
        total: number;
        deleted: number;
        recent24h: number;
      };
    }>
  > {
    const queryParams =
      params?.period !== undefined && params.period !== ""
        ? `?period=${params.period}`
        : "";
    return await this.request(`/admin/analytics${queryParams}`);
  }

  async getSystemHealth(): Promise<
    AdminAPIResponse<{
      status: string;
      uptime: number;
      database: {
        status: string;
        connected: boolean;
      };
      memory: {
        used: number;
        total: number;
        external: number;
      };
      environment: string;
    }>
  > {
    return await this.request("/admin/system/health");
  }

  async getAuditLogs(params: PaginationParams = {}): Promise<
    AdminAPIResponse<{
      logs: unknown[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params.page !== null && params.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params.limit !== null && params.limit !== undefined)
      queryParams.append("limit", String(params.limit));

    return await this.request(
      `/admin/security/audit-logs?${queryParams.toString()}`,
    );
  }

  // Security & Monitoring
  async getSecurityAlerts(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }): Promise<AdminAPIResponse<{ alerts: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params?.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (params?.sort !== undefined && params.sort !== "")
      queryParams.append("sort", params.sort);
    if (params?.order !== undefined && params.order !== "")
      queryParams.append("order", params.order);
    const query = queryParams.toString();
    return await this.request(
      `/admin/security/alerts${query !== "" ? `?${query}` : ""}`,
    );
  }

  // Chat Message Management
  async getChatMessages(
    params: PaginationParams & {
      filter?: "all" | "flagged" | "unreviewed";
      search?: string;
    },
  ): Promise<
    AdminAPIResponse<{
      messages: Array<{
        id: string;
        chatId: string;
        senderId: string;
        senderName: string;
        receiverId: string;
        receiverName: string;
        message: string;
        timestamp: string;
        flagged: boolean;
        flagReason?: string;
        reviewed: boolean;
        reviewedBy?: string;
        reviewedAt?: string;
        action?: "approved" | "removed" | "warned";
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (params.filter !== undefined && params.filter !== "all")
      queryParams.append("filter", params.filter);
    if (params.search !== undefined && params.search !== "")
      queryParams.append("search", params.search);

    return await this.request(`/admin/chat-messages?${queryParams.toString()}`);
  }

  // Billing & Subscriptions
  async getSubscriptions(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }): Promise<
    AdminAPIResponse<{
      subscriptions: unknown[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params?.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (params?.sort !== undefined && params.sort !== "")
      queryParams.append("sort", params.sort);
    if (params?.order !== undefined && params.order !== "")
      queryParams.append("order", params.order);
    const query = queryParams.toString();
    return await this.request(
      `/admin/subscriptions${query !== "" ? `?${query}` : ""}`,
    );
  }

  async getBillingMetrics(): Promise<AdminAPIResponse<unknown>> {
    return await this.request("/admin/billing/metrics");
  }

  async getSecurityMetrics(): Promise<AdminAPIResponse<unknown>> {
    return await this.request("/admin/security/metrics");
  }

  async moderateMessage(params: {
    messageId: string;
    action: "approve" | "remove" | "warn";
  }): Promise<
    AdminAPIResponse<{
      success: boolean;
      message: string;
      moderatedMessage: {
        id: string;
        action: "approved" | "removed" | "warned";
        moderatedAt: string;
        moderatedBy: string;
      };
    }>
  > {
    return await this.request(
      `/admin/chat-messages/${params.messageId}/moderate`,
      {
        method: "PUT",
        body: JSON.stringify({ action: params.action }),
      },
    );
  }
}

export const _adminAPI = new AdminAPIService();
