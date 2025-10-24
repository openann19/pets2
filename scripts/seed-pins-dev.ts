/**
 * Dev-only script that emits fake PulsePin updates every 5 seconds so the MapPage
 * instantly feels alive during local development.
 *
 * USAGE (from project root):
 *   ts-node scripts/seed-pins-dev.ts
 */

import { io } from 'socket.io-client';
import { PulsePin } from '../packages/core/src/types/realtime';
import { v4 as uuid } from 'uuid';

const socket = io('http://localhost:5678/pulse');

// Helper to randomise activity
const activities: PulsePin['activity'][] = [
  'walking',
  'playing',
  'grooming',
  'vet',
  'park',
  'other'
];

function randomPin(): PulsePin {
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
