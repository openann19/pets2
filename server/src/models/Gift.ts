/**
 * Gift Model
 * Stores virtual gifts sent between matched users
 */
import mongoose, { Schema, model, type Model } from 'mongoose';

export interface IGift {
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  giftType: 'treat' | 'toy' | 'premium';
  message?: string;
  sentAt: Date;
  viewedAt?: Date;
  status: 'sent' | 'viewed' | 'opened';
}

const GiftSchema = new Schema<IGift>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    giftType: {
      type: String,
      enum: ['treat', 'toy', 'premium'],
      required: true,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    viewedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['sent', 'viewed', 'opened'],
      default: 'sent',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
GiftSchema.index({ recipientId: 1, status: 1, sentAt: -1 });
GiftSchema.index({ senderId: 1, sentAt: -1 });
GiftSchema.index({ matchId: 1 });

const Gift: Model<IGift> = mongoose.models.Gift || model<IGift>('Gift', GiftSchema);

export default Gift;

