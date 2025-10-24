import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Simplified hook for form validation with Zod
export function useFormValidation(schema, defaultValues) {
    return useForm({
        resolver: zodResolver(schema),
        defaultValues,
        mode: 'onChange', // Validate on change for better UX
    });
}
// Hook for handling async form submission
export function useAsyncSubmit(onSubmit, onSuccess, onError) {
    const handleSubmit = async (data) => {
        try {
            await onSubmit(data);
            onSuccess?.();
        }
        catch (error) {
            onError?.(error);
        }
    };
    return handleSubmit;
}
//# sourceMappingURL=useFormValidation.js.map