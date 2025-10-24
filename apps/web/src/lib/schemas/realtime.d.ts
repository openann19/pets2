import { z } from 'zod';
export declare const pulsePinSchema: z.ZodObject<{
    _id: z.ZodString;
    petId: z.ZodString;
    ownerId: z.ZodString;
    coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    activity: z.ZodEnum<{
        playing: "playing";
        other: "other";
        grooming: "grooming";
        walking: "walking";
        vet: "vet";
        park: "park";
    }>;
    message: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export declare const memoryNodeSchema: z.ZodObject<{
    _id: z.ZodString;
    matchId: z.ZodString;
    summary: z.ZodString;
    highlights: z.ZodArray<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export declare const suggestionEventSchema: z.ZodObject<{
    matchId: z.ZodString;
    senderId: z.ZodString;
    suggestionType: z.ZodEnum<{
        schedule_playdate: "schedule_playdate";
        share_photo: "share_photo";
        share_location: "share_location";
    }>;
    payload: z.ZodRecord<z.ZodAny, z.core.SomeType>;
}, z.core.$strip>;
//# sourceMappingURL=realtime.d.ts.map