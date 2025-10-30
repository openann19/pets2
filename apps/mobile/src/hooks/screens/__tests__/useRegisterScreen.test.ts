/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { useRegisterScreen } from '../useRegisterScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  reset: jest.fn(),
};

// Mock auth store
jest.mock('../../stores/useAuthStore', () => ({
  useAuthStore: () => ({
    register: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('useRegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty form values', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    expect(result.current.values.firstName).toBe('');
    expect(result.current.values.lastName).toBe('');
    expect(result.current.values.email).toBe('');
    expect(result.current.values.password).toBe('');
    expect(result.current.values.confirmPassword).toBe('');
    expect(result.current.values.dateOfBirth).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should update form field values', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.setValue('firstName', 'John');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('password', 'password123');
      result.current.setValue('confirmPassword', 'password123');
      result.current.setValue('dateOfBirth', '1990-01-01');
    });

    expect(result.current.values.firstName).toBe('John');
    expect(result.current.values.email).toBe('john@example.com');
    expect(result.current.values.password).toBe('password123');
    expect(result.current.values.confirmPassword).toBe('password123');
    expect(result.current.values.dateOfBirth).toBe('1990-01-01');
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.validateForm();
    });

    expect(result.current.errors.firstName).toBe('First name is required');
    expect(result.current.errors.lastName).toBe('Last name is required');
    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password is required');
    expect(result.current.errors.dateOfBirth).toBe('Date of birth is required');
  });

  it('should validate email format', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.setValue('email', 'invalid-email');
      result.current.setValue('firstName', 'John');
      result.current.setValue('lastName', 'Doe');
      result.current.setValue('password', 'password123');
      result.current.setValue('confirmPassword', 'password123');
      result.current.setValue('dateOfBirth', '1990-01-01');
      result.current.validateForm();
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address');
    expect(result.current.errors.firstName).toBeUndefined();
  });

  it('should validate password strength', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.setValue('firstName', 'John');
      result.current.setValue('lastName', 'Doe');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('password', 'weak');
      result.current.setValue('confirmPassword', 'weak');
      result.current.setValue('dateOfBirth', '1990-01-01');
      result.current.validateForm();
    });

    expect(result.current.errors.password).toBe('Password must be at least 8 characters');
  });

  it('should validate password confirmation match', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.setValue('firstName', 'John');
      result.current.setValue('lastName', 'Doe');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('password', 'password123');
      result.current.setValue('confirmPassword', 'differentpassword');
      result.current.setValue('dateOfBirth', '1990-01-01');
      result.current.validateForm();
    });

    expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
  });

  it('should validate age (must be 18+)', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    const underageDate = new Date();
    underageDate.setFullYear(underageDate.getFullYear() - 17); // 17 years old

    act(() => {
      result.current.setValue('firstName', 'John');
      result.current.setValue('lastName', 'Doe');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('password', 'password123');
      result.current.setValue('confirmPassword', 'password123');
      result.current.setValue('dateOfBirth', underageDate.toISOString().split('T')[0]);
      result.current.validateForm();
    });

    expect(result.current.errors.dateOfBirth).toBe('You must be at least 18 years old');
  });

  it('should clear errors when valid data is entered', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    // Set invalid data first
    act(() => {
      result.current.setValue('email', 'invalid');
      result.current.setValue('password', 'weak');
      result.current.validateForm();
    });

    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.errors.password).toBeTruthy();

    // Set valid data
    act(() => {
      result.current.setValue('firstName', 'John');
      result.current.setValue('lastName', 'Doe');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('password', 'validpassword');
      result.current.setValue('confirmPassword', 'validpassword');
      result.current.setValue('dateOfBirth', '1990-01-01');
      result.current.validateForm();
    });

    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBeUndefined();
    expect(result.current.isValid).toBe(true);
  });

  it('should navigate to login screen', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.navigateToLogin();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('should handle form submission with valid data', async () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.setValue('firstName', 'John');
      result.current.setValue('lastName', 'Doe');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('password', 'password123');
      result.current.setValue('confirmPassword', 'password123');
      result.current.setValue('dateOfBirth', '1990-01-01');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Note: Actual submission logic depends on auth store implementation
    expect(result.current.values.firstName).toBe('John');
    expect(result.current.values.email).toBe('john@example.com');
  });

  it('should reset form to initial state', () => {
    const { result } = renderHook(() => useRegisterScreen({ navigation: mockNavigation }));

    act(() => {
      result.current.setValue('firstName', 'John');
      result.current.setValue('email', 'john@example.com');
      result.current.validateForm(); // This will add errors
    });

    expect(result.current.values.firstName).toBe('John');
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values.firstName).toBe('');
    expect(result.current.values.email).toBe('');
    expect(result.current.errors).toEqual({});
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() =>
      useRegisterScreen({ navigation: mockNavigation }),
    );

    const firstSetValue = result.current.setValue;
    const firstValidate = result.current.validateForm;
    const firstSubmit = result.current.handleSubmit;
    const firstReset = result.current.resetForm;
    const firstNavigate = result.current.navigateToLogin;

    rerender();

    expect(result.current.setValue).toBe(firstSetValue);
    expect(result.current.validateForm).toBe(firstValidate);
    expect(result.current.handleSubmit).toBe(firstSubmit);
    expect(result.current.resetForm).toBe(firstReset);
    expect(result.current.navigateToLogin).toBe(firstNavigate);
  });
});
