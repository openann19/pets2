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

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
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

      expect(result.current.isValid).toBe(false);
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

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() =>
        useForgotPasswordScreen({ navigation: { goBack: jest.fn() } as any }),
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(Alert.alert).toHaveBeenCalled();
    });
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
