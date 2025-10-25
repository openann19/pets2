import mongoose, { Schema, Document } from 'mongoose';
import { IModerationSettings } from '../types';

const moderationSettingsSchema = new Schema<IModerationSettings>({
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

  // General settings
  autoModerationEnabled: {
    type: Boolean,
    default: true,
  },
  aiConfidenceThreshold: {
    type: Number,
    default: 0.8,
    min: 0,
    max: 1,
  },
  humanReviewRequired: {
    type: Boolean,
    default: true,
  },
  blockedKeywords: [{
    type: String,
    trim: true,
  }],
  allowedDomains: [{
    type: String,
    trim: true,
  }],
  maxReportThreshold: {
    type: Number,
    default: 5,
    min: 1,
  },
  
  // Notification settings
  notifyOnFlag: {
    type: Boolean,
    default: true,
  },
  notifyOnEscalation: {
    type: Boolean,
    default: true,
  },
  
  // Review settings
  reviewQueueSize: {
    type: Number,
    default: 100,
    min: 10,
    max: 1000,
  },
  autoApproveThreshold: {
    type: Number,
    default: 0.95,
    min: 0,
    max: 1,
  },
  
  // Audit settings
  logAllDecisions: {
    type: Boolean,
    default: true,
  },
  retentionDays: {
    type: Number,
    default: 90,
    min: 1,
    max: 365,
  },
  
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
moderationSettingsSchema.index({ updatedBy: 1 });
moderationSettingsSchema.index({ updatedAt: -1 });

// Virtual for is strict mode
moderationSettingsSchema.virtual('isStrictMode').get(function() {
  return this.aiConfidenceThreshold > 0.8 && this.humanReviewRequired;
});

// Virtual for is lenient mode
moderationSettingsSchema.virtual('isLenientMode').get(function() {
  return this.aiConfidenceThreshold < 0.6 && !this.humanReviewRequired;
});

// Instance method to update thresholds
moderationSettingsSchema.methods.updateThresholds = function(thresholds: {
  textThresholds?: any;
  imageThresholds?: any;
}, updatedBy: string) {
  if (thresholds.textThresholds) {
    this.textThresholds = { ...this.textThresholds, ...thresholds.textThresholds };
  }
  if (thresholds.imageThresholds) {
    this.imageThresholds = { ...this.imageThresholds, ...thresholds.imageThresholds };
  }
  
  this.updatedBy = updatedBy as any;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to add blocked keyword
moderationSettingsSchema.methods.addBlockedKeyword = function(keyword: string) {
  if (!this.blockedKeywords.includes(keyword)) {
    this.blockedKeywords.push(keyword);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove blocked keyword
moderationSettingsSchema.methods.removeBlockedKeyword = function(keyword: string) {
  this.blockedKeywords = this.blockedKeywords.filter(k => k !== keyword);
  return this.save();
};

// Instance method to add allowed domain
moderationSettingsSchema.methods.addAllowedDomain = function(domain: string) {
  if (!this.allowedDomains.includes(domain)) {
    this.allowedDomains.push(domain);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove allowed domain
moderationSettingsSchema.methods.removeAllowedDomain = function(domain: string) {
  this.allowedDomains = this.allowedDomains.filter(d => d !== domain);
  return this.save();
};

// Instance method to enable auto moderation
moderationSettingsSchema.methods.enableAutoModeration = function() {
  this.autoModerationEnabled = true;
  return this.save();
};

// Instance method to disable auto moderation
moderationSettingsSchema.methods.disableAutoModeration = function() {
  this.autoModerationEnabled = false;
  return this.save();
};

// Instance method to set strict mode
moderationSettingsSchema.methods.setStrictMode = function() {
  this.aiConfidenceThreshold = 0.9;
  this.humanReviewRequired = true;
  this.autoApproveThreshold = 0.98;
  return this.save();
};

// Instance method to set lenient mode
moderationSettingsSchema.methods.setLenientMode = function() {
  this.aiConfidenceThreshold = 0.5;
  this.humanReviewRequired = false;
  this.autoApproveThreshold = 0.8;
  return this.save();
};

// Static method to get current settings
moderationSettingsSchema.statics.getCurrentSettings = function() {
  return this.findOne().sort({ updatedAt: -1 });
};

// Static method to update settings
moderationSettingsSchema.statics.updateSettings = function(settingsData: any, updatedBy: string) {
  return this.findOneAndUpdate(
    {},
    {
      ...settingsData,
      updatedBy,
      updatedAt: new Date(),
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Static method to reset to defaults
moderationSettingsSchema.statics.resetToDefaults = function(updatedBy: string) {
  return this.findOneAndUpdate(
    {},
    {
      provider: 'mock',
      apiKeys: {
        openai: '',
        deepseek: '',
      },
      textThresholds: {
        toxicity: 0.7,
        hate_speech: 0.8,
        sexual_content: 0.7,
        violence: 0.75,
        spam: 0.6,
      },
      imageThresholds: {
        explicit: 0.75,
        suggestive: 0.8,
        violence: 0.8,
        gore: 0.9,
      },
      autoModerationEnabled: true,
      aiConfidenceThreshold: 0.8,
      humanReviewRequired: true,
      blockedKeywords: [],
      allowedDomains: [],
      maxReportThreshold: 5,
      notifyOnFlag: true,
      notifyOnEscalation: true,
      reviewQueueSize: 100,
      autoApproveThreshold: 0.95,
      logAllDecisions: true,
      retentionDays: 90,
      updatedBy,
      updatedAt: new Date(),
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Static method to get settings history
moderationSettingsSchema.statics.getSettingsHistory = function(limit: number = 10) {
  return this.find()
    .populate('updatedBy', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .limit(limit);
};

export default mongoose.model<IModerationSettings>('ModerationSettings', moderationSettingsSchema);
