/**
 * useResetPasswordScreen Hook
 * Manages Reset Password screen state and interactions
 */
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { logger } from "@pawfectmatch/core";
import { authService, AuthError } from "../../services/AuthService";
import { useFormState } from "../utils/useFormState";
import type { RootStackScreenProps } from "../../navigation/types";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

interface UseResetPasswordScreenOptions {
  navigation: RootStackScreenProps<"ResetPassword">["navigation"];
  route: RootStackScreenProps<"ResetPassword">["route"];
}

interface UseResetPasswordScreenReturn {
  values: ResetPasswordFormValues;
  errors: Partial<Record<keyof ResetPasswordFormValues, string>>;
  isValid: boolean;
  loading: boolean;
  setValue: (name: keyof ResetPasswordFormValues, value: string) => void;
  handleSubmit: (e?: any) => void | Promise<void>;
  navigateBack: () => void;
}

export function useResetPasswordScreen({
  navigation,
  route,
}: UseResetPasswordScreenOptions): UseResetPasswordScreenReturn {
  const { token } = route.params;

  // Form validation rules
  const validateForm = useCallback(
    (
      values: ResetPasswordFormValues,
    ): Partial<Record<keyof ResetPasswordFormValues, string>> => {
      const errors: Partial<Record<keyof ResetPasswordFormValues, string>> = {};

      if (!values.password) {
        errors.password = "Password is required";
      } else if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])/.test(values.password)) {
        errors.password = "Password must contain at least one lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(values.password)) {
        errors.password = "Password must contain at least one uppercase letter";
      } else if (!/(?=.*\d)/.test(values.password)) {
        errors.password = "Password must contain at least one number";
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
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
  } = useFormState<ResetPasswordFormValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: validateForm,
  });

  // Handle password reset submission
  const handleResetPassword = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoading(true);

    try {
      logger.info("Password reset attempt", { token });

      await authService.resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );

      Alert.alert(
        "Password Reset Successful",
        "Your password has been reset successfully. You can now log in with your new password.",
        [
          {
            text: "Go to Login",
            onPress: () => navigation.navigate("Login"),
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

      logger.error("Password reset failed", { error });

      const errorMessage =
        error instanceof AuthError
          ? error.message
          : "Unable to reset password. The reset link may have expired. Please request a new one.";

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  }, [token, values.password, values.confirmPassword, navigation]);

  const handleSubmit = handleSubmitForm(handleResetPassword);

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

