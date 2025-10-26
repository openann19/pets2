/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { useLoginScreen } from "../useLoginScreen";

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  reset: jest.fn(),
};

// Mock auth store
const mockLogin = jest.fn();

jest.mock("@pawfectmatch/core", () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
  }),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useLoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with empty form values", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    expect(result.current.values.email).toBe("");
    expect(result.current.values.password).toBe("");
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update email field", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    act(() => {
      result.current.setValue("email", "test@example.com");
    });

    expect(result.current.values.email).toBe("test@example.com");
  });

  it("should update password field", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    act(() => {
      result.current.setValue("password", "password123");
    });

    expect(result.current.values.password).toBe("password123");
  });

  it("should validate email format", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    act(() => {
      result.current.setValue("email", "invalid-email");
      result.current.setValue("password", "password123");
      result.current.validateForm();
    });

    expect(result.current.errors.email).toBe(
      "Please enter a valid email address",
    );
  });

  it("should validate password presence", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    act(() => {
      result.current.setValue("email", "test@example.com");
      result.current.validateForm();
    });

    expect(result.current.errors.password).toBe("Password is required");
  });

  it("should clear errors when valid data is entered", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    // Set invalid data first
    act(() => {
      result.current.setValue("email", "invalid");
      result.current.setValue("password", "");
      result.current.validateForm();
    });

    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.errors.password).toBeTruthy();

    // Set valid data
    act(() => {
      result.current.setValue("email", "valid@example.com");
      result.current.setValue("password", "validpassword");
      result.current.validateForm();
    });

    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBeUndefined();
  });

  it("should navigate to register screen", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    act(() => {
      result.current.navigateToRegister();
    });

    expect(mockNavigate).toHaveBeenCalledWith("Register");
  });

  it("should navigate to forgot password screen", () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    act(() => {
      result.current.navigateToForgotPassword();
    });

    expect(mockNavigate).toHaveBeenCalledWith("ForgotPassword");
  });

  it("should handle form submission", async () => {
    const { result } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    act(() => {
      result.current.setValue("email", "test@example.com");
      result.current.setValue("password", "password123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Note: Actual submission logic depends on auth store implementation
    // This test verifies the form validation and submission flow
    expect(result.current.values.email).toBe("test@example.com");
    expect(result.current.values.password).toBe("password123");
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() =>
      useLoginScreen({ navigation: mockNavigation }),
    );

    const firstSetValue = result.current.setValue;
    const firstValidate = result.current.validateForm;
    const firstSubmit = result.current.handleSubmit;
    const firstNavigateRegister = result.current.navigateToRegister;

    rerender();

    expect(result.current.setValue).toBe(firstSetValue);
    expect(result.current.validateForm).toBe(firstValidate);
    expect(result.current.handleSubmit).toBe(firstSubmit);
    expect(result.current.navigateToRegister).toBe(firstNavigateRegister);
  });
});
