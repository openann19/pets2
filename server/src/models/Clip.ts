import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * Clip - Individual video/photo segment for a reel
 */
export interface IClip {
  _id: mongoose.Types.ObjectId;
  reelId: mongoose.Types.ObjectId;
  order: number; // Sequence in the reel
  srcUrl: string; // S3/CDN URL
  startMs: number; // Trim start in milliseconds
  endMs: number; // Trim end in milliseconds
  captionJson?: Record<string, unknown>; // Optional caption metadata
  createdAt: Date;
  updatedAt: Date;
}

interface IClipModel extends Model<IClip> {
  findByReelId(reelId: mongoose.Types.ObjectId): Promise<IClip[]>;
}

const clipSchema = new Schema<IClip, IClipModel>(
  {
    reelId: {
      type: Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    srcUrl: {
      type: String,
      required: true,
    },
    startMs: {
      type: Number,
      required: true,
      min: 0,
    },
    endMs: {
      type: Number,
      required: true,
      min: 0,
    },
    captionJson: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
clipSchema.index({ reelId: 1, order: 1 });

// Static methods
clipSchema.statics.findByReelId = function (reelId: mongoose.Types.ObjectId) {
  return this.find({ reelId }).sort({ order: 1 });
};

const Clip: IClipModel = mongoose.model<IClip, IClipModel>('Clip', clipSchema);

export default Clip;
export type ClipDocument = HydratedDocument<IClip>;

