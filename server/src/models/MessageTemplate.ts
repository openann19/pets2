/**
 * Message Template Model
 * Phase 2 Product Enhancement - Message Templates
 */

import mongoose, { Schema, Model } from 'mongoose';

export interface IMessageTemplate {
  userId: string;
  name: string;
  content: string;
  variables: string[]; // e.g., ['name', 'petName', 'meetingTime']
  category: 'personal' | 'team' | 'ops';
  version: number;
  encrypted?: boolean;
  usageCount?: number; // For sorting by frequency
  lastUsedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageTemplateDocument extends IMessageTemplate, mongoose.Document {}

const messageTemplateSchema = new Schema<IMessageTemplateDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    variables: [{
      type: String,
    }],
    category: {
      type: String,
      enum: ['personal', 'team', 'ops'],
      default: 'personal',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    encrypted: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
messageTemplateSchema.index({ userId: 1, category: 1 });
messageTemplateSchema.index({ userId: 1, usageCount: -1 }); // For sorting by frequency

const MessageTemplate: Model<IMessageTemplateDocument> =
  mongoose.models.MessageTemplate ||
  mongoose.model<IMessageTemplateDocument>('MessageTemplate', messageTemplateSchema);

export default MessageTemplate;

