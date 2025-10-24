/**
 * Common Type Definitions
 * Replaces all `any` types with proper TypeScript interfaces
 */
export interface SecurityEventDetails {
    [key: string]: unknown;
    requestId?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    errorMessage?: string;
    suspiciousPattern?: string;
    blockedReason?: string;
}
export interface SecurityEvent {
    type: 'csrf_attempt' | 'rate_limit_exceeded' | 'suspicious_activity' | 'auth_failure';
    details: SecurityEventDetails;
    userAgent?: string;
    ip?: string;
    userId?: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    statusCode?: number;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}
export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    preferences?: UserPreferences;
}
export interface UserPreferences {
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    privacy: {
        showLocation: boolean;
        showAge: boolean;
        showLastSeen: boolean;
    };
    matching: {
        maxDistance: number;
        ageRange: {
            min: number;
            max: number;
        };
        species: string[];
    };
}
export interface Pet {
    _id: string;
    name: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed: string;
    age: number;
    gender: 'male' | 'female' | 'unknown';
    size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
    description?: string;
    photos: string[];
    owner: string | User;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    personality?: string[];
    health?: {
        vaccinated: boolean;
        spayed: boolean;
        microchipped: boolean;
        medicalConditions?: string[];
    };
    compatibility?: number;
    createdAt: string;
    updatedAt: string;
}
export interface PetCardData {
    id: string;
    name: string;
    breed: string;
    age: number;
    size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
    distanceKm: number;
    bio: string;
    photos: string[];
    compatibility?: number;
    gender?: 'male' | 'female' | 'unknown';
    species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
}
export interface Match {
    _id: string;
    pet1: string | Pet;
    pet2: string | Pet;
    user1: string | User;
    user2: string | User;
    compatibility: number;
    createdAt: string;
    lastMessage?: Message;
    unreadCount?: number;
}
export interface Message {
    _id: string;
    chatId: string;
    sender: string | User;
    content: string;
    type: 'text' | 'image' | 'location' | 'emoji' | 'gift';
    attachments?: MessageAttachment[];
    readBy?: MessageReadReceipt[];
    createdAt: string;
    updatedAt: string;
}
export interface MessageAttachment {
    _id: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    thumbnail?: string;
}
export interface MessageReadReceipt {
    user: string;
    readAt: string;
}
export interface Chat {
    _id: string;
    matchId: string;
    participants: string[] | User[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface SwipeAction {
    petId: string;
    action: 'like' | 'pass' | 'superlike';
    timestamp: number;
}
export interface SwipeResult {
    success: boolean;
    isMatch: boolean;
    match?: Match;
    message?: string;
}
export interface SwipeFilters {
    species?: string[];
    ageRange?: {
        min: number;
        max: number;
    };
    size?: string[];
    distance?: number;
    gender?: string[];
    intent?: string[];
}
export interface AnalyticsData {
    totalUsers: number;
    totalPets: number;
    totalMatches: number;
    totalMessages: number;
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    conversionRate: number;
    retentionRate: number;
    engagementRate: number;
}
export interface AnalyticsMetric {
    label: string;
    value: string | number;
    change: number;
    icon: React.ComponentType<{
        className?: string;
    }>;
    color: string;
}
export interface GamificationData {
    userId: string;
    points: number;
    level: number;
    badges: Badge[];
    achievements: Achievement[];
    leaderboard: LeaderboardEntry[];
    streak: number;
    lastActivity: string;
}
export interface Badge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
}
export interface Achievement {
    _id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
}
export interface LeaderboardEntry {
    userId: string;
    user: User;
    points: number;
    level: number;
    rank: number;
}
export interface SuccessStory {
    id: string;
    title: string;
    content: string;
    author: User;
    pets: Pet[];
    images: string[];
    tags: string[];
    featured: boolean;
    publishedAt: string;
    likes: number;
    comments: number;
    verified: boolean;
}
export interface PhotoAnalysisResult {
    breed: {
        primary: string;
        secondary?: string;
        confidence: number;
    };
    characteristics: {
        age: number;
        size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
        color: string[];
        features: string[];
    };
    health: {
        estimatedAge: number;
        condition: 'excellent' | 'good' | 'fair' | 'poor';
        recommendations: string[];
    };
    quality: {
        score: number;
        issues: string[];
        suggestions: string[];
    };
}
export interface CompatibilityAnalysis {
    pet1: Pet;
    pet2: Pet;
    overallScore: number;
    categories: {
        personality: number;
        lifestyle: number;
        activity: number;
        social: number;
        environment: number;
    };
    recommendations: {
        meeting: string[];
        activities: string[];
        supervision: string[];
        timing: string[];
    };
    successProbability: number;
    riskFactors: string[];
}
export interface BioGenerationResult {
    bio: string;
    tone: 'playful' | 'professional' | 'casual' | 'romantic' | 'funny';
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    length: number;
    alternatives: string[];
}
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
    required: boolean;
    placeholder?: string;
    options?: {
        value: string;
        label: string;
    }[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}
export interface FormData {
    [key: string]: unknown;
}
export interface ErrorDetails {
    message: string;
    code?: string;
    field?: string;
    value?: unknown;
    stack?: string;
    context?: Record<string, unknown>;
}
export interface ValidationError extends Error {
    field: string;
    value: unknown;
    constraint: string;
}
export interface CustomEvent {
    type: string;
    detail: Record<string, unknown>;
    timestamp: number;
}
export interface UserEvent extends CustomEvent {
    userId: string;
    sessionId: string;
    userAgent: string;
    ip?: string;
}
export interface NavigationState {
    index: number;
    routes: NavigationRoute[];
    history: string[];
}
export interface NavigationRoute {
    name: string;
    key: string;
    params?: Record<string, unknown>;
}
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
    testID?: string;
}
export interface LoadingState {
    isLoading: boolean;
    error?: string | null;
    data?: unknown;
}
export interface AsyncHookState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export interface PaginationState {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    loading: boolean;
}
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type ComponentType<T = Record<string, unknown>> = React.ComponentType<T>;
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncFunction<T = unknown, R = unknown> = (args: T) => Promise<R>;
export type Callback<T = unknown> = (data: T) => void;
export interface StripeConfig {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
}
export interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadPreset: string;
}
export interface OpenReplayConfig {
    projectKey: string;
    ingestPoint: string;
    defaultInputMode: number;
    obscureTextEmails: boolean;
    obscureInputEmails: boolean;
    defaultPrivacyLevel: string;
}
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        OpenReplay?: {
            start: (config: OpenReplayConfig) => string;
            stop: () => void;
            setUserID: (userId: string) => void;
            setMetadata: (key: string, value: unknown) => void;
            addEvent: (name: string, data?: unknown) => void;
            addIssue: (issue: {
                type: string;
                message: string;
                source?: string;
                line?: number;
                column?: number;
            }) => void;
        };
        Sentry?: {
            captureException: (error: Error, context?: Record<string, unknown>) => void;
            setUser: (user: {
                id: string;
                email?: string;
            }) => void;
            setContext: (key: string, context: Record<string, unknown>) => void;
        };
    }
}
export {};
//# sourceMappingURL=common.d.ts.map