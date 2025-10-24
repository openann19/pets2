const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  eventType: { type: String, required: true, index: true },
  entityType: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  durationMs: { type: Number },
  success: { type: Boolean, default: true },
  errorCode: { type: String },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: false,
});

analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
