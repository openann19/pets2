import mongoose, { Schema, Document } from 'mongoose';
import { IConversation } from '../types';

const messageSchema = new Schema({
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    maxlength: 1000 
  },
  attachments: [{ 
    type: String 
  }],
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
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
}, { _id: true });

const conversationSchema = new Schema<IConversation>({
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  matchId: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  lastMessage: {
    content: String,
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  messages: { 
    type: [messageSchema], 
    default: [] 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ matchId: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ 'messages._id': 1 });

// Static method to find or create one-to-one conversation
conversationSchema.statics.findOrCreateOneToOne = async function(userA: string, userB: string, matchId: string) {
  const ids = [String(userA), String(userB)].sort();
  let conv = await this.findOne({ 
    participants: { $all: ids, $size: 2 },
    matchId 
  });
  
  if (conv) return conv;
  
  conv = new this({ 
    participants: ids,
    matchId,
    isActive: true
  });
  await conv.save();
  return conv;
};

// Instance method to add message
conversationSchema.methods.addMessage = async function(senderId: string, content: string, attachments: string[] = []) {
  const msg = { 
    sender: senderId, 
    content, 
    attachments, 
    sentAt: new Date(), 
    readBy: [{ 
      user: senderId, 
      readAt: new Date() 
    }] 
  };
  
  this.messages.push(msg);
  this.lastMessage = {
    content,
    senderId,
    timestamp: new Date()
  };
  
  await this.save();
  return this.messages[this.messages.length - 1];
};

// Instance method to mark messages as read
conversationSchema.methods.markMessagesAsRead = async function(userId: string) {
  let changed = false;
  
  this.messages.forEach((message: any) => {
    if (message.sender.toString() !== userId) {
      const alreadyRead = message.readBy.some((read: any) => 
        read.user.toString() === userId
      );
      
      if (!alreadyRead) {
        message.readBy.push({
          user: userId,
          readAt: new Date()
        });
        changed = true;
      }
    }
  });
  
  if (changed) {
    await this.save();
  }
  
  return changed;
};

// Instance method to get unread count for user
conversationSchema.methods.getUnreadCount = function(userId: string): number {
  return this.messages.filter((message: any) => {
    return message.sender.toString() !== userId &&
           !message.readBy.some((read: any) => read.user.toString() === userId);
  }).length;
};

// Instance method to archive conversation
conversationSchema.methods.archive = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to reactivate conversation
conversationSchema.methods.reactivate = function() {
  this.isActive = true;
  return this.save();
};

// Static method to get user conversations
conversationSchema.statics.getUserConversations = function(userId: string, limit: number = 50) {
  return this.find({ 
    participants: userId,
    isActive: true 
  })
    .populate('participants', 'firstName lastName avatar')
    .populate('matchId')
    .sort({ 'lastMessage.timestamp': -1 })
    .limit(limit);
};

// Static method to get conversation by participants
conversationSchema.statics.getConversationByParticipants = function(userA: string, userB: string, matchId: string) {
  const ids = [String(userA), String(userB)].sort();
  return this.findOne({ 
    participants: { $all: ids, $size: 2 },
    matchId,
    isActive: true
  });
};

// Static method to cleanup old conversations
conversationSchema.statics.cleanupOldConversations = function(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.updateMany(
    {
      'lastMessage.timestamp': { $lt: cutoffDate },
      isActive: true
    },
    { isActive: false }
  );
};

export default mongoose.model<IConversation>('Conversation', conversationSchema);
