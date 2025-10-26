import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';

/**
 * Image metadata interface
 */
export interface IImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  fileSize?: number;
}

/**
 * User history context interface
 */
export interface IUserHistory {
  totalUploads: number;
  rejectedUploads: number;
  approvedUploads: number;
  isTrustedUser: boolean;
  accountAge?: number; // in days
}

/**
 * Appeal process interface
 */
export interface IAppeal {
  submittedAt?: Date;
  reason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  decision?: 'pending' | 'upheld' | 'overturned';
  notes?: string;
}

/**
 * Photo moderation document interface
 */
export interface IPhotoModeration extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  photoUrl: string;
  cloudinaryPublicId: string;
  photoType: 'profile' | 'pet' | 'gallery' | 'chat';
  uploadedAt: Date;
  imageMetadata?: IImageMetadata;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  priority: 'normal' | 'high';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectionCategory?: 'explicit' | 'violence' | 'self-harm' | 'drugs' | 'hate-speech' | 'spam' | 'other';
  userHistory: IUserHistory;
  appeal?: IAppeal;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Photo moderation methods
 */
export interface IPhotoModerationMethods {
  approve(moderatorId: mongoose.Types.ObjectId, notes?: string): Promise<void>;
  reject(moderatorId: mongoose.Types.ObjectId, reason: string, category: string, notes?: string): Promise<void>;
}

/**
 * Photo moderation statics
 */
export interface IPhotoModerationModel extends Model<IPhotoModeration, Record<string, never>, IPhotoModerationMethods> {
  getQueueStats(): Promise<{
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }>;
  getModeratorStats(moderatorId: mongoose.Types.ObjectId, days?: number): Promise<Array<{
    _id: string;
    count: number;
    avgReviewTime: number;
  }>>;
}

/**
 * Fully typed Photo Moderation document
 */
export type IPhotoModerationDocument = HydratedDocument<IPhotoModeration, IPhotoModerationMethods>;

/**
 * Photo Moderation Schema
 */
const photoModerationSchema = new Schema<IPhotoModeration, IPhotoModerationModel, IPhotoModerationMethods>({
  // User who uploaded the photo
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Photo details
  photoUrl: {
    type: String,
    required: true
  },
  
  cloudinaryPublicId: {
    type: String,
    required: true
  },

  photoType: {
    type: String,
    enum: ['profile', 'pet', 'gallery', 'chat'],
    default: 'profile'
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Image metadata
  imageMetadata: {
    width: Number,
    height: Number,
    format: String,
    fileSize: Number
  },

  // Moderation Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under-review'],
    default: 'pending',
    index: true
  },

  priority: {
    type: String,
    enum: ['normal', 'high'],
    default: 'normal',
    index: true
  },

  // Manual Review
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  reviewedAt: Date,

  reviewNotes: String,

  rejectionReason: String,

  rejectionCategory: {
    type: String,
    enum: ['explicit', 'violence', 'self-harm', 'drugs', 'hate-speech', 'spam', 'other']
  },

  // User Context (cached for faster queries)
  userHistory: {
    totalUploads: { type: Number, default: 0 },
    rejectedUploads: { type: Number, default: 0 },
    approvedUploads: { type: Number, default: 0 },
    isTrustedUser: { type: Boolean, default: false },
    accountAge: Number // in days
  },

  // Appeal Process
  appeal: {
    submittedAt: Date,
    reason: String,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    decision: {
      type: String,
      enum: ['pending', 'upheld', 'overturned']
    },
    notes: String
  },

  // Compliance
  expiresAt: {
    type: Date,
    // Auto-delete rejected photos after 90 days
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
photoModerationSchema.index({ status: 1, priority: -1, uploadedAt: 1 });
photoModerationSchema.index({ userId: 1, status: 1 });
photoModerationSchema.index({ reviewedBy: 1, reviewedAt: -1 });

// Methods
photoModerationSchema.methods.approve = async function(moderatorId: mongoose.Types.ObjectId, notes?: string): Promise<void> {
  this.status = 'approved';
  this.reviewedBy = moderatorId;
  this.reviewedAt = new Date();
  if (notes) {
    this.reviewNotes = notes;
  }
  await this.save();
};

photoModerationSchema.methods.reject = async function(
  moderatorId: mongoose.Types.ObjectId, 
  reason: string, 
  category: string, 
  notes?: string
): Promise<void> {
  this.status = 'rejected';
  this.reviewedBy = moderatorId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.rejectionCategory = category as IPhotoModeration['rejectionCategory'];
  if (notes) {
    this.reviewNotes = notes;
  }
  this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  await this.save();
};

// Static methods
photoModerationSchema.statics.getQueueStats = async function(): Promise<{
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}> {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const priorityStats = await this.aggregate([
    {
      $match: { status: { $in: ['pending', 'under-review'] } }
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    byStatus: stats.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byPriority: priorityStats.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

photoModerationSchema.statics.getModeratorStats = async function(
  moderatorId: mongoose.Types.ObjectId, 
  days = 30
): Promise<Array<{
  _id: string;
  count: number;
  avgReviewTime: number;
}>> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await this.aggregate([
    {
      $match: {
        reviewedBy: moderatorId,
        reviewedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgReviewTime: {
          $avg: {
            $subtract: ['$reviewedAt', '$uploadedAt']
          }
        }
      }
    }
  ]);

  return stats;
};

export const PhotoModeration = mongoose.model<IPhotoModeration, IPhotoModerationModel>('PhotoModeration', photoModerationSchema);
