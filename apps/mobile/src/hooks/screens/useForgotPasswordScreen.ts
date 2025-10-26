/**
 * useForgotPasswordScreen Hook
 * Manages Forgot Password screen state and interactions
 */
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { logger } from "@pawfectmatch/core";
import { authService, AuthError } from "../../services/AuthService";
import { useFormState } from "../utils/useFormState";
import type { RootStackScreenProps } from "../../navigation/types";

interface ForgotPasswordFormValues {
  email: string;
}

interface UseForgotPasswordScreenOptions {
  navigation: RootStackScreenProps<"ForgotPassword">["navigation"];
}

interface UseForgotPasswordScreenReturn {
  values: ForgotPasswordFormValues;
  errors: Partial<Record<keyof ForgotPasswordFormValues, string>>;
  isValid: boolean;
  loading: boolean;
  setValue: (name: keyof ForgotPasswordFormValues, value: string) => void;
  handleSubmit: (e?: any) => void | Promise<void>;
  navigateBack: () => void;
}

export function useForgotPasswordScreen({
  navigation,
}: UseForgotPasswordScreenOptions): UseForgotPasswordScreenReturn {
  // Form validation rules
  const validateForm = useCallback(
    (
      values: ForgotPasswordFormValues,
    ): Partial<Record<keyof ForgotPasswordFormValues, string>> => {
      const errors: Partial<Record<keyof ForgotPasswordFormValues, string>> =
        {};

      if (!values.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Please enter a valid email address";
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
    isValid,
    setValue,
    handleSubmit: handleSubmitForm,
  } = useFormState<ForgotPasswordFormValues>({
    initialValues: {
      email: "",
    },
    validate: validateForm,
  });

  // Handle forgot password submission
  const handleForgotPassword = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoading(true);

    try {
      logger.info("Forgot password request", { email: values.email });

      const response = await authService.forgotPassword(values.email);

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );

      Alert.alert(
        "Check Your Email",
        "We've sent you a password reset link. Please check your email and follow the instructions.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
            style: "default",
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );

      logger.error("Forgot password failed", { error });

      const errorMessage =
        error instanceof AuthError
          ? error.message
          : "Failed to send password reset email. Please try again.";

      Alert.alert("Error", errorMessage, [{ text: "OK", style: "default" }]);
    } finally {
      setLoading(false);
    }
  }, [values.email, navigation]);

  const handleSubmit = handleSubmitForm(handleForgotPassword);

  const navigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    values,
    errors,
    isValid,
    loading,
    setValue,
    handleSubmit,
    navigateBack,
  };
}
