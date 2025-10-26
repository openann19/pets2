import { useCallback } from "react";
import { logger } from "../../services/logger";
import { useFormState } from "../utils/useFormState";
import type { RootStackScreenProps } from "../navigation/types";

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface UseRegisterScreenOptions {
  navigation: RootStackScreenProps<"Register">["navigation"];
}

interface UseRegisterScreenReturn {
  values: RegisterFormValues;
  errors: Partial<Record<keyof RegisterFormValues, string>>;
  isValid: boolean;
  setValue: (name: keyof RegisterFormValues, value: string) => void;
  handleSubmit: (e?: any) => Promise<void>;
  navigateToLogin: () => void;
}

/**
 * Hook for managing RegisterScreen state and actions
 */
export function useRegisterScreen({
  navigation,
}: UseRegisterScreenOptions): UseRegisterScreenReturn {
  // Form validation rules
  const validateForm = useCallback(
    (
      values: RegisterFormValues,
    ): Partial<Record<keyof RegisterFormValues, string>> => {
      const errors: Partial<Record<keyof RegisterFormValues, string>> = {};

      // Email validation
      if (!values.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Email format is invalid";
      }

      // Password validation
      if (!values.password) {
        errors.password = "Password is required";
      } else if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }

      // Confirm password validation
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      // First name validation
      if (!values.firstName.trim()) {
        errors.firstName = "First name is required";
      }

      // Last name validation
      if (!values.lastName.trim()) {
        errors.lastName = "Last name is required";
      }

      // Date of birth validation
      if (!values.dateOfBirth.trim()) {
        errors.dateOfBirth = "Date of birth is required";
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.dateOfBirth)) {
        errors.dateOfBirth = "Date format should be YYYY-MM-DD";
      }

      return errors;
    },
    [],
  );

  // Form state management
  const {
    values,
    errors,
    isValid,
    setValue,
    handleSubmit: handleSubmitForm,
  } = useFormState<RegisterFormValues>({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
    validate: validateForm,
  });

  // Handle registration submission
  const handleRegister = useCallback(async () => {
    logger.info("Registration attempt:", { email: values.email });

    // TODO: Implement actual registration
    // This is a placeholder for the registration logic
    // In production, you would:
    // 1. Call AuthService.register(values)
    // 2. Handle success: navigation.navigate("Login")
    // 3. Handle error: setError state and display in UI

    // For demo purposes, navigate to Login
    navigation.navigate("Login");
  }, [values, navigation]);

  const handleSubmit = handleSubmitForm(handleRegister);

  const navigateToLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  return {
    values,
    errors,
    isValid,
    setValue,
    handleSubmit,
    navigateToLogin,
  };
}
