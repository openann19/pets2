const mongoose = require('mongoose');

const userMuteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mutedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    durationMinutes: { type: Number, default: 0 },
    reason: { type: String, maxlength: 1000 },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

userMuteSchema.index({ userId: 1, mutedUserId: 1 }, { unique: true });
userMuteSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('UserMute', userMuteSchema);
