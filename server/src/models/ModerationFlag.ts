import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * ModerationFlag - AI/human moderation results for reels
 */
export interface IModerationFlag {
  _id: mongoose.Types.ObjectId;
  reelId: mongoose.Types.ObjectId;
  kind: string; // 'nsfw', 'violence', 'weapon', 'hate-speech', 'copyright', 'spam'
  score: number; // 0-1 confidence score
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewedBy?: mongoose.Types.ObjectId; // Admin user who reviewed
  reviewedAt?: Date;
  createdAt: Date;
}

interface IModerationFlagModel extends Model<IModerationFlag> {
  findByReelId(reelId: mongoose.Types.ObjectId): Promise<IModerationFlag[]>;
  findByStatus(status: IModerationFlag['status']): Promise<IModerationFlag[]>;
  findByKind(kind: string): Promise<IModerationFlag[]>;
  getHighestScore(reelId: mongoose.Types.ObjectId): Promise<number>;
}

const moderationFlagSchema = new Schema<IModerationFlag, IModerationFlagModel>(
  {
    reelId: {
      type: Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      required: true,
      enum: [
        'nsfw',
        'violence',
        'weapon',
        'hate-speech',
        'copyright',
        'spam',
        'animal-abuse',
        'inappropriate-background',
      ],
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
moderationFlagSchema.index({ reelId: 1, status: 1 });
moderationFlagSchema.index({ kind: 1, status: 1 });
moderationFlagSchema.index({ status: 1, createdAt: -1 });

// Static methods
moderationFlagSchema.statics.findByReelId = function (reelId: mongoose.Types.ObjectId) {
  return this.find({ reelId }).sort({ score: -1 });
};

moderationFlagSchema.statics.findByStatus = function (status: IModerationFlag['status']) {
  return this.find({ status }).sort({ createdAt: -1 });
};

moderationFlagSchema.statics.findByKind = function (kind: string) {
  return this.find({ kind, status: 'pending' }).sort({ score: -1 });
};

moderationFlagSchema.statics.getHighestScore = async function (reelId: mongoose.Types.ObjectId) {
  const result = await this.find({ reelId }).sort({ score: -1 }).limit(1);
  return result.length > 0 ? result[0].score : 0;
};

const ModerationFlag: IModerationFlagModel = mongoose.model<IModerationFlag, IModerationFlagModel>(
  'ModerationFlag',
  moderationFlagSchema
);

export default ModerationFlag;
export type ModerationFlagDocument = HydratedDocument<IModerationFlag>;

