import { Socket } from 'socket.io-client';
declare const apiClient: {
    connectWebSocket: (userId: string) => Promise<Socket | null>;
    disconnectWebSocket: () => void;
    isWebSocketConnected: () => boolean;
    joinMatchRoom: (matchId: string) => void;
    leaveMatchRoom: (matchId: string) => void;
    sendChatMessage: (matchId: string, content: string, messageType?: string, attachments?: unknown[]) => void;
    sendTypingIndicator: (matchId: string, isTyping: boolean) => void;
    markMessagesAsRead: (matchId: string) => void;
    performMatchAction: (matchId: string, action: string) => void;
    onWebSocketEvent: (eventName: string, callback: (data: unknown) => void) => () => void;
    setToken: (token: string, refreshToken?: string) => void;
    clearToken: () => void;
    getToken: () => string | null;
    syncTokensFromStore: () => void;
    login: (email: string, password: string) => Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: import("../types").User;
        };
    }>;
    register: (data: import("../types").UserRegistrationData) => Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: import("../types").User;
        };
    }>;
    logout: () => Promise<void>;
    forgotPassword: {
        (email: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        (email: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
    };
    resetPassword: (token: string, password: string) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    getPets: () => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    getPet: (id: string) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    createPet: (data: import("../types").PetCreationData) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    updatePet: (id: string, data: Partial<import("../types").Pet>) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    deletePet: (id: string) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    updatePetProfile: (data: Partial<import("../types").Pet>) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    getMatches: () => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    swipe: (petId: string, action: "like" | "pass" | "superlike") => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    getMessages: (matchId: string) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    sendMessage: (matchId: string, content: string) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    getWeather: (lat?: number, lon?: number) => Promise<any>;
    updateLocation: (lat: number, lon: number) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    syncPreferences: (preferences: import("../types").UserPreferences) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    pets: {
        getSwipeablePets(filters?: import("../types").SwipeParams): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        discoverPets(filters?: import("../types").SwipeParams): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        likePet(petId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        passPet(petId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        superLikePet(petId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        reportPet(petId: string, reason: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
    };
    matches: {
        getMatches(): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        getMatch(matchId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        unmatch(matchId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
    };
    chat: {
        getConversations(): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        getMessages(conversationId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        sendMessage(conversationId: string, message: string, attachments?: import("../types").MessageAttachment[]): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        markAsRead(conversationId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
    };
    ai: {
        generateBio(data: import("../types").BioGenerationData): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        analyzePhoto(formData: FormData): Promise<any>;
        analyzeCompatibility(petAId: string, petBId: string, options?: import("../types").CompatibilityOptions): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        getChatSuggestions(matchId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        getSmartRecommendations(userId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        analyzeBehavior(petId: string, data: import("../types").BehaviorAnalysisData): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
    };
    subscription: {
        getCurrentSubscription(): Promise<any>;
        getUsageStats(): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        createCheckoutSession(data: {
            plan: string;
            interval: "month" | "year";
        }): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        cancelSubscription(): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        reactivateSubscription(subscriptionId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        getPlans(): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        updatePaymentMethod(paymentMethodId: string): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
    };
};
export default apiClient;
//# sourceMappingURL=api-client.d.ts.map