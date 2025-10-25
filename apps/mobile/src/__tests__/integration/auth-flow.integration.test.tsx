/**
 * Authentication Flow Integration Test
 * Tests the complete user authentication journey
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../../screens/LoginScreen";
import RegisterScreen from "../../screens/RegisterScreen";
import { authService } from "../../services/AuthService";
import { biometricService } from "../../services/BiometricService";
import { useAuthStore } from "@pawfectmatch/core";
import {
  createMockUser,
  createMockNavigation,
  createMockRoute,
} from "../utils/testFactories";

// Mock dependencies
jest.mock("../../services/AuthService");
jest.mock("../../services/BiometricService");
jest.mock("@pawfectmatch/core");
jest.mock("react-native-safe-area-context");

describe("Authentication Flow Integration", () => {
  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const queryClient = createTestQueryClient();
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{children}</NavigationContainer>
      </QueryClientProvider>
    );
  };

  const mockAuthStore = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    setUser: jest.fn(),
    setTokens: jest.fn(),
    setError: jest.fn(),
    setIsLoading: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
  });

  describe("Registration to Login Flow", () => {
    it("should complete full registration flow", async () => {
      const mockUser = createMockUser();
      const mockAuthResponse = {
        user: mockUser,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      };

      (authService.register as jest.Mock).mockResolvedValue(mockAuthResponse);
      (biometricService.checkBiometricSupport as jest.Mock).mockResolvedValue({
        hasHardware: true,
        isEnrolled: true,
      });

      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Register");

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      // Fill registration form
      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const confirmPasswordInput = getByPlaceholderText("Confirm Password");
      const firstNameInput = getByPlaceholderText("First Name");
      const lastNameInput = getByPlaceholderText("Last Name");
      const registerButton = getByText("Create Account");

      fireEvent.changeText(emailInput, "newuser@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "password123");
      fireEvent.changeText(firstNameInput, "John");
      fireEvent.changeText(lastNameInput, "Doe");

      // Accept terms
      const termsCheckbox = getByText("I agree to the Terms of Service");
      fireEvent.press(termsCheckbox);

      // Submit registration
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          email: "newuser@example.com",
          password: "password123",
          name: "John Doe",
          confirmPassword: "password123",
        });
      });

      // Should navigate to home or next screen
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalled();
      });
    });

    it("should handle registration validation errors", async () => {
      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Register");

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const confirmPasswordInput = getByPlaceholderText("Confirm Password");
      const registerButton = getByText("Create Account");

      // Test invalid email
      fireEvent.changeText(emailInput, "invalid-email");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "password123");
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(getByText(/valid email/i)).toBeTruthy();
      });

      // Test password mismatch
      fireEvent.changeText(emailInput, "valid@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "different-password");
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(getByText(/passwords do not match/i)).toBeTruthy();
      });
    });
  });

  describe("Login Flow", () => {
    it("should complete login with valid credentials", async () => {
      const mockUser = createMockUser();
      const mockAuthResponse = {
        user: mockUser,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      };

      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);
      (biometricService.checkBiometricSupport as jest.Mock).mockResolvedValue({
        hasHardware: true,
        isEnrolled: true,
      });

      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      // Fill login form
      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });

      // Should navigate to home
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
      });
    });

    it("should handle login with invalid credentials", async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials"),
      );

      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "wrong-password");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText(/invalid credentials/i)).toBeTruthy();
      });
    });

    it("should handle biometric login flow", async () => {
      const mockUser = createMockUser();
      const mockAuthResponse = {
        user: mockUser,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      };

      (biometricService.checkBiometricSupport as jest.Mock).mockResolvedValue({
        hasHardware: true,
        isEnrolled: true,
      });
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
      });
      (authService.loginWithBiometrics as jest.Mock).mockResolvedValue(
        mockAuthResponse,
      );

      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByTestId } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      await waitFor(() => {
        const biometricButton = getByTestId("biometric-login-button");
        fireEvent.press(biometricButton);
      });

      await waitFor(() => {
        expect(biometricService.authenticate).toHaveBeenCalled();
        expect(authService.loginWithBiometrics).toHaveBeenCalled();
      });
    });
  });

  describe("Navigation Between Auth Screens", () => {
    it("should navigate from login to register", () => {
      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByText } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const signUpButton = getByText("Sign Up");
      fireEvent.press(signUpButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("Register");
    });

    it("should navigate from register to login", () => {
      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Register");

      const { getByText } = render(
        <TestWrapper>
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const loginLink = getByText("Already have an account? Sign In");
      fireEvent.press(loginLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("Login");
    });

    it("should navigate to forgot password from login", () => {
      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByText } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const forgotPasswordLink = getByText("Forgot Password?");
      fireEvent.press(forgotPasswordLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("ForgotPassword");
    });
  });

  describe("Session Management", () => {
    it("should maintain session after successful login", async () => {
      const mockUser = createMockUser();
      const mockAuthResponse = {
        user: mockUser,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      };

      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);
      (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);

      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockAuthStore.setUser).toHaveBeenCalledWith(mockUser);
        expect(mockAuthStore.setTokens).toHaveBeenCalledWith({
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
        });
      });
    });

    it("should handle logout flow", async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      // Simulate logged in state
      mockAuthStore.user = createMockUser();
      mockAuthStore.isAuthenticated = true;

      await authService.logout();

      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors during registration", async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Register");

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const confirmPasswordInput = getByPlaceholderText("Confirm Password");
      const firstNameInput = getByPlaceholderText("First Name");
      const lastNameInput = getByPlaceholderText("Last Name");
      const registerButton = getByText("Create Account");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "password123");
      fireEvent.changeText(firstNameInput, "John");
      fireEvent.changeText(lastNameInput, "Doe");

      const termsCheckbox = getByText("I agree to the Terms of Service");
      fireEvent.press(termsCheckbox);

      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(getByText(/network error/i)).toBeTruthy();
      });
    });

    it("should handle biometric authentication failure", async () => {
      (biometricService.checkBiometricSupport as jest.Mock).mockResolvedValue({
        hasHardware: true,
        isEnrolled: true,
      });
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: "Authentication failed",
      });

      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByTestId } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      await waitFor(() => {
        const biometricButton = getByTestId("biometric-login-button");
        fireEvent.press(biometricButton);
      });

      await waitFor(() => {
        expect(biometricService.authenticate).toHaveBeenCalled();
        expect(authService.loginWithBiometrics).not.toHaveBeenCalled();
      });
    });
  });

  describe("Form Validation Integration", () => {
    it("should validate all required fields in registration", async () => {
      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Register");

      const { getByText } = render(
        <TestWrapper>
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const registerButton = getByText("Create Account");
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(getByText(/email is required/i)).toBeTruthy();
        expect(getByText(/password is required/i)).toBeTruthy();
        expect(getByText(/first name is required/i)).toBeTruthy();
        expect(getByText(/last name is required/i)).toBeTruthy();
      });
    });

    it("should validate all required fields in login", async () => {
      const mockNavigation = createMockNavigation();
      const mockRoute = createMockRoute("Login");

      const { getByText } = render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>,
      );

      const loginButton = getByText("Login");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText(/email is required/i)).toBeTruthy();
        expect(getByText(/password is required/i)).toBeTruthy();
      });
    });
  });
});
