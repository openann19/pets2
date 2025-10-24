/**
 * Complete React Hooks for all API operations
 * Production-ready with caching, optimistic updates, and error handling
 */
import { useAuthStore } from '@/lib/auth-store'
import { logger } from '@pawfectmatch/core';
import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '../lib/api-client';
import type { User, Pet, Match, Message, ApiResponse, SwipeAction, Notification, Subscription, Attachment, SwipeResponse } from '@pawfectmatch/core';
import type { UserTypingEvent, NewMessageEvent, UserStatusEvent } from '@pawfectmatch/core';
// ============= AUTHENTICATION HOOKS =============
interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
}

interface AuthResponse {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
}

interface UseAuthReturn {
    login: (credentials: LoginCredentials) => void;
    register: (data: RegisterData) => void;
    logout: () => void;
    isLoading: boolean;
    error: Error | null;
}

export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setUser, setTokens, logout: storeLogout } = useAuthStore();
    
    const loginMutation = useMutation({
        mutationFn: ({ email, password }: LoginCredentials) => apiClient.login(email, password),
        onSuccess: (data: AuthResponse | ApiResponse<AuthResponse>) => {
            const responseData = 'data' in data ? data.data : data;
            const user = responseData?.user || (data as AuthResponse)?.user;
            const accessToken = responseData?.accessToken || (data as AuthResponse)?.accessToken;
            const refreshToken = responseData?.refreshToken || (data as AuthResponse)?.refreshToken;
            if (user && accessToken) {
                setUser(user);
                setTokens(accessToken, refreshToken || '');
                queryClient.invalidateQueries({ queryKey: ['user'] });
                router.push('/dashboard');
            }
        }
    });
    
    const registerMutation = useMutation({
        mutationFn: (data: RegisterData) => apiClient.register(data),
        onSuccess: (data: AuthResponse | ApiResponse<AuthResponse>) => {
            const responseData = 'data' in data ? data.data : data;
            const user = responseData?.user || (data as AuthResponse)?.user;
            const accessToken = responseData?.accessToken || (data as AuthResponse)?.accessToken;
            const refreshToken = responseData?.refreshToken || (data as AuthResponse)?.refreshToken;
            if (user && accessToken) {
                setUser(user);
                setTokens(accessToken, refreshToken || '');
                queryClient.invalidateQueries({ queryKey: ['user'] });
                router.push('/dashboard');
            }
        }
    });
    
    const logoutMutation = useMutation({
        mutationFn: () => apiClient.logout(),
        onSuccess: () => {
            storeLogout();
            queryClient.clear();
            router.push('/');
        }
    });
    
    return {
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        error: loginMutation.error || registerMutation.error
    };
}
// ============= USER PROFILE HOOKS =============
export function useCurrentUser(): UseQueryResult<User, Error> {
    const { setUser, isAuthenticated } = useAuthStore();
    return useQuery<User, Error>({
        queryKey: ['user', 'current'],
        queryFn: async () => {
            const response = await apiClient.getCurrentUser();
            if (response.success && response.data) {
                setUser(response.data);
                return response.data;
            }
            throw new Error(response.error?.message || 'Failed to fetch user');
        },
        enabled: isAuthenticated, // Only fetch when authenticated
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
    phone?: string;
}

export function useUpdateProfile(): UseMutationResult<User, Error, UpdateProfileData> {
    const queryClient = useQueryClient();
    const { setUser } = useAuthStore();
    return useMutation<User, Error, UpdateProfileData>({
        mutationFn: (data: UpdateProfileData) => apiClient.updateProfile(data),
        onSuccess: (response: User | ApiResponse<User>) => {
            const userData = 'data' in response ? response.data : response;
            if (userData) {
                setUser(userData);
                queryClient.invalidateQueries({ queryKey: ['user'] });
            }
        }
    });
}
// ============= PETS HOOKS =============
export function usePets(): UseQueryResult<Pet[], Error> {
    return useQuery<Pet[], Error>({
        queryKey: ['pets'],
        queryFn: async () => {
            const response = await apiClient.getPets();
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch pets');
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useMyPets(): UseQueryResult<Pet[], Error> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Pet[], Error>({
        queryKey: ['pets', 'my'],
        queryFn: async () => {
            const response = await apiClient.getMyPets();
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch my pets');
        },
        enabled: isAuthenticated, // Only fetch when authenticated
        staleTime: 5 * 60 * 1000,
    });
}

// Alias for useMyPets to match the import in MyPetsPage
export const useUserPets = useMyPets;

interface CreatePetData {
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    photos: string[];
    description?: string;
    personalityTags?: string[];
}

export function useCreatePet(): UseMutationResult<Pet, Error, CreatePetData> {
    const queryClient = useQueryClient();
    return useMutation<Pet, Error, CreatePetData>({
        mutationFn: (data: CreatePetData) => apiClient.createPet(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        }
    });
}

interface UpdatePetData {
    name?: string;
    photos?: string[];
    description?: string;
    personalityTags?: string[];
}

export function useUpdatePet(): UseMutationResult<Pet, Error, { id: string; data: UpdatePetData }> {
    const queryClient = useQueryClient();
    return useMutation<Pet, Error, { id: string; data: UpdatePetData }>({
        mutationFn: ({ id, data }: { id: string; data: UpdatePetData }) => apiClient.updatePet(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        }
    });
}

export function useDeletePet(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id: string) => apiClient.deletePet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            queryClient.invalidateQueries({ queryKey: ['pets', 'my'] });
        }
    });
}
// ============= SWIPE & MATCHING HOOKS =============
interface SwipeActionRequest {
    petId: string;
    action: 'like' | 'pass';
    direction: 'left' | 'right';
}

interface UseSwipeReturn {
    swipe: (action: SwipeActionRequest) => void;
    isLoading: boolean;
    lastMatch: Match | null;
    clearMatch: () => void;
}

export function useSwipeQueue(): UseQueryResult<Pet[], Error> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Pet[], Error>({
        queryKey: ['swipe', 'queue'],
        queryFn: async () => {
            const response = await apiClient.getSwipeQueue();
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch swipe queue');
        },
        enabled: isAuthenticated, // Only fetch when authenticated
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}

export function useSwipe(): UseSwipeReturn {
    const queryClient = useQueryClient();
    const [lastMatch, setLastMatch] = useState<Match | null>(null);
    const swipeMutation = useMutation<SwipeResponse, Error, SwipeActionRequest>({
        mutationFn: (action: SwipeActionRequest) => apiClient.swipe(action),
        onSuccess: (response: SwipeResponse) => {
            if (response.isMatch && response.match) {
                setLastMatch(response.match);
            }
            queryClient.invalidateQueries({ queryKey: ['swipe', 'queue'] });
            queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
    });
    return {
        swipe: swipeMutation.mutate,
        isLoading: swipeMutation.isPending,
        lastMatch,
        clearMatch: () => setLastMatch(null)
    };
}

export function useMatches(): UseQueryResult<Match[], Error> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Match[], Error>({
        queryKey: ['matches'],
        queryFn: async () => {
            const response = await apiClient.getMatches();
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch matches');
        },
        enabled: isAuthenticated, // Only fetch when authenticated
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}

export function useMatch(matchId: string | undefined): UseQueryResult<Match, Error> {
    return useQuery<Match, Error>({
        queryKey: ['matches', matchId],
        queryFn: async () => {
            if (!matchId) throw new Error('Match ID is required');
            const response = await apiClient.getMatch(matchId);
            if (response.success)
                return response.data;
            throw new Error(response.error?.message || 'Failed to fetch match');
        },
        enabled: !!matchId,
    });
}
// ============= CHAT & MESSAGING HOOKS =============
interface TempMessage {
    id: string;
    matchId: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
}

export function useMessages(matchId: string | undefined): UseQueryResult<Message[], Error> {
    const queryClient = useQueryClient();
    const query = useQuery<Message[], Error>({
        queryKey: ['messages', matchId],
        queryFn: async () => {
            if (!matchId) throw new Error('Match ID is required');
            const response = await apiClient.getMessages(matchId);
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch messages');
        },
        enabled: !!matchId,
        refetchInterval: 5000, // Refetch every 5 seconds
    });
    
    // Setup WebSocket listeners
    useEffect(() => {
        if (!matchId)
            return;
        const handleNewMessage = (message: Message) => {
            if (message.matchId === matchId) {
                queryClient.setQueryData(['messages', matchId], (old: Message[] = []) => [...old, message]);
            }
        };
        apiClient.onSocketEvent('new-message', handleNewMessage);
        return () => {
            // Cleanup would go here if we had removeListener
        };
    }, [matchId, queryClient]);
    
    return query;
}

export function useSendMessage(matchId: string | undefined): UseMutationResult<Message, Error, string> {
    const queryClient = useQueryClient();
    return useMutation<Message, Error, string>({
        mutationFn: (content: string) => {
            if (!matchId) throw new Error('Match ID is required');
            return apiClient.sendMessage(matchId, content);
        },
        onMutate: async (content: string) => {
            if (!matchId) return { tempMessage: null };
            // Optimistic update
            const tempMessage: TempMessage = {
                id: `temp-${Date.now()}`,
                matchId,
                senderId: 'current-user', // This should come from auth
                content,
                timestamp: new Date().toISOString(),
                read: true
            };
            queryClient.setQueryData(['messages', matchId], (old: Message[] = []) => [...old, tempMessage as unknown as Message]);
            return { tempMessage };
        },
        onSuccess: (response: Message | ApiResponse<Message>, _: string, context: { tempMessage: TempMessage | null }) => {
            if (!matchId) return;
            const messageData = 'data' in response ? response.data : response;
            if (messageData && context?.tempMessage) {
                // Replace temp message with real one
                queryClient.setQueryData(['messages', matchId], (old: Message[] = []) => 
                    old.map(msg => msg.id === context.tempMessage!.id ? messageData : msg)
                );
            }
        }
    });
}

export function useMarkMessagesAsRead(matchId: string | undefined): UseMutationResult<void, Error, void> {
    const queryClient = useQueryClient();
    return useMutation<void, Error, void>({
        mutationFn: () => {
            if (!matchId) throw new Error('Match ID is required');
            return apiClient.markMessagesAsRead(matchId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
    });
}
// ============= AI SERVICE HOOKS =============
interface BioGenerationRequest {
    keywords: string[];
}

interface BioGenerationResponse {
    bio: string;
}

export function useGenerateBio(): UseMutationResult<BioGenerationResponse, Error, BioGenerationRequest> {
    return useMutation<BioGenerationResponse, Error, BioGenerationRequest>({
        mutationFn: (request: BioGenerationRequest) => apiClient.generateBio(request),
    });
}

interface PhotoAnalysisResponse {
    clarity: number;
    composition: number;
    isSinglePet: boolean;
    faceVisible: boolean;
    suggestion: string;
}

export function useAnalyzePhoto(): UseMutationResult<PhotoAnalysisResponse, Error, string> {
    return useMutation<PhotoAnalysisResponse, Error, string>({
        mutationFn: (photoUrl: string) => apiClient.analyzePhoto(photoUrl),
    });
}

interface CompatibilityRequest {
    pet1: string;
    pet2: string;
}

interface CompatibilityResponse {
    score: number;
    reasons: string[];
}

export function useCalculateCompatibility(): UseMutationResult<CompatibilityResponse, Error, CompatibilityRequest> {
    return useMutation<CompatibilityResponse, Error, CompatibilityRequest>({
        mutationFn: ({ pet1, pet2 }: CompatibilityRequest) => apiClient.calculateCompatibility(pet1, pet2),
    });
}

interface ImprovementsResponse {
    suggestions: string[];
}

export function useSuggestImprovements(): UseMutationResult<ImprovementsResponse, Error, Pet> {
    return useMutation<ImprovementsResponse, Error, Pet>({
        mutationFn: (pet: Pet) => apiClient.suggestProfileImprovements(pet),
    });
}
// ============= SUBSCRIPTION HOOKS =============
export function useSubscription(): UseQueryResult<Subscription | null, Error> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Subscription | null, Error>({
        queryKey: ['subscription'],
        queryFn: async () => {
            const response = await apiClient.getSubscription();
            if (response.success)
                return response.data || null;
            return null; // No subscription
        },
        enabled: isAuthenticated, // Only fetch when authenticated
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

interface SubscriptionCheckoutResponse {
    checkoutUrl: string;
}

export function useCreateSubscription(): UseMutationResult<SubscriptionCheckoutResponse, Error, string> {
    const queryClient = useQueryClient();
    return useMutation<SubscriptionCheckoutResponse, Error, string>({
        mutationFn: (plan: string) => apiClient.createSubscription(plan),
        onSuccess: (response: SubscriptionCheckoutResponse | ApiResponse<SubscriptionCheckoutResponse>) => {
            const data = 'data' in response ? response.data : response;
            if (data?.checkoutUrl && typeof window !== 'undefined') {
                window.location.href = data.checkoutUrl;
            }
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        }
    });
}

export function useCancelSubscription(): UseMutationResult<void, Error, void> {
    const queryClient = useQueryClient();
    return useMutation<void, Error, void>({
        mutationFn: () => apiClient.cancelSubscription(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });
}
// ============= LOCATION HOOKS =============
interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
}

export function useUpdateLocation(): UseMutationResult<User, Error, LocationData> {
    const queryClient = useQueryClient();
    return useMutation<User, Error, LocationData>({
        mutationFn: (location: LocationData) => apiClient.updateLocation(location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });
}

export function useNearbyPets(radius = 10): UseQueryResult<Pet[], Error> {
    return useQuery<Pet[], Error>({
        queryKey: ['pets', 'nearby', radius],
        queryFn: async () => {
            const response = await apiClient.getNearbyPets(radius);
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch nearby pets');
        },
        staleTime: 2 * 60 * 1000,
    });
}

// ============= NOTIFICATION HOOKS =============
export function useNotifications(): UseQueryResult<Notification[], Error> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Notification[], Error>({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await apiClient.getNotifications();
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch notifications');
        },
        enabled: isAuthenticated, // Only fetch when authenticated
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
}

export function useMarkNotificationRead(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id: string) => apiClient.markNotificationRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
}
// ============= WEBSOCKET HOOKS =============
interface UseWebSocketReturn {
    isConnected: boolean;
    connectionError: string | null;
    isWebSocketConnected: () => boolean;
    joinMatchRoom: (matchId: string) => void;
    leaveMatchRoom: (matchId: string) => void;
    sendChatMessage: (matchId: string, content: string, messageType?: string, attachments?: Attachment[]) => void;
    sendTypingIndicator: (matchId: string, isTyping: boolean) => void;
    markMessagesAsRead: (matchId: string) => void;
    performMatchAction: (matchId: string, action: string) => void;
    onWebSocketEvent: (eventName: string, callback: (data: UserTypingEvent | NewMessageEvent | UserStatusEvent) => void) => () => void;
}

export function useWebSocket(userId: string | undefined): UseWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!userId)
            return;
        logger.info('[WebSocket] Initializing connection for user:', { userId });
        
        // Connect to WebSocket
        const connectSocket = async () => {
            try {
                const socket = await apiClient.connectWebSocket(userId);
                if (socket) {
                    setIsConnected(true);
                    setConnectionError(null);
                    logger.info('[WebSocket] Connected successfully');
                }
            }
            catch (error) {
                logger.error('[WebSocket] Connection failed:', { error });
                setConnectionError(error instanceof Error ? error.message : 'Connection failed');
                setIsConnected(false);
            }
        };
        
        connectSocket();
        
        // Cleanup on unmount or userId change
        return () => {
            logger.info('[WebSocket] Cleaning up connection');
            apiClient.disconnectWebSocket();
            setIsConnected(false);
            setConnectionError(null);
        };
    }, [userId]);
    
    return {
        isConnected,
        connectionError,
        isWebSocketConnected: apiClient.isWebSocketConnected,
        joinMatchRoom: apiClient.joinMatchRoom,
        leaveMatchRoom: apiClient.leaveMatchRoom,
        sendChatMessage: apiClient.sendChatMessage,
        sendTypingIndicator: apiClient.sendTypingIndicator,
        markMessagesAsRead: apiClient.markMessagesAsRead,
        performMatchAction: apiClient.performMatchAction,
        onWebSocketEvent: apiClient.onWebSocketEvent,
    };
}

// ============= COMBINED HOOKS =============
interface UseDashboardDataReturn {
    user: User | undefined;
    pets: Pet[];
    matches: Match[];
    notifications: Notification[];
    subscription: Subscription | null | undefined;
    isLoading: boolean;
    error: Error | null;
}

export function useDashboardData(): UseDashboardDataReturn {
    const user = useCurrentUser();
    const pets = useMyPets();
    const matches = useMatches();
    const notifications = useNotifications();
    const subscription = useSubscription();
    
    return {
        user: user.data,
        pets: pets.data || [],
        matches: matches.data || [],
        notifications: notifications.data || [],
        subscription: subscription.data,
        isLoading: user.isLoading || pets.isLoading || matches.isLoading,
        error: user.error || pets.error || matches.error
    };
}

interface UseSwipeDataReturn {
    pets: Pet[];
    currentPet: Pet | undefined;
    swipe: (action: SwipeActionRequest) => void;
    isLoading: boolean;
    lastMatch: Match | null;
    clearMatch: () => void;
    isPremium: boolean;
    refetch: () => void;
}

export function useSwipeData(): UseSwipeDataReturn {
    const queue = useSwipeQueue();
    const { swipe, isLoading, lastMatch, clearMatch } = useSwipe();
    const user = useCurrentUser();
    
    return {
        pets: queue.data || [],
        currentPet: queue.data?.[0],
        swipe,
        isLoading: queue.isLoading || isLoading,
        lastMatch,
        clearMatch,
        isPremium: user.data?.premium?.isActive || false,
        refetch: queue.refetch
    };
}

interface UseChatDataReturn {
    match: Match | undefined;
    messages: Message[];
    sendMessage: (content: string) => void;
    isLoading: boolean;
    isSending: boolean;
}

export function useChatData(matchId: string | undefined): UseChatDataReturn {
    const match = useMatch(matchId);
    const messages = useMessages(matchId);
    const sendMessage = useSendMessage(matchId);
    const markAsRead = useMarkMessagesAsRead(matchId);
    
    useEffect(() => {
        if (matchId && messages.data) {
            markAsRead.mutate();
        }
    }, [matchId, messages.data, markAsRead]);
    
    return {
        match: match.data,
        messages: messages.data || [],
        sendMessage: sendMessage.mutate,
        isLoading: match.isLoading || messages.isLoading,
        isSending: sendMessage.isPending
    };
}