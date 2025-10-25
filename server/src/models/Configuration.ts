import mongoose, { Schema, Document } from 'mongoose';
import { IConfiguration } from '../types';

// This model stores configuration for external services such as Stripe, DeepSeek, Google Maps, etc.
// Sensitive fields (api keys, secrets) are stored encrypted.
const configurationSchema = new Schema<IConfiguration>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Arbitrary config object; encrypted fields should already be encrypted before saving.
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
      index: true,
    },
    category: {
      type: String,
      enum: ['payment', 'ai', 'maps', 'storage', 'email', 'sms', 'analytics', 'security', 'other'],
      default: 'other',
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
    collection: 'configurations',
  }
);

// Indexes
configurationSchema.index({ key: 1 });
configurationSchema.index({ category: 1, isActive: 1 });
configurationSchema.index({ updatedBy: 1 });
configurationSchema.index({ updatedAt: -1 });

// Virtual for is sensitive
configurationSchema.virtual('isSensitive').get(function() {
  const sensitiveKeys = ['secret', 'key', 'token', 'password', 'credential'];
  return sensitiveKeys.some(key => this.key.toLowerCase().includes(key));
});

// Virtual for time since update
configurationSchema.virtual('timeSinceUpdate').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.updatedAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Instance method to update value
configurationSchema.methods.updateValue = function(newValue: any, updatedBy: string) {
  this.value = newValue;
  this.updatedBy = updatedBy;
  this.version = (this.version || 1) + 1;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to activate
configurationSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Instance method to deactivate
configurationSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to encrypt value
configurationSchema.methods.encryptValue = function() {
  if (!this.isEncrypted) {
    // This would use the encryption service
    // For now, just mark as encrypted
    this.isEncrypted = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to decrypt value
configurationSchema.methods.decryptValue = function() {
  if (this.isEncrypted) {
    // This would use the decryption service
    // For now, return the value as is
    return this.value;
  }
  return this.value;
};

// Static method to get configuration by key
configurationSchema.statics.getByKey = function(key: string) {
  return this.findOne({ 
    key, 
    isActive: true 
  });
};

// Static method to get configurations by category
configurationSchema.statics.getByCategory = function(category: string) {
  return this.find({ 
    category, 
    isActive: true 
  }).sort({ key: 1 });
};

// Static method to set configuration
configurationSchema.statics.setConfig = function(key: string, value: any, updatedBy: string, options?: {
  description?: string;
  category?: string;
  isEncrypted?: boolean;
}) {
  return this.findOneAndUpdate(
    { key },
    {
      key,
      value,
      updatedBy,
      description: options?.description,
      category: options?.category || 'other',
      isEncrypted: options?.isEncrypted || false,
      version: 1,
      isActive: true,
      updatedAt: new Date(),
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Static method to get all active configurations
configurationSchema.statics.getAllActive = function() {
  return this.find({ 
    isActive: true 
  }).sort({ category: 1, key: 1 });
};

// Static method to get configuration history
configurationSchema.statics.getHistory = function(key: string, limit: number = 10) {
  return this.find({ key })
    .populate('updatedBy', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .limit(limit);
};

// Static method to cleanup old configurations
configurationSchema.statics.cleanupOldConfigs = function(daysOld: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    isActive: false,
    updatedAt: { $lt: cutoffDate },
  });
};

// Static method to get configuration statistics
configurationSchema.statics.getConfigStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalConfigs: { $sum: 1 },
        activeConfigs: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        encryptedConfigs: {
          $sum: { $cond: ['$isEncrypted', 1, 0] }
        },
        configsByCategory: {
          $push: {
            category: '$category',
            count: 1,
          },
        },
      },
    },
  ]);
};

// Static method to validate configuration
configurationSchema.statics.validateConfig = function(key: string, value: any) {
  const validations: { [key: string]: (value: any) => boolean } = {
    'stripe.secret_key': (val) => typeof val === 'string' && val.startsWith('sk_'),
    'stripe.publishable_key': (val) => typeof val === 'string' && val.startsWith('pk_'),
    'ai.api_key': (val) => typeof val === 'string' && val.length > 10,
    'maps.api_key': (val) => typeof val === 'string' && val.length > 10,
    'email.smtp_password': (val) => typeof val === 'string' && val.length > 5,
  };
  
  const validator = validations[key];
  if (validator) {
    return validator(value);
  }
  
  return true; // Default to valid if no specific validator
};

export default mongoose.model<IConfiguration>('Configuration', configurationSchema);
