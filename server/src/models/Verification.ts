import mongoose from 'mongoose';

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
  return Math.floor((Date.now() - (this as any).submittedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days until expiration
verificationSchema.virtual('daysUntilExpiration').get(function() {
  return Math.floor(((this as any).expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
});

// Method to check if verification is expired
verificationSchema.methods.isExpired = function() {
  return (this as any).expiresAt < new Date();
};

// Method to check if verification needs renewal
verificationSchema.methods.needsRenewal = function() {
  const daysUntilExpiration = (this as any).daysUntilExpiration;
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
    if ((this as any).status === 'approved') {
      (this as any).approvedAt = new Date();
    } else if ((this as any).status === 'rejected') {
      (this as any).rejectedAt = new Date();
    }
  }
  next();
});

export default mongoose.model('Verification', verificationSchema);

