import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventLocation {
  name?: string;
  address?: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  date: Date;
  time?: string;
  category: 'playdate' | 'training' | 'adoption' | 'meetup' | 'general';
  maxAttendees: number;
  attendees: number;
  price: number;
  tags: string[];
  organizer: mongoose.Types.ObjectId;
  location: IEventLocation;
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, maxlength: 1000 },
  date: { type: Date, required: true },
  time: { type: String },
  category: { type: String, enum: ['playdate', 'training', 'adoption', 'meetup', 'general'], default: 'general' },
  maxAttendees: { type: Number, default: 20 },
  attendees: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  tags: [{ type: String }],
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: {
    name: { type: String },
    address: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    }
  },
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: false
});

// Geospatial index
eventSchema.index({ 'location.coordinates': '2dsphere' });

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
