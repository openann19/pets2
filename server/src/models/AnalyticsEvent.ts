import mongoose, { Schema, Document } from 'mongoose';
import { IAnalyticsEvent } from '../types';

const analyticsEventSchema = new Schema<IAnalyticsEvent>({
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

export default mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
