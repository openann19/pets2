/**
 * Notification Preference Model
 * Stores user notification preferences and settings
 */

const mongoose = require('mongoose');

const quietHoursSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  start: {
    type: String,
    default: '22:00',
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  end: {
    type: String,
    default: '08:00',
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  }
}, { _id: false });

const notificationPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  matches: {
    type: Boolean,
    default: true
  },
  messages: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Boolean,
    default: true
  },
  reminders: {
    type: Boolean,
    default: true
  },
  quietHours: {
    type: quietHoursSchema,
    default: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  frequency: {
    type: String,
    enum: ['instant', 'batched', 'daily'],
    default: 'instant'
  },
  sound: {
    type: Boolean,
    default: true
  },
  vibration: {
    type: Boolean,
    default: true
  },
  pushToken: {
    type: String,
    sparse: true
  },
  deviceInfo: {
    type: {
      platform: String,
      version: String,
      model: String
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationPreferenceSchema.index({ userId: 1 });
notificationPreferenceSchema.index({ enabled: 1 });
notificationPreferenceSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
