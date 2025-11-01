"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutePayloadSchema = exports.blockPayloadSchema = exports.reportPayloadSchema = exports.reportCategorySchema = exports.reportTypeSchema = void 0;
const zod_1 = require("zod");
exports.reportTypeSchema = zod_1.z.enum([
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
exports.reportCategorySchema = zod_1.z.enum(['user', 'pet', 'chat', 'message', 'other']);
exports.reportPayloadSchema = zod_1.z.object({
    type: exports.reportTypeSchema,
    category: exports.reportCategorySchema,
    reason: zod_1.z.string().min(3).max(1000),
    description: zod_1.z.string().max(2000).optional(),
    targetId: zod_1.z.string().min(1),
    evidence: zod_1.z
        .array(zod_1.z.object({
        type: zod_1.z.enum(['screenshot', 'message', 'photo', 'video', 'other']),
        url: zod_1.z.string().url().optional(),
        description: zod_1.z.string().optional(),
    }))
        .optional(),
    isAnonymous: zod_1.z.boolean().optional(),
});
exports.blockPayloadSchema = zod_1.z.object({
    blockedUserId: zod_1.z.string().min(1),
    reason: zod_1.z.string().max(1000).optional(),
});
exports.mutePayloadSchema = zod_1.z.object({
    mutedUserId: zod_1.z.string().min(1),
    durationMinutes: zod_1.z.number().int().min(1).max(60 * 24 * 30),
    reason: zod_1.z.string().max(1000).optional(),
});
