import {
  apiClient,
  type ApiClientResponse,
  type Pet,
  type User,
  type Match,
  type Message,
  type PetFilters,
} from "@pawfectmatch/core";
import { API_TIMEOUT } from "../config/environment";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestParamValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, RequestParamValue>;
}

const buildQueryString = (
  params: Record<string, RequestParamValue> | undefined,
): string => {
  if (params === undefined) {
    return "";
  }

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null,
  );
  if (entries.length === 0) {
    return "";
  }

  return entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
};

const appendQueryParams = (
  endpoint: string,
  params?: Record<string, RequestParamValue>,
): string => {
  const query = buildQueryString(params);
  if (query.length === 0) {
    return endpoint;
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}${query}`;
};

const hasContentTypeHeader = (
  headers: Record<string, string> | undefined,
): boolean => {
  if (headers === undefined) {
    return false;
  }
  return Object.keys(headers).some(
    (header) => header.toLowerCase() === "content-type",
  );
};

const isFormData = (value: unknown): value is FormData => {
  return typeof FormData !== "undefined" && value instanceof FormData;
};

/**
 * Ensure graceful API response handling with proper error messages
 * Mobile-safe: Provides typed error handling with null-safe checks
 */
const ensureSuccess = <T>(
  response: ApiClientResponse<T>,
  endpoint: string,
): T => {
  if (!response.success) {
    const errorMessage = response.error ?? response.message ?? `Request to ${endpoint} failed`;
    throw new Error(errorMessage);
  }

  // Type-safe null check for response data
  if (response.data === undefined || response.data === null) {
    throw new Error(`Request to ${endpoint} failed: No data returned`);
  }

  return response.data;
};

const resolveData = async <T>(
  requestPromise: Promise<ApiClientResponse<T>>,
  errorMessage: string,
): Promise<T> => {
  const response = await requestPromise;
  if (!response.success) {
    throw new Error(response.error ?? errorMessage);
  }
  if (response.data === undefined || response.data === null) {
    throw new Error(errorMessage);
  }
  return response.data;
};

const resolveBoolean = async (
  requestPromise: Promise<ApiClientResponse<boolean>>,
  errorMessage: string,
): Promise<boolean> => {
  const response = await requestPromise;
  if (!response.success) {
    throw new Error(response.error ?? errorMessage);
  }
  if (response.data === undefined) {
    return true;
  }
  return response.data;
};

const buildRequestConfig = (headers: Record<string, string> | undefined) => {
  if (headers !== undefined) {
    return {
      headers,
      timeout: API_TIMEOUT,
    };
  }

  return { timeout: API_TIMEOUT } as const;
};

export const request = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { method = "GET", body, headers, params } = options;
  const normalizedMethod = method.toUpperCase() as HttpMethod;
  const url = appendQueryParams(endpoint, params);
  const resolvedHeaders: Record<string, string> | undefined = (() => {
    if (isFormData(body)) {
      return headers;
    }

    if (!hasContentTypeHeader(headers) && body !== undefined && body !== null) {
      return {
        ...headers,
        "Content-Type": "application/json",
      };
    }

    return headers;
  })();

  switch (normalizedMethod) {
    case "GET":
      return ensureSuccess(
        await apiClient.get<T>(url, buildRequestConfig(resolvedHeaders)),
        url,
      );
    case "POST":
      return ensureSuccess(
        await apiClient.post<T>(url, body, buildRequestConfig(resolvedHeaders)),
        url,
      );
    case "PUT":
      return ensureSuccess(
        await apiClient.put<T>(url, body, buildRequestConfig(resolvedHeaders)),
        url,
      );
    case "PATCH":
      return ensureSuccess(
        await apiClient.patch<T>(
          url,
          body,
          buildRequestConfig(resolvedHeaders),
        ),
        url,
      );
    case "DELETE":
      return ensureSuccess(
        await apiClient.delete<T>(url, buildRequestConfig(resolvedHeaders)),
        url,
      );
    default:
      throw new Error(`Unsupported HTTP method: ${String(normalizedMethod)}`);
  }
};

// Local type definition for adoption application
interface AdoptionApplication {
  _id: string;
  petId: string;
  applicantId: string;
  applicant: User;
  pet: Pet;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  applicationData: {
    experience: string;
    livingSituation: string;
    otherPets: string;
    timeAlone: string;
    vetReference?: string;
    personalReference?: string;
    additionalInfo?: string;
  };
  submittedAt: string;
}

// API service for mobile app with proper typing
export const matchesAPI = {
  // Get liked you (pets that liked current user)
  getLikedYou: async (): Promise<Match[]> => {
    return resolveData(
      apiClient.get<Match[]>("/matches/liked-you"),
      "Failed to fetch liked you",
    );
  },

  // Get user's matches
  getMatches: async (): Promise<Match[]> => {
    return resolveData(
      apiClient.get<Match[]>("/matches"),
      "Failed to fetch matches",
    );
  },
  // Get user's matches with filter
  getMatchesWithFilter: async (queryString: string): Promise<{ data: { matches: Match[]; pagination: { page: number; limit: number; total: number; pages: number } } }> => {
    const response = await resolveData(
      apiClient.get<{ matches: Match[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/matches?${queryString}`),
      "Failed to fetch matches",
    );
    return { data: response };
  },
  getMatch: async (matchId: string): Promise<Match> => {
    return resolveData(
      apiClient.get<Match>(`/matches/${matchId}`),
      "Failed to fetch match",
    );
  },

  // Create a new match (like/swipe)
  createMatch: async (petId: string, targetPetId: string): Promise<Match> => {
    return resolveData(
      apiClient.post<Match>("/matches", { petId, targetPetId }),
      "Failed to create match",
    );
  },

  // Like a user
  likeUser: async (userId: string): Promise<{ success: boolean }> => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";
    const res = await fetch(`${API_URL}/api/matches/like-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("likeUser failed");
    return res.json();
  },

  // Get chat messages for a match
  getMessages: async (matchId: string): Promise<Message[]> => {
    return resolveData(
      apiClient.get<Message[]>(`/matches/${matchId}/messages`),
      "Failed to fetch messages",
    );
  },

  // Send a message
  sendMessage: async (matchId: string, content: string, replyTo?: { _id: string; author?: string; text?: string }): Promise<Message> => {
    return resolveData(
      apiClient.post<Message>(`/matches/${matchId}/messages`, { content, replyTo }),
      "Failed to send message",
    );
  },

  // Delete a message
  deleteMessage: async (matchId: string, messageId: string): Promise<void> => {
    return resolveData(
      apiClient.delete(`/matches/${matchId}/messages/${messageId}`),
      "Failed to delete message",
    );
  },

  // Chat methods
  chat: {
    // Send typing indicator
    sendTypingIndicator: async (
      matchId: string,
      isTyping: boolean,
    ): Promise<void> => {
      return resolveData(
        apiClient.post(`/matches/${matchId}/typing`, { isTyping }),
        "Failed to send typing indicator",
      );
    },

    // Mark messages as read
    markAsRead: async (
      matchId: string,
      messageIds: string[],
    ): Promise<void> => {
      return resolveData(
        apiClient.put(`/matches/${matchId}/messages/read`, { messageIds }),
        "Failed to mark messages as read",
      );
    },
  },

  // Unmatch with a user
  unmatch: async (matchId: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.delete<boolean>(`/matches/${matchId}`),
      "Failed to unmatch",
    );
  },

  // Block a user from a match
  block: async (matchId: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.post<boolean>(`/matches/${matchId}/block`, {}),
      "Failed to block user",
    );
  },

  // Report a match
  report: async (matchId: string, reason: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.post<boolean>(`/matches/${matchId}/report`, { reason }),
      "Failed to report user",
    );
  },

  // Get pets for swiping
  getPets: async (filters?: PetFilters): Promise<Pet[]> => {
    const queryString =
      filters !== undefined
        ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
        : "";
    return resolveData(
      apiClient.get<Pet[]>(`/pets${queryString}`),
      "Failed to fetch pets",
    );
  },

  // Get user profile
  getUserProfile: async (): Promise<User> => {
    return resolveData(
      apiClient.get<User>("/users/me"),
      "Failed to fetch user profile",
    );
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<User>): Promise<User> => {
    return resolveData(
      apiClient.put<User>("/users/me", profileData),
      "Failed to update user profile",
    );
  },

  // Upload pet photos
  uploadPetPhotos: async (petId: string, photos: FormData): Promise<Pet> => {
    return resolveData(
      apiClient.post<Pet>(`/pets/${petId}/photos`, photos, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      "Failed to upload photos",
    );
  },

  // Get user's pets
  getUserPets: async (): Promise<Pet[]> => {
    return resolveData(
      apiClient.get<Pet[]>("/users/me/pets"),
      "Failed to fetch user pets",
    );
  },

  // Get user statistics
  getUserStats: async (): Promise<{
    matches: number;
    messages: number;
    pets: number;
  }> => {
    return resolveData(
      apiClient.get<{ matches: number; messages: number; pets: number }>(
        "/users/me/stats",
      ),
      "Failed to fetch user statistics",
    );
  },

  // Get pet details
  getPet: async (petId: string): Promise<Pet> => {
    return resolveData(
      apiClient.get<Pet>(`/pets/${petId}`),
      "Failed to fetch pet",
    );
  },

  // Create pet profile
  createPet: async (petData: Partial<Pet>): Promise<Pet> => {
    return resolveData(
      apiClient.post<Pet>("/pets", petData),
      "Failed to create pet",
    );
  },

  // Update pet profile
  updatePet: async (petId: string, petData: Partial<Pet>): Promise<Pet> => {
    return resolveData(
      apiClient.put<Pet>(`/pets/${petId}`, petData),
      "Failed to update pet",
    );
  },

  // Delete pet profile
  deletePet: async (petId: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.delete<boolean>(`/pets/${petId}`),
      "Failed to delete pet",
    );
  },

  // Get adoption applications
  getAdoptionApplications: async (): Promise<AdoptionApplication[]> => {
    return resolveData(
      apiClient.get<AdoptionApplication[]>("/adoption/applications"),
      "Failed to fetch adoption applications",
    );
  },

  // Submit adoption application
  submitAdoptionApplication: async (
    applicationData: Omit<
      AdoptionApplication,
      "_id" | "submittedAt" | "applicant" | "pet"
    >,
  ): Promise<AdoptionApplication> => {
    return resolveData(
      apiClient.post<AdoptionApplication>(
        "/adoption/applications",
        applicationData,
      ),
      "Failed to submit adoption application",
    );
  },

  // Get premium features
  getPremiumFeatures: async (): Promise<Record<string, boolean>> => {
    return resolveData(
      apiClient.get<Record<string, boolean>>("/premium/features"),
      "Failed to fetch premium features",
    );
  },

  // Subscribe to premium
  subscribeToPremium: async (subscriptionData: {
    plan: "basic" | "premium" | "gold";
    paymentMethodId: string;
  }): Promise<{ success: boolean; subscriptionId: string }> => {
    return resolveData(
      apiClient.post<{ success: boolean; subscriptionId: string }>(
        "/premium/subscribe",
        subscriptionData,
      ),
      "Failed to subscribe to premium",
    );
  },

  // Cancel premium subscription
  cancelPremiumSubscription: async (): Promise<boolean> => {
    return resolveBoolean(
      apiClient.post<boolean>("/premium/cancel"),
      "Failed to cancel premium subscription",
    );
  },

  // Get user settings
  getUserSettings: async (): Promise<User["preferences"]> => {
    return resolveData(
      apiClient.get<User["preferences"]>("/users/settings"),
      "Failed to fetch user settings",
    );
  },

  // Update user settings
  updateUserSettings: async (
    settings: User["preferences"],
  ): Promise<User["preferences"]> => {
    return resolveData(
      apiClient.put<User["preferences"]>("/users/settings", settings),
      "Failed to update user settings",
    );
  },

  // Update user preferences (onboarding/initial setup)
  updateUserPreferences: async (
    preferences: User["preferences"],
  ): Promise<User["preferences"]> => {
    return resolveData(
      apiClient.put<User["preferences"]>("/users/preferences", preferences),
      "Failed to update user preferences",
    );
  },

  // Get notifications
  getNotifications: async (): Promise<
    Array<{
      _id: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: string;
    }>
  > => {
    return resolveData(
      apiClient.get<
        Array<{
          _id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          createdAt: string;
        }>
      >("/notifications"),
      "Failed to fetch notifications",
    );
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.put<boolean>(`/notifications/${notificationId}/read`),
      "Failed to mark notification as read",
    );
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.delete<boolean>(`/notifications/${notificationId}`),
      "Failed to delete notification",
    );
  },

  // Get app statistics
  getAppStatistics: async (): Promise<Record<string, number>> => {
    return resolveData(
      apiClient.get<Record<string, number>>("/stats"),
      "Failed to fetch app statistics",
    );
  },

  // Report user or content
  reportContent: async (reportData: {
    type: "user" | "pet" | "message";
    targetId: string;
    reason: string;
    description?: string;
  }): Promise<boolean> => {
    return resolveBoolean(
      apiClient.post<boolean>("/reports", reportData),
      "Failed to submit report",
    );
  },

  // Block user
  blockUser: async (userId: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.post<boolean>("/users/block", { userId }),
      "Failed to block user",
    );
  },

  // Unblock user
  unblockUser: async (userId: string): Promise<boolean> => {
    return resolveBoolean(
      apiClient.post<boolean>("/users/unblock", { userId }),
      "Failed to unblock user",
    );
  },

  // Get blocked users
  getBlockedUsers: async (): Promise<User[]> => {
    return resolveData(
      apiClient.get<User[]>("/users/blocked"),
      "Failed to fetch blocked users",
    );
  },

  // Search pets
  searchPets: async (query: string, filters?: PetFilters): Promise<Pet[]> => {
    const params = new URLSearchParams({
      q: query,
      ...(filters !== undefined ? (filters as Record<string, string>) : {}),
    });
    return resolveData(
      apiClient.get<Pet[]>(`/search/pets?${params.toString()}`),
      "Failed to search pets",
    );
  },

  // Get nearby pets
  getNearbyPets: async (
    latitude: number,
    longitude: number,
    radius?: number,
  ): Promise<Pet[]> => {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
    });
    if (radius !== undefined) {
      params.set("radius", radius.toString());
    }

    return resolveData(
      apiClient.get<Pet[]>(`/pets/nearby?${params.toString()}`),
      "Failed to fetch nearby pets",
    );
  },

  // Get pet compatibility
  getPetCompatibility: async (
    pet1Id: string,
    pet2Id: string,
  ): Promise<{
    compatibility_score: number;
    factors: string[];
    recommendation: string;
  }> => {
    return resolveData(
      apiClient.get<{
        compatibility_score: number;
        factors: string[];
        recommendation: string;
      }>(`/compatibility/${pet1Id}/${pet2Id}`),
      "Failed to fetch pet compatibility",
    );
  },

  // Get user activity
  getUserActivity: async (): Promise<
    Array<{ type: string; description: string; timestamp: string }>
  > => {
    return resolveData(
      apiClient.get<
        Array<{ type: string; description: string; timestamp: string }>
      >("/users/activity"),
      "Failed to fetch user activity",
    );
  },

  // Get app version info
  getAppVersion: async (): Promise<{
    version: string;
    build: string;
    environment: string;
  }> => {
    return resolveData(
      apiClient.get<{ version: string; build: string; environment: string }>(
        "/version",
      ),
      "Failed to fetch app version",
    );
  },

  // ===== GDPR Compliance Methods =====
  // Request account deletion with grace period
  requestAccountDeletion: async (data: {
    reason?: string;
  }): Promise<{
    success: boolean;
    message: string;
    requestId: string;
    scheduledDeletionDate: string;
    canCancel: boolean;
  }> => {
    return resolveData(
      apiClient.post("/account/delete", { reason: data.reason }),
      "Failed to request account deletion",
    );
  },

  // Cancel account deletion (within grace period)
  cancelAccountDeletion: async (data?: {
    requestId?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return resolveData(
      apiClient.post("/account/cancel-deletion", data ?? {}),
      "Failed to cancel account deletion",
    );
  },

  // Get account deletion status
  getAccountDeletionStatus: async (): Promise<{
    success: boolean;
    status: "pending" | "processing" | "completed" | "not-found";
    requestedAt?: string;
    scheduledDeletionDate?: string;
    daysRemaining?: number;
    canCancel?: boolean;
    requestId?: string;
  }> => {
    return resolveData(
      apiClient.get("/account/status"),
      "Failed to get account status",
    );
  },

  // Export user data (GDPR Article 20)
  exportUserData: async (options: {
    format?: "json" | "csv";
    includeMessages?: boolean;
    includeMatches?: boolean;
    includeProfileData?: boolean;
    includePreferences?: boolean;
  }): Promise<{
    success: boolean;
    exportId: string;
    estimatedTime: string;
    message: string;
    exportData?: unknown;
  }> => {
    return resolveData(
      apiClient.post("/account/export-data", options),
      "Failed to export user data",
    );
  },
};

// Premium/Subscription API
export const premiumAPI = {
  getCurrentSubscription: async (): Promise<{
    id: string;
    status: string;
    plan: string;
    currentPeriodEnd: string;
  } | null> => {
    try {
      return await resolveData(
        apiClient.get("/premium/subscription"),
        "Failed to get current subscription",
      );
    } catch {
      return null;
    }
  },
  cancelSubscription: async (): Promise<boolean> => {
    return resolveBoolean(
      apiClient.post("/premium/subscription/cancel"),
      "Failed to cancel subscription",
    );
  },
};

// Adoption API
export const adoptionAPI = {
  getListings: async (): Promise<Pet[]> => {
    return resolveData(
      apiClient.get("/adoption/listings"),
      "Failed to get adoption listings",
    );
  },
  getApplications: async (): Promise<AdoptionApplication[]> => {
    return resolveData(
      apiClient.get("/adoption/applications"),
      "Failed to get adoption applications",
    );
  },
};

// Subscription API for Stripe checkout
export const _subscriptionAPI = {
  createCheckoutSession: async (data: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ url: string }> => {
    return resolveData(
      apiClient.post("/subscription/checkout", data),
      "Failed to create checkout session",
    );
  },
};

// Export the main API service instance
// AI Service API
export const aiAPI = {
  // Generate AI bio for pet
  generateBio: async (data: {
    petName: string;
    keywords: string[];
    tone?: "playful" | "professional" | "casual" | "romantic" | "funny";
    length?: "short" | "medium" | "long";
    petType?: string;
    age?: number;
    breed?: string;
  }): Promise<{
    bio: string;
    keywords: string[];
    sentiment: { score: number; label: string };
    matchScore: number;
  }> => {
    return request("/ai/generate-bio", {
      method: "POST",
      body: data,
    });
  },

  // Analyze pet photos
  analyzePhotos: async (
    photos: string[],
  ): Promise<{
    breed_analysis: {
      primary_breed: string;
      confidence: number;
      secondary_breeds?: Array<{ breed: string; confidence: number }>;
    };
    health_assessment: {
      age_estimate: number;
      health_score: number;
      recommendations: string[];
    };
    photo_quality: {
      overall_score: number;
      lighting_score: number;
      composition_score: number;
      clarity_score: number;
    };
    matchability_score: number;
    ai_insights: string[];
  }> => {
    return request("/ai/analyze-photos", {
      method: "POST",
      body: { photos },
    });
  },

  // Enhanced compatibility analysis
  analyzeCompatibility: async (data: {
    pet1Id: string;
    pet2Id: string;
  }): Promise<{
    compatibility_score: number;
    ai_analysis: string;
    breakdown: {
      personality_compatibility: number;
      lifestyle_compatibility: number;
      activity_compatibility: number;
      social_compatibility: number;
      environment_compatibility: number;
    };
    recommendations: {
      meeting_suggestions: string[];
      activity_recommendations: string[];
      supervision_requirements: string[];
      success_probability: number;
    };
  }> => {
    return request("/ai/enhanced-compatibility", {
      method: "POST",
      body: data,
    });
  },

  // Legacy compatibility (simpler version)
  getCompatibility: async (data: {
    pet1Id: string;
    pet2Id: string;
  }): Promise<{
    score: number;
    analysis: string;
    factors: {
      age_compatibility: boolean;
      size_compatibility: boolean;
      breed_compatibility: boolean;
      personality_match: boolean;
    };
  }> => {
    return request("/ai/compatibility", {
      method: "POST",
      body: data,
    });
  },
};

export async function presignVoice(contentType: string) {
  return resolveData(
    apiClient.post<{ key: string; url: string }>("/uploads/voice/presign", { contentType }),
    "Failed to get presign URL",
  );
}

export async function presignPhoto(contentType: string) {
  return resolveData(
    apiClient.post<{ key: string; url: string }>("/uploads/photos/presign", { contentType }),
    "Failed to get presign URL",
  );
}

export const api = {
  ...matchesAPI,
  chat: matchesAPI.chat,
  ai: aiAPI,
  request,
  presignVoice,
  presignPhoto,
  get: <T = unknown>(url: string, config?: unknown): Promise<T> => {
    return request<T>(url, { method: "GET", headers: config as Record<string, string> });
  },
  post: <T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T> => {
    return request<T>(url, { method: "POST", body: data, headers: config as Record<string, string> });
  },
};

// Re-export admin API for backwards compatibility
export { _adminAPI } from "./adminAPI";
export { api as _petAPI };

// ===== SECURITY CONTROLS =====

/**
 * Rate limiting for API requests
 */
const requestTimestamps: number[] = [];
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

const checkRateLimit = (): boolean => {
  const now = Date.now();

  // Remove old timestamps outside the window
  while (
    requestTimestamps.length > 0 &&
    (requestTimestamps[0] ?? 0) < now - RATE_LIMIT_WINDOW_MS
  ) {
    requestTimestamps.shift();
  }

  // Check if we're over the limit
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Add current request timestamp
  requestTimestamps.push(now);
  return true;
};

/**
 * Validate API endpoint URL
 */
const validateEndpoint = (endpoint: string): boolean => {
  try {
    // Basic validation: should start with / and not contain dangerous characters
    return (
      endpoint.startsWith("/") &&
      !endpoint.includes("..") &&
      !endpoint.includes("<") &&
      !endpoint.includes(">") &&
      endpoint.length < 200
    );
  } catch {
    return false;
  }
};

/**
 * Sanitize request body to prevent injection
 */
const sanitizeRequestBody = (body: unknown): unknown => {
  if (typeof body === "string") {
    // Remove potentially dangerous content
    return body.replace(/[<>"'`]/g, "").substring(0, 10000); // Limit size
  }
  if (typeof body === "object" && body !== null) {
    // For objects, we could implement deep sanitization, but for now just limit size
    const serialized = JSON.stringify(body);
    if (serialized.length > 10000) {
      throw new Error("Request body too large");
    }
    return body;
  }
  return body;
};

/**
 * Enhanced request function with security controls
 */
export const secureRequest = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  // Validate endpoint
  if (!validateEndpoint(endpoint)) {
    throw new Error("Invalid API endpoint");
  }

  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error("API rate limit exceeded");
  }

  // Sanitize request body if present
  const sanitizedOptions = { ...options };
  if (sanitizedOptions.body !== undefined) {
    sanitizedOptions.body = sanitizeRequestBody(sanitizedOptions.body);
  }

  // Add security headers
  const secureHeaders = {
    ...sanitizedOptions.headers,
    "X-Requested-With": "XMLHttpRequest", // Prevent CSRF
  };

  sanitizedOptions.headers = secureHeaders;

  return request<T>(endpoint, sanitizedOptions);
};
