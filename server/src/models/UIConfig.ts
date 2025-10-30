/**
 * 🎛️ UI Config Model
 * MongoDB model for storing versioned UI configurations
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { UIConfig } from '@pawfectmatch/core';

export interface IUIConfigDocument extends Document {
  version: string;
  status: 'draft' | 'preview' | 'staged' | 'prod';
  audience?: {
    env?: 'dev' | 'stage' | 'prod';
    pct?: number;
    countryAllow?: string[];
  };
  config: UIConfig; // Full config object
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  changelog: string;
  isActive: boolean; // For soft deletion/archival
}

const UIConfigSchema = new Schema<IUIConfigDocument>(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{4}\.\d{2}\.\d{2}(-[a-z]+\.\d+)?$/, // e.g., "2025.01.27-rc.2"
    },
    status: {
      type: String,
      enum: ['draft', 'preview', 'staged', 'prod'],
      required: true,
      index: true,
    },
    audience: {
      env: {
        type: String,
        enum: ['dev', 'stage', 'prod'],
      },
      pct: {
        type: Number,
        min: 0,
        max: 100,
      },
      countryAllow: [String],
    },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    changelog: {
      type: String,
      required: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'ui_configs',
  },
);

// Compound indexes for efficient queries
UIConfigSchema.index({ status: 1, 'audience.env': 1, isActive: 1 });
UIConfigSchema.index({ status: 1, createdAt: -1 });
UIConfigSchema.index({ createdBy: 1, createdAt: -1 });

// Prevent duplicate versions
UIConfigSchema.index({ version: 1 }, { unique: true });

export const UIConfigModel =
  mongoose.models.UIConfig ||
  mongoose.model<IUIConfigDocument>('UIConfig', UIConfigSchema);

