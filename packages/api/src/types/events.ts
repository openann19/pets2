import { z } from 'zod';

/**
 * Event Envelope Schema
 * Shared type for events emitted from mobile + web apps
 */
export const EventEnvelope = z.object({
  id: z.string().uuid(),
  app: z.enum(['mobile', 'web']),
  userId: z.string().optional(),
  sessionId: z.string(),
  ts: z.string().datetime(),
  type: z.string(),          // e.g., 'chat.message.sent'
  payload: z.record(z.any()),// JSON payload
  meta: z.object({
    locale: z.string().optional(),
    version: z.string().optional(),
    device: z.string().optional(),
  }).optional(),
});

export type EventEnvelope = z.infer<typeof EventEnvelope>;
