export declare function EnhancementProvider({ children, showFeedbackWidget, showTourLauncher, showPushNotifications, showGamification, showSuccessStories }: {
    children: any;
    showFeedbackWidget?: boolean | undefined;
    showTourLauncher?: boolean | undefined;
    showPushNotifications?: boolean | undefined;
    showGamification?: boolean | undefined;
    showSuccessStories?: boolean | undefined;
}): JSX.Element;
export declare function withEnhancements(Component: any, options?: {}): (props: any) => JSX.Element;
export declare function useEnhancements(): {
    isAuthenticated: boolean;
    isOffline: any;
    pendingActions: any;
    user: import("../../types").User | null;
    trackSwipe: (petId: any, action: any) => Promise<void>;
    trackMatch: (matchId: any, petId: any) => Promise<void>;
    trackChatMessage: (chatId: any, message: any) => Promise<void>;
    enhancePetPhoto: (imageUrl: any, petId: any) => Promise<any>;
    getPetNameSuggestions: (petInfo: any) => Promise<any>;
    queueAction: (type: "message" | "swipe" | "like" | "profile_update", data: Record<string, unknown>) => Promise<string>;
    recordActivity: (activity: Parameters<(userId: string, activity: {
        type: "swipe" | "login" | "chat" | "match" | "profile_update";
        count?: number;
        metadata?: Record<string, any>;
    }) => Promise<void>>[1]) => Promise<void>;
    addEvent: (name: string, data?: Record<string, unknown>) => void;
    addIssue: (issue: Parameters<(issue: {
        type: string;
        message: string;
        stack?: string;
        url?: string;
        line?: number;
        column?: number;
    }) => void>[0]) => void;
    getOptimizedUrl: any;
};
export default EnhancementProvider;
//# sourceMappingURL=EnhancementProvider.d.ts.map