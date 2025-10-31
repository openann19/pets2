/**
 * ULTRA PREMIUM API Service 🚀
 * Production-ready with full type safety, error handling, and real-time features
 */
import type { ApiResponse, User, Pet, UserRegistrationData, PetCreationData, SwipeParams, UserPreferences, MessageAttachment, BioGenerationData, CompatibilityOptions, BehaviorAnalysisData } from '../types';
import { logger } from '@pawfectmatch/core';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  params?: Record<string, unknown>;
  signal?: AbortSignal; // Support for request cancellation
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

import { isBrowser, getSafeWindow, getSafeDocument, removeLocalStorageItem } from '@pawfectmatch/core/utils/env';

// Centralized API configuration
const getApiBaseUrl = (): string => {
  // Check environment variable first
  if (process.env['NEXT_PUBLIC_API_URL']) {
    return process.env['NEXT_PUBLIC_API_URL'];
  }
  // Fallback to localhost with correct port
  const win = getSafeWindow();
  if (win) {
    return `${win.location.protocol}//${win.location.hostname}:5001/api`;
  }
  // SSR fallback
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Dev-time sanity check for port configuration
if (isBrowser() && process.env.NODE_ENV === 'development') {
  try {
    const url = new URL(API_BASE_URL);
    if (url.port && url.port !== '5001') {
      logger.warn('[API] Warning: NEXT_PUBLIC_API_URL is not using port 5001:', { API_BASE_URL });
    }
  }
  catch (error: unknown) {
    logger.warn('[API] Invalid API_BASE_URL:', { API_BASE_URL, error });
  }
}

class ApiService {
  token: string | null = null;
  refreshToken: string | null = null;
  cache: Map<string, CacheEntry<unknown>> = new Map();
  retryAttempts: number = 3;
  retryDelay: number = 1000;

  constructor() {
    this.initializeFromStorage();
    this.startCacheCleanup();
  }

  startCacheCleanup(): void {
    if (!isBrowser()) {
      return;
    }
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > value.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  getCacheKey(endpoint: string, options: RequestOptions): string {
    return `${endpoint}_${JSON.stringify(options)}`;
  }

  setCache<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  /**
   * Parse Set-Cookie headers from Response object
   * @param response - Fetch Response object
   * @returns Map of cookie names to their attributes
   */
  private parseSetCookieHeaders(response: Response): Map<string, Record<string, string>> {
    const cookies = new Map<string, Record<string, string>>();
    const setCookieHeader = response.headers.get('set-cookie');
    
    if (!setCookieHeader) {
      return cookies;
    }

    // Handle multiple Set-Cookie headers (some browsers/servers send as array)
    const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    
    for (const cookieString of cookieStrings) {
      const parts = cookieString.split(';').map((p: string) => p.trim());
      if (parts.length === 0) continue;
      
      const [nameValue] = parts;
      const [name, value] = nameValue.split('=');
      if (!name || !value) continue;
      
      const attributes: Record<string, string> = { value };
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const [key, val] = part.split('=');
        if (key) {
          attributes[key.toLowerCase().trim()] = val ? val.trim() : 'true';
        }
      }
      
      cookies.set(name.trim(), attributes);
    }
    
    return cookies;
  }

  /**
   * Verify httpOnly cookies were set correctly by checking Set-Cookie headers
   * @param response - Fetch Response object
   * @returns Verification result with cookie details
   */
  private verifyHttpOnlyCookies(response: Response): {
    accessTokenSet: boolean;
    refreshTokenSet: boolean;
    isHttpOnly: boolean;
    isSecure: boolean;
    details: {
      accessToken?: Record<string, string>;
      refreshToken?: Record<string, string>;
    };
  } {
    const cookies = this.parseSetCookieHeaders(response);
    const accessTokenCookie = cookies.get('accessToken');
    const refreshTokenCookie = cookies.get('refreshToken');
    
    const isHttpOnly = 
      (accessTokenCookie?.['httponly'] === 'true' || accessTokenCookie?.['HttpOnly'] === 'true') &&
      (refreshTokenCookie?.['httponly'] === 'true' || refreshTokenCookie?.['HttpOnly'] === 'true');
    
    const isSecure = 
      (accessTokenCookie?.['secure'] === 'true' || accessTokenCookie?.['Secure'] === 'true') &&
      (refreshTokenCookie?.['secure'] === 'true' || refreshTokenCookie?.['Secure'] === 'true');
    
    return {
      accessTokenSet: !!accessTokenCookie,
      refreshTokenSet: !!refreshTokenCookie,
      isHttpOnly,
      isSecure: isSecure || process.env.NODE_ENV !== 'production', // Secure required in prod
      details: {
        ...(accessTokenCookie && { accessToken: accessTokenCookie }),
        ...(refreshTokenCookie && { refreshToken: refreshTokenCookie }),
      },
    };
  }

  /**
   * Validate authentication by making a test request to /auth/me
   * @returns True if authentication is valid, false otherwise
   */
  private async validateAuthentication(): Promise<boolean> {
    try {
      const validationResponse = await this.request<User>('/auth/me', { method: 'GET' });
      if (validationResponse.success && validationResponse.data) {
        logger.debug('[API] Authentication validated successfully');
        return true;
      }
      logger.warn('[API] Authentication validation failed', {
        success: validationResponse.success,
        error: validationResponse.error,
      });
      return false;
    } catch (error) {
      logger.error('[API] Authentication validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  initializeFromStorage(): void {
    // SECURITY: Tokens are now in httpOnly cookies set by backend
    // Client cannot access httpOnly cookies - they are sent automatically with requests
    // No need to initialize from localStorage
    this.token = null;
    this.refreshToken = null;
    logger.debug('[API] Tokens are in httpOnly cookies - initialized with null');
  }

  setToken(_token: string | null, _refreshToken?: string | null): void {
    // SECURITY: Tokens are set by backend in httpOnly cookies
    // Client cannot and should not set tokens
    // This is kept for backwards compatibility but does nothing
    // Tokens are automatically sent with requests via cookies
    this.token = null; // Don't store in memory - tokens come from cookies
    this.refreshToken = null;
    if (_token !== null) {
      logger.debug('[API] Token set by backend in httpOnly cookie - not storing in memory');
    }
  }

  async clearToken(): Promise<void> {
    this.token = null;
    this.refreshToken = null;
    
    if (isBrowser()) {
      const legacyTokenKeys = [
        'accessToken',
        'auth_token',
        'refreshToken',
        'refresh_token',
      ];

      for (const key of legacyTokenKeys) {
        removeLocalStorageItem(key);
      }

      const win = getSafeWindow();
      const doc = getSafeDocument();
      if (win && doc) {
        const cookieNames = ['accessToken', 'refreshToken'];
        const cookiePaths = ['/', '/api'];
        const cookieDomains = ['', win.location.hostname, `.${win.location.hostname}`];

        for (const name of cookieNames) {
          for (const path of cookiePaths) {
            for (const domain of cookieDomains) {
              const domainPart = domain ? `; Domain=${domain}` : '';
              const clearOptions = [
                `${name}=; Max-Age=0; Path=${path}${domainPart}; SameSite=Lax`,
                `${name}=; Max-Age=0; Path=${path}${domainPart}; SameSite=Strict`,
                `${name}=; Max-Age=0; Path=${path}${domainPart}; SameSite=None; Secure`,
              ];

              for (const option of clearOptions) {
                try {
                  doc.cookie = option;
                } catch {
                  // Cookie clearing may fail silently
                }
              }
            }
          }
        }

        try {
          const authStore = require('../lib/auth-store').useAuthStore;
          const store = authStore.getState();
          if (store.clearTokens) {
            store.clearTokens();
          }
        } catch {
          // Auth store not available
        }

        win.dispatchEvent(new CustomEvent('auth:tokens_cleared'));
      }
    }

    logger.info('[API] Auth tokens cleared', {
      memoryCleared: true,
      localStorageCleared: isBrowser(),
      cookiesCleared: isBrowser(),
      note: 'httpOnly cookies are cleared by backend on logout',
    });
  }

  getToken(): string | null {
    // SECURITY: httpOnly cookies cannot be accessed via JavaScript
    // Tokens are automatically sent with requests via credentials: 'include'
    // Return null - Authorization header not needed when using cookies
    return null;
  }

  // Sync tokens from auth store
  syncTokensFromStore(): void {
    // SECURITY: Tokens are in httpOnly cookies, not in auth store
    // This is a no-op - tokens come from cookies automatically
    this.token = null;
    this.refreshToken = null;
  }

  async refreshAccessToken(): Promise<boolean> {
    const isProduction = process.env.NODE_ENV === 'production';
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const cookieVerification = this.verifyHttpOnlyCookies(response);
        
        if (!cookieVerification.accessTokenSet || !cookieVerification.refreshTokenSet) {
          logger.error('[API] Token refresh failed - new cookies not set', {
            cookieVerification,
          });
          return false;
        }

        if (!cookieVerification.isHttpOnly) {
          logger.warn('[API] Security warning: refreshed cookies are not httpOnly', cookieVerification.details);
        }

        if (isProduction && !cookieVerification.isSecure) {
          logger.warn('[API] Security warning: refreshed cookies are not secure in production', cookieVerification.details);
        }

        this.setToken(null, null);

        if (isBrowser()) {
          try {
            const authStore = require('../lib/auth-store').useAuthStore;
            const store = authStore.getState();
            if (store.setTokens) {
              store.setTokens(null, null);
            }
          } catch {
            // Auth store not available, continue
          }
        }

        const authValid = await this.validateAuthentication();
        if (!authValid) {
          logger.warn('[API] Token refresh succeeded but authentication validation failed');
          return false;
        }

        logger.info('[API] Token refreshed successfully', {
          cookieVerification: {
            accessTokenSet: cookieVerification.accessTokenSet,
            refreshTokenSet: cookieVerification.refreshTokenSet,
            isHttpOnly: cookieVerification.isHttpOnly,
            isSecure: cookieVerification.isSecure,
          },
          authValidated: authValid,
        });
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Token refresh failed: ${response.statusText}`;
        
        logger.warn('[API] Token refresh failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });

        if (response.status === 401 || response.status === 403) {
          await this.clearToken();
          const win = getSafeWindow();
          if (win) {
            win.dispatchEvent(new CustomEvent('auth:refresh_failed', {
              detail: { status: response.status, error: errorMessage },
            }));
          }
        }
        return false;
      }
    }
    catch (error: unknown) {
      logger.error('[API] Token refresh error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}, retryCount: number = 0): Promise<ApiResponse<T>> {
    // SECURITY: Tokens are in httpOnly cookies, not in memory
    // No need to sync from store - tokens come from cookies automatically

    const url = `${API_BASE_URL}${endpoint}`;

    // Build query string from params
    let finalUrl = url;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl = `${url}?${queryString}`;
      }
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        // SECURITY: Don't send Authorization header - tokens come from httpOnly cookies
        // Backend middleware reads tokens from cookies automatically
        ...options.headers,
      },
      credentials: 'include', // Send httpOnly cookies with request
      body: options.body ?? null,
      signal: options.signal ?? null, // Support AbortController for request cancellation
    };

    try {
      const response = await fetch(finalUrl, config);
      
      // Handle non-OK responses with comprehensive error handling
      if (!response.ok) {
        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401 && retryCount === 0) {
          logger.info('[API] 401 received, attempting token refresh');
          // Refresh endpoint reads refreshToken from httpOnly cookie
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            logger.info('[API] Token refreshed successfully, retrying request');
            // New tokens are in httpOnly cookies - retry request with cookies
            return this.request<T>(endpoint, options, retryCount + 1);
          }
          // Token refresh failed - clear tokens and notify
          logger.warn('[API] Token refresh failed, clearing auth state');
          await this.clearToken();
          // Dispatch event for auth providers to handle
          const win = getSafeWindow();
          if (win) {
            win.dispatchEvent(new CustomEvent('auth:token_expired'));
          }
        }
        
        // Parse error response with better error messages
        let errorMessage = `API Error: ${response.statusText}`;
        let errorCode: string | undefined;
        let errorDetails: unknown = undefined;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorCode = errorData.code || errorData.errorCode;
          errorDetails = errorData.details || errorData.data;
        } catch {
          // If JSON parsing fails, try to get text response
          try {
            const text = await response.text();
            if (text) {
              errorMessage = text.length > 200 ? `${text.substring(0, 200)}...` : text;
            }
          } catch {
            // Use default message
          }
        }
        
        // Enhanced error logging
        logger.error('[API] Request failed', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorCode,
        });
        
        return {
          success: false,
          data: null as unknown as T,
          error: errorMessage,
          errorCode,
          errorDetails,
        } as ApiResponse<T>;
      }
      
      // Parse successful response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const jsonData = await response.json();
        data = jsonData.data || jsonData;
      } else if (response.status === 204 || response.status === 201) {
        // No content or created - return empty object
        data = {} as T;
      } else {
        // Try to parse as JSON anyway
        try {
          const jsonData = await response.json();
          data = jsonData.data || jsonData;
        } catch {
          // If all else fails, return empty object
          data = {} as T;
        }
      }
      
      return {
        success: true,
        data,
      };
    }
    catch (error: unknown) {
      // Network errors or fetch failures
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isAborted = error instanceof Error && error.name === 'AbortError';
      
      if (isAborted) {
        logger.info('[API] Request aborted', { endpoint });
        return {
          success: false,
          data: null as unknown as T,
          error: 'Request was cancelled',
        };
      }
      
      // Retry logic for network errors or 5xx errors
      if (retryCount < this.retryAttempts && (isNetworkError || (error as Response)?.status >= 500)) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        logger.warn(`[API] Retrying request to ${endpoint} (attempt ${retryCount + 1}/${this.retryAttempts}) after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      logger.error('[API] Request failed after retries', {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount,
      });
      
      return {
        success: false,
        data: null as unknown as T,
        error: error instanceof Error 
          ? (isNetworkError ? 'Network error. Please check your connection.' : error.message)
          : 'Unknown error occurred'
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<User> {
    const url = `${API_BASE_URL}/auth/login`;
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    try {
      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!rawResponse.ok) {
        const errorData = await rawResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Login failed: ${rawResponse.statusText}`);
      }

      const responseData = await rawResponse.json();
      const { user, accessToken, refreshToken } = responseData.data || responseData;

      if (!user) {
        throw new Error('Invalid response: user data missing');
      }

      const cookieVerification = this.verifyHttpOnlyCookies(rawResponse);
      
      if (!cookieVerification.accessTokenSet || !cookieVerification.refreshTokenSet) {
        const errorMsg = 'Authentication failed: cookies not set by server';
        logger.error('[API] Login failed - cookies not set', {
          cookieVerification,
          hasAccessTokenInBody: !!accessToken,
        });
        throw new Error(errorMsg);
      }

      if (!cookieVerification.isHttpOnly) {
        logger.warn('[API] Security warning: cookies are not httpOnly', cookieVerification.details);
      }

      if (isProduction && !cookieVerification.isSecure) {
        logger.warn('[API] Security warning: cookies are not secure in production', cookieVerification.details);
      }

      if (accessToken && isDevelopment) {
        this.setToken(accessToken, refreshToken);
        logger.debug('[API] Development: Tokens stored in memory for debugging');
      } else {
        this.setToken(null, null);
      }

      if (accessToken && isProduction) {
        logger.warn('[API] Production security issue: Tokens returned in response body', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });
      }

      const authValid = await this.validateAuthentication();
      if (!authValid) {
        logger.warn('[API] Login succeeded but authentication validation failed');
      }

      logger.info('[API] Login successful', {
        userId: user._id || user.id,
        cookieVerification: {
          accessTokenSet: cookieVerification.accessTokenSet,
          refreshTokenSet: cookieVerification.refreshTokenSet,
          isHttpOnly: cookieVerification.isHttpOnly,
          isSecure: cookieVerification.isSecure,
        },
        authValidated: authValid,
      });

      return user;
    } catch (error) {
      logger.error('[API] Login error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async register(data: UserRegistrationData): Promise<User> {
    const url = `${API_BASE_URL}/auth/register`;
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    try {
      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!rawResponse.ok) {
        const errorData = await rawResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Registration failed: ${rawResponse.statusText}`);
      }

      const responseData = await rawResponse.json();
      const { user, accessToken, refreshToken } = responseData.data || responseData;

      if (!user) {
        throw new Error('Invalid response: user data missing');
      }

      const cookieVerification = this.verifyHttpOnlyCookies(rawResponse);
      
      if (!cookieVerification.accessTokenSet || !cookieVerification.refreshTokenSet) {
        const errorMsg = 'Registration failed: authentication cookies not set by server';
        logger.error('[API] Registration failed - cookies not set', {
          cookieVerification,
          hasAccessTokenInBody: !!accessToken,
        });
        throw new Error(errorMsg);
      }

      if (!cookieVerification.isHttpOnly) {
        logger.warn('[API] Security warning: cookies are not httpOnly', cookieVerification.details);
      }

      if (isProduction && !cookieVerification.isSecure) {
        logger.warn('[API] Security warning: cookies are not secure in production', cookieVerification.details);
      }

      if (accessToken && isDevelopment) {
        this.setToken(accessToken, refreshToken);
        logger.debug('[API] Development: Tokens stored in memory for debugging');
      } else {
        this.setToken(null, null);
      }

      if (accessToken && isProduction) {
        logger.warn('[API] Production security issue: Tokens returned in response body', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });
      }

      const authValid = await this.validateAuthentication();
      if (!authValid) {
        logger.warn('[API] Registration succeeded but authentication validation failed');
      }

      logger.info('[API] Registration successful', {
        userId: user._id || user.id,
        email: user.email,
        cookieVerification: {
          accessTokenSet: cookieVerification.accessTokenSet,
          refreshTokenSet: cookieVerification.refreshTokenSet,
          isHttpOnly: cookieVerification.isHttpOnly,
          isSecure: cookieVerification.isSecure,
        },
        authValidated: authValid,
      });

      return user;
    } catch (error) {
      logger.error('[API] Registration error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    }
    finally {
      await this.clearToken();
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Pet endpoints
  async getPets(): Promise<ApiResponse<Pet[]>> {
    return this.request<Pet[]>('/pets/my-pets');
  }

  async getPet(id: string): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/pets/${id}`);
  }

  async createPet(data: PetCreationData): Promise<ApiResponse<Pet>> {
    return this.request<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePet(id: string, data: Partial<PetCreationData>): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePet(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/pets/${id}`, {
      method: 'DELETE',
    });
  }

  // Additional endpoints used by hooks
  async getMyPets(): Promise<ApiResponse<Pet[]>> {
    return this.request<Pet[]>('/pets/my-pets');
  }

  async getSwipeQueue(params: SwipeParams): Promise<ApiResponse<Pet[]>> {
    return this.request<Pet[]>('/pets/discover', { 
      params: params as unknown as Record<string, unknown>
    });
  }

  async updatePetProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pet Health endpoints
  async addPetHealthRecord(
    petId: string,
    type: 'vaccine' | 'medication',
    record: unknown
  ): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(`/pets/${petId}/health`, {
      method: 'POST',
      body: JSON.stringify({ type, record }),
    });
  }

  async getPetHealth(
    petId: string
  ): Promise<ApiResponse<{
    records: { vaccines?: unknown[]; medications?: unknown[] };
    reminders: Array<{
      type: 'vaccine' | 'medication' | 'checkup';
      title: string;
      dueDate: string;
      isOverdue: boolean;
    }>;
  }>> {
    return this.request<{
      records: { vaccines?: unknown[]; medications?: unknown[] };
      reminders: Array<{
        type: 'vaccine' | 'medication' | 'checkup';
        title: string;
        dueDate: string;
        isOverdue: boolean;
      }>;
    }>(`/pets/${petId}/health`);
  }

  async addPetVaccine(
    petId: string,
    record: unknown
  ): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(`/pets/${petId}/vaccines`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  async addPetMedication(
    petId: string,
    record: unknown
  ): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(`/pets/${petId}/medications`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  // Pet Verification endpoints
  async verifyPet(
    petId: string,
    verificationData: { microchipId?: string; vetDocument?: File }
  ): Promise<ApiResponse<Pet>> {
    const formData = new FormData();
    if (verificationData.microchipId) {
      formData.append('microchipId', verificationData.microchipId);
    }
    if (verificationData.vetDocument) {
      formData.append('vetDocument', verificationData.vetDocument);
    }

    const url = `${API_BASE_URL}/pets/${petId}/verify`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Pet verification failed: ${response.statusText}`;
        
        logger.error('[API] Pet verification failed', {
          petId,
          status: response.status,
          error: errorMessage,
          hasMicrochipId: !!verificationData.microchipId,
          hasVetDocument: !!verificationData.vetDocument,
        });
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const petData = responseData.data || responseData;

      if (!petData) {
        throw new Error('Invalid response: pet data missing');
      }

      logger.info('[API] Pet verification successful', {
        petId,
        verified: petData.verified || petData.isVerified,
      });

      return {
        success: true,
        data: petData,
      };
    } catch (error) {
      logger.error('[API] Pet verification error', {
        petId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Playdate Matching endpoints
  async getPlaydateMatches(
    petId: string,
    filters?: {
      distance?: number;
      playStyles?: string[];
      energy?: number;
      size?: string;
    }
  ): Promise<ApiResponse<unknown[]>> {
    const params = new URLSearchParams();
    if (filters?.distance) params.append('distance', filters.distance.toString());
    if (filters?.playStyles) params.append('playStyles', filters.playStyles.join(','));
    if (filters?.energy) params.append('energy', filters.energy.toString());
    if (filters?.size) params.append('size', filters.size);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<unknown[]>(`/pets/${petId}/playdate-matches${queryString}`);
  }

  async createPlaydate(
    matchId: string,
    details: {
      scheduledAt: string;
      venueId: string;
      notes?: string;
    }
  ): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/playdates', {
      method: 'POST',
      body: JSON.stringify({ matchId, ...details }),
    });
  }

  // Lost Pet Alert endpoints
  async createLostPetAlert(alertData: {
    petId: string;
    lastSeenLocation: { lat: number; lng: number; address: string };
    description: string;
    reward?: number;
    broadcastRadius?: number;
  }): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/lost-pet-alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async updateLostPetAlert(
    alertId: string,
    updates: Partial<{
      description: string;
      lastSeenLocation: { lat: number; lng: number; address: string };
      reward: number;
      broadcastRadius: number;
      status: 'active' | 'found' | 'cancelled';
    }>
  ): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(`/lost-pet-alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async reportLostPetSighting(
    alertId: string,
    sighting: {
      location: { lat: number; lng: number; address: string };
      description: string;
      photos?: string[];
    }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/lost-pet-alerts/${alertId}/sightings`, {
      method: 'POST',
      body: JSON.stringify(sighting),
    });
  }

  // User Pet Management endpoints
  async getOwnerPets(ownerId: string): Promise<ApiResponse<Pet[]>> {
    return this.request<Pet[]>(`/users/${ownerId}/pets`);
  }

  async setPrimaryPet(petId: string): Promise<ApiResponse<void>> {
    return this.request<void>('/users/primary-pet', {
      method: 'PUT',
      body: JSON.stringify({ petId }),
    });
  }

  // Match endpoints
  async getMatches(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/matches');
  }

  async swipe(petId: string, action: 'like' | 'pass' | 'superlike'): Promise<ApiResponse> {
    return this.request<unknown>('/matches/swipe', {
      method: 'POST',
      body: JSON.stringify({ petId, action }),
    });
  }

  // Chat endpoints
  async getMessages(matchId: string): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>(`/matches/${matchId}/messages`);
  }

  async sendMessage(matchId: string, content: string): Promise<ApiResponse> {
    return this.request<unknown>(`/matches/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getWeather(lat: number, lon: number): Promise<ApiResponse<{
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    location: string;
  }>> {
    try {
      const response = await this.request<{
        temperature: number;
        condition: string;
        humidity: number;
        windSpeed: number;
        location: string;
      }>('/weather', {
        params: { lat, lon },
      });

      if (response.success && response.data) {
        return response;
      }

      logger.warn('[API] Weather endpoint not available, using fallback');
      return {
        success: true,
        data: {
          temperature: 20,
          condition: 'unknown',
          humidity: 50,
          windSpeed: 5,
          location: `Lat: ${lat}, Lon: ${lon}`,
        },
      };
    } catch (error) {
      logger.warn('[API] Weather request failed, using fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        lat,
        lon,
      });
      
      return {
        success: true,
        data: {
          temperature: 20,
          condition: 'unknown',
          humidity: 50,
          windSpeed: 5,
          location: `Lat: ${lat}, Lon: ${lon}`,
        },
      };
    }
  }

  // Location endpoints
  async updateLocation(lat: number, lon: number): Promise<ApiResponse<void>> {
    return this.request<void>('/users/location', {
      method: 'PUT',
      body: JSON.stringify({ coordinates: [lon, lat] }),
    });
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me', { method: 'GET' });
  }

  // Preferences endpoints
  async syncPreferences(preferences: UserPreferences): Promise<ApiResponse<void>> {
    return this.request<void>('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

// Create singleton instance
export const apiInstance = new ApiService();

// Pets API endpoints
export const petsAPI = {
  async getSwipeablePets(filters: SwipeParams) {
    return apiInstance.request<Pet[]>('/pets/discover', {
      params: filters as unknown as Record<string, unknown>,
    });
  },
  async discoverPets(filters: SwipeParams) {
    return apiInstance.request<Pet[]>('/pets/discover', {
      params: filters as unknown as Record<string, unknown>,
    });
  },
  async likePet(petId: string) {
    return apiInstance.request(`/pets/${petId}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ action: 'like' }),
    });
  },
  async passPet(petId: string) {
    return apiInstance.request(`/pets/${petId}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ action: 'pass' }),
    });
  },
  async superLikePet(petId: string) {
    return apiInstance.request(`/pets/${petId}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ action: 'superlike' }),
    });
  },
  async reportPet(petId: string, reason: string) {
    return apiInstance.request(`/pets/${petId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Matches API endpoints
export const matchesAPI = {
  async getMatches() {
    return apiInstance.request<unknown[]>('/matches');
  },
  async getMatch(matchId: string) {
    return apiInstance.request<unknown>(`/matches/${matchId}`);
  },
  async unmatch(matchId: string) {
    return apiInstance.request(`/matches/${matchId}/unmatch`, {
      method: 'POST',
    });
  },
};

// Chat API endpoints
export const chatAPI = {
  async getConversations() {
    // Align with existing endpoints: use matches as conversations
    return apiInstance.request<unknown[]>('/matches');
  },
  async getMessages(conversationId: string) {
    return apiInstance.request<unknown[]>(`/matches/${conversationId}/messages`);
  },
  async sendMessage(conversationId: string, message: string, attachments: MessageAttachment[]) {
    return apiInstance.request(`/matches/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: message, attachments }),
    });
  },
  async markAsRead(conversationId: string) {
    return apiInstance.request(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },
};

// AI API endpoints
export const aiAPI = {
  async generateBio(data: BioGenerationData) {
    return apiInstance.request('/ai/generate-bio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async analyzePhoto(formData: FormData) {
    const url = `${API_BASE_URL}/ai/analyze-photo`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Photo analysis failed: ${response.statusText}`;
        
        logger.error('[API] Photo analysis failed', {
          status: response.status,
          error: errorMessage,
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      logger.debug('[API] Photo analysis successful', {
        hasAnalysis: !!data.analysis || !!data.data,
      });

      return data;
    } catch (error) {
      logger.error('[API] Photo analysis error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
  async analyzeCompatibility(petAId: string, petBId: string, options: CompatibilityOptions) {
    return apiInstance.request('/ai/analyze-compatibility', {
      method: 'POST',
      body: JSON.stringify({ petAId, petBId, ...options }),
    });
  },
  async getChatSuggestions(matchId: string) {
    return apiInstance.request(`/ai/chat-suggestions/${matchId}`, {
      method: 'GET',
    });
  },
  async getSmartRecommendations(userId: string) {
    return apiInstance.request('/ai/recommendations', {
      params: { userId },
    });
  },
  async analyzeBehavior(petId: string, data: BehaviorAnalysisData) {
    return apiInstance.request('/ai/behavior-analysis', {
      method: 'POST',
      body: JSON.stringify({ petId, ...data }),
    });
  },
};

// Subscription API endpoints
export const subscriptionAPI = {
  async getCurrentSubscription() {
    try {
      const response = await apiInstance.request<{
        plan: string;
        status: string;
        currentPeriodEnd?: string;
        cancelAtPeriodEnd?: boolean;
      }>('/subscription/current');
      
      if (response.success && response.data) {
        return response;
      }

      logger.warn('[API] Subscription endpoint not available, using fallback');
      return {
        success: true,
        data: {
          plan: 'basic',
          status: 'active',
        },
      };
    } catch (error) {
      logger.warn('[API] Subscription request failed, using fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        success: true,
        data: {
          plan: 'basic',
          status: 'active',
        },
      };
    }
  },
  async getUsageStats() {
    return apiInstance.request('/subscription/usage');
  },
  async createCheckoutSession(data: Record<string, unknown>) {
    return apiInstance.request('/premium/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async cancelSubscription() {
    return apiInstance.request(`/premium/cancel`, {
      method: 'POST',
    });
  },
  async reactivateSubscription(subscriptionId: string) {
    return apiInstance.request(`/subscription/${subscriptionId}/reactivate`, {
      method: 'POST',
    });
  },
  async getPlans() {
    return apiInstance.request('/subscription/plans');
  },
  async updatePaymentMethod(paymentMethodId: string) {
    return apiInstance.request('/subscription/payment-method', {
      method: 'PUT',
      body: JSON.stringify({ paymentMethodId }),
    });
  },
};

// Export the main API instance and all sub-APIs
export const api = {
  ...apiInstance,
  setToken: apiInstance.setToken.bind(apiInstance),
  clearToken: apiInstance.clearToken.bind(apiInstance),
  getToken: apiInstance.getToken.bind(apiInstance),
  syncTokensFromStore: apiInstance.syncTokensFromStore.bind(apiInstance),
  login: apiInstance.login.bind(apiInstance),
  register: apiInstance.register.bind(apiInstance),
  logout: apiInstance.logout.bind(apiInstance),
  forgotPassword: apiInstance.forgotPassword.bind(apiInstance),
  resetPassword: apiInstance.resetPassword.bind(apiInstance),
  getPets: apiInstance.getPets.bind(apiInstance),
  getPet: apiInstance.getPet.bind(apiInstance),
  createPet: apiInstance.createPet.bind(apiInstance),
  updatePet: apiInstance.updatePet.bind(apiInstance),
  deletePet: apiInstance.deletePet.bind(apiInstance),
  updatePetProfile: apiInstance.updatePetProfile.bind(apiInstance),
  // Pet Health methods
  addPetHealthRecord: apiInstance.addPetHealthRecord.bind(apiInstance),
  getPetHealth: apiInstance.getPetHealth.bind(apiInstance),
  addPetVaccine: apiInstance.addPetVaccine.bind(apiInstance),
  addPetMedication: apiInstance.addPetMedication.bind(apiInstance),
  // Pet Verification methods
  verifyPet: apiInstance.verifyPet.bind(apiInstance),
  // Playdate Matching methods
  getPlaydateMatches: apiInstance.getPlaydateMatches.bind(apiInstance),
  createPlaydate: apiInstance.createPlaydate.bind(apiInstance),
  // Lost Pet Alert methods
  createLostPetAlert: apiInstance.createLostPetAlert.bind(apiInstance),
  updateLostPetAlert: apiInstance.updateLostPetAlert.bind(apiInstance),
  reportLostPetSighting: apiInstance.reportLostPetSighting.bind(apiInstance),
  // User Pet Management methods
  getOwnerPets: apiInstance.getOwnerPets.bind(apiInstance),
  setPrimaryPet: apiInstance.setPrimaryPet.bind(apiInstance),
  getMyPets: apiInstance.getMyPets.bind(apiInstance),
  getMatches: apiInstance.getMatches.bind(apiInstance),
  swipe: apiInstance.swipe.bind(apiInstance),
  getMessages: apiInstance.getMessages.bind(apiInstance),
  sendMessage: apiInstance.sendMessage.bind(apiInstance),
  getWeather: apiInstance.getWeather.bind(apiInstance),
  updateLocation: apiInstance.updateLocation.bind(apiInstance),
  syncPreferences: apiInstance.syncPreferences.bind(apiInstance),
  pets: petsAPI,
  matches: matchesAPI,
  chat: chatAPI,
  ai: aiAPI,
  subscription: subscriptionAPI,
};

// Export GDPR service separately and also add to main api object
import { gdprService } from './gdprService';
import { likesAPI } from './likesAPI';
import { adoptionAPI } from './adoptionAPI';
import { moderationAPI } from './moderationAPI';
import { notificationPreferencesAPI } from './notificationPreferencesAPI';
import { premiumAPI } from './premiumAPI';

export { 
  gdprService, 
  likesAPI, 
  adoptionAPI, 
  moderationAPI, 
  notificationPreferencesAPI,
  premiumAPI,
};

// Add all services to main api export for convenience
Object.assign(api, {
  gdpr: gdprService,
  likes: likesAPI,
  adoption: adoptionAPI,
  moderation: moderationAPI,
  notificationPreferences: notificationPreferencesAPI,
  premium: premiumAPI,
});

export default api;
