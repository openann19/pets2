/**
 * Flagged Message Model
 * Tracks messages that have been flagged for moderation review
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IFlaggedMessage extends Document {
  chatId: string;
  senderId: string;
  receiverId: string;
  messageContent: string;
  messageId: string;
  flagged: boolean;
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  moderationAction?: 'approved' | 'removed' | 'warned';
  notes?: string;
}

const flaggedMessageSchema = new Schema<IFlaggedMessage>(
  {
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    messageContent: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    flagged: {
      type: Boolean,
      default: true,
      index: true,
    },
    flagReason: {
      type: String,
    },
    flaggedBy: {
      type: String,
    },
    flaggedAt: {
      type: Date,
      default: Date.now,
    },
    reviewed: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    moderationAction: {
      type: String,
      enum: ['approved', 'removed', 'warned'],
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
flaggedMessageSchema.index({ chatId: 1, flaggedAt: -1 });
flaggedMessageSchema.index({ reviewed: 1, flaggedAt: -1 });
flaggedMessageSchema.index({ senderId: 1 });
flaggedMessageSchema.index({ flagged: 1, reviewed: 1 });

const FlaggedMessage = mongoose.model<IFlaggedMessage>('FlaggedMessage', flaggedMessageSchema);

export default FlaggedMessage;

