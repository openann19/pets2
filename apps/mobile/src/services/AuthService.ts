/**
 * Authentication Service for PawfectMatch Mobile App
 * Handles user authentication, token management, and secure storage
 * Uses react-native-keychain for production-grade security
 */
import * as Keychain from "react-native-keychain";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { logger } from "@pawfectmatch/core";
import { api } from "./api";

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileComplete: boolean;
    subscriptionStatus: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

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

export interface User {
  id: string;
  email: string;
  name: string;
  profileComplete: boolean;
  subscriptionStatus: string;
  createdAt: string;
}

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
  private static readonly SERVICE_NAME = "com.pawfectmatch.mobile";

  // Session configuration
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
  private sessionCheckInterval: ReturnType<typeof setInterval> | null = null;
  private useKeychain: boolean = true; // Use Keychain by default for production security

  constructor() {
    this.startSessionMonitoring();
  }

  // ===== Secure Storage Methods =====

  /**
   * Store item securely using Keychain (production) or SecureStore (development)
   */
  private async secureSetItemAsync(key: string, value: string): Promise<void> {
    if (this.useKeychain) {
      try {
        await Keychain.setGenericPassword(key, value, {
          service: `${AuthService.SERVICE_NAME}.${key}`,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      } catch (error) {
        // Fallback to SecureStore if Keychain fails
        logger.warn("Keychain failed, falling back to SecureStore", { error, key });
        this.useKeychain = false;
        await SecureStore.setItemAsync(key, value);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  /**
   * Get item securely from Keychain or SecureStore
   */
  private async secureGetItemAsync(key: string): Promise<string | null> {
    if (this.useKeychain) {
      try {
        const credentials = await Keychain.getGenericPassword({
          service: `${AuthService.SERVICE_NAME}.${key}`,
        });
        return credentials ? credentials.password : null;
      } catch (error) {
        // Fallback to SecureStore if Keychain fails
        logger.warn("Keychain retrieval failed, trying SecureStore", { error, key });
        return await SecureStore.getItemAsync(key);
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  /**
   * Delete item securely from Keychain or SecureStore
   */
  private async secureDeleteItemAsync(key: string): Promise<void> {
    if (this.useKeychain) {
      try {
        await Keychain.resetGenericPassword({
          service: `${AuthService.SERVICE_NAME}.${key}`,
        });
      } catch (error) {
        // Fallback to SecureStore if Keychain fails
        logger.warn("Keychain deletion failed, falling back to SecureStore", { error, key });
        await SecureStore.deleteItemAsync(key);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
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
    this.sessionCheckInterval = setInterval(() => {
      void this.checkSessionValidity();
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
      const startTime = await this.secureGetItemAsync(
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
      const lastActivity = await this.secureGetItemAsync(
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
      await this.secureSetItemAsync(
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
   * Force refresh token rotation
   */
  async rotateTokens(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      // Call refresh endpoint to get new tokens
      const response = await api.request<AuthResponse>("/auth/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      // Store new tokens
      await this.storeAuthData(response);

      // Update session start time for new session
      await this.secureSetItemAsync(
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
      await this.secureSetItemAsync(AuthService.BIOMETRIC_ENABLED_KEY, "true");

      // Get current user credentials for biometric storage
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const biometricCredentials: BiometricCredentials = {
          email: currentUser.email,
          biometricToken: Date.now().toString() + Math.random().toString(36),
        };

        await this.secureSetItemAsync(
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
      await this.secureDeleteItemAsync(AuthService.BIOMETRIC_ENABLED_KEY);
      await this.secureDeleteItemAsync(AuthService.BIOMETRIC_CREDENTIALS_KEY);
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
      const enabled = await this.secureGetItemAsync(
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
      const storedCredentials = await this.secureGetItemAsync(
        AuthService.BIOMETRIC_CREDENTIALS_KEY,
      );
      if (!storedCredentials) {
        throw new AuthError("No biometric credentials found");
      }

      const credentials = JSON.parse(storedCredentials) as BiometricCredentials;

      // Perform login with stored email and a special biometric flag
      const response = await api.request<AuthResponse>(
        "/auth/biometric-login",
        {
          method: "POST",
          body: JSON.stringify({
            email: credentials.email,
            biometricToken: credentials.biometricToken,
          }),
        },
      );

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info("User logged in with biometrics", {
        userId: response.user.id,
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
      const response = await api.request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info("User logged in successfully", { userId: response.user.id });
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
        name: data.name,
      };
      const response = await api.request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData),
      });

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info("User registered successfully", { userId: response.user.id });
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
      const refreshToken = await this.getRefreshToken();
      if (refreshToken) {
        // Notify server about logout (optional)
        try {
          await api.request("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {
          // Ignore server logout errors
          logger.warn("Server logout failed, continuing with local logout", {
            error,
          });
        }
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
   */
  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await api.request<AuthResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      // Store new tokens
      await this.storeAuthData(response);
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
      const response = await api.request<{ success: boolean; message: string }>(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      );

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
      const response = await api.request<{ success: boolean; message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(resetData),
        },
      );

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
      const userData = await this.secureGetItemAsync(AuthService.USER_KEY);
      return userData ? (JSON.parse(userData) as User) : null;
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
      return await this.secureGetItemAsync(AuthService.ACCESS_TOKEN_KEY);
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
      await this.secureSetItemAsync(
        AuthService.USER_KEY,
        JSON.stringify(updatedUser),
      );
      logger.info("User data updated", { userId: updatedUser.id });
    } catch (error) {
      logger.error("Failed to update user data", { error });
      throw new AuthError("Failed to update user data", error);
    }
  }

  // Private helper methods

  private async storeAuthData(response: AuthResponse): Promise<void> {
    try {
      await Promise.all([
        this.secureSetItemAsync(
          AuthService.ACCESS_TOKEN_KEY,
          response.accessToken,
        ),
        this.secureSetItemAsync(
          AuthService.REFRESH_TOKEN_KEY,
          response.refreshToken,
        ),
        this.secureSetItemAsync(
          AuthService.USER_KEY,
          JSON.stringify(response.user),
        ),
        this.secureSetItemAsync(
          AuthService.SESSION_START_KEY,
          Date.now().toString(),
        ),
        this.secureSetItemAsync(
          AuthService.LAST_ACTIVITY_KEY,
          Date.now().toString(),
        ),
      ]);

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
        this.secureDeleteItemAsync(AuthService.ACCESS_TOKEN_KEY),
        this.secureDeleteItemAsync(AuthService.REFRESH_TOKEN_KEY),
        this.secureDeleteItemAsync(AuthService.USER_KEY),
        this.secureDeleteItemAsync(AuthService.SESSION_START_KEY),
        this.secureDeleteItemAsync(AuthService.LAST_ACTIVITY_KEY),
      ]);

      // Stop session monitoring
      this.stopSessionMonitoring();
    } catch (error) {
      logger.error("Failed to clear auth data", { error });
      // Don't throw here as this is cleanup
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await this.secureGetItemAsync(AuthService.REFRESH_TOKEN_KEY);
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
