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
import api from '../services/api';

// ============= TYPE DEFINITIONS =============

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  profilePicture?: string;
  premium?: {
    isActive: boolean;
  };
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: {
    message: string;
  };
}

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
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: Error | null;
}

// Pet related types
interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  photos: string[];
  description?: string;
  personalityTags?: string[];
}

// Match related types
interface Match {
  id: string;
  pet1: Pet;
  pet2: Pet;
  createdAt: string;
  status: string;
}

// Message related types
interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Subscription types
interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

// Notification types
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// WebSocket event types
interface UserTypingEvent {
  userId: string;
  isTyping: boolean;
}

interface NewMessageEvent {
  message: Message;
}

interface UserStatusEvent {
  userId: string;
  status: 'online' | 'offline';
}

// Attachment types
interface Attachment {
  type: string;
  url: string;
  filename?: string;
}

// Swipe response types
interface SwipeResponse {
  isMatch: boolean;
  match?: Match;
}

export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setUser, setTokens, logout: storeLogout } = useAuthStore();

    const loginMutation = useMutation({
        mutationFn: ({ email, password }: LoginCredentials) => api.login(email, password),
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
        mutationFn: (data: RegisterData) => api.register(data),
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
        mutationFn: () => api.logout(),
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
export function useCurrentUser(): UseQueryResult<User> {
    const { setUser, isAuthenticated } = useAuthStore();
    return useQuery<User>({
        queryKey: ['user', 'current'],
        queryFn: async () => {
            const response = await api.getCurrentUser();
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
        mutationFn: (data: UpdateProfileData) => api.updateProfile(data),
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
export function usePets(): UseQueryResult<Pet[]> {
    return useQuery<Pet[]>({
        queryKey: ['pets'],
        queryFn: async () => {
            const response = await api.getPets();
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch pets');
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useMyPets(): UseQueryResult<Pet[]> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Pet[]>({
        queryKey: ['pets', 'my'],
        queryFn: async () => {
            const response = await api.getMyPets();
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
        mutationFn: (data: CreatePetData) => api.createPet(data),
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
        mutationFn: ({ id, data }: { id: string; data: UpdatePetData }) => api.updatePet(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        }
    });
}

export function useDeletePet(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id: string) => api.deletePet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            queryClient.invalidateQueries({ queryKey: ['pets', 'my'] });
        }
    });
}
// ============= SWIPE & MATCHING HOOKS =============
interface SwipeActionRequest {
    petId: string;
    action: 'like' | 'pass' | 'superlike';
    direction?: 'left' | 'right';
}

interface UseSwipeReturn {
    swipe: (action: SwipeActionRequest) => void;
    isLoading: boolean;
    lastMatch: Match | null;
    clearMatch: () => void;
}

export interface SwipeFilters {
    species?: string[];
    breeds?: string[];
    ages?: { min?: number; max?: number };
    sizes?: string[];
    genders?: string[];
    colors?: string[];
    temperaments?: string[];
    energyLevels?: string[];
    trainability?: string[];
    familyFriendly?: boolean[];
    petFriendly?: boolean[];
    strangerFriendly?: boolean[];
    apartmentFriendly?: boolean | null;
    houseSafe?: boolean | null;
    yardRequired?: boolean | null;
    groomingNeeds?: string[];
    exerciseNeeds?: string[];
    barkiness?: string[];
    healthStatus?: string[];
    vaccinationStatus?: string[];
    availability?: string[];
    locationRadius?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    resultLimit?: number;
    premiumFeatures?: {
        trending?: boolean;
        verified?: boolean;
        featured?: boolean;
        aiRecommended?: boolean;
    };
}

export function useSwipeQueue(filters?: SwipeFilters): UseQueryResult<Pet[]> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Pet[]>({
        queryKey: ['swipe', 'queue', filters],
        queryFn: async () => {
            const response = await api.getSwipeQueue(filters || {});
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
        mutationFn: async (action: SwipeActionRequest) => {
            const response = await api.swipe({
                petId: action.petId,
                action: action.action
            });
            return response as SwipeResponse;
        },
        onSuccess: (response: SwipeResponse) => {
            if (response.isMatch && response.match) {
                setLastMatch(response.match);
                // Dispatch match event for celebration modal
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('match:new', { detail: response.match }));
                }
            }
            queryClient.invalidateQueries({ queryKey: ['swipe', 'queue'] });
            queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
    });
    return {
        swipe: swipeMutation.mutate,
        isLoading: swipeMutation.isPending,
        lastMatch,
        clearMatch: () => { setLastMatch(null); }
    };
}

export function useMatches(): UseQueryResult<Match[]> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Match[]>({
        queryKey: ['matches'],
        queryFn: async () => {
            const response = await api.getMatches();
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch matches');
        },
        enabled: isAuthenticated, // Only fetch when authenticated
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}

export function useMatch(matchId: string | undefined): UseQueryResult<Match> {
    return useQuery<Match>({
        queryKey: ['matches', matchId],
        queryFn: async () => {
            if (!matchId) throw new Error('Match ID is required');
            const response = await api.getMatch(matchId);
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

export function useMessages(matchId: string | undefined): UseQueryResult<Message[]> {
    const queryClient = useQueryClient();
    const query = useQuery<Message[]>({
        queryKey: ['messages', matchId],
        queryFn: async () => {
            if (!matchId) throw new Error('Match ID is required');
            const response = await api.getMessages(matchId);
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
        api.onSocketEvent('new-message', handleNewMessage);
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
            return api.sendMessage(matchId, content);
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
    return useMutation<void>({
        mutationFn: () => {
            if (!matchId) throw new Error('Match ID is required');
            api.markMessagesAsRead(matchId);
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
        mutationFn: (request: BioGenerationRequest) => api.generateBio(request),
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
        mutationFn: (photoUrl: string) => api.analyzePhoto(photoUrl),
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
        mutationFn: ({ pet1, pet2 }: CompatibilityRequest) => api.calculateCompatibility(pet1, pet2),
    });
}

interface ImprovementsResponse {
    suggestions: string[];
}

export function useSuggestImprovements(): UseMutationResult<ImprovementsResponse, Error, Pet> {
    return useMutation<ImprovementsResponse, Error, Pet>({
        mutationFn: (pet: Pet) => api.suggestProfileImprovements(pet),
    });
}
// ============= SUBSCRIPTION HOOKS =============
export function useSubscription(): UseQueryResult<Subscription | null> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Subscription | null>({
        queryKey: ['subscription'],
        queryFn: async () => {
            const response = await api.getSubscription();
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
        mutationFn: (plan: string) => api.createSubscription(plan),
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
    return useMutation<void>({
        mutationFn: () => api.cancelSubscription(),
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
        mutationFn: (location: LocationData) => api.updateLocation(location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });
}

export function useNearbyPets(radius = 10): UseQueryResult<Pet[]> {
    return useQuery<Pet[]>({
        queryKey: ['pets', 'nearby', radius],
        queryFn: async () => {
            const response = await api.getNearbyPets(radius);
            if (response.success)
                return response.data || [];
            throw new Error(response.error?.message || 'Failed to fetch nearby pets');
        },
        staleTime: 2 * 60 * 1000,
    });
}

// ============= NOTIFICATION HOOKS =============
export function useNotifications(): UseQueryResult<Notification[]> {
    const { isAuthenticated } = useAuthStore();
    return useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await api.getNotifications();
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
        mutationFn: (id: string) => api.markNotificationRead(id),
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
                const socket = await api.connectWebSocket(userId);
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
            api.disconnectWebSocket();
            setIsConnected(false);
            setConnectionError(null);
        };
    }, [userId]);
    
    return {
        isConnected,
        connectionError,
        isWebSocketConnected: api.isWebSocketConnected,
        joinMatchRoom: api.joinMatchRoom,
        leaveMatchRoom: api.leaveMatchRoom,
        sendChatMessage: api.sendChatMessage,
        sendTypingIndicator: api.sendTypingIndicator,
        markMessagesAsRead: api.markMessagesAsRead,
        performMatchAction: api.performMatchAction,
        onWebSocketEvent: api.onWebSocketEvent,
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

interface UseSwipeDataOptions {
    filters?: SwipeFilters;
}

export function useSwipeData(options?: UseSwipeDataOptions): UseSwipeDataReturn {
    const queue = useSwipeQueue(options?.filters);
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