/**
 * Example: Routes with Redis Caching
 * This file demonstrates how to apply caching middleware to routes
 */

import express, { Router } from 'express';
import { cacheConfigs } from '../middleware/cacheMiddleware';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Example: Pet list route with caching
router.get('/pets', 
  authenticateToken,
  cacheConfigs.petList, // Apply pet list cache (3 min TTL, includes query params)
  async (req, res) => {
    // Your route handler here
    res.json({ pets: [] });
  }
);

// Example: Pet details with longer cache
router.get('/pets/:id',
  authenticateToken,
  cacheConfigs.petDetails, // 10 min TTL
  async (req, res) => {
    // Your route handler here
    res.json({ pet: {} });
  }
);

// Example: User profile with role-based caching
router.get('/profile',
  authenticateToken,
  cacheConfigs.userProfile, // Varies by user role
  async (req, res) => {
    // Your route handler here
    res.json({ user: {} });
  }
);

// Example: Analytics with realtime skip
router.get('/analytics',
  authenticateToken,
  cacheConfigs.analytics, // Skips cache if ?realtime=true
  async (req, res) => {
    // Your route handler here
    res.json({ analytics: {} });
  }
);

export default router;

