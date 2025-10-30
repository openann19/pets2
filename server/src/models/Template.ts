import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * Template - Reusable video templates with effects and transitions
 */
export interface ITemplate {
  _id: mongoose.Types.ObjectId;
  name: string;
  theme: string;
  jsonSpec: Record<string, unknown>; // FFmpeg/composition configuration
  thumbUrl: string;
  minClips: number;
  maxClips: number;
  duration: number; // Expected duration in seconds
  isActive: boolean;
  abFlag?: string; // For A/B testing different templates
  createdAt: Date;
  updatedAt: Date;
}

interface ITemplateModel extends Model<ITemplate> {
  findActive(): Promise<ITemplate[]>;
  findByTheme(theme: string): Promise<ITemplate[]>;
}

const templateSchema = new Schema<ITemplate, ITemplateModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    theme: {
      type: String,
      required: true,
      enum: ['pets', 'adventure', 'cute', 'trending', 'seasonal'],
      index: true,
    },
    jsonSpec: {
      type: Schema.Types.Mixed,
      required: true,
    },
    thumbUrl: {
      type: String,
      required: true,
    },
    minClips: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 3,
    },
    maxClips: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
      default: 10,
    },
    duration: {
      type: Number,
      required: true,
      min: 3, // 3 seconds minimum
      max: 60, // 1 minute maximum
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    abFlag: {
      type: String,
      enum: ['control', 'variant_a', 'variant_b', 'variant_c'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
templateSchema.index({ isActive: 1, theme: 1 });

// Static methods
templateSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

templateSchema.statics.findByTheme = function (theme: string) {
  return this.find({ isActive: true, theme });
};

const Template: ITemplateModel = mongoose.model<ITemplate, ITemplateModel>(
  'Template',
  templateSchema
);

export default Template;
export type TemplateDocument = HydratedDocument<ITemplate>;

