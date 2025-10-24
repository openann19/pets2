import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormValidation, useAsyncSubmit } from '../useFormValidation';
import { z } from 'zod';

describe('useFormValidation Hook', () => {
  const testSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
  });

  type TestFormData = z.infer<typeof testSchema>;

  const defaultValues: TestFormData = {
    email: '',
    password: '',
    username: '',
  };

  describe('Basic Functionality', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      expect(result.current.getValues()).toEqual(defaultValues);
    });

    it('validates on change', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'invalid-email');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeDefined();
        expect(result.current.formState.errors.email?.message).toBe('Invalid email');
      });
    });

    it('clears errors when valid input is provided', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      // Set invalid email
      act(() => {
        result.current.setValue('email', 'invalid');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeDefined();
      });

      // Set valid email
      act(() => {
        result.current.setValue('email', 'valid@example.com');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeUndefined();
      });
    });
  });

  describe('Validation Rules', () => {
    it('validates email format', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'notanemail');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email?.message).toBe('Invalid email');
      });
    });

    it('validates minimum password length', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('password', 'short');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.password?.message).toBe(
          'Password must be at least 8 characters',
        );
      });
    });

    it('validates minimum username length', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('username', 'ab');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.username?.message).toBe(
          'Username must be at least 3 characters',
        );
      });
    });

    it('accepts valid inputs', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'valid@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('username', 'validuser');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeUndefined();
        expect(result.current.formState.errors.password).toBeUndefined();
        expect(result.current.formState.errors.username).toBeUndefined();
      });
    });
  });

  describe('Form State', () => {
    it('tracks dirty state', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      expect(result.current.formState.isDirty).toBe(false);

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      await waitFor(() => {
        expect(result.current.formState.isDirty).toBe(true);
      });
    });

    it.skip('tracks touched fields', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'test@example.com', { shouldTouch: true });
      });

      await waitFor(() => {
        // Check that the field is marked as touched (can be true or an object)
        expect(result.current.formState.touchedFields.email).toBeDefined();
      });
    });

    it('provides form validity status', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      expect(result.current.formState.isValid).toBe(false);

      act(() => {
        result.current.setValue('email', 'valid@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('username', 'validuser');
      });

      await waitFor(() => {
        expect(result.current.formState.isValid).toBe(true);
      });
    });
  });

  describe('Form Actions', () => {
    it('resets form to default values', () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.getValues()).toEqual(defaultValues);
    });

    it('resets form with new values', () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      const newValues: TestFormData = {
        email: 'new@example.com',
        password: 'newpassword123',
        username: 'newuser',
      };

      act(() => {
        result.current.reset(newValues);
      });

      expect(result.current.getValues()).toEqual(newValues);
    });

    it('handles multiple field updates', () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('username', 'testuser');
      });

      const values = result.current.getValues();
      expect(values.email).toBe('test@example.com');
      expect(values.password).toBe('password123');
      expect(values.username).toBe('testuser');
    });
  });

  describe('Complex Schemas', () => {
    it('handles nested object validation', async () => {
      const nestedSchema = z.object({
        user: z.object({
          email: z.string().email(),
          profile: z.object({
            name: z.string().min(2),
          }),
        }),
      });

      const { result } = renderHook(() =>
        useFormValidation(nestedSchema, {
          user: { email: '', profile: { name: '' } },
        }),
      );

      act(() => {
        result.current.setValue('user.email', 'invalid');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.user?.email).toBeDefined();
      });
    });

    it('handles optional fields', async () => {
      const optionalSchema = z.object({
        email: z.string().email(),
        phone: z.string().optional(),
      });

      const { result } = renderHook(() =>
        useFormValidation(optionalSchema, { email: '', phone: '' }),
      );

      act(() => {
        result.current.setValue('email', 'valid@example.com');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeUndefined();
        expect(result.current.formState.errors.phone).toBeUndefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('provides error messages for all invalid fields', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'invalid');
        result.current.setValue('password', 'short');
        result.current.setValue('username', 'ab');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeDefined();
        expect(result.current.formState.errors.password).toBeDefined();
        expect(result.current.formState.errors.username).toBeDefined();
      });
    });

    it('clears all errors on reset', async () => {
      const { result } = renderHook(() => useFormValidation(testSchema, defaultValues));

      act(() => {
        result.current.setValue('email', 'invalid');
        result.current.setValue('password', 'short');
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeDefined();
      });

      act(() => {
        result.current.reset();
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email).toBeUndefined();
        expect(result.current.formState.errors.password).toBeUndefined();
      });
    });
  });
});

describe('useAsyncSubmit Hook', () => {
  describe('Successful Submission', () => {
    it('calls onSubmit with form data', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, onSuccess));

      const testData = { email: 'test@example.com' };

      await act(async () => {
        await result.current(testData);
      });

      expect(onSubmit).toHaveBeenCalledWith(testData);
      expect(onSuccess).toHaveBeenCalled();
    });

    it('calls onSuccess after successful submission', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, onSuccess));

      await act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('Failed Submission', () => {
    it('calls onError when submission fails', async () => {
      const error = new Error('Submission failed');
      const onSubmit = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, undefined, onError));

      await act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('does not call onSuccess when submission fails', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Failed'));
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, onSuccess));

      await act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('handles errors gracefully without onError callback', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useAsyncSubmit(onSubmit));

      await act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      // Should not throw
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Multiple Submissions', () => {
    it('handles multiple sequential submissions', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, onSuccess));

      await act(async () => {
        await result.current({ email: 'test1@example.com' });
        await result.current({ email: 'test2@example.com' });
      });

      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(onSuccess).toHaveBeenCalledTimes(2);
    });

    it('handles alternating success and failure', async () => {
      const onSubmit = jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined);
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, onSuccess, onError));

      await act(async () => {
        await result.current({ email: 'test1@example.com' });
      });

      await act(async () => {
        await result.current({ email: 'test2@example.com' });
      });

      await act(async () => {
        await result.current({ email: 'test3@example.com' });
      });

      expect(onSuccess).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Callback Parameters', () => {
    it('works without onSuccess callback', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useAsyncSubmit(onSubmit));

      await act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it('works without onError callback', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useAsyncSubmit(onSubmit));

      await act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it('works with all callbacks', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, onSuccess, onError));

      await act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      expect(onSubmit).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Data Types', () => {
    it('handles different data types', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useAsyncSubmit(onSubmit));

      const complexData = {
        email: 'test@example.com',
        age: 25,
        preferences: ['dogs', 'cats'],
        profile: { name: 'Test User' },
      };

      await act(async () => {
        await result.current(complexData);
      });

      expect(onSubmit).toHaveBeenCalledWith(complexData);
    });
  });

  describe('Async Behavior', () => {
    it('waits for async submission to complete', async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      const onSubmit = jest.fn().mockReturnValue(submitPromise);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useAsyncSubmit(onSubmit, onSuccess));

      const submitCall = act(async () => {
        await result.current({ email: 'test@example.com' });
      });

      // onSuccess should not be called yet
      expect(onSuccess).not.toHaveBeenCalled();

      // Resolve the submission
      resolveSubmit!();
      await submitCall;

      // Now onSuccess should be called
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
