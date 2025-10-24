"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApiQuery = useApiQuery;
exports.useApiMutation = useApiMutation;
exports.useLogin = useLogin;
exports.useRegister = useRegister;
exports.useLogout = useLogout;
exports.useUser = useUser;
exports.useUpdateUser = useUpdateUser;
exports.usePets = usePets;
exports.usePet = usePet;
exports.useCreatePet = useCreatePet;
exports.useUpdatePet = useUpdatePet;
exports.useMatches = useMatches;
exports.useMatch = useMatch;
exports.useCreateMatch = useCreateMatch;
exports.useChat = useChat;
exports.useSendMessage = useSendMessage;
exports.useGenerateBio = useGenerateBio;
exports.useAnalyzePhotos = useAnalyzePhotos;
exports.useCompatibilityAnalysis = useCompatibilityAnalysis;
exports.useApplicationAssistance = useApplicationAssistance;
exports.useTrackUserEvent = useTrackUserEvent;
exports.useTrackPetEvent = useTrackPetEvent;
exports.useTrackMatchEvent = useTrackMatchEvent;
exports.useUserAnalytics = useUserAnalytics;
exports.usePetAnalytics = usePetAnalytics;
exports.useMatchAnalytics = useMatchAnalytics;
exports.useReportUser = useReportUser;
exports.useBlockUser = useBlockUser;
exports.useUnblockUser = useUnblockUser;
exports.useMuteUser = useMuteUser;
exports.useAdminListReports = useAdminListReports;
exports.useAdminUpdateReport = useAdminUpdateReport;
exports.useUnmuteUser = useUnmuteUser;
const react_query_1 = require("@tanstack/react-query");
const client_1 = require("./client");
const environment_1 = require("../utils/environment");
// Query hook factory
function useApiQuery(queryKey, endpoint, options) {
    return (0, react_query_1.useQuery)({
        queryKey,
        queryFn: () => client_1.apiClient.get(endpoint),
        ...options,
    });
}
// Mutation hook factory
function useApiMutation(endpoint, options) {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (variables) => {
            if (variables === undefined) {
                return client_1.apiClient.post(endpoint);
            }
            return client_1.apiClient.post(endpoint, variables);
        },
        onSuccess: (...args) => {
            // Invalidate related queries
            void queryClient.invalidateQueries();
            // Call the original onSuccess if provided
            if (options != null && options.onSuccess != null) {
                options.onSuccess(...args);
            }
        },
        ...options,
    });
}
function useLogin() {
    return useApiMutation('/auth/login', {
        onSuccess: (data) => {
            if (data.success && data.data != null) {
                const { accessToken, refreshToken } = data.data;
                (0, environment_1.setLocalStorageValue)('accessToken', accessToken);
                (0, environment_1.setLocalStorageValue)('refreshToken', refreshToken);
            }
        },
    });
}
function useRegister() {
    return useApiMutation('/auth/register', {
        onSuccess: (data) => {
            if (data.success && data.data != null) {
                const { accessToken, refreshToken } = data.data;
                (0, environment_1.setLocalStorageValue)('accessToken', accessToken);
                (0, environment_1.setLocalStorageValue)('refreshToken', refreshToken);
            }
        },
    });
}
function useLogout() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return useApiMutation('/auth/logout', {
        onSuccess: () => {
            (0, environment_1.removeLocalStorageValue)('accessToken');
            (0, environment_1.removeLocalStorageValue)('refreshToken');
            queryClient.clear();
        },
    });
}
function useUser(userId) {
    const userIdStr = userId ?? 'me';
    return useApiQuery(['user', userIdStr], userIdStr !== 'me' ? `/users/${userIdStr}` : '/users/me');
}
function useUpdateUser() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return useApiMutation('/users/me', {
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
}
function usePets(filters) {
    const serializedFilters = JSON.stringify(filters ?? {});
    const queryKey = ['pets', serializedFilters];
    const queryString = filters != null
        ? `?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_k, v]) => v != null).map(([k, v]) => [k, String(v)]))).toString()}`
        : '';
    return useApiQuery(queryKey, `/pets${queryString}`);
}
function usePet(petId) {
    return useApiQuery(['pet', petId], `/pets/${petId}`);
}
function useCreatePet() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return useApiMutation('/pets', {
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}
function useUpdatePet() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return useApiMutation('/pets', {
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['pets'] });
            void queryClient.invalidateQueries({ queryKey: ['pet'] });
        },
    });
}
// Match hooks
function useMatches() {
    return useApiQuery(['matches'], '/matches');
}
function useMatch(matchId) {
    return useApiQuery(['match', matchId], `/matches/${matchId}`);
}
function useCreateMatch() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return useApiMutation('/matches', {
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['matches'] });
        },
    });
}
// Chat hooks
function useChat(matchId) {
    return useApiQuery(['chat', matchId], `/chat/${matchId}`);
}
function useSendMessage() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return useApiMutation('/chat', {
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['chat'] });
        },
    });
}
// AI hooks
function useGenerateBio() {
    return useApiMutation('/ai/generate-bio');
}
function useAnalyzePhotos() {
    return useApiMutation('/ai/analyze-photos');
}
function useCompatibilityAnalysis() {
    return useApiMutation('/ai/compatibility');
}
function useApplicationAssistance() {
    return useApiMutation('/ai/assist-application');
}
// Analytics hooks
function useTrackUserEvent() {
    return useApiMutation('/analytics/user');
}
function useTrackPetEvent() {
    return useApiMutation('/analytics/pet');
}
function useTrackMatchEvent() {
    return useApiMutation('/analytics/match');
}
function useUserAnalytics() {
    return useApiQuery(['analytics', 'user'], '/analytics/user');
}
function usePetAnalytics(petId) {
    return useApiQuery(['analytics', 'pet', petId], `/analytics/pet/${petId}`);
}
function useMatchAnalytics(matchId) {
    return useApiQuery(['analytics', 'match', matchId], `/analytics/match/${matchId}`);
}
function useReportUser() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            return await client_1.apiClient.post('/user/moderation/report', payload);
        },
        onSuccess: () => {
            // Invalidate admin reports list
            void queryClient.invalidateQueries({ queryKey: ['admin', 'moderation', 'reports'] });
        },
    });
}
function useBlockUser() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            return await client_1.apiClient.post('/user/moderation/block', payload);
        },
        onMutate: async (variables) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });
            // Snapshot previous value
            const previousState = queryClient.getQueryData(['moderation', 'state']);
            // Optimistically update
            queryClient.setQueryData(['moderation', 'state'], (old) => ({
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
function useUnblockUser() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (vars) => {
            const res = await client_1.apiClient.delete(`/user/moderation/block/${vars.blockedUserId}`);
            return res;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });
            const previousState = queryClient.getQueryData(['moderation', 'state']);
            queryClient.setQueryData(['moderation', 'state'], (old) => ({
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
function useMuteUser() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            return await client_1.apiClient.post('/user/moderation/mute', payload);
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });
            const previousState = queryClient.getQueryData(['moderation', 'state']);
            queryClient.setQueryData(['moderation', 'state'], (old) => ({
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
function useAdminListReports(params = {}) {
    const query = new URLSearchParams(Object.fromEntries(Object.entries(params)
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => [k, String(v)]))).toString();
    const path = `/admin/moderation/reports${query.length > 0 ? `?${query}` : ''}`;
    return useApiQuery(['admin', 'moderation', 'reports', query], path);
}
function useAdminUpdateReport() {
    return (0, react_query_1.useMutation)({
        mutationFn: async ({ id, updates }) => {
            const res = await client_1.apiClient.patch(`/admin/moderation/reports/${id}`, updates);
            return res;
        },
    });
}
function useUnmuteUser() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (vars) => {
            const res = await client_1.apiClient.delete(`/user/moderation/mute/${vars.mutedUserId}`);
            return res;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['moderation', 'state'] });
            const previousState = queryClient.getQueryData(['moderation', 'state']);
            queryClient.setQueryData(['moderation', 'state'], (old) => ({
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
//# sourceMappingURL=hooks.js.map