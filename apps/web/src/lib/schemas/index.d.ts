/**
 * Shared Zod Validation Schemas
 * Rule II.1: Form validation schemas must be defined in packages/core
 * Used for both backend validation and frontend forms
 */
import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    dateOfBirth: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    agreeToTerms: z.ZodBoolean;
}, z.core.$strip>;
export declare const petSchema: z.ZodObject<{
    name: z.ZodString;
    species: z.ZodString;
    breed: z.ZodString;
    age: z.ZodNumber;
    gender: z.ZodEnum<{
        male: "male";
        female: "female";
    }>;
    size: z.ZodString;
    weight: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    personalityTags: z.ZodArray<z.ZodString>;
    intent: z.ZodString;
    healthInfo: z.ZodObject<{
        vaccinated: z.ZodBoolean;
        spayedNeutered: z.ZodBoolean;
        microchipped: z.ZodBoolean;
        specialNeeds: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    location: z.ZodObject<{
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        address: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    photos: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
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
    }, z.core.$strip>>;
    preferences: z.ZodOptional<z.ZodObject<{
        ageRange: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        maxDistance: z.ZodNumber;
        species: z.ZodArray<z.ZodString>;
        intents: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const messageSchema: z.ZodObject<{
    content: z.ZodString;
    messageType: z.ZodDefault<z.ZodEnum<{
        video: "video";
        image: "image";
        text: "text";
        location: "location";
    }>>;
    metadata: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        coordinates: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const swipeSchema: z.ZodObject<{
    petId: z.ZodString;
    action: z.ZodEnum<{
        like: "like";
        superlike: "superlike";
        pass: "pass";
    }>;
}, z.core.$strip>;
export declare const searchSchema: z.ZodObject<{
    species: z.ZodOptional<z.ZodString>;
    breed: z.ZodOptional<z.ZodString>;
    ageMin: z.ZodOptional<z.ZodNumber>;
    ageMax: z.ZodOptional<z.ZodNumber>;
    size: z.ZodOptional<z.ZodString>;
    intent: z.ZodOptional<z.ZodString>;
    maxDistance: z.ZodOptional<z.ZodNumber>;
    personalityTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PetFormData = z.infer<typeof petSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type SwipeData = z.infer<typeof swipeSchema>;
export type SearchData = z.infer<typeof searchSchema>;
//# sourceMappingURL=index.d.ts.map