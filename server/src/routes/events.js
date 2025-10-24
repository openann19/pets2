const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Event = require('../models/Event');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get nearby events
// @route   POST /api/events/nearby
// @access  Private
router.post('/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required as numbers'
      });
    }

    const meters = Math.max(0, Number(radius) || 10) * 1000;

    const results = await Event.find({
      date: { $gte: new Date() },
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: meters
        }
      }
    })
      .limit(50)
      .lean();

    const events = results.map(ev => ({
      id: ev._id,
      title: ev.title,
      description: ev.description,
      date: ev.date,
      time: ev.time,
      category: ev.category,
      attendees: ev.attendees,
      maxAttendees: ev.maxAttendees,
      price: ev.price,
      tags: ev.tags,
      location: {
        name: ev.location?.name,
        address: ev.location?.address,
        coordinates: { lat: ev.location?.coordinates?.coordinates?.[1], lng: ev.location?.coordinates?.coordinates?.[0] }
      },
      distance: calculateDistance(latitude, longitude, ev.location?.coordinates?.coordinates?.[1], ev.location?.coordinates?.coordinates?.[0])
    }));

    res.json({ success: true, data: { events } });
  } catch (error) {
    logger.error('Nearby events error:', { error });
    res.status(500).json({ success: false, message: 'Failed to fetch nearby events', error: error.message });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      maxAttendees,
      price,
      tags
    } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, date, and location are required' });
    }

    // Normalize location to GeoJSON [lng, lat]
    const lng = location?.coordinates?.lng ?? location?.coordinates?.longitude ?? location?.lng ?? location?.longitude;
    const lat = location?.coordinates?.lat ?? location?.coordinates?.latitude ?? location?.lat ?? location?.latitude;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ success: false, message: 'Location coordinates (lat, lng) are required as numbers' });
    }

    const eventDoc = await Event.create({
      title,
      description,
      date: new Date(date),
      time: time || '12:00 PM',
      category: category || 'general',
      maxAttendees: maxAttendees || 20,
      price: price || 0,
      tags: tags || [],
      organizer: req.userId,
      location: {
        name: location?.name,
        address: location?.address,
        coordinates: { type: 'Point', coordinates: [lng, lat] }
      }
    });

    res.json({ success: true, data: { event: eventDoc } });
  } catch (error) {
    logger.error('Create event error:', { error });
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = router;
