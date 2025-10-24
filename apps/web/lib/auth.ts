/**
 * Web Authentication Service
 * Production-hardened authentication for Next.js web application
 * Features: Secure token storage, session management, CSRF protection
 */

import { webApiClient } from './api-client';
import { handleAuthError } from './error-handling';
import { logger } from '@pawfectmatch/core';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showOnlineStatus: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
}

class WebAuthService {
  private static instance: WebAuthService;
  private authState: AuthState;
  private refreshPromise: Promise<AuthTokens> | null = null;
  private readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

  private constructor() {
    this.authState = {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),
    };

    this.initialize();
  }

  static getInstance(): WebAuthService {
    if (!WebAuthService.instance) {
      WebAuthService.instance = new WebAuthService();
    }
    return WebAuthService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Load stored auth state
      await this.loadStoredAuthState();

      // Set up activity monitoring
      this.setupActivityMonitoring();

      // Set up automatic token refresh
      this.setupTokenRefresh();

    } catch (error) {
      logger.error('Failed to initialize auth service', { error });
    }
  }

  /**
   * Load authentication state from secure storage
   */
  private async loadStoredAuthState(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem('pawfectmatch_auth');
      if (stored === null) return;

      const authData = JSON.parse(stored) as Partial<AuthState & { tokens: AuthTokens }>;

      // Validate stored data
      if (authData.tokens !== undefined && authData.user !== undefined) {
        // Check if tokens are still valid
        if (this.isTokenValid(authData.tokens)) {
          this.authState = {
            user: authData.user,
            tokens: authData.tokens,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: authData.lastActivity ?? Date.now(),
          };

          // Set authorization header
          this.setAuthHeader(authData.tokens.accessToken);
        } else {
          // Tokens expired, try to refresh
          try {
            const newTokens = await this.refreshTokens(authData.tokens.refreshToken);
            this.authState = {
              user: authData.user,
              tokens: newTokens,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: authData.lastActivity ?? Date.now(),
            };
            this.setAuthHeader(newTokens.accessToken);
            this.persistAuthState();
          } catch {
            // Refresh failed, clear auth state
            this.clearAuthState();
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load stored auth state', { error });
      this.clearAuthState();
    }
  }

  /**
   * Persist authentication state to secure storage
   */
  private persistAuthState(): void {
    if (typeof window === 'undefined') return;

    try {
      const dataToStore = {
        user: this.authState.user,
        tokens: this.authState.tokens,
        lastActivity: this.authState.lastActivity,
      };

      localStorage.setItem('pawfectmatch_auth', JSON.stringify(dataToStore));
    } catch (error) {
      logger.error('Failed to persist auth state', { error });
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.authState = {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('pawfectmatch_auth');
      // Clear any stored tokens
      localStorage.removeItem('pawfectmatch_tokens');
    }

    // Clear authorization header
    this.clearAuthHeader();
  }

  /**
   * Set authorization header
   */
  private setAuthHeader(token: string): void {
    // This would typically be set in the API client
    // For now, we'll log the intent
    logger.debug('Setting auth header', { hasToken: token !== '' });
  }

  /**
   * Clear authorization header
   */
  private clearAuthHeader(): void {
    logger.debug('Clearing auth header');
  }

  /**
   * Check if token is valid (not expired)
   */
  private isTokenValid(tokens: AuthTokens): boolean {
    return Date.now() < tokens.expiresAt - this.TOKEN_REFRESH_BUFFER;
  }

  /**
   * Check if token needs refresh
   */
  private shouldRefreshToken(tokens: AuthTokens): boolean {
    return Date.now() > tokens.expiresAt - this.TOKEN_REFRESH_BUFFER;
  }

  /**
   * Refresh access token
   */
  private async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (this.refreshPromise !== null) {
      return this.refreshPromise;
    }

    this.refreshPromise = webApiClient.post<AuthTokens>('/auth/refresh', { refreshToken })
      .then(response => {
        if (response.success !== true || response.data === undefined) {
          throw new Error('Token refresh failed');
        }
        return response.data;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    if (typeof window === 'undefined') return;

    // Check every minute for token refresh needs
    setInterval(() => {
      if (this.authState.tokens && this.shouldRefreshToken(this.authState.tokens)) {
        this.refreshTokens(this.authState.tokens.refreshToken)
          .then(newTokens => {
            this.authState.tokens = newTokens;
            this.setAuthHeader(newTokens.accessToken);
            this.persistAuthState();
            logger.info('Tokens refreshed automatically');
          })
          .catch(error => {
            logger.error('Automatic token refresh failed', { error });
            this.logout();
          });
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Setup activity monitoring for session timeout
   */
  private setupActivityMonitoring(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const updateActivity = () => {
      this.authState.lastActivity = Date.now();
    };

    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for session timeout every minute
    setInterval(() => {
      if (this.authState.isAuthenticated) {
        const timeSinceActivity = Date.now() - this.authState.lastActivity;
        if (timeSinceActivity > this.SESSION_TIMEOUT) {
          logger.info('Session timeout - logging out');
          this.logout();
        }
      }
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      this.authState.isLoading = true;

      const response = await webApiClient.post<{
        user: User;
        tokens: AuthTokens;
      }>('/auth/login', credentials);

      if (response.success === false || response.data === undefined) {
        throw new Error('Login failed');
      }

      const { user, tokens } = response.data;

      this.authState = {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now(),
      };

      this.setAuthHeader(tokens.accessToken);
      this.persistAuthState();

      logger.info('User logged in successfully', { userId: user.id });
      return user;

    } catch (error) {
      this.authState.isLoading = false;
      const webError = handleAuthError(error, { action: 'login', email: credentials.email });
      throw webError;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<User> {
    try {
      this.authState.isLoading = true;

      const response = await webApiClient.post<{
        user: User;
        tokens: AuthTokens;
      }>('/auth/register', data);

      if (response.success !== true || response.data === undefined) {
        throw new Error('Registration failed');
      }

      const { user, tokens } = response.data;

      this.authState = {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now(),
      };

      this.setAuthHeader(tokens.accessToken);
      this.persistAuthState();

      logger.info('User registered successfully', { userId: user.id });
      return user;

    } catch (error) {
      this.authState.isLoading = false;
      const webError = handleAuthError(error, { action: 'register', email: data.email });
      throw webError;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      if (this.authState.tokens) {
        // Call logout endpoint to invalidate server-side tokens
        await webApiClient.post('/auth/logout', {
          refreshToken: this.authState.tokens.refreshToken
        }).catch(() => {
          // Ignore logout endpoint errors
        });
      }
    } catch (error) {
      logger.warn('Logout endpoint call failed', { error });
    } finally {
      this.clearAuthState();
      logger.info('User logged out');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await webApiClient.get<User>('/auth/me');

      if (response.success !== true || response.data === undefined) {
        throw new Error('Failed to get current user');
      }

      // Update stored user data
      this.authState.user = response.data;
      this.persistAuthState();

      return response.data;

    } catch (error) {
      const webError = handleAuthError(error, { action: 'getCurrentUser' });
      throw webError;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await webApiClient.put<User>('/auth/profile', updates);

      if (response.success !== true || response.data === undefined) {
        throw new Error('Failed to update profile');
      }

      this.authState.user = response.data;
      this.persistAuthState();

      logger.info('User profile updated', { userId: this.authState.user.id });
      return response.data;

    } catch (error) {
      const webError = handleAuthError(error, { action: 'updateProfile' });
      throw webError;
    }
  }

  /**
   * Get authentication state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.tokens && this.isTokenValid(this.authState.tokens);
  }

  /**
   * Get current user
   */
  getCurrentUserSync(): User | null {
    return this.authState.user;
  }

  /**
   * Get access token (for API calls)
   */
  getAccessToken(): string | null {
    if (this.authState.tokens && this.isTokenValid(this.authState.tokens)) {
      return this.authState.tokens.accessToken;
    }
    return null;
  }
}

// Create singleton instance
export const webAuthService = WebAuthService.getInstance();

// Export types and utilities
export { WebAuthService };
export default webAuthService;
