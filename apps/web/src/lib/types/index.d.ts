/**
 * Shared Types for PawfectMatch
 * Rule II.1: Cross-Platform Architecture - shared types in packages/core
 * Comprehensive types migrated from client/src/types
 */
export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    avatar?: string;
    bio?: string;
    phone?: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };
    };
    preferences: {
        maxDistance: number;
        ageRange: {
            min: number;
            max: number;
        };
        species: string[];
        intents: string[];
        notifications: {
            email: boolean;
            push: boolean;
            matches: boolean;
            messages: boolean;
        };
    };
    premium: {
        isActive: boolean;
        plan: 'basic' | 'premium' | 'gold';
        expiresAt?: string;
        features: {
            unlimitedLikes: boolean;
            boostProfile: boolean;
            seeWhoLiked: boolean;
            advancedFilters: boolean;
        };
    };
    pets: string[];
    analytics: {
        totalSwipes: number;
        totalLikes: number;
        totalMatches: number;
        profileViews: number;
        lastActive: string;
    };
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface Pet {
    _id: string;
    owner: User | string;
    name: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed: string;
    age: number;
    gender: 'male' | 'female';
    size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
    weight?: number;
    color?: {
        primary?: string;
        secondary?: string;
        pattern?: 'solid' | 'spotted' | 'striped' | 'mixed' | 'other';
    };
    photos: PetPhoto[];
    videos?: PetVideo[];
    description?: string;
    personalityTags: string[];
    intent: 'adoption' | 'mating' | 'playdate' | 'all';
    availability: {
        isAvailable: boolean;
        schedule?: WeeklySchedule;
    };
    healthInfo: {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        healthConditions?: string[];
        medications?: string[];
        specialNeeds?: string;
        lastVetVisit?: string;
        vetContact?: {
            name?: string;
            phone?: string;
            clinic?: string;
        };
    };
    location: {
        type: 'Point';
        coordinates: [number, number];
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };
    };
    aiData?: {
        personalityScore?: {
            friendliness?: number;
            energy?: number;
            trainability?: number;
            socialness?: number;
            aggression?: number;
        };
        compatibilityTags?: string[];
        breedCharacteristics?: {
            temperament?: string[];
            energyLevel?: string;
            groomingNeeds?: string;
            healthConcerns?: string[];
        };
        lastUpdated?: string;
    };
    featured: {
        isFeatured: boolean;
        featuredUntil?: string;
        boostCount: number;
        lastBoosted?: string;
    };
    analytics: {
        views: number;
        likes: number;
        matches: number;
        messages: number;
        lastViewed?: string;
    };
    isActive: boolean;
    isVerified: boolean;
    status: 'active' | 'paused' | 'adopted' | 'unavailable';
    adoptedAt?: string;
    listedAt: string;
    createdAt: string;
    updatedAt: string;
}
export interface PetPhoto {
    url: string;
    publicId?: string;
    caption?: string;
    isPrimary: boolean;
}
export interface PetVideo {
    url: string;
    publicId?: string;
    caption?: string;
    duration?: number;
}
export interface WeeklySchedule {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}
export interface DaySchedule {
    available: boolean;
    times: string[];
}
export interface Match {
    _id: string;
    pet1: Pet;
    pet2: Pet;
    user1: User;
    user2: User;
    matchType: 'adoption' | 'mating' | 'playdate' | 'general';
    compatibilityScore: number;
    aiRecommendationReason?: string;
    status: 'active' | 'archived' | 'blocked' | 'deleted' | 'completed';
    messages: Message[];
    meetings?: Meeting[];
    lastActivity: string;
    lastMessageAt?: string;
    messageCount: number;
    userActions: {
        user1: UserMatchActions;
        user2: UserMatchActions;
    };
    outcome?: {
        result?: 'pending' | 'met' | 'adopted' | 'mated' | 'no-show' | 'incompatible';
        completedAt?: string;
        rating?: {
            user1Rating?: number;
            user2Rating?: number;
        };
        feedback?: {
            user1Feedback?: string;
            user2Feedback?: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}
export interface Message {
    _id: string;
    sender: User;
    content: string;
    messageType: 'text' | 'image' | 'location' | 'system';
    attachments?: Attachment[];
    readBy: ReadReceipt[];
    sentAt: string;
    editedAt?: string;
    isEdited: boolean;
    isDeleted: boolean;
}
export interface Attachment {
    type: string;
    fileType?: string;
    fileName?: string;
    url: string;
}
export interface ReadReceipt {
    user: string;
    readAt: string;
}
export interface UserMatchActions {
    isArchived: boolean;
    isBlocked: boolean;
    isFavorite: boolean;
    muteNotifications: boolean;
    lastSeen?: string;
}
export interface Meeting {
    _id?: string;
    proposedBy: string;
    title: string;
    description?: string;
    proposedDate: string;
    location?: {
        name?: string;
        address?: string;
        coordinates?: [number, number];
    };
    status: 'proposed' | 'accepted' | 'declined' | 'completed' | 'cancelled';
    responses: MeetingResponse[];
    createdAt: string;
}
export interface MeetingResponse {
    user: string;
    response: 'accepted' | 'declined' | 'maybe';
    respondedAt: string;
    note?: string;
}
export interface LoginForm {
    email: string;
    password: string;
}
export interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone?: string;
    agreeToTerms: boolean;
}
export interface PetForm {
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    size: string;
    weight?: number;
    description?: string;
    personalityTags: string[];
    intent: string;
    photos: File[];
    healthInfo: {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        specialNeeds?: string;
    };
}
export interface PetFilters {
    species?: string;
    intent?: string;
    maxDistance?: number;
    minAge?: number;
    maxAge?: number;
    size?: string;
    gender?: string;
    breed?: string;
}
export interface SwipeAction {
    petId: string;
    action: 'like' | 'pass' | 'superlike';
}
export interface SwipeResult {
    isMatch: boolean;
    matchId?: string;
    action: string;
    match?: Match;
}
export interface AIRecommendation {
    petId: string;
    score: number;
    reasons: string[];
}
export interface CompatibilityAnalysis {
    compatibility_score: number;
    factors: string[];
    recommendation: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T = any> extends ApiResponse<{
    items?: T[];
    pets?: T[];
    matches?: T[];
    pagination: {
        page: number;
        limit: number;
        total?: number;
        hasMore: boolean;
    };
}> {
}
export interface NotificationProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}
export interface LoadingState {
    isLoading: boolean;
    message?: string;
}
export interface SocketMessage {
    matchId: string;
    message: Message;
}
export interface SocketNotification {
    type: 'new_message' | 'new_match' | 'user_online' | 'user_offline';
    title: string;
    body?: string;
    matchId?: string;
    senderId?: string;
    userId?: string;
}
export declare const SPECIES_OPTIONS: {
    value: string;
    label: string;
}[];
export declare const SIZE_OPTIONS: {
    value: string;
    label: string;
}[];
export declare const INTENT_OPTIONS: {
    value: string;
    label: string;
}[];
export declare const PERSONALITY_TAGS: string[];
//# sourceMappingURL=index.d.ts.map