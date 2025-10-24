/**
 * Favorites Routes
 * 
 * Routes for managing user's favorite pets
 */

const express = require('express');
const router = express.Router();
const favoritesController = require('../src/controllers/favoritesController');
const { authenticateToken } = require('../src/middleware/auth');

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

module.exports = router;
