/**
 * Translation Model
 * Phase 2 Product Enhancement - Chat Translation
 */

import mongoose, { Schema, Model } from 'mongoose';

export interface ITranslation {
  msgId: string;
  srcLang: string; // ISO 639-1
  tgtLang: string;
  text: string;
  quality: 'high' | 'low';
  cachedUntil: Date;
  provider?: string; // 'google', 'azure', 'deepl'
  confidence?: number; // 0-1
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITranslationDocument extends ITranslation, mongoose.Document {}

const translationSchema = new Schema<ITranslationDocument>(
  {
    msgId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    srcLang: {
      type: String,
      required: true,
      index: true,
    },
    tgtLang: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    quality: {
      type: String,
      enum: ['high', 'low'],
      default: 'high',
    },
    cachedUntil: {
      type: Date,
      required: true,
      index: true, // For cache cleanup
    },
    provider: {
      type: String,
      enum: ['google', 'azure', 'deepl'],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for cache lookups
translationSchema.index({ msgId: 1, tgtLang: 1 });
translationSchema.index({ cachedUntil: 1 }); // For cleanup jobs

const Translation: Model<ITranslationDocument> =
  mongoose.models.Translation ||
  mongoose.model<ITranslationDocument>('Translation', translationSchema);

export default Translation;

