import { z } from 'zod';
// User registration schema
export const userRegistrationSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
    dateOfBirth: z.string().refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18;
    }, 'You must be at least 18 years old'),
    phone: z.string().optional(),
    location: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional()
    }).optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
// User login schema
export const userLoginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
});
// Pet creation schema
export const petCreationSchema = z.object({
    name: z.string().min(1, 'Pet name is required').max(50, 'Pet name must be less than 50 characters'),
    species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other'], {
        errorMap: () => ({ message: 'Please select a valid species' })
    }),
    breed: z.string().min(1, 'Breed is required').max(100, 'Breed must be less than 100 characters'),
    age: z.number().min(0, 'Age must be positive').max(30, 'Age must be realistic'),
    gender: z.enum(['male', 'female', 'unknown'], {
        errorMap: () => ({ message: 'Please select a valid gender' })
    }),
    size: z.enum(['tiny', 'small', 'medium', 'large', 'extra-large'], {
        errorMap: () => ({ message: 'Please select a valid size' })
    }),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    personalityTags: z.array(z.string()).max(10, 'Maximum 10 personality tags allowed').optional(),
    intent: z.enum(['playdate', 'mating', 'adoption', 'all'], {
        errorMap: () => ({ message: 'Please select a valid intent' })
    }),
    healthInfo: z.object({
        isVaccinated: z.boolean().optional(),
        isSpayedNeutered: z.boolean().optional(),
        isMicrochipped: z.boolean().optional(),
        medicalConditions: z.string().max(500, 'Medical conditions must be less than 500 characters').optional(),
        specialNeeds: z.string().max(500, 'Special needs must be less than 500 characters').optional()
    }).optional(),
    photos: z.array(z.string().url('Please provide valid photo URLs')).max(10, 'Maximum 10 photos allowed').optional()
});
// Pet update schema (partial)
export const petUpdateSchema = petCreationSchema.partial();
// User preferences schema
export const userPreferencesSchema = z.object({
    distanceRadius: z.number().min(1, 'Distance must be at least 1 mile').max(100, 'Distance must be less than 100 miles'),
    ageRange: z.object({
        min: z.number().min(0, 'Minimum age must be positive').max(30, 'Minimum age must be realistic'),
        max: z.number().min(0, 'Maximum age must be positive').max(30, 'Maximum age must be realistic')
    }).refine((data) => data.min <= data.max, {
        message: 'Minimum age must be less than or equal to maximum age',
        path: ['max']
    }),
    species: z.array(z.enum(['dog', 'cat', 'bird', 'rabbit', 'other'])).min(1, 'Please select at least one species'),
    sizes: z.array(z.enum(['tiny', 'small', 'medium', 'large', 'extra-large'])).min(1, 'Please select at least one size'),
    genders: z.array(z.enum(['male', 'female', 'unknown'])).min(1, 'Please select at least one gender'),
    intents: z.array(z.enum(['playdate', 'mating', 'adoption', 'all'])).min(1, 'Please select at least one intent')
});
// Message schema
export const messageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message must be less than 2000 characters'),
    attachments: z.array(z.object({
        type: z.enum(['image', 'video', 'audio', 'file']),
        url: z.string().url('Please provide valid attachment URL'),
        filename: z.string().optional(),
        size: z.number().optional()
    })).max(5, 'Maximum 5 attachments allowed').optional()
});
// AI bio generation schema
export const aiBioGenerationSchema = z.object({
    petId: z.string().min(1, 'Pet ID is required'),
    tone: z.enum(['playful', 'professional', 'casual', 'romantic', 'funny'], {
        errorMap: () => ({ message: 'Please select a valid tone' })
    }),
    includePersonality: z.boolean().default(true),
    includeHealthInfo: z.boolean().default(false),
    maxLength: z.number().min(50, 'Minimum 50 characters').max(500, 'Maximum 500 characters').default(200)
});
// AI photo analysis schema
export const aiPhotoAnalysisSchema = z.object({
    photoUrl: z.string().url('Please provide a valid photo URL'),
    analysisType: z.enum(['breed', 'health', 'emotion', 'all'], {
        errorMap: () => ({ message: 'Please select a valid analysis type' })
    }).default('all')
});
// AI compatibility analysis schema
export const aiCompatibilitySchema = z.object({
    pet1Id: z.string().min(1, 'First pet ID is required'),
    pet2Id: z.string().min(1, 'Second pet ID is required'),
    analysisDepth: z.enum(['basic', 'detailed', 'comprehensive'], {
        errorMap: () => ({ message: 'Please select a valid analysis depth' })
    }).default('detailed')
});
// Password reset schema
export const passwordResetSchema = z.object({
    email: z.string().email('Please enter a valid email address')
});
// New password schema
export const newPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
// Contact form schema
export const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Please enter a valid email address'),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
    category: z.enum(['general', 'technical', 'billing', 'report'], {
        errorMap: () => ({ message: 'Please select a valid category' })
    }).default('general')
});
// Feedback schema
export const feedbackSchema = z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    category: z.enum(['app', 'matching', 'chat', 'performance', 'other'], {
        errorMap: () => ({ message: 'Please select a valid category' })
    }),
    message: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback must be less than 1000 characters'),
    userId: z.string().optional(),
    petId: z.string().optional()
});
//# sourceMappingURL=validation.js.map