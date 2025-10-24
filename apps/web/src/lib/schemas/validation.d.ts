import { z } from 'zod';
export declare const userRegistrationSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    dateOfBirth: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const userLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const petCreationSchema: z.ZodObject<{
    name: z.ZodString;
    species: z.ZodEnum<{
        other: "other";
        dog: "dog";
        cat: "cat";
        bird: "bird";
        rabbit: "rabbit";
    }>;
    breed: z.ZodString;
    age: z.ZodNumber;
    gender: z.ZodEnum<{
        unknown: "unknown";
        male: "male";
        female: "female";
    }>;
    size: z.ZodEnum<{
        small: "small";
        large: "large";
        medium: "medium";
        "extra-large": "extra-large";
        tiny: "tiny";
    }>;
    description: z.ZodOptional<z.ZodString>;
    personalityTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    intent: z.ZodEnum<{
        all: "all";
        playdate: "playdate";
        mating: "mating";
        adoption: "adoption";
    }>;
    healthInfo: z.ZodOptional<z.ZodObject<{
        isVaccinated: z.ZodOptional<z.ZodBoolean>;
        isSpayedNeutered: z.ZodOptional<z.ZodBoolean>;
        isMicrochipped: z.ZodOptional<z.ZodBoolean>;
        medicalConditions: z.ZodOptional<z.ZodString>;
        specialNeeds: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    photos: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const petUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    species: z.ZodOptional<z.ZodEnum<{
        other: "other";
        dog: "dog";
        cat: "cat";
        bird: "bird";
        rabbit: "rabbit";
    }>>;
    breed: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodNumber>;
    gender: z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        male: "male";
        female: "female";
    }>>;
    size: z.ZodOptional<z.ZodEnum<{
        small: "small";
        large: "large";
        medium: "medium";
        "extra-large": "extra-large";
        tiny: "tiny";
    }>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    personalityTags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    intent: z.ZodOptional<z.ZodEnum<{
        all: "all";
        playdate: "playdate";
        mating: "mating";
        adoption: "adoption";
    }>>;
    healthInfo: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        isVaccinated: z.ZodOptional<z.ZodBoolean>;
        isSpayedNeutered: z.ZodOptional<z.ZodBoolean>;
        isMicrochipped: z.ZodOptional<z.ZodBoolean>;
        medicalConditions: z.ZodOptional<z.ZodString>;
        specialNeeds: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    photos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const userPreferencesSchema: z.ZodObject<{
    distanceRadius: z.ZodNumber;
    ageRange: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strip>;
    species: z.ZodArray<z.ZodEnum<{
        other: "other";
        dog: "dog";
        cat: "cat";
        bird: "bird";
        rabbit: "rabbit";
    }>>;
    sizes: z.ZodArray<z.ZodEnum<{
        small: "small";
        large: "large";
        medium: "medium";
        "extra-large": "extra-large";
        tiny: "tiny";
    }>>;
    genders: z.ZodArray<z.ZodEnum<{
        unknown: "unknown";
        male: "male";
        female: "female";
    }>>;
    intents: z.ZodArray<z.ZodEnum<{
        all: "all";
        playdate: "playdate";
        mating: "mating";
        adoption: "adoption";
    }>>;
}, z.core.$strip>;
export declare const messageSchema: z.ZodObject<{
    content: z.ZodString;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            audio: "audio";
            video: "video";
            image: "image";
            file: "file";
        }>;
        url: z.ZodString;
        filename: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const aiBioGenerationSchema: z.ZodObject<{
    petId: z.ZodString;
    tone: z.ZodEnum<{
        playful: "playful";
        romantic: "romantic";
        funny: "funny";
        professional: "professional";
        casual: "casual";
    }>;
    includePersonality: z.ZodDefault<z.ZodBoolean>;
    includeHealthInfo: z.ZodDefault<z.ZodBoolean>;
    maxLength: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const aiPhotoAnalysisSchema: z.ZodObject<{
    photoUrl: z.ZodString;
    analysisType: z.ZodDefault<z.ZodEnum<{
        all: "all";
        breed: "breed";
        health: "health";
        emotion: "emotion";
    }>>;
}, z.core.$strip>;
export declare const aiCompatibilitySchema: z.ZodObject<{
    pet1Id: z.ZodString;
    pet2Id: z.ZodString;
    analysisDepth: z.ZodDefault<z.ZodEnum<{
        basic: "basic";
        detailed: "detailed";
        comprehensive: "comprehensive";
    }>>;
}, z.core.$strip>;
export declare const passwordResetSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const newPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const contactFormSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    subject: z.ZodString;
    message: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<{
        general: "general";
        report: "report";
        technical: "technical";
        billing: "billing";
    }>>;
}, z.core.$strip>;
export declare const feedbackSchema: z.ZodObject<{
    rating: z.ZodNumber;
    category: z.ZodEnum<{
        other: "other";
        chat: "chat";
        performance: "performance";
        app: "app";
        matching: "matching";
    }>;
    message: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    petId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type UserLoginData = z.infer<typeof userLoginSchema>;
export type PetCreationData = z.infer<typeof petCreationSchema>;
export type PetUpdateData = z.infer<typeof petUpdateSchema>;
export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type AIBioGenerationData = z.infer<typeof aiBioGenerationSchema>;
export type AIPhotoAnalysisData = z.infer<typeof aiPhotoAnalysisSchema>;
export type AICompatibilityData = z.infer<typeof aiCompatibilitySchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type NewPasswordData = z.infer<typeof newPasswordSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type FeedbackData = z.infer<typeof feedbackSchema>;
//# sourceMappingURL=validation.d.ts.map