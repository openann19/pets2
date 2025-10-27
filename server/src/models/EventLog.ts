import mongoose from 'mongoose';

/**
 * EventLog Model
 * Stores events emitted from mobile + web apps
 */
export interface IEventLog extends mongoose.Document {
  id: string;
  app: 'mobile' | 'web';
  userId?: string;
  sessionId: string;
  ts: Date;
  type: string;
  payload: Record<string, unknown>;
  meta?: {
    locale?: string;
    version?: string;
    device?: string;
    [key: string]: unknown;
  };
  createdAt: Date;
}

const eventLogSchema = new mongoose.Schema<IEventLog>({
  app: {
    type: String,
    enum: ['mobile', 'web'],
    required: true,
    index: true,
  },
  userId: {
    type: String,
    index: true,
    sparse: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  ts: {
    type: Date,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    index: true,
  },
  payload: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },
  meta: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Compound indexes for common queries
eventLogSchema.index({ type: 1, ts: -1 });
eventLogSchema.index({ userId: 1, ts: -1 });
eventLogSchema.index({ sessionId: 1, ts: -1 });
eventLogSchema.index({ 'meta.device': 1 });

export const EventLog = mongoose.model<IEventLog>('EventLog', eventLogSchema);
