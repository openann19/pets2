/**
 * Shared types and interfaces for Swipe functionality
 * Used across web and mobile platforms
 */
export interface Pet {
    _id: string;
    name: string;
    age: number;
    breed: string;
    photos: string[];
    bio: string;
    distance: number;
    compatibility: number;
    isVerified: boolean;
    tags: string[];
    ownerId: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    preferences?: {
        ageRange: [number, number];
        maxDistance: number;
        breeds: string[];
    };
}
export interface SwipeAction {
    type: 'like' | 'pass' | 'superlike';
    petId: string;
    timestamp: Date;
    userId: string;
}
export interface SwipeResult {
    isMatch: boolean;
    matchId?: string;
    pet: Pet;
    action: SwipeAction;
}
export interface SwipeCardProps {
    pet: Pet;
    onSwipeLeft: (pet: Pet) => void | Promise<void>;
    onSwipeRight: (pet: Pet) => void | Promise<void>;
    onSwipeUp: (pet: Pet) => void | Promise<void>;
    isTopCard?: boolean;
    disabled?: boolean;
    style?: unknown;
}
export interface SwipeGestureConfig {
    threshold: number;
    rotationMultiplier: number;
    velocityThreshold: number;
    directionalOffset: number;
}
export declare const DEFAULT_SWIPE_CONFIG: SwipeGestureConfig;
export interface SwipeAnimationConfig {
    duration: number;
    tension: number;
    friction: number;
    useNativeDriver: boolean;
}
export declare const DEFAULT_ANIMATION_CONFIG: SwipeAnimationConfig;
//# sourceMappingURL=swipe.d.ts.map