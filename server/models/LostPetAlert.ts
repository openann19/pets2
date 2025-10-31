/**
 * Lost Pet Alert Model
 * Enables reporting and tracking of lost pets with location and sighting features
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILostPetSighting {
  reporterId: mongoose.Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  description: string;
  photo?: string;
  timestamp: Date;
  verified: boolean;
}

export interface ILostPetAlert {
  petId: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  status: 'active' | 'found' | 'cancelled';
  lastSeenAt: Date;
  lastSeenLocation: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  description: string;
  reward?: number;
  contactInfo: {
    method: 'inapp' | 'phone' | 'email';
    value: string;
  };
  broadcastRadius: number; // km
  sightings: ILostPetSighting[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILostPetAlertDocument extends ILostPetAlert, Document {}

const LostPetSightingSchema = new Schema<ILostPetSighting>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coords: number[]) => coords.length === 2,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
      address: { type: String, required: true },
    },
    description: { type: String, required: true },
    photo: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
    verified: { type: Boolean, default: false },
  },
  { _id: true }
);

const LostPetAlertSchema = new Schema<ILostPetAlertDocument>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['active', 'found', 'cancelled'],
      required: true,
      default: 'active',
    },
    lastSeenAt: { type: Date, required: true },
    lastSeenLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coords: number[]) => coords.length === 2,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
      address: { type: String, required: true },
    },
    description: { type: String, required: true },
    reward: { type: Number, min: 0 },
    contactInfo: {
      method: {
        type: String,
        enum: ['inapp', 'phone', 'email'],
        required: true,
      },
      value: { type: String, required: true },
    },
    broadcastRadius: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
      max: 100,
    },
    sightings: [LostPetSightingSchema],
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
LostPetAlertSchema.index({ lastSeenLocation: '2dsphere' });
LostPetAlertSchema.index({ owner: 1, status: 1 });
LostPetAlertSchema.index({ petId: 1 });

const LostPetAlert: Model<ILostPetAlertDocument> = mongoose.model<ILostPetAlertDocument>(
  'LostPetAlert',
  LostPetAlertSchema
);

export default LostPetAlert;
