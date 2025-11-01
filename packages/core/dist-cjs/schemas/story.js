"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyStorySchema = exports.createStorySchema = void 0;
const zod_1 = require("zod");
exports.createStorySchema = zod_1.z.object({
    caption: zod_1.z.string().max(2200).optional(),
    duration: zod_1.z.coerce.number().int().min(1).max(60).optional(),
    mediaType: zod_1.z.enum(['photo', 'video']).optional(),
});
exports.replyStorySchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(500),
});
