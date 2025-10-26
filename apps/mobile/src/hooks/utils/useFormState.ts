import { useCallback, useState } from "react";
import { logger } from "../../services/logger";

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
  ) => (e?: any) => void | Promise<void>;
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
export function useFormState<T extends Record<string, any>>({
  initialValues,
  validate: validateFn,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    // Clear error when field changes
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });
  }, []);

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

  const setFieldTouched = useCallback(
    (name: keyof T, touchedValue: boolean = true) => {
      setTouched((prev) => ({ ...prev, [name]: touchedValue }));
    },
    [],
  );

  const validate = useCallback((): boolean => {
    if (!validateFn) return true;

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
    (onSubmit: (values: T) => void | Promise<void>) => async (e?: any) => {
      e?.preventDefault?.();

      if (!validate()) {
        return;
      }

      try {
        await onSubmit(values);
      } catch (error) {
        logger.error("Form submission error", { error });
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
