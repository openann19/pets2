import mongoose from 'mongoose';

export interface ILocationHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  petId?: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  activity?: string;
  timestamp: Date;
  syncedAt?: Date;
  createdAt: Date;
}

const locationHistorySchema = new mongoose.Schema<ILocationHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
    },
    altitude: {
      type: Number,
    },
    heading: {
      type: Number,
    },
    speed: {
      type: Number,
    },
    activity: {
      type: String,
      enum: ['walking', 'playing', 'feeding', 'resting', 'training', 'grooming', 'vet', 'park', 'other'],
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    syncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient queries
locationHistorySchema.index({ userId: 1, timestamp: -1 });
locationHistorySchema.index({ petId: 1, timestamp: -1 });
locationHistorySchema.index({ userId: 1, createdAt: -1 });

// 2dsphere index for geospatial queries
locationHistorySchema.index({ latitude: 1, longitude: 1 });

// TTL index - automatically delete records older than 90 days
locationHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const LocationHistory = mongoose.model<ILocationHistory>('LocationHistory', locationHistorySchema);

export default LocationHistory;

