/**
 * Enhanced Upload Model - Per PHOTOVERIFICATION spec
 * 
 * Handles complete upload lifecycle from presign → upload → ingestion → analysis → moderation
 */

import mongoose from 'mongoose';

export type UploadType = 'profile' | 'pet' | 'verification';

export type UploadStatus =
  | 'created'       // row created, presign issued
  | 'uploaded'      // binary is at S3
  | 'ingesting'     // AV/EXIF/pHash in progress
  | 'analyzing'     // AI analysis running
  | 'pending'       // waiting human review
  | 'approved'      // passed moderation
  | 'rejected';     // failed moderation

export interface UploadMetaDims {
  width?: number;
  height?: number;
}

/**
 * Upload Schema - Per PHOTOVERIFICATION.md spec
 */
const uploadSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      index: true,
    },
    type: {
      type: String,
      enum: ['profile', 'pet', 'verification'],
      required: true,
      index: true,
    },
    s3Key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    bytes: {
      type: Number,
      required: true,
    },
    dims: {
      width: Number,
      height: Number,
    },
    thumbnailKey: {
      type: String,
    },
    status: {
      type: String,
      enum: ['created', 'uploaded', 'ingesting', 'analyzing', 'pending', 'approved', 'rejected'],
      default: 'created',
      required: true,
      index: true,
    },
    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: {
      type: String,
    },
    
    // Ingestion metadata
    perceptualHash: {
      average: String,
      difference: String,
      perceptual: String,
    },
    
    // Analysis reference
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhotoAnalysis',
    },
    
    // Moderation metadata
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: Date,
    moderationNotes: String,
    
    // Audit trail
    idempotencyKey: {
      type: String,
      index: true,
    },
    presignedAt: Date,
    uploadedAt: Date,
    ingestedAt: Date,
    analyzedAt: Date,
    
    // Retention
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
uploadSchema.index({ userId: 1, status: 1 });
uploadSchema.index({ petId: 1, status: 1 });
uploadSchema.index({ type: 1, status: 1 });
uploadSchema.index({ createdAt: -1 });
uploadSchema.index({ 'perceptualHash.average': 1 });
uploadSchema.index({ 'perceptualHash.difference': 1 });
uploadSchema.index({ status: 1, flagged: 1 });

// Virtual for file size in MB
uploadSchema.virtual('sizeInMB').get(function() {
  return ((this as any).bytes / (1024 * 1024)).toFixed(2);
});

// Methods
uploadSchema.methods.isImage = function() {
  return this.contentType?.startsWith('image/');
};

uploadSchema.methods.isApproved = function() {
  return this.status === 'approved';
};

uploadSchema.methods.isPendingReview = function() {
  return this.status === 'pending';
};

uploadSchema.methods.isRejected = function() {
  return this.status === 'rejected';
};

// Export model
export const UploadEnhanced = mongoose.model('UploadEnhanced', uploadSchema);
export default UploadEnhanced;

