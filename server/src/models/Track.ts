import mongoose, { Schema, Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * Track - Licensed music tracks for reels
 */
export interface ITrack {
  _id: mongoose.Types.ObjectId;
  title: string;
  artist: string;
  bpm: number; // Beats per minute (for beat sync)
  duration: number; // Track duration in seconds
  licenseId: string;
  licenseExpiry: Date;
  url: string; // S3/CDN URL
  waveformJson: string; // JSON array for audio visualization
  genre?: string;
  mood?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ITrackModel extends Model<ITrack> {
  findActive(): Promise<ITrack[]>;
  findByGenre(genre: string): Promise<ITrack[]>;
  findByMood(mood: string): Promise<ITrack[]>;
  validateLicense(trackId: mongoose.Types.ObjectId): Promise<boolean>;
}

const trackSchema = new Schema<ITrack, ITrackModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    bpm: {
      type: Number,
      required: true,
      min: 60,
      max: 200,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
    },
    licenseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    waveformJson: {
      type: String,
      required: true,
      default: '[]',
    },
    genre: {
      type: String,
      enum: ['pop', 'electronic', 'hip-hop', 'rock', 'folk', 'jazz', 'classical'],
      index: true,
    },
    mood: {
      type: String,
      enum: ['happy', 'energetic', 'chill', 'dramatic', 'romantic', 'funny'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
trackSchema.index({ isActive: 1, genre: 1, mood: 1 });
trackSchema.index({ licenseExpiry: 1 });

// Static methods
trackSchema.statics.findActive = function () {
  return this.find({ isActive: true, licenseExpiry: { $gte: new Date() } });
};

trackSchema.statics.findByGenre = function (genre: string) {
  return this.find({ isActive: true, genre, licenseExpiry: { $gte: new Date() } });
};

trackSchema.statics.findByMood = function (mood: string) {
  return this.find({ isActive: true, mood, licenseExpiry: { $gte: new Date() } });
};

trackSchema.statics.validateLicense = async function (trackId: mongoose.Types.ObjectId) {
  const track = await this.findById(trackId);
  if (!track) return false;
  if (!track.isActive) return false;
  return track.licenseExpiry > new Date();
};

const Track: ITrackModel = mongoose.model<ITrack, ITrackModel>('Track', trackSchema);

export default Track;
export type TrackDocument = HydratedDocument<ITrack>;

