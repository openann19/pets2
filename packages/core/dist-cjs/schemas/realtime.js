"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._suggestionEventSchema = exports._memoryNodeSchema = exports._pulsePinSchema = void 0;
const zod_1 = require("zod");
exports._pulsePinSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    petId: zod_1.z.string(),
    ownerId: zod_1.z.string(),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
    activity: zod_1.z.enum(['walking', 'playing', 'grooming', 'vet', 'park', 'other']),
    message: zod_1.z.string().max(120).optional(),
    createdAt: zod_1.z.string()
});
exports._memoryNodeSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    matchId: zod_1.z.string(),
    summary: zod_1.z.string(),
    highlights: zod_1.z.array(zod_1.z.string()),
    imageUrl: zod_1.z.string().url().optional(),
    createdAt: zod_1.z.string()
});
exports._suggestionEventSchema = zod_1.z.object({
    matchId: zod_1.z.string(),
    senderId: zod_1.z.string(),
    suggestionType: zod_1.z.enum(['schedule_playdate', 'share_photo', 'share_location']),
    payload: zod_1.z.record(zod_1.z.any())
});
//# sourceMappingURL=realtime.js.map