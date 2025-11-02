export {};// Added to mark file as a module
const mongoose = require('mongoose');

const moderationSettingsSchema = new mongoose.Schema({
    // AI Provider Configuration
    provider: {
        type: String,
        enum: ['openai', 'deepseek', 'mock'],
        default: 'mock',
    },
    apiKeys: {
        openai: { type: String, default: '' },
        deepseek: { type: String, default: '' },
    },

    // Text content thresholds (0.0 to 1.0)
    textThresholds: {
        toxicity: { type: Number, default: 0.7, min: 0, max: 1 },
        hate_speech: { type: Number, default: 0.8, min: 0, max: 1 },
        sexual_content: { type: Number, default: 0.7, min: 0, max: 1 },
        violence: { type: Number, default: 0.75, min: 0, max: 1 },
        spam: { type: Number, default: 0.6, min: 0, max: 1 },
    },

    // Image content thresholds
    imageThresholds: {
        explicit: { type: Number, default: 0.75, min: 0, max: 1 },
        suggestive: { type: Number, default: 0.8, min: 0, max: 1 },
        violence: { type: Number, default: 0.8, min: 0, max: 1 },
        gore: { type: Number, default: 0.9, min: 0, max: 1 },
    },

    // Auto-actions configuration
    autoActions: {
        block: { type: Boolean, default: false },
        flag_for_review: { type: Boolean, default: true },
        notify_admins: { type: Boolean, default: true },
    },

    // Enabled categories for each type
    enabledCategories: {
        text: {
            type: [String],
            default: ['toxicity', 'hate_speech', 'sexual_content', 'violence', 'spam'],
        },
        image: {
            type: [String],
            default: ['explicit', 'suggestive', 'violence', 'gore'],
        },
    },

    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ModerationSettings', moderationSettingsSchema);
