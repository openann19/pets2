export {};// Added to mark file as a module
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['identity', 'pet_ownership', 'veterinary', 'rescue_organization'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [{
    type: {
      type: String,
      enum: ['id_front', 'id_back', 'pet_photo', 'vet_certificate', 'adoption_papers', 'rescue_document'],
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
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: String
  },
  petInfo: {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet'
    },
    petName: String,
    species: String,
    breed: String,
    age: Number,
    microchipNumber: String,
    vetName: String,
    vetPhone: String,
    vetAddress: String
  },
  organizationInfo: {
    name: String,
    registrationNumber: String,
    address: String,
    contactPerson: String,
    phone: String,
    email: String,
    website: String
  },
  submittedAt: {
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
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    submissionSource: {
      type: String,
      enum: ['web', 'mobile'],
      default: 'web'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
verificationSchema.index({ userId: 1 });
verificationSchema.index({ status: 1 });
verificationSchema.index({ type: 1 });
verificationSchema.index({ submittedAt: -1 });
verificationSchema.index({ reviewedAt: -1 });
verificationSchema.index({ expiresAt: 1 });

// Virtual for verification age
verificationSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days until expiration
verificationSchema.virtual('daysUntilExpiration').get(function() {
  return Math.floor((this.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
});

// Method to check if verification is expired
verificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to check if verification needs renewal
verificationSchema.methods.needsRenewal = function() {
  const daysUntilExpiration = this.daysUntilExpiration;
  return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
};

// Static method to get pending verifications
verificationSchema.statics.getPendingVerifications = function(limit = 20, skip = 0) {
  return this.find({ status: 'pending' })
    .populate('userId', 'firstName lastName email')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get verification statistics
verificationSchema.statics.getVerificationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware to update timestamps
verificationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved') {
      this.approvedAt = new Date();
    } else if (this.status === 'rejected') {
      this.rejectedAt = new Date();
    }
  }
  next();
});

// Pre-save middleware to validate required fields based on type
verificationSchema.pre('save', function(next) {
  if (this.type === 'identity' && !this.personalInfo.firstName) {
    return next(new Error('Personal information is required for identity verification'));
  }
  
  if (this.type === 'pet_ownership' && !this.petInfo.petName) {
    return next(new Error('Pet information is required for pet ownership verification'));
  }
  
  if (this.type === 'rescue_organization' && !this.organizationInfo.name) {
    return next(new Error('Organization information is required for rescue organization verification'));
  }
  
  next();
});

module.exports = mongoose.model('Verification', verificationSchema);
