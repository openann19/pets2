/**
 * Shared Zod Validation Schemas
 * Rule II.1: Form validation schemas must be defined in packages/core
 * Used for both backend validation and frontend forms
 */
import { z } from 'zod';
// Authentication Schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});
export const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email address'),
    dateOfBirth: z.string().refine((date) => {
        const birthDate = new Date(date);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= 18 && age <= 120;
    }, 'Must be between 18 and 120 years old'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Pet Profile Schema
export const petSchema = z.object({
    name: z.string().min(1, 'Pet name is required').max(50),
    species: z.string().min(1, 'Species is required'),
    breed: z.string().min(1, 'Breed is required').max(100),
    age: z.number().min(0, 'Age must be positive').max(30),
    gender: z.enum(['male', 'female']),
    size: z.string().min(1, 'Size is required'),
    weight: z.number().min(0).optional(),
    description: z.string().max(500).optional(),
    personalityTags: z.array(z.string()).min(1, 'Select at least one personality trait'),
    intent: z.string().min(1, 'Intent is required'),
    healthInfo: z.object({
        vaccinated: z.boolean(),
        spayedNeutered: z.boolean(),
        microchipped: z.boolean(),
        specialNeeds: z.string().optional()
    }),
    location: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
        address: z.string().optional()
    }),
    photos: z.array(z.string()).min(1, 'At least one photo is required').max(10)
});
// User Profile Schema
export const userProfileSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    bio: z.string().max(500).optional(),
    phone: z.string().optional(),
    location: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional()
    }).optional(),
    preferences: z.object({
        ageRange: z.tuple([z.number(), z.number()]),
        maxDistance: z.number().min(1).max(500),
        species: z.array(z.string()),
        intents: z.array(z.string())
    }).optional()
});
// Message Schema
export const messageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty').max(2000),
    messageType: z.enum(['text', 'image', 'location', 'video']).default('text'),
    metadata: z.object({
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        coordinates: z.tuple([z.number(), z.number()]).optional()
    }).optional()
});
// Swipe Action Schema
export const swipeSchema = z.object({
    petId: z.string().min(1, 'Pet ID is required'),
    action: z.enum(['like', 'pass', 'superlike'])
});
// Search/Filter Schema
export const searchSchema = z.object({
    species: z.string().optional(),
    breed: z.string().optional(),
    ageMin: z.number().min(0).optional(),
    ageMax: z.number().max(30).optional(),
    size: z.string().optional(),
    intent: z.string().optional(),
    maxDistance: z.number().min(1).max(500).optional(),
    personalityTags: z.array(z.string()).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
});
//# sourceMappingURL=index.js.map