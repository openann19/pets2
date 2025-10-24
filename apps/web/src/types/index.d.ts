/**
 * Comprehensive TypeScript Types for PawfectMatch
 * Replaces all 'any' types with proper type definitions
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface PetPhoto {
    url: string;
    isPrimary?: boolean;
    caption?: string;
    uploadedAt?: string;
}
export interface PetLocation {
    coordinates: [number, number];
    address?: {
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
}
export interface PetOwner {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    premium?: {
        isActive: boolean;
        tier?: 'basic' | 'premium' | 'ultra';
        expiresAt?: string;
    };
    isVerified?: boolean;
}
export interface PetHealthInfo {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped?: boolean;
    lastVetVisit?: string;
    medicalNotes?: string;
}
export interface PetAnalytics {
    views: number;
    likes: number;
    matches: number;
    superLikes: number;
    passes: number;
}
export interface Pet {
    _id: string;
    name: string;
    breed: string;
    age: number;
    size: 'small' | 'medium' | 'large' | 'extra-large';
    species: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'small-animal' | 'other';
    gender: 'male' | 'female';
    photos: PetPhoto[];
    description?: string;
    personalityTags?: string[];
    location?: PetLocation;
    owner?: PetOwner;
    featured?: {
        isFeatured: boolean;
        featuredUntil?: string;
    };
    isVerified?: boolean;
    healthInfo?: PetHealthInfo;
    analytics?: PetAnalytics;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}
export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    dateOfBirth?: string;
    location?: PetLocation;
    bio?: string;
    preferences?: UserPreferences;
    premium?: {
        isActive: boolean;
        tier: 'basic' | 'premium' | 'ultra';
        expiresAt?: string;
        features?: string[];
    };
    isVerified?: boolean;
    isActive?: boolean;
    createdAt: string;
    lastActive: string;
}
export interface UserPreferences {
    ageRange: {
        min: number;
        max: number;
    };
    species: string[];
    breeds: string[];
    sizes: string[];
    genders: string[];
    maxDistance: number;
    showVerifiedOnly?: boolean;
    showPremiumOnly?: boolean;
}
export interface Match {
    _id: string;
    users: User[];
    pets: Pet[];
    createdAt: string;
    lastMessageAt?: string;
    status: 'active' | 'inactive' | 'blocked';
    messagesCount: number;
    isTyping?: boolean;
    unreadCount?: number;
    petName?: string;
    petPhoto?: string;
    isOnline?: boolean;
    lastSeen?: string;
    ownerName?: string;
}
export interface MatchData {
    matchId: string;
    pets: Pet[];
    users: User[];
    createdAt: string;
    isMatch: boolean;
    _id?: string;
}
export interface Message {
    _id: string;
    matchId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'emoji' | 'gift' | 'system';
    metadata?: MessageMetadata;
    attachments?: MessageAttachment[];
    read: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface MessageMetadata {
    emoji?: string;
    giftType?: string;
    imageUrl?: string;
    imageCaption?: string;
    systemAction?: string;
    fileName?: string;
    fileSize?: number;
}
export interface MessageAttachment {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    filename?: string;
    size?: number;
    mimeType?: string;
}
export interface SocketError {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
}
export interface SocketMessageData {
    matchId: string;
    content: string;
    senderId: string;
    timestamp: Date;
    attachments?: MessageAttachment[];
}
export interface SocketNotificationData {
    type: 'match' | 'message' | 'like' | 'superlike' | 'call' | 'system';
    data: Record<string, unknown>;
    timestamp: Date;
    title?: string;
    message?: string;
}
export interface SocketUserStatusData {
    userId: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: Date;
}
export interface SocketCallData {
    callId: string;
    matchId: string;
    type: 'audio' | 'video';
    initiatorId: string;
    participants: string[];
    status: 'ringing' | 'active' | 'ended';
    startedAt?: Date;
    endedAt?: Date;
}
export interface SocketTypingData {
    matchId: string;
    userId: string;
    isTyping: boolean;
}
export interface SocketMatchData {
    matchId: string;
    pets: Pet[];
    users: User[];
    createdAt: string;
}
export interface FilterState {
    species: string[];
    breeds: string[];
    ages: {
        min: number;
        max: number;
    };
    sizes: string[];
    genders: string[];
    colors: string[];
    temperaments: string[];
    energyLevels: string[];
    trainability: string[];
    familyFriendly: string[];
    petFriendly: string[];
    strangerFriendly: string[];
    apartmentFriendly: boolean | null;
    houseSafe: boolean | null;
    yardRequired: boolean | null;
    groomingNeeds: string[];
    exerciseNeeds: string[];
    barkiness: string[];
    healthStatus: string[];
    vaccinationStatus: string[];
    availability: string[];
    locationRadius: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    resultLimit: number;
    premiumFeatures: {
        trending: boolean;
        verified: boolean;
        featured: boolean;
        aiRecommended: boolean;
    };
}
export interface SwipeParams {
    limit: number;
    page: number;
    species?: string;
    breeds?: string;
    ageRange?: string;
    sizes?: string;
    gender?: string;
    temperament?: string;
    energyLevel?: string;
    apartmentFriendly?: string;
    maxDistance?: number;
    sortBy?: string;
    boostFeature?: string;
    verifiedOnly?: string;
}
export interface SubscriptionPlan {
    _id: string;
    name: string;
    tier: 'basic' | 'premium' | 'ultra';
    price: number;
    interval: 'month' | 'year';
    features: string[];
    description: string;
    isPopular?: boolean;
    stripePriceId?: string;
}
export interface SubscriptionStatus {
    isActive: boolean;
    plan?: SubscriptionPlan;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    trialEnd?: string;
}
export interface AdminStats {
    totalUsers: number;
    totalPets: number;
    totalMatches: number;
    totalMessages: number;
    premiumUsers: number;
    verifiedUsers: number;
    activeMatches: number;
    recentUsers: number;
    speciesDistribution: Array<{
        _id: string;
        count: number;
    }>;
    monthlyGrowth: Array<{
        _id: {
            year: number;
            month: number;
        };
        count: number;
    }>;
    systemHealth: SystemHealth;
}
export interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memoryUsage: MemoryUsage;
    responseTime: number;
}
export interface MemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
}
export interface SystemLog {
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    userId?: string;
    ip?: string;
    details?: Record<string, unknown>;
}
export interface NotificationRequest {
    type: string;
    title: string;
    message: string;
    targetUsers?: string[] | 'all';
    targetType?: 'all' | 'premium' | 'verified';
}
export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}
export interface AnimationConfig {
    duration?: number;
    delay?: number;
    ease?: string;
    repeat?: number;
    yoyo?: boolean;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export interface SocketEventHandlers {
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    onError?: (error: SocketError) => void;
    onMessage?: (data: SocketMessageData) => void;
    onNewMatch?: (data: SocketMatchData) => void;
    onUserStatus?: (data: SocketUserStatusData) => void;
    onNotification?: (data: SocketNotificationData) => void;
    onCallIncoming?: (data: SocketCallData) => void;
    onCallAccepted?: (data: SocketCallData) => void;
    onCallRejected?: (data: SocketCallData) => void;
    onCallEnded?: (data: SocketCallData) => void;
    onTypingStart?: (data: SocketTypingData) => void;
    onTypingStop?: (data: SocketTypingData) => void;
}
export interface ComponentProps {
    className?: string;
    children?: React.ReactNode;
}
export interface ButtonProps extends ComponentProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
}
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
    required?: boolean;
    placeholder?: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}
export interface FormData {
    [key: string]: string | number | boolean | string[] | undefined;
}
export interface SearchFilters {
    query?: string;
    species?: string[];
    breeds?: string[];
    ageRange?: {
        min: number;
        max: number;
    };
    size?: string[];
    gender?: string[];
    location?: {
        coordinates: [number, number];
        radius: number;
    };
    sortBy?: 'relevance' | 'distance' | 'age' | 'newest';
    premiumOnly?: boolean;
    verifiedOnly?: boolean;
}
export interface DiscoveryResult {
    pets: Pet[];
    totalCount: number;
    hasMore: boolean;
    nextPage?: number;
}
export interface UserAnalytics {
    profileViews: number;
    petViews: number;
    likesReceived: number;
    matches: number;
    messagesSent: number;
    messagesReceived: number;
    timeSpent: number;
    lastActive: string;
}
export interface PetAnalyticsData {
    views: number;
    likes: number;
    matches: number;
    superLikes: number;
    passes: number;
    viewsByDay: Array<{
        date: string;
        count: number;
    }>;
    likesByDay: Array<{
        date: string;
        count: number;
    }>;
}
export interface PremiumFeature {
    id: string;
    name: string;
    description: string;
    tier: 'basic' | 'premium' | 'ultra';
    isEnabled: boolean;
    usage?: {
        current: number;
        limit: number;
        resetDate: string;
    };
}
export interface BoostFeature {
    type: 'profile' | 'pet' | 'discovery';
    duration: number;
    multiplier: number;
    cost: number;
    isActive: boolean;
    expiresAt?: string;
}
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
}
export interface GeocodingResult {
    address: string;
    coordinates: [number, number];
    confidence: number;
}
export interface FileUpload {
    file: File;
    type: 'image' | 'video' | 'document';
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    url?: string;
    error?: string;
}
export interface ImageUpload extends FileUpload {
    type: 'image';
    thumbnail?: string;
    dimensions?: {
        width: number;
        height: number;
    };
}
export interface Notification {
    _id: string;
    userId: string;
    type: 'match' | 'message' | 'like' | 'superlike' | 'system' | 'premium';
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: string;
    expiresAt?: string;
}
export interface NotificationSettings {
    email: {
        matches: boolean;
        messages: boolean;
        likes: boolean;
        system: boolean;
    };
    push: {
        matches: boolean;
        messages: boolean;
        likes: boolean;
        system: boolean;
    };
    inApp: {
        matches: boolean;
        messages: boolean;
        likes: boolean;
        system: boolean;
    };
}
export interface ChatRoom {
    _id: string;
    matchId: string;
    participants: string[];
    lastMessage?: Message;
    unreadCount: number;
    isTyping: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface TypingIndicator {
    userId: string;
    isTyping: boolean;
    timestamp: Date;
}
export interface Report {
    _id: string;
    reporterId: string;
    reportedUserId?: string;
    reportedPetId?: string;
    reportedMessageId?: string;
    reason: 'inappropriate' | 'spam' | 'harassment' | 'fake' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}
export interface Block {
    _id: string;
    blockerId: string;
    blockedUserId: string;
    reason?: string;
    createdAt: string;
}
export interface VerificationRequest {
    _id: string;
    userId: string;
    type: 'identity' | 'pet' | 'phone' | 'email';
    status: 'pending' | 'approved' | 'rejected';
    documents: Array<{
        type: string;
        url: string;
        uploadedAt: string;
    }>;
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
}
export interface UserRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
}
export interface PetCreationData {
    name: string;
    species: string;
    breed: string;
    age: number;
    size: string;
    gender: string;
    description?: string;
    photos?: PetPhoto[];
}
export interface BioGenerationData {
    petId: string;
    species: string;
    breed: string;
    age: number;
    personality?: string[];
}
export interface CompatibilityOptions {
    includePersonality?: boolean;
    includeHealth?: boolean;
    includeLifestyle?: boolean;
}
export interface BehaviorAnalysisData {
    observations: string[];
    environment: string;
    triggers?: string[];
    duration?: number;
}
//# sourceMappingURL=index.d.ts.map