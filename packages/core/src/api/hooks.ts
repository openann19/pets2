import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BlockPayload, MutePayload, ReportPayload } from '../types';
import type { ApiClientResponse } from './client';
import { apiClient } from './client';
import { removeLocalStorageValue, setLocalStorageValue } from '../utils/environment';

// Query hook factory
export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<ApiClientResponse<TData>, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ApiClientResponse<TData>, TError>({
    queryKey,
    queryFn: () => apiClient.get<TData>(endpoint),
    ...options,
  });
}

// Mutation hook factory
export function useApiMutation<TData = unknown, TVariables = void, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<ApiClientResponse<TData>, TError, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<ApiClientResponse<TData>, TError, TVariables>({
    mutationFn: (variables) => {
      if (variables === undefined) {
        return apiClient.post<TData>(endpoint);
      }
      return apiClient.post<TData>(endpoint, variables);
    },
    onSuccess: (...args) => {
      // Invalidate related queries
      void queryClient.invalidateQueries();

      // Call the original onSuccess if provided
      if (options != null && options.onSuccess != null) {
        (options.onSuccess as (...args: unknown[]) => void)(...args);
      }
    },
    ...options,
  });
}

// Specific hooks for common operations

// Auth hooks
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export function useLogin() {
  return useApiMutation<LoginResponse>('/auth/login', {
    onSuccess: (data: ApiClientResponse<LoginResponse>) => {
      if (data.success && data.data != null) {
        const { accessToken, refreshToken } = data.data;
        setLocalStorageValue('accessToken', accessToken);
        setLocalStorageValue('refreshToken', refreshToken);
      }
    },
  });
}

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export function useRegister() {
  return useApiMutation<RegisterResponse>('/auth/register', {
    onSuccess: (data: ApiClientResponse<RegisterResponse>) => {
      if (data.success && data.data != null) {
        const { accessToken, refreshToken } = data.data;
        setLocalStorageValue('accessToken', accessToken);
        setLocalStorageValue('refreshToken', refreshToken);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useApiMutation('/auth/logout', {
    onSuccess: () => {
      removeLocalStorageValue('accessToken');
      removeLocalStorageValue('refreshToken');
      queryClient.clear();
    },
  });
}

export function useUser(userId?: string) {
  const userIdStr = userId ?? 'me';
  return useApiQuery(
    ['user', userIdStr],
    userIdStr !== 'me' ? `/users/${userIdStr}` : '/users/me'
  );
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useApiMutation('/users/me', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Pet hooks
interface PetFilters {
  species?: string;
  intent?: string;
  maxDistance?: number;
  minAge?: number;
  maxAge?: number;
  size?: string;
  gender?: string;
  breed?: string;
}

export function usePets(filters?: PetFilters) {
  const serializedFilters = JSON.stringify(filters ?? {});
  const queryKey = ['pets', serializedFilters];
  const queryString = filters != null
    ? `?${new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_k, v]) => v != null).map(([k, v]) => [k, String(v)])
      )
    ).toString()}`
    : '';

  return useApiQuery(queryKey, `/pets${queryString}`);
}

export function usePet(petId: string) {
  return useApiQuery(['pet', petId], `/pets/${petId}`);
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useApiMutation('/pets', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useApiMutation('/pets', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pets'] });
      void queryClient.invalidateQueries({ queryKey: ['pet'] });
    },
  });
}

// Match hooks
export function useMatches() {
  return useApiQuery(['matches'], '/matches');
}

export function useMatch(matchId: string) {
  return useApiQuery(['match', matchId], `/matches/${matchId}`);
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useApiMutation('/matches', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Chat hooks
export function useChat(matchId: string) {
  return useApiQuery(['chat', matchId], `/chat/${matchId}`);
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useApiMutation('/chat', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat'] });
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

// Analytics hooks
export function useTrackUserEvent() {
  return useApiMutation<{ success: boolean }>('/analytics/user');
}

export function useTrackPetEvent() {
  return useApiMutation<{ success: boolean }>('/analytics/pet');
}

export function useTrackMatchEvent() {
  return useApiMutation<{ success: boolean }>('/analytics/match');
}

export function useUserAnalytics() {
  return useApiQuery<{ data: unknown }>(['analytics', 'user'], '/analytics/user');
}

export function usePetAnalytics(petId: string) {
  return useApiQuery<{ data: unknown }>(['analytics', 'pet', petId], `/analytics/pet/${petId}`);
}

export function useMatchAnalytics(matchId: string) {
  return useApiQuery<{ data: unknown }>(['analytics', 'match', matchId], `/analytics/match/${matchId}`);
}

// Moderation hooks with optimistic updates
interface ModerationState {
  blocks: Array<{ blockedUserId: string }>;
  mutes: Array<{ mutedUserId: string; durationMinutes: number }>;
}

export function useReportUser() {
  const queryClient = useQueryClient();

  return useMutation<ApiClientResponse<{ id: string }>, Error, ReportPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<{ id: string }>('/user/moderation/report', payload);
    },
    onSuccess: () => {
      // Invalidate admin reports list
      void queryClient.invalidateQueries({ queryKey: ['admin', 'moderation', 'reports'] });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation<ApiClientResponse<{ id: string }>, Error, BlockPayload, { previousState: unknown }>({
    mutationFn: async (payload) => {
      return await apiClient.post<{ id: string }>('/user/moderation/block', payload);
    },
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });

      // Snapshot previous value
      const previousState = queryClient.getQueryData(['moderation', 'state']);

      // Optimistically update
      queryClient.setQueryData(['moderation', 'state'], (old: ModerationState | undefined) => ({
        ...old,
        blocks: [...(old != null ? old.blocks : []), { blockedUserId: variables.blockedUserId }],
      }));

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context != null && context.previousState != null) {
        queryClient.setQueryData(['moderation', 'state'], context.previousState);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'state'] });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { blockedUserId: string }, { previousState: unknown }>({
    mutationFn: async (vars) => {
      const res = await apiClient.delete<{ success: boolean }>(`/user/moderation/block/${vars.blockedUserId}`);
      return res;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });
      const previousState = queryClient.getQueryData(['moderation', 'state']);

      queryClient.setQueryData(['moderation', 'state'], (old: ModerationState | undefined) => ({
        ...old,
        blocks: (old != null ? old.blocks : []).filter((b) => b.blockedUserId !== variables.blockedUserId),
      }));

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      if (context != null && context.previousState != null) {
        queryClient.setQueryData(['moderation', 'state'], context.previousState);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'state'] });
    },
  });
}

export function useMuteUser() {
  const queryClient = useQueryClient();

  return useMutation<ApiClientResponse<{ id: string; expiresAt: string }>, Error, MutePayload, { previousState: unknown }>({
    mutationFn: async (payload) => {
      return await apiClient.post<{ id: string; expiresAt: string }>('/user/moderation/mute', payload);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });
      const previousState = queryClient.getQueryData(['moderation', 'state']);

      queryClient.setQueryData(['moderation', 'state'], (old: ModerationState | undefined) => ({
        ...old,
        mutes: [...(old != null ? old.mutes : []), { mutedUserId: variables.mutedUserId, durationMinutes: variables.durationMinutes }],
      }));

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      if (context != null && context.previousState != null) {
        queryClient.setQueryData(['moderation', 'state'], context.previousState);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'state'] });
    },
  });
}
// Admin moderation hooks
type AdminListReportsParams = {
  status?: string;
  priority?: string;
  category?: string;
  type?: string;
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export function useAdminListReports(params: AdminListReportsParams = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => [k, String(v)])
    )
  ).toString();

  const path = `/admin/moderation/reports${query.length > 0 ? `?${query}` : ''}`;
  return useApiQuery<{ data: { items: unknown[]; total: number } }>(['admin', 'moderation', 'reports', query], path);
}

export function useAdminUpdateReport() {
  return useMutation<ApiClientResponse<{ id: string }>, Error, { id: string; updates: Record<string, unknown> }>({
    mutationFn: async ({ id, updates }) => {
      const res = await apiClient.patch<{ id: string }>(`/admin/moderation/reports/${id}`, updates);
      return res as ApiClientResponse<{ id: string }>;
    },
  });
}

export function useUnmuteUser() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { mutedUserId: string }, { previousState: unknown }>({
    mutationFn: async (vars) => {
      const res = await apiClient.delete<{ success: boolean }>(`/user/moderation/mute/${vars.mutedUserId}`);
      return res;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });
      const previousState = queryClient.getQueryData(['moderation', 'state']);

      queryClient.setQueryData(['moderation', 'state'], (old: ModerationState | undefined) => ({
        ...old,
        mutes: (old != null ? old.mutes : []).filter((m) => m.mutedUserId !== variables.mutedUserId),
      }));

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      if (context != null && context.previousState != null) {
        queryClient.setQueryData(['moderation', 'state'], context.previousState);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'state'] });
    },
  });
}
