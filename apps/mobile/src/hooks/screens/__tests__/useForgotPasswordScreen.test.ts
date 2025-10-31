/**
 * useForgotPasswordScreen Tests
 * Unit tests for forgot password functionality
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { authService } from '../../../services/AuthService';
import { useForgotPasswordScreen } from '../useForgotPasswordScreen';

jest.mock('../../../services/AuthService', () => ({
  authService: {
    forgotPassword: jest.fn(),
  },
}));

const mockAlert = jest.fn();

jest.mock('react-native', () => ({
  Alert: {
    alert: (...args: any[]) => mockAlert(...args),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('useForgotPasswordScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
  });

  describe('Initial State', () => {
    it('should initialize with empty email', () => {
      const { result } = renderHook(() =>
        useForgotPasswordScreen({ navigation: mockNavigation as any }),
      );

      expect(result.current.values.email).toBe('');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate email format', async () => {
      const { result } = renderHook(() =>
        useForgotPasswordScreen({ navigation: mockNavigation as any }),
      );

      act(() => {
        result.current.setValue('email', 'invalid-email');
      });

      await waitFor(() => {
        expect(result.current.errors.email).toBeDefined();
      });
    });

    it('should require email', () => {
      const { result } = renderHook(() =>
        useForgotPasswordScreen({ navigation: mockNavigation as any }),
      );

      // Initially isValid might be true because no validation has run yet
      // Trigger validation by setting an empty value
      act(() => {
        result.current.setValue('email', '');
      });

      // After setting empty value, validation should run and isValid should be false
      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.email).toBeDefined();
    });
  });

  describe('handleSubmit', () => {
    it('should send password reset successfully', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({
        success: true,
        message: 'Email sent',
      } as any);

      const { result } = renderHook(() =>
        useForgotPasswordScreen({ navigation: mockNavigation as any }),
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      // Wait for validation to complete
      await waitFor(
        () => {
          expect(result.current.errors.email).toBeUndefined();
        },
        { timeout: 3000 },
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      // Wait for async operations to complete
      await waitFor(
        () => {
          expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
          expect(mockAlert).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    }, 10000);

    it('should handle API errors', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() =>
        useForgotPasswordScreen({ navigation: { goBack: jest.fn() } as any }),
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      // Wait for validation to complete
      await waitFor(
        () => {
          expect(result.current.errors.email).toBeUndefined();
        },
        { timeout: 3000 },
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      // Wait for error handling to complete
      await waitFor(
        () => {
          expect(mockAlert).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    }, 10000);
  });

  describe('Navigation', () => {
    it('should provide navigation handlers', () => {
      const { result } = renderHook(() =>
        useForgotPasswordScreen({ navigation: mockNavigation as any }),
      );

      expect(result.current.navigateBack).toBeDefined();
      expect(typeof result.current.navigateBack).toBe('function');
    });
  });
});
