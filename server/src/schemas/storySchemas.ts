import { z } from 'zod';

export const createStorySchema = z.object({
    caption: z.string().max(2200).optional().or(z.literal('').transform(() => undefined)),
    duration: z.coerce.number().int().min(1).max(60).optional(),
    mediaType: z.enum(['photo', 'video']).optional(),
});

export const replySchema = z.object({
    message: z.string().min(1).max(500),
});

export default { createStorySchema, replySchema };
