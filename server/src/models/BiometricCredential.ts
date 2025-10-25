import mongoose, { Schema, Document } from 'mongoose';
import { IBiometricCredential } from '../types';

/**
 * Biometric Credential Model
 * Stores WebAuthn biometric authentication credentials
 */

const biometricCredentialSchema = new Schema<IBiometricCredential>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['fingerprint', 'face', 'voice'],
  },
  credentialId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // WebAuthn credential public key (base64url encoded)
  publicKey: {
    type: String,
    required: true,
  },
  // WebAuthn signature counter (prevents replay attacks)
  counter: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Device information
  deviceInfo: {
    name: String,
    platform: String,
    browser: String,
    userAgent: String,
  },
  // Credential metadata
  metadata: {
    algorithm: String,
    keyType: String,
    keySize: Number,
    attestationType: String,
  },
  // Security settings
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastUsedAt: {
    type: Date,
    index: true,
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
biometricCredentialSchema.index({ userId: 1, isActive: 1 });
biometricCredentialSchema.index({ credentialId: 1 });
biometricCredentialSchema.index({ lastUsedAt: -1 });

// Virtual for time since last used
biometricCredentialSchema.virtual('timeSinceLastUsed').get(function() {
  if (!this.lastUsedAt) return 'Never used';
  
  const now = new Date();
  const diffMs = now.getTime() - this.lastUsedAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Instance method to update counter
biometricCredentialSchema.methods.updateCounter = function(newCounter: number) {
  if (newCounter <= this.counter) {
    throw new Error('Invalid counter value - potential replay attack');
  }
  
  this.counter = newCounter;
  this.lastUsedAt = new Date();
  return this.save();
};

// Instance method to deactivate
biometricCredentialSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to activate
biometricCredentialSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Static method to create credential
biometricCredentialSchema.statics.createCredential = function(credentialData: {
  userId: string;
  type: string;
  credentialId: string;
  publicKey: string;
  deviceInfo?: any;
  metadata?: any;
}) {
  return this.create({
    ...credentialData,
    createdAt: new Date(),
  });
};

// Static method to get user credentials
biometricCredentialSchema.statics.getUserCredentials = function(userId: string) {
  return this.find({ 
    userId, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

// Static method to get credential by ID
biometricCredentialSchema.statics.getCredentialById = function(credentialId: string) {
  return this.findOne({ 
    credentialId, 
    isActive: true 
  });
};

// Static method to cleanup inactive credentials
biometricCredentialSchema.statics.cleanupInactiveCredentials = function(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    isActive: false,
    updatedAt: { $lt: cutoffDate },
  });
};

// Static method to get credential statistics
biometricCredentialSchema.statics.getCredentialStats = function(userId?: string) {
  const matchStage: any = {};
  if (userId) {
    matchStage.userId = userId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCredentials: { $sum: 1 },
        activeCredentials: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        fingerprintCredentials: {
          $sum: { $cond: [{ $eq: ['$type', 'fingerprint'] }, 1, 0] }
        },
        faceCredentials: {
          $sum: { $cond: [{ $eq: ['$type', 'face'] }, 1, 0] }
        },
        voiceCredentials: {
          $sum: { $cond: [{ $eq: ['$type', 'voice'] }, 1, 0] }
        },
        avgCounter: { $avg: '$counter' },
      },
    },
  ]);
};

export default mongoose.model<IBiometricCredential>('BiometricCredential', biometricCredentialSchema);
