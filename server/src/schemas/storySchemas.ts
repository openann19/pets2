const { z } = require('zod');

const createStorySchema = z.object({
    caption: z.string().max(2200).optional().or(z.literal('').transform(() => undefined)),
    duration: z.coerce.number().int().min(1).max(60).optional(),
    mediaType: z.enum(['photo', 'video']).optional(),
});

const replySchema = z.object({
    message: z.string().min(1).max(500),
});

module.exports = { createStorySchema, replySchema };
