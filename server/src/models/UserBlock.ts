import mongoose from 'mongoose';

const userBlockSchema = new mongoose.Schema({
    blockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blockedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now }
});

userBlockSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
userBlockSchema.index({ blockerId: 1 });
userBlockSchema.index({ blockedUserId: 1 });

export default mongoose.model('UserBlock', userBlockSchema);

