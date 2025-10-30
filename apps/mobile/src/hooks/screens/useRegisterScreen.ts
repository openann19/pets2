import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '../../services/logger';
import { authService, AuthError } from '../../services/AuthService';
import { useFormState } from '../utils/useFormState';
import type { RootStackScreenProps } from '../../navigation/types';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface UseRegisterScreenOptions {
  navigation: RootStackScreenProps<'Register'>['navigation'];
}

interface UseRegisterScreenReturn {
  values: RegisterFormValues;
  errors: Partial<Record<keyof RegisterFormValues, string>>;
  isValid: boolean;
  loading: boolean;
  setValue: (name: keyof RegisterFormValues, value: string) => void;
  handleSubmit: (e?: unknown) => Promise<void>;
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
    (values: RegisterFormValues): Partial<Record<keyof RegisterFormValues, string>> => {
      const errors: Partial<Record<keyof RegisterFormValues, string>> = {};

      // Email validation
      if (!values.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email format is invalid';
      }

      // Password validation
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])/.test(values.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(values.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(values.password)) {
        errors.password = 'Password must contain at least one number';
      }

      // Confirm password validation
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // First name validation
      if (!values.firstName.trim()) {
        errors.firstName = 'First name is required';
      }

      // Last name validation
      if (!values.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }

      // Date of birth validation
      if (!values.dateOfBirth.trim()) {
        errors.dateOfBirth = 'Date of birth is required';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.dateOfBirth)) {
        errors.dateOfBirth = 'Date format should be YYYY-MM-DD';
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
  } = useFormState<RegisterFormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
    },
    validate: validateForm,
  });

  // Handle registration submission
  const handleRegister = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoading(true);

    try {
      logger.info('Registration attempt:', { email: values.email });

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(values.password)) {
        throw new AuthError(
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
        );
      }

      const response = await authService.register({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        confirmPassword: values.confirmPassword,
      });

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      logger.info('Registration successful', { userId: response.user.id });

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
            style: 'default',
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});

      logger.error('Registration failed', { error: error as Error, email: values.email });

      const errorMessage =
        error instanceof AuthError
          ? error.message
          : 'Registration failed. Please check your information and try again.';

      Alert.alert('Registration Failed', errorMessage, [{ text: 'OK', style: 'default' }]);
    } finally {
      setLoading(false);
    }
  }, [values, navigation]);

  const handleSubmit = useCallback(
    async (e?: unknown) => {
      await handleSubmitForm(handleRegister)(e);
    },
    [handleSubmitForm, handleRegister],
  );

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return {
    values,
    errors,
    isValid,
    loading,
    setValue,
    handleSubmit,
    navigateToLogin,
  };
}
