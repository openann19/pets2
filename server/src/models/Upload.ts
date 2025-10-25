import mongoose, { Schema, Document } from 'mongoose';
import { IUpload } from '../types';

const uploadSchema = new Schema<IUpload>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
    min: 0,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
    unique: true,
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // For videos
    format: String,
    quality: String,
    compression: String,
  },
  category: {
    type: String,
    enum: ['pet_photo', 'profile_photo', 'verification_document', 'chat_image', 'story_media', 'other'],
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed', 'deleted'],
    default: 'uploading',
    index: true,
  },
  errorMessage: {
    type: String,
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }, // TTL index
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
uploadSchema.index({ userId: 1, category: 1 });
uploadSchema.index({ userId: 1, createdAt: -1 });
uploadSchema.index({ status: 1 });
uploadSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for file size in human readable format
uploadSchema.virtual('sizeFormatted').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for is image
uploadSchema.virtual('isImage').get(function() {
  return this.mimetype.startsWith('image/');
});

// Virtual for is video
uploadSchema.virtual('isVideo').get(function() {
  return this.mimetype.startsWith('video/');
});

// Virtual for is document
uploadSchema.virtual('isDocument').get(function() {
  return this.mimetype.startsWith('application/') || this.mimetype.includes('pdf');
});

// Virtual for time since upload
uploadSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Pre-save middleware to update timestamps
uploadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to mark as completed
uploadSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Instance method to mark as failed
uploadSchema.methods.markAsFailed = function(errorMessage: string) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  return this.save();
};

// Instance method to mark as processing
uploadSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  return this.save();
};

// Instance method to increment access count
uploadSchema.methods.incrementAccess = function() {
  this.accessCount = (this.accessCount || 0) + 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Instance method to set expiration
uploadSchema.methods.setExpiration = function(hours: number) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return this.save();
};

// Instance method to make public
uploadSchema.methods.makePublic = function() {
  this.isPublic = true;
  return this.save();
};

// Instance method to make private
uploadSchema.methods.makePrivate = function() {
  this.isPublic = false;
  return this.save();
};

// Static method to create upload record
uploadSchema.statics.createUpload = function(uploadData: {
  userId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  publicId: string;
  category: string;
  metadata?: any;
  tags?: string[];
}) {
  return this.create({
    ...uploadData,
    createdAt: new Date(),
  });
};

// Static method to get user uploads
uploadSchema.statics.getUserUploads = function(userId: string, category?: string, limit: number = 50) {
  const query: any = { userId };
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get uploads by category
uploadSchema.statics.getUploadsByCategory = function(category: string, limit: number = 50) {
  return this.find({ 
    category,
    status: 'completed',
    isPublic: true,
  })
    .populate('userId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get public uploads
uploadSchema.statics.getPublicUploads = function(limit: number = 50) {
  return this.find({ 
    isPublic: true,
    status: 'completed',
  })
    .populate('userId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to cleanup failed uploads
uploadSchema.statics.cleanupFailedUploads = function(hoursOld: number = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursOld);
  
  return this.deleteMany({
    status: 'failed',
    createdAt: { $lt: cutoffDate },
  });
};

// Static method to cleanup expired uploads
uploadSchema.statics.cleanupExpiredUploads = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// Static method to get upload statistics
uploadSchema.statics.getUploadStats = function(userId?: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const matchStage: any = {
    createdAt: { $gte: startDate },
  };
  
  if (userId) {
    matchStage.userId = userId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalUploads: { $sum: 1 },
        completedUploads: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedUploads: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalSize: { $sum: '$size' },
        avgSize: { $avg: '$size' },
        imageUploads: {
          $sum: { $cond: [{ $eq: ['$category', 'pet_photo'] }, 1, 0] }
        },
        profileUploads: {
          $sum: { $cond: [{ $eq: ['$category', 'profile_photo'] }, 1, 0] }
        },
        documentUploads: {
          $sum: { $cond: [{ $eq: ['$category', 'verification_document'] }, 1, 0] }
        },
      },
    },
  ]);
};

// Static method to get uploads by file type
uploadSchema.statics.getUploadsByFileType = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$mimetype',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        avgSize: { $avg: '$size' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

export default mongoose.model<IUpload>('Upload', uploadSchema);
