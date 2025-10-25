import mongoose, { Schema, Document } from 'mongoose';
import { IVerification } from '../types';

const verificationSchema = new Schema<IVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['email', 'phone', 'identity', 'address'],
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true,
  },
  verificationCode: {
    type: String,
    maxlength: 10,
  },
  verificationData: {
    type: Schema.Types.Mixed,
  },
  documents: [{
    type: {
      type: String,
      enum: ['id_front', 'id_back', 'pet_photo', 'vet_certificate', 'adoption_papers', 'rescue_document', 'utility_bill', 'bank_statement'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  }],
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }, // TTL index
  },
  verifiedAt: {
    type: Date,
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
    maxlength: 500,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5,
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1,
    max: 10,
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
verificationSchema.index({ userId: 1, type: 1 });
verificationSchema.index({ status: 1 });
verificationSchema.index({ verificationCode: 1 });
verificationSchema.index({ createdAt: -1 });

// Virtual for is expired
verificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for can retry
verificationSchema.virtual('canRetry').get(function() {
  return this.attempts < this.maxAttempts && this.status === 'pending';
});

// Virtual for time remaining
verificationSchema.virtual('timeRemaining').get(function() {
  if (!this.expiresAt) return null;
  
  const now = new Date();
  const remaining = this.expiresAt.getTime() - now.getTime();
  
  if (remaining <= 0) return 'Expired';
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return `${minutes}m ${seconds}s`;
});

// Pre-save middleware to set expiration
verificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration based on verification type
    const expirationMinutes = {
      email: 10,    // 10 minutes
      phone: 10,    // 10 minutes
      identity: 7 * 24 * 60,  // 7 days
      address: 7 * 24 * 60,   // 7 days
    };
    
    this.expiresAt = new Date(Date.now() + (expirationMinutes[this.type as keyof typeof expirationMinutes] || 10) * 60 * 1000);
  }
  next();
});

// Instance method to generate verification code
verificationSchema.methods.generateVerificationCode = function() {
  if (this.type === 'email' || this.type === 'phone') {
    this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return this.verificationCode;
  }
  return null;
};

// Instance method to verify
verificationSchema.methods.verify = function(verifiedBy: string, notes?: string) {
  this.status = 'verified';
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy as any;
  this.notes = notes;
  return this.save();
};

// Instance method to reject
verificationSchema.methods.reject = function(reason: string, rejectedBy: string, notes?: string) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.verifiedBy = rejectedBy as any;
  this.notes = notes;
  return this.save();
};

// Instance method to increment attempts
verificationSchema.methods.incrementAttempts = function() {
  this.attempts = (this.attempts || 0) + 1;
  return this.save();
};

// Instance method to add document
verificationSchema.methods.addDocument = function(documentData: {
  type: string;
  url: string;
  publicId?: string;
}) {
  this.documents.push({
    ...documentData,
    uploadedAt: new Date(),
  });
  return this.save();
};

// Instance method to verify document
verificationSchema.methods.verifyDocument = function(documentIndex: number) {
  if (documentIndex >= 0 && documentIndex < this.documents.length) {
    this.documents[documentIndex].verified = true;
    return this.save();
  }
  throw new Error('Invalid document index');
};

// Static method to create verification
verificationSchema.statics.createVerification = function(verificationData: {
  userId: string;
  type: string;
  verificationData?: any;
  maxAttempts?: number;
}) {
  return this.create({
    ...verificationData,
    createdAt: new Date(),
  });
};

// Static method to get user verifications
verificationSchema.statics.getUserVerifications = function(userId: string) {
  return this.find({ userId })
    .populate('verifiedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get pending verifications
verificationSchema.statics.getPendingVerifications = function(limit: number = 50) {
  return this.find({ 
    status: 'pending',
    expiresAt: { $gt: new Date() },
  })
    .populate('userId', 'firstName lastName email')
    .populate('verifiedBy', 'firstName lastName email')
    .sort({ createdAt: 1 })
    .limit(limit);
};

// Static method to get verification by code
verificationSchema.statics.getVerificationByCode = function(code: string) {
  return this.findOne({ 
    verificationCode: code,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });
};

// Static method to get verification statistics
verificationSchema.statics.getVerificationStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalVerifications: { $sum: 1 },
        pendingVerifications: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        verifiedVerifications: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
        rejectedVerifications: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        emailVerifications: {
          $sum: { $cond: [{ $eq: ['$type', 'email'] }, 1, 0] }
        },
        phoneVerifications: {
          $sum: { $cond: [{ $eq: ['$type', 'phone'] }, 1, 0] }
        },
        identityVerifications: {
          $sum: { $cond: [{ $eq: ['$type', 'identity'] }, 1, 0] }
        },
        addressVerifications: {
          $sum: { $cond: [{ $eq: ['$type', 'address'] }, 1, 0] }
        },
        avgAttempts: { $avg: '$attempts' },
      },
    },
  ]);
};

// Static method to get verifications by type
verificationSchema.statics.getVerificationsByType = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        verified: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        avgAttempts: { $avg: '$attempts' },
        successRate: {
          $avg: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to cleanup expired verifications
verificationSchema.statics.cleanupExpiredVerifications = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
    status: 'pending',
  });
};

export default mongoose.model<IVerification>('Verification', verificationSchema);
