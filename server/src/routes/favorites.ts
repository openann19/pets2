/**
 * Favorites Routes
 * 
 * Routes for managing user's favorite pets
 */

import express, { Router } from 'express';
import * as favoritesController from '../controllers/favoritesController';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// Public endpoint: get pet's favorite count
router.get('/count/:petId', favoritesController.getPetFavoriteCount);

// All other routes require authentication
router.use(authenticateToken);

// Add pet to favorites
router.post('/', favoritesController.addFavorite);

// Get user's favorites
router.get('/', favoritesController.getFavorites);

// Check if pet is favorited
router.get('/check/:petId', favoritesController.checkFavorite);

// Get pet's favorite count (duplicate path kept for safety if ordering changes)
// Already defined above as public

// Remove pet from favorites
router.delete('/:petId', favoritesController.removeFavorite);

export default router;

