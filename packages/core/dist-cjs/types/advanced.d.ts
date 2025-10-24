/**
 * Advanced Type Definitions
 * Comprehensive type system for professional implementations
 */
/**
 * Generic event emitter data type
 */
export type EventData = Record<string, unknown> | unknown[] | string | number | boolean | null;
/**
 * Zustand store setter function type
 */
export type ZustandSetter<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;
/**
 * Zustand store getter function type
 */
export type ZustandGetter<T> = () => T;
/**
 * Generic callback function type
 */
export type Callback<T = unknown> = (data: T) => void;
/**
 * Generic async callback function type
 */
export type AsyncCallback<T = unknown> = (data: T) => Promise<void>;
/**
 * Generic event listener type
 */
export type EventListener<T = EventData> = (data: T) => void;
/**
 * Generic error handler type
 */
export type ErrorHandler = (error: Error | string, context?: string) => void;
/**
 * Generic logger type
 */
export interface Logger {
    info: (message: string, data?: EventData) => void;
    warn: (message: string, data?: EventData) => void;
    error: (message: string, error?: Error | EventData) => void;
    debug: (message: string, data?: EventData) => void;
}
/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
    statusCode?: number;
    timestamp?: number;
}
/**
 * API error response
 */
export interface ApiError {
    code: string;
    message: string;
    details?: EventData;
    statusCode: number;
    timestamp: number;
}
/**
 * HTTP request configuration
 */
export interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: EventData;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}
/**
 * WebSocket message type
 */
export interface WebSocketMessage<T = EventData> {
    type: string;
    payload: T;
    timestamp: number;
    id?: string;
}
/**
 * Pet profile interface
 */
export interface PetProfile {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed: string;
    age: number;
    size: 'small' | 'medium' | 'large' | 'extra-large';
    personalityTags: string[];
    intent: 'adoption' | 'mating' | 'playdate' | 'all';
    photos: string[];
    bio: string;
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    ownerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Pet matching recommendation
 */
export interface PetRecommendation {
    pet: PetProfile;
    compatibilityScore: number;
    reasons: string[];
    distance: number;
    lastActive: Date;
}
/**
 * Pet filters for matching
 */
export interface PetFilters {
    species?: PetProfile['species'];
    minAge?: number;
    maxAge?: number;
    size?: PetProfile['size'];
    intent?: PetProfile['intent'];
    maxDistance?: number;
    personalityTags?: string[];
    excludeIds?: string[];
}
/**
 * User profile interface
 */
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    preferences: UserPreferences;
    subscription: SubscriptionInfo;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * User preferences
 */
export interface UserPreferences {
    notifications: {
        matches: boolean;
        messages: boolean;
        events: boolean;
        marketing: boolean;
    };
    privacy: {
        showLocation: boolean;
        showAge: boolean;
        showPhone: boolean;
    };
    matching: {
        maxDistance: number;
        preferredSpecies: PetProfile['species'][];
        ageRange: {
            min: number;
            max: number;
        };
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
}
/**
 * Subscription information
 */
export interface SubscriptionInfo {
    tier: 'free' | 'premium' | 'premium-plus';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    expiresAt?: Date;
    features: string[];
    billingCycle?: 'monthly' | 'yearly';
}
/**
 * Chat message interface
 */
export interface ChatMessage {
    id: string;
    matchId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'gif' | 'location' | 'system';
    metadata?: EventData;
    isRead: boolean;
    timestamp: Date;
    editedAt?: Date;
    deletedAt?: Date;
}
/**
 * Chat match interface
 */
export interface ChatMatch {
    id: string;
    pet1Id: string;
    pet2Id: string;
    status: 'active' | 'blocked' | 'expired';
    lastMessage?: ChatMessage;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Weather data interface
 */
export interface WeatherData {
    location: {
        latitude: number;
        longitude: number;
        name: string;
    };
    current: {
        temperature: number;
        condition: string;
        humidity: number;
        windSpeed: number;
        uvIndex: number;
    };
    forecast: WeatherForecast[];
    lastUpdated: Date;
}
/**
 * Weather forecast entry
 */
export interface WeatherForecast {
    date: Date;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
}
/**
 * Toast notification
 */
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        handler: () => void;
    };
}
/**
 * Modal configuration
 */
export interface ModalConfig {
    type: string | null;
    props?: EventData;
    isOpen: boolean;
}
/**
 * Loading state
 */
export interface LoadingState {
    isLoading: boolean;
    message?: string;
    progress?: number;
}
/**
 * Offline action for sync
 */
export interface OfflineAction {
    id: string;
    type: 'create' | 'update' | 'delete';
    endpoint: string;
    data: EventData;
    timestamp: number;
    retries: number;
    maxRetries: number;
}
/**
 * Cache entry
 */
export interface CacheEntry<T = EventData> {
    key: string;
    data: T;
    timestamp: number;
    expiresAt?: number;
    version: number;
}
/**
 * Sync status
 */
export interface SyncStatus {
    isOnline: boolean;
    isSyncing: boolean;
    lastSync: number;
    pendingActions: number;
    failedActions: number;
    syncProgress: number;
}
/**
 * Call data
 */
export interface CallData {
    callId: string;
    matchId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    callType: 'voice' | 'video';
    timestamp: number;
}
/**
 * Call state
 */
export interface CallState {
    isActive: boolean;
    isConnected: boolean;
    isIncoming: boolean;
    callData?: CallData;
    localStream?: MediaStream;
    remoteStream?: MediaStream;
    screenStream?: MediaStream;
    isMuted: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    isRecording: boolean;
    recordingStartTime?: number;
    callDuration: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
    networkSpeed: number;
    packetLoss: number;
    latency: number;
}
/**
 * Analytics event
 */
export interface AnalyticsEvent {
    name: string;
    properties: EventData;
    timestamp: Date;
    userId?: string;
    sessionId: string;
    platform: 'web' | 'mobile';
    version: string;
}
/**
 * Performance metric
 */
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    tags?: Record<string, string>;
}
/**
 * Form field configuration
 */
export interface FormField {
    name: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'textarea' | 'file';
    label: string;
    placeholder?: string;
    required?: boolean;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        custom?: (value: unknown) => string | null;
    };
    options?: {
        value: string;
        label: string;
    }[];
}
/**
 * Form state
 */
export interface FormState<T = EventData> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
}
/**
 * Deep partial type
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * Required fields type
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
/**
 * Optional fields type
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/**
 * Non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;
/**
 * Array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
/**
 * Function return type
 */
export type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;
/**
 * Function parameters type
 */
export type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;
/**
 * Base store state interface
 */
export interface BaseStoreState {
    isLoading: boolean;
    error: string | null;
    lastUpdated?: Date;
}
/**
 * Paginated data interface
 */
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
/**
 * Filter state interface
 */
export interface FilterState {
    search?: string;
    filters: Record<string, unknown>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
}
//# sourceMappingURL=advanced.d.ts.map