import mongoose, { Schema, Document } from 'mongoose';
import { IEvent } from '../types';

const eventSchema = new Schema<IEvent>({
  title: { 
    type: String, 
    required: true, 
    maxlength: 120,
    trim: true,
  },
  description: { 
    type: String, 
    maxlength: 1000,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  organizer: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  startDate: { 
    type: Date, 
    required: true,
    index: true,
  },
  endDate: { 
    type: Date, 
    required: true,
  },
  maxParticipants: { 
    type: Number, 
    default: 20,
    min: 1,
    max: 1000,
  },
  isPublic: { 
    type: Boolean, 
    default: true,
    index: true,
  },
  tags: [{ 
    type: String,
    maxlength: 50,
    trim: true,
  }],
  category: {
    type: String,
    enum: ['playdate', 'training', 'adoption', 'meetup', 'general'],
    default: 'general',
    index: true,
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  },
  requirements: {
    ageRestriction: {
      min: Number,
      max: Number,
    },
    speciesRestriction: [String],
    vaccinationRequired: { type: Boolean, default: false },
    spayNeuterRequired: { type: Boolean, default: false },
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
    index: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Geospatial index
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ organizer: 1, createdAt: -1 });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ tags: 1 });

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for is full
eventSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.maxParticipants;
});

// Virtual for is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date();
});

// Virtual for is ongoing
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual for is past
eventSchema.virtual('isPast').get(function() {
  return this.endDate < new Date();
});

// Virtual for duration in hours
eventSchema.virtual('durationHours').get(function() {
  const diffMs = this.endDate.getTime() - this.startDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60) * 100) / 100;
});

// Pre-save middleware to validate dates
eventSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  if (this.startDate < new Date()) {
    return next(new Error('Start date cannot be in the past'));
  }
  
  next();
});

// Instance method to add participant
eventSchema.methods.addParticipant = function(userId: string) {
  if (this.participants.includes(userId)) {
    throw new Error('User is already a participant');
  }
  
  if (this.isFull) {
    throw new Error('Event is full');
  }
  
  this.participants.push(userId);
  return this.save();
};

// Instance method to remove participant
eventSchema.methods.removeParticipant = function(userId: string) {
  this.participants = this.participants.filter(id => id.toString() !== userId);
  return this.save();
};

// Instance method to check if user is participant
eventSchema.methods.isParticipant = function(userId: string) {
  return this.participants.some(id => id.toString() === userId);
};

// Instance method to publish event
eventSchema.methods.publish = function() {
  this.status = 'published';
  return this.save();
};

// Instance method to cancel event
eventSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Instance method to complete event
eventSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to find events by location
eventSchema.statics.findByLocation = function(coordinates: [number, number], maxDistance: number = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance * 1000, // Convert km to meters
      },
    },
    status: 'published',
    isPublic: true,
    startDate: { $gt: new Date() },
  });
};

// Static method to find upcoming events
eventSchema.statics.findUpcoming = function(limit: number = 50) {
  return this.find({
    status: 'published',
    isPublic: true,
    startDate: { $gt: new Date() },
  })
    .populate('organizer', 'firstName lastName avatar')
    .sort({ startDate: 1 })
    .limit(limit);
};

// Static method to find events by organizer
eventSchema.statics.findByOrganizer = function(organizerId: string) {
  return this.find({ organizer: organizerId })
    .populate('participants', 'firstName lastName avatar')
    .sort({ createdAt: -1 });
};

// Static method to find events by category
eventSchema.statics.findByCategory = function(category: string, limit: number = 50) {
  return this.find({
    category,
    status: 'published',
    isPublic: true,
    startDate: { $gt: new Date() },
  })
    .populate('organizer', 'firstName lastName avatar')
    .sort({ startDate: 1 })
    .limit(limit);
};

// Static method to search events
eventSchema.statics.searchEvents = function(query: string, limit: number = 50) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ],
    status: 'published',
    isPublic: true,
    startDate: { $gt: new Date() },
  })
    .populate('organizer', 'firstName lastName avatar')
    .sort({ startDate: 1 })
    .limit(limit);
};

// Static method to get event statistics
eventSchema.statics.getEventStats = function(organizerId?: string) {
  const matchStage: any = {};
  if (organizerId) {
    matchStage.organizer = organizerId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        publishedEvents: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        cancelledEvents: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        completedEvents: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalParticipants: {
          $sum: { $size: '$participants' }
        },
        avgParticipants: {
          $avg: { $size: '$participants' }
        },
      },
    },
  ]);
};

export default mongoose.model<IEvent>('Event', eventSchema);
