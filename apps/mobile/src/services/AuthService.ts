/**
 * Authentication Service for PawfectMatch Mobile App
 * Handles user authentication, token management, and secure storage
 * 
 * Enhanced with JWT token validation and automatic refresh (WI-004)
 */
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { logger } from "@pawfectmatch/core";
import { api } from "./api";
import type { AuthResponse, UserProfileResponse } from "@pawfectmatch/core";
import {
  validateToken,
  shouldRefreshToken,
  getTokenExpiration,
  getTokenExpiresIn,
  type TokenValidationResult,
} from "../utils/jwt";

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

// Use the imported AuthResponse type from core

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Use the imported UserProfileResponse type from core
export type User = UserProfileResponse;

export interface BiometricCredentials {
  email: string;
  biometricToken: string;
}

class AuthService {
  private static readonly ACCESS_TOKEN_KEY = "auth_access_token";
  private static readonly REFRESH_TOKEN_KEY = "auth_refresh_token";
  private static readonly USER_KEY = "auth_user";
  private static readonly BIOMETRIC_ENABLED_KEY = "biometric_enabled";
  private static readonly BIOMETRIC_CREDENTIALS_KEY = "biometric_credentials";
  private static readonly SESSION_START_KEY = "session_start_time";
  private static readonly LAST_ACTIVITY_KEY = "last_activity_time";

  // Session configuration
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startSessionMonitoring();
  }

  /**
   * Start session monitoring for auto-logout
   */
  private startSessionMonitoring(): void {
    // Clear any existing interval
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Check session every minute
    this.sessionCheckInterval = setInterval(async () => {
      await this.checkSessionValidity();
    }, 60000); // Check every minute
  }

  /**
   * Check if current session is still valid
   */
  private async checkSessionValidity(): Promise<void> {
    try {
      const isAuthenticated = await this.isAuthenticated();
      if (!isAuthenticated) {
        this.stopSessionMonitoring();
        return;
      }

      const sessionStart = await this.getSessionStartTime();
      const lastActivity = await this.getLastActivityTime();
      const now = Date.now();

      // Check session timeout (24 hours)
      if (sessionStart && now - sessionStart > AuthService.SESSION_TIMEOUT) {
        logger.info("Session expired due to timeout");
        await this.logout();
        return;
      }

      // Check activity timeout (30 minutes)
      if (lastActivity && now - lastActivity > AuthService.ACTIVITY_TIMEOUT) {
        logger.info("Session expired due to inactivity");
        await this.logout();
        return;
      }

      // Update last activity time
      await this.updateLastActivityTime();
    } catch (error) {
      logger.error("Session validity check failed", { error });
    }
  }

  /**
   * Stop session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Get session start time
   */
  private async getSessionStartTime(): Promise<number | null> {
    try {
      const startTime = await SecureStore.getItemAsync(
        AuthService.SESSION_START_KEY,
      );
      return startTime ? parseInt(startTime) : null;
    } catch (error) {
      logger.error("Failed to get session start time", { error });
      return null;
    }
  }

  /**
   * Get last activity time
   */
  private async getLastActivityTime(): Promise<number | null> {
    try {
      const lastActivity = await SecureStore.getItemAsync(
        AuthService.LAST_ACTIVITY_KEY,
      );
      return lastActivity ? parseInt(lastActivity) : null;
    } catch (error) {
      logger.error("Failed to get last activity time", { error });
      return null;
    }
  }

  /**
   * Update last activity time
   */
  private async updateLastActivityTime(): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        AuthService.LAST_ACTIVITY_KEY,
        Date.now().toString(),
      );
    } catch (error) {
      logger.error("Failed to update last activity time", { error });
    }
  }

  /**
   * Record user activity to prevent auto-logout
   */
  async recordUserActivity(): Promise<void> {
    await this.updateLastActivityTime();
  }

  /**
   * Validate current access token
   * Returns token validation result including expiration status
   */
  async validateAccessToken(): Promise<TokenValidationResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          isValid: false,
          isExpired: true,
          expiresAt: null,
          expiresIn: 0,
          payload: null,
          error: "No access token found",
        };
      }

      return validateToken(token);
    } catch (error) {
      logger.error("Token validation failed", { error });
      return {
        isValid: false,
        isExpired: true,
        expiresAt: null,
        expiresIn: 0,
        payload: null,
        error: error instanceof Error ? error.message : "Validation error",
      };
    }
  }

  /**
   * Check if token needs refresh (expiring soon or expired)
   */
  async needsTokenRefresh(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return false;
      }

      // Check if token should be refreshed (expiring within 5 minutes)
      return shouldRefreshToken(token, 5 * 60 * 1000);
    } catch (error) {
      logger.error("Token refresh check failed", { error });
      return false;
    }
  }

  /**
   * Get token expiration info
   */
  async getTokenExpirationInfo(): Promise<{
    expiresAt: Date | null;
    expiresIn: number;
    isValid: boolean;
  }> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { expiresAt: null, expiresIn: 0, isValid: false };
      }

      const expiresAt = getTokenExpiration(token);
      const expiresIn = getTokenExpiresIn(token);
      const isValid = !this.isTokenExpired(token);

      return { expiresAt, expiresIn, isValid };
    } catch (error) {
      logger.error("Failed to get token expiration info", { error });
      return { expiresAt: null, expiresIn: 0, isValid: false };
    }
  }

  /**
   * Check if token is expired (private helper)
   */
  private isTokenExpired(token: string): boolean {
    try {
      const validation = validateToken(token);
      return validation.isExpired;
    } catch {
      return true;
    }
  }

  /**
   * Automatically refresh token if needed
   * Called before API requests to ensure valid token
   */
  async ensureValidToken(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return false;
      }

      // Check if token is expired or expiring soon
      const validation = validateToken(token);
      
      if (!validation.isValid) {
        logger.info("Token expired, attempting refresh");
        return await this.refreshToken();
      }

      if (shouldRefreshToken(token, 5 * 60 * 1000)) {
        logger.info("Token expiring soon, preemptively refreshing");
        return await this.refreshToken();
      }

      return true;
    } catch (error) {
      logger.error("Failed to ensure valid token", { error });
      return false;
    }
  }

  /**
   * Force refresh token rotation
   */
  async rotateTokens(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      // Call refresh endpoint to get new tokens
      const response = await api.auth.refreshToken(refreshToken);

      // Store new tokens
      await this.storeAuthData(response);

      // Update session start time for new session
      await SecureStore.setItemAsync(
        AuthService.SESSION_START_KEY,
        Date.now().toString(),
      );

      logger.info("Tokens rotated successfully");
      return true;
    } catch (error) {
      logger.error("Token rotation failed", { error });
      // If rotation fails, logout user
      await this.logout();
      return false;
    }
  }

  /**
   * Refresh token with retry mechanism
   */
  private async refreshTokenWithRetry(retries: number = 3): Promise<AuthResponse | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
          return null;
        }

        const response = await api.auth.refreshToken(refreshToken);
        await this.storeAuthData(response);

        logger.info("Token refreshed successfully", { attempt });
        return response;
      } catch (error) {
        logger.warn("Token refresh attempt failed", { attempt, retries, error });
        
        if (attempt === retries) {
          logger.error("All token refresh attempts failed");
          return null;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  }

  /**
   * Check if biometric authentication is available on device
   */
  async isBiometricAvailable(): Promise<{
    available: boolean;
    types: LocalAuthentication.AuthenticationType[];
  }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        available: hasHardware && isEnrolled,
        types: supportedTypes,
      };
    } catch (error) {
      logger.error("Failed to check biometric availability", { error });
      return { available: false, types: [] };
    }
  }

  /**
   * Enable biometric authentication for current user
   */
  async enableBiometricAuthentication(): Promise<boolean> {
    try {
      const { available } = await this.isBiometricAvailable();
      if (!available) {
        throw new AuthError(
          "Biometric authentication is not available on this device",
        );
      }

      // Authenticate user with biometrics to enable feature
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
        fallbackLabel: "Use PIN",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (!biometricAuth.success) {
        throw new AuthError("Biometric authentication failed");
      }

      // Store biometric preference
      await SecureStore.setItemAsync(AuthService.BIOMETRIC_ENABLED_KEY, "true");

      // Get current user credentials for biometric storage
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const biometricCredentials: BiometricCredentials = {
          email: currentUser.email,
          biometricToken: Date.now().toString() + Math.random().toString(36),
        };

        await SecureStore.setItemAsync(
          AuthService.BIOMETRIC_CREDENTIALS_KEY,
          JSON.stringify(biometricCredentials),
        );
      }

      logger.info("Biometric authentication enabled");
      return true;
    } catch (error) {
      logger.error("Failed to enable biometric authentication", { error });
      throw new AuthError("Failed to enable biometric authentication", error);
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometricAuthentication(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AuthService.BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(AuthService.BIOMETRIC_CREDENTIALS_KEY);
      logger.info("Biometric authentication disabled");
    } catch (error) {
      logger.error("Failed to disable biometric authentication", { error });
      throw new AuthError("Failed to disable biometric authentication", error);
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(
        AuthService.BIOMETRIC_ENABLED_KEY,
      );
      return enabled === "true";
    } catch (error) {
      logger.error("Failed to check biometric status", { error });
      return false;
    }
  }

  /**
   * Login with biometrics (if enabled)
   */
  async loginWithBiometrics(): Promise<AuthResponse> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        throw new AuthError("Biometric authentication is not enabled");
      }

      const { available } = await this.isBiometricAvailable();
      if (!available) {
        throw new AuthError("Biometric authentication is not available");
      }

      // Perform biometric authentication
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to login",
        fallbackLabel: "Use PIN",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (!biometricAuth.success) {
        throw new AuthError("Biometric authentication failed");
      }

      // Get stored biometric credentials
      const storedCredentials = await SecureStore.getItemAsync(
        AuthService.BIOMETRIC_CREDENTIALS_KEY,
      );
      if (!storedCredentials) {
        throw new AuthError("No biometric credentials found");
      }

      const credentials: BiometricCredentials = JSON.parse(storedCredentials);

      // Perform login with stored email and a special biometric flag
      const response = await api.auth.biometricLogin({
        email: credentials.email,
        biometricToken: credentials.biometricToken,
      });

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info("User logged in with biometrics", {
        userId: response.user._id,
      });
      return response;
    } catch (error) {
      logger.error("Biometric login failed", { error });
      throw new AuthError(
        "Biometric login failed. Please use email and password.",
        error,
      );
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.auth.login(credentials);

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info("User logged in successfully", { userId: response.user._id });
      return response;
    } catch (error) {
      logger.error("Login failed", { error, email: credentials.email });
      throw new AuthError(
        "Login failed. Please check your credentials and try again.",
        error,
      );
    }
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        throw new AuthError("Passwords do not match");
      }

      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.name.split(" ")[0] || "",
        lastName: data.name.split(" ").slice(1).join(" ") || "",
      };
      const response = await api.auth.register(registerData);

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info("User registered successfully", {
        userId: response.user._id,
      });
      return response;
    } catch (error) {
      logger.error("Registration failed", { error, email: data.email });
      throw new AuthError("Registration failed. Please try again.", error);
    }
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    try {
      // Notify server about logout (optional)
      try {
        await api.auth.logout();
      } catch (error) {
        // Ignore server logout errors
        logger.warn("Server logout failed, continuing with local logout", {
          error,
        });
      }

      // Clear all stored auth data
      await this.clearAuthData();
      logger.info("User logged out successfully");
    } catch (error) {
      logger.error("Logout failed", { error });
      // Even if logout fails, clear local data
      await this.clearAuthData();
    }
  }

  /**
   * Refresh access token using refresh token
   * Uses retry logic for better reliability
   */
  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const response = await this.refreshTokenWithRetry(3);
      
      if (!response) {
        logger.error("Token refresh failed after all retries");
        // Clear invalid tokens
        await this.clearAuthData();
        return null;
      }

      return response;
    } catch (error) {
      logger.error("Token refresh failed", { error });
      // Clear invalid tokens
      await this.clearAuthData();
      return null;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.auth.forgotPassword(email);

      logger.info("Password reset requested", { email });
      return response;
    } catch (error) {
      logger.error("Forgot password failed", { error, email });
      throw new AuthError(
        "Failed to send password reset email. Please try again.",
        error,
      );
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    data: ResetPasswordData,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (data.password !== data.confirmPassword) {
        throw new AuthError("Passwords do not match");
      }

      const resetData = {
        token: data.token,
        password: data.password,
      };
      const response = await api.auth.resetPassword(resetData);

      logger.info("Password reset successful");
      return response;
    } catch (error) {
      logger.error("Password reset failed", { error });
      throw new AuthError("Failed to reset password. Please try again.", error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(AuthService.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error("Failed to get current user", { error });
      return null;
    }
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AuthService.ACCESS_TOKEN_KEY);
    } catch (error) {
      logger.error("Failed to get access token", { error });
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const user = await this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      logger.error("Authentication check failed", { error });
      return false;
    }
  }

  /**
   * Update user profile data
   */
  async updateUser(userData: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new AuthError("No authenticated user found");
      }

      const updatedUser = { ...currentUser, ...userData };
      await SecureStore.setItemAsync(
        AuthService.USER_KEY,
        JSON.stringify(updatedUser),
      );
      logger.info("User data updated", { userId: updatedUser.id });
    } catch (error) {
      logger.error("Failed to update user data", { error });
      throw new AuthError("Failed to update user data", error);
    }
  }

  /**
   * Store remember me preference
   */
  async storeRememberMe(email: string): Promise<void> {
    try {
      await SecureStore.setItemAsync("remember_me_email", email);
      logger.info("Remember me preference stored");
    } catch (error) {
      logger.error("Failed to store remember me preference", { error });
    }
  }

  /**
   * Get biometric credentials for login
   */
  async getBiometricCredentials(): Promise<{
    email: string;
    password: string;
  } | null> {
    try {
      const credentials = await SecureStore.getItemAsync(
        AuthService.BIOMETRIC_CREDENTIALS_KEY,
      );
      if (credentials) {
        const parsed = JSON.parse(credentials) as BiometricCredentials;
        // In a real implementation, you would decrypt the password
        // For now, we'll return null to require manual login
        return null;
      }
      return null;
    } catch (error) {
      logger.error("Failed to get biometric credentials", { error });
      return null;
    }
  }

  // Private helper methods

  private async storeAuthData(response: AuthResponse): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(
          AuthService.ACCESS_TOKEN_KEY,
          response.accessToken,
        ),
        SecureStore.setItemAsync(
          AuthService.REFRESH_TOKEN_KEY,
          response.refreshToken,
        ),
        SecureStore.setItemAsync(
          AuthService.USER_KEY,
          JSON.stringify(response.user),
        ),
        SecureStore.setItemAsync(
          AuthService.SESSION_START_KEY,
          Date.now().toString(),
        ),
        SecureStore.setItemAsync(
          AuthService.LAST_ACTIVITY_KEY,
          Date.now().toString(),
        ),
      ]);

      // Sync token with apiClient
      try {
        const { apiClient } = await import("./apiClient");
        await apiClient.setToken(response.accessToken);
      } catch (error) {
        logger.warn("Failed to sync token with apiClient", { error });
      }

      // Start session monitoring
      this.startSessionMonitoring();
    } catch (error) {
      logger.error("Failed to store auth data", { error });
      throw new AuthError("Failed to save authentication data", error);
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(AuthService.ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(AuthService.REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(AuthService.USER_KEY),
        SecureStore.deleteItemAsync(AuthService.SESSION_START_KEY),
        SecureStore.deleteItemAsync(AuthService.LAST_ACTIVITY_KEY),
      ]);

      // Clear token from apiClient
      try {
        const { apiClient } = await import("./apiClient");
        await apiClient.clearToken();
      } catch (error) {
        logger.warn("Failed to clear token from apiClient", { error });
      }

      // Stop session monitoring
      this.stopSessionMonitoring();
    } catch (error) {
      logger.error("Failed to clear auth data", { error });
      // Don't throw here as this is cleanup
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AuthService.REFRESH_TOKEN_KEY);
    } catch (error) {
      logger.error("Failed to get refresh token", { error });
      return null;
    }
  }
}

// Custom error class for authentication errors
export class AuthError extends Error {
  constructor(
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
