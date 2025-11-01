import { z } from 'zod';
export declare const createStorySchema: z.ZodObject<{
    caption: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    mediaType: z.ZodOptional<z.ZodEnum<["photo", "video"]>>;
}, "strip", z.ZodTypeAny, {
    caption?: string | undefined;
    duration?: number | undefined;
    mediaType?: "photo" | "video" | undefined;
}, {
    caption?: string | undefined;
    duration?: number | undefined;
    mediaType?: "photo" | "video" | undefined;
}>;
export declare const replyStorySchema: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type ReplyStoryInput = z.infer<typeof replyStorySchema>;
