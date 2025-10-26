import mongoose from 'mongoose';

const userAuditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
        type: String,
        required: true,
        enum: ['story_create', 'story_delete', 'story_reply'],
        index: true,
    },
    resourceType: { type: String, enum: ['story'], required: true, default: 'story' },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    requestId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
}, {
    timestamps: true,
});

// Indexes
userAuditLogSchema.index({ userId: 1, createdAt: -1 });
userAuditLogSchema.index({ action: 1, createdAt: -1 });

// TTL (optional): keep 180 days
userAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export default mongoose.model('UserAuditLog', userAuditLogSchema);

