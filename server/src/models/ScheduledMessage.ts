/**
 * Scheduled Message Model
 * Phase 2 Product Enhancement - Message Scheduling
 */

import mongoose, { Schema, Model } from 'mongoose';

export interface IScheduledMessage {
  convoId: string;
  senderId: string;
  body: {
    text?: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'file' | 'voice';
      url: string;
      thumb?: string;
      filename?: string;
      size?: number;
      mimeType?: string;
    }>;
    metadata?: Record<string, unknown>;
  };
  scheduledAt: Date; // UTC
  tz: string; // IANA timezone
  status: 'scheduled' | 'sent' | 'canceled' | 'failed';
  attempts?: number;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IScheduledMessageDocument extends IScheduledMessage, mongoose.Document {}

const scheduledMessageSchema = new Schema<IScheduledMessageDocument>(
  {
    convoId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    body: {
      text: String,
      attachments: [{
        type: String,
        url: String,
        thumb: String,
        filename: String,
        size: Number,
        mimeType: String,
      }],
      metadata: Schema.Types.Mixed,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    tz: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'canceled', 'failed'],
      default: 'scheduled',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    error: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
scheduledMessageSchema.index({ senderId: 1, status: 1 });
scheduledMessageSchema.index({ scheduledAt: 1, status: 1 }); // For cron job queries
scheduledMessageSchema.index({ convoId: 1 });

const ScheduledMessage: Model<IScheduledMessageDocument> =
  mongoose.models.ScheduledMessage ||
  mongoose.model<IScheduledMessageDocument>('ScheduledMessage', scheduledMessageSchema);

export default ScheduledMessage;

