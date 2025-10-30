import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * ShareEvent - Analytics for reel sharing
 */
export interface IShareEvent {
  _id: mongoose.Types.ObjectId;
  reelId: mongoose.Types.ObjectId;
  channel: string; // 'instagram', 'tiktok', 'snapchat', 'twitter', 'copy-link', 'save'
  referrerUserId?: mongoose.Types.ObjectId; // User who shared (for K-factor tracking)
  userId?: mongoose.Types.ObjectId; // User who clicked share (if known)
  createdAt: Date;
}

interface IShareEventModel extends Model<IShareEvent> {
  findByReelId(reelId: mongoose.Types.ObjectId): Promise<IShareEvent[]>;
  findByChannel(channel: string, startDate?: Date, endDate?: Date): Promise<IShareEvent[]>;
  getTotalShares(reelId: mongoose.Types.ObjectId): Promise<number>;
  getSharesByChannel(reelId: mongoose.Types.ObjectId): Promise<Record<string, number>>;
}

const shareEventSchema = new Schema<IShareEvent, IShareEventModel>(
  {
    reelId: {
      type: Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ['instagram', 'tiktok', 'snapchat', 'twitter', 'facebook', 'copy-link', 'save'],
      index: true,
    },
    referrerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
shareEventSchema.index({ reelId: 1, createdAt: -1 });
shareEventSchema.index({ channel: 1, createdAt: -1 });
shareEventSchema.index({ referrerUserId: 1 });

// Static methods
shareEventSchema.statics.findByReelId = function (reelId: mongoose.Types.ObjectId) {
  return this.find({ reelId }).sort({ createdAt: -1 });
};

shareEventSchema.statics.findByChannel = function (
  channel: string,
  startDate?: Date,
  endDate?: Date
) {
  const query: Record<string, unknown> = { channel };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }
  return this.find(query).sort({ createdAt: -1 });
};

shareEventSchema.statics.getTotalShares = async function (reelId: mongoose.Types.ObjectId) {
  const count = await this.countDocuments({ reelId });
  return count;
};

shareEventSchema.statics.getSharesByChannel = async function (reelId: mongoose.Types.ObjectId) {
  const results = await this.aggregate([
    { $match: { reelId } },
    {
      $group: {
        _id: '$channel',
        count: { $sum: 1 },
      },
    },
  ]);

  return results.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {} as Record<string, number>);
};

const ShareEvent: IShareEventModel = mongoose.model<IShareEvent, IShareEventModel>(
  'ShareEvent',
  shareEventSchema
);

export default ShareEvent;
export type ShareEventDocument = HydratedDocument<IShareEvent>;

