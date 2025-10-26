import mongoose from 'mongoose';

export interface IMapPin extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  activity: string;
  message?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  radiusMeters: number;
  shareToMap: boolean;
  active: boolean;
  likes: Array<{
    userId: mongoose.Types.ObjectId;
    likedAt: Date;
  }>;
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const mapPinSchema = new mongoose.Schema<IMapPin>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  activity: {
    type: String,
    required: true,
    enum: ['walk', 'play', 'feeding', 'rest', 'training', 'lost_pet'],
    index: true
  },
  message: {
    type: String,
    maxlength: 140
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  radiusMeters: {
    type: Number,
    default: 500,
    min: 200,
    max: 3000
  },
  shareToMap: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: 280
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
mapPinSchema.index({ location: '2dsphere' });
mapPinSchema.index({ userId: 1, active: 1 });
mapPinSchema.index({ createdAt: -1 });

const MapPin = mongoose.model<IMapPin>('MapPin', mapPinSchema);
export default MapPin;

