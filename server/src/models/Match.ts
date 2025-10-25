import mongoose, { Schema, Document } from 'mongoose';
import { IMatch } from '../types';

const matchSchema = new Schema<IMatch>({
  // Match Participants
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  pets: [{
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  }],
  
  // Match Details
  matchType: {
    type: String,
    enum: ['adoption', 'mating', 'playdate', 'general'],
    required: [true, 'Match type is required']
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  aiRecommendationReason: {
    type: String,
    maxlength: [500, 'AI reason cannot exceed 500 characters']
  },
  
  // Match Status
  status: {
    type: String,
    enum: ['pending', 'matched', 'unmatched', 'blocked'],
    default: 'pending'
  },
  
  // Communication
  messages: [{
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'location', 'system'],
      default: 'text'
    },
    attachments: [{
      type: String, // URL to attachment
      fileType: String,
      fileName: String
    }],
    readBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Match Timeline
  matchedAt: {
    type: Date,
    default: null
  },
  unmatchedAt: {
    type: Date,
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: null
  },
  
  // Preferences & Settings
  preferences: {
    allowMessages: { type: Boolean, default: true },
    allowPhotos: { type: Boolean, default: true },
    allowLocation: { type: Boolean, default: false },
    notificationSettings: {
      newMessage: { type: Boolean, default: true },
      matchUpdate: { type: Boolean, default: true }
    }
  },
  
  // Analytics
  analytics: {
    messageCount: { type: Number, default: 0 },
    photoCount: { type: Number, default: 0 },
    lastActivityAt: Date,
    totalInteractionTime: { type: Number, default: 0 }, // in minutes
    user1Engagement: { type: Number, default: 0 },
    user2Engagement: { type: Number, default: 0 }
  },
  
  // Moderation
  moderation: {
    isFlagged: { type: Boolean, default: false },
    flaggedBy: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      flaggedAt: { type: Date, default: Date.now }
    }],
    adminNotes: String,
    isBlocked: { type: Boolean, default: false },
    blockedAt: Date,
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
matchSchema.index({ users: 1 });
matchSchema.index({ pets: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ createdAt: -1 });
matchSchema.index({ matchedAt: -1 });
matchSchema.index({ lastMessageAt: -1 });
matchSchema.index({ 'moderation.isFlagged': 1 });

// Virtual for unread message count per user
matchSchema.virtual('unreadCount').get(function() {
  return (userId: string) => {
    if (!this.messages || this.messages.length === 0) return 0;
    
    const userMessages = this.messages.filter(msg => 
      msg.sender.toString() !== userId
    );
    
    return userMessages.filter(msg => 
      !msg.readBy.some(read => read.user.toString() === userId)
    ).length;
  };
});

// Virtual for last message
matchSchema.virtual('lastMessage').get(function() {
  if (!this.messages || this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Virtual for is active (has recent activity)
matchSchema.virtual('isActive').get(function() {
  if (!this.lastMessageAt) return false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.lastMessageAt > thirtyDaysAgo;
});

// Pre-save middleware to update timestamps
matchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update lastMessageAt when messages are added
  if (this.messages && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.createdAt;
  }
  
  next();
});

// Pre-save middleware to set matchedAt when status changes to matched
matchSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'matched' && !this.matchedAt) {
    this.matchedAt = new Date();
  }
  
  if (this.isModified('status') && this.status === 'unmatched' && !this.unmatchedAt) {
    this.unmatchedAt = new Date();
  }
  
  next();
});

// Instance method to add message
matchSchema.methods.addMessage = function(senderId: string, content: string, messageType: string = 'text', attachments?: any[]) {
  const message = {
    sender: senderId,
    content,
    messageType,
    attachments: attachments || [],
    readBy: [],
    createdAt: new Date()
  };
  
  this.messages.push(message);
  this.analytics.messageCount = (this.analytics.messageCount || 0) + 1;
  
  return this.save();
};

// Instance method to mark message as read
matchSchema.methods.markAsRead = function(userId: string, messageId?: string) {
  if (messageId) {
    // Mark specific message as read
    const message = this.messages.id(messageId);
    if (message) {
      const existingRead = message.readBy.find(read => read.user.toString() === userId);
      if (!existingRead) {
        message.readBy.push({
          user: userId,
          readAt: new Date()
        });
      }
    }
  } else {
    // Mark all messages as read for this user
    this.messages.forEach(message => {
      if (message.sender.toString() !== userId) {
        const existingRead = message.readBy.find(read => read.user.toString() === userId);
        if (!existingRead) {
          message.readBy.push({
            user: userId,
            readAt: new Date()
          });
        }
      }
    });
  }
  
  return this.save();
};

// Instance method to unmatch
matchSchema.methods.unmatch = function(userId: string, reason?: string) {
  this.status = 'unmatched';
  this.unmatchedAt = new Date();
  
  // Add system message about unmatch
  this.addMessage('system', `Match ended${reason ? `: ${reason}` : ''}`, 'system');
  
  return this.save();
};

// Instance method to block match
matchSchema.methods.block = function(userId: string, reason?: string) {
  this.status = 'blocked';
  this.moderation.isBlocked = true;
  this.moderation.blockedAt = new Date();
  this.moderation.blockedBy = userId;
  
  // Add system message about block
  this.addMessage('system', `Match blocked${reason ? `: ${reason}` : ''}`, 'system');
  
  return this.save();
};

// Instance method to calculate engagement score
matchSchema.methods.calculateEngagement = function() {
  if (!this.messages || this.messages.length === 0) {
    this.analytics.user1Engagement = 0;
    this.analytics.user2Engagement = 0;
    return;
  }
  
  const user1Id = this.users[0].toString();
  const user2Id = this.users[1].toString();
  
  const user1Messages = this.messages.filter(msg => msg.sender.toString() === user1Id).length;
  const user2Messages = this.messages.filter(msg => msg.sender.toString() === user2Id).length;
  
  this.analytics.user1Engagement = user1Messages;
  this.analytics.user2Engagement = user2Messages;
  
  return this.save();
};

// Static method to find matches for user
matchSchema.statics.findByUser = function(userId: string, status?: string) {
  const query: any = { users: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('users pets');
};

// Static method to find active matches
matchSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: ['pending', 'matched'] },
    'moderation.isBlocked': false 
  });
};

// Static method to find matches with unread messages
matchSchema.statics.findWithUnreadMessages = function(userId: string) {
  return this.find({
    users: userId,
    status: { $in: ['pending', 'matched'] },
    'moderation.isBlocked': false
  }).populate('users pets');
};

export default mongoose.model<IMatch>('Match', matchSchema);
