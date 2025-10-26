import { useCallback } from "react";
import { logger } from "../services/logger";
import { useFormState } from "../utils/useFormState";
import type { RootStackScreenProps } from "../navigation/types";

interface LoginFormValues {
  email: string;
  password: string;
}

interface UseLoginScreenOptions {
  navigation: RootStackScreenProps<"Login">["navigation"];
}

interface UseLoginScreenReturn {
  values: LoginFormValues;
  errors: Partial<Record<keyof LoginFormValues, string>>;
  touched: Partial<Record<keyof LoginFormValues, boolean>>;
  isValid: boolean;
  setValue: (name: keyof LoginFormValues, value: string) => void;
  handleSubmit: (e?: any) => Promise<void>;
  navigateToRegister: () => void;
  navigateToForgotPassword: () => void;
}

/**
 * Hook for managing LoginScreen state and actions
 */
export function useLoginScreen({
  navigation,
}: UseLoginScreenOptions): UseLoginScreenReturn {
  // Form validation rules
  const validateForm = useCallback(
    (values: LoginFormValues): Partial<Record<keyof LoginFormValues, string>> => {
      const errors: Partial<Record<keyof LoginFormValues, string>> = {};

      if (!values.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Email format is invalid";
      }

      if (!values.password) {
        errors.password = "Password is required";
      } else if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }

      return errors;
    },
    []
  );

  // Form state management
  const {
    values,
    errors,
    touched,
    isValid,
    setValue,
    handleSubmit: handleSubmitForm,
  } = useFormState<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: validateForm,
  });

  // Handle login submission
  const handleLogin = useCallback(
    async () => {
      logger.info("Login attempt:", { email: values.email });
      
      // TODO: Implement actual authentication
      // This is a placeholder for the authentication logic
      // In production, you would:
      // 1. Call AuthService.login(values.email, values.password)
      // 2. Handle success: navigation.navigate("Home")
      // 3. Handle error: setError state and display in UI
      
      // For demo purposes, navigate to Home
      navigation.navigate("Home");
    },
    [values.email, navigation]
  );

  const handleSubmit = handleSubmitForm(handleLogin);

  const navigateToRegister = useCallback(() => {
    navigation.navigate("Register");
  }, [navigation]);

  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate("ForgotPassword");
  }, [navigation]);

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    handleSubmit,
    navigateToRegister,
    navigateToForgotPassword,
  };
}
