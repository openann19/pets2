/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { useFormState } from "../useFormState";

interface TestFormData {
  email: string;
  password: string;
  age: number;
}

const initialValues: TestFormData = {
  email: "",
  password: "",
  age: 18,
};

const validateForm = (values: TestFormData) => {
  const errors: Partial<TestFormData> = {};

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!values.email.includes("@")) {
    errors.email = "Invalid email format";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (values.age < 18) {
    errors.age = "Must be at least 18 years old";
  }

  return errors;
};

describe("useFormState", () => {
  it("should initialize with correct values and no errors", () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues, validate: validateForm }),
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it("should update field values", () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues, validate: validateForm }),
    );

    act(() => {
      result.current.setValue("email", "test@example.com");
    });

    expect(result.current.values.email).toBe("test@example.com");
    expect(result.current.values.password).toBe("");
    expect(result.current.values.age).toBe(18);
  });

  it("should validate form and show errors", () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues, validate: validateForm }),
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.email).toBe("Email is required");
    expect(result.current.errors.password).toBe("Password is required");
    expect(result.current.isValid).toBe(false);
  });

  it("should clear errors when valid data is entered", () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues, validate: validateForm }),
    );

    // First set invalid data
    act(() => {
      result.current.setValue("email", "invalid-email");
      result.current.setValue("password", "123");
      result.current.validate();
    });

    expect(result.current.isValid).toBe(false);

    // Then set valid data
    act(() => {
      result.current.setValue("email", "valid@example.com");
      result.current.setValue("password", "validpassword");
      result.current.setValue("age", 25);
      result.current.validate();
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("should reset form to initial values", () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues, validate: validateForm }),
    );

    // Modify values
    act(() => {
      result.current.setValue("email", "modified@example.com");
      result.current.setValue("password", "modifiedpass");
      result.current.setValue("age", 30);
    });

    expect(result.current.values.email).toBe("modified@example.com");

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it("should handle dynamic validation", () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues, validate: validateForm }),
    );

    // Set email only (password still invalid)
    act(() => {
      result.current.setValue("email", "test@example.com");
      result.current.validate();
    });

    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBe("Password is required");
    expect(result.current.isValid).toBe(false);
  });

  it("should work without validation function", () => {
    const { result } = renderHook(() => useFormState({ initialValues }));

    act(() => {
      result.current.setValue("email", "test@example.com");
    });

    expect(result.current.values.email).toBe("test@example.com");
    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() =>
      useFormState({ initialValues, validate: validateForm }),
    );

    const firstSetValue = result.current.setValue;
    const firstValidate = result.current.validate;
    const firstReset = result.current.reset;

    rerender();

    expect(result.current.setValue).toBe(firstSetValue);
    expect(result.current.validate).toBe(firstValidate);
    expect(result.current.reset).toBe(firstReset);
  });
});
