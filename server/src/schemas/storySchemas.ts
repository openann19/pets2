import { z } from 'zod';

// Story creation schema with validation
export const createStorySchema = z.object({
  caption: z.string().max(2200).optional().or(z.literal('').transform(() => undefined)),
  duration: z.coerce.number().int().min(1).max(60).optional(),
  mediaType: z.enum(['photo', 'video']).optional(),
});

// Story reply schema
export const replySchema = z.object({
  message: z.string().min(1).max(500),
});

// Type inference from schemas
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type ReplyInput = z.infer<typeof replySchema>;

// Validation helper functions
export const validateCreateStory = (data: unknown): CreateStoryInput => {
  return createStorySchema.parse(data);
};

export const validateReply = (data: unknown): ReplyInput => {
  return replySchema.parse(data);
};

// Safe validation that returns null on error
export const safeValidateCreateStory = (data: unknown): CreateStoryInput | null => {
  try {
    return createStorySchema.parse(data);
  } catch {
    return null;
  }
};

export const safeValidateReply = (data: unknown): ReplyInput | null => {
  try {
    return replySchema.parse(data);
  } catch {
    return null;
  }
};
