import { FieldValues } from 'react-hook-form';
export declare function useFormValidation(schema: unknown, defaultValues?: unknown): import("react-hook-form").UseFormReturn<FieldValues, any, FieldValues>;
export declare function useAsyncSubmit<T>(onSubmit: (data: T) => Promise<void>, onSuccess?: () => void, onError?: (error: unknown) => void): (data: T) => Promise<void>;
//# sourceMappingURL=useFormValidation.d.ts.map