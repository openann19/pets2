"use strict";
/**
 * Shared Zod Validation Schemas
 * Rule II.1: Form validation schemas must be defined in packages/core
 * Used for both backend validation and frontend forms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyReplySchema = exports.storyCreateSchema = exports.searchSchema = exports.swipeSchema = exports.messageSchema = exports.userProfileSchema = exports.petSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Authentication Schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters')
});
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters').max(50),
    email: zod_1.z.string().email('Invalid email address'),
    dateOfBirth: zod_1.z.string().refine((date) => {
        const birthDate = new Date(date);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= 18 && age <= 120;
    }, 'Must be between 18 and 120 years old'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: zod_1.z.string(),
    phone: zod_1.z.string().optional(),
    agreeToTerms: zod_1.z.boolean().refine(val => val, 'You must agree to the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Pet Profile Schema
exports.petSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Pet name is required').max(50),
    species: zod_1.z.string().min(1, 'Species is required'),
    breed: zod_1.z.string().min(1, 'Breed is required').max(100),
    age: zod_1.z.number().min(0, 'Age must be positive').max(30),
    gender: zod_1.z.enum(['male', 'female']),
    size: zod_1.z.string().min(1, 'Size is required'),
    weight: zod_1.z.number().min(0).optional(),
    description: zod_1.z.string().max(500).optional(),
    personalityTags: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one personality trait'),
    intent: zod_1.z.string().min(1, 'Intent is required'),
    healthInfo: zod_1.z.object({
        vaccinated: zod_1.z.boolean(),
        spayedNeutered: zod_1.z.boolean(),
        microchipped: zod_1.z.boolean(),
        specialNeeds: zod_1.z.string().optional()
    }),
    location: zod_1.z.object({
        coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
        address: zod_1.z.string().optional()
    }),
    photos: zod_1.z.array(zod_1.z.string()).min(1, 'At least one photo is required').max(10)
});
// User Profile Schema
exports.userProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50),
    lastName: zod_1.z.string().min(2).max(50),
    bio: zod_1.z.string().max(500).optional(),
    phone: zod_1.z.string().optional(),
    location: zod_1.z.object({
        coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional()
    }).optional(),
    preferences: zod_1.z.object({
        ageRange: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
        maxDistance: zod_1.z.number().min(1).max(500),
        species: zod_1.z.array(zod_1.z.string()),
        intents: zod_1.z.array(zod_1.z.string())
    }).optional()
});
// Message Schema
exports.messageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message cannot be empty').max(2000),
    messageType: zod_1.z.enum(['text', 'image', 'location', 'video']).default('text'),
    metadata: zod_1.z.object({
        fileName: zod_1.z.string().optional(),
        fileSize: zod_1.z.number().optional(),
        coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional()
    }).optional()
});
// Swipe Action Schema
exports.swipeSchema = zod_1.z.object({
    petId: zod_1.z.string().min(1, 'Pet ID is required'),
    action: zod_1.z.enum(['like', 'pass', 'superlike'])
});
// Search/Filter Schema
exports.searchSchema = zod_1.z.object({
    species: zod_1.z.string().optional(),
    breed: zod_1.z.string().optional(),
    ageMin: zod_1.z.number().min(0).optional(),
    ageMax: zod_1.z.number().max(30).optional(),
    size: zod_1.z.string().optional(),
    intent: zod_1.z.string().optional(),
    maxDistance: zod_1.z.number().min(1).max(500).optional(),
    personalityTags: zod_1.z.array(zod_1.z.string()).optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20)
});
// Stories
var story_1 = require("./story");
Object.defineProperty(exports, "storyCreateSchema", { enumerable: true, get: function () { return story_1.createStorySchema; } });
Object.defineProperty(exports, "storyReplySchema", { enumerable: true, get: function () { return story_1.replyStorySchema; } });
