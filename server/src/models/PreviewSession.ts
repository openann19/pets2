/**
 * 🎛️ Preview Session Model
 * Temporary sessions for previewing configs before publishing
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPreviewSessionDocument extends Document {
  code: string; // 6-char preview code
  configId: string; // Reference to UIConfig _id
  expiresAt: Date;
  createdAt: Date;
  accessedAt?: Date;
  accessCount: number;
}

const PreviewSessionSchema = new Schema<IPreviewSessionDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      length: 6,
      uppercase: true,
      match: /^[A-Z0-9]{6}$/,
    },
    configId: {
      type: Schema.Types.ObjectId,
      ref: 'UIConfig',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    accessedAt: {
      type: Date,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'preview_sessions',
  },
);

// TTL index to auto-delete expired sessions
PreviewSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for cleanup queries
PreviewSessionSchema.index({ configId: 1, expiresAt: 1 });

export const PreviewSessionModel =
  mongoose.models.PreviewSession ||
  mongoose.model<IPreviewSessionDocument>('PreviewSession', PreviewSessionSchema);

