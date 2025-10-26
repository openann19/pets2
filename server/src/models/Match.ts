import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import {
  IMatch,
  IMatchMethods,
  IMatchModel,
  IMatchMessage,
  IMatchMessageAttachment,
  IMatchMeeting,
  IMatchUserActions,
  IMatchOutcome
} from '../types/mongoose.d';

/**
 * Match Schema
 */
const matchSchema = new Schema<IMatch, IMatchModel, IMatchMethods>({
  // Match Participants
  pet1: {
    type: String,
    ref: 'Pet',
    required: [true, 'First pet is required']
  },
  pet2: {
    type: String,
    ref: 'Pet',
    required: [true, 'Second pet is required']
  },
  user1: {
    type: String,
    ref: 'User',
    required: [true, 'First user is required']
  },
  user2: {
    type: String,
    ref: 'User',
    required: [true, 'Second user is required']
  },
  
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
    enum: ['active', 'archived', 'blocked', 'deleted', 'completed'],
    default: 'active'
  },
  
  // Communication
  messages: [{
    sender: {
      type: String,
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
        type: String,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    sentAt: {
      type: Date,
      default: Date.now
    },
    editedAt: Date,
    isEdited: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Meeting Planning
  meetings: [{
    proposedBy: {
      type: String,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Meeting title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Meeting description cannot exceed 500 characters']
    },
    proposedDate: {
      type: Date,
      required: true
    },
    location: {
      name: String,
      address: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'proposed'
    },
    responses: [{
      user: {
        type: String,
        ref: 'User'
      },
      response: {
        type: String,
        enum: ['accepted', 'declined', 'maybe']
      },
      respondedAt: {
        type: Date,
        default: Date.now
      },
      note: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: Date,
  messageCount: {
    type: Number,
    default: 0
  },
  
  // User Actions
  userActions: {
    user1: {
      isArchived: { type: Boolean, default: false },
      isBlocked: { type: Boolean, default: false },
      isFavorite: { type: Boolean, default: false },
      muteNotifications: { type: Boolean, default: false },
      lastSeen: Date
    },
    user2: {
      isArchived: { type: Boolean, default: false },
      isBlocked: { type: Boolean, default: false },
      isFavorite: { type: Boolean, default: false },
      muteNotifications: { type: Boolean, default: false },
      lastSeen: Date
    }
  },
  
  // Outcome Tracking (for analytics)
  outcome: {
    result: {
      type: String,
      enum: ['pending', 'met', 'adopted', 'mated', 'no-show', 'incompatible']
    },
    completedAt: Date,
    rating: {
      user1Rating: { type: Number, min: 1, max: 5 },
      user2Rating: { type: Number, min: 1, max: 5 }
    },
    feedback: {
      user1Feedback: String,
      user2Feedback: String
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
matchSchema.index({ user1: 1, user2: 1 });
matchSchema.index({ pet1: 1, pet2: 1 }, { unique: true });
matchSchema.index({ status: 1 });
matchSchema.index({ lastActivity: -1 });
matchSchema.index({ matchType: 1 });
matchSchema.index({ compatibilityScore: -1 });

// Virtual for getting the other user
matchSchema.virtual('getOtherUser').get(function(this: any) {
  return (currentUserId: string) => {
    return this.user1.toString() === currentUserId.toString() ? this.user2 : this.user1;
  };
});

// Virtual for getting the other pet
matchSchema.virtual('getOtherPet').get(function(this: any) {
  return (currentUserId: string) => {
    return this.user1.toString() === currentUserId.toString() ? this.pet2 : this.pet1;
  };
});

// Virtual for unread message count
matchSchema.virtual('getUnreadCount').get(function(this: any) {
  return (userId: string) => {
    return this.messages.filter((message: IMatchMessage) => 
      message.sender.toString() !== userId.toString() &&
      !message.readBy.some(read => read.user.toString() === userId.toString())
    ).length;
  };
});

// Pre-save middleware
matchSchema.pre('save', function(this: any, next) {
  // Update message count
  this.messageCount = this.messages.length;
  
  // Update last message timestamp
  if (this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].sentAt;
  }
  
  // Update last activity
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  
  next();
});

// Instance methods
matchSchema.methods.addMessage = function(this: any, senderId: string, content: string, messageType: string = 'text', attachments: IMatchMessageAttachment[] = []): Promise<any> {
  const message = {
    sender: senderId,
    content,
    messageType,
    attachments,
    sentAt: new Date()
  };
  
  this.messages.push(message);
  this.lastActivity = new Date();
  this.lastMessageAt = new Date();
  
  return this.save();
};

matchSchema.methods.markMessagesAsRead = function(this: any, userId: string): Promise<any> {
  const unreadMessages = this.messages.filter((message: IMatchMessage) => 
    message.sender.toString() !== userId.toString() &&
    !message.readBy.some(read => read.user.toString() === userId.toString())
  );
  
  unreadMessages.forEach((message: IMatchMessage) => {
    message.readBy.push({
      user: userId,
      readAt: new Date()
    });
  });
  
  // Update user's last seen
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  this.userActions[userKey].lastSeen = new Date();
  
  return this.save();
};

matchSchema.methods.isUserBlocked = function(this: any, userId: string): boolean {
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  const otherUserKey = userKey === 'user1' ? 'user2' : 'user1';
  
  return this.userActions[userKey].isBlocked || this.userActions[otherUserKey].isBlocked;
};

matchSchema.methods.toggleArchive = function(this: any, userId: string): Promise<any> {
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  this.userActions[userKey].isArchived = !this.userActions[userKey].isArchived;
  return this.save();
};

matchSchema.methods.toggleFavorite = function(this: any, userId: string): Promise<any> {
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  this.userActions[userKey].isFavorite = !this.userActions[userKey].isFavorite;
  return this.save();
};

// Static methods
matchSchema.statics.findActiveMatchesForUser = function(userId: string) {
  return this.find({
    status: 'active',
    $or: [
      { user1: userId, 'userActions.user1.isArchived': false },
      { user2: userId, 'userActions.user2.isArchived': false }
    ]
  }).populate('pet1 pet2 user1 user2', '-password -refreshTokens');
};

matchSchema.statics.findByPets = function(pet1Id: string, pet2Id: string) {
  return this.findOne({
    $or: [
      { pet1: pet1Id, pet2: pet2Id },
      { pet1: pet2Id, pet2: pet1Id }
    ]
  });
};

export type IMatchDocument = HydratedDocument<IMatch, IMatchMethods>;

// Export the model
const Match = mongoose.model<IMatch, IMatchModel>('Match', matchSchema);

export default Match;
