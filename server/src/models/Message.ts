import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'location'],
    default: 'text'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ recipientId: 1, read: 1 });
messageSchema.index({ senderId: 1, recipientId: 1 });
messageSchema.index({ matchId: 1 });

export default mongoose.model('Message', messageSchema);

