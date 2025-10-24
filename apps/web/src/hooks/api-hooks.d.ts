export declare function useAuth(): {
    login: import("@tanstack/react-query").UseMutateFunction<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: import("../types").User;
        };
    }, Error, void, unknown>;
    register: import("@tanstack/react-query").UseMutateFunction<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: import("../types").User;
        };
    }, Error, void, unknown>;
    logout: import("@tanstack/react-query").UseMutateFunction<void, Error, void, unknown>;
    isLoading: boolean;
    error: Error | null;
};
export declare function useCurrentUser(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useUpdateProfile(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function usePets(): import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare function useMyPets(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare const useUserPets: typeof useMyPets;
export declare function useCreatePet(): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    data: unknown;
    error?: string;
}, Error, void, unknown>;
export declare function useUpdatePet(): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    data: unknown;
    error?: string;
}, Error, void, unknown>;
export declare function useDeletePet(): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    data: unknown;
    error?: string;
}, Error, void, unknown>;
export declare function useSwipeQueue(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useSwipe(): {
    swipe: import("@tanstack/react-query").UseMutateFunction<{
        success: boolean;
        data: unknown;
        error?: string;
    }, Error, void, unknown>;
    isLoading: boolean;
    lastMatch: null;
    clearMatch: () => void;
};
export declare function useMatches(): import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare function useMatch(matchId: any): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useMessages(matchId: any): import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare function useSendMessage(matchId: any): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    data: unknown;
    error?: string;
}, Error, void, {
    tempMessage: {
        id: string;
        matchId: any;
        senderId: string;
        content: void;
        timestamp: string;
        read: boolean;
    };
}>;
export declare function useMarkMessagesAsRead(matchId: any): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useGenerateBio(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useAnalyzePhoto(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useCalculateCompatibility(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useSuggestImprovements(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useSubscription(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useCreateSubscription(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useCancelSubscription(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useUpdateLocation(): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    data: unknown;
    error?: string;
}, Error, void, unknown>;
export declare function useNearbyPets(radius?: number): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useNotifications(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useMarkNotificationRead(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare function useWebSocket(userId: any): {
    isConnected: boolean;
    connectionError: null;
    isWebSocketConnected: () => boolean;
    joinMatchRoom: (matchId: string) => void;
    leaveMatchRoom: (matchId: string) => void;
    sendChatMessage: (matchId: string, content: string, messageType?: string, attachments?: unknown[]) => void;
    sendTypingIndicator: (matchId: string, isTyping: boolean) => void;
    markMessagesAsRead: (matchId: string) => void;
    performMatchAction: (matchId: string, action: string) => void;
    onWebSocketEvent: (eventName: string, callback: (data: unknown) => void) => () => void;
};
export declare function useDashboardData(): {
    user: any;
    pets: any;
    matches: {};
    notifications: any;
    subscription: any;
    isLoading: boolean;
    error: Error | null;
};
export declare function useSwipeData(): {
    pets: any;
    currentPet: any;
    swipe: import("@tanstack/react-query").UseMutateFunction<{
        success: boolean;
        data: unknown;
        error?: string;
    }, Error, void, unknown>;
    isLoading: boolean;
    lastMatch: null;
    clearMatch: () => void;
    isPremium: any;
    refetch: (options?: import("@tanstack/react-query").RefetchOptions) => Promise<import("@tanstack/react-query").QueryObserverResult<any, Error>>;
};
export declare function useChatData(matchId: any): {
    match: any;
    messages: {};
    sendMessage: import("@tanstack/react-query").UseMutateFunction<{
        success: boolean;
        data: unknown;
        error?: string;
    }, Error, void, {
        tempMessage: {
            id: string;
            matchId: any;
            senderId: string;
            content: void;
            timestamp: string;
            read: boolean;
        };
    }>;
    isLoading: boolean;
    isSending: boolean;
};
//# sourceMappingURL=api-hooks.d.ts.map