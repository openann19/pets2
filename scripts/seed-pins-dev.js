/**
 * Dev-only script that emits fake PulsePin updates every 5 seconds so the MapPage
 * instantly feels alive during local development.
 *
 * USAGE (from project root):
 *   node scripts/seed-pins-dev.js
 */

const { io } = require('socket.io-client');
const { v4: uuid } = require('uuid');

// Connect to our local server
const socket = io('http://localhost:5678/pulse');

// Helper to randomise activity
const activities = [
  'walking',
  'playing',
  'grooming',
  'vet',
  'park',
  'other'
];

function randomPin() {
  const lng = -74.0 + Math.random() * 0.1; // NYC-ish box for demo
  const lat = 40.7 + Math.random() * 0.1;
  return {
    _id: uuid(),
    petId: uuid(),
    ownerId: uuid(),
    coordinates: [lng, lat],
    activity: activities[Math.floor(Math.random() * activities.length)],
    message: 'Just having fun!',
    createdAt: new Date().toISOString()
  };
}

socket.on('connect', () => {
  console.log('Seeder connected to /pulse');

  setInterval(() => {
    const pin = randomPin();
    // Broadcast to a static grid room for demo (e.g., grid:40_74)
    socket.emit('pin:update', pin);
    console.log('Emitted pin', pin);
  }, 5000);
});
