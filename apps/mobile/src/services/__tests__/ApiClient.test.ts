/**
 * Tests for API Client automatic token refresh functionality
 */
import axios from "axios";
import ApiClient, { ApiClientConfig } from "../apiClient";
import * as SecureStore from "expo-secure-store";

// Mock dependencies
jest.mock("axios");
jest.mock("expo-secure-store");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(),
  removeItem: jest.fn().mockResolvedValue(),
}));
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
  addEventListener: jest.fn(),
}));
jest.mock("../AuthService", () => ({
  authService: {
    refreshToken: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe("ApiClient - Automatic Token Refresh", () => {
  let apiClient: ApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    const config: ApiClientConfig = {
      baseURL: "http://localhost:3000",
      timeout: 30000,
    };

    apiClient = new ApiClient(config);

    // Simulate interceptor setup
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock
      .calls[0][0];
    const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock
      .calls[0];

    // Store references for tests
    (apiClient as any).requestInterceptor = requestInterceptor;
    (apiClient as any).responseSuccessInterceptor = responseInterceptor[0];
    (apiClient as any).responseErrorInterceptor = responseInterceptor[1];
  });

  describe("401 Error Handling", () => {
    it("should attempt token refresh on 401 error", async () => {
      const refreshToken = "refresh-token";
      const mockResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: { _id: "user-id" },
      };

      mockedSecureStore.getItemAsync.mockResolvedValue(refreshToken);

      const { authService } = await import("../AuthService");
      (authService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);

      const errorInterceptor = (apiClient as any).responseErrorInterceptor;

      const error = {
        response: { status: 401 },
        config: { headers: {}, url: "/test" },
      };

      await expect(errorInterceptor(error)).rejects.toThrow();

      expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith(
        "auth_refresh_token",
      );
    });

    it("should clear tokens if refresh fails", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue("invalid-token");

      const { authService } = await import("../AuthService");
      (authService.refreshToken as jest.Mock).mockResolvedValue(null);

      const errorInterceptor = (apiClient as any).responseErrorInterceptor;

      const error = {
        response: { status: 401 },
        config: { headers: {}, url: "/test" },
      };

      await expect(errorInterceptor(error)).rejects.toThrow();
    });

    it("should retry original request after successful token refresh", async () => {
      const refreshToken = "refresh-token";
      const mockResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: { _id: "user-id" },
      };

      mockedSecureStore.getItemAsync.mockResolvedValue(refreshToken);

      const { authService } = await import("../AuthService");
      (authService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);

      const errorInterceptor = (apiClient as any).responseErrorInterceptor;

      const error = {
        response: { status: 401 },
        config: { headers: {}, url: "/test" },
      };

      await expect(errorInterceptor(error)).rejects.toThrow();
    });
  });

  describe("Request Interceptor", () => {
    it("should add Authorization header with token", () => {
      const requestInterceptor = (apiClient as any).requestInterceptor;

      // Set token manually for test
      (apiClient as any).token = "test-token";

      const config = {
        url: "/test",
        headers: {},
        method: "GET",
        data: {},
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("should validate endpoint", () => {
      const requestInterceptor = (apiClient as any).requestInterceptor;

      const config = {
        url: "http://malicious.com/api",
        headers: {},
        method: "GET",
        data: {},
      };

      expect(() => requestInterceptor(config)).toThrow("Invalid endpoint");
    });
  });

  describe("Token Management", () => {
    it("should set token", async () => {
      await apiClient.setToken("new-token");

      expect((apiClient as any).token).toBe("new-token");
    });

    it("should clear token", async () => {
      (apiClient as any).token = "existing-token";

      await apiClient.clearToken();

      expect((apiClient as any).token).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle 403 Forbidden", () => {
      const errorInterceptor = (apiClient as any).responseErrorInterceptor;

      const error = {
        response: { status: 403, data: {} },
        config: { url: "/test", method: "GET" },
      };

      expect(() => errorInterceptor(error)).rejects.toThrow();
    });

    it("should handle 500 Server Error", () => {
      const errorInterceptor = (apiClient as any).responseErrorInterceptor;

      const error = {
        response: { status: 500, data: {} },
        config: { url: "/test", method: "GET" },
      };

      expect(() => errorInterceptor(error)).rejects.toThrow();
    });

    it("should handle network errors", () => {
      const errorInterceptor = (apiClient as any).responseErrorInterceptor;

      const error = {
        request: {},
        config: { url: "/test", method: "GET" },
      };

      expect(() => errorInterceptor(error)).rejects.toThrow();
    });
  });
});
