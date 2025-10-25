import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import { IAdminApiKey } from '../types';

// This model stores API keys for the admin API
// It allows for programmatic access to the admin API
const adminApiKeySchema = new Schema<IAdminApiKey>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: [{
      type: String,
      enum: [
        'users:read', 'users:write', 'users:delete',
        'pets:read', 'pets:write', 'pets:delete',
        'matches:read', 'matches:write', 'matches:delete',
        'messages:read', 'messages:write', 'messages:delete',
        'analytics:read', 'analytics:write',
        'moderation:read', 'moderation:write',
        'reports:read', 'reports:write',
        'admin:read', 'admin:write',
        'system:read', 'system:write',
      ],
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUsed: {
      type: Date,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rateLimit: {
      requestsPerMinute: {
        type: Number,
        default: 100,
        min: 1,
        max: 10000,
      },
      requestsPerHour: {
        type: Number,
        default: 1000,
        min: 1,
        max: 100000,
      },
      requestsPerDay: {
        type: Number,
        default: 10000,
        min: 1,
        max: 1000000,
      },
    },
    ipWhitelist: [{
      type: String,
      validate: {
        validator: function(ip: string) {
          // Basic IP validation (IPv4 and IPv6)
          const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          return ipv4Regex.test(ip) || ipv6Regex.test(ip);
        },
        message: 'Invalid IP address format',
      },
    }],
    description: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    collection: 'admin_api_keys',
  }
);

// Indexes
adminApiKeySchema.index({ key: 1 });
adminApiKeySchema.index({ isActive: 1 });
adminApiKeySchema.index({ createdBy: 1 });
adminApiKeySchema.index({ expiresAt: 1 });

// Virtual for is expired
adminApiKeySchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for is valid
adminApiKeySchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired;
});

// Virtual for time since last used
adminApiKeySchema.virtual('timeSinceLastUsed').get(function() {
  if (!this.lastUsed) return 'Never used';
  
  const now = new Date();
  const diffMs = now.getTime() - this.lastUsed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Instance method to generate API key
adminApiKeySchema.methods.generateKey = function() {
  const key = crypto.randomBytes(32).toString('hex');
  this.key = key;
  return key;
};

// Instance method to update usage
adminApiKeySchema.methods.updateUsage = function() {
  this.usageCount = (this.usageCount || 0) + 1;
  this.lastUsed = new Date();
  return this.save();
};

// Instance method to check permission
adminApiKeySchema.methods.hasPermission = function(permission: string) {
  return this.permissions.includes(permission);
};

// Instance method to add permission
adminApiKeySchema.methods.addPermission = function(permission: string) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove permission
adminApiKeySchema.methods.removePermission = function(permission: string) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

// Instance method to activate
adminApiKeySchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Instance method to deactivate
adminApiKeySchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to set expiration
adminApiKeySchema.methods.setExpiration = function(days: number) {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.save();
};

// Static method to create API key
adminApiKeySchema.statics.createApiKey = function(keyData: {
  name: string;
  permissions: string[];
  createdBy: string;
  description?: string;
  expiresAt?: Date;
  ipWhitelist?: string[];
  rateLimit?: any;
}) {
  const apiKey = new this(keyData);
  apiKey.generateKey();
  return apiKey.save();
};

// Static method to get API key by key
adminApiKeySchema.statics.getByKey = function(key: string) {
  return this.findOne({ 
    key, 
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  });
};

// Static method to get API keys by creator
adminApiKeySchema.statics.getByCreator = function(createdBy: string) {
  return this.find({ createdBy })
    .sort({ createdAt: -1 });
};

// Static method to get active API keys
adminApiKeySchema.statics.getActiveKeys = function() {
  return this.find({ 
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  })
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to cleanup expired keys
adminApiKeySchema.statics.cleanupExpiredKeys = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// Static method to get API key statistics
adminApiKeySchema.statics.getApiKeyStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalKeys: { $sum: 1 },
        activeKeys: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        expiredKeys: {
          $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] }
        },
        totalUsage: { $sum: '$usageCount' },
        avgUsage: { $avg: '$usageCount' },
        keysByCreator: {
          $push: {
            creator: '$createdBy',
            count: 1,
          },
        },
      },
    },
  ]);
};

// Static method to validate API key format
adminApiKeySchema.statics.validateApiKey = function(key: string) {
  // API key should be 64 characters long (32 bytes hex)
  return typeof key === 'string' && key.length === 64 && /^[a-f0-9]+$/i.test(key);
};

export default mongoose.model<IAdminApiKey>('AdminApiKey', adminApiKeySchema);
