import mongoose, { Schema, Document } from 'mongoose';
import { INotificationPreference } from '../types';

/**
 * Notification Preference Model
 * Stores user notification preferences and settings
 */

const quietHoursSchema = new Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  start: {
    type: String,
    default: '22:00',
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  end: {
    type: String,
    default: '08:00',
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
}, { _id: false });

const notificationPreferenceSchema = new Schema<INotificationPreference>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: Boolean,
    default: true,
  },
  push: {
    type: Boolean,
    default: true,
  },
  sms: {
    type: Boolean,
    default: false,
  },
  types: {
    matches: {
      type: Boolean,
      default: true,
    },
    messages: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: Boolean,
      default: true,
    },
    system: {
      type: Boolean,
      default: true,
    },
    premium: {
      type: Boolean,
      default: true,
    },
    events: {
      type: Boolean,
      default: true,
    },
    reminders: {
      type: Boolean,
      default: true,
    },
    marketing: {
      type: Boolean,
      default: false,
    },
  },
  quietHours: {
    type: quietHoursSchema,
    default: () => ({}),
  },
  frequency: {
    type: String,
    enum: ['immediate', 'hourly', 'daily', 'weekly'],
    default: 'immediate',
  },
  digest: {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    time: {
      type: String,
      default: '09:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
  },
  timezone: {
    type: String,
    default: 'UTC',
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
notificationPreferenceSchema.index({ userId: 1 });
notificationPreferenceSchema.index({ email: 1 });
notificationPreferenceSchema.index({ push: 1 });

// Virtual for is in quiet hours
notificationPreferenceSchema.virtual('isInQuietHours').get(function() {
  if (!this.quietHours?.enabled) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const start = this.quietHours.start;
  const end = this.quietHours.end;
  
  // Handle quiet hours that span midnight
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  } else {
    return currentTime >= start && currentTime <= end;
  }
});

// Virtual for can receive notification
notificationPreferenceSchema.virtual('canReceiveNotification').get(function() {
  return (type: string, method: string) => {
    // Check if method is enabled
    if (method === 'email' && !this.email) return false;
    if (method === 'push' && !this.push) return false;
    if (method === 'sms' && !this.sms) return false;
    
    // Check if type is enabled
    if (this.types[type as keyof typeof this.types] === false) return false;
    
    // Check quiet hours
    if (this.isInQuietHours && method !== 'email') return false;
    
    return true;
  };
});

// Instance method to update preferences
notificationPreferenceSchema.methods.updatePreferences = function(preferences: {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  types?: any;
  quietHours?: any;
  frequency?: string;
  digest?: any;
  language?: string;
  timezone?: string;
}) {
  Object.assign(this, preferences);
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to enable notification type
notificationPreferenceSchema.methods.enableNotificationType = function(type: string) {
  if (this.types[type as keyof typeof this.types] !== undefined) {
    this.types[type as keyof typeof this.types] = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to disable notification type
notificationPreferenceSchema.methods.disableNotificationType = function(type: string) {
  if (this.types[type as keyof typeof this.types] !== undefined) {
    this.types[type as keyof typeof this.types] = false;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to enable quiet hours
notificationPreferenceSchema.methods.enableQuietHours = function(start: string, end: string) {
  this.quietHours = {
    enabled: true,
    start,
    end,
  };
  return this.save();
};

// Instance method to disable quiet hours
notificationPreferenceSchema.methods.disableQuietHours = function() {
  this.quietHours.enabled = false;
  return this.save();
};

// Instance method to enable digest
notificationPreferenceSchema.methods.enableDigest = function(frequency: string, time: string) {
  this.digest = {
    enabled: true,
    frequency,
    time,
  };
  return this.save();
};

// Instance method to disable digest
notificationPreferenceSchema.methods.disableDigest = function() {
  this.digest.enabled = false;
  return this.save();
};

// Static method to create preferences
notificationPreferenceSchema.statics.createPreferences = function(userId: string, preferences?: any) {
  return this.create({
    userId,
    ...preferences,
    createdAt: new Date(),
  });
};

// Static method to get user preferences
notificationPreferenceSchema.statics.getUserPreferences = function(userId: string) {
  return this.findOne({ userId });
};

// Static method to get preferences by notification type
notificationPreferenceSchema.statics.getPreferencesByType = function(type: string, enabled: boolean = true) {
  const query: any = {};
  query[`types.${type}`] = enabled;
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ updatedAt: -1 });
};

// Static method to get users with email notifications enabled
notificationPreferenceSchema.statics.getUsersWithEmailEnabled = function() {
  return this.find({ email: true })
    .populate('userId', 'firstName lastName email')
    .sort({ updatedAt: -1 });
};

// Static method to get users with push notifications enabled
notificationPreferenceSchema.statics.getUsersWithPushEnabled = function() {
  return this.find({ push: true })
    .populate('userId', 'firstName lastName email')
    .sort({ updatedAt: -1 });
};

// Static method to get users with SMS enabled
notificationPreferenceSchema.statics.getUsersWithSMSEnabled = function() {
  return this.find({ sms: true })
    .populate('userId', 'firstName lastName email phone')
    .sort({ updatedAt: -1 });
};

// Static method to get users with digest enabled
notificationPreferenceSchema.statics.getUsersWithDigestEnabled = function() {
  return this.find({ 'digest.enabled': true })
    .populate('userId', 'firstName lastName email')
    .sort({ updatedAt: -1 });
};

// Static method to get notification statistics
notificationPreferenceSchema.statics.getNotificationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        emailEnabled: {
          $sum: { $cond: ['$email', 1, 0] }
        },
        pushEnabled: {
          $sum: { $cond: ['$push', 1, 0] }
        },
        smsEnabled: {
          $sum: { $cond: ['$sms', 1, 0] }
        },
        digestEnabled: {
          $sum: { $cond: ['$digest.enabled', 1, 0] }
        },
        quietHoursEnabled: {
          $sum: { $cond: ['$quietHours.enabled', 1, 0] }
        },
        matchesEnabled: {
          $sum: { $cond: ['$types.matches', 1, 0] }
        },
        messagesEnabled: {
          $sum: { $cond: ['$types.messages', 1, 0] }
        },
        likesEnabled: {
          $sum: { $cond: ['$types.likes', 1, 0] }
        },
        systemEnabled: {
          $sum: { $cond: ['$types.system', 1, 0] }
        },
        premiumEnabled: {
          $sum: { $cond: ['$types.premium', 1, 0] }
        },
        marketingEnabled: {
          $sum: { $cond: ['$types.marketing', 1, 0] }
        },
      },
    },
  ]);
};

// Static method to get preferences by language
notificationPreferenceSchema.statics.getPreferencesByLanguage = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
        emailEnabled: {
          $sum: { $cond: ['$email', 1, 0] }
        },
        pushEnabled: {
          $sum: { $cond: ['$push', 1, 0] }
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to get preferences by timezone
notificationPreferenceSchema.statics.getPreferencesByTimezone = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$timezone',
        count: { $sum: 1 },
        emailEnabled: {
          $sum: { $cond: ['$email', 1, 0] }
        },
        pushEnabled: {
          $sum: { $cond: ['$push', 1, 0] }
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

export default mongoose.model<INotificationPreference>('NotificationPreference', notificationPreferenceSchema);
