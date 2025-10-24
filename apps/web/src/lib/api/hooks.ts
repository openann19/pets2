import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, ApiClientResponse } from './client';
// Query hook factory
export function useApiQuery(queryKey, endpoint, options) {
    return useQuery({
        queryKey,
        queryFn: () => apiClient.get(endpoint),
        ...options,
    });
}
// Mutation hook factory
export function useApiMutation(endpoint, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables) => {
            if (variables === undefined) {
                return apiClient.post(endpoint);
            }
            return apiClient.post(endpoint, variables);
        },
        onSuccess: (data, variables, context, mutationContext) => {
            // Invalidate related queries
            queryClient.invalidateQueries();
            // Call the original onSuccess if provided
            options?.onSuccess?.(data, variables, context, mutationContext);
        },
        ...options,
    });
}
// Specific hooks for common operations
// Auth hooks
export function useLogin() {
    return useApiMutation('/auth/login', {
        onSuccess: (data) => {
            if (data.success && data.data) {
                const { accessToken, refreshToken } = data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            }
        },
    });
}
export function useRegister() {
    return useApiMutation('/auth/register', {
        onSuccess: (data) => {
            if (data.success && data.data) {
                const { accessToken, refreshToken } = data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            }
        },
    });
}
export function useLogout() {
    const queryClient = useQueryClient();
    return useApiMutation('/auth/logout', {
        onSuccess: () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            queryClient.clear();
        },
    });
}
// User hooks
export function useUser(userId) {
    return useApiQuery(['user', userId || 'me'], userId ? `/users/${userId}` : '/users/me');
}
export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useApiMutation('/users/me', {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
}
// Pet hooks
export function usePets(filters) {
    const queryKey = ['pets', JSON.stringify(filters || {})];
    const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return useApiQuery(queryKey, `/pets${queryString}`);
}
export function usePet(petId) {
    return useApiQuery(['pet', petId], `/pets/${petId}`);
}
export function useCreatePet() {
    const queryClient = useQueryClient();
    return useApiMutation('/pets', {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}
export function useUpdatePet() {
    const queryClient = useQueryClient();
    return useApiMutation('/pets', {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            queryClient.invalidateQueries({ queryKey: ['pet'] });
        },
    });
}
// Match hooks
export function useMatches() {
    return useApiQuery(['matches'], '/matches');
}
export function useMatch(matchId) {
    return useApiQuery(['match', matchId], `/matches/${matchId}`);
}
export function useCreateMatch() {
    const queryClient = useQueryClient();
    return useApiMutation('/matches', {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matches'] });
        },
    });
}
// Chat hooks
export function useChat(matchId) {
    return useApiQuery(['chat', matchId], `/chat/${matchId}`);
}
export function useSendMessage() {
    const queryClient = useQueryClient();
    return useApiMutation('/chat', {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat'] });
        },
    });
}
// AI hooks
export function useGenerateBio() {
    return useApiMutation('/ai/generate-bio');
}
export function useAnalyzePhotos() {
    return useApiMutation('/ai/analyze-photos');
}
export function useCompatibilityAnalysis() {
    return useApiMutation('/ai/compatibility');
}
export function useApplicationAssistance() {
    return useApiMutation('/ai/assist-application');
}
//# sourceMappingURL=hooks.js.map