import { useCallback, useState } from 'react';
import { logger } from '../../services/logger';

export interface FormFieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
}

export interface UseFormStateOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export interface UseFormStateReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string | null) => void;
  setFieldTouched: (name: keyof T, touched?: boolean) => void;
  validate: () => boolean;
  reset: () => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>,
  ) => (e?: unknown) => void | Promise<void>;
}

/**
 * Generic form state management hook with validation
 *
 * @example
 * const { values, errors, setValue, handleSubmit } = useFormState({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors = {};
 *     if (!values.email) errors.email = 'Email is required';
 *     if (!values.password) errors.password = 'Password is required';
 *     return errors;
 *   }
 * });
 */
export function useFormState<T extends Record<keyof T, unknown>>({
  initialValues,
  validate: validateFn,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValuesState((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Re-validate with updated values
      if (validateFn) {
        const validationErrors = validateFn(updated);
        setErrors(validationErrors);
      } else {
        // Clear error for this field if no validation function
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          if (newErrors[name]) {
            delete newErrors[name];
          }
          return newErrors;
        });
      }
      
      return updated;
    });
  }, [validateFn]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((name: keyof T, error: string | null) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [name]: error };
      }
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const setFieldTouched = useCallback((name: keyof T, touchedValue: boolean = true) => {
    setTouched((prev) => ({ ...prev, [name]: touchedValue }));
  }, []);

  const validate = useCallback((): boolean => {
    if (!validateFn) {
      // Clear errors if no validation function
      setErrors({});
      return true;
    }

    const validationErrors = validateFn(values);
    setErrors(validationErrors);

    // Mark all fields as touched when validating
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    Object.keys(values).forEach((key) => {
      allTouched[key as keyof T] = true;
    });
    setTouched(allTouched);

    return Object.keys(validationErrors).length === 0;
  }, [values, validateFn]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => async (e?: unknown) => {
      // Type guard for preventDefault support (web compatibility)
      if (
        e &&
        typeof e === 'object' &&
        'preventDefault' in e &&
        typeof (e as { preventDefault?: () => void }).preventDefault === 'function'
      ) {
        (e as { preventDefault: () => void }).preventDefault();
      }

      if (!validate()) {
        return;
      }

      try {
        await onSubmit(values);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Form submission failed');
        logger.error('Form submission error', { error: errorObj });
      }
    },
    [values, validate],
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setValues,
    setError,
    setFieldTouched,
    validate,
    reset,
    handleSubmit,
  };
}
