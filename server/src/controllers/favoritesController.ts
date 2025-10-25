export {};// Added to mark file as a module
/**
 * Favorites Controller
 * 
 * Handles favoriting/unfavoriting pets and retrieving favorites list
 */

const Favorite = require('../models/Favorite');
const Pet = require('../models/Pet');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Add pet to favorites
 * POST /api/favorites
 */
exports.addFavorite = async (req, res) => {
    try {
        const { petId } = req.body;
        const userId = req.user._id;

        if (!petId) {
            return res.status(400).json({
                success: false,
                message: 'petId is required',
            });
        }

        // Validate petId format
        if (!mongoose.Types.ObjectId.isValid(petId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid petId',
            });
        }

        // Ensure pet exists
        const petExists = await Pet.exists({ _id: petId });
        if (!petExists) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found',
            });
        }

        // Check if already favorited
        const existing = await Favorite.findOne({ userId, petId });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Pet already favorited',
            });
        }

        // Create favorite
        const favorite = new Favorite({
            userId,
            petId,
        });

        await favorite.save();

        // Populate pet data for response
        await favorite.populate('petId', 'name breed age photos location');

        logger.info('Pet added to favorites', {
            userId,
            petId,
        });

        res.status(201).json({
            success: true,
            favorite,
            message: 'Pet added to favorites',
        });
    } catch (error) {
        logger.error('Error adding favorite', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to add favorite',
        });
    }
};

/**
 * Remove pet from favorites
 * DELETE /api/favorites/:petId
 */
exports.removeFavorite = async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(petId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid petId',
            });
        }

        const favorite = await Favorite.findOne({ userId, petId });
        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'not found in favorites',
            });
        }

        await Favorite.deleteOne({ _id: favorite._id, userId });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'not found in favorites',
            });
        }

        logger.info('Pet removed from favorites', {
            userId,
            petId,
        });

        res.json({
            success: true,
            message: 'Pet removed from favorites',
        });
    } catch (error) {
        logger.error('Error removing favorite', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to remove favorite',
        });
    }
};

/**
 * Get user's favorites
 * GET /api/favorites
 */
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        // Support page & limit, validate inputs
        const pageRaw = req.query.page;
        const limitRaw = req.query.limit;
        const hasPage = typeof pageRaw !== 'undefined';
        const hasLimit = typeof limitRaw !== 'undefined';

        if ((hasPage && isNaN(parseInt(pageRaw, 10))) || (hasLimit && isNaN(parseInt(limitRaw, 10)))) {
            return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
        }

        const page = hasPage ? Math.max(1, parseInt(pageRaw, 10)) : 1;
        const limit = hasLimit ? Math.max(1, parseInt(limitRaw, 10)) : 50;

        const result = await Favorite.getUserFavorites(userId, page, limit);

        res.json({
            success: true,
            favorites: result.favorites,
            totalFavorites: result.totalFavorites,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            hasNextPage: result.hasNextPage,
        });
    } catch (error) {
        logger.error('Error fetching favorites', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favorites',
        });
    }
};

/**
 * Check if pet is favorited
 * GET /api/favorites/check/:petId
 */
exports.checkFavorite = async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(petId)) {
            return res.status(400).json({ success: false, message: 'Invalid petId' });
        }

        const isFavorited = await Favorite.isFavorited(userId, petId);

        res.json({
            success: true,
            isFavorited,
        });
    } catch (error) {
        logger.error('Error checking favorite', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to check favorite status',
        });
    }
};

/**
 * Get pet's favorite count
 * GET /api/favorites/count/:petId
 */
exports.getPetFavoriteCount = async (req, res) => {
    try {
        const { petId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(petId)) {
            return res.status(400).json({ success: false, message: 'Invalid petId' });
        }

        const count = await Favorite.getPetFavoriteCount(petId);

        res.json({
            success: true,
            count,
        });
    } catch (error) {
        logger.error('Error getting favorite count', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get favorite count',
        });
    }
};
