export {};// Added to mark file as a module
const mongoose = require('mongoose');

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
  return (this.size / (1024 * 1024)).toFixed(2);
});

// Virtual for upload age in days
uploadSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.uploadedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for aspect ratio
uploadSchema.virtual('aspectRatio').get(function() {
  if (this.dimensions.width && this.dimensions.height) {
    return (this.dimensions.width / this.dimensions.height).toFixed(2);
  }
  return null;
});

// Method to check if upload is image
uploadSchema.methods.isImage = function() {
  return this.mimeType.startsWith('image/');
};

// Method to check if upload is video
uploadSchema.methods.isVideo = function() {
  return this.mimeType.startsWith('video/');
};

// Method to check if upload is document
uploadSchema.methods.isDocument = function() {
  return this.mimeType.includes('pdf') || 
         this.mimeType.includes('document') || 
         this.mimeType.includes('text');
};

// Static method to get uploads by status
uploadSchema.statics.getUploadsByStatus = function(status, limit = 20, skip = 0) {
  return this.find({ status })
    .populate('userId', 'firstName lastName email')
    .populate('associatedPet', 'name species')
    .sort({ uploadedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get upload statistics
uploadSchema.statics.getUploadStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);
};

// Static method to get uploads by type
uploadSchema.statics.getUploadsByType = function(type, limit = 20, skip = 0) {
  return this.find({ type })
    .populate('userId', 'firstName lastName email')
    .sort({ uploadedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get pending uploads for moderation
uploadSchema.statics.getPendingUploads = function(limit = 20, skip = 0) {
  return this.find({ status: 'pending' })
    .populate('userId', 'firstName lastName email')
    .populate('associatedPet', 'name species')
    .sort({ uploadedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get uploads by user
uploadSchema.statics.getUploadsByUser = function(userId, limit = 20, skip = 0) {
  return this.find({ userId })
    .populate('associatedPet', 'name species')
    .sort({ uploadedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to update timestamps
uploadSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved') {
      this.approvedAt = new Date();
    } else if (this.status === 'rejected') {
      this.rejectedAt = new Date();
    }
  }
  
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
  }
  
  next();
});

// Pre-save middleware to validate file size limits
uploadSchema.pre('save', function(next) {
  const maxSizes = {
    pet_photo: 5 * 1024 * 1024, // 5MB
    profile_photo: 2 * 1024 * 1024, // 2MB
    verification_document: 10 * 1024 * 1024, // 10MB
    chat_image: 5 * 1024 * 1024, // 5MB
    other: 5 * 1024 * 1024 // 5MB
  };
  
  const maxSize = maxSizes[this.type] || 5 * 1024 * 1024;
  
  if (this.size > maxSize) {
    return next(new Error(`File size exceeds maximum allowed size for ${this.type} uploads`));
  }
  
  next();
});

// Pre-save middleware to validate MIME types
uploadSchema.pre('save', function(next) {
  const allowedTypes = {
    pet_photo: ['image/jpeg', 'image/png', 'image/webp'],
    profile_photo: ['image/jpeg', 'image/png', 'image/webp'],
    verification_document: ['image/jpeg', 'image/png', 'application/pdf'],
    chat_image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    other: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  };
  
  const allowedMimeTypes = allowedTypes[this.type] || ['image/jpeg', 'image/png'];
  
  if (!allowedMimeTypes.includes(this.mimeType)) {
    return next(new Error(`Invalid file type for ${this.type} uploads`));
  }
  
  next();
});

module.exports = mongoose.model('Upload', uploadSchema);
