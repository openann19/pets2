import { useCallback, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { logger } from "../../services/logger";
import { authService, AuthError } from "../../services/AuthService";
import { useFormState } from "../utils/useFormState";
import type { RootStackScreenProps } from "../../navigation/types";

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
  loading: boolean;
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
    (
      values: LoginFormValues,
    ): Partial<Record<keyof LoginFormValues, string>> => {
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
    [],
  );

  // Form state management
  const [loading, setLoading] = useState(false);
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
  const handleLogin = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoading(true);
    
    try {
      logger.info("Login attempt:", { email: values.email });

      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );

      logger.info("Login successful", { userId: response.user.id });

      // Navigate to Home on successful login
      navigation.navigate("Home");
    } catch (error) {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );

      logger.error("Login failed", { error: error as Error, email: values.email });

      const errorMessage =
        error instanceof AuthError
          ? error.message
          : "Login failed. Please check your credentials and try again.";

      Alert.alert("Login Failed", errorMessage, [{ text: "OK", style: "default" }]);
    } finally {
      setLoading(false);
    }
  }, [values.email, values.password, navigation]);

  const handleSubmit = useCallback(
    async (e?: any) => {
      await handleSubmitForm(handleLogin)(e);
    },
    [handleSubmitForm, handleLogin]
  );

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
    loading,
    setValue,
    handleSubmit,
    navigateToRegister,
    navigateToForgotPassword,
  };
}
