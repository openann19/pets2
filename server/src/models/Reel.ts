import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * Reel - Short-form video content for sharing
 */
export interface IReel {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  trackId: mongoose.Types.ObjectId;
  srcJson: Record<string, unknown>; // Template configuration
  mp4Url?: string;
  posterUrl?: string;
  duration: number; // in seconds
  remixOfId?: mongoose.Types.ObjectId;
  watermark: boolean;
  locale: string;
  status: 'draft' | 'rendering' | 'public' | 'flagged' | 'removed';
  kpiShares: number;
  kpiInstallsFromLink: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IReelModel extends Model<IReel> {
  findByStatus(status: IReel['status']): Promise<IReel[]>;
  findByOwner(ownerId: mongoose.Types.ObjectId): Promise<IReel[]>;
  findByRemixOf(remixOfId: mongoose.Types.ObjectId): Promise<IReel[]>;
}

const reelSchema = new Schema<IReel, IReelModel>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    trackId: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
    },
    srcJson: {
      type: Schema.Types.Mixed,
      required: true,
    },
    mp4Url: {
      type: String,
    },
    posterUrl: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
      max: 300, // 5 minutes max
    },
    remixOfId: {
      type: Schema.Types.ObjectId,
      ref: 'Reel',
      default: null,
    },
    watermark: {
      type: Boolean,
      default: true,
    },
    locale: {
      type: String,
      default: 'bg',
      enum: ['bg', 'en'],
    },
    status: {
      type: String,
      enum: ['draft', 'rendering', 'public', 'flagged', 'removed'],
      default: 'draft',
      index: true,
    },
    kpiShares: {
      type: Number,
      default: 0,
    },
    kpiInstallsFromLink: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reelSchema.index({ ownerId: 1, createdAt: -1 });
reelSchema.index({ status: 1, createdAt: -1 });
reelSchema.index({ remixOfId: 1 });
reelSchema.index({ templateId: 1 });

// Virtual population
reelSchema.virtual('clips', {
  ref: 'Clip',
  localField: '_id',
  foreignField: 'reelId',
});

reelSchema.virtual('remixes', {
  ref: 'Reel',
  localField: '_id',
  foreignField: 'remixOfId',
});

// Static methods
reelSchema.statics.findByStatus = function (status: IReel['status']) {
  return this.find({ status });
};

reelSchema.statics.findByOwner = function (ownerId: mongoose.Types.ObjectId) {
  return this.find({ ownerId }).sort({ createdAt: -1 });
};

reelSchema.statics.findByRemixOf = function (remixOfId: mongoose.Types.ObjectId) {
  return this.find({ remixOfId }).sort({ createdAt: -1 });
};

const Reel: IReelModel = mongoose.model<IReel, IReelModel>('Reel', reelSchema);

export default Reel;
export type ReelDocument = HydratedDocument<IReel>;

