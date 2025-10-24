import { z } from 'zod';

export const _pulsePinSchema = z.object({
  _id: z.string(),
  petId: z.string(),
  ownerId: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  activity: z.enum(['walking','playing','grooming','vet','park','other']),
  message: z.string().max(120).optional(),
  createdAt: z.string()
});

export const _memoryNodeSchema = z.object({
  _id: z.string(),
  matchId: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  imageUrl: z.string().url().optional(),
  createdAt: z.string()
});

export const _suggestionEventSchema = z.object({
  matchId: z.string(),
  senderId: z.string(),
  suggestionType: z.enum(['schedule_playdate','share_photo','share_location']),
  payload: z.record(z.any())
});
