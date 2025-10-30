import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import type { ApiClientResponse } from './client';
export declare function useApiQuery<TData = unknown, TError = Error>(queryKey: string[], endpoint: string, options?: Omit<UseQueryOptions<ApiClientResponse<TData>, TError>, 'queryKey' | 'queryFn'>): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<TData>, TError>;
export declare function useApiMutation<TData = unknown, TVariables = void, TError = Error>(endpoint: string, options?: Omit<UseMutationOptions<ApiClientResponse<TData>, TError, TVariables>, 'mutationFn'>): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<TData>, TError, TVariables, unknown>;
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}
export declare function useLogin(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<LoginResponse>, Error, void, unknown>;
interface RegisterResponse {
    accessToken: string;
    refreshToken: string;
}
export declare function useRegister(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<RegisterResponse>, Error, void, unknown>;
export declare function useLogout(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useUser(userId?: string): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<unknown>, Error>;
export declare function useUpdateUser(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
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
export declare function usePets(filters?: PetFilters): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<unknown>, Error>;
export declare function usePet(petId: string): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<unknown>, Error>;
export declare function useCreatePet(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useUpdatePet(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useMatches(): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<unknown>, Error>;
export declare function useMatch(matchId: string): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<unknown>, Error>;
export declare function useCreateMatch(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useChat(matchId: string): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<unknown>, Error>;
export declare function useSendMessage(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useGenerateBio(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useAnalyzePhotos(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useCompatibilityAnalysis(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useApplicationAssistance(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<unknown>, Error, void, unknown>;
export declare function useTrackUserEvent(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<{
    success: boolean;
}>, Error, void, unknown>;
export declare function useTrackPetEvent(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<{
    success: boolean;
}>, Error, void, unknown>;
export declare function useTrackMatchEvent(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<{
    success: boolean;
}>, Error, void, unknown>;
export declare function useUserAnalytics(): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<{
    data: unknown;
}>, Error>;
export declare function usePetAnalytics(petId: string): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<{
    data: unknown;
}>, Error>;
export declare function useMatchAnalytics(matchId: string): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<{
    data: unknown;
}>, Error>;
export declare function useReportUser(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<{
    id: string;
}>, Error, {
    type: "other" | "spam" | "harassment" | "fake_profile" | "inappropriate_content" | "scam" | "underage" | "animal_abuse" | "inappropriate_behavior" | "copyright_violation";
    category: "message" | "other" | "user" | "pet" | "chat";
    reason: string;
    targetId: string;
    description?: string | undefined;
    evidence?: {
        type: "photo" | "video" | "message" | "other" | "screenshot";
        description?: string | undefined;
        url?: string | undefined;
    }[] | undefined;
    isAnonymous?: boolean | undefined;
}, unknown>;
export declare function useBlockUser(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<{
    id: string;
}>, Error, {
    blockedUserId: string;
    reason?: string | undefined;
}, {
    previousState: unknown;
}>;
export declare function useUnblockUser(): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
}, Error, {
    blockedUserId: string;
}, {
    previousState: unknown;
}>;
export declare function useMuteUser(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<{
    id: string;
    expiresAt: string;
}>, Error, {
    mutedUserId: string;
    durationMinutes: number;
    reason?: string | undefined;
}, {
    previousState: unknown;
}>;
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
export declare function useAdminListReports(params?: AdminListReportsParams): import("@tanstack/react-query").UseQueryResult<ApiClientResponse<{
    data: {
        items: unknown[];
        total: number;
    };
}>, Error>;
export declare function useAdminUpdateReport(): import("@tanstack/react-query").UseMutationResult<ApiClientResponse<{
    id: string;
}>, Error, {
    id: string;
    updates: Record<string, unknown>;
}, unknown>;
export declare function useUnmuteUser(): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
}, Error, {
    mutedUserId: string;
}, {
    previousState: unknown;
}>;
export {};
