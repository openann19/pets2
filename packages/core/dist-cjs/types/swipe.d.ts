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
    matchId?: string | undefined;
    pet: Pet;
    action: SwipeAction;
}
export interface SwipeCardStyle {
    card?: {
        position?: 'absolute' | 'relative';
        width?: number | string;
        height?: number | string;
        borderRadius?: number;
        backgroundColor?: string;
        shadowColor?: string;
        shadowOffset?: {
            width: number;
            height: number;
        };
        shadowOpacity?: number;
        shadowRadius?: number;
        elevation?: number;
    };
    photoContainer?: {
        flex?: number;
        borderRadius?: number;
        overflow?: 'hidden' | 'visible';
        position?: 'absolute' | 'relative';
    };
    photo?: {
        width?: number | string;
        height?: number | string;
    };
    infoContainer?: {
        flex?: number;
        justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
        padding?: number;
    };
    name?: {
        fontSize?: number;
        fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
        color?: string;
        marginRight?: number;
    };
    age?: {
        fontSize?: number;
        fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
        color?: string;
    };
    breed?: {
        fontSize?: number;
        color?: string;
        marginBottom?: number;
    };
    bio?: {
        fontSize?: number;
        color?: string;
        lineHeight?: number;
    };
    [key: string]: unknown;
}
export interface SwipeCardProps {
    pet: Pet;
    onSwipeLeft: (pet: Pet) => void | Promise<void>;
    onSwipeRight: (pet: Pet) => void | Promise<void>;
    onSwipeUp: (pet: Pet) => void | Promise<void>;
    isTopCard?: boolean;
    disabled?: boolean;
    style?: SwipeCardStyle;
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
