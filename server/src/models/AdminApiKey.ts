import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { encrypt } from '../utils/encryption';

// This model stores API keys for the admin API
// It allows for programmatic access to the admin API
const adminApiKeySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
    },
    permissions: {
      read: {
        type: Boolean,
        default: true,
      },
      write: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
      services: {
        stripe: { type: Boolean, default: false },
        ai: { type: Boolean, default: false },
        maps: { type: Boolean, default: false },
        external: { type: Boolean, default: false },
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 31536000000), // Default 1 year expiry
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ipRestrictions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Statics for API key management
adminApiKeySchema.statics.generateApiKey = async function(name: string, userId: string, permissions: Record<string, unknown> = {}) {
  // Generate a secure random API key
  const key = `admin_${crypto.randomBytes(32).toString('hex')}`;
  
  // Create the API key document with encrypted key
  const apiKey = new this({
    name,
    key: encrypt(key),
    permissions,
    createdBy: userId,
  });
  
  await apiKey.save();
  
  // Return the plaintext key ONLY when first created
  // After this point, it will never be accessible in plaintext again
  return {
    id: apiKey._id,
    key,
    name: apiKey.name,
  };
};

// Method to record API key usage
adminApiKeySchema.methods.recordUsage = async function() {
  this.lastUsed = new Date();
  return this.save();
};

export default mongoose.models.AdminApiKey || mongoose.model('AdminApiKey', adminApiKeySchema);

