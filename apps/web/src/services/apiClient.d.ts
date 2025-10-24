/**
 * PawfectMatch API Client
 * Production-ready API client for the PawfectMatch application
 */
import type { PetProfile } from '@/components/Profile/PetProfileEditor';
import type { PetCareReminder } from '@/components/Reminders/PetCareReminders';
/**
 * Community API
 */
export interface CommunityPostAuthor {
    _id: string;
    name: string;
    avatar?: string;
}
export interface CommunityComment {
    _id: string;
    author: CommunityPostAuthor;
    content: string;
    createdAt: string;
}
export interface CommunityPost {
    _id: string;
    author: CommunityPostAuthor;
    content: string;
    images: string[];
    likes: number;
    liked?: boolean;
    comments: CommunityComment[];
    createdAt: string;
    packId?: string;
    packName?: string;
    type: 'post' | 'activity';
    activityDetails?: {
        date: string;
        location: string;
        maxAttendees?: number;
        currentAttendees?: number;
    };
    authorFollowed?: boolean;
}
export interface CommunityFeedResponse {
    success: boolean;
    posts: CommunityPost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface CommunityCommentResponse {
    success: boolean;
    comment: CommunityComment;
    message: string;
}
export interface CommunityPostResponse {
    success: boolean;
    post: CommunityPost;
    message: string;
}
export interface CommunityPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}
export declare const communityApi: {
    getFeed: (params?: {
        page?: number;
        limit?: number;
        packId?: string;
        type?: string;
    }) => Promise<CommunityFeedResponse>;
    createPost: (payload: {
        content: string;
        images?: string[];
        packId?: string;
        type?: string;
        activityDetails?: Record<string, unknown>;
    }) => Promise<CommunityPostResponse>;
    likePost: (postId: string) => Promise<CommunityPostResponse>;
    addComment: (postId: string, content: string) => Promise<CommunityCommentResponse>;
    getComments: (postId: string, params?: {
        page?: number;
        limit?: number;
    }) => Promise<{
        success: boolean;
        comments: CommunityComment[];
        pagination: CommunityPagination;
    }>;
    reportContent: (payload: {
        targetType: "post" | "user" | "comment";
        targetId: string;
        reason: string;
        details?: string;
    }) => Promise<{
        success: boolean;
        message: string;
    }>;
    blockUser: (userId: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    followUser: (userId: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    unfollowUser: (userId: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    subscribeToNotifications: (subscription: PushSubscription) => Promise<{
        success: boolean;
        message: string;
    }>;
    unsubscribeFromNotifications: (endpoint: string) => Promise<{
        success: boolean;
        message: string;
    }>;
};
/**
 * Pets API
 */
export declare const petsApi: {
    getAll: () => Promise<Pet[]>;
    getById: (id: string) => Promise<PetProfile>;
    create: (pet: Omit<Pet, "id">) => Promise<Pet>;
    update: (id: string, pet: Partial<PetProfile>) => Promise<PetProfile>;
    delete: (id: string) => Promise<Record<string, never>>;
    uploadPhoto: (id: string, photoBlob: Blob) => Promise<Record<string, unknown>>;
};
/**
 * Reminders API
 */
export declare const remindersApi: {
    getAll: () => Promise<PetCareReminder[]>;
    getById: (id: string) => Promise<PetCareReminder>;
    create: (reminder: Omit<PetCareReminder, "id">) => Promise<PetCareReminder>;
    update: (id: string, reminder: Partial<PetCareReminder>) => Promise<PetCareReminder>;
    delete: (id: string) => Promise<Record<string, never>>;
    toggleComplete: (id: string, completed: boolean) => Promise<PetCareReminder>;
};
/**
 * Calendar API
 */
export declare const calendarApi: {
    getEvents: () => Promise<CalendarEvent[]>;
    getEventById: (id: string) => Promise<CalendarEvent>;
    createEvent: (event: Omit<CalendarEvent, "id">) => Promise<CalendarEvent>;
    updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<CalendarEvent>;
    deleteEvent: (id: string) => Promise<Record<string, never>>;
};
/**
 * Playgrounds API
 */
export declare const playgroundsApi: {
    getAll: (filters?: Record<string, unknown>) => Promise<PetPlayground[]>;
    getById: (id: string) => Promise<PetPlayground>;
    toggleFavorite: (id: string, isFavorite: boolean) => Promise<PetPlayground>;
};
/**
 * User API
 */
export declare const userApi: {
    getProfile: () => Promise<User>;
    updateProfile: (profile: Partial<User>) => Promise<User>;
    getPreferences: () => Promise<UserPreferences>;
    updatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserPreferences>;
};
/**
 * Types
 */
export interface User {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    token?: string;
    premium?: {
        isActive: boolean;
        plan: string;
        expiresAt: string;
    };
    streak?: {
        current: number;
        longest: number;
        lastCheckIn?: string;
    };
    stats?: {
        matches?: number;
        messages?: number;
        likes?: number;
    };
    twoFactorEnabled?: boolean;
    privacySettings?: {
        profileVisibility: 'everyone' | 'matches' | 'nobody';
        showOnlineStatus: boolean;
        showDistance: boolean;
        showLastActive: boolean;
        allowMessages: 'everyone' | 'matches' | 'nobody';
        showReadReceipts: boolean;
        incognitoMode: boolean;
        shareLocation: boolean;
    };
    notificationPreferences?: {
        enabled: boolean;
        matches: boolean;
        messages: boolean;
        likes: boolean;
        reminders: boolean;
        quietHours: {
            enabled: boolean;
            start: string;
            end: string;
        };
        frequency: 'instant' | 'batched' | 'daily';
        sound: boolean;
        vibration: boolean;
    };
}
export interface Pet {
    id: string;
    name: string;
    avatar?: string;
    species: string;
}
export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    type: string;
    petIds: string[];
    location?: string;
    allDay?: boolean;
}
export interface UserPreferences {
    notifications: {
        enabled: boolean;
        matches: boolean;
        messages: boolean;
        likes: boolean;
        reminders: boolean;
        quietHours: {
            enabled: boolean;
            start: string;
            end: string;
        };
        frequency: 'instant' | 'batched' | 'daily';
        sound: boolean;
        vibration: boolean;
    };
    privacy: {
        profileVisibility: 'everyone' | 'matches' | 'none';
        showOnlineStatus: boolean;
        showDistance: boolean;
        showLastActive: boolean;
        allowMessages: 'everyone' | 'matches' | 'none';
        showReadReceipts: boolean;
        incognitoMode: boolean;
        shareLocation: boolean;
    };
}
declare const apiClient: {
    pets: {
        getAll: () => Promise<Pet[]>;
        getById: (id: string) => Promise<PetProfile>;
        create: (pet: Omit<Pet, "id">) => Promise<Pet>;
        update: (id: string, pet: Partial<PetProfile>) => Promise<PetProfile>;
        delete: (id: string) => Promise<Record<string, never>>;
        uploadPhoto: (id: string, photoBlob: Blob) => Promise<Record<string, unknown>>;
    };
    reminders: {
        getAll: () => Promise<PetCareReminder[]>;
        getById: (id: string) => Promise<PetCareReminder>;
        create: (reminder: Omit<PetCareReminder, "id">) => Promise<PetCareReminder>;
        update: (id: string, reminder: Partial<PetCareReminder>) => Promise<PetCareReminder>;
        delete: (id: string) => Promise<Record<string, never>>;
        toggleComplete: (id: string, completed: boolean) => Promise<PetCareReminder>;
    };
    calendar: {
        getEvents: () => Promise<CalendarEvent[]>;
        getEventById: (id: string) => Promise<CalendarEvent>;
        createEvent: (event: Omit<CalendarEvent, "id">) => Promise<CalendarEvent>;
        updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<CalendarEvent>;
        deleteEvent: (id: string) => Promise<Record<string, never>>;
    };
    playgrounds: {
        getAll: (filters?: Record<string, unknown>) => Promise<PetPlayground[]>;
        getById: (id: string) => Promise<PetPlayground>;
        toggleFavorite: (id: string, isFavorite: boolean) => Promise<PetPlayground>;
    };
    user: {
        getProfile: () => Promise<User>;
        updateProfile: (profile: Partial<User>) => Promise<User>;
        getPreferences: () => Promise<UserPreferences>;
        updatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserPreferences>;
    };
    community: {
        getFeed: (params?: {
            page?: number;
            limit?: number;
            packId?: string;
            type?: string;
        }) => Promise<CommunityFeedResponse>;
        createPost: (payload: {
            content: string;
            images?: string[];
            packId?: string;
            type?: string;
            activityDetails?: Record<string, unknown>;
        }) => Promise<CommunityPostResponse>;
        likePost: (postId: string) => Promise<CommunityPostResponse>;
        addComment: (postId: string, content: string) => Promise<CommunityCommentResponse>;
        getComments: (postId: string, params?: {
            page?: number;
            limit?: number;
        }) => Promise<{
            success: boolean;
            comments: CommunityComment[];
            pagination: CommunityPagination;
        }>;
        reportContent: (payload: {
            targetType: "post" | "user" | "comment";
            targetId: string;
            reason: string;
            details?: string;
        }) => Promise<{
            success: boolean;
            message: string;
        }>;
        blockUser: (userId: string) => Promise<{
            success: boolean;
            message: string;
        }>;
        followUser: (userId: string) => Promise<{
            success: boolean;
            message: string;
        }>;
        unfollowUser: (userId: string) => Promise<{
            success: boolean;
            message: string;
        }>;
        subscribeToNotifications: (subscription: PushSubscription) => Promise<{
            success: boolean;
            message: string;
        }>;
        unsubscribeFromNotifications: (endpoint: string) => Promise<{
            success: boolean;
            message: string;
        }>;
    };
};
export default apiClient;
//# sourceMappingURL=apiClient.d.ts.map