import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['pet_photo', 'profile_photo', 'verification_document', 'chat_image', 'other'],
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalNotes: String,
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  rejectionNotes: String,
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletionReason: String,
  isDeleted: {
    type: Boolean,
    default: false
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    uploadSource: {
      type: String,
      enum: ['web', 'mobile'],
      default: 'web'
    },
    deviceInfo: {
      type: String,
      browser: String,
      os: String
    }
  },
  tags: [String],
  description: String,
  associatedPet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  associatedMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  associatedVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verification'
  }
}, {
  timestamps: true
});

// Indexes for performance
uploadSchema.index({ userId: 1 });
uploadSchema.index({ status: 1 });
uploadSchema.index({ type: 1 });
uploadSchema.index({ uploadedAt: -1 });
uploadSchema.index({ reviewedAt: -1 });
uploadSchema.index({ publicId: 1 });
uploadSchema.index({ associatedPet: 1 });
uploadSchema.index({ associatedMatch: 1 });
uploadSchema.index({ associatedVerification: 1 });

// Virtual for file size in MB
uploadSchema.virtual('sizeInMB').get(function() {
  return ((this as any).size / (1024 * 1024)).toFixed(2);
});

// Virtual for upload age in days
uploadSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - (this as any).uploadedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for aspect ratio
uploadSchema.virtual('aspectRatio').get(function() {
  if ((this as any).dimensions.width && (this as any).dimensions.height) {
    return ((this as any).dimensions.width / (this as any).dimensions.height).toFixed(2);
  }
  return null;
});

// Method to check if upload is image
uploadSchema.methods.isImage = function() {
  return (this as any).mimeType.startsWith('image/');
};

// Method to check if upload is video
uploadSchema.methods.isVideo = function() {
  return (this as any).mimeType.startsWith('video/');
};

// Method to check if upload is document
uploadSchema.methods.isDocument = function() {
  return (this as any).mimeType.includes('pdf') || 
         (this as any).mimeType.includes('document') || 
         (this as any).mimeType.includes('text');
};

export default mongoose.model('Upload', uploadSchema);

