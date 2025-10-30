import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import type {
  IConversation,
  IConversationMethods,
  IConversationModel,
  IConversationMessage,
  IConversationMessageRead,
  IConversationDocument
} from '../types/mongoose.d';

/**
 * Conversation Message Schema
 */
const messageSchema = new Schema<IConversationMessage>({
  sender: { type: String, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  messageType: { type: String, enum: ['text', 'location', 'image', 'system'], default: 'text' },
  attachments: [{ type: String }],
  reactions: [{
    userId: { type: String, ref: 'User' },
    emoji: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  sentAt: { type: Date, default: Date.now },
  readBy: [{
    user: { type: String, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }]
}, { _id: true });

/**
 * Conversation Schema
 */
const conversationSchema = new Schema<IConversation, IConversationModel, IConversationMethods>({
  participants: [{ type: String, ref: 'User', required: true }],
  lastMessageAt: { type: Date, default: Date.now },
  messages: { type: [messageSchema], default: [] },
  isArchivedBy: [{ type: String, ref: 'User' }],
  isUserBlocked: [{ type: String, ref: 'User' }],
  userActions: {
    blockedBy: [{ type: String, ref: 'User' }],
    favoritedBy: [{ type: String, ref: 'User' }],
    archivedBy: [{ type: String, ref: 'User' }]
  }
}, { timestamps: true });

// Indexes for performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ 'messages._id': 1 });

/**
 * Find or create a one-to-one conversation between two users
 */
conversationSchema.statics.findOrCreateOneToOne = async function(userA: string, userB: string) {
  const ids = [String(userA), String(userB)].sort();
  let conv = await this.findOne({ participants: { $all: ids, $size: 2 } });
  if (conv) return conv;
  conv = new this({ participants: ids });
  await conv.save();
  return conv;
};

/**
 * Add a message to the conversation
 */
conversationSchema.methods.addMessage = async function(this: IConversationDocument, senderId: string, content: string, attachments: string[] = []): Promise<IConversationDocument> {
  const msg = {
    sender: senderId,
    content,
    attachments,
    sentAt: new Date(),
    readBy: [{ user: senderId, readAt: new Date() }]
  };
  
  this.messages.push(msg);
  this.lastMessageAt = new Date();
  await this.save();
  return this.messages[this.messages.length - 1];
};

/**
 * Mark messages as read for a user
 */
conversationSchema.methods.markMessagesAsRead = async function(this: IConversationDocument, userId: string): Promise<boolean> {
  let changed = false;
  for (const msg of this.messages) {
    const isSender = String(msg.sender) === String(userId);
    const already = (msg.readBy || []).some((r: IConversationMessageRead) => String(r.user) === String(userId));
    if (!isSender && !already) {
      msg.readBy = msg.readBy || [];
      msg.readBy.push({ user: userId, readAt: new Date() });
      changed = true;
    }
  }
  if (changed) await this.save();
  return changed;
};

/**
 * Toggle archive status for a user
 */
conversationSchema.methods.toggleArchive = async function(this: IConversationDocument, userId: string): Promise<void> {
  const userActions = this.userActions || {};
  const archivedBy = userActions.archivedBy || [];
  const index = archivedBy.indexOf(userId);
  
  if (index > -1) {
    archivedBy.splice(index, 1);
  } else {
    archivedBy.push(userId);
  }
  
  if (!this.userActions) this.userActions = {};
  this.userActions.archivedBy = archivedBy;
  await this.save();
};

/**
 * Toggle favorite status for a user
 */
conversationSchema.methods.toggleFavorite = async function(this: IConversationDocument, userId: string): Promise<void> {
  const userActions = this.userActions || {};
  const favoritedBy = userActions.favoritedBy || [];
  const index = favoritedBy.indexOf(userId);
  
  if (index > -1) {
    favoritedBy.splice(index, 1);
  } else {
    favoritedBy.push(userId);
  }
  
  if (!this.userActions) this.userActions = {};
  this.userActions.favoritedBy = favoritedBy;
  await this.save();
};

/**
 * Paginate messages with cursor by message _id (ObjectId chronological ordering)
 * Returns messages in ascending order (oldest -> newest) for UI simplicity
 */
conversationSchema.statics.getMessagesPage = async function(conversationId: string, { before, limit = 20 }: { before?: string; limit?: number }): Promise<any> {
  limit = Math.max(1, Math.min(limit || 20, 100));

  const match = { _id: conversationId };
  const beforeCond = before ? { $lt: ['$$m._id', new mongoose.Types.ObjectId(String(before))] } : true;

  const [doc] = await this.aggregate([
    { $match: match },
    {
      $project: {
        messagesFiltered: {
          $filter: { input: '$messages', as: 'm', cond: before ? beforeCond : { $const: true } }
        }
      }
    },
    {
      $project: {
        count: { $size: '$messagesFiltered' },
        page: { $slice: ['$messagesFiltered', -limit] }
      }
    },
    {
      $project: {
        page: 1,
        hasMore: { $gt: ['$count', limit] },
        nextCursor: { $arrayElemAt: ['$page._id', 0] }
      }
    }
  ]);

  // Ensure ascending order
  const messages = (doc?.page || []).sort((a: IConversationMessage, b: IConversationMessage) => 
    (a.sentAt || a._id?.getTimestamp?.call({ _id: a._id })).getTime() - (b.sentAt || b._id?.getTimestamp?.call({ _id: b._id })).getTime()
  );
  const nextCursor = doc?.hasMore ? (doc?.nextCursor || (messages[0] && messages[0]._id)) : null;
  return { messages, nextCursor, hasMore: Boolean(doc?.hasMore) };
};

export type IConversationDocument = HydratedDocument<IConversation, IConversationMethods>;

// Export the model
const Conversation = mongoose.model<IConversation, IConversationModel>('Conversation', conversationSchema);

export default Conversation;
