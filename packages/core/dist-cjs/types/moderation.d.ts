import { z } from 'zod';
export declare const reportTypeSchema: z.ZodEnum<["inappropriate_content", "harassment", "spam", "fake_profile", "underage", "animal_abuse", "scam", "inappropriate_behavior", "copyright_violation", "other"]>;
export declare const reportCategorySchema: z.ZodEnum<["user", "pet", "chat", "message", "other"]>;
export declare const reportPayloadSchema: z.ZodObject<{
    type: z.ZodEnum<["inappropriate_content", "harassment", "spam", "fake_profile", "underage", "animal_abuse", "scam", "inappropriate_behavior", "copyright_violation", "other"]>;
    category: z.ZodEnum<["user", "pet", "chat", "message", "other"]>;
    reason: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    targetId: z.ZodString;
    evidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["screenshot", "message", "photo", "video", "other"]>;
        url: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "photo" | "video" | "message" | "other" | "screenshot";
        description?: string | undefined;
        url?: string | undefined;
    }, {
        type: "photo" | "video" | "message" | "other" | "screenshot";
        description?: string | undefined;
        url?: string | undefined;
    }>, "many">>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "other" | "spam" | "harassment" | "fake_profile" | "inappropriate_content" | "scam" | "underage" | "animal_abuse" | "inappropriate_behavior" | "copyright_violation";
    category: "message" | "other" | "user" | "pet" | "chat";
    reason: string;
    targetId: string;
    description?: string | undefined;
    evidence?: {
        type: "photo" | "video" | "message" | "other" | "screenshot";
        description?: string | undefined;
        url?: string | undefined;
    }[] | undefined;
    isAnonymous?: boolean | undefined;
}, {
    type: "other" | "spam" | "harassment" | "fake_profile" | "inappropriate_content" | "scam" | "underage" | "animal_abuse" | "inappropriate_behavior" | "copyright_violation";
    category: "message" | "other" | "user" | "pet" | "chat";
    reason: string;
    targetId: string;
    description?: string | undefined;
    evidence?: {
        type: "photo" | "video" | "message" | "other" | "screenshot";
        description?: string | undefined;
        url?: string | undefined;
    }[] | undefined;
    isAnonymous?: boolean | undefined;
}>;
export type ReportPayload = z.infer<typeof reportPayloadSchema>;
export declare const blockPayloadSchema: z.ZodObject<{
    blockedUserId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    blockedUserId: string;
    reason?: string | undefined;
}, {
    blockedUserId: string;
    reason?: string | undefined;
}>;
export type BlockPayload = z.infer<typeof blockPayloadSchema>;
export declare const mutePayloadSchema: z.ZodObject<{
    mutedUserId: z.ZodString;
    durationMinutes: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mutedUserId: string;
    durationMinutes: number;
    reason?: string | undefined;
}, {
    mutedUserId: string;
    durationMinutes: number;
    reason?: string | undefined;
}>;
export type MutePayload = z.infer<typeof mutePayloadSchema>;
