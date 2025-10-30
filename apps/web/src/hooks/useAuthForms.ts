import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useFormValidation, useAsyncSubmit } from './useFormValidation';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, type LoginFormData, type RegisterFormData, type ForgotPasswordFormData, type ResetPasswordFormData } from '../schemas/auth';
import { logger } from '@pawfectmatch/core';
// import { toast } from 'react-hot-toast';
const toast = { success: (msg: string) => { logger.info(msg); }, error: (msg: string) => { logger.error(msg); } };
// Hook for login form
export function useLoginForm() {
    const router = useRouter();
    const { login, error, loading, clearError } = useAuth();
    const form = useFormValidation(loginSchema, {
        email: '',
        password: '',
    });
    const handleSubmit = useAsyncSubmit(async (data) => {
        await login(data);
    }, () => { router.push('/dashboard'); }, () => {
        // Error is handled by AuthContext
    });
    // Clear auth errors when form changes
    const { watch } = form;
    const watchedFields = watch();
    React.useEffect(() => {
        if (error) {
            clearError();
        }
    }, [watchedFields, error, clearError]);
    return {
        form,
        handleSubmit: form.handleSubmit(handleSubmit),
        error,
        loading,
    };
}
// Hook for register form
export function useRegisterForm() {
    const router = useRouter();
    const { register, error, loading, clearError } = useAuth();
    const form = useFormValidation(registerSchema, {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phone: '',
        agreeToTerms: false,
    });
    const handleSubmit = useAsyncSubmit(async (data) => {
        await register(data);
    }, () => { router.push('/pets/new'); }, () => {
        // Error is handled by AuthContext
    });
    // Clear auth errors when form changes
    const { watch } = form;
    const watchedFields = watch();
    React.useEffect(() => {
        if (error) {
            clearError();
        }
    }, [watchedFields, error, clearError]);
    return {
        form,
        handleSubmit: form.handleSubmit(handleSubmit),
        error,
        loading,
    };
}
//# sourceMappingURL=useAuthForms.js.map