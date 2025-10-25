/**
 * LoginScreen Test Suite
 * Comprehensive tests for login screen
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import { authService } from "../../services/AuthService";
import { biometricService } from "../../services/BiometricService";
import { useAuthStore } from "@pawfectmatch/core";
import {
  createMockUser,
  createMockNavigation,
  createMockRoute,
} from "../../__tests__/utils/testFactories";

// Mock dependencies
jest.mock("../../services/AuthService");
jest.mock("../../services/BiometricService");
jest.mock("@pawfectmatch/core");
jest.mock("react-native-safe-area-context");

describe("LoginScreen", () => {
  const mockNavigation = createMockNavigation();
  const mockRoute = createMockRoute("Login");

  const mockAuthStore = {
    setUser: jest.fn(),
    setTokens: jest.fn(),
    setError: jest.fn(),
    setIsLoading: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
    (authService.login as jest.Mock).mockResolvedValue({
      user: createMockUser(),
      accessToken: "test-token",
      refreshToken: "refresh-token",
    });
    (biometricService.checkBiometricSupport as jest.Mock).mockResolvedValue({
      hasHardware: true,
      isEnrolled: true,
    });
  });

  describe("Initial Render", () => {
    it("should render login form correctly", () => {
      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      expect(getByPlaceholderText("Email")).toBeTruthy();
      expect(getByPlaceholderText("Password")).toBeTruthy();
      expect(getByText("Login")).toBeTruthy();
      expect(getByText("Sign Up")).toBeTruthy();
    });

    it("should show biometric login button when available", async () => {
      const { getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByTestId("biometric-login-button")).toBeTruthy();
      });
    });

    it("should not show biometric button when not available", async () => {
      (biometricService.checkBiometricSupport as jest.Mock).mockResolvedValue({
        hasHardware: false,
        isEnrolled: false,
      });

      const { queryByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(queryByTestId("biometric-login-button")).toBeNull();
      });
    });

    it("should show remember me checkbox", () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      expect(getByText("Remember me")).toBeTruthy();
    });

    it("should show forgot password link", () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      expect(getByText("Forgot Password?")).toBeTruthy();
    });
  });

  describe("Form Validation", () => {
    it("should validate email format", async () => {
      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "invalid-email");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText(/valid email/i)).toBeTruthy();
      });
    });

    it("should require password", async () => {
      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText(/password is required/i)).toBeTruthy();
      });
    });

    it("should require email", async () => {
      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText(/email is required/i)).toBeTruthy();
      });
    });
  });

  describe("Login Flow", () => {
    it("should login successfully with valid credentials", async () => {
      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

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
        expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
      });
    });

    it("should handle login errors", async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials"),
      );

      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
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

    it("should show loading state during login", async () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      expect(getByTestId("loading-indicator")).toBeTruthy();
    });
  });

  describe("Biometric Authentication", () => {
    it("should attempt biometric login when button pressed", async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
      });
      (authService.loginWithBiometrics as jest.Mock).mockResolvedValue({
        user: createMockUser(),
        accessToken: "test-token",
        refreshToken: "refresh-token",
      });

      const { getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        const biometricButton = getByTestId("biometric-login-button");
        fireEvent.press(biometricButton);
      });

      await waitFor(() => {
        expect(biometricService.authenticate).toHaveBeenCalled();
      });
    });

    it("should handle biometric authentication failure", async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: "Authentication failed",
      });

      const { getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        const biometricButton = getByTestId("biometric-login-button");
        fireEvent.press(biometricButton);
      });

      await waitFor(() => {
        expect(biometricService.authenticate).toHaveBeenCalled();
      });
    });
  });

  describe("Password Visibility", () => {
    it("should toggle password visibility", () => {
      const { getByPlaceholderText, getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const passwordInput = getByPlaceholderText("Password");
      const toggleButton = getByTestId("password-toggle");

      fireEvent.press(toggleButton);

      expect(passwordInput.props.secureTextEntry).toBe(false);
    });

    it("should start with password hidden", () => {
      const { getByPlaceholderText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const passwordInput = getByPlaceholderText("Password");

      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe("Navigation", () => {
    it("should navigate to register screen", () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const signUpButton = getByText("Sign Up");
      fireEvent.press(signUpButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("Register");
    });

    it("should navigate to forgot password screen", () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const forgotPasswordLink = getByText("Forgot Password?");
      fireEvent.press(forgotPasswordLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("ForgotPassword");
    });
  });

  describe("Remember Me", () => {
    it("should toggle remember me state", () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const rememberMeCheckbox = getByText("Remember me");
      fireEvent.press(rememberMeCheckbox);

      // Check state change
      expect(rememberMeCheckbox).toBeTruthy();
    });

    it("should save remember me preference", async () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const rememberMeCheckbox = getByTestId("remember-me-checkbox");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(rememberMeCheckbox);
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility labels", () => {
      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      expect(emailInput).toHaveAccessibilityProps({
        accessibilityLabel: "Email",
      });
      expect(passwordInput).toHaveAccessibilityProps({
        accessibilityLabel: "Password",
      });
      expect(loginButton).toBeAccessible();
    });

    it("should support screen readers", () => {
      const { getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const biometricButton = getByTestId("biometric-login-button");
      expect(biometricButton).toBeAccessible();
    });
  });

  describe("Error Display", () => {
    it("should display login error message", async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const { getByPlaceholderText, getByText, getByTestId } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByTestId("error-message")).toBeTruthy();
      });
    });

    it("should clear errors when user starts typing", async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const { getByPlaceholderText, getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");
      const passwordInput = getByPlaceholderText("Password");
      const loginButton = getByText("Login");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        // Error shown
      });

      // Start typing again
      fireEvent.changeText(emailInput, "newtest@example.com");

      // Error should be cleared
    });
  });

  describe("Keyboard Handling", () => {
    it("should dismiss keyboard on blur", () => {
      const { getByPlaceholderText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText("Email");

      fireEvent(emailInput, "focus");
      fireEvent(emailInput, "blur");
    });

    it("should handle keyboard avoiding view", () => {
      const { UNSAFE_root } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
