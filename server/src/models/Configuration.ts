export {};// Added to mark file as a module
const mongoose = require('mongoose');
const { Schema } = mongoose;

// This model stores configuration for external services such as Stripe, DeepSeek, Google Maps, etc.
// Sensitive fields (api keys, secrets) are stored encrypted.
const configurationSchema = new Schema(
  {
    // e.g. 'stripe', 'ai', 'maps', 'external-services:cloudinary', etc.
    type: {
      type: String,
      required: true,
      unique: true,
    },
    // Arbitrary config object; encrypted fields should already be encrypted before saving.
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'configurations',
  },
);

module.exports = mongoose.models.Configuration || mongoose.model('Configuration', configurationSchema);
