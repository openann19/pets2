export {};// Added to mark file as a module
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, maxlength: 1000 },
  date: { type: Date, required: true },
  time: { type: String },
  category: { type: String, enum: ['playdate', 'training', 'adoption', 'meetup', 'general'], default: 'general' },
  maxAttendees: { type: Number, default: 20 },
  attendees: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  tags: [{ type: String }],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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

module.exports = mongoose.model('Event', eventSchema);
