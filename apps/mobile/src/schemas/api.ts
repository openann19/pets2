/**
 * Zod Schemas for API Runtime Validation
 *
 * Provides runtime validation for all API requests and responses.
 * These schemas ensure type safety at runtime, not just compile time.
 */

import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  pages: z.number().int().nonnegative(),
});

export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
});

// ============================================================================
// User Schemas
// ============================================================================

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    ageRange: z.object({
      min: z.number().int().nonnegative(),
      max: z.number().int().nonnegative(),
    }),
    breedPreferences: z.array(z.string()),
    distance: z.number().positive(),
    showMeInDiscover: z.boolean(),
    notifications: z.object({
      newMatch: z.boolean(),
      message: z.boolean(),
      like: z.boolean(),
    }),
  }),
  createdAt: z.string().datetime(),
});

export const UpdateUserProfileSchema = UserSchema.partial();

// ============================================================================
// Pet Schemas
// ============================================================================

export const PetSchema = z.object({
  _id: z.string(),
  name: z.string(),
  type: z.enum(['dog', 'cat', 'other']),
  breed: z.string().optional(),
  age: z.number().int().positive(),
  photos: z.array(z.string().url()),
  bio: z.string(),
  ownerId: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const CreatePetSchema = PetSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const UpdatePetSchema = PetSchema.partial();

// ============================================================================
// Match Schemas
// ============================================================================

export const MatchSchema = z.object({
  _id: z.string(),
  participants: z.array(z.string()),
  messages: z.array(z.string()).optional(),
  lastMessage: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateMatchSchema = z.object({
  petId: z.string(),
  targetPetId: z.string(),
});

// ============================================================================
// Message Schemas
// ============================================================================

export const MessageSchema = z.object({
  _id: z.string(),
  matchId: z.string(),
  author: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  replyTo: z
    .object({
      _id: z.string(),
      author: z.string().optional(),
      text: z.string().optional(),
    })
    .optional(),
});

// Chat Reaction Schemas
export const ReactionTypeSchema = z.enum(['like', 'love', 'laugh', 'wow', 'sad', 'angry']);
export const MessageReactionSchema = z.object({
  type: ReactionTypeSchema,
  userId: z.string(),
  createdAt: z.string().datetime(),
});
export const SendReactionRequestSchema = z.object({
  messageId: z.string(),
  reactionType: ReactionTypeSchema,
});
export const SendReactionResponseSchema = z.object({
  success: z.boolean(),
  updatedMessage: MessageSchema.extend({
    reactions: z.array(MessageReactionSchema).optional(),
  }),
  error: z.string().optional(),
});

// Chat Attachment Schemas
export const AttachmentTypeSchema = z.enum(['image', 'video', 'document', 'audio']);
export const AttachmentSchema = z.object({
  _id: z.string(),
  url: z.string().url(),
  type: AttachmentTypeSchema,
  fileName: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});
export const SendAttachmentRequestSchema = z.object({
  conversationId: z.string(),
  attachmentUrl: z.string().url(),
  type: AttachmentTypeSchema,
  fileName: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});
export const SendAttachmentResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string(),
  attachmentId: z.string(),
  url: z.string().url(),
  type: AttachmentTypeSchema,
  fileSize: z.number().int().positive().optional(),
  error: z.string().optional(),
});

// Chat Voice Note Schemas
export const SendVoiceNoteRequestSchema = z.object({
  conversationId: z.string(),
  audioUrl: z.string().url(),
  duration: z.number().int().positive(), // Duration in seconds
  waveform: z.array(z.number()).optional(), // Waveform data for visualization
  transcription: z.string().optional(),
});
export const SendVoiceNoteResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string(),
  audioUrl: z.string().url(),
  duration: z.number().int().positive(),
  transcription: z.string().optional(),
  error: z.string().optional(),
});

// ============================================================================
// AI Schemas
// ============================================================================

export const GenerateBioRequestSchema = z.object({
  petName: z.string().min(1).max(50),
  keywords: z.array(z.string()).min(1),
  tone: z.enum(['playful', 'professional', 'casual', 'romantic', 'funny']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  petType: z.string().optional(),
  age: z.number().int().positive().optional(),
  breed: z.string().optional(),
});

export const GenerateBioResponseSchema = z.object({
  bio: z.string(),
  keywords: z.array(z.string()),
  sentiment: z.object({
    score: z.number().min(0).max(1),
    label: z.string(),
  }),
  matchScore: z.number().int().min(0).max(100),
});

export const AnalyzePhotosRequestSchema = z.object({
  photos: z.array(z.string().url()).min(1),
});

export const BreedAnalysisSchema = z.object({
  primary_breed: z.string(),
  confidence: z.number().min(0).max(1),
  secondary_breeds: z
    .array(
      z.object({
        breed: z.string(),
        confidence: z.number().min(0).max(1),
      }),
    )
    .optional(),
});

export const HealthAssessmentSchema = z.object({
  age_estimate: z.number().int().positive(),
  health_score: z.number().min(0).max(1),
  recommendations: z.array(z.string()),
});

export const PhotoQualitySchema = z.object({
  overall_score: z.number().min(0).max(1),
  lighting_score: z.number().min(0).max(1),
  composition_score: z.number().min(0).max(1),
  clarity_score: z.number().min(0).max(1),
});

export const AnalyzePhotosResponseSchema = z.object({
  breed_analysis: BreedAnalysisSchema,
  health_assessment: HealthAssessmentSchema,
  photo_quality: PhotoQualitySchema,
  matchability_score: z.number().min(0).max(100),
  ai_insights: z.array(z.string()),
});

export const AnalyzeCompatibilityRequestSchema = z.object({
  pet1Id: z.string(),
  pet2Id: z.string(),
});

export const CompatibilityBreakdownSchema = z.object({
  personality_compatibility: z.number().min(0).max(100),
  lifestyle_compatibility: z.number().min(0).max(100),
  activity_compatibility: z.number().min(0).max(100),
  social_compatibility: z.number().min(0).max(100),
  environment_compatibility: z.number().min(0).max(100),
});

export const CompatibilityRecommendationsSchema = z.object({
  meeting_suggestions: z.array(z.string()),
  activity_recommendations: z.array(z.string()),
  supervision_requirements: z.array(z.string()),
  success_probability: z.number().min(0).max(100),
});

export const AnalyzeCompatibilityResponseSchema = z.object({
  compatibility_score: z.number().min(0).max(100),
  ai_analysis: z.string(),
  breakdown: CompatibilityBreakdownSchema,
  recommendations: CompatibilityRecommendationsSchema,
});

// ============================================================================
// GDPR Schemas
// ============================================================================

export const DeleteAccountRequestSchema = z.object({
  password: z.string().min(1),
  reason: z.string().optional(),
  feedback: z.string().optional(),
});

export const DeleteAccountResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  deletionId: z.string().optional(),
  gracePeriodEndsAt: z.string().datetime().optional(),
  canCancel: z.boolean().optional(),
  error: z.string().optional(),
});

export const AccountStatusResponseSchema = z.object({
  success: z.boolean(),
  status: z.enum(['not-found', 'pending', 'processing', 'completed']),
  scheduledDeletionDate: z.string().datetime().optional(),
  daysRemaining: z.number().int().nonnegative().optional(),
  canCancel: z.boolean().optional(),
  requestId: z.string().optional(),
});

export const DataExportRequestSchema = z.object({
  format: z.enum(['json', 'csv']).optional(),
  includeMessages: z.boolean().optional(),
  includeMatches: z.boolean().optional(),
  includeProfileData: z.boolean().optional(),
  includePreferences: z.boolean().optional(),
});

export const DataExportResponseSchema = z.object({
  success: z.boolean(),
  exportId: z.string().optional(),
  url: z.string().url().optional(),
  estimatedTime: z.string().optional(),
  estimatedCompletion: z.string().datetime().optional(),
  message: z.string().optional(),
  format: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  exportData: z
    .object({
      profile: UserSchema.optional(),
      pets: z.array(PetSchema).optional(),
      matches: z.array(MatchSchema).optional(),
      messages: z.array(MessageSchema).optional(),
      preferences: z
        .object({
          ageRange: z.object({
            min: z.number().int().nonnegative(),
            max: z.number().int().nonnegative(),
          }),
          breedPreferences: z.array(z.string()),
          distance: z.number().positive(),
          showMeInDiscover: z.boolean(),
          notifications: z.object({
            newMatch: z.boolean(),
            message: z.boolean(),
            like: z.boolean(),
          }),
        })
        .optional(),
    })
    .optional(),
  error: z.string().optional(),
});

export const ConfirmDeletionRequestSchema = z.object({
  token: z.string().min(1),
});

export const ConfirmDeletionResponseSchema = z.object({
  success: z.boolean(),
  deletedAt: z.string().datetime().optional(),
  message: z.string().optional(),
});

// ============================================================================
// Community Schemas
// ============================================================================

export const CommunityCommentSchema = z.object({
  _id: z.string(),
  author: z.object({
    _id: z.string(),
    name: z.string(),
    avatar: z.string().url(),
  }),
  content: z.string(),
  createdAt: z.string().datetime(),
  postId: z.string(),
});

export const CommunityPostSchema = z.object({
  _id: z.string(),
  author: z.object({
    _id: z.string(),
    name: z.string(),
    avatar: z.string().url(),
  }),
  content: z.string(),
  images: z.array(z.string().url()),
  likes: z.number().int().nonnegative(),
  liked: z.boolean(),
  comments: z.array(CommunityCommentSchema),
  createdAt: z.string().datetime(),
  packId: z.string().optional(),
  packName: z.string().optional(),
  type: z.enum(['post', 'activity']),
  activityDetails: z
    .object({
      date: z.string().datetime(),
      location: z.string(),
      maxAttendees: z.number().int().positive(),
      currentAttendees: z.number().int().nonnegative(),
      attending: z.boolean(),
    })
    .optional(),
});

export const CreatePostRequestSchema = z.object({
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).optional(),
  packId: z.string().optional(),
  type: z.enum(['post', 'activity']).optional(),
  activityDetails: z
    .object({
      date: z.string().datetime(),
      location: z.string(),
      maxAttendees: z.number().int().positive(),
    })
    .optional(),
});

export const CreateCommentRequestSchema = z.object({
  content: z.string().min(1).max(1000),
});

// ============================================================================
// Premium Schemas
// ============================================================================

export const PremiumFeaturesResponseSchema = z.object({
  features: z.record(z.string(), z.boolean()),
});

export const SubscribeToPremiumRequestSchema = z.object({
  plan: z.enum(['basic', 'premium', 'gold']),
  paymentMethodId: z.string(),
});

export const SubscribeToPremiumResponseSchema = z.object({
  success: z.boolean(),
  subscriptionId: z.string(),
});

export const CurrentSubscriptionResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  plan: z.string(),
  currentPeriodEnd: z.string().datetime(),
});

// ============================================================================
// Presign Schemas
// ============================================================================

export const PresignRequestSchema = z.object({
  contentType: z.string(),
});

export const PresignResponseSchema = z.object({
  key: z.string(),
  url: z.string().url(),
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safely parse a response with a schema
 */
export function parseResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Assert a value matches a schema (throws on error)
 */
export function assertSchema<T>(schema: z.ZodType<T>, data: unknown): asserts data is T {
  schema.parse(data);
}
