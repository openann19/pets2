/**
 * Shared Zod Validation Schemas
 * Rule II.1: Form validation schemas must be defined in packages/core
 * Used for both backend validation and frontend forms
 */
import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    dateOfBirth: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    agreeToTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    phone?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    phone?: string | undefined;
}>, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    phone?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    phone?: string | undefined;
}>;
export declare const petSchema: z.ZodObject<{
    name: z.ZodString;
    species: z.ZodString;
    breed: z.ZodString;
    age: z.ZodNumber;
    gender: z.ZodEnum<["male", "female"]>;
    size: z.ZodString;
    weight: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    personalityTags: z.ZodArray<z.ZodString, "many">;
    intent: z.ZodString;
    healthInfo: z.ZodObject<{
        vaccinated: z.ZodBoolean;
        spayedNeutered: z.ZodBoolean;
        microchipped: z.ZodBoolean;
        specialNeeds: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        specialNeeds?: string | undefined;
    }, {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        specialNeeds?: string | undefined;
    }>;
    location: z.ZodObject<{
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        address: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coordinates: [number, number];
        address?: string | undefined;
    }, {
        coordinates: [number, number];
        address?: string | undefined;
    }>;
    photos: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: "male" | "female";
    size: string;
    personalityTags: string[];
    intent: string;
    healthInfo: {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        specialNeeds?: string | undefined;
    };
    location: {
        coordinates: [number, number];
        address?: string | undefined;
    };
    photos: string[];
    weight?: number | undefined;
    description?: string | undefined;
}, {
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: "male" | "female";
    size: string;
    personalityTags: string[];
    intent: string;
    healthInfo: {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        specialNeeds?: string | undefined;
    };
    location: {
        coordinates: [number, number];
        address?: string | undefined;
    };
    photos: string[];
    weight?: number | undefined;
    description?: string | undefined;
}>;
export declare const userProfileSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    bio: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodObject<{
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coordinates: [number, number];
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
    }, {
        coordinates: [number, number];
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
    }>>;
    preferences: z.ZodOptional<z.ZodObject<{
        ageRange: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        maxDistance: z.ZodNumber;
        species: z.ZodArray<z.ZodString, "many">;
        intents: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        species: string[];
        ageRange: [number, number];
        maxDistance: number;
        intents: string[];
    }, {
        species: string[];
        ageRange: [number, number];
        maxDistance: number;
        intents: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    location?: {
        coordinates: [number, number];
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
    } | undefined;
    bio?: string | undefined;
    preferences?: {
        species: string[];
        ageRange: [number, number];
        maxDistance: number;
        intents: string[];
    } | undefined;
}, {
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    location?: {
        coordinates: [number, number];
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
    } | undefined;
    bio?: string | undefined;
    preferences?: {
        species: string[];
        ageRange: [number, number];
        maxDistance: number;
        intents: string[];
    } | undefined;
}>;
export declare const messageSchema: z.ZodObject<{
    content: z.ZodString;
    messageType: z.ZodDefault<z.ZodEnum<["text", "image", "location", "video"]>>;
    metadata: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        coordinates: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    }, "strip", z.ZodTypeAny, {
        coordinates?: [number, number] | undefined;
        fileName?: string | undefined;
        fileSize?: number | undefined;
    }, {
        coordinates?: [number, number] | undefined;
        fileName?: string | undefined;
        fileSize?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    messageType: "video" | "location" | "text" | "image";
    metadata?: {
        coordinates?: [number, number] | undefined;
        fileName?: string | undefined;
        fileSize?: number | undefined;
    } | undefined;
}, {
    content: string;
    messageType?: "video" | "location" | "text" | "image" | undefined;
    metadata?: {
        coordinates?: [number, number] | undefined;
        fileName?: string | undefined;
        fileSize?: number | undefined;
    } | undefined;
}>;
export declare const swipeSchema: z.ZodObject<{
    petId: z.ZodString;
    action: z.ZodEnum<["like", "pass", "superlike"]>;
}, "strip", z.ZodTypeAny, {
    petId: string;
    action: "like" | "pass" | "superlike";
}, {
    petId: string;
    action: "like" | "pass" | "superlike";
}>;
export declare const searchSchema: z.ZodObject<{
    species: z.ZodOptional<z.ZodString>;
    breed: z.ZodOptional<z.ZodString>;
    ageMin: z.ZodOptional<z.ZodNumber>;
    ageMax: z.ZodOptional<z.ZodNumber>;
    size: z.ZodOptional<z.ZodString>;
    intent: z.ZodOptional<z.ZodString>;
    maxDistance: z.ZodOptional<z.ZodNumber>;
    personalityTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    species?: string | undefined;
    breed?: string | undefined;
    size?: string | undefined;
    personalityTags?: string[] | undefined;
    intent?: string | undefined;
    maxDistance?: number | undefined;
    ageMin?: number | undefined;
    ageMax?: number | undefined;
}, {
    species?: string | undefined;
    breed?: string | undefined;
    size?: string | undefined;
    personalityTags?: string[] | undefined;
    intent?: string | undefined;
    maxDistance?: number | undefined;
    ageMin?: number | undefined;
    ageMax?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PetFormData = z.infer<typeof petSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type SwipeData = z.infer<typeof swipeSchema>;
export type SearchData = z.infer<typeof searchSchema>;
export { createStorySchema as storyCreateSchema, replyStorySchema as storyReplySchema } from './story';
export type { CreateStoryInput, ReplyStoryInput } from './story';
//# sourceMappingURL=index.d.ts.map