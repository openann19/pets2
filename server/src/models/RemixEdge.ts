import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * RemixEdge - Relationship tracking between parent and remixed reels
 */
export interface IRemixEdge {
  _id: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  createdAt: Date;
}

interface IRemixEdgeModel extends Model<IRemixEdge> {
  findByParentId(parentId: mongoose.Types.ObjectId): Promise<IRemixEdge[]>;
  findByChildId(childId: mongoose.Types.ObjectId): Promise<IRemixEdge | null>;
}

const remixEdgeSchema = new Schema<IRemixEdge, IRemixEdgeModel>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true,
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
remixEdgeSchema.index({ parentId: 1 });
remixEdgeSchema.index({ childId: 1 });
remixEdgeSchema.index({ parentId: 1, childId: 1 }, { unique: true });

// Static methods
remixEdgeSchema.statics.findByParentId = function (parentId: mongoose.Types.ObjectId) {
  return this.find({ parentId }).sort({ createdAt: -1 });
};

remixEdgeSchema.statics.findByChildId = function (childId: mongoose.Types.ObjectId) {
  return this.findOne({ childId });
};

const RemixEdge: IRemixEdgeModel = mongoose.model<IRemixEdge, IRemixEdgeModel>(
  'RemixEdge',
  remixEdgeSchema
);

export default RemixEdge;
export type RemixEdgeDocument = HydratedDocument<IRemixEdge>;

