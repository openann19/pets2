import mongoose, { Schema, Document } from 'mongoose';
import { IUserMute } from '../types';

const userMuteSchema = new Schema<IUserMute>({
  muterId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true,
  },
  mutedId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true,
  },
  reason: { 
    type: String, 
    maxlength: 1000,
    trim: true,
  },
  category: {
    type: String,
    enum: ['harassment', 'spam', 'inappropriate_content', 'safety', 'other'],
    default: 'other',
    index: true,
  },
  durationMinutes: { 
    type: Number, 
    default: 0,
    min: 0,
  },
  expiresAt: { 
    type: Date,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true,
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

// Compound unique index to prevent duplicate mutes
userMuteSchema.index({ muterId: 1, mutedId: 1 }, { unique: true });
userMuteSchema.index({ expiresAt: 1 });
userMuteSchema.index({ createdAt: -1 });

// Virtual for time remaining
userMuteSchema.virtual('timeRemaining').get(function() {
  if (!this.expiresAt) return 'Permanent';
  
  const now = new Date();
  const remaining = this.expiresAt.getTime() - now.getTime();
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

// Virtual for is expired
userMuteSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for is permanent
userMuteSchema.virtual('isPermanent').get(function() {
  return !this.expiresAt;
});

// Pre-save middleware to set expiration
userMuteSchema.pre('save', function(next) {
  if (this.durationMinutes > 0 && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + this.durationMinutes * 60 * 1000);
  }
  next();
});

// Instance method to extend mute
userMuteSchema.methods.extendMute = function(additionalMinutes: number) {
  if (this.expiresAt) {
    this.expiresAt = new Date(this.expiresAt.getTime() + additionalMinutes * 60 * 1000);
  } else {
    this.expiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000);
  }
  this.durationMinutes += additionalMinutes;
  return this.save();
};

// Instance method to unmute
userMuteSchema.methods.unmute = function() {
  this.isActive = false;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to reactivate mute
userMuteSchema.methods.reactivate = function() {
  this.isActive = true;
  this.updatedAt = new Date();
  return this.save();
};

// Static method to mute user
userMuteSchema.statics.muteUser = function(muterId: string, mutedId: string, durationMinutes?: number, reason?: string, category?: string) {
  const muteData: any = {
    muterId,
    mutedId,
    reason,
    category: category || 'other',
    isActive: true,
    createdAt: new Date(),
  };
  
  if (durationMinutes && durationMinutes > 0) {
    muteData.durationMinutes = durationMinutes;
    muteData.expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  }
  
  return this.findOneAndUpdate(
    { muterId, mutedId },
    muteData,
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Static method to unmute user
userMuteSchema.statics.unmuteUser = function(muterId: string, mutedId: string) {
  return this.findOneAndUpdate(
    { muterId, mutedId },
    { 
      isActive: false,
      updatedAt: new Date(),
    },
    { new: true }
  );
};

// Static method to check if user is muted
userMuteSchema.statics.isUserMuted = function(muterId: string, mutedId: string) {
  return this.findOne({ 
    muterId, 
    mutedId, 
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  });
};

// Static method to get muted users
userMuteSchema.statics.getMutedUsers = function(userId: string) {
  return this.find({ 
    muterId: userId, 
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  })
    .populate('mutedId', 'firstName lastName avatar')
    .sort({ createdAt: -1 });
};

// Static method to get users who muted this user
userMuteSchema.statics.getUsersWhoMuted = function(userId: string) {
  return this.find({ 
    mutedId: userId, 
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  })
    .populate('muterId', 'firstName lastName avatar')
    .sort({ createdAt: -1 });
};

// Static method to cleanup expired mutes
userMuteSchema.statics.cleanupExpiredMutes = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isActive: true,
    },
    { 
      isActive: false,
      updatedAt: new Date(),
    }
  );
};

// Static method to get mute statistics
userMuteSchema.statics.getMuteStats = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalMutes: { $sum: 1 },
        activeMutes: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        permanentMutes: {
          $sum: { $cond: [{ $eq: ['$expiresAt', null] }, 1, 0] }
        },
        temporaryMutes: {
          $sum: { $cond: [{ $ne: ['$expiresAt', null] }, 1, 0] }
        },
        mutesByCategory: {
          $push: {
            category: '$category',
            count: 1,
          },
        },
        uniqueMuters: { $addToSet: '$muterId' },
        uniqueMuted: { $addToSet: '$mutedId' },
      },
    },
    {
      $project: {
        totalMutes: 1,
        activeMutes: 1,
        permanentMutes: 1,
        temporaryMutes: 1,
        uniqueMuters: { $size: '$uniqueMuters' },
        uniqueMuted: { $size: '$uniqueMuted' },
        mutesByCategory: 1,
      },
    },
  ]);
};

// Static method to get mutes by category
userMuteSchema.statics.getMutesByCategory = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        avgDuration: { $avg: '$durationMinutes' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

export default mongoose.model<IUserMute>('UserMute', userMuteSchema);
