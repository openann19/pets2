const mongoose = require('mongoose');
const { Schema } = mongoose;

// This model logs all admin activities for audit and compliance purposes
const adminActivityLogSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      // Action types should follow a consistent naming pattern: VERB_RESOURCE_ACTION
      // e.g., UPDATE_STRIPE_CONFIG, DELETE_USER, CREATE_PROMOTION, etc.
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    }
  },
  {
    timestamps: true,
    collection: 'admin_activity_logs',
  }
);

// Create compound index for efficient querying
adminActivityLogSchema.index({ adminId: 1, action: 1, timestamp: -1 });

module.exports = mongoose.models.AdminActivityLog || mongoose.model('AdminActivityLog', adminActivityLogSchema);
