/**
 * ULTRA PREMIUM API Service 🚀
 * Production-ready with full type safety, error handling, and real-time features
 */
import { User, Pet, UserRegistrationData, PetCreationData, SwipeParams, UserPreferences, MessageAttachment, BioGenerationData, CompatibilityOptions, BehaviorAnalysisData } from '../types';
export declare const petsAPI: {
    getSwipeablePets(filters?: SwipeParams): Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    discoverPets(filters?: SwipeParams): Promise<{
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
export declare const matchesAPI: {
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
export declare const chatAPI: {
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
    sendMessage(conversationId: string, message: string, attachments?: MessageAttachment[]): Promise<{
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
export declare const aiAPI: {
    generateBio(data: BioGenerationData): Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    analyzePhoto(formData: FormData): Promise<any>;
    analyzeCompatibility(petAId: string, petBId: string, options?: CompatibilityOptions): Promise<{
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
    analyzeBehavior(petId: string, data: BehaviorAnalysisData): Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
};
export declare const subscriptionAPI: {
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
export declare const api: {
    setToken: (token: string, refreshToken?: string) => void;
    clearToken: () => void;
    getToken: () => string | null;
    syncTokensFromStore: () => void;
    login: (email: string, password: string) => Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: User;
        };
    }>;
    register: (data: UserRegistrationData) => Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: User;
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
    createPet: (data: PetCreationData) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    updatePet: (id: string, data: Partial<Pet>) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    deletePet: (id: string) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    updatePetProfile: (data: Partial<Pet>) => Promise<{
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
    syncPreferences: (preferences: UserPreferences) => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    pets: {
        getSwipeablePets(filters?: SwipeParams): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        discoverPets(filters?: SwipeParams): Promise<{
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
        sendMessage(conversationId: string, message: string, attachments?: MessageAttachment[]): Promise<{
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
        generateBio(data: BioGenerationData): Promise<{
            success: boolean;
            data: unknown;
            error?: string;
        }>;
        analyzePhoto(formData: FormData): Promise<any>;
        analyzeCompatibility(petAId: string, petBId: string, options?: CompatibilityOptions): Promise<{
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
        analyzeBehavior(petId: string, data: BehaviorAnalysisData): Promise<{
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
export default api;
//# sourceMappingURL=api.d.ts.map