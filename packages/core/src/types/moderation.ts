import { z } from 'zod';

export const reportTypeSchema = z.enum([
  'inappropriate_content',
  'harassment',
  'spam',
  'fake_profile',
  'underage',
  'animal_abuse',
  'scam',
  'inappropriate_behavior',
  'copyright_violation',
  'other',
]);

export const reportCategorySchema = z.enum(['user', 'pet', 'chat', 'message', 'other']);

export const reportPayloadSchema = z.object({
  type: reportTypeSchema,
  category: reportCategorySchema,
  reason: z.string().min(3).max(1000),
  description: z.string().max(2000).optional(),
  targetId: z.string().min(1),
  evidence: z
    .array(
      z.object({
        type: z.enum(['screenshot', 'message', 'photo', 'video', 'other']),
        url: z.string().url().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  isAnonymous: z.boolean().optional(),
});

export type ReportPayload = z.infer<typeof reportPayloadSchema>;

export const blockPayloadSchema = z.object({
  blockedUserId: z.string().min(1),
  reason: z.string().max(1000).optional(),
});
export type BlockPayload = z.infer<typeof blockPayloadSchema>;

export const mutePayloadSchema = z.object({
  mutedUserId: z.string().min(1),
  durationMinutes: z
    .number()
    .int()
    .min(1)
    .max(60 * 24 * 30),
  reason: z.string().max(1000).optional(),
});
export type MutePayload = z.infer<typeof mutePayloadSchema>;
