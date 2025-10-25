import type {
  Pet,
  User,
  UserPreferences,
  Match,
  Message,
  PetFilters,
  AuthResponse,
  UserProfileResponse,
  PetCreateResponse,
  SubscriptionResponse,
  CheckoutSessionResponse,
  SwipeRecommendationResponse,
  SwipeActionResponse,
  AIBioGenerationResponse,
  AIPhotoAnalysisResponse,
  AICompatibilityResponse,
} from "@pawfectmatch/core";
import apiClient, { type ApiClientResponse } from "./apiClient";
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

const ensureSuccess = <T>(
  response: ApiClientResponse<T>,
  endpoint: string,
): T => {
  if (response.success !== true) {
    const errorMessage =
      "error" in response && typeof response.error === "string"
        ? response.error
        : `Request to ${endpoint} failed`;
    throw new Error(errorMessage);
  }

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
  if (response.success !== true) {
    const message =
      "error" in response && typeof response.error === "string"
        ? response.error
        : errorMessage;
    throw new Error(message);
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
  if (response.success !== true) {
    const message =
      "error" in response && typeof response.error === "string"
        ? response.error
        : errorMessage;
    throw new Error(message);
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

const resolveHeadersForBody = (
  body: unknown,
  headers: Record<string, string> | undefined,
): Record<string, string> | undefined => {
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
};

export const request = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { method = "GET", body, headers, params } = options;
  const normalizedMethod = method.toUpperCase() as HttpMethod;
  const url = appendQueryParams(endpoint, params);
  const resolvedHeaders = resolveHeadersForBody(body, headers);

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

export const get = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiClientResponse<T>> => {
  const url = appendQueryParams(endpoint, options.params);
  return apiClient.get<T>(url, buildRequestConfig(options.headers));
};

export const post = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<ApiClientResponse<T>> => {
  const url = appendQueryParams(endpoint, options.params);
  const resolvedHeaders = resolveHeadersForBody(body, options.headers);
  return apiClient.post<T>(url, body, buildRequestConfig(resolvedHeaders));
};

export const put = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<ApiClientResponse<T>> => {
  const url = appendQueryParams(endpoint, options.params);
  const resolvedHeaders = resolveHeadersForBody(body, options.headers);
  return apiClient.put<T>(url, body, buildRequestConfig(resolvedHeaders));
};

export const patch = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<ApiClientResponse<T>> => {
  const url = appendQueryParams(endpoint, options.params);
  const resolvedHeaders = resolveHeadersForBody(body, options.headers);
  return apiClient.patch<T>(url, body, buildRequestConfig(resolvedHeaders));
};

export const deleteRequest = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiClientResponse<T>> => {
  const url = appendQueryParams(endpoint, options.params);
  return apiClient.delete<T>(url, buildRequestConfig(options.headers));
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

// Support response types
interface SupportTicketResponse {
  success: boolean;
  data: {
    id: string;
    userId: string;
    subject: string;
    message: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface BugReportResponse {
  success: boolean;
  data: {
    id: string;
    userId: string;
    title: string;
    description: string;
    stepsToReproduce?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    deviceInfo?: string;
    appVersion?: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

// Authentication API methods
export const authAPI = {
  // Login with email and password
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  // Register new user
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: data,
    });
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },

  // Biometric login
  biometricLogin: async (data: {
    email: string;
    biometricToken: string;
  }): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/biometric-login", {
      method: "POST",
      body: data,
    });
  },

  // Forgot password
  forgotPassword: async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: { email },
      },
    );
  },

  // Reset password
  resetPassword: async (data: {
    token: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(
      "/auth/reset-password",
      {
        method: "POST",
        body: data,
      },
    );
  },

  // Get current user
  getCurrentUser: async (): Promise<UserProfileResponse> => {
    return request<UserProfileResponse>("/auth/me");
  },

  // Logout
  logout: async (): Promise<void> => {
    await request("/auth/logout", { method: "POST" });
  },
};

// Swipe API methods
export const swipeAPI = {
  // Get pet recommendations for swiping
  getRecommendations: async (
    filters?: PetFilters,
  ): Promise<SwipeRecommendationResponse> => {
    const params = filters
      ? {
          ...filters,
          personalityTags: filters.personalityTags?.join(","),
        }
      : {};
    return request<SwipeRecommendationResponse>("/swipe/recommendations", {
      params,
    });
  },

  // Like a pet
  like: async (petId: string): Promise<SwipeActionResponse> => {
    return request<SwipeActionResponse>("/swipe/like", {
      method: "POST",
      body: { petId },
    });
  },

  // Pass on a pet
  pass: async (petId: string): Promise<SwipeActionResponse> => {
    return request<SwipeActionResponse>("/swipe/pass", {
      method: "POST",
      body: { petId },
    });
  },

  // Super like a pet (premium)
  superLike: async (petId: string): Promise<SwipeActionResponse> => {
    return request<SwipeActionResponse>("/swipe/superlike", {
      method: "POST",
      body: { petId },
    });
  },

  // Undo last swipe (premium)
  undo: async (): Promise<SwipeActionResponse> => {
    return request<SwipeActionResponse>("/swipe/undo", {
      method: "POST",
    });
  },
};

// Pet API methods
export const petAPI = {
  // Create pet profile
  createPet: async (petData: Partial<Pet>): Promise<PetCreateResponse> => {
    return request<PetCreateResponse>("/pets", {
      method: "POST",
      body: petData,
    });
  },

  // Get user's pets
  getUserPets: async (): Promise<PetCreateResponse[]> => {
    return request<PetCreateResponse[]>("/pets/my-pets");
  },

  // Get pet by ID
  getPet: async (petId: string): Promise<PetCreateResponse> => {
    return request<PetCreateResponse>(`/pets/${petId}`);
  },

  // Update pet profile
  updatePet: async (
    petId: string,
    petData: Partial<Pet>,
  ): Promise<PetCreateResponse> => {
    return request<PetCreateResponse>(`/pets/${petId}`, {
      method: "PUT",
      body: petData,
    });
  },

  // Delete pet profile
  deletePet: async (petId: string): Promise<boolean> => {
    return request<boolean>(`/pets/${petId}`, { method: "DELETE" });
  },

  // Upload pet photos
  uploadPhotos: async (
    petId: string,
    photos: FormData,
  ): Promise<PetCreateResponse> => {
    return request<PetCreateResponse>(`/pets/${petId}/photos`, {
      method: "POST",
      body: photos,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Subscription API methods
export const subscriptionAPI = {
  // Get current subscription
  getCurrentSubscription: async (): Promise<SubscriptionResponse | null> => {
    try {
      return await request<SubscriptionResponse>("/subscription/current");
    } catch (_error) {
      return null;
    }
  },

  // Create checkout session
  createCheckoutSession: async (data: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, unknown>;
  }): Promise<CheckoutSessionResponse> => {
    return request<CheckoutSessionResponse>("/subscription/create-checkout", {
      method: "POST",
      body: data,
    });
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<boolean> => {
    return request<boolean>("/subscription/cancel", { method: "POST" });
  },

  // Reactivate subscription
  reactivateSubscription: async (): Promise<boolean> => {
    return request<boolean>("/subscription/reactivate", { method: "POST" });
  },

  // Update payment method
  updatePaymentMethod: async (paymentMethodId: string): Promise<boolean> => {
    return request<boolean>("/subscription/payment-method", {
      method: "PUT",
      body: { paymentMethodId },
    });
  },
};

// API service for mobile app with proper typing
export const matchesAPI = {
  // Get liked you (pets that liked current user)
  getLikedYou: async (): Promise<Match[]> => {
    return resolveData(
      apiClient.get<Match[]>("/matches/liked-you"),
      "Failed to fetch liked you",
    );
  },

  // Get matches
  getMatches: async (): Promise<Match[]> => {
    return resolveData(
      apiClient.get<Match[]>("/matches"),
      "Failed to fetch matches",
    );
  },

  // Get a specific match
  getMatch: async (matchId: string): Promise<Match> => {
    return resolveData(
      apiClient.get<Match>(`/matches/${matchId}`),
      "Failed to fetch match",
    );
  },

  // Create a match
  createMatch: async (petId: string, targetPetId: string): Promise<Match> => {
    return resolveData(
      apiClient.post<Match>("/matches", { petId, targetPetId }),
      "Failed to create match",
    );
  },

  // Get chat messages for a match
  getMessages: async (matchId: string): Promise<Message[]> => {
    return resolveData(
      apiClient.get<Message[]>(`/matches/${matchId}/messages`),
      "Failed to fetch messages",
    );
  },

  // Send a message
  sendMessage: async (matchId: string, content: string): Promise<Message> => {
    return resolveData(
      apiClient.post<Message>(`/matches/${matchId}/messages`, { content }),
      "Failed to send message",
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
  getUserSettings: async (): Promise<UserPreferences> => {
    return resolveData(
      apiClient.get<UserPreferences>("/users/settings"),
      "Failed to fetch user settings",
    );
  },

  // Update user settings
  updateUserSettings: async (
    settings: UserPreferences,
  ): Promise<UserPreferences> => {
    return resolveData(
      apiClient.put<UserPreferences>("/users/settings", settings),
      "Failed to update user settings",
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

  // Deactivate account
  deactivateAccount: async (data: {
    reason: string;
    feedback?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>("/users/deactivate", {
      method: "POST",
      body: data,
    });
  },

  // Delete account (GDPR Article 17 - Right to erasure)
  deleteAccount: async (data: {
    password: string;
    reason?: string;
    feedback?: string;
  }): Promise<{
    success: boolean;
    message: string;
    gracePeriodEndsAt: string;
  }> => {
    return request<{
      success: boolean;
      message: string;
      gracePeriodEndsAt: string;
    }>("/users/delete-account", {
      method: "POST",
      body: data,
    });
  },

  // Export user data (GDPR Article 20 - Right to data portability)
  exportUserData: async (): Promise<{
    success: boolean;
    downloadUrl: string;
    expiresAt: string;
  }> => {
    return request<{
      success: boolean;
      downloadUrl: string;
      expiresAt: string;
    }>("/users/export-data", {
      method: "POST",
    });
  },

  // Confirm account deletion (after grace period)
  confirmDeleteAccount: async (
    token: string,
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>("/users/confirm-deletion", {
      method: "POST",
      body: { token },
    });
  },

  // Cancel account deletion (during grace period)
  cancelDeleteAccount: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    return request<{ success: boolean; message: string }>(
      "/users/cancel-deletion",
      {
        method: "POST",
      },
    );
  },

  // Export chat history (GDPR)
  exportChat: async (matchId: string): Promise<{
    success: boolean;
    downloadUrl: string;
    expiresAt: string;
  }> => {
    return request<{
      success: boolean;
      downloadUrl: string;
      expiresAt: string;
    }>(`/chat/${matchId}/export`, {
      method: "POST",
    });
  },

  // Clear chat history
  clearChatHistory: async (matchId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return request<{ success: boolean; message: string }>(
      `/chat/${matchId}/clear`,
      {
        method: "DELETE",
      },
    );
  },

  // Unmatch user
  unmatchUser: async (matchId: string): Promise<{
    success: boolean;
    message: string;
    gracePeriodEndsAt: string;
  }> => {
    return request<{
      success: boolean;
      message: string;
      gracePeriodEndsAt: string;
    }>(`/matches/${matchId}/unmatch`, {
      method: "DELETE",
    });
  },

  // Add message reaction
  addMessageReaction: async (messageId: string, emoji: string): Promise<Message> => {
    return resolveData(
      apiClient.post<Message>(`/messages/${messageId}/react`, { emoji }),
      "Failed to add reaction",
    );
  },

  // Remove message reaction
  removeMessageReaction: async (messageId: string, emoji: string): Promise<Message> => {
    return resolveData(
      apiClient.delete<Message>(`/messages/${messageId}/unreact`, {
        data: { emoji },
      }),
      "Failed to remove reaction",
    );
  },

  // Boost profile (Premium feature)
  boostProfile: async (duration: "30m" | "1h" | "3h"): Promise<{
    success: boolean;
    expiresAt: string;
    visibilityIncrease: number;
  }> => {
    return request<{
      success: boolean;
      expiresAt: string;
      visibilityIncrease: number;
    }>("/profile/boost", {
      method: "POST",
      body: { duration },
    });
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

  // Support API methods
  getFAQ: async (): Promise<
    Array<{
      id: string;
      category: string;
      question: string;
      answer: string;
    }>
  > => {
    return request<
      Array<{
        id: string;
        category: string;
        question: string;
        answer: string;
      }>
    >("/support/faq");
  },

  createSupportTicket: async (data: {
    subject: string;
    message: string;
    category: string;
    priority?: string;
  }): Promise<SupportTicketResponse> => {
    return request<SupportTicketResponse>("/support/ticket", {
      method: "POST",
      body: data,
    });
  },

  submitBugReport: async (data: {
    title: string;
    description: string;
    stepsToReproduce?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    deviceInfo?: string;
    appVersion?: string;
  }): Promise<BugReportResponse> => {
    return request<BugReportResponse>("/support/bug-report", {
      method: "POST",
      body: data,
    });
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
  }): Promise<AIBioGenerationResponse> => {
    return request<AIBioGenerationResponse>("/ai/generate-bio", {
      method: "POST",
      body: data,
    });
  },

  // Analyze pet photos
  analyzePhotos: async (photos: string[]): Promise<AIPhotoAnalysisResponse> => {
    return request<AIPhotoAnalysisResponse>("/ai/analyze-photos", {
      method: "POST",
      body: { photos },
    });
  },

  // Enhanced compatibility analysis
  analyzeCompatibility: async (data: {
    pet1Id: string;
    pet2Id: string;
  }): Promise<AICompatibilityResponse> => {
    return request<AICompatibilityResponse>("/ai/enhanced-compatibility", {
      method: "POST",
      body: data,
    });
  },

  // Legacy compatibility analysis for backwards compatibility
  getCompatibility: async (data: {
    pet1Id: string;
    pet2Id: string;
  }): Promise<{
    score: number;
    analysis: string;
    factors: Record<string, unknown>;
  }> => {
    return request<{
      score: number;
      analysis: string;
      factors: Record<string, unknown>;
    }>("/ai/compatibility", {
      method: "POST",
      body: data,
    });
  },
};

export const api = {
  ...matchesAPI,
  auth: authAPI,
  swipe: swipeAPI,
  pet: petAPI,
  subscription: subscriptionAPI,
  ai: aiAPI,
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
  request,
};

// Export adoption API (alias for now, can be extended later)
export const adoptionAPI = matchesAPI;

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
